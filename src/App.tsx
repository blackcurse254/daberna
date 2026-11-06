import React, { useState, useEffect, useCallback, useTransition } from 'react';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { ConfettiCanvas } from './components/ConfettiCanvas';
import { Toast } from './components/Toast';
import { AuthModal } from './components/auth/AuthModal';
import { LobbyView } from './components/lobby/LobbyView';
import { GameView } from './components/game/GameView';
import { LeaderboardView } from './components/leaderboard/LeaderboardView';
import { ProfileView } from './components/profile/ProfileView';
import { AdminView } from './components/admin/AdminView';

import { 
  UserInfo, RoomConfig, RoomState, CardSkin, MarkerSkin, 
  ChatMessage, Transaction, SoundEffectType 
} from './types';
import { soundManager } from './utils/audio';
import { generateBingoCard, BingoCardMatrix } from './utils/bingo';
import { api } from './services/api';
import { socket, socketService } from './services/socket';

export default function App() {
  const [, startTransition] = useTransition();

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('daberna_auth') === 'true' && Boolean(localStorage.getItem('daberna_token'));
  });
  const [userInfo, setUserInfo] = useState<UserInfo>(() => {
    const saved = localStorage.getItem('daberna_user');
    return saved ? JSON.parse(saved) : {
      username: '',
      fullname: '',
      phone: '',
      email: '',
      joinedDate: '۱۴۰۲/۱۰/۱۲',
      vipLevel: 'برنز',
      totalGames: 0,
      totalWins: 0,
      totalEarned: 0,
      balance: 0,
      status: 'فعال',
      isAdmin: false
    };
  });
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('lobby');
  const [authError, setAuthError] = useState<string | null>(null);

  // Network & UI States
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [balance, setBalance] = useState<number>(0);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [confettiActive, setConfettiActive] = useState<boolean>(false);

  // Customization Skins State
  const [cardSkin, setCardSkin] = useState<CardSkin>('gold');
  const [markerSkin, setMarkerSkin] = useState<MarkerSkin>('bean');

  // Rooms Configuration State
  const [rooms, setRooms] = useState<RoomConfig[]>([
    { 
      id: 'bronze', 
      name: 'اتاق سایبر استارتر', 
      tag: 'مناسب مبتدی‌ها و دست‌گرمی', 
      entry: 20000, 
      players: 14, 
      status: 'فعال',
      bgGradient: 'from-[#22234A]/80 to-[#11162B]', 
      border: 'border-[#20D6C2]/30 hover:border-[#20D6C2]/70', 
      badgeBg: 'bg-[#20D6C2]/15 text-[#20D6C2] border-[#20D6C2]/30',
      badge: 'استارتر'
    },
    { 
      id: 'silver', 
      name: 'اتاق الکتریک کلاب', 
      tag: 'محبوب‌ترین میز پرسرعت', 
      entry: 50000, 
      players: 28, 
      status: 'فعال',
      bgGradient: 'from-[#9575FF]/20 via-[#22234A]/80 to-[#11162B]', 
      border: 'border-[#9575FF]/40 hover:border-[#9575FF]/80', 
      badgeBg: 'bg-[#9575FF]/20 text-[#9575FF] border-[#9575FF]/40',
      badge: 'پرو'
    },
    { 
      id: 'gold', 
      name: 'اتاق نئون VIP', 
      tag: 'جایزه سنگین و لژ سلطنتی', 
      entry: 200000, 
      players: 18, 
      status: 'فعال',
      bgGradient: 'from-[#FF7185]/20 via-[#22234A]/90 to-[#11162B]', 
      border: 'border-[#FF7185]/50 shadow-[0_0_20px_rgba(255,113,133,0.15)] hover:border-[#FF7185]/90', 
      badgeBg: 'bg-gradient-to-r from-[#FF7185]/20 to-[#9575FF]/20 text-[#FF7185] border-[#FF7185]/40 font-black',
      badge: 'های‌رولر VIP'
    }
  ]);

  // Live Game State
  const [selectedRoom, setSelectedRoom] = useState<RoomConfig | null>(null);
  const [roomState, setRoomState] = useState<RoomState | null>(null);
  const [cardCount, setCardCount] = useState<number>(1);
  const [playerCards, setPlayerCards] = useState<BingoCardMatrix[]>([]);
  const [markedNumbers, setMarkedNumbers] = useState<Set<number>>(new Set());
  const [autoDaub, setAutoDaub] = useState<boolean>(false);
  const [claimMessage, setClaimMessage] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  // Profile & History
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [leaderboard, setLeaderboard] = useState<Array<{ rank: number; name: string; wins: number; totalWon: number; badge: string }>>([]);

  // Admin Data State
  const [adminOverview, setAdminOverview] = useState<any>({
    totalUsers: 1,
    totalVolume: 0,
    commissionRate: 10,
    adminProfit: 0,
    users: [],
    pendingCardDeposits: [],
    rooms: [],
    auditLogs: []
  });

  const showToast = useCallback((msg: string, duration = 3000) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), duration);
  }, []);

  // Monitor socket connection status
  useEffect(() => {
    const unsub = socketService.subscribeConnectionStatus((connected) => {
      setIsOnline(connected);
      if (!connected) {
        showToast('اتصال به سرور قطع شد. در حال تلاش برای اتصال مجدد...', 4000);
      } else {
        if (selectedRoom) {
          socket.emit('sync_room_state', { roomId: selectedRoom.id });
        }
      }
    });
    return unsub;
  }, [selectedRoom, showToast]);

  // Validate session on load
  useEffect(() => {
    const token = localStorage.getItem('daberna_token');
    if (token) {
      api.getMe()
        .then(res => {
          setUserInfo(res.user);
          setIsAuthenticated(true);
          setIsAdmin(Boolean(res.user.isAdmin));
          setBalance(res.user.balance);
        })
        .catch(() => {
          setIsAuthenticated(false);
          setIsAdmin(false);
          localStorage.removeItem('daberna_auth');
          localStorage.removeItem('daberna_user');
          localStorage.removeItem('daberna_token');
        });
    }
  }, []);

  // Sync auth & user info
  useEffect(() => {
    localStorage.setItem('daberna_auth', isAuthenticated ? 'true' : 'false');
    localStorage.setItem('daberna_user', JSON.stringify(userInfo));
  }, [isAuthenticated, userInfo]);

  useEffect(() => {
    if (isAuthenticated) {
      if (userInfo.isAdmin) {
        setIsAdmin(true);
        setActiveTab('admin');
      } else {
        setIsAdmin(false);
        if (activeTab === 'auth' || activeTab === 'admin') {
          setActiveTab('lobby');
        }
      }
      setBalance(userInfo.balance);
    }
  }, [isAuthenticated, userInfo.isAdmin, userInfo.balance, activeTab]);

  // Load Initial Server Data
  const loadLeaderboard = useCallback(async () => {
    try {
      const data = await api.getLeaderboard();
      setLeaderboard(data.leaderboard);
    } catch {
      // Fallback
    }
  }, []);

  const loadTransactions = useCallback(async () => {
    if (!userInfo.username) return;
    try {
      const data = await api.getTransactions();
      setTransactions(data.transactions);
    } catch {
      // Fallback
    }
  }, [userInfo.username]);

  const loadAdminOverview = useCallback(async () => {
    try {
      const data = await api.getAdminOverview();
      setAdminOverview(data);
    } catch {
      // Fallback
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadTransactions();
      loadLeaderboard();
      if (isAdmin) {
        loadAdminOverview();
      }
    }
  }, [isAuthenticated, isAdmin, loadTransactions, loadLeaderboard, loadAdminOverview]);

  // Socket.io Event Listeners for Authoritative Server Events
  useEffect(() => {
    const handleRoomState = (state: RoomState) => {
      setRoomState(state);
      if (autoDaub && state.drawnNumbers.length > 0) {
        setMarkedNumbers(prev => {
          const next = new Set(prev);
          playerCards.forEach(card => {
            card.forEach(row => {
              row.forEach(val => {
                if (val !== null && state.drawnNumbers.includes(val)) {
                  next.add(val);
                }
              });
            });
          });
          return next;
        });
      }
    };

    const handleNumberDrawn = (data: { roomId: string; number: number; history: number[]; drawnCount: number }) => {
      setRoomState(prev => prev ? { ...prev, currentNumber: data.number, drawnNumbers: data.history } : null);
      soundManager.play('number');

      if (autoDaub) {
        setMarkedNumbers(prev => {
          const next = new Set(prev);
          playerCards.forEach(card => {
            card.forEach(row => {
              row.forEach(val => {
                if (val === data.number) next.add(val);
              });
            });
          });
          return next;
        });
      }
    };

    const handlePrizeClaimed = (data: { roomId: string; prizeType: 'line1' | 'line2' | 'fullHouse'; winnerName: string; rewardAmount: number; prizesClaimed: any }) => {
      setRoomState(prev => prev ? { ...prev, prizesClaimed: data.prizesClaimed } : null);
      if (data.winnerName === userInfo.username) {
        soundManager.play('win');
        setConfettiActive(true);
        setTimeout(() => setConfettiActive(false), 5000);
      }
    };

    const handleClaimResult = (res: { success: boolean; message: string; prizeType?: string; rewardAmount?: number }) => {
      setClaimMessage(res.message);
      if (res.success) {
        soundManager.play('win');
        setConfettiActive(true);
        setTimeout(() => setConfettiActive(false), 5000);
      }
    };

    const handleReceiveChatMessage = (msg: ChatMessage) => {
      setChatMessages(prev => [...prev, msg]);
    };

    const handleChatHistory = (history: ChatMessage[]) => {
      setChatMessages(history);
    };

    const handleBalanceUpdated = (data: { username: string; balance: number; totalEarned?: number; totalWins?: number }) => {
      if (data.username === userInfo.username) {
        setBalance(data.balance);
        setUserInfo(u => ({
          ...u,
          balance: data.balance,
          totalEarned: data.totalEarned ?? u.totalEarned,
          totalWins: data.totalWins ?? u.totalWins
        }));
        loadTransactions();
      }
    };

    const handleErrorMsg = (data: { message: string }) => {
      showToast(data.message);
    };

    const handleRoomGameOver = (data: { roomId: string; reason: string; prizesClaimed: any; winnerSummary: any }) => {
      setRoomState(prev => prev ? { ...prev, status: 'finished', winnerSummary: data.winnerSummary, prizesClaimed: data.prizesClaimed } : null);
      soundManager.play('win');
      setConfettiActive(true);
      setTimeout(() => setConfettiActive(false), 5000);
    };

    socket.on('room_state', handleRoomState);
    socket.on('number_drawn', handleNumberDrawn);
    socket.on('prize_claimed', handlePrizeClaimed);
    socket.on('claim_result', handleClaimResult);
    socket.on('receive_chat_message', handleReceiveChatMessage);
    socket.on('chat_history', handleChatHistory);
    socket.on('user_balance_updated', handleBalanceUpdated);
    socket.on('room_game_over', handleRoomGameOver);
    socket.on('error_message', handleErrorMsg);

    return () => {
      socket.off('room_state', handleRoomState);
      socket.off('number_drawn', handleNumberDrawn);
      socket.off('prize_claimed', handlePrizeClaimed);
      socket.off('claim_result', handleClaimResult);
      socket.off('receive_chat_message', handleReceiveChatMessage);
      socket.off('chat_history', handleChatHistory);
      socket.off('user_balance_updated', handleBalanceUpdated);
      socket.off('room_game_over', handleRoomGameOver);
      socket.off('error_message', handleErrorMsg);
    };
  }, [autoDaub, playerCards, userInfo.username, loadTransactions, showToast]);

  // Auth Handlers
  const handleLogin = async (username: string, password?: string) => {
    setAuthError(null);
    try {
      const res = await api.login(username, password);
      setUserInfo(res.user);
      setIsAuthenticated(true);
      setBalance(res.user.balance);
      socketService.updateAuthToken(res.token);

      if (res.user.isAdmin) {
        setIsAdmin(true);
        setActiveTab('admin');
      } else {
        setIsAdmin(false);
        setActiveTab('lobby');
      }
      showToast(`خوش آمدید ${res.user.fullname || res.user.username}!`);
    } catch (err: any) {
      setAuthError(err.message || 'خطا در ورود به حساب');
    }
  };

  const handleRegister = async (username: string, fullname: string, phone: string, password?: string) => {
    setAuthError(null);
    try {
      const res = await api.register(username, fullname, phone, password);
      setUserInfo(res.user);
      setIsAuthenticated(true);
      setBalance(res.user.balance);
      setIsAdmin(false);
      socketService.updateAuthToken(res.token);
      setActiveTab('lobby');
      showToast('ثبت‌نام با موفقیت انجام شد. به بازی دبرنا خوش آمدید!');
    } catch (err: any) {
      setAuthError(err.message || 'خطا در ثبت‌نام');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setIsAdmin(false);
    api.setToken(null);
    socketService.updateAuthToken(null);
    localStorage.removeItem('daberna_auth');
    localStorage.removeItem('daberna_user');
    localStorage.removeItem('daberna_token');
    setActiveTab('auth');
    showToast('از حساب کاربری خارج شدید.');
  };

  // Sound Toggle
  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    soundManager.setEnabled(next);
  };

  // Join Room Handler
  const handleJoinRoom = async (room: RoomConfig) => {
    const totalCost = room.entry * cardCount;
    if (balance < totalCost) {
      showToast('موجودی کیف پول برای این تعداد کارت کافی نیست! لطفاً حسابتان را شارژ کنید.');
      return;
    }

    try {
      const res = await api.deductRoomEntry(totalCost, `${room.name} (${cardCount} کارت)`);
      setBalance(res.balance);
      setUserInfo(u => ({ ...u, balance: res.balance, totalGames: u.totalGames + 1 }));

      const generated = Array.from({ length: cardCount }).map(() => generateBingoCard());
      setPlayerCards(generated);
      setSelectedRoom(room);
      setMarkedNumbers(new Set());
      setClaimMessage(null);

      socket.emit('join_room', {
        roomId: room.id,
        username: userInfo.username || 'بازیکن مهمان',
        cardsCount: cardCount,
        cards: generated
      });

      startTransition(() => {
        setActiveTab('game');
      });
      loadTransactions();
    } catch (err: any) {
      showToast(err.message || 'خطا در ورود به اتاق');
    }
  };

  // Cell Click Handler
  const handleCellClick = (val: number) => {
    const drawnNumbers = roomState?.drawnNumbers || [];
    if (!drawnNumbers.includes(val)) {
      showToast('این عدد هنوز توسط گردونه سرور خارج نشده است!');
      return;
    }

    soundManager.play('mark');
    setMarkedNumbers(prev => {
      const updated = new Set(prev);
      if (updated.has(val)) updated.delete(val);
      else updated.add(val);
      return updated;
    });
  };

  // Claim Prize Handler
  const handleClaimPrize = (type: 'line1' | 'line2' | 'fullHouse') => {
    if (!selectedRoom) return;

    socket.emit('claim_prize', {
      roomId: selectedRoom.id,
      username: userInfo.username,
      prizeType: type,
      cards: playerCards
    });
  };

  // Next Round Trigger for Infinite Cycles
  const handleRequestNextRound = () => {
    if (!selectedRoom) return;
    socket.emit('request_next_round', { roomId: selectedRoom.id });
    setMarkedNumbers(new Set());
    setClaimMessage(null);
    showToast(`دور بعدی میز در حال آماده‌سازی است...`);
  };

  // Chat Handlers
  const handleSendMessage = (text: string) => {
    if (!selectedRoom) return;
    socket.emit('send_chat_message', {
      roomId: selectedRoom.id,
      username: userInfo.username,
      text,
      isReaction: false
    });
  };

  const handleSendSoundReaction = (soundType: SoundEffectType, label: string) => {
    soundManager.play(soundType);
    if (selectedRoom) {
      socket.emit('send_chat_message', {
        roomId: selectedRoom.id,
        username: userInfo.username,
        text: `[افکت صوتی] ${label}`,
        isReaction: true
      });
    }
  };

  // Profile Save
  const handleSaveProfile = async (data: { fullname: string; phone: string; email: string }) => {
    try {
      const res = await api.updateProfile(data);
      setUserInfo(res.user);
      showToast('اطلاعات کاربری با موفقیت به‌روزرسانی شد.');
    } catch (err: any) {
      showToast(err.message || 'خطا در به‌روزرسانی پروفایل');
    }
  };

  // Admin Management Actions
  const handleToggleBan = async (userId: number | string) => {
    try {
      await api.toggleUserBan(userId);
      await loadAdminOverview();
      showToast('وضعیت حساب کاربر تغییر کرد.');
    } catch (err: any) {
      showToast(err.message || 'خطا در تغییر وضعیت حساب');
    }
  };

  const handleToggleRole = async (userId: number | string, role: 'PLAYER' | 'ADMIN') => {
    try {
      await api.toggleUserRole(userId, role);
      await loadAdminOverview();
      showToast('سطح دسترسی کاربر تغییر یافت.');
    } catch (err: any) {
      showToast(err.message || 'خطا در تغییر سطح دسترسی');
    }
  };

  const handleGrantChips = async (userId: number | string, amount: number) => {
    try {
      await api.grantFreeChips(userId, amount);
      await loadAdminOverview();
      showToast(`تعداد ${amount.toLocaleString('fa-IR')} سکه رایگان به کاربر اهدا شد.`);
    } catch (err: any) {
      showToast(err.message || 'خطا در اهدای سکه');
    }
  };

  const handleUpdateRoomEntry = async (roomId: string, entry: number) => {
    try {
      await api.updateRoomEntry(roomId, entry);
      setRooms(prev => prev.map(r => r.id === roomId ? { ...r, entry } : r));
      await loadAdminOverview();
      showToast('تعداد سکه ورودی اتاق تغییر یافت.');
    } catch (err: any) {
      showToast(err.message || 'خطا در تغییر ورودی اتاق');
    }
  };

  const handleUpdateSettings = async (settings: any) => {
    try {
      await api.updatePlatformSettings(settings);
      await loadAdminOverview();
      showToast('تنظیمات عمومی سامانه با موفقیت ذخیره شد.');
    } catch (err: any) {
      showToast(err.message || 'خطا در ذخیره تنظیمات');
    }
  };

  return (
    <div className="min-h-screen w-full max-w-[100vw] bg-[#11162B] text-slate-100 font-sans dir-rtl select-none pb-20 md:pb-12 relative overflow-x-hidden bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#1B2240] via-[#11162B] to-[#0A0D1A]">
      
      {/* Background Decorative Cyber Grid */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.04] bg-[linear-gradient(to_right,#20D6C220_1px,transparent_1px),linear-gradient(to_bottom,#20D6C220_1px,transparent_1px)] bg-[size:32px_32px]" />

      <ConfettiCanvas active={confettiActive} />
      <Toast message={toastMessage} />

      {/* Header */}
      <Header 
        isAuthenticated={isAuthenticated}
        isAdmin={isAdmin}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        userInfo={userInfo}
        balance={balance}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        onOpenWallet={() => {}}
        onLogout={handleLogout}
        isOnline={isOnline}
      />

      {/* Mobile Bottom Navigation */}
      {isAuthenticated && !isAdmin && (
        <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
      )}

      {/* Main Views */}
      {!isAuthenticated && (
        <AuthModal 
          onLogin={handleLogin}
          onRegister={handleRegister}
          errorNotice={authError}
        />
      )}

      {isAuthenticated && !isAdmin && activeTab === 'lobby' && (
        <LobbyView 
          cardCount={cardCount}
          setCardCount={setCardCount}
          rooms={rooms}
          onJoinRoom={handleJoinRoom}
        />
      )}

      {isAuthenticated && !isAdmin && activeTab === 'game' && selectedRoom && (
        <GameView 
          room={selectedRoom}
          roomState={roomState}
          playerCards={playerCards}
          markedNumbers={markedNumbers}
          autoDaub={autoDaub}
          setAutoDaub={setAutoDaub}
          cardSkin={cardSkin}
          setCardSkin={setCardSkin}
          markerSkin={markerSkin}
          setMarkerSkin={setMarkerSkin}
          onCellClick={handleCellClick}
          onClaimPrize={handleClaimPrize}
          claimMessage={claimMessage}
          chatMessages={chatMessages}
          onSendMessage={handleSendMessage}
          onSendSoundReaction={handleSendSoundReaction}
          onBackToLobby={() => {
            setActiveTab('lobby');
            setSelectedRoom(null);
          }}
          onRequestNextRound={handleRequestNextRound}
        />
      )}

      {isAuthenticated && !isAdmin && activeTab === 'leaderboard' && (
        <LeaderboardView leaderboard={leaderboard} />
      )}

      {isAuthenticated && !isAdmin && activeTab === 'profile' && (
        <ProfileView 
          userInfo={userInfo}
          balance={balance}
          transactions={transactions}
          onOpenWallet={() => {}}
          onLogout={handleLogout}
          onSaveProfile={handleSaveProfile}
          notice={null}
        />
      )}

      {isAuthenticated && isAdmin && activeTab === 'admin' && (
        <AdminView 
          overview={adminOverview}
          onToggleBan={handleToggleBan}
          onToggleRole={handleToggleRole}
          onGrantChips={handleGrantChips}
          onUpdateRoomEntry={handleUpdateRoomEntry}
          onUpdateSettings={handleUpdateSettings}
          onRefresh={loadAdminOverview}
        />
      )}

    </div>
  );
}
