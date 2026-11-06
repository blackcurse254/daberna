import express, { Request, Response, NextFunction } from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';
import { BingoGameManager } from './src/server/gameManager';
import { hashPassword, verifyPassword, generateToken, verifyToken, sanitizeInput } from './src/server/security';
import { authLimiter, generalLimiter } from './src/server/rateLimiter';
import { db, sanitizeUser, UserDbRecord } from './src/server/db';
import { adminAuth } from './src/lib/firebase-admin.ts';
import * as sqlUsers from './src/db/users.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Security HTTP Headers
app.use((_req: Request, res: Response, next: NextFunction) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  next();
});

// Limit body payload to 100kb to mitigate memory exhaustion
app.use(express.json({ limit: '100kb' }));
app.use('/api', generalLimiter.middleware());

// Initialize Server-authoritative Game Manager
const gameManager = new BingoGameManager(
  io,
  (username, prizeReward) => {
    const user = db.getUserByUsername(username);
    if (user) {
      const newChips = user.chips + prizeReward;
      const newWins = user.totalWins + 1;
      const newScore = user.totalScore + prizeReward;

      db.updateUser(user.id, {
        chips: newChips,
        totalWins: newWins,
        totalScore: newScore
      });

      db.addTransaction({
        username,
        type: 'برد جایزه دبرنا',
        amount: prizeReward,
        status: 'موفق'
      });

      io.emit('user_balance_updated', {
        username,
        balance: newChips,
        totalEarned: newScore,
        totalWins: newWins
      });
    }
  },
  (username) => {
    const user = db.getUserByUsername(username);
    return user?.status === 'مسدود';
  }
);

// Register socket connections
io.on('connection', (socket) => {
  gameManager.registerSocketEvents(socket);
});

// Authentication Middleware
interface AuthenticatedRequest extends Request {
  userPayload?: {
    username: string;
    userId: number;
    isAdmin: boolean;
  };
}

function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    res.status(401).json({ error: 'احراز هویت الزامی است. لطفاً وارد حساب خود شوید.' });
    return;
  }

  const payload = verifyToken(token);
  if (!payload) {
    res.status(401).json({ error: 'نشست کاربری شما منقضی شده است. لطفاً مجدداً وارد شوید.' });
    return;
  }

  const user = db.getUserByUsername(payload.username);
  if (!user) {
    res.status(401).json({ error: 'کاربر مربوطه یافت نشد.' });
    return;
  }

  if (user.status === 'مسدود') {
    res.status(403).json({ error: 'حساب کاربری شما مسدود است. لطفاً با پشتیبانی تماس بگیرید.' });
    return;
  }

  req.userPayload = {
    username: user.username,
    userId: user.id,
    isAdmin: user.role === 'ADMIN' || user.role === 'SUPER_ADMIN'
  };

  next();
}

/**
 * Strict Admin Access Gate: Checks server database record directly
 */
function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.userPayload || !req.userPayload.isAdmin) {
    res.status(403).json({ error: 'دسترسی غیرمجاز: این بخش فقط مخصوص مدیران سیستم است.' });
    return;
  }

  const dbUser = db.getUserByUsername(req.userPayload.username);
  if (!dbUser || (dbUser.role !== 'ADMIN' && dbUser.role !== 'SUPER_ADMIN')) {
    res.status(403).json({ error: 'دسترسی غیرمجاز.' });
    return;
  }

  next();
}

// ----------------- REST API Endpoints -----------------

// 1. Auth Endpoints
app.post('/api/auth/google', (_req: Request, res: Response) => {
  res.status(403).json({ error: 'ورود با گوگل غیرفعال شده است. لطفاً با نام کاربری و رمز عبور وارد شوید.' });
});

app.post('/api/auth/login', authLimiter.middleware(10), (req: Request, res: Response) => {
  const { username, password } = req.body;
  if (!username || typeof username !== 'string' || !password || typeof password !== 'string') {
    res.status(400).json({ error: 'نام کاربری و رمز عبور الزامی است.' });
    return;
  }

  const cleanUsername = sanitizeInput(username);
  const user = db.getUserByUsername(cleanUsername);

  if (!user) {
    res.status(401).json({ error: 'نام کاربری یا رمز عبور اشتباه است.' });
    return;
  }

  // Strictly verify password using scrypt hash
  const isValid = verifyPassword(password, user.salt, user.passwordHash);
  if (!isValid) {
    res.status(401).json({ error: 'نام کاربری یا رمز عبور اشتباه است.' });
    return;
  }

  if (user.status === 'مسدود') {
    res.status(403).json({ error: 'حساب کاربری شما مسدود شده است. با پشتیبانی تماس بگیرید.' });
    return;
  }

  const isAdmin = user.role === 'ADMIN' || user.role === 'SUPER_ADMIN';
  const token = generateToken(user.username, isAdmin);
  res.json({ success: true, user: sanitizeUser(user), token });
});

