export type VipLevel = 'برنز' | 'نقره' | 'طلا' | 'VIP الماس' | 'SUPER ADMIN';

export type UserStatus = 'فعال' | 'مسدود';

export interface UserInfo {
  id?: number | string;
  username: string;
  fullname: string;
  phone: string;
  email: string;
  joinedDate: string;
  vipLevel: VipLevel;
  totalGames: number;
  totalWins: number;
  totalEarned: number;
  balance: number;
  status: UserStatus;
  isAdmin?: boolean;
}

export interface AuthResponse {
  success: boolean;
  user: UserInfo;
  token: string;
}

export type RoomId = 'bronze' | 'silver' | 'gold';

export interface RoomConfig {
  id: RoomId;
  name: string;
  tag: string;
  entry: number;
  players: number;
  status: string;
  bgGradient: string;
  border: string;
  badgeBg: string;
  badge: string;
}

export interface PrizeStatus {
  claimed: boolean;
  winnerName?: string;
  prize?: number;
}

export interface WinnerSummary {
  line1Winner?: string;
  line1Prize?: number;
  line2Winner?: string;
  line2Prize?: number;
  fullHouseWinner?: string;
  fullHousePrize?: number;
  totalPot: number;
  roundNumber: number;
  reason: string;
  drawnCount: number;
}

export interface OpponentInfo {
  username: string;
  cardsCount: number;
  cardSample: (number | null)[][];
}

export interface RoomState {
  id: RoomId;
  name: string;
  entry: number;
  playersCount: number;
  maxPlayers: number;
  currentPot: number;
  status: 'waiting' | 'in_progress' | 'finished';
  currentNumber: number | null;
  drawnNumbers: number[];
  prizesClaimed: {
    line1: PrizeStatus;
    line2: PrizeStatus;
    fullHouse: PrizeStatus;
  };
  gameSeed: string;
  gameHash: string;
  roundNumber: number;
  timeUntilNextDraw?: number;
  countdown?: number | null;
  winnerSummary?: WinnerSummary | null;
  opponents?: OpponentInfo[];
}

export interface ChatMessage {
  id: number | string;
  roomId?: string;
  sender: string;
  text: string;
  time: string;
  isSystem?: boolean;
  isReaction?: boolean;
}

export interface Transaction {
  id: number | string;
  username?: string;
  type: string;
  amount: number;
  date: string;
  status: string;
}

export interface SystemErrorLog {
  id: number | string;
  level: string;
  message: string;
  stack?: string;
  endpoint?: string;
  ipAddress?: string;
  timestamp: string;
}

export interface PlatformSettings {
  maintenanceMode: boolean;
  dailyBonusAmount: number;
  freeStarterChips: number;
  minEntryChips: number;
  chatEnabled: boolean;
}

export interface DailyRewardInfo {
  canClaim: boolean;
  rewardAmount: number;
  streakDays: number;
  hoursUntilNextClaim: number;
}

export interface AuditLog {
  id: number | string;
  action: string;
  performedBy: string;
  target?: string;
  details?: string;
  timestamp: string;
}

export type CardSkin = 'gold' | 'wood' | 'classic';
export type MarkerSkin = 'bean' | 'coin' | 'emerald' | 'diamond';
export type SoundEffectType = 'number' | 'mark' | 'win' | 'cheer' | 'coins';
