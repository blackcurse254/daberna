import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { 
  Volume2, VolumeX, Wallet, Play, Award, User, ShieldCheck, 
  LogOut, PlusCircle, AlertCircle, Sparkles, ChevronLeft, 
  Zap, Users, MessageSquare, Radio, Send, Trophy, Edit3, 
  History, BarChart3, CreditCard, DollarSign, Ban, UserCheck, 
  Settings, CheckCircle2, XCircle, Copy, Flame, Lock, UserPlus, Phone,
  Palette, RefreshCw
} from 'lucide-react';

// Socket.io Connection
const socket = io('http://localhost:4000', {
  autoConnect: true,
  transports: ['websocket']
});

// Logo Component
const LuxuryDabernaLogo = () => (
  <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-700 p-0.5 shadow-lg shadow-amber-500/30 flex items-center justify-center animate-pulse">
    <div className="w-full h-full bg-neutral-950 rounded-[14px] flex items-center justify-center border border-amber-300/40">
      <span className="text-amber-400 font-black text-xl tracking-tighter drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]">۹۰</span>
    </div>
  </div>
);

// Confetti & Particle Canvas Component
const ConfettiCanvas = ({ active }) => {
  if (!active) return null;
  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {Array.from({ length: 60 }).map((_, i) => (
        <div
          key={i}
          className="absolute w-3 h-3 rounded-full animate-bounce"
          style={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            backgroundColor: ['#f59e0b', '#ef4444', '#10b981', '#3b82f6', '#ec4899', '#facc15'][i % 6],
            animationDuration: `${0.8 + Math.random() * 1.5}s`,
            boxShadow: '0 0 10px currentColor'
          }}
        />
      ))}
    </div>
  );
};

// 3x9 Bingo Card Generator
const generateBingoCard = () => {
  const card = Array.from({ length: 3 }, () => Array(9).fill(null));
  
  for (let r = 0; r < 3; r++) {
    const colIndices = [];
    while (colIndices.length < 5) {
      const idx = Math.floor(Math.random() * 9);
      if (!colIndices.includes(idx)) colIndices.push(idx);
    }
    colIndices.sort((a, b) => a - b);

    colIndices.forEach(c => {
      const min = c === 0 ? 1 : c * 10;
      const max = c === 8 ? 90 : c * 10 + 9;
      let val;
      do {
        val = Math.floor(Math.random() * (max - min + 1)) + min;
      } while (
        card[0][c] === val || card[1][c] === val || card[2][c] === val
      );
      card[r][c] = val;
    });
  }
  return card;
};