app.post('/api/auth/register', authLimiter.middleware(8), (req: Request, res: Response) => {
  const { username, fullname, phone, password } = req.body;
  if (!username || typeof username !== 'string') {
    res.status(400).json({ error: 'نام کاربری الزامی است.' });
    return;
  }

  if (!password || typeof password !== 'string' || password.length < 6) {
    res.status(400).json({ error: 'رمز عبور باید حداقل ۶ کاراکتر باشد.' });
    return;
  }

  const cleanUsername = sanitizeInput(username);
  if (cleanUsername.length < 3 || cleanUsername.length > 30) {
    res.status(400).json({ error: 'طول نام کاربری باید بین ۳ تا ۳۰ کاراکتر باشد.' });
    return;
  }

  if (db.getUserByUsername(cleanUsername)) {
    res.status(400).json({ error: 'این نام کاربری قبلاً ثبت شده است.' });
    return;
  }

  const { salt, hash } = hashPassword(password);

  const newUser = db.createUser({
    username: cleanUsername,
    passwordHash: hash,
    salt,
    fullname: sanitizeInput(fullname || cleanUsername),
    phone: sanitizeInput(phone || ''),
    email: `${cleanUsername}@daberna.vip`,
    joinedDate: new Date().toLocaleDateString('fa-IR'),
    vipLevel: 'برنز',
    totalGames: 0,
    totalWins: 0,
    totalScore: 0,
    chips: 0, // Wallet balance is strictly 0
    status: 'فعال',
    role: 'PLAYER'
  });

  const token = generateToken(newUser.username, false);
  res.json({ success: true, user: sanitizeUser(newUser), token });
});

app.get('/api/auth/me', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const user = db.getUserByUsername(req.userPayload!.username);
  if (!user) {
    res.status(404).json({ error: 'کاربر یافت نشد.' });
    return;
  }
  res.json({ user: sanitizeUser(user) });
});

app.put('/api/user/profile', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const { fullname, phone, email } = req.body;
  const user = db.getUserByUsername(req.userPayload!.username);
  if (!user) {
    res.status(404).json({ error: 'کاربر یافت نشد.' });
    return;
  }

  const updated = db.updateUser(user.id, {
    fullname: fullname ? sanitizeInput(fullname) : user.fullname,
    phone: phone ? sanitizeInput(phone) : user.phone,
    email: email ? sanitizeInput(email) : user.email
  });

  res.json({ success: true, user: sanitizeUser(updated!) });
});

app.get('/api/user/transactions', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const username = req.userPayload!.username;
  const list = db.getUserTransactions(username);
  res.json({ transactions: list.slice(0, 30) });
});

// 2. Free-to-Play Game & Rewards
app.post('/api/game/deduct-entry', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const { amount, roomName } = req.body;
  const user = db.getUserByUsername(req.userPayload!.username);
  if (!user) {
    res.status(404).json({ error: 'کاربر یافت نشد.' });
    return;
  }

  const cost = parseInt(amount, 10);
  if (isNaN(cost) || cost <= 0) {
    res.status(400).json({ error: 'مبلغ ورودی نامعتبر است.' });
    return;
  }

  if (user.chips < cost) {
    res.status(400).json({ error: 'موجودی سکه رایگان کافی نیست. از بخش پاداش روزانه سکه هدیه دریافت کنید!' });
    return;
  }

  const updated = db.updateUser(user.id, {
    chips: user.chips - cost,
    totalGames: user.totalGames + 1
  });

  db.addTransaction({
    username: user.username,
    type: `ورودی بازی رایگان (${sanitizeInput(roomName || 'اتاق دبرنا')})`,
    amount: -cost,
    status: 'انجام شد'
  });

  res.json({ success: true, balance: updated!.chips });
});

// 3. Public Leaderboard (Privacy Sanitized)
app.get('/api/leaderboard', (_req: Request, res: Response) => {
  const all = db.getAllUsers()
    .filter(u => u.role === 'PLAYER')
    .sort((a, b) => b.totalScore - a.totalScore)
    .slice(0, 10)
    .map((u, idx) => ({
      rank: idx + 1,
      name: u.username,
      wins: u.totalWins,
      totalWon: u.totalScore,
      badge: idx === 0 ? '🥇 طلا' : idx === 1 ? '🥈 نقره' : idx === 2 ? '🥉 برنز' : `${idx + 1}`
    }));

  res.json({ leaderboard: all });
});

