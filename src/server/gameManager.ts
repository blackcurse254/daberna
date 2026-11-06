import crypto from 'crypto';
import { Server, Socket } from 'socket.io';
import { RoomId, RoomState, PrizeStatus, ChatMessage, WinnerSummary, OpponentInfo } from '../types';
import { checkCardCompletedLines, checkCardFullHouse, BingoCardMatrix, generateBingoCard } from '../utils/bingo';
import { sanitizeInput, verifyToken } from './security';
import { db } from './db';

export interface ServerRoom {
  id: RoomId;
  name: string;
  tag: string;
  entry: number; // Virtual chips
  maxPlayers: number; // 10 players capacity
  roundNumber: number; // Infinite continuous rounds
  status: 'waiting' | 'in_progress' | 'finished';
  currentNumber: number | null;
  drawnNumbers: number[];
  unDrawnPool: number[];
  prizesClaimed: {
    line1: PrizeStatus;
    line2: PrizeStatus;
    fullHouse: PrizeStatus;
  };
  gameSeed: string;
  gameHash: string;
  players: Map<string, { username: string; cardsCount: number; cards: BingoCardMatrix[] }>;
  timer: NodeJS.Timeout | null;
  countdownTimer: NodeJS.Timeout | null;
  countdown: number | null;
  winnerSummary: WinnerSummary | null;
}

export class BingoGameManager {
  private io: Server;
  public rooms: Map<RoomId, ServerRoom> = new Map();
  public chatHistory: Map<RoomId, ChatMessage[]> = new Map();
  private lastChatTimes: Map<string, number> = new Map();
  private onUserBalanceUpdate?: (username: string, amountChange: number) => void;
  private isUserBanned?: (username: string) => boolean;

  constructor(
    io: Server, 
    onUserBalanceUpdate?: (username: string, amountChange: number) => void,
    isUserBanned?: (username: string) => boolean
  ) {
    this.io = io;
    this.onUserBalanceUpdate = onUserBalanceUpdate;
    this.isUserBanned = isUserBanned;
    this.initializeRooms();
  }

  private generateSeedAndHash(): { seed: string; hash: string } {
    const seed = 'PROVABLY_FAIR_' + crypto.randomBytes(8).toString('hex').toUpperCase();
    const hash = '0x' + crypto.createHash('sha256').update(seed).digest('hex');
    return { seed, hash };
  }

  private initializeRooms() {
    const configs: Array<{ id: RoomId; name: string; tag: string; entry: number }> = [
      { id: 'bronze', name: 'اتاق سایبر استارتر', tag: 'مناسب مبتدی‌ها و دست‌گرمی', entry: 20000 },
      { id: 'silver', name: 'اتاق الکتریک کلاب', tag: 'محبوب‌ترین میز پرسرعت', entry: 50000 },
      { id: 'gold', name: 'اتاق نئون VIP', tag: 'جام قهرمانان و امتیازات بالا', entry: 200000 }
    ];

    for (const c of configs) {
      const { seed, hash } = this.generateSeedAndHash();
      const room: ServerRoom = {
        id: c.id,
        name: c.name,
        tag: c.tag,
        entry: c.entry,
        maxPlayers: 10,
        roundNumber: 1,
        status: 'waiting',
        currentNumber: null,
        drawnNumbers: [],
        unDrawnPool: this.createShuffledPool(),
        prizesClaimed: {
          line1: { claimed: false },
          line2: { claimed: false },
          fullHouse: { claimed: false }
        },
        gameSeed: seed,
        gameHash: hash,
        players: new Map(),
        timer: null,
        countdownTimer: null,
        countdown: null,
        winnerSummary: null
      };

      this.rooms.set(c.id, room);
      // Clean chat history: no fake chat messages!
      this.chatHistory.set(c.id, []);
    }
  }

  private createShuffledPool(): number[] {
    const pool = Array.from({ length: 90 }, (_, i) => i + 1);
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    return pool;
  }

