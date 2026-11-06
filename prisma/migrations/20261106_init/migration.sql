-- Daberna Land VIP - Production Migration (PostgreSQL)
-- Initial Schema Creation

CREATE TYPE "UserRole" AS ENUM ('PLAYER', 'ADMIN', 'SUPER_ADMIN');
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'BANNED');
CREATE TYPE "VipLevel" AS ENUM ('BRONZE', 'SILVER', 'GOLD', 'DIAMOND_VIP', 'SUPER_ADMIN');

-- Create User Table
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "username" VARCHAR(50) NOT NULL,
    "passwordHash" VARCHAR(255) NOT NULL,
    "salt" VARCHAR(64) NOT NULL,
    "fullname" VARCHAR(100) NOT NULL DEFAULT '',
    "phone" VARCHAR(20) NOT NULL DEFAULT '',
    "email" VARCHAR(100) NOT NULL DEFAULT '',
    "joinedDate" VARCHAR(50) NOT NULL DEFAULT '1402/10/01',
    "vipLevel" "VipLevel" NOT NULL DEFAULT 'BRONZE',
    "totalGames" INTEGER NOT NULL DEFAULT 0,
    "totalWins" INTEGER NOT NULL DEFAULT 0,
    "totalScore" BIGINT NOT NULL DEFAULT 0,
    "chips" BIGINT NOT NULL DEFAULT 350000,
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "role" "UserRole" NOT NULL DEFAULT 'PLAYER',
    "lastDailyClaim" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
CREATE INDEX "User_username_idx" ON "User"("username");
CREATE INDEX "User_totalScore_idx" ON "User"("totalScore");
CREATE INDEX "User_role_idx" ON "User"("role");

-- Create ScoreTransaction Table
CREATE TABLE "ScoreTransaction" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "username" VARCHAR(50) NOT NULL,
    "type" VARCHAR(100) NOT NULL,
    "amount" BIGINT NOT NULL,
    "status" VARCHAR(30) NOT NULL DEFAULT 'موفق',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ScoreTransaction_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ScoreTransaction_userId_idx" ON "ScoreTransaction"("userId");
CREATE INDEX "ScoreTransaction_username_idx" ON "ScoreTransaction"("username");
CREATE INDEX "ScoreTransaction_createdAt_idx" ON "ScoreTransaction"("createdAt");

-- Create GameRoom Table
CREATE TABLE "GameRoom" (
    "id" VARCHAR(30) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "tag" VARCHAR(100) NOT NULL,
    "entryChips" INTEGER NOT NULL DEFAULT 20000,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GameRoom_pkey" PRIMARY KEY ("id")
);

-- Create GameMatch Table
CREATE TABLE "GameMatch" (
    "id" SERIAL NOT NULL,
    "roomId" VARCHAR(30) NOT NULL,
    "roomName" VARCHAR(100) NOT NULL,
    "drawnNumbers" TEXT NOT NULL,
    "totalNumbers" INTEGER NOT NULL DEFAULT 0,
    "line1Winner" VARCHAR(50),
    "line2Winner" VARCHAR(50),
    "fullHouseWinner" VARCHAR(50),
    "potChips" BIGINT NOT NULL DEFAULT 0,
    "gameSeed" VARCHAR(100) NOT NULL,
    "gameHash" VARCHAR(100) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GameMatch_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "GameMatch_roomId_idx" ON "GameMatch"("roomId");
CREATE INDEX "GameMatch_createdAt_idx" ON "GameMatch"("createdAt");

-- Create ChatMessage Table
CREATE TABLE "ChatMessage" (
    "id" SERIAL NOT NULL,
    "roomId" VARCHAR(30) NOT NULL,
    "userId" INTEGER,
    "sender" VARCHAR(50) NOT NULL,
    "text" VARCHAR(500) NOT NULL,
    "isReaction" BOOLEAN NOT NULL DEFAULT false,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatMessage_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ChatMessage_roomId_idx" ON "ChatMessage"("roomId");
CREATE INDEX "ChatMessage_createdAt_idx" ON "ChatMessage"("createdAt");

-- Create AuditLog Table
CREATE TABLE "AuditLog" (
    "id" SERIAL NOT NULL,
    "action" VARCHAR(100) NOT NULL,
    "performedBy" VARCHAR(50) NOT NULL,
    "target" VARCHAR(100),
    "details" TEXT,
    "ipAddress" VARCHAR(50),
    "userId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "AuditLog_action_idx" ON "AuditLog"("action");
CREATE INDEX "AuditLog_performedBy_idx" ON "AuditLog"("performedBy");
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- Create SystemConfig Table
CREATE TABLE "SystemConfig" (
    "key" VARCHAR(50) NOT NULL,
    "value" TEXT NOT NULL,
    "description" VARCHAR(255),
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SystemConfig_pkey" PRIMARY KEY ("key")
);

-- Create SystemErrorLog Table
CREATE TABLE "SystemErrorLog" (
    "id" SERIAL NOT NULL,
    "level" VARCHAR(20) NOT NULL DEFAULT 'ERROR',
    "message" TEXT NOT NULL,
    "stack" TEXT,
    "endpoint" VARCHAR(255),
    "ipAddress" VARCHAR(50),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SystemErrorLog_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "SystemErrorLog_createdAt_idx" ON "SystemErrorLog"("createdAt");

-- Add Foreign Key Constraints
ALTER TABLE "ScoreTransaction" ADD CONSTRAINT "ScoreTransaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
