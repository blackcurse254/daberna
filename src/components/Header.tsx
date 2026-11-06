import React from 'react';
import { Volume2, VolumeX, Play, Award, User, ShieldCheck, LogOut, WifiOff, Sparkles } from 'lucide-react';
import { LuxuryDabernaLogo } from './LuxuryDabernaLogo';
import { UserInfo } from '../types';

interface HeaderProps {
  isAuthenticated: boolean;
  isAdmin: boolean;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userInfo: UserInfo;
  balance: number;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenWallet: () => void;
  onLogout: () => void;
  isOnline: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  isAuthenticated,
  isAdmin,
  activeTab,
  setActiveTab,
  balance,
  soundEnabled,
  onToggleSound,
  onOpenWallet,
  onLogout,
  isOnline
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#11162B]/90 backdrop-blur-xl border-b border-[#22234A] px-3.5 md:px-8 py-3 shadow-[0_4px_30px_rgba(17,22,43,0.8)]">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        
        {/* Brand & Logo */}
        <div 
          className="flex items-center gap-3 cursor-pointer select-none group" 
          onClick={() => isAuthenticated && !isAdmin && setActiveTab('lobby')}
        >
          <LuxuryDabernaLogo />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base md:text-xl font-black tracking-tight text-[#EAF2FF] group-hover:text-[#20D6C2] transition-colors">
                {isAdmin ? 'سیستم مدیریت دبرنا لند' : 'دبرنا لند VIP'}
              </span>
              <span className={`text-[9px] px-2 py-0.5 rounded-full font-black border tracking-wider ${
                isAdmin 
                  ? 'bg-[#FF7185]/15 text-[#FF7185] border-[#FF7185]/40' 
                  : 'bg-[#9575FF]/20 text-[#20D6C2] border-[#20D6C2]/40 shadow-[0_0_10px_rgba(32,214,194,0.3)]'
              }`}>
                {isAdmin ? 'ROOT ADMIN' : 'NEON 90'}
              </span>
            </div>
            <p className="text-[10px] text-[#9575FF]/80 font-medium hidden sm:block">
              {isAdmin ? 'مرکز فرماندهی، نظارت و امنیت پلتفرم' : 'پلتفرم دیجیتال و آینده‌نگرانه دبرنای لایو'}
            </p>
          </div>
        </div>

        {/* Desktop Nav */}
        {isAuthenticated && !isAdmin && (
          <nav className="hidden md:flex items-center gap-1.5 bg-[#22234A]/70 p-1.5 rounded-2xl border border-[#9575FF]/20 shadow-inner">
            <button 
              type="button"
              onClick={() => setActiveTab('lobby')} 
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'lobby' 
                  ? 'bg-gradient-to-r from-[#20D6C2] to-[#9575FF] text-[#11162B] shadow-lg shadow-[#20D6C2]/20 font-black scale-105' 
                  : 'text-[#EAF2FF]/70 hover:text-white hover:bg-[#11162B]/60'
              }`}
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              میزهای بازی
            </button>
            <button 
              type="button"
              onClick={() => setActiveTab('leaderboard')} 
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'leaderboard' 
                  ? 'bg-gradient-to-r from-[#20D6C2] to-[#9575FF] text-[#11162B] shadow-lg shadow-[#20D6C2]/20 font-black scale-105' 
                  : 'text-[#EAF2FF]/70 hover:text-white hover:bg-[#11162B]/60'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              تالار قهرمانان
            </button>
            <button 
              type="button"
              onClick={() => setActiveTab('profile')} 
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'profile' 
                  ? 'bg-gradient-to-r from-[#20D6C2] to-[#9575FF] text-[#11162B] shadow-lg shadow-[#20D6C2]/20 font-black scale-105' 
                  : 'text-[#EAF2FF]/70 hover:text-white hover:bg-[#11162B]/60'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              پروفایل کاربری
            </button>
          </nav>
        )}

        {/* Right Section: Status, Audio, Wallet, Admin */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          
          {/* Server Connection Pulse (Hidden on tiny mobile to preserve header space) */}
          <div className="hidden xs:flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl bg-[#22234A]/80 border border-[#9575FF]/20 text-[10px] sm:text-[11px]">
            {isOnline ? (
              <span className="flex items-center gap-1.5 text-[#20D6C2] font-semibold">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#20D6C2] opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#20D6C2]" />
                </span>
                <span className="hidden sm:inline">شبکه آنلاین</span>
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[#FF7185] font-semibold animate-pulse">
                <WifiOff className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span className="hidden sm:inline">اتصال مجدد...</span>
              </span>
            )}
          </div>

          {/* Sound Synthesizer Switch */}
          <button 
            type="button"
            onClick={onToggleSound} 
            className={`p-1.5 sm:p-2.5 rounded-lg sm:rounded-xl border transition cursor-pointer shrink-0 ${
              soundEnabled 
                ? 'bg-[#22234A] border-[#9575FF]/40 text-[#20D6C2] shadow-[0_0_12px_rgba(149,117,255,0.25)]' 
                : 'bg-[#11162B] border-[#22234A] text-neutral-500'
            }`}
            title={soundEnabled ? 'صوت سنتزی روشن' : 'صوت خاموش'}
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
          </button>

          {/* Admin Indicator */}
          {isAuthenticated && isAdmin && (
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="hidden sm:flex text-xs bg-[#FF7185]/15 text-[#FF7185] border border-[#FF7185]/35 px-3 py-1.5 rounded-xl font-bold items-center gap-1.5 shadow-[0_0_12px_rgba(255,113,133,0.2)]">
                <ShieldCheck className="w-4 h-4" />
                دسترسی مدیر کل
              </span>
              <button 
                type="button"
                onClick={onLogout}
                className="p-1.5 sm:p-2.5 rounded-lg sm:rounded-xl bg-[#22234A] border border-[#FF7185]/30 text-[#FF7185] hover:bg-[#FF7185]/20 transition cursor-pointer"
                title="خروج از نشست مدیریت"
              >
                <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </div>
          )}

          {/* User Wallet Balance Capsule */}
          {isAuthenticated && !isAdmin && (
            <div className="flex items-center bg-gradient-to-r from-[#22234A] via-[#11162B] to-[#22234A] border border-[#20D6C2]/40 rounded-xl sm:rounded-2xl px-2 sm:px-3 py-1 sm:py-1.5 gap-1.5 sm:gap-2 shadow-[0_0_16px_rgba(32,214,194,0.15)] shrink-0">
              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-[#20D6C2]/15 flex items-center justify-center border border-[#20D6C2]/40 shrink-0">
                <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-[#20D6C2]" />
              </div>
              <div className="text-right">
                <span className="hidden xs:block text-[8px] sm:text-[9px] text-[#EAF2FF]/60 font-medium">موجودی کیف پول</span>
                <span className="text-[11px] sm:text-xs md:text-sm font-black text-[#20D6C2] tracking-tight">
                  {balance.toLocaleString('fa-IR')} <span className="text-[9px] sm:text-[10px] font-normal text-[#EAF2FF]/80">سکه</span>
                </span>
              </div>
            </div>
          )}

        </div>

      </div>
    </header>
  );
};
