import { relations } from 'drizzle-orm';
import { integer, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

// Users table with Firebase UID linkage
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  fullname: text('fullname'),
  phone: text('phone'),
  balance: integer('balance').default(350000).notNull(),
  vipLevel: text('vip_level').default('برنز').notNull(),
  totalWins: integer('total_wins').default(0).notNull(),
  totalGames: integer('total_games').default(0).notNull(),
  totalEarned: integer('total_earned').default(0).notNull(),
  role: text('role').default('PLAYER').notNull(), // 'PLAYER' | 'ADMIN'
  isBanned: integer('is_banned').default(0).notNull(), // 0: active, 1: banned
  createdAt: timestamp('created_at').defaultNow(),
});

// Transactions & wallet logs
export const transactions = pgTable('transactions', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id)
    .notNull(),
  type: text('type').notNull(), // 'reward', 'faucet', 'entry', 'win'
  amount: integer('amount').notNull(),
  description: text('description').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Match history
export const matches = pgTable('matches', {
  id: serial('id').primaryKey(),
  roomId: text('room_id').notNull(),
  roomName: text('room_name').notNull(),
  drawnNumbers: text('drawn_numbers').notNull(),
  winnerUid: text('winner_uid'),
  winnerName: text('winner_name'),
  prizeType: text('prize_type'),
  chipsAwarded: integer('chips_awarded').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Relationships
export const usersRelations = relations(users, ({ many }) => ({
  transactions: many(transactions),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  user: one(users, {
    fields: [transactions.userId],
    references: [users.id],
  }),
}));
