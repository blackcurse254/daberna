import { UserInfo, Transaction, AuthResponse, DailyRewardInfo, PlatformSettings, SystemErrorLog, AuditLog } from '../types';

class ApiService {
  private token: string | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('daberna_token');
    }
  }

  public setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('daberna_token', token);
    } else {
      localStorage.removeItem('daberna_token');
    }
  }

  public getToken(): string | null {
    return this.token;
  }

  private getHeaders(): HeadersInit {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    return headers;
  }

  // 1. Auth & Profile
  async loginWithGoogle(idToken: string): Promise<AuthResponse> {
    const res = await fetch('/api/auth/google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'خطا در ورود با گوگل');
    }
    const data: AuthResponse = await res.json();
    this.setToken(data.token);
    return data;
  }

  async login(username: string, password?: string): Promise<AuthResponse> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'خطا در ورود به حساب کاربری');
    }
    const data: AuthResponse = await res.json();
    this.setToken(data.token);
    return data;
  }

  async register(username: string, fullname: string, phone: string, password?: string): Promise<AuthResponse> {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, fullname, phone, password })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'خطا در ثبت‌نام');
    }
    const data: AuthResponse = await res.json();
    this.setToken(data.token);
    return data;
  }

  async getMe(): Promise<{ user: UserInfo }> {
    const res = await fetch('/api/auth/me', {
      headers: this.getHeaders()
    });
    if (!res.ok) {
      this.setToken(null);
      throw new Error('نشست کاربری منقضی شده است');
    }
    return res.json();
  }

  async updateProfile(data: { fullname: string; phone: string; email: string }): Promise<{ success: boolean; user: UserInfo }> {
    const res = await fetch('/api/user/profile', {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'خطا در به‌روزرسانی پروفایل');
    }
    return res.json();
  }

  async getTransactions(): Promise<{ transactions: Transaction[] }> {
    const res = await fetch('/api/user/transactions', {
      headers: this.getHeaders()
    });
    if (!res.ok) return { transactions: [] };
    return res.json();
  }

  // 2. Free Gameplay & Daily Rewards
  async deductRoomEntry(amount: number, roomName: string): Promise<{ success: boolean; balance: number }> {
    const res = await fetch('/api/game/deduct-entry', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ amount, roomName })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'خطا در کسر سکه ورودی اتاق');
    }
    return res.json();
  }

  async getDailyRewardStatus(): Promise<DailyRewardInfo> {
    const res = await fetch('/api/rewards/daily-status', {
      headers: this.getHeaders()
    });
    if (!res.ok) {
      return { canClaim: false, rewardAmount: 50000, streakDays: 1, hoursUntilNextClaim: 24 };
    }
    return res.json();
  }

  async claimDailyReward(): Promise<{ success: boolean; balance: number; rewardAmount: number; message: string }> {
    const res = await fetch('/api/rewards/claim-daily', {
      method: 'POST',
      headers: this.getHeaders()
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'خطا در دریافت پاداش روزانه');
    }
    return res.json();
  }

  async refillFaucet(): Promise<{ success: boolean; balance: number; refillAmount: number; message: string }> {
    const res = await fetch('/api/rewards/refill-faucet', {
      method: 'POST',
      headers: this.getHeaders()
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'خطا در شارژ اضطراری سکه رایگان');
    }
    return res.json();
  }

  // 3. Leaderboard
  async getLeaderboard(): Promise<{ leaderboard: Array<{ rank: number; name: string; wins: number; totalWon: number; badge: string }> }> {
    const res = await fetch('/api/leaderboard');
    if (!res.ok) return { leaderboard: [] };
    return res.json();
  }

  // 4. Admin Management (RBAC Protected)
  async getAdminOverview(): Promise<{
    totalUsers: number;
    totalGames: number;
    totalScoreDistributed: number;
    users: UserInfo[];
    rooms: Array<{ id: string; name: string; tag: string; entry: number; badge: string }>;
    settings: PlatformSettings;
    auditLogs: AuditLog[];
    errorLogs: SystemErrorLog[];
  }> {
    const res = await fetch('/api/admin/overview', {
      headers: this.getHeaders()
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'دسترسی به پنل مدیریت امکان‌پذیر نیست.');
    }
    return res.json();
  }

  async toggleUserBan(userId: number | string): Promise<void> {
    const res = await fetch(`/api/admin/users/${userId}/toggle-ban`, {
      method: 'POST',
      headers: this.getHeaders()
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'خطا در تغییر وضعیت حساب کاربر');
    }
  }

  async toggleUserRole(userId: number | string, role: 'PLAYER' | 'ADMIN'): Promise<void> {
    const res = await fetch(`/api/admin/users/${userId}/role`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ role })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'خطا در تغییر سطح دسترسی کاربر');
    }
  }

  async grantFreeChips(userId: number | string, amount: number): Promise<void> {
    const res = await fetch(`/api/admin/users/${userId}/grant-chips`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ amount })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'خطا در اهدای سکه به کاربر');
    }
  }

  async updateRoomEntry(roomId: string, entry: number): Promise<void> {
    const res = await fetch(`/api/admin/rooms/${roomId}/entry`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ entry })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'خطا در تغییر ورودی اتاق');
    }
  }

  async updatePlatformSettings(settings: Partial<PlatformSettings>): Promise<void> {
    const res = await fetch('/api/admin/settings', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(settings)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'خطا در ذخیره تنظیمات پلتفرم');
    }
  }
}

export const api = new ApiService();