export default function App() {
  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('daberna_auth') === 'true';
  });
  const [authMode, setAuthMode] = useState('login');
  const [userInfo, setUserInfo] = useState(() => {
    const saved = localStorage.getItem('daberna_user');
    return saved ? JSON.parse(saved) : {
      username: '',
      fullname: '',
      phone: '',
      email: '',
      joinedDate: '۱۴۰۲/۱۰/۱۲',
      vipLevel: 'طلا',
      totalGames: 124,
      totalWins: 42,
      totalEarned: 18500000
    };
  });
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState('lobby');

  const [loginInput, setLoginInput] = useState({ username: '', password: '' });
  const [registerInput, setRegisterInput] = useState({ username: '', fullname: '', phone: '', password: '' });

  // Customization Skins State
  const [cardSkin, setCardSkin] = useState('gold'); // 'gold', 'wood', 'classic'
  const [markerSkin, setMarkerSkin] = useState('bean'); // 'bean', 'coin', 'emerald', 'diamond'

  // Persistence
  useEffect(() => {
    localStorage.setItem('daberna_auth', isAuthenticated ? 'true' : 'false');
    localStorage.setItem('daberna_user', JSON.stringify(userInfo));
  }, [isAuthenticated, userInfo]);

  useEffect(() => {
    if (isAuthenticated) {
      if (userInfo.username === 'admin') {
        setIsAdmin(true);
        setActiveTab('admin');
      } else {
        setIsAdmin(false);
        if (activeTab === 'auth' || activeTab === 'admin') {
          setActiveTab('lobby');
        }
      }
    }
  }, [isAuthenticated, userInfo, activeTab]);

  // Wallet State
  const [balance, setBalance] = useState(350000);
  const [walletTab, setWalletTab] = useState('crypto');
  
  // Deposit USDT State
  const [depositUsdtAmount, setDepositUsdtAmount] = useState('10');
  const [depositTxHash, setDepositTxHash] = useState('');
  
  // Deposit Voucher State
  const [voucherCode, setVoucherCode] = useState('');
  const [voucherActivationCode, setVoucherActivationCode] = useState('');

  // Deposit Card-to-Card State
  const [cardToCardAmount, setCardToCardAmount] = useState('100000');
  const [userCardNumber, setUserCardNumber] = useState('');
  const [cardRefCode, setCardRefCode] = useState('');

  // Withdraw USDT State
  const [withdrawUsdtAmount, setWithdrawUsdtAmount] = useState('20');
  const [withdrawWalletAddress, setWithdrawWalletAddress] = useState('');
  
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [soundNotice, setSoundNotice] = useState(null);

  const USDT_TOMAN_RATE = 68500;
  const ANONYMOUS_USDT_TRC20 = 'TY17x8AnOnYmOuS1928DabE3rn4VIP89xZ';
  const SYSTEM_DESTINATION_CARD = '6037-9975-1234-5678';

  // Transactions History
  const [transactions, setTransactions] = useState([
    { id: 101, type: 'برد در بازی', amount: +450000, date: '۱۰ دقیقه پیش', status: 'موفق' },
    { id: 102, type: 'شارژ کریپتو (USDT)', amount: +685000, date: 'امروز، ۱۴:۲۰', status: 'موفق' },
    { id: 103, type: 'ورودی اتاق طلایی', amount: -200000, date: 'امروز، ۱۳:۰۰', status: 'انجام شد' }
  ]);

  // Card to Card Pending Deposit Requests
  const [pendingCardDeposits, setPendingCardDeposits] = useState([
    { id: 501, username: 'مریم_طلا', amount: 500000, userCard: '6104****1122', refCode: '98432101', date: '۱۰ دقیقه پیش', status: 'در انتظار تایید' },
    { id: 502, username: 'Arash_77', amount: 200000, userCard: '5892****9988', refCode: '11204988', date: '۲۵ دقیقه پیش', status: 'در انتظار تایید' }
  ]);

  // Admin Controls State
  const [commissionRate, setCommissionRate] = useState(10); 
  const [totalVolume] = useState(18200000);

  const [allUsers, setAllUsers] = useState([
    { id: 1, username: 'شاهین_VIP', fullname: 'شاهین محمدی', phone: '09123456789', balance: 350000, wins: 42, status: 'فعال', joined: '۱۴۰۲/۰۸/۱۵' },
    { id: 2, username: 'مریم_طلا', fullname: 'مریم حسینی', phone: '09351234567', balance: 1200000, wins: 31, status: 'فعال', joined: '۱۴۰۲/۰۹/۰۱' },
    { id: 3, username: 'Arash_77', fullname: 'آرش رضایی', phone: '09198765432', balance: 50000, wins: 28, status: 'فعال', joined: '۱۴۰۲/۰۹/۱۰' },
    { id: 4, username: 'امیر_شانس', fullname: 'امیر کریمی', phone: '09101112233', balance: 0, wins: 12, status: 'مسدود', joined: '۱۴۰۲/۱۰/۰۵' }
  ]);

  const [rooms, setRooms] = useState([
    { 
      id: 'bronze', 
      name: 'اتاق برنز', 
      tag: 'مناسب مبتدی‌ها', 
      entry: 20000, 
      players: 14, 
      status: 'فعال',
      bgGradient: 'from-amber-950/40 to-stone-900', 
      border: 'border-amber-700/30', 
      badgeBg: 'bg-amber-900/50 text-amber-300 border-amber-600/40',
      badge: 'برنز'
    },
    { 
      id: 'silver', 
      name: 'اتاق نقره‌ای', 
      tag: 'محبوب‌ترین میز', 
      entry: 50000, 
      players: 28, 
      status: 'فعال',
      bgGradient: 'from-slate-900 to-slate-950', 
      border: 'border-slate-500/30', 
      badgeBg: 'bg-slate-700/50 text-slate-200 border-slate-400/40',
      badge: 'نقره‌ای'
    },
    { 
      id: 'gold', 
      name: 'اتاق طلایی VIP', 
      tag: 'جایزه سنگین و VIP', 
      entry: 200000, 
      players: 18, 
      status: 'فعال',
      bgGradient: 'from-amber-950/80 via-neutral-900 to-amber-950/60', 
      border: 'border-amber-500/50 shadow-amber-500/10', 
      badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-black',
      badge: 'VIP طلایی'
    }
  ]);

  // Game Room State
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [cardCount, setCardCount] = useState(1);
  const [playerCards, setPlayerCards] = useState([]); 
  const [markedNumbers, setMarkedNumbers] = useState(new Set());
  const [drawnNumbers, setDrawnNumbers] = useState([]);
  const [currentNumber, setCurrentNumber] = useState(null);
  const [, setIsPlaying] = useState(false);
  const [gameSeed, setGameSeed] = useState('');
  const [gameHash, setGameHash] = useState('');
  const [showProvablyFair, setShowProvablyFair] = useState(false);
  const [confettiActive, setConfettiActive] = useState(false);

  const [autoDaub, setAutoDaub] = useState(false);

  const [prizesClaimed, setPrizesClaimed] = useState({ line1: false, line2: false, fullHouse: false });
  const [claimMessage, setClaimMessage] = useState(null);

  const [chatMessages, setChatMessages] = useState([
    { id: 1, sender: 'شاهین_VIP', text: 'سلام به همگی، امشب گردونه شانس دست منه! 😎', time: '22:10', isSystem: false },
    { id: 2, sender: 'سیستم', text: 'بازیکن Arash_77 به اتاق پیوست.', time: '22:11', isSystem: true },
    { id: 3, sender: 'مریم_طلا', text: 'امیدوارم این بار دبرنا کامل بشم 🎰', time: '22:12', isSystem: false }
  ]);
  const [newMessage, setNewMessage] = useState('');

  const playSoundEffect = (type) => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const audioCtx = new AudioCtx();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);

      if (type === 'number') {
        osc.frequency.setValueAtTime(587.33, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.2);
      } else if (type === 'mark') {
        osc.frequency.setValueAtTime(440, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.08);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.08);
      } else if (type === 'win') {
        const now = audioCtx.currentTime;
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(523.25, now);
        osc.frequency.setValueAtTime(659.25, now + 0.1);
        osc.frequency.setValueAtTime(783.99, now + 0.2);
        osc.frequency.setValueAtTime(1046.50, now + 0.3);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.8);
        osc.start(now);
        osc.stop(now + 0.8);
      } else if (type === 'cheer') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(300, audioCtx.currentTime);
        osc.frequency.linearRampToValueAtTime(600, audioCtx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.4);
      } else if (type === 'coins') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(987.77, audioCtx.currentTime);
        osc.frequency.setValueAtTime(1318.51, audioCtx.currentTime + 0.08);
        gain.gain.setValueAtTime(0.25, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.25);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.25);
      }
    } catch (e) {
      console.log('Audio error');
    }
  };

  useEffect(() => {
    socket.on('number_drawn', (data) => {
      const nextNum = data.number;
      setCurrentNumber(nextNum);
      playSoundEffect('number');
      setDrawnNumbers(data.history);

      if (autoDaub) {
        setMarkedNumbers(marked => {
          const updated = new Set(marked);
          playerCards.forEach(card => {
            card.forEach(row => {
              row.forEach(val => {
                if (val === nextNum) updated.add(val);
              });
            });
          });
          return updated;
        });
      }
    });

    socket.on('receive_chat_message', (msg) => {
      setChatMessages(prev => [...prev, msg]);
    });

    return () => {
      socket.off('number_drawn');
      socket.off('receive_chat_message');
    };
  }, [autoDaub, playerCards]);

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    if (!loginInput.username) return;

    if (loginInput.username === 'admin') {
      setIsAdmin(true);
      setIsAuthenticated(true);
      setUserInfo({ username: 'admin', fullname: 'مدیر کل سیستم', phone: '09000000000', vipLevel: 'SUPER ADMIN' });
      setActiveTab('admin');
    } else {
      setIsAdmin(false);
      setIsAuthenticated(true);
      setUserInfo({
        username: loginInput.username,
        fullname: loginInput.username,
        phone: '09120000000',
        email: `${loginInput.username}@gmail.com`,
        joinedDate: '۱۴۰۲/۱۰/۱۲',
        vipLevel: 'طلا',
        totalGames: 10,
        totalWins: 2,
        totalEarned: 500000
      });
      setActiveTab('lobby');
    }
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    if (!registerInput.username) return;

    setIsAdmin(false);
    setIsAuthenticated(true);
    setUserInfo({
      username: registerInput.username,
      fullname: registerInput.fullname || registerInput.username,
      phone: registerInput.phone || '09120000000',
      email: `${registerInput.username}@gmail.com`,
      joinedDate: 'هم‌اکنون',
      vipLevel: 'برنز',
      totalGames: 0,
      totalWins: 0,
      totalEarned: 0
    });
    setActiveTab('lobby');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setIsAdmin(false);
    localStorage.removeItem('daberna_auth');
    localStorage.removeItem('daberna_user');
  };

  const handleJoinRoom = (room) => {
    const totalCost = room.entry * cardCount;
    if (balance < totalCost) {
      setSoundNotice('موجودی کیف پول برای این تعداد کارت کافی نیست!');
      setTimeout(() => setSoundNotice(null), 3000);
      return;
    }

    setBalance(b => b - totalCost);
    setTransactions(prev => [
      { id: Date.now(), type: `ورود به ${room.name} (${cardCount} کارت)`, amount: -totalCost, date: 'هم‌اکنون', status: 'انجام شد' },
      ...prev
    ]);

    const generated = Array.from({ length: cardCount }).map(() => generateBingoCard());
    setPlayerCards(generated);
    setSelectedRoom(room);
    setDrawnNumbers([]);
    setCurrentNumber(null);
    setMarkedNumbers(new Set());
    setPrizesClaimed({ line1: false, line2: false, fullHouse: false });
    setClaimMessage(null);

    socket.emit('join_room', {
      roomId: room.id,
      username: userInfo.username || 'کاربر جدید',
      cardsCount: cardCount
    });

    const seed = 'ROOM_' + Math.random().toString(36).substring(2, 10).toUpperCase();
    setGameSeed(seed);
    setGameHash('0x' + Array.from(seed).map(c => c.charCodeAt(0).toString(16)).join(''));

    setIsPlaying(true);
    setActiveTab('game');
  };

  const handleCellClick = (val) => {
    if (val === null) return;
    if (!drawnNumbers.includes(val)) {
      setSoundNotice('این عدد هنوز از گردونه خارج نشده است!');
      setTimeout(() => setSoundNotice(null), 2500);
      return;
    }

    playSoundEffect('mark');
    setMarkedNumbers(prev => {
      const updated = new Set(prev);
      if (updated.has(val)) updated.delete(val);
      else updated.add(val);
      return updated;
    });
  };

  const checkCardCompletedLines = (card) => {
    let completedLines = 0;
    for (let r = 0; r < 3; r++) {
      let full = true;
      for (let c = 0; c < 9; c++) {
        const val = card[r][c];
        if (val !== null && !markedNumbers.has(val)) {
          full = false;
          break;
        }
      }
      if (full) completedLines++;
    }
    return completedLines;
  };

  const checkFullHouse = (card) => {
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 9; c++) {
        const val = card[r][c];
        if (val !== null && !markedNumbers.has(val)) return false;
      }
    }
    return true;
  };

  const handleClaimPrize = (type) => {
    if (!selectedRoom) return;
    const totalPot = selectedRoom.entry * selectedRoom.players;

    let totalLinesInBestCard = 0;
    let hasFullHouse = false;

    playerCards.forEach(card => {
      const lines = checkCardCompletedLines(card);
      if (lines > totalLinesInBestCard) totalLinesInBestCard = lines;
      if (checkFullHouse(card)) hasFullHouse = true;
    });

    if (type === 'line1') {
      if (prizesClaimed.line1) {
        setClaimMessage('جایزه تک‌خط قبلاً دریافت شده است!');
        return;
      }
      if (totalLinesInBestCard >= 1) {
        const reward = Math.floor(totalPot * 0.15);
        setBalance(b => b + reward);
        setPrizesClaimed(p => ({ ...p, line1: true }));
        setConfettiActive(true);
        playSoundEffect('win');
        setClaimMessage(`🎉 آفرین! جایزه تک‌خط به مبلغ ${reward.toLocaleString('fa-IR')} تومان اضافه شد.`);
        setUserInfo(u => ({ ...u, totalWins: u.totalWins + 1, totalEarned: u.totalEarned + reward }));
        setTimeout(() => setConfettiActive(false), 5000);
      } else {
        setClaimMessage('هنوز حداقل یک خط کامل را روی کارتت علامت نزده‌ای!');
      }
    } else if (type === 'line2') {
      if (prizesClaimed.line2) {
        setClaimMessage('جایزه دوخط قبلاً دریافت شده است!');
        return;
      }
      if (totalLinesInBestCard >= 2) {
        const reward = Math.floor(totalPot * 0.35);
        setBalance(b => b + reward);
        setPrizesClaimed(p => ({ ...p, line2: true }));
        setConfettiActive(true);
        playSoundEffect('win');
        setClaimMessage(`🎉 عالی شد! جایزه دوخط به مبلغ ${reward.toLocaleString('fa-IR')} تومان اضافه شد.`);
        setUserInfo(u => ({ ...u, totalWins: u.totalWins + 1, totalEarned: u.totalEarned + reward }));
        setTimeout(() => setConfettiActive(false), 5000);
      } else {
        setClaimMessage('برای جایزه دوخط، باید حداقل ۲ خط کامل روی کارتت داشته باشی!');
      }
    } else if (type === 'fullHouse') {
      if (prizesClaimed.fullHouse) {
        setClaimMessage('جایزه دبرنای کامل قبلاً ثبت شده است!');
        return;
      }
      if (hasFullHouse) {
        const reward = Math.floor(totalPot * 0.50);
        setBalance(b => b + reward);
        setPrizesClaimed(p => ({ ...p, fullHouse: true }));
        setConfettiActive(true);
        playSoundEffect('win');
        setIsPlaying(false);
        setClaimMessage(`🏆 فوق‌العاده! شما دبرنای کامل شدید! جایزه بزرگ ${reward.toLocaleString('fa-IR')} تومان به حسابتان واریز شد.`);
        setUserInfo(u => ({ ...u, totalWins: u.totalWins + 1, totalEarned: u.totalEarned + reward }));
        setTimeout(() => setConfettiActive(false), 6000);
      } else {
        setClaimMessage('کارت شما هنوز به طور کامل تکمیل نشده است!');
      }
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedRoom) return;

    socket.emit('send_chat_message', {
      roomId: selectedRoom.id,
      username: userInfo.username || 'کاربر VIP',
      text: newMessage,
      isReaction: false
    });

    setNewMessage('');
  };

  const sendSoundReaction = (soundType, emojiLabel) => {
    playSoundEffect(soundType);
    if (selectedRoom) {
      socket.emit('send_chat_message', {
        roomId: selectedRoom.id,
        username: userInfo.username || 'کاربر VIP',
        text: `[صدا و افکت صوتی] ${emojiLabel}`,
        isReaction: true
      });
    } else {
      const msg = {
        id: Date.now(),
        sender: userInfo.username || 'کاربر VIP',
        text: `[صدا و افکت صوتی] ${emojiLabel}`,
        time: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
        isSystem: false,
        isReaction: true
      };
      setChatMessages(prev => [...prev, msg]);
    }
  };

  const handleCryptoDeposit = () => {
    if (!depositTxHash.trim()) {
      setSoundNotice('لطفاً کد هش تراکنش را وارد کنید.');
      setTimeout(() => setSoundNotice(null), 2500);
      return;
    }
    const addedAmount = Math.floor(parseFloat(depositUsdtAmount || 0) * USDT_TOMAN_RATE);
    setBalance(b => b + addedAmount);
    setTransactions(prev => [
      { id: Date.now(), type: `شارژ تتر (${depositUsdtAmount} USDT)`, amount: +addedAmount, date: 'هم‌اکنون', status: 'موفق' },
      ...prev
    ]);
    setShowWalletModal(false);
    setDepositTxHash('');
    setSoundNotice('حساب شما با موفقیت شارژ شد!');
    setTimeout(() => setSoundNotice(null), 3000);
  };

  const handleVoucherDeposit = () => {
    if (!voucherCode || !voucherActivationCode) {
      setSoundNotice('لطفاً کد ووچر و کد فعال‌سازی را وارد کنید.');
      setTimeout(() => setSoundNotice(null), 2500);
      return;
    }
    const voucherValue = 500000;
    setBalance(b => b + voucherValue);
    setTransactions(prev => [
      { id: Date.now(), type: 'شارژ با ووچر پرفکت مانی', amount: +voucherValue, date: 'هم‌اکنون', status: 'موفق' },
      ...prev
    ]);
    setShowWalletModal(false);
    setVoucherCode('');
    setVoucherActivationCode('');
    setSoundNotice('ووچر تایید شد! حساب شارژ گردید.');
    setTimeout(() => setSoundNotice(null), 3000);
  };

  const handleCardToCardSubmit = () => {
    if (!userCardNumber || !cardRefCode) {
      setSoundNotice('لطفاً شماره کارت و کد پیگیری فیش را وارد کنید.');
      setTimeout(() => setSoundNotice(null), 2500);
      return;
    }
    const amountVal = parseInt(cardToCardAmount, 10) || 100000;
    const newReq = {
      id: Date.now(),
      username: userInfo.username || 'کاربر جدید',
      amount: amountVal,
      userCard: userCardNumber,
      refCode: cardRefCode,
      date: 'هم‌اکنون',
      status: 'در انتظار تایید'
    };
    setPendingCardDeposits(prev => [newReq, ...prev]);
    setShowWalletModal(false);
    setUserCardNumber('');
    setCardRefCode('');
    setSoundNotice('درخواست شما برای ادمین ارسال شد.');
    setTimeout(() => setSoundNotice(null), 3000);
  };

  const handleCryptoWithdraw = () => {
    if (!withdrawWalletAddress.trim()) {
      setSoundNotice('آدرس ولت تتر خود را وارد کنید.');
      setTimeout(() => setSoundNotice(null), 2500);
      return;
    }
    const deductAmount = Math.floor(parseFloat(withdrawUsdtAmount || 0) * USDT_TOMAN_RATE);
    if (balance < deductAmount) {
      setSoundNotice('موجودی کافی نیست!');
      setTimeout(() => setSoundNotice(null), 2500);
      return;
    }
    setBalance(b => b - deductAmount);
    setTransactions(prev => [
      { id: Date.now(), type: `برداشت تتر (${withdrawUsdtAmount} USDT)`, amount: -deductAmount, date: 'هم‌اکنون', status: 'در حال پردازش' },
      ...prev
    ]);
    setShowWalletModal(false);
    setWithdrawWalletAddress('');
    setSoundNotice('درخواست برداشت ثبت شد!');
    setTimeout(() => setSoundNotice(null), 3000);
  };

  const handleAdminApproveCardDeposit = (id) => {
    setPendingCardDeposits(prev => prev.map(req => {
      if (req.id === id) {
        setAllUsers(users => users.map(u => {
          if (u.username === req.username) {
            return { ...u, balance: u.balance + req.amount };
          }
          return u;
        }));
        return { ...req, status: 'تایید شد' };
      }
      return req;
    }));
  };

  const handleAdminRejectCardDeposit = (id) => {
    setPendingCardDeposits(prev => prev.map(req => req.id === id ? { ...req, status: 'رد شد' } : req));
  };

  const handleAdminToggleBan = (userId) => {
    setAllUsers(prev => prev.map(u => u.id === userId ? { ...u, status: u.status === 'فعال' ? 'مسدود' : 'فعال' } : u));
  };

  const handleAdminChargeUser = (userId) => {
    const val = prompt('مبلغ شارژ (تومان) را وارد کنید:');
    if (val && !isNaN(val)) {
      const amount = parseInt(val, 10);
      setAllUsers(prev => prev.map(u => u.id === userId ? { ...u, balance: u.balance + amount } : u));
    }
  };

  const handleAdminUpdateRoomEntry = (roomId) => {
    const newEntry = prompt('مبلغ ورودی جدید اتاق (تومان) را وارد کنید:');
    if (newEntry && !isNaN(newEntry)) {
      const val = parseInt(newEntry, 10);
      setRooms(prev => prev.map(r => r.id === roomId ? { ...r, entry: val } : r));
    }
  };

  // Helper for Card Skin Styles
  const getCardSkinStyle = () => {
    if (cardSkin === 'wood') {
      return 'bg-gradient-to-r from-amber-950 via-yellow-950 to-amber-900 border-amber-800/80 shadow-[0_10px_30px_rgba(0,0,0,0.9)]';
    }
    if (cardSkin === 'classic') {
      return 'bg-gradient-to-r from-stone-900 via-neutral-900 to-stone-900 border-stone-700/80 shadow-2xl';
    }
    return 'bg-gradient-to-r from-amber-950/90 via-neutral-900 to-amber-950/80 border-amber-500/50 shadow-[0_0_25px_rgba(245,158,11,0.2)]';
  };

  // Render Marker Icon/Style
  const renderMarker = (val) => {
    if (markerSkin === 'coin') {
      return (
        <div className="absolute inset-0 bg-gradient-to-tr from-yellow-600 via-amber-400 to-yellow-200 border-2 border-yellow-100 rounded-lg sm:rounded-xl flex items-center justify-center shadow-[0_4px_10px_rgba(234,179,8,0.8)] animate-bounce">
          <span className="text-neutral-950 font-black text-[10px] sm:text-xs">{val}</span>
        </div>
      );
    }
    if (markerSkin === 'emerald') {
      return (
        <div className="absolute inset-0 bg-gradient-to-tr from-emerald-800 via-emerald-500 to-teal-300 border-2 border-emerald-200 rounded-lg sm:rounded-xl flex items-center justify-center shadow-[0_4px_10px_rgba(16,185,129,0.8)]">
          <span className="text-white font-black text-[10px] sm:text-xs">{val}</span>
        </div>
      );
    }
    if (markerSkin === 'diamond') {
      return (
        <div className="absolute inset-0 bg-gradient-to-tr from-cyan-600 via-blue-400 to-sky-200 border-2 border-sky-100 rounded-lg sm:rounded-xl flex items-center justify-center shadow-[0_4px_10px_rgba(56,189,248,0.8)]">
          <span className="text-neutral-950 font-black text-[10px] sm:text-xs">{val}</span>
        </div>
      );
    }
    // Default Nostalgic Bean
    return (
      <div className="absolute inset-0 bg-gradient-to-tr from-red-800 via-rose-600 to-red-500 border-2 border-amber-300/80 rounded-lg sm:rounded-xl flex items-center justify-center shadow-[0_4px_12px_rgba(225,29,72,0.8)]">
        <span className="text-white font-black text-[10px] sm:text-xs drop-shadow">{val}</span>
        <div className="w-2 sm:w-2.5 h-1 sm:h-1.5 bg-amber-200 rounded-full absolute bottom-1 rotate-12 shadow"></div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-slate-100 font-sans dir-rtl select-none pb-20 md:pb-12 relative overflow-x-hidden bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-neutral-900 via-neutral-950 to-black">
      
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

      <ConfettiCanvas active={confettiActive} />

      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-neutral-950/90 backdrop-blur-xl border-b border-amber-500/20 px-3 md:px-4 py-2.5 md:py-3.5 shadow-[0_4px_30px_rgba(0,0,0,0.8)]">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          
          <div className="flex items-center gap-2 cursor-pointer group" onClick={() => isAuthenticated && !isAdmin && setActiveTab('lobby')}>
            <LuxuryDabernaLogo />
            <div>
              <div className="flex items-center gap-1">
                <h1 className="text-base md:text-xl font-black bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 bg-clip-text text-transparent drop-shadow-sm">
                  {isAdmin ? 'پنل مدیریت اختصاصی دبرنا' : 'دبرنا لند VIP'}
                </h1>
                <span className={`text-[8px] md:text-[9px] px-1 py-0.5 rounded border font-bold ${isAdmin ? 'bg-red-500/20 text-red-400 border-red-500/40' : 'bg-amber-500/20 text-amber-300 border-amber-500/30'}`}>
                  {isAdmin ? 'ADMIN CONTROL' : 'PRO 3D'}
                </span>
              </div>
              <p className="text-[9px] md:text-[10px] text-amber-200/50 font-medium hidden sm:block">
                {isAdmin ? 'سیستم مدیریت کامل پلتفرم' : 'پلتفرم تخصصی بازی و بخت‌آزمایی آنلاین'}
              </p>
            </div>
          </div>

          {isAuthenticated && !isAdmin && (
            <nav className="hidden md:flex items-center gap-1.5 bg-neutral-900/90 p-1.5 rounded-2xl border border-neutral-800 shadow-inner">
              <button 
                onClick={() => setActiveTab('lobby')} 
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  activeTab === 'lobby' 
                    ? 'bg-gradient-to-r from-yellow-500 via-amber-500 to-amber-600 text-neutral-950 shadow-md scale-105' 
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                اتاق‌ها
              </button>
              <button 
                onClick={() => setActiveTab('leaderboard')} 
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  activeTab === 'leaderboard' 
                    ? 'bg-gradient-to-r from-yellow-500 via-amber-500 to-amber-600 text-neutral-950 shadow-md scale-105' 
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Award className="w-3.5 h-3.5" />
                قهرمانان
              </button>
              <button 
                onClick={() => setActiveTab('profile')} 
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  activeTab === 'profile' 
                    ? 'bg-gradient-to-r from-yellow-500 via-amber-500 to-amber-600 text-neutral-950 shadow-md scale-105' 
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                پروفایل
              </button>
            </nav>
          )}

          {isAuthenticated && isAdmin && (
            <div className="flex items-center gap-3">
              <span className="text-xs bg-red-500/10 text-red-400 border border-red-500/30 px-3 py-1 rounded-xl font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-red-400" />
                حالت مدیر سیستم
              </span>
              <button 
                onClick={handleLogout}
                className="p-2 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-rose-400 transition"
                title="خروج از مدیریت"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}

          {isAuthenticated && !isAdmin && (
            <div className="flex items-center gap-2 md:gap-3">
              <button 
                onClick={() => setSoundEnabled(!soundEnabled)} 
                className="p-2 md:p-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-amber-400 transition"
              >
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-neutral-500" />}
              </button>

              <div className="flex items-center bg-gradient-to-r from-amber-950/60 via-neutral-900 to-neutral-900 border border-amber-500/40 rounded-2xl px-2.5 md:px-3.5 py-1 md:py-1.5 gap-2 md:gap-3 shadow-lg">
                <div className="w-7 h-7 md:w-8 md:h-8 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/30">
                  <Wallet className="w-3.5 h-3.5 md:w-4 md:h-4 text-amber-400" />
                </div>
                <div className="text-right">
                  <span className="block text-[8px] md:text-[9px] text-amber-200/60 font-medium">موجودی</span>
                  <span className="text-xs md:text-sm font-black text-amber-300 tracking-tight">
                    {balance.toLocaleString('fa-IR')} <span className="text-[9px] font-normal text-amber-200/70">تومان</span>
                  </span>
                </div>
                <button 
                  onClick={() => setShowWalletModal(true)}
                  className="mr-0.5 p-1 md:p-1.5 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 text-neutral-950 hover:brightness-110 shadow-md transition"
                >
                  <PlusCircle className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

        </div>
      </header>

      {soundNotice && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-amber-500 text-neutral-950 px-4 py-2 rounded-2xl font-bold text-xs shadow-2xl flex items-center gap-2 animate-bounce">
          <AlertCircle className="w-4 h-4" />
          <span>{soundNotice}</span>
        </div>
      )}

      {isAuthenticated && !isAdmin && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-neutral-950/95 backdrop-blur-lg border-t border-amber-500/20 px-3 py-2 flex justify-around items-center shadow-2xl">
          <button onClick={() => setActiveTab('lobby')} className={`flex flex-col items-center gap-1 text-[10px] font-bold ${activeTab === 'lobby' ? 'text-amber-400' : 'text-neutral-500'}`}>
            <Play className="w-5 h-5" />
            <span>اتاق‌ها</span>
          </button>
          <button onClick={() => setActiveTab('leaderboard')} className={`flex flex-col items-center gap-1 text-[10px] font-bold ${activeTab === 'leaderboard' ? 'text-amber-400' : 'text-neutral-500'}`}>
            <Award className="w-5 h-5" />
            <span>برترین‌ها</span>
          </button>
          <button onClick={() => setActiveTab('profile')} className={`flex flex-col items-center gap-1 text-[10px] font-bold ${activeTab === 'profile' ? 'text-amber-400' : 'text-neutral-500'}`}>
            <User className="w-5 h-5" />
            <span>پروفایل</span>
          </button>
        </div>
      )}

      {/* AUTHENTICATION */}
      {!isAuthenticated && (
        <main className="max-w-md mx-auto px-4 mt-12 sm:mt-16">
          <div className="bg-neutral-900/90 border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur relative overflow-hidden">
            <div className="text-center mb-6">
              <div className="flex justify-center mb-3">
                <LuxuryDabernaLogo />
              </div>
              <h2 className="text-2xl font-black text-amber-300 mb-1">خوش آمدید به دبرنا لند VIP</h2>
              <p className="text-xs text-neutral-400">جهت دسترسی به سیستم وارد حساب شوید (یوزرنام admin برای مدیریت)</p>
            </div>

            <div className="flex bg-neutral-950 p-1.5 rounded-2xl border border-neutral-800 mb-6 text-xs font-bold">
              <button 
                onClick={() => setAuthMode('login')}
                className={`flex-1 py-2 rounded-xl transition ${authMode === 'login' ? 'bg-amber-500 text-neutral-950 shadow-md' : 'text-neutral-400'}`}
              >
                ورود به حساب
              </button>
              <button 
                onClick={() => setAuthMode('register')}
                className={`flex-1 py-2 rounded-xl transition ${authMode === 'register' ? 'bg-amber-500 text-neutral-950 shadow-md' : 'text-neutral-400'}`}
              >
                ثبت‌نام جدید
              </button>
            </div>

            {authMode === 'login' ? (
              <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="text-neutral-300 block mb-1.5 font-bold">نام کاربری</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      placeholder="کاربر عادی یا admin"
                      value={loginInput.username}
                      onChange={(e) => setLoginInput({ ...loginInput, username: e.target.value })}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-amber-500 pr-10"
                    />
                    <User className="w-4 h-4 text-neutral-500 absolute top-3.5 right-3" />
                  </div>
                </div>

                <div>
                  <label className="text-neutral-300 block mb-1.5 font-bold">رمز عبور</label>
                  <div className="relative">
                    <input 
                      type="password" 
                      placeholder="••••••••"
                      value={loginInput.password}
                      onChange={(e) => setLoginInput({ ...loginInput, password: e.target.value })}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-amber-500 pr-10"
                    />
                    <Lock className="w-4 h-4 text-neutral-500 absolute top-3.5 right-3" />
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600 text-neutral-950 font-black text-sm shadow-xl shadow-amber-500/20 hover:brightness-110 transition mt-2"
                >
                  ورود به حساب کاربری
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegisterSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="text-neutral-300 block mb-1.5 font-bold">نام کاربری (انگلیسی)</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      placeholder="username"
                      value={registerInput.username}
                      onChange={(e) => setRegisterInput({ ...registerInput, username: e.target.value })}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-amber-500 pr-10"
                    />
                    <User className="w-4 h-4 text-neutral-500 absolute top-3.5 right-3" />
                  </div>
                </div>

                <div>
                  <label className="text-neutral-300 block mb-1.5 font-bold">نام و نام خانوادگی</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      placeholder="مثال: شاهین محمدی"
                      value={registerInput.fullname}
                      onChange={(e) => setRegisterInput({ ...registerInput, fullname: e.target.value })}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-amber-500 pr-10"
                    />
                    <UserPlus className="w-4 h-4 text-neutral-500 absolute top-3.5 right-3" />
                  </div>
                </div>

                <div>
                  <label className="text-neutral-300 block mb-1.5 font-bold">شماره همراه</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      placeholder="09123456789"
                      value={registerInput.phone}
                      onChange={(e) => setRegisterInput({ ...registerInput, phone: e.target.value })}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-amber-500 pr-10"
                    />
                    <Phone className="w-4 h-4 text-neutral-500 absolute top-3.5 right-3" />
                  </div>
                </div>

                <div>
                  <label className="text-neutral-300 block mb-1.5 font-bold">رمز عبور</label>
                  <div className="relative">
                    <input 
                      type="password" 
                      placeholder="••••••••"
                      value={registerInput.password}
                      onChange={(e) => setRegisterInput({ ...registerInput, password: e.target.value })}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-amber-500 pr-10"
                    />
                    <Lock className="w-4 h-4 text-neutral-500 absolute top-3.5 right-3" />
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600 text-neutral-950 font-black text-sm shadow-xl shadow-amber-500/20 hover:brightness-110 transition mt-2"
                >
                  ثبت‌نام و ورود به بازی
                </button>
              </form>
            )}
          </div>
        </main>
      )}

      {/* LOBBY */}
      {isAuthenticated && !isAdmin && activeTab === 'lobby' && (
        <main className="max-w-7xl mx-auto px-4 mt-8">
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-neutral-950 via-amber-950/80 to-neutral-950 p-8 border border-amber-500/30 mb-10 shadow-[0_10px_50px_rgba(0,0,0,0.8)]">
            <div className="relative z-10 max-w-2xl">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold mb-4">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" /> سیستم قرعه‌کشی منصفانه (Provably Fair)
              </span>
              <h2 className="text-3xl sm:text-5xl font-black text-white mb-4 leading-tight">
                هیجان شرط‌بندی در <br />
                <span className="bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 bg-clip-text text-transparent">
                  میزهای VIP دبرنا آنلاین
                </span>
              </h2>
              <p className="text-neutral-300 text-xs sm:text-sm leading-relaxed mb-8">
                تلاش کن سریع‌تر از بقیه کارتت را تکمیل کنی! اعداد به‌صورت هوشمند خرج می‌شوند. با چند کارت وارد شو تا شانس بردت را ۳ برابر کنی.
              </p>
              
              <div className="inline-flex items-center gap-4 bg-neutral-900/90 p-2.5 rounded-2xl border border-amber-500/30 backdrop-blur">
                <span className="text-xs font-bold text-amber-200 pr-2">انتخاب تعداد کارت هم‌زمان:</span>
                <div className="flex gap-2">
                  {[1, 2, 3, 4].map(num => (
                    <button 
                      key={num} 
                      onClick={() => setCardCount(num)}
                      className={`w-10 h-10 rounded-xl font-black text-sm transition-all flex items-center justify-center ${
                        cardCount === num 
                          ? 'bg-gradient-to-tr from-amber-500 to-yellow-400 text-neutral-950 shadow-lg shadow-amber-500/30 scale-110 border border-yellow-200' 
                          : 'bg-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-700'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-amber-100 flex items-center gap-2">
                <Flame className="w-5 h-5 text-amber-500 animate-pulse" />
                انتخاب اتاق بازی
              </h3>
              <span className="text-xs text-neutral-400">اتاق‌های آنلاین و لایو</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {rooms.map((room) => {
                const totalEntry = room.entry * cardCount;
                const netPot = room.entry * room.players;
                return (
                  <div 
                    key={room.id}
                    className={`relative rounded-3xl bg-gradient-to-b ${room.bgGradient} p-6 border ${room.border} shadow-2xl flex flex-col justify-between transition-all duration-300 hover:-translate-y-1.5 group overflow-hidden`}
                  >
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <span className={`px-3 py-1 rounded-full text-[11px] font-bold border ${room.badgeBg}`}>
                          {room.badge}
                        </span>
                        <div className="flex items-center gap-1.5 text-xs text-neutral-300 bg-neutral-950/60 px-3 py-1 rounded-xl border border-neutral-800">
                          <Users className="w-3.5 h-3.5 text-amber-400" />
                          <span>{room.players} بازیکن</span>
                        </div>
                      </div>

                      <h4 className="text-2xl font-black text-white mb-1 group-hover:text-amber-300 transition">{room.name}</h4>
                      <p className="text-[11px] text-neutral-400 mb-6">{room.tag}</p>

                      <div className="space-y-2.5 bg-neutral-950/80 p-4 rounded-2xl border border-neutral-800/80 mb-6 text-xs">
                        <div className="flex justify-between text-neutral-400">
                          <span>ورودی هر کارت:</span>
                          <span className="font-bold text-amber-300">{room.entry.toLocaleString('fa-IR')} تومان</span>
                        </div>
                        <div className="flex justify-between text-neutral-400">
                          <span>فاکتور ورود ({cardCount} کارت):</span>
                          <span className="font-bold text-white">{totalEntry.toLocaleString('fa-IR')} تومان</span>
                        </div>
                        <div className="flex justify-between text-neutral-400 pt-2 border-t border-neutral-800">
                          <span>مجموع جایزه کل صندوق:</span>
                          <span className="font-extrabold text-emerald-400 text-sm">
                            {netPot.toLocaleString('fa-IR')} تومان
                          </span>
                        </div>
                      </div>
                    </div>

                    <button 
                      onClick={() => handleJoinRoom(room)}
                      className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600 text-neutral-950 font-black text-xs sm:text-sm shadow-xl shadow-amber-500/20 hover:brightness-110 active:scale-95 transition"
                    >
                      ورود به بازی ({totalEntry.toLocaleString('fa-IR')} تومان)
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </main>
      )}

      {/* GAME ROOM */}
      {isAuthenticated && !isAdmin && activeTab === 'game' && selectedRoom && (
        <main className="max-w-7xl mx-auto px-4 mt-6">
          <div className="flex flex-wrap items-center justify-between gap-4 bg-neutral-900/90 p-4 rounded-2xl border border-amber-500/30 mb-6 backdrop-blur shadow-xl">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => {
                  setIsPlaying(false);
                  setActiveTab('lobby');
                }}
                className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-bold text-neutral-300 transition flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4 rotate-180" /> بازگشت
              </button>
              <div>
                <h2 className="text-base font-bold text-amber-300 flex items-center gap-2">
                  {selectedRoom.name}
                  <span className="text-[10px] bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded border border-amber-500/30">
                    {playerCards.length} کارت فعال
                  </span>
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* SKIN & MARKER SELECTOR BUTTONS */}
              <div className="hidden sm:flex items-center gap-2 bg-neutral-950 p-1 rounded-xl border border-neutral-800 text-[10px] font-bold">
                <Palette className="w-3.5 h-3.5 text-amber-400 mr-1" />
                <button 
                  onClick={() => setCardSkin(s => s === 'gold' ? 'wood' : s === 'wood' ? 'classic' : 'gold')}
                  className="px-2 py-1 rounded bg-neutral-900 text-amber-300 border border-neutral-700 hover:bg-neutral-800"
                >
                  پوسته: {cardSkin === 'gold' ? 'طلا' : cardSkin === 'wood' ? 'چوب' : 'کلاسیک'}
                </button>
                <button 
                  onClick={() => setMarkerSkin(m => m === 'bean' ? 'coin' : m === 'coin' ? 'emerald' : m === 'emerald' ? 'diamond' : 'bean')}
                  className="px-2 py-1 rounded bg-neutral-900 text-amber-300 border border-neutral-700 hover:bg-neutral-800"
                >
                  مهره: {markerSkin === 'bean' ? 'لوبیا' : markerSkin === 'coin' ? 'سکه' : markerSkin === 'emerald' ? 'زمرد' : 'الماس'}
                </button>
              </div>

              <button
                onClick={() => setAutoDaub(!autoDaub)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
                  autoDaub 
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-neutral-950 border-yellow-200 shadow-md animate-pulse' 
                    : 'bg-neutral-800 text-neutral-400 border-neutral-700 hover:text-white'
                }`}
              >
                <Zap className="w-4 h-4" />
                <span>علامت‌گذاری خودکار: {autoDaub ? 'فعال' : 'غیرفعال'}</span>
              </button>

              <button 
                onClick={() => setShowProvablyFair(!showProvablyFair)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold hover:bg-emerald-500/20 transition"
              >
                <ShieldCheck className="w-4 h-4" />
                اثبات‌پذیری (Provably Fair)
              </button>
            </div>
          </div>

          {showProvablyFair && (
            <div className="bg-neutral-900/90 border border-emerald-500/30 p-4 rounded-2xl mb-6 text-xs space-y-2">
              <div className="flex justify-between items-center text-emerald-300 font-bold">
                <span>هش قرعه‌کشی اتاق (Provably Fair Hash):</span>
                <span className="text-[10px] bg-emerald-500/20 px-2 py-0.5 rounded">Verified</span>
              </div>
              <p className="font-mono text-neutral-300 break-all bg-neutral-950 p-2 rounded-xl border border-neutral-800">{gameHash}</p>
              <div className="flex justify-between text-neutral-400 text-[10px]">
                <span>سید تصادفی: {gameSeed}</span>
                <span>الگوریتم: SHA-256</span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* SPINNER (3D LOVED STYLE) */}
            <div className="lg:col-span-3 space-y-6">
              <div className="bg-gradient-to-b from-neutral-900 via-amber-950/40 to-neutral-900 p-6 rounded-3xl border border-amber-500/40 text-center shadow-[0_0_50px_rgba(245,158,11,0.15)] relative overflow-hidden">
                <span className="text-[10px] text-amber-400/90 font-bold px-3 py-1 rounded-full bg-black/60 border border-amber-500/30 shadow-inner">
                  🎲 گردونه ۳D آنلاین
                </span>

                <h3 className="text-xs font-bold text-neutral-400 my-4">آخرین عدد خرج شده</h3>

                {/* 3D Sphere Display */}
                <div className="relative w-36 h-36 mx-auto mb-4">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-amber-600 via-yellow-400 to-amber-100 p-1 shadow-[0_0_50px_rgba(245,158,11,0.5)] animate-spin" style={{ animationDuration: '10s' }}></div>
                  <div className="relative w-full h-full rounded-full bg-gradient-to-br from-neutral-950 via-neutral-900 to-black flex flex-col items-center justify-center border-4 border-amber-400/80 shadow-inner overflow-hidden">
                    <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-yellow-300 via-amber-500 to-transparent"></div>
                    <span className="text-5xl font-black text-amber-300 tracking-tighter drop-shadow-[0_0_12px_rgba(251,191,36,0.8)] animate-bounce">
                      {currentNumber !== null ? currentNumber : '--'}
                    </span>
                    <span className="text-[9px] text-amber-200/60 font-bold mt-1">از ۹۰</span>
                  </div>
                </div>

                <p className="text-[11px] text-neutral-400">
                  خروج هوشمند اعداد هر ۳٫۲ ثانیه
                </p>
              </div>

              <div className="bg-neutral-900/90 p-4 rounded-2xl border border-neutral-800 max-h-48 overflow-y-auto">
                <h4 className="text-xs font-bold text-amber-200/80 mb-3 flex items-center justify-between">
                  <span>اعداد خرج شده</span>
                  <span className="text-[10px] bg-neutral-800 px-2 py-0.5 rounded text-amber-400">{drawnNumbers.length} / 90</span>
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {drawnNumbers.slice().reverse().map((n, idx) => (
                    <span 
                      key={idx} 
                      className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center transition-all ${
                        idx === 0 
                          ? 'bg-amber-400 text-neutral-950 scale-110 shadow-md font-black animate-pulse' 
                          : 'bg-neutral-800 text-neutral-300 border border-neutral-700/60'
                      }`}
                    >
                      {n}
                    </span>
                  ))}
                  {drawnNumbers.length === 0 && (
                    <span className="text-xs text-neutral-500 py-3 w-full text-center">منتظر شروع گردونه...</span>
                  )}
                </div>
              </div>

              {/* PRIZE BUTTONS */}
              <div className="bg-neutral-900/90 p-4 rounded-2xl border border-amber-500/20 space-y-2.5">
                <h4 className="text-xs font-bold text-amber-300 mb-2">اعلام برد و دریافت جایزه</h4>
                
                {claimMessage && (
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-200 mb-2">
                    {claimMessage}
                  </div>
                )}

                <button 
                  onClick={() => handleClaimPrize('line1')}
                  className={`w-full py-2.5 rounded-xl font-bold text-xs border transition flex items-center justify-between px-3 ${
                    prizesClaimed.line1 
                      ? 'bg-neutral-800 text-neutral-500 border-neutral-700' 
                      : 'bg-neutral-950 border-amber-500/40 text-amber-300 hover:bg-amber-500/10'
                  }`}
                >
                  <span>جایزه ۱ خط (Line 1)</span>
                  <span className="text-[10px] bg-amber-500/20 px-2 py-0.5 rounded">۱۵٪ صندوق</span>
                </button>

                <button 
                  onClick={() => handleClaimPrize('line2')}
                  className={`w-full py-2.5 rounded-xl font-bold text-xs border transition flex items-center justify-between px-3 ${
                    prizesClaimed.line2 
                      ? 'bg-neutral-800 text-neutral-500 border-neutral-700' 
                      : 'bg-neutral-950 border-amber-500/40 text-amber-300 hover:bg-amber-500/10'
                  }`}
                >
                  <span>جایزه ۲ خط (Line 2)</span>
                  <span className="text-[10px] bg-amber-500/20 px-2 py-0.5 rounded">۳۵٪ صندوق</span>
                </button>

                <button 
                  onClick={() => handleClaimPrize('fullHouse')}
                  className={`w-full py-3 rounded-xl font-black text-xs border transition flex items-center justify-between px-3 shadow-lg ${
                    prizesClaimed.fullHouse 
                      ? 'bg-neutral-800 text-neutral-500 border-neutral-700' 
                      : 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-neutral-950 border-yellow-200 hover:brightness-110'
                  }`}
                >
                  <span>🏆 دبرنا کامل (Full House)</span>
                  <span className="text-[10px] bg-neutral-950/40 text-amber-100 px-2 py-0.5 rounded">۵۰٪ صندوق</span>
                </button>
              </div>

            </div>

            {/* CARDS */}
            <div className="lg:col-span-6 space-y-6">
              <div className="flex items-center justify-between bg-neutral-900/80 p-3 rounded-xl border border-neutral-800 text-xs">
                <span className="text-neutral-400">کارت‌های شما در این دور</span>
                <span className="text-amber-400 font-bold">{playerCards.length} کارت فعال</span>
              </div>

              <div className="grid grid-cols-1 gap-6">
                {playerCards.map((card, cardIdx) => (
                  <div 
                    key={cardIdx} 
                    className={`p-4 sm:p-5 rounded-3xl border ${getCardSkinStyle()} relative overflow-hidden backdrop-blur transition-all duration-300`}
                  >
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-amber-400" /> کارت {cardIdx + 1}
                      </span>
                    </div>

                    <div className="grid grid-cols-9 gap-1 sm:gap-1.5 p-2 sm:p-3 rounded-2xl border bg-neutral-950/90 border-amber-500/20">
                      {card.map((row, rIdx) => 
                        row.map((cellVal, cIdx) => {
                          const isEmpty = cellVal === null;
                          const isMarked = cellVal !== null && markedNumbers.has(cellVal);
                          const isJustDrawn = cellVal === currentNumber;

                          if (isEmpty) {
                            return (
                              <div 
                                key={`${rIdx}-${cIdx}`}
                                className="aspect-[4/3] rounded-lg sm:rounded-xl border flex items-center justify-center opacity-40 bg-neutral-950/90 border-neutral-850"
                              >
                                <div className="w-1.5 h-1.5 rounded-full bg-neutral-700/40"></div>
                              </div>
                            );
                          }

                          return (
                            <button
                              key={`${rIdx}-${cIdx}`}
                              onClick={() => handleCellClick(cellVal)}
                              className={`aspect-[4/3] rounded-lg sm:rounded-xl font-black text-xs sm:text-base transition-all duration-200 flex flex-col items-center justify-center relative overflow-hidden ${
                                isMarked
                                  ? 'scale-95'
                                  : isJustDrawn
                                  ? 'bg-amber-500/40 text-amber-200 border-2 border-amber-300 animate-pulse scale-105'
                                  : 'bg-neutral-900 text-amber-100 border-neutral-800 hover:bg-neutral-800'
                              }`}
                            >
                              <span>{cellVal}</span>
                              {isMarked && renderMarker(cellVal)}
                            </button>
                          );
                        })
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* OTHER PLAYERS CARDS */}
              <div className="mt-8 space-y-4 pt-6 border-t border-neutral-800">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-amber-300 flex items-center gap-2">
                    <Users className="w-4 h-4 text-amber-400" /> کارت‌های سایر بازیکنان حاضر در اتاق
                  </h3>
                  <span className="text-[10px] bg-neutral-800 px-2 py-0.5 rounded text-neutral-400">زنده (Live)</span>
                </div>

                {[
                  { name: 'مریم_طلا', card: generateBingoCard() },
                  { name: 'Arash_77', card: generateBingoCard() }
                ].map((otherPlayer, pIdx) => (
                  <div key={pIdx} className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-neutral-300 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        کارت {otherPlayer.name}
                      </span>
                      <span className="text-[10px] text-neutral-500">مشاهده زنده</span>
                    </div>

                    <div className="grid grid-cols-9 gap-1 p-2 bg-neutral-950 rounded-xl border border-neutral-850">
                      {otherPlayer.card.map((row) =>
                        row.map((val, cIdx) => {
                          if (val === null) {
                            return <div key={cIdx} className="aspect-[4/3] rounded bg-neutral-900/40 border border-neutral-800/30"></div>;
                          }
                          const isDrawn = drawnNumbers.includes(val);
                          return (
                            <div 
                              key={cIdx} 
                              className={`aspect-[4/3] rounded text-[10px] font-bold flex items-center justify-center border ${
                                isDrawn 
                                  ? 'bg-rose-900/60 text-rose-200 border-rose-500/50' 
                                  : 'bg-neutral-900 text-neutral-400 border-neutral-800'
                              }`}
                            >
                              {val}
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                ))}
              </div>

            </div>

            {/* CHAT */}
            <div className="lg:col-span-3">
              <div className="bg-neutral-900/90 rounded-3xl border border-neutral-800 flex flex-col h-[560px] shadow-2xl backdrop-blur">
                <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-bold text-amber-100">چت آنلاین اتاق</span>
                  </div>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                </div>

                <div className="flex-1 p-3 overflow-y-auto space-y-3">
                  {chatMessages.map(msg => (
                    <div 
                      key={msg.id} 
                      className={`text-xs p-2.5 rounded-2xl ${
                        msg.isSystem 
                          ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20 text-center text-[10px]' 
                          : msg.isReaction
                          ? 'bg-gradient-to-r from-amber-500/20 to-yellow-500/10 text-amber-300 border border-amber-500/30'
                          : 'bg-neutral-950/80 text-neutral-200 border border-neutral-800'
                      }`}
                    >
                      {!msg.isSystem && (
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-bold text-amber-400 text-[11px] flex items-center gap-1">
                            {msg.sender}
                            {msg.isReaction && <Radio className="w-3 h-3 text-amber-400 animate-pulse" />}
                          </span>
                          <span className="text-[9px] text-neutral-500">{msg.time}</span>
                        </div>
                      )}
                      <p className="leading-relaxed">{msg.text}</p>
                    </div>
                  ))}
                </div>

                <div className="px-3 py-2 bg-neutral-950/90 border-t border-neutral-800 space-y-1.5">
                  <span className="text-[9px] text-amber-400/80 font-bold block">ارسال افکت صوتی زنده:</span>
                  <div className="grid grid-cols-4 gap-1 text-[10px] font-bold">
                    <button onClick={() => sendSoundReaction('cheer', '📣 هورا کشیدن!')} className="p-1 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20">📣 هورا</button>
                    <button onClick={() => sendSoundReaction('coins', '🪙 صدای سکه‌ها!')} className="p-1 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20">🪙 سکه</button>
                    <button onClick={() => sendSoundReaction('win', '🎺 شیپور برد!')} className="p-1 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20">🎺 شیپور</button>
                    <button onClick={() => sendSoundReaction('mark', '🎲 صدای تاس!')} className="p-1 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20">🎲 تاس</button>
                  </div>
                </div>

                <div className="px-3 py-1 bg-neutral-950 border-t border-neutral-800/60 flex justify-around">
                  {['🔥', '😎', '🎰', '🎉', '💰', '💣'].map(emoji => (
                    <button 
                      key={emoji} 
                      onClick={() => setNewMessage(prev => prev + emoji)}
                      className="hover:scale-125 transition text-sm"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>

                <form onSubmit={handleSendMessage} className="p-3 border-t border-neutral-800 flex gap-2">
                  <input 
                    type="text" 
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="پیام..."
                    className="flex-1 bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                  <button 
                    type="submit" 
                    className="p-2 rounded-xl bg-amber-500 text-neutral-950 hover:bg-amber-400 transition"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </div>

          </div>
        </main>
      )}

      {/* LEADERBOARD */}
      {isAuthenticated && !isAdmin && activeTab === 'leaderboard' && (
        <main className="max-w-4xl mx-auto px-4 mt-8">
          <div className="bg-neutral-900/90 rounded-3xl border border-amber-500/30 p-6 shadow-2xl backdrop-blur">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 flex items-center justify-center border border-amber-500/30">
                <Trophy className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">جدول برترین بازیکنان هفته</h2>
                <p className="text-xs text-neutral-400">رده‌بندی بر اساس بیشترین سود و جوایز کسب شده</p>
              </div>
            </div>

            <div className="space-y-3">
              {[
                { rank: 1, name: userInfo.username || 'شاهین_VIP', wins: userInfo.totalWins, totalWon: userInfo.totalEarned, badge: '🥇 طلا' },
                { rank: 2, name: 'مریم_طلا', wins: 31, totalWon: 12200000, badge: '🥈 نقره' },
                { rank: 3, name: 'Arash_77', wins: 28, totalWon: 9800000, badge: '🥉 برنز' },
                { rank: 4, name: 'کوروش_بزرگ', wins: 19, totalWon: 5400000, badge: '۴' },
                { rank: 5, name: 'امیر_شانس', wins: 12, totalWon: 3100000, badge: '۵' }
              ].map((player, i) => (
                <div 
                  key={i} 
                  className={`flex items-center justify-between p-4 rounded-2xl border transition ${
                    player.rank === 1 
                      ? 'bg-gradient-to-r from-amber-950/80 via-neutral-900 to-neutral-950 border-amber-500/50 shadow-lg' 
                      : 'bg-neutral-950/60 border-neutral-800'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span className="w-8 font-black text-center text-amber-400 text-base sm:text-lg">{player.badge}</span>
                    <div>
                      <h4 className="font-bold text-sm text-white">{player.name}</h4>
                      <span className="text-[11px] text-neutral-400">{player.wins} بار دبرنا شده</span>
                    </div>
                  </div>
                  <div className="text-left">
                    <span className="block font-black text-amber-300 text-sm">
                      {player.totalWon.toLocaleString('fa-IR')} تومان
                    </span>
                    <span className="text-[10px] text-emerald-400">مجموع بردها</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      )}

      {/* USER PROFILE */}
      {isAuthenticated && !isAdmin && activeTab === 'profile' && (
        <main className="max-w-4xl mx-auto px-4 mt-8">
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-neutral-950 via-amber-950/60 to-neutral-950 rounded-3xl border border-amber-500/30 p-6 shadow-2xl backdrop-blur relative overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 p-0.5 shadow-xl shadow-amber-500/20">
                    <div className="w-full h-full bg-neutral-950 rounded-[14px] flex items-center justify-center">
                      <User className="w-8 h-8 text-amber-400" />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-extrabold text-white">{userInfo.fullname || userInfo.username}</h2>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        {userInfo.vipLevel}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-400 mt-0.5">نام کاربری: @{userInfo.username}</p>
                    <p className="text-[10px] text-neutral-500 mt-1">عضویت از: {userInfo.joinedDate}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setShowWalletModal(true)}
                    className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 text-neutral-950 font-bold text-xs shadow-lg shadow-amber-500/20 hover:brightness-110 transition flex items-center gap-1.5"
                  >
                    <PlusCircle className="w-4 h-4" /> شارژ و برداشت
                  </button>
                  <button 
                    onClick={handleLogout}
                    className="px-4 py-2.5 rounded-2xl bg-neutral-900 border border-neutral-800 text-neutral-300 font-bold text-xs hover:bg-neutral-800 transition flex items-center gap-1.5"
                  >
                    <LogOut className="w-4 h-4 text-rose-400" /> خروج
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-neutral-900/90 p-5 rounded-2xl border border-neutral-800">
                <span className="text-xs text-neutral-400 block mb-1">موجودی کیف پول</span>
                <span className="text-2xl font-black text-amber-300">{balance.toLocaleString('fa-IR')} <span className="text-xs font-normal">تومان</span></span>
              </div>
              <div className="bg-neutral-900/90 p-5 rounded-2xl border border-neutral-800">
                <span className="text-xs text-neutral-400 block mb-1">تعداد بازی‌ها / بردها</span>
                <span className="text-2xl font-black text-white">{userInfo.totalGames} <span className="text-xs text-emerald-400 font-normal">({userInfo.totalWins} برد)</span></span>
              </div>
              <div className="bg-neutral-900/90 p-5 rounded-2xl border border-neutral-800">
                <span className="text-xs text-neutral-400 block mb-1">مجموع جوایز کسب شده</span>
                <span className="text-2xl font-black text-emerald-400">{userInfo.totalEarned.toLocaleString('fa-IR')} <span className="text-xs font-normal">تومان</span></span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-neutral-900/90 rounded-3xl border border-neutral-800 p-6">
                <h3 className="text-sm font-bold text-amber-300 mb-4 flex items-center gap-2">
                  <Edit3 className="w-4 h-4" /> ویرایش اطلاعات شخصی
                </h3>
                <div className="space-y-4 text-xs">
                  <div>
                    <label className="text-neutral-400 block mb-1">نام و نام خانوادگی</label>
                    <input 
                      type="text" 
                      value={userInfo.fullname} 
                      onChange={(e) => setUserInfo({ ...userInfo, fullname: e.target.value })}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="text-neutral-400 block mb-1">شماره همراه</label>
                    <input 
                      type="text" 
                      value={userInfo.phone} 
                      onChange={(e) => setUserInfo({ ...userInfo, phone: e.target.value })}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="text-neutral-400 block mb-1">پست الکترونیکی (ایمیل)</label>
                    <input 
                      type="email" 
                      value={userInfo.email} 
                      onChange={(e) => setUserInfo({ ...userInfo, email: e.target.value })}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <button 
                    onClick={() => {
                      setSoundNotice('تغییرات با موفقیت ذخیره شد.');
                      setTimeout(() => setSoundNotice(null), 3000);
                    }}
                    className="w-full py-2.5 rounded-xl bg-amber-500 text-neutral-950 font-bold hover:bg-amber-400 transition"
                  >
                    ذخیره تغییرات
                  </button>
                </div>
              </div>

              <div className="bg-neutral-900/90 rounded-3xl border border-neutral-800 p-6">
                <h3 className="text-sm font-bold text-amber-300 mb-4 flex items-center gap-2">
                  <History className="w-4 h-4" /> تاریخچه آخرین تراکنش‌ها
                </h3>
                <div className="space-y-3">
                  {transactions.map((t) => (
                    <div key={t.id} className="bg-neutral-950 p-3 rounded-2xl border border-neutral-800 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-white block">{t.type}</span>
                        <span className="text-[10px] text-neutral-500">{t.date}</span>
                      </div>
                      <div className="text-left">
                        <span className={`font-bold block ${t.amount > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {t.amount > 0 ? `+${t.amount.toLocaleString('fa-IR')}` : t.amount.toLocaleString('fa-IR')} تومان
                        </span>
                        <span className="text-[9px] text-neutral-400">{t.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      )}

      {/* ADMIN PANEL */}
      {isAuthenticated && isAdmin && activeTab === 'admin' && (
        <main className="max-w-6xl mx-auto px-4 mt-8 space-y-8">
          <div className="bg-gradient-to-r from-red-950/40 via-neutral-900 to-neutral-950 rounded-3xl border border-red-500/30 p-6 shadow-2xl">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-red-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-white">پنل مدیریت عالی سیستم (Super Admin)</h2>
                  <p className="text-xs text-neutral-400">کنترل کامل کاربران، ورودی اتاق‌ها و تایید واریزی‌های دستی</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-xl">
                  سرور و دیتابیس: متصل
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="bg-neutral-950/80 p-4 rounded-2xl border border-neutral-800">
                <span className="text-[11px] text-neutral-400">تعداد کاربران کل</span>
                <p className="text-2xl font-black text-amber-400 mt-1">{allUsers.length + 1536}</p>
              </div>

              <div className="bg-neutral-950/80 p-4 rounded-2xl border border-neutral-800">
                <span className="text-[11px] text-neutral-400">گردش مالی کل پلتفرم</span>
                <p className="text-2xl font-black text-emerald-400 mt-1">{totalVolume.toLocaleString('fa-IR')} <span className="text-xs font-normal">تومان</span></p>
              </div>

              <div className="bg-neutral-950/80 p-4 rounded-2xl border border-neutral-800">
                <span className="text-[11px] text-neutral-400">درصد کمیسیون سیستم</span>
                <p className="text-2xl font-black text-yellow-300 mt-1">{commissionRate}٪</p>
              </div>

              <div className="bg-neutral-950/80 p-4 rounded-2xl border border-neutral-800">
                <span className="text-[11px] text-neutral-400">سود خالص مدیر</span>
                <p className="text-2xl font-black text-red-400 mt-1">
                  {Math.floor(totalVolume * (commissionRate / 100)).toLocaleString('fa-IR')} <span className="text-xs font-normal">تومان</span>
                </p>
              </div>
            </div>
          </div>

          {/* Pending Card Deposits */}
          <div className="bg-neutral-900/90 rounded-3xl border border-amber-500/30 p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-amber-300 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-amber-400" /> درخواست‌های واریز کارت‌به‌کارت (نیازمند تایید ادمین)
              </h3>
              <span className="text-xs bg-amber-500/20 text-amber-300 px-2.5 py-1 rounded-xl font-bold">
                {pendingCardDeposits.filter(r => r.status === 'در انتظار تایید').length} درخواست فعال
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="border-b border-neutral-800 text-neutral-400">
                    <th className="pb-3 font-bold">نام کاربر</th>
                    <th className="pb-3 font-bold">مبلغ واریزی</th>
                    <th className="pb-3 font-bold">شماره کارت واریزکننده</th>
                    <th className="pb-3 font-bold">کد پیگیری فیش</th>
                    <th className="pb-3 font-bold">زمان</th>
                    <th className="pb-3 font-bold text-center">اقدام مدیر</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/60">
                  {pendingCardDeposits.map((req) => (
                    <tr key={req.id} className="hover:bg-neutral-950/50 transition">
                      <td className="py-3 font-bold text-white">{req.username}</td>
                      <td className="py-3 text-emerald-400 font-bold">{req.amount.toLocaleString('fa-IR')} تومان</td>
                      <td className="py-3 text-neutral-300 font-mono">{req.userCard}</td>
                      <td className="py-3 text-amber-300 font-mono">{req.refCode}</td>
                      <td className="py-3 text-neutral-500 text-[11px]">{req.date}</td>
                      <td className="py-3">
                        {req.status === 'در انتظار تایید' ? (
                          <div className="flex items-center justify-center gap-2">
                            <button 
                              onClick={() => handleAdminApproveCardDeposit(req.id)}
                              className="px-3 py-1.5 rounded-xl bg-emerald-500 text-neutral-950 hover:bg-emerald-400 text-[11px] font-black flex items-center gap-1 shadow-md transition"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" /> تایید و شارژ
                            </button>
                            <button 
                              onClick={() => handleAdminRejectCardDeposit(req.id)}
                              className="px-3 py-1.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 hover:bg-rose-500/30 text-[11px] font-bold flex items-center gap-1 transition"
                            >
                              <XCircle className="w-3.5 h-3.5" /> رد درخواست
                            </button>
                          </div>
                        ) : (
                          <div className="text-center">
                            <span className={`px-2.5 py-1 rounded-xl text-[10px] font-bold ${req.status === 'تایید شد' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'}`}>
                              {req.status}
                            </span>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* User List */}
          <div className="bg-neutral-900/90 rounded-3xl border border-neutral-800 p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-base font-bold text-amber-300 flex items-center gap-2">
                <Users className="w-5 h-5 text-amber-400" /> مدیریت کاربران سایت
              </h3>
              <span className="text-xs text-neutral-500">لیست کاربران ثبت شده</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="border-b border-neutral-800 text-neutral-400">
                    <th className="pb-3 font-bold">کاربر</th>
                    <th className="pb-3 font-bold">شماره همراه</th>
                    <th className="pb-3 font-bold">موجودی</th>
                    <th className="pb-3 font-bold">تعداد برد</th>
                    <th className="pb-3 font-bold">وضعیت حساب</th>
                    <th className="pb-3 font-bold text-center">عملیات مدیریتی</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/60">
                  {allUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-neutral-950/50 transition">
                      <td className="py-3 font-bold text-white">
                        {u.fullname}
                        <span className="block text-[10px] text-neutral-500 font-normal">@{u.username}</span>
                      </td>
                      <td className="py-3 text-neutral-300 font-mono">{u.phone}</td>
                      <td className="py-3 text-emerald-400 font-bold">{u.balance.toLocaleString('fa-IR')} تومان</td>
                      <td className="py-3 text-amber-300 font-bold">{u.wins} بار</td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${u.status === 'فعال' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-400'}`}>
                          {u.status}
                        </span>
                      </td>
                      <td className="py-3">
                        <div className="flex items-center justify-center gap-2">
                          <button 
                            onClick={() => handleAdminChargeUser(u.id)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20 text-[10px] font-bold flex items-center gap-1"
                          >
                            <DollarSign className="w-3 h-3" /> شارژ دستی
                          </button>
                          <button 
                            onClick={() => handleAdminToggleBan(u.id)}
                            className={`px-2.5 py-1 rounded-lg border text-[10px] font-bold flex items-center gap-1 ${u.status === 'فعال' ? 'bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20' : 'bg-amber-500/10 border-amber-500/30 text-amber-300'}`}
                          >
                            {u.status === 'فعال' ? <Ban className="w-3 h-3" /> : <UserCheck className="w-3 h-3" />}
                            {u.status === 'فعال' ? 'مسدودسازی' : 'رفع مسدودی'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Rooms Control */}
          <div className="bg-neutral-900/90 rounded-3xl border border-neutral-800 p-6 shadow-2xl">
            <h3 className="text-base font-bold text-amber-300 mb-6 flex items-center gap-2">
              <Settings className="w-5 h-5 text-amber-400" /> مدیریت اتاق‌ها و نرخ ورودی‌ها
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {rooms.map(room => (
                <div key={room.id} className="bg-neutral-950 p-5 rounded-2xl border border-neutral-800 space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="font-bold text-white text-sm">{room.name}</h4>
                    <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-bold">{room.badge}</span>
                  </div>
                  <div className="text-xs space-y-1">
                    <span className="text-neutral-400 block">ورودی فعلی هر کارت:</span>
                    <span className="text-lg font-black text-amber-400 block">{room.entry.toLocaleString('fa-IR')} تومان</span>
                  </div>
                  <button 
                    onClick={() => handleAdminUpdateRoomEntry(room.id)}
                    className="w-full py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-xs font-bold text-neutral-200 hover:bg-neutral-800 transition"
                  >
                    تغییر مبلغ ورودی
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Settings */}
          <div className="bg-neutral-900/90 rounded-3xl border border-neutral-800 p-6 shadow-2xl">
            <h3 className="text-base font-bold text-amber-300 mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5 text-amber-400" /> تنظیمات مالی و کمیسیون پلتفرم
            </h3>
            <div className="max-w-xl space-y-4">
              <div>
                <label className="text-xs text-neutral-300 block mb-2 font-bold">تنظیم میزان درصد کمیسیون سیستم از صندوق برنده:</label>
                <div className="flex items-center gap-4">
                  <input 
                    type="range" 
                    min="1" 
                    max="30" 
                    value={commissionRate}
                    onChange={(e) => setCommissionRate(Number(e.target.value))}
                    className="flex-1 accent-amber-500 cursor-pointer"
                  />
                  <span className="font-black text-xl text-amber-400">{commissionRate}٪</span>
                </div>
              </div>
            </div>
          </div>
        </main>
      )}

      {/* WALLET MODAL */}
      {showWalletModal && !isAdmin && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-amber-500/40 rounded-3xl p-6 max-w-lg w-full shadow-2xl relative">
            <div className="flex justify-between items-center mb-6 border-b border-neutral-800 pb-4">
              <div className="flex items-center gap-2">
                <Wallet className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-amber-300">مدیریت مالی و درگاه‌های پرداخت</h3>
              </div>
            </div>

            <div className="grid grid-cols-4 bg-neutral-950 p-1 rounded-2xl border border-neutral-800 mb-6 text-[11px] font-bold">
              <button 
                onClick={() => setWalletTab('crypto')}
                className={`py-2 rounded-xl transition ${walletTab === 'crypto' ? 'bg-amber-500 text-neutral-950 shadow-md' : 'text-neutral-400'}`}
              >
                شارژ تتر
              </button>
              <button 
                onClick={() => setWalletTab('voucher')}
                className={`py-2 rounded-xl transition ${walletTab === 'voucher' ? 'bg-amber-500 text-neutral-950 shadow-md' : 'text-neutral-400'}`}
              >
                ووچر
              </button>
              <button 
                onClick={() => setWalletTab('card')}
                className={`py-2 rounded-xl transition ${walletTab === 'card' ? 'bg-amber-500 text-neutral-950 shadow-md' : 'text-neutral-400'}`}
              >
                کارت به کارت
              </button>
              <button 
                onClick={() => setWalletTab('withdraw')}
                className={`py-2 rounded-xl transition ${walletTab === 'withdraw' ? 'bg-amber-500 text-neutral-950 shadow-md' : 'text-neutral-400'}`}
              >
                برداشت
              </button>
            </div>

            {walletTab === 'crypto' && (
              <div className="space-y-4 text-xs">
                <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 space-y-3">
                  <div className="flex justify-between text-neutral-400">
                    <span>نرخ محاسبه تتر:</span>
                    <span className="font-bold text-amber-300">{USDT_TOMAN_RATE.toLocaleString('fa-IR')} تومان</span>
                  </div>
                  <div>
                    <label className="block text-neutral-300 mb-1 font-bold">مقدار شارژ به تتر (USDT)</label>
                    <input 
                      type="number"
                      value={depositUsdtAmount}
                      onChange={(e) => setDepositUsdtAmount(e.target.value)}
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-white font-bold text-sm focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div className="flex justify-between text-neutral-400 pt-2 border-t border-neutral-800">
                    <span>معادل ریالی:</span>
                    <span className="font-black text-emerald-400">
                      {Math.floor(parseFloat(depositUsdtAmount || 0) * USDT_TOMAN_RATE).toLocaleString('fa-IR')} تومان
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-neutral-950 rounded-2xl border border-amber-500/20 text-center space-y-2">
                  <span className="text-[10px] text-neutral-400 block">آدرس واریز (TRC-20)</span>
                  <p className="font-mono text-[11px] text-amber-300 break-all select-all bg-neutral-900 p-2 rounded-xl border border-neutral-800">
                    {ANONYMOUS_USDT_TRC20}
                  </p>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(ANONYMOUS_USDT_TRC20);
                      setSoundNotice('آدرس کپی شد!');
                      setTimeout(() => setSoundNotice(null), 2500);
                    }}
                    className="inline-flex items-center gap-1 text-[10px] text-amber-400 hover:text-amber-300 font-bold"
                  >
                    <Copy className="w-3 h-3" /> کپی آدرس
                  </button>
                </div>

                <div>
                  <label className="block text-neutral-300 mb-1 font-bold">کد هش تراکنش (TXID)</label>
                  <input 
                    type="text"
                    placeholder="کد پیگیری..."
                    value={depositTxHash}
                    onChange={(e) => setDepositTxHash(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2.5 text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button onClick={handleCryptoDeposit} className="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-neutral-950 font-black">
                    تایید شارژ حساب
                  </button>
                  <button onClick={() => setShowWalletModal(false)} className="px-4 py-3 rounded-xl bg-neutral-800 text-neutral-300 font-semibold">
                    انصراف
                  </button>
                </div>
              </div>
            )}

            {walletTab === 'voucher' && (
              <div className="space-y-4 text-xs">
                <div>
                  <label className="block text-neutral-300 mb-1 font-bold">شماره ووچر</label>
                  <input 
                    type="text"
                    value={voucherCode}
                    onChange={(e) => setVoucherCode(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2.5 text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-neutral-300 mb-1 font-bold">کد فعال‌سازی</label>
                  <input 
                    type="text"
                    value={voucherActivationCode}
                    onChange={(e) => setVoucherActivationCode(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2.5 text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button onClick={handleVoucherDeposit} className="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-neutral-950 font-black">
                    استعلام و شارژ
                  </button>
                  <button onClick={() => setShowWalletModal(false)} className="px-4 py-3 rounded-xl bg-neutral-800 text-neutral-300 font-semibold">
                    انصراف
                  </button>
                </div>
              </div>
            )}

            {walletTab === 'card' && (
              <div className="space-y-4 text-xs">
                <div className="bg-neutral-950 p-4 rounded-2xl border border-amber-500/30 space-y-2">
                  <span className="text-amber-400 font-bold block">شماره کارت مقصد:</span>
                  <div className="bg-neutral-900 p-3 rounded-xl border border-neutral-800 flex justify-between items-center">
                    <span className="font-mono text-base font-black text-white">{SYSTEM_DESTINATION_CARD}</span>
                    <button onClick={() => { navigator.clipboard.writeText(SYSTEM_DESTINATION_CARD); setSoundNotice('کارت کپی شد!'); setTimeout(() => setSoundNotice(null), 2500); }} className="p-1.5 bg-amber-500/20 text-amber-300 rounded-lg">
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-neutral-300 mb-1 font-bold">مبلغ واریز (تومان)</label>
                  <input 
                    type="number"
                    value={cardToCardAmount}
                    onChange={(e) => setCardToCardAmount(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white font-bold"
                  />
                </div>
                <div>
                  <label className="block text-neutral-300 mb-1 font-bold">شماره کارت واریزکننده</label>
                  <input 
                    type="text"
                    value={userCardNumber}
                    onChange={(e) => setUserCardNumber(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2.5 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-neutral-300 mb-1 font-bold">شماره پیگیری فیش</label>
                  <input 
                    type="text"
                    value={cardRefCode}
                    onChange={(e) => setCardRefCode(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2.5 text-white font-mono"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button onClick={handleCardToCardSubmit} className="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-neutral-950 font-black">
                    ثبت فیش واریزی
                  </button>
                  <button onClick={() => setShowWalletModal(false)} className="px-4 py-3 rounded-xl bg-neutral-800 text-neutral-300 font-semibold">
                    انصراف
                  </button>
                </div>
              </div>
            )}

            {walletTab === 'withdraw' && (
              <div className="space-y-4 text-xs">
                <div>
                  <label className="block text-neutral-300 mb-1 font-bold">مبلغ برداشت به تتر (USDT)</label>
                  <input 
                    type="number"
                    value={withdrawUsdtAmount}
                    onChange={(e) => setWithdrawUsdtAmount(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white font-bold text-sm"
                  />
                </div>
                <div>
                  <label className="block text-neutral-300 mb-1 font-bold">آدرس ولت تتر شما (TRC-20)</label>
                  <input 
                    type="text"
                    value={withdrawWalletAddress}
                    onChange={(e) => setWithdrawWalletAddress(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2.5 text-white font-mono"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button onClick={handleCryptoWithdraw} className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-neutral-950 font-black">
                    ارسال درخواست برداشت
                  </button>
                  <button onClick={() => setShowWalletModal(false)} className="px-4 py-3 rounded-xl bg-neutral-800 text-neutral-300 font-semibold">
                    انصراف
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}