  public getRoomState(roomId: RoomId): RoomState | null {
    const room = this.rooms.get(roomId);
    if (!room) return null;

    const realPlayersCount = room.players.size;
    const currentPot = Math.max(realPlayersCount, 1) * room.entry;

    // Real opponents list only (no fake bots)
    const opponentsList: OpponentInfo[] = [];
    room.players.forEach(p => {
      opponentsList.push({
        username: p.username,
        cardsCount: p.cardsCount,
        cardSample: p.cards[0] || []
      });
    });

    return {
      id: room.id,
      name: room.name,
      entry: room.entry,
      playersCount: realPlayersCount,
      maxPlayers: room.maxPlayers,
      currentPot: currentPot,
      status: room.status,
      currentNumber: room.currentNumber,
      drawnNumbers: [...room.drawnNumbers],
      prizesClaimed: {
        line1: { ...room.prizesClaimed.line1 },
        line2: { ...room.prizesClaimed.line2 },
        fullHouse: { ...room.prizesClaimed.fullHouse }
      },
      gameSeed: room.gameSeed,
      gameHash: room.gameHash,
      roundNumber: room.roundNumber,
      countdown: room.countdown,
      winnerSummary: room.winnerSummary ? { ...room.winnerSummary } : null,
      opponents: opponentsList.slice(0, 8)
    };
  }

  /**
   * Check if room reached 10 real players or if ready to start
   */
  public checkAndStartRoom(roomId: RoomId) {
    const room = this.rooms.get(roomId);
    if (!room) return;

    if (room.status !== 'waiting') return;

    // Starts countdown when reaching 10 players or when manually triggered
    if (room.players.size >= room.maxPlayers) {
      this.initiateCountdown(room);
    }
  }

  public initiateCountdown(room: ServerRoom) {
    if (room.status !== 'waiting') return;
    if (room.countdownTimer) clearInterval(room.countdownTimer);

    room.countdown = 5;
    this.broadcastRoomState(room.id);

    this.addChatMessage(room.id, {
      id: Date.now(),
      roomId: room.id,
      sender: 'سیستم',
      text: `شمارش معکوس آغاز شد! دور شماره ${room.roundNumber} تا ۵ ثانیه دیگر آغاز می‌شود...`,
      time: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
      isSystem: true
    });

    room.countdownTimer = setInterval(() => {
      if (room.countdown && room.countdown > 1) {
        room.countdown -= 1;
        this.io.to(`room_${room.id}`).emit('room_countdown_tick', {
          roomId: room.id,
          countdown: room.countdown
        });
      } else {
        clearInterval(room.countdownTimer!);
        room.countdownTimer = null;
        room.countdown = null;
        this.startRoomCycle(room.id);
      }
    }, 1000);
  }

  public startRoomCycle(roomId: RoomId) {
    const room = this.rooms.get(roomId);
    if (!room) return;

    if (room.timer) clearInterval(room.timer);

    // Reset round state
    const { seed, hash } = this.generateSeedAndHash();
    room.gameSeed = seed;
    room.gameHash = hash;
    room.drawnNumbers = [];
    room.unDrawnPool = this.createShuffledPool();
    room.currentNumber = null;
    room.winnerSummary = null;
    room.prizesClaimed = {
      line1: { claimed: false },
      line2: { claimed: false },
      fullHouse: { claimed: false }
    };
    room.status = 'in_progress';

    this.broadcastRoomState(roomId);

    this.addChatMessage(roomId, {
      id: Date.now(),
      roomId,
      sender: 'سیستم',
      text: `کیسه مهره‌های ۹۰ عددی به‌هم زده شد. گوی‌ها استخراج می‌شوند... موفق باشید!`,
      time: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
      isSystem: true
    });

    // Draw a number from bag every 3.2 seconds
    room.timer = setInterval(() => {
      this.drawNextNumber(roomId);
    }, 3200);
  }