// 4. Admin Management APIs (Strictly Protected)
app.get('/api/admin/overview', authenticateToken, requireAdmin, (_req: AuthenticatedRequest, res: Response) => {
  const allUsers = db.getAllUsers().filter(u => u.role === 'PLAYER');
  const totalScoreDistributed = allUsers.reduce((acc, u) => acc + u.totalScore, 0);
  const totalMatches = allUsers.reduce((acc, u) => acc + u.totalGames, 0);

  const roomsList = Array.from(gameManager.rooms.values()).map(r => ({
    id: r.id,
    name: r.name,
    tag: r.tag,
    entry: r.entry,
    badge: r.id === 'bronze' ? 'استارتر' : r.id === 'silver' ? 'پرو' : 'های‌رولر VIP'
  }));

  res.json({
    totalUsers: allUsers.length,
    totalGames: totalMatches,
    totalScoreDistributed,
    users: allUsers.map(sanitizeUser),
    rooms: roomsList,
    settings: db.getConfig(),
    auditLogs: db.getAuditLogs(30),
    errorLogs: db.getErrorLogs(20)
  });
});

app.post('/api/admin/users/:id/toggle-ban', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const id = Number(req.params.id);
  const user = db.getUserById(id);
  if (!user) {
    res.status(404).json({ error: 'کاربر یافت نشد.' });
    return;
  }

  const nextStatus = user.status === 'فعال' ? 'مسدود' : 'فعال';
  const updated = db.updateUser(id, { status: nextStatus });
  db.recordAudit('TOGGLE_BAN', req.userPayload!.username, user.username, `وضعیت به ${nextStatus} تغییر یافت.`);
  res.json({ success: true, user: sanitizeUser(updated!) });
});

app.post('/api/admin/users/:id/role', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const id = Number(req.params.id);
  const { role } = req.body;
  if (!role || (role !== 'PLAYER' && role !== 'ADMIN')) {
    res.status(400).json({ error: 'نقش نامعتبر است.' });
    return;
  }

  const user = db.getUserById(id);
  if (!user) {
    res.status(404).json({ error: 'کاربر یافت نشد.' });
    return;
  }

  const updated = db.updateUser(id, { role });
  db.recordAudit('CHANGE_ROLE', req.userPayload!.username, user.username, `نقش کاربر به ${role} تغییر یافت.`);
  res.json({ success: true, user: sanitizeUser(updated!) });
});

app.post('/api/admin/users/:id/grant-chips', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const id = Number(req.params.id);
  const { amount } = req.body;
  const user = db.getUserById(id);
  if (!user) {
    res.status(404).json({ error: 'کاربر یافت نشد.' });
    return;
  }

  const chargeVal = parseInt(amount, 10) || 0;
  const updated = db.updateUser(id, {
    chips: user.chips + chargeVal
  });

  db.addTransaction({
    username: user.username,
    type: 'اهدای سکه رایگان توسط مدیر',
    amount: chargeVal,
    status: 'موفق'
  });

  db.recordAudit('GRANT_CHIPS', req.userPayload!.username, user.username, `تعداد سکه: ${chargeVal}`);

  io.emit('user_balance_updated', {
    username: user.username,
    balance: updated!.chips
  });

  res.json({ success: true, user: sanitizeUser(updated!) });
});

app.post('/api/admin/rooms/:id/entry', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { entry } = req.body;
  const entryVal = parseInt(entry, 10);
  if (!entryVal || isNaN(entryVal) || entryVal <= 0) {
    res.status(400).json({ error: 'مبلغ ورودی نامعتبر است.' });
    return;
  }

  gameManager.updateRoomEntry(id as any, entryVal);
  db.recordAudit('UPDATE_ROOM_ENTRY', req.userPayload!.username, id, `سکه ورودی جدید: ${entryVal}`);
  res.json({ success: true, roomId: id, newEntry: entryVal });
});

app.post('/api/admin/settings', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const { maintenanceMode, dailyBonusAmount, freeStarterChips, chatEnabled } = req.body;
  const current = db.getConfig();

  const updated = db.updateConfig({
    maintenanceMode: typeof maintenanceMode === 'boolean' ? maintenanceMode : current.maintenanceMode,
    dailyBonusAmount: Number(dailyBonusAmount) || current.dailyBonusAmount,
    freeStarterChips: Number(freeStarterChips) || current.freeStarterChips,
    chatEnabled: typeof chatEnabled === 'boolean' ? chatEnabled : current.chatEnabled
  });

  db.recordAudit('UPDATE_SETTINGS', req.userPayload!.username, undefined, 'تنظیمات عمومی پلتفرم به‌روزرسانی شد.');
  res.json({ success: true, settings: updated });
});

// Centralized safe error handler: logs to database without exposing internal details
app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
  const errMsg = err?.message || 'Unknown Server Error';
  db.recordError('ERROR', errMsg, err?.stack, req.originalUrl, req.ip);
  console.error('Server error caught safely:', errMsg);
  res.status(500).json({ error: 'خطای داخلی سرور رخ داد. لطفاً کمی بعد دوباره تلاش کنید.' });
});

// Vite middleware or static serving
async function startServer() {
  const PORT = process.env.PORT || 3000;

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  httpServer.listen(PORT, () => {
    console.log(`Daberna Land VIP secure server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err?.message || err);
});
