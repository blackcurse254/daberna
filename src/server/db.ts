import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { hashPassword } from './security';
import { UserInfo, Transaction, AuditLog } from '../types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../../data');
const DB_FILE = path.resolve(DATA_DIR, 'database.json');

export interface UserDbRecord {
  id: number;
  username: string;
  passwordHash: string;
  salt: string;
  fullname: string;
  phone: string;
  email: string;
  joinedDate: string;
  vipLevel: 'برنز' | 'نقره' | 'طلا' | 'VIP الماس' | 'SUPER ADMIN';
  totalGames: number;
  totalWins: number;
  totalScore: number;
  chips: number; // Virtual free demo chips
  status: 'فعال' | 'مسدود';
  role: 'PLAYER' | 'ADMIN' | 'SUPER_ADMIN';
  lastDailyClaim?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SystemErrorLogRecord {
  id: number;
  level: string;
  message: string;
  stack?: string;
  endpoint?: string;
  ipAddress?: string;
  timestamp: string;
}

export interface GameMatchRecord {
  id: number;
  roomId: string;
  roomName: string;
  drawnNumbers: number[];
  winnerUsername?: string;
  prizeType?: string;
  chipsAwarded: number;
  timestamp: string;
}

export interface SystemConfigRecord {
  maintenanceMode: boolean;
  dailyBonusAmount: number;
  freeStarterChips: number;
  minEntryChips: number;
  chatEnabled: boolean;
}

interface DatabaseStructure {
  users: UserDbRecord[];
  transactions: Transaction[];
  auditLogs: AuditLog[];
  errorLogs: SystemErrorLogRecord[];
  matches: GameMatchRecord[];
  config: SystemConfigRecord;
}

class DatabaseService {
  private db: DatabaseStructure = {
    users: [],
    transactions: [],
    auditLogs: [],
    errorLogs: [],
    matches: [],
    config: {
      maintenanceMode: false,
      dailyBonusAmount: 0,
      freeStarterChips: 0,
      minEntryChips: 20000,
      chatEnabled: true
    }
  };

  constructor() {
    this.init();
  }