  private drawNextNumber(roomId: RoomId) {
    const room = this.rooms.get(roomId);
    if (!room || room.status !== 'in_progress') return;

    if (room.unDrawnPool.length === 0) {
      this.finishRoomGame(roomId, 'تمام ۹۰ مهره از کیسه خارج شدند');
      return;
    }

    const nextNum = room.unDrawnPool.pop()!;
    room.currentNumber = nextNum;
    room.drawnNumbers.push(nextNum);

    this.io.to(`room_${roomId}`).emit('number_drawn', {
      roomId,
      number: nextNum,
      history: room.drawnNumbers,
      drawnCount: room.drawnNumbers.length
    });

    // If full house claimed by a real player, finish round
    if (room.prizesClaimed.fullHouse.claimed) {
      this.finishRoomGame(roomId, `ثبت دبرنای کامل توسط ${room.prizesClaimed.fullHouse.winnerName}`);
    }
  }

  /**
   * End of round: Close the room, broadcast Winners Modal, and allow infinite games
   */
  private finishRoomGame(roomId: RoomId, reason: string) {
    const room = this.rooms.get(roomId);
    if (!room) return;

    if (room.timer) {
      clearInterval(room.timer);
      room.timer = null;
    }

    room.status = 'finished';

    const totalPot = Math.max(room.players.size, 1) * room.entry;

    // Construct Winners Summary
    const winnerSummary: WinnerSummary = {
      line1Winner: room.prizesClaimed.line1.winnerName || 'برنده‌ای ثبت نشد',
      line1Prize: room.prizesClaimed.line1.prize || Math.floor(totalPot * 0.15),
      line2Winner: room.prizesClaimed.line2.winnerName || 'برنده‌ای ثبت نشد',
      line2Prize: room.prizesClaimed.line2.prize || Math.floor(totalPot * 0.35),
      fullHouseWinner: room.prizesClaimed.fullHouse.winnerName || 'برنده‌ای ثبت نشد',
      fullHousePrize: room.prizesClaimed.fullHouse.prize || Math.floor(totalPot * 0.50),
      totalPot,
      roundNumber: room.roundNumber,
      reason,
      drawnCount: room.drawnNumbers.length
    };
    room.winnerSummary = winnerSummary;

    // Record match to database
    db.recordMatch({
      roomId: room.id,
      roomName: room.name,
      drawnNumbers: [...room.drawnNumbers],
      winnerUsername: winnerSummary.fullHouseWinner !== 'برنده‌ای ثبت نشد' ? winnerSummary.fullHouseWinner : winnerSummary.line1Winner,
      prizeType: 'fullHouse',
      chipsAwarded: winnerSummary.fullHousePrize || 0
    });

    // Broadcast room game over with full winners table
    this.io.to(`room_${roomId}`).emit('room_game_over', {
      roomId,
      reason,
      prizesClaimed: room.prizesClaimed,
      winnerSummary
    });

    this.broadcastRoomState(roomId);

    // Chat broadcast
    this.addChatMessage(roomId, {
      id: Date.now(),
      roomId,
      sender: 'سیستم',
      text: `🏆 دور شماره ${room.roundNumber} به پایان رسید. اتاق بسته شد و تابلوی برندگان به نمایش درآمد. برای بازی بعدی آماده شوید.`,
      time: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
      isSystem: true
    });
  }

  /**
   * Reset room for infinite continuous game cycles
   */
  public prepareNextRound(roomId: RoomId) {
    const room = this.rooms.get(roomId);
    if (!room) return;

    if (room.timer) clearInterval(room.timer);
    if (room.countdownTimer) clearInterval(room.countdownTimer);

    room.roundNumber += 1;
    room.status = 'waiting';
    room.currentNumber = null;
    room.drawnNumbers = [];
    room.unDrawnPool = this.createShuffledPool();
    room.countdown = null;
    room.winnerSummary = null;
    room.prizesClaimed = {
      line1: { claimed: false },
      line2: { claimed: false },
      fullHouse: { claimed: false }
    };

    this.broadcastRoomState(roomId);

    // If real players are in the room, start countdown
    if (room.players.size > 0) {
      this.initiateCountdown(room);
    }
  }

