import { db } from './index.ts';
import { users, transactions, matches } from './schema.ts';
import { eq, desc } from 'drizzle-orm';

export async function getOrCreateUser(uid: string, email: string, fullname?: string, phone?: string) {
  try {
    const existing = await db.select().from(users).where(eq(users.uid, uid)).limit(1);
    if (existing.length > 0) {
      return existing[0];
    }

    const inserted = await db.insert(users)
      .values({
        uid,
        email,
        fullname: fullname || email.split('@')[0],
        phone: phone || '',
        balance: 0,
        vipLevel: 'برنز',
        totalWins: 0,
        totalGames: 0,
        totalEarned: 0,
        role: email.toLowerCase().includes('admin') ? 'ADMIN' : 'PLAYER',
        isBanned: 0
      })
      .returning();

    return inserted[0];
  } catch (error) {
    console.error('Database query failed in getOrCreateUser:', error);
    throw new Error('Database query failed in getOrCreateUser', { cause: error });
  }
}

export async function getUserByUid(uid: string) {
  try {
    const res = await db.select().from(users).where(eq(users.uid, uid)).limit(1);
    return res[0] || null;
  } catch (error) {
    console.error('Database query failed in getUserByUid:', error);
    throw new Error('Database query failed in getUserByUid', { cause: error });
  }
}

export async function getAllUsers() {
  try {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  } catch (error) {
    console.error('Database query failed in getAllUsers:', error);
    throw new Error('Database query failed in getAllUsers', { cause: error });
  }
}

export async function updateUserBalance(uid: string, balanceDelta: number) {
  try {
    const user = await getUserByUid(uid);
    if (!user) throw new Error('User not found');
    const newBalance = Math.max(0, user.balance + balanceDelta);
    const updated = await db.update(users)
      .set({ balance: newBalance })
      .where(eq(users.uid, uid))
      .returning();
    return updated[0];
  } catch (error) {
    console.error('Database query failed in updateUserBalance:', error);
    throw new Error('Database query failed in updateUserBalance', { cause: error });
  }
}

export async function addTransaction(userId: number, type: string, amount: number, description: string) {
  try {
    const inserted = await db.insert(transactions)
      .values({
        userId,
        type,
        amount,
        description
      })
      .returning();
    return inserted[0];
  } catch (error) {
    console.error('Database query failed in addTransaction:', error);
    throw new Error('Database query failed in addTransaction', { cause: error });
  }
}

export async function getUserTransactions(userId: number) {
  try {
    return await db.select().from(transactions).where(eq(transactions.userId, userId)).orderBy(desc(transactions.createdAt)).limit(30);
  } catch (error) {
    console.error('Database query failed in getUserTransactions:', error);
    throw new Error('Database query failed in getUserTransactions', { cause: error });
  }
}

export async function toggleUserBan(id: number) {
  try {
    const user = await db.select().from(users).where(eq(users.id, id)).limit(1);
    if (!user.length) throw new Error('User not found');
    const newStatus = user[0].isBanned === 1 ? 0 : 1;
    const res = await db.update(users).set({ isBanned: newStatus }).where(eq(users.id, id)).returning();
    return res[0];
  } catch (error) {
    console.error('Database query failed in toggleUserBan:', error);
    throw new Error('Database query failed in toggleUserBan', { cause: error });
  }
}

export async function toggleUserRole(id: number, role: 'PLAYER' | 'ADMIN') {
  try {
    const res = await db.update(users).set({ role }).where(eq(users.id, id)).returning();
    return res[0];
  } catch (error) {
    console.error('Database query failed in toggleUserRole:', error);
    throw new Error('Database query failed in toggleUserRole', { cause: error });
  }
}

export async function recordMatchResult(data: {
  roomId: string;
  roomName: string;
  drawnNumbers: number[];
  winnerUid?: string;
  winnerName?: string;
  prizeType?: string;
  chipsAwarded: number;
}) {
  try {
    const res = await db.insert(matches)
      .values({
        roomId: data.roomId,
        roomName: data.roomName,
        drawnNumbers: JSON.stringify(data.drawnNumbers),
        winnerUid: data.winnerUid || null,
        winnerName: data.winnerName || 'برنده‌ای ثبت نشد',
        prizeType: data.prizeType || 'fullHouse',
        chipsAwarded: data.chipsAwarded
      })
      .returning();
    return res[0];
  } catch (error) {
    console.error('Database query failed in recordMatchResult:', error);
    return null;
  }
}