  private init() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        this.db = {
          ...this.db,
          ...parsed
        };
      } else {
        this.seedInitialData();
        this.persist();
      }
    } catch (err) {
      console.warn('Notice: Using in-memory fallback database:', err);
      this.seedInitialData();
    }
  }

  private persist() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(this.db, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to persist database to disk:', err);
    }
  }

  private seedInitialData() {
    const seedUsers = [
      {
        id: 999,
        username: 'admin',
        password: 'AdminSecurePassword@90',
        fullname: 'مدیر کل سیستم',
        phone: '09000000000',
        email: 'admin@daberna.vip',
        joinedDate: '۱۴۰۲/۰۱/۰۱',
        vipLevel: 'SUPER ADMIN' as const,
        totalGames: 0,
        totalWins: 0,
        totalScore: 0,
        chips: 0,
        status: 'فعال' as const,
        role: 'SUPER_ADMIN' as const
      }
    ];

    this.db.users = seedUsers.map(s => {
      const { salt, hash } = hashPassword(s.password);
      return {
        id: s.id,
        username: s.username,
        passwordHash: hash,
        salt,
        fullname: s.fullname,
        phone: s.phone,
        email: s.email,
        joinedDate: s.joinedDate,
        vipLevel: s.vipLevel,
        totalGames: s.totalGames,
        totalWins: s.totalWins,
        totalScore: s.totalScore,
        chips: s.chips,
        status: s.status,
        role: s.role,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    });

    this.db.transactions = [];

    this.db.auditLogs = [
      {
        id: 1,
        action: 'SYSTEM_STARTUP',
        performedBy: 'SYSTEM',
        details: 'پلتفرم دبرنا لند VIP با ذخیره‌سازی پایدار راه‌اندازی شد.',
        timestamp: new Date().toISOString()
      }
    ];
  }

  // User Operations
  getUserByUsername(username: string): UserDbRecord | undefined {
    return this.db.users.find(u => u.username.toLowerCase() === username.toLowerCase());
  }

  getUserById(id: number): UserDbRecord | undefined {
    return this.db.users.find(u => u.id === id);
  }

  getAllUsers(): UserDbRecord[] {
    return this.db.users;
  }

  createUser(record: Omit<UserDbRecord, 'id' | 'createdAt' | 'updatedAt'>): UserDbRecord {
    const newRecord: UserDbRecord = {
      ...record,
      id: Date.now() + Math.floor(Math.random() * 1000),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.db.users.push(newRecord);
    this.persist();
    return newRecord;
  }

  updateUser(id: number, updates: Partial<UserDbRecord>): UserDbRecord | undefined {
    const idx = this.db.users.findIndex(u => u.id === id);
    if (idx === -1) return undefined;

    this.db.users[idx] = {
      ...this.db.users[idx],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.persist();
    return this.db.users[idx];
  }

  // Transactions / Virtual Score Ledger
  addTransaction(tx: Omit<Transaction, 'id' | 'date'> & { date?: string }): Transaction {
    const fullTx: Transaction = {
      ...tx,
      id: Date.now() + Math.floor(Math.random() * 1000),
      date: tx.date || 'هم‌اکنون'
    };
    this.db.transactions.unshift(fullTx);
    if (this.db.transactions.length > 500) this.db.transactions.pop();
    this.persist();
    return fullTx;
  }

  getUserTransactions(username: string): Transaction[] {
    return this.db.transactions.filter(t => t.username === username);
  }

  // Audit Logs
  recordAudit(action: string, performedBy: string, target?: string, details?: string) {
    const log: AuditLog = {
      id: Date.now() + Math.floor(Math.random() * 1000),
      action,
      performedBy,
      target,
      details,
      timestamp: new Date().toISOString()
    };
    this.db.auditLogs.unshift(log);
    if (this.db.auditLogs.length > 500) this.db.auditLogs.pop();
    this.persist();
    return log;
  }

  getAuditLogs(limit = 50): AuditLog[] {
    return this.db.auditLogs.slice(0, limit);
  }

  // Error Logs
  recordError(level: string, message: string, stack?: string, endpoint?: string, ipAddress?: string) {
    const err: SystemErrorLogRecord = {
      id: Date.now() + Math.floor(Math.random() * 1000),
      level,
      message,
      stack,
      endpoint,
      ipAddress,
      timestamp: new Date().toISOString()
    };
    this.db.errorLogs.unshift(err);
    if (this.db.errorLogs.length > 200) this.db.errorLogs.pop();
    this.persist();
    return err;
  }

  getErrorLogs(limit = 50): SystemErrorLogRecord[] {
    return this.db.errorLogs.slice(0, limit);
  }

  // Matches
  recordMatch(record: Omit<GameMatchRecord, 'id' | 'timestamp'>): GameMatchRecord {
    const match: GameMatchRecord = {
      ...record,
      id: Date.now() + Math.floor(Math.random() * 1000),
      timestamp: new Date().toISOString()
    };
    this.db.matches.unshift(match);
    if (this.db.matches.length > 100) this.db.matches.pop();
    this.persist();
    return match;
  }

  getRecentMatches(limit = 20): GameMatchRecord[] {
    return this.db.matches.slice(0, limit);
  }

  // System Configuration
  getConfig(): SystemConfigRecord {
    return this.db.config;
  }

  updateConfig(updates: Partial<SystemConfigRecord>): SystemConfigRecord {
    this.db.config = {
      ...this.db.config,
      ...updates
    };
    this.persist();
    return this.db.config;
  }
}

export const db = new DatabaseService();

export function sanitizeUser(u: UserDbRecord): UserInfo {
  return {
    id: u.id,
    username: u.username,
    fullname: u.fullname,
    phone: u.phone,
    email: u.email,
    joinedDate: u.joinedDate,
    vipLevel: u.vipLevel,
    totalGames: u.totalGames,
    totalWins: u.totalWins,
    totalEarned: u.totalScore,
    balance: u.chips,
    status: u.status,
    isAdmin: u.role === 'ADMIN' || u.role === 'SUPER_ADMIN'
  };
}