  /**
   * Register Socket.IO events with strict server-side validation & authentication
   */
  public registerSocketEvents(socket: Socket) {
    const token = (socket.handshake.auth?.token || socket.handshake.query?.token) as string;
    const verified = verifyToken(token);
    const authenticatedUsername = verified?.username || null;

    socket.on('join_room', (data: { roomId: RoomId; username: string; cardsCount: number; cards?: BingoCardMatrix[] }) => {
      const { roomId, cardsCount, cards } = data;
      const room = this.rooms.get(roomId);
      if (!room) {
        socket.emit('error_message', { message: 'اتاق مورد نظر یافت نشد.' });
        return;
      }

      const effectiveUsername = authenticatedUsername || data.username || 'بازیکن مهمان';
      if (this.isUserBanned && this.isUserBanned(effectiveUsername)) {
        socket.emit('error_message', { message: 'حساب کاربری شما مسدود است.' });
        return;
      }

      socket.join(`room_${roomId}`);
      room.players.set(socket.id, {
        username: effectiveUsername,
        cardsCount: Math.min(Math.max(cardsCount || 1, 1), 4),
        cards: cards || [generateBingoCard()]
      });

      // Send initial authoritative state
      const state = this.getRoomState(roomId);
      socket.emit('room_state', state);

      // Send chat history
      const history = this.chatHistory.get(roomId) || [];
      socket.emit('chat_history', history);

      this.addChatMessage(roomId, {
        id: Date.now(),
        roomId,
        sender: 'سیستم',
        text: `بازیکن ${effectiveUsername} به میز پیوست. (${room.players.size} / ۱۰ بازیکن)`,
        time: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
        isSystem: true
      });

      this.broadcastRoomState(roomId);

      // Check if room reached 10 players to start countdown!
      this.checkAndStartRoom(roomId);
    });

    socket.on('start_room_game', (data: { roomId: RoomId }) => {
      const room = this.rooms.get(data.roomId);
      if (room && room.status === 'waiting' && room.players.size > 0) {
        this.initiateCountdown(room);
      }
    });

    socket.on('request_next_round', (data: { roomId: RoomId }) => {
      this.prepareNextRound(data.roomId);
    });

    socket.on('sync_room_state', (data: { roomId: RoomId }) => {
      const state = this.getRoomState(data.roomId);
      if (state) {
        socket.emit('room_state', state);
      }
    });

    socket.on('send_chat_message', (data: { roomId: RoomId; username: string; text: string; isReaction?: boolean }) => {
      const config = db.getConfig();
      if (!config.chatEnabled) {
        socket.emit('error_message', { message: 'چت موقتاً غیرفعال است.' });
        return;
      }

      const { roomId, text, isReaction } = data;
      const senderName = authenticatedUsername || data.username || 'کاربر';

      const now = Date.now();
      const lastTime = this.lastChatTimes.get(socket.id) || 0;
      if (now - lastTime < 800) {
        socket.emit('error_message', { message: 'لطفاً با سرعت کمتری پیام ارسال کنید.' });
        return;
      }
      this.lastChatTimes.set(socket.id, now);

      const cleanText = sanitizeInput(text || '').slice(0, 150);
      if (!cleanText.trim()) return;

      const msg: ChatMessage = {
        id: Date.now(),
        roomId,
        sender: senderName,
        text: cleanText,
        time: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
        isSystem: false,
        isReaction: Boolean(isReaction)
      };

      this.addChatMessage(roomId, msg);
    });

    socket.on('claim_prize', (data: { roomId: RoomId; username: string; prizeType: 'line1' | 'line2' | 'fullHouse'; cards: BingoCardMatrix[] }) => {
      const { roomId, prizeType, cards } = data;
      const room = this.rooms.get(roomId);
      if (!room) {
        socket.emit('claim_result', { success: false, message: 'اتاق نامعتبر است.' });
        return;
      }

      if (room.status !== 'in_progress') {
        socket.emit('claim_result', { success: false, message: 'بازی در حال حاضر متوقف یا پایان یافته است.' });
        return;
      }

      const claimer = authenticatedUsername || data.username;
      if (!claimer) {
        socket.emit('claim_result', { success: false, message: 'احراز هویت الزامی است.' });
        return;
      }

      const totalPot = Math.max(room.players.size, 1) * room.entry;

      if (room.prizesClaimed[prizeType].claimed) {
        socket.emit('claim_result', {
          success: false,
          message: `پاداش ${prizeType === 'line1' ? 'تک‌خط' : prizeType === 'line2' ? 'دوخط' : 'دبرنا کامل'} قبلاً توسط ${room.prizesClaimed[prizeType].winnerName} دریافت شده است.`
        });
        return;
      }

      // Authoritative Server Verification!
      const drawnSet = new Set(room.drawnNumbers);
      let maxLines = 0;
      let hasFullHouse = false;

      if (!Array.isArray(cards) || cards.length === 0) {
        socket.emit('claim_result', { success: false, message: 'کارتی برای بررسی به سرور ارسال نشد.' });
        return;
      }

      for (const card of cards) {
        const lines = checkCardCompletedLines(card, drawnSet);
        if (lines > maxLines) maxLines = lines;
        if (checkCardFullHouse(card, drawnSet)) hasFullHouse = true;
      }

      let isValid = false;
      let rewardPercent = 0;
      let prizeLabel = '';

      if (prizeType === 'line1') {
        isValid = maxLines >= 1;
        rewardPercent = 0.15;
        prizeLabel = 'پاداش تک‌خط (Line 1)';
      } else if (prizeType === 'line2') {
        isValid = maxLines >= 2;
        rewardPercent = 0.35;
        prizeLabel = 'پاداش دوخط (Line 2)';
      } else if (prizeType === 'fullHouse') {
        isValid = hasFullHouse;
        rewardPercent = 0.50;
        prizeLabel = '🏆 دبرنا کامل (Full House / دبلنا)';
      }

      if (!isValid) {
        socket.emit('claim_result', {
          success: false,
          message: 'بررسی امنیتی سرور نشان داد کارت شما هنوز واجد شرایط دریافت این پاداش نیست.'
        });
        return;
      }

      // Valid Claim by REAL player!
      const rewardChips = Math.floor(totalPot * rewardPercent);
      room.prizesClaimed[prizeType] = {
        claimed: true,
        winnerName: claimer,
        prize: rewardChips
      };

      if (this.onUserBalanceUpdate) {
        this.onUserBalanceUpdate(claimer, rewardChips);
      }

      socket.emit('claim_result', {
        success: true,
        prizeType,
        rewardAmount: rewardChips,
        message: `🎉 تبریک! ${prizeLabel} شامل ${rewardChips.toLocaleString('fa-IR')} سکه به حسابتان اضافه شد.`
      });

      this.io.to(`room_${roomId}`).emit('prize_claimed', {
        roomId,
        prizeType,
        winnerName: claimer,
        rewardAmount: rewardChips,
        prizesClaimed: room.prizesClaimed
      });

      this.addChatMessage(roomId, {
        id: Date.now(),
        roomId,
        sender: 'سیستم',
        text: `🎉 بازیکن ${claimer} موفق به کسب ${prizeLabel} و دریافت ${rewardChips.toLocaleString('fa-IR')} سکه شد!`,
        time: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
        isSystem: true
      });

      if (prizeType === 'fullHouse') {
        this.finishRoomGame(roomId, `دبرنا کامل (دبلنا!) توسط ${claimer}`);
      }
    });

    socket.on('disconnect', () => {
      this.lastChatTimes.delete(socket.id);
      for (const room of this.rooms.values()) {
        if (room.players.has(socket.id)) {
          room.players.delete(socket.id);
          this.broadcastRoomState(room.id);
        }
      }
    });
  }

  private addChatMessage(roomId: RoomId, msg: ChatMessage) {
    const list = this.chatHistory.get(roomId) || [];
    list.push(msg);
    if (list.length > 50) list.shift();
    this.chatHistory.set(roomId, list);
    this.io.to(`room_${roomId}`).emit('receive_chat_message', msg);
  }

  public broadcastRoomState(roomId: RoomId) {
    const state = this.getRoomState(roomId);
    if (state) {
      this.io.to(`room_${roomId}`).emit('room_state', state);
    }
  }

  public updateRoomEntry(roomId: RoomId, newEntry: number) {
    const room = this.rooms.get(roomId);
    if (room) {
      room.entry = newEntry;
      this.broadcastRoomState(roomId);
    }
  }
}
