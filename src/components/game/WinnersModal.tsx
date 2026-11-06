import React from 'react';
import { Trophy, Award, Sparkles, RefreshCw, ArrowRight, CheckCircle2 } from 'lucide-react';
import { WinnerSummary } from '../../types';

interface WinnersModalProps {
  isOpen: boolean;
  winnerSummary: WinnerSummary | null;
  roundNumber: number;
  currentPot: number;
  onRequestNextRound: () => void;
  onBackToLobby: () => void;
}

export const WinnersModal: React.FC<WinnersModalProps> = ({
  isOpen,
  winnerSummary,
  roundNumber,
  currentPot,
  onRequestNextRound,
  onBackToLobby
}) => {
  if (!isOpen || !winnerSummary) return null;

  const totalPot = winnerSummary.totalPot || currentPot;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative w-full max-w-lg bg-gradient-to-b from-[#22234A] via-[#11162B] to-[#0A0D1A] rounded-3xl border border-[#20D6C2]/40 shadow-[0_0_50px_rgba(32,214,194,0.25)] p-5 sm:p-7 overflow-hidden text-slate-100 space-y-5">
        
        {/* Glow ambient effects */}
        <div className="absolute -top-20 -right-20 w-48 h-48 bg-[#20D6C2]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-[#9575FF]/20 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="text-center space-y-2 relative">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#20D6C2] via-[#9575FF] to-[#FF7185] p-0.5 shadow-[0_0_25px_rgba(32,214,194,0.5)] animate-bounce duration-1000">
            <div className="w-full h-full bg-[#11162B] rounded-2xl flex items-center justify-center">
              <Trophy className="w-8 h-8 text-[#20D6C2]" />
            </div>
          </div>

          <div className="flex items-center justify-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-black bg-[#9575FF]/20 text-[#9575FF] border border-[#9575FF]/40">
              دور {roundNumber} پایان یافت
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#20D6C2]/20 text-[#20D6C2] border border-[#20D6C2]/40">
              اتاق بسته شد
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-[#EAF2FF] tracking-tight">
            تابلوی برندگان دبرنا لند
          </h2>
          <p className="text-xs text-[#EAF2FF]/60 max-w-sm mx-auto">
            {winnerSummary.reason || 'دور بازی با موفقیت به پایان رسید و جوایز بین برندگان تقسیم شد.'}
          </p>
        </div>

        {/* Round Statistics strip */}
        <div className="grid grid-cols-2 gap-2 sm:gap-3 p-3 rounded-2xl bg-[#11162B]/80 border border-[#22234A] text-center">
          <div>
            <span className="text-[10px] sm:text-xs text-[#EAF2FF]/50 block">مجموع صندوق جوایز میز</span>
            <span className="text-sm sm:text-base font-black text-[#20D6C2] font-mono">
              {totalPot.toLocaleString('fa-IR')} سکه
            </span>
          </div>
          <div>
            <span className="text-[10px] sm:text-xs text-[#EAF2FF]/50 block">مهره‌های استخراج‌شده</span>
            <span className="text-sm sm:text-base font-black text-[#9575FF] font-mono">
              {winnerSummary.drawnCount} از ۹۰ مهره
            </span>
          </div>
        </div>

        {/* Winners Podium Cards */}
        <div className="space-y-2.5">
          {/* Full House Winner (Grand Champion) */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-[#20D6C2]/15 via-[#9575FF]/15 to-[#FF7185]/15 border-2 border-[#20D6C2] shadow-[0_0_20px_rgba(32,214,194,0.3)] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#20D6C2] text-[#11162B] flex items-center justify-center font-black shadow-lg shadow-[#20D6C2]/40">
                <Trophy className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs sm:text-sm font-black text-[#EAF2FF]">
                    {winnerSummary.fullHouseWinner}
                  </span>
                  <span className="text-[9px] bg-[#20D6C2]/30 text-[#20D6C2] font-bold px-1.5 py-0.5 rounded">
                    قهرمان دبرنا
                  </span>
                </div>
                <span className="text-[10px] text-[#20D6C2]">
                  دبرنای کامل (Full House / دبلنا)
                </span>
              </div>
            </div>
            <div className="text-left font-mono">
              <span className="text-xs sm:text-sm font-black text-[#20D6C2] block">
                {(winnerSummary.fullHousePrize || 0).toLocaleString('fa-IR')}
              </span>
              <span className="text-[9px] text-[#EAF2FF]/50">۵۰٪ صندوق</span>
            </div>
          </div>

          {/* Line 2 Winner */}
          <div className="p-3 sm:p-3.5 rounded-2xl bg-[#11162B]/80 border border-[#9575FF]/40 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#9575FF]/20 text-[#9575FF] border border-[#9575FF]/40 flex items-center justify-center font-bold">
                <Award className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs sm:text-sm font-bold text-[#EAF2FF] block">
                  {winnerSummary.line2Winner}
                </span>
                <span className="text-[10px] text-[#9575FF]">
                  برنده دو خط (Line 2)
                </span>
              </div>
            </div>
            <div className="text-left font-mono">
              <span className="text-xs sm:text-sm font-bold text-[#9575FF] block">
                {(winnerSummary.line2Prize || 0).toLocaleString('fa-IR')}
              </span>
              <span className="text-[9px] text-[#EAF2FF]/50">۳۵٪ صندوق</span>
            </div>
          </div>

          {/* Line 1 Winner */}
          <div className="p-3 sm:p-3.5 rounded-2xl bg-[#11162B]/80 border border-[#22234A] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#22234A] text-[#20D6C2] border border-[#20D6C2]/30 flex items-center justify-center font-bold">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs sm:text-sm font-bold text-[#EAF2FF] block">
                  {winnerSummary.line1Winner}
                </span>
                <span className="text-[10px] text-[#20D6C2]/80">
                  برنده تک خط (Line 1)
                </span>
              </div>
            </div>
            <div className="text-left font-mono">
              <span className="text-xs sm:text-sm font-bold text-[#20D6C2] block">
                {(winnerSummary.line1Prize || 0).toLocaleString('fa-IR')}
              </span>
              <span className="text-[9px] text-[#EAF2FF]/50">۱۵٪ صندوق</span>
            </div>
          </div>
        </div>

        {/* Action Buttons for Infinite Games */}
        <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
          <button
            type="button"
            onClick={onRequestNextRound}
            className="flex-1 py-3 px-4 rounded-2xl font-black text-xs sm:text-sm bg-gradient-to-r from-[#20D6C2] via-[#9575FF] to-[#FF7185] text-[#11162B] border border-[#EAF2FF]/40 shadow-[0_0_20px_rgba(32,214,194,0.4)] hover:brightness-110 active:scale-95 transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4 animate-spin-slow" />
            <span>شرکت در دور بعدی (دور {roundNumber + 1})</span>
          </button>
          
          <button
            type="button"
            onClick={onBackToLobby}
            className="py-3 px-4 rounded-2xl font-bold text-xs sm:text-sm bg-[#11162B] text-[#EAF2FF]/80 hover:text-white border border-[#22234A] hover:bg-[#22234A] active:scale-95 transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>بازگشت به لابی</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center justify-center gap-1.5 text-[10px] text-[#20D6C2]/60 pt-1">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>پلتفرم استاندارد دبرنای ۹۰ عددی • قابلیت شروع بی‌نهایت دور در هر میز</span>
        </div>

      </div>
    </div>
  );
};
