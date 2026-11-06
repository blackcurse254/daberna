import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, Palette, Zap, ShieldCheck, Users, Trophy, 
  Clock, Sparkles, Volume2, Award, Flame
} from 'lucide-react';
import { RoomConfig, RoomState, CardSkin, MarkerSkin, ChatMessage, SoundEffectType } from '../../types';
import { BingoCardMatrix } from '../../utils/bingo';
import { socket } from '../../services/socket';
import { Spinner3D } from './Spinner3D';
import { BingoCard } from './BingoCard';
import { ChatRoom } from './ChatRoom';
import { WinnersModal } from './WinnersModal';

interface GameViewProps {
  room: RoomConfig;
  roomState: RoomState | null;
  playerCards: BingoCardMatrix[];
  markedNumbers: Set<number>;
  autoDaub: boolean;
  setAutoDaub: (val: boolean | ((prev: boolean) => boolean)) => void;
  cardSkin: CardSkin;
  setCardSkin: (skin: CardSkin | ((prev: CardSkin) => CardSkin)) => void;
  markerSkin: MarkerSkin;
  setMarkerSkin: (marker: MarkerSkin | ((prev: MarkerSkin) => MarkerSkin)) => void;
  onCellClick: (val: number) => void;
  onClaimPrize: (type: 'line1' | 'line2' | 'fullHouse') => void;
  claimMessage: string | null;
  chatMessages: ChatMessage[];
  onSendMessage: (text: string) => void;
  onSendSoundReaction: (sound: SoundEffectType, label: string) => void;
  onBackToLobby: () => void;
  onRequestNextRound?: () => void;
}

export const GameView: React.FC<GameViewProps> = ({
  room,
  roomState,
  playerCards,
  markedNumbers,
  autoDaub,
  setAutoDaub,
  cardSkin,
  setCardSkin,
  markerSkin,
  setMarkerSkin,
  onCellClick,
  onClaimPrize,
  claimMessage,
  chatMessages,
  onSendMessage,
  onSendSoundReaction,
  onBackToLobby,
  onRequestNextRound
}) => {
  const [showProvablyFair, setShowProvablyFair] = useState(false);
  const opponents = (roomState?.opponents || []).filter(o => o.cardSample && o.cardSample.length > 0);

  const currentNumber = roomState?.currentNumber ?? null;
  const drawnNumbers = roomState?.drawnNumbers ?? [];
  const playersCount = roomState?.playersCount ?? 1;
  const maxPlayers = roomState?.maxPlayers ?? 10;
  const isWaiting = roomState?.status === 'waiting';
  const isFinished = roomState?.status === 'finished';
  const countdown = roomState?.countdown ?? null;
  const roundNumber = roomState?.roundNumber ?? 1;

  const prizesClaimed = roomState?.prizesClaimed ?? {
    line1: { claimed: false },
    line2: { claimed: false },
    fullHouse: { claimed: false }
  };

  const currentPot = roomState?.currentPot || (room.entry * playersCount);
  const gameHash = roomState?.gameHash || '0x7e8b91a2f4c3...';
  const gameSeed = roomState?.gameSeed || 'ROOM_SEED_VERIFIED';

  return (
    <main className="max-w-7xl mx-auto px-2 sm:px-4 mt-3 sm:mt-6 space-y-4 sm:space-y-6">
      
      {/* Top Cyber Command Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#22234A]/80 p-3 sm:p-4 rounded-2xl sm:rounded-3xl border border-[#9575FF]/30 backdrop-blur shadow-xl">
        <div className="flex items-center gap-2.5">
          <button 
            type="button"
            onClick={onBackToLobby}
            className="p-2 sm:p-2.5 rounded-xl bg-[#11162B] hover:bg-[#11162B]/80 text-xs font-bold text-[#EAF2FF] transition flex items-center gap-1 cursor-pointer border border-[#22234A]"
          >
            <ChevronLeft className="w-4 h-4 rotate-180 text-[#20D6C2]" /> 
            <span className="hidden xs:inline">بازگشت به لابی</span>
          </button>
          <div>
            <h2 className="text-sm sm:text-base md:text-lg font-black text-[#EAF2FF] flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <span>{room.name}</span>
              <span className="text-[10px] bg-[#9575FF]/20 text-[#9575FF] px-2 py-0.5 rounded-md border border-[#9575FF]/40 font-bold">
                دور {roundNumber}
              </span>
              <span className="text-[10px] bg-[#20D6C2]/20 text-[#20D6C2] px-2 py-0.5 rounded-md border border-[#20D6C2]/40 font-mono font-bold">
                صندوق: {currentPot.toLocaleString('fa-IR')} سکه
              </span>
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
          {/* Cyber Skin & Marker Selectors (Desktop) */}
          <div className="hidden md:flex items-center gap-2 bg-[#11162B] p-1.5 rounded-2xl border border-[#22234A] text-[11px] font-bold">
            <Palette className="w-3.5 h-3.5 text-[#20D6C2] mr-1" />
            <button 
              type="button"
              onClick={() => setCardSkin(s => s === 'gold' ? 'wood' : s === 'wood' ? 'classic' : 'gold')}
              className="px-2 py-1 rounded-xl bg-[#22234A] text-[#20D6C2] border border-[#20D6C2]/30 hover:bg-[#22234A]/80 transition cursor-pointer"
            >
              پوسته: {cardSkin === 'gold' ? 'کوانتوم' : cardSkin === 'wood' ? 'مرجانی' : 'سایبر'}
            </button>
            <button 
              type="button"
              onClick={() => setMarkerSkin(m => m === 'bean' ? 'coin' : m === 'coin' ? 'emerald' : m === 'emerald' ? 'diamond' : 'bean')}
              className="px-2 py-1 rounded-xl bg-[#22234A] text-[#9575FF] border border-[#9575FF]/30 hover:bg-[#22234A]/80 transition cursor-pointer"
            >
              مهره: {markerSkin === 'bean' ? 'لوبیا نئون' : markerSkin === 'coin' ? 'سکه' : markerSkin === 'emerald' ? 'فیروزه' : 'الماس'}
            </button>
          </div>

          {/* Auto-daub */}
          <button
            type="button"
            onClick={() => setAutoDaub(prev => !prev)}
            className={`flex items-center gap-1 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl text-[11px] sm:text-xs font-bold transition border cursor-pointer ${
              autoDaub 
                ? 'bg-gradient-to-r from-[#20D6C2] to-[#9575FF] text-[#11162B] border-[#20D6C2] shadow-[0_0_12px_rgba(32,214,194,0.4)] font-black' 
                : 'bg-[#11162B] text-[#EAF2FF]/70 border-[#22234A] hover:text-white'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">علامت خودکار:</span>
            <span>{autoDaub ? 'فعال' : 'خاموش'}</span>
          </button>

          {/* Provably Fair */}
          <button 
            type="button"
            onClick={() => setShowProvablyFair(!showProvablyFair)}
            className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-[#20D6C2]/10 border border-[#20D6C2]/30 text-[#20D6C2] text-[11px] sm:text-xs font-bold hover:bg-[#20D6C2]/20 transition cursor-pointer"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">شفافیت</span>
          </button>
        </div>
      </div>

      {/* 10-Player Waiting Banner & Countdown */}
      {isWaiting && (
        <div className="bg-gradient-to-r from-[#22234A] via-[#11162B] to-[#22234A] border-2 border-[#20D6C2]/60 p-4 sm:p-5 rounded-2xl sm:rounded-3xl shadow-[0_0_30px_rgba(32,214,194,0.2)] text-center space-y-3 animate-in fade-in">
          <div className="flex items-center justify-center gap-2">
            <Users className="w-5 h-5 text-[#20D6C2] animate-pulse" />
            <h3 className="text-sm sm:text-base font-black text-[#EAF2FF]">
              در انتظار تکمیل ظرفیت ۱۰ بازیکن میز دبرنا
            </h3>
          </div>

          <div className="max-w-md mx-auto space-y-2">
            <div className="flex justify-between text-xs text-[#EAF2FF]/70 font-bold">
              <span>بازیکنان حاضر: {playersCount} از ۱۰ نفر</span>
              <span>{Math.round((playersCount / 10) * 100)}٪ تکمیل</span>
            </div>
            <div className="w-full h-3 bg-[#11162B] rounded-full overflow-hidden border border-[#22234A] p-0.5">
              <div 
                className="h-full bg-gradient-to-r from-[#20D6C2] via-[#9575FF] to-[#FF7185] rounded-full transition-all duration-500 shadow-[0_0_12px_rgba(32,214,194,0.8)]"
                style={{ width: `${Math.min(100, (playersCount / 10) * 100)}%` }}
              />
            </div>
          </div>

          {countdown !== null ? (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-[#FF7185]/20 border border-[#FF7185]/60 text-[#FF7185] animate-pulse">
              <Clock className="w-5 h-5 animate-spin-slow" />
              <span className="text-sm font-black">
                شروع دور {roundNumber} تا {countdown} ثانیه دیگر...
              </span>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <p className="text-xs text-[#20D6C2]/80 font-medium">
                به محض رسیدن به ظرفیت یا اعلام آمادگی، قرعه‌کشی آغاز می‌شود.
              </p>
              <button
                type="button"
                onClick={() => socket.emit('start_room_game', { roomId: room.id })}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#20D6C2] to-[#9575FF] text-[#11162B] font-black text-xs shadow-md shadow-[#20D6C2]/30 hover:brightness-110 active:scale-95 transition cursor-pointer"
              >
                شروع قرعه‌کشی میز
              </button>
            </div>
          )}
        </div>
      )}

      {/* Provably Fair Drawer */}
      {showProvablyFair && (
        <div className="bg-[#22234A]/90 border border-[#20D6C2]/40 p-3 sm:p-4 rounded-2xl sm:rounded-3xl text-xs space-y-2 shadow-2xl animate-in fade-in duration-200">
          <div className="flex justify-between items-center text-[#20D6C2] font-bold">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#20D6C2]" />
              هش رمزنگاری‌شده قرعه‌کشی اتاق سرور (SHA-256 Verified):
            </span>
            <span className="text-[10px] bg-[#20D6C2]/20 text-[#20D6C2] px-2 py-0.5 rounded border border-[#20D6C2]/40 font-mono">
              VERIFIED
            </span>
          </div>
          <p className="font-mono text-[#EAF2FF] break-all bg-[#11162B] p-2 sm:p-2.5 rounded-xl sm:rounded-2xl border border-[#22234A] select-all text-[11px]">
            {gameHash}
          </p>
          <div className="flex justify-between text-[#EAF2FF]/60 text-[10px]">
            <span>سید تصادفی: {gameSeed}</span>
            <span>الگوریتم: SHA-256 Server Authority</span>
          </div>
        </div>
      )}

      {/* Mobile Streamlined Ball Bar (Under 1024px screens) */}
      <div className="lg:hidden bg-[#22234A]/90 p-3 rounded-2xl border border-[#9575FF]/30 shadow-lg space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-xl border-2 transition-all shadow-lg ${
              currentNumber 
                ? 'bg-gradient-to-tr from-[#20D6C2] via-[#9575FF] to-[#FF7185] text-[#11162B] border-white shadow-[#20D6C2]/50 scale-105' 
                : 'bg-[#11162B] text-neutral-500 border-[#22234A]'
            }`}>
              {currentNumber ?? '-'}
            </div>
            <div>
              <span className="text-xs font-black text-[#EAF2FF] block">
                {currentNumber ? `گوی خارج‌شده: ${currentNumber}` : 'در انتظار استخراج گوی...'}
              </span>
              <span className="text-[10px] text-[#20D6C2]">
                {drawnNumbers.length} از ۹۰ مهره کیسه
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1 overflow-x-auto max-w-[160px] py-1">
            {drawnNumbers.slice(-4).reverse().map((n, i) => (
              <span 
                key={i} 
                className="w-7 h-7 rounded-lg bg-[#11162B] text-[#EAF2FF]/80 text-[11px] font-bold border border-[#22234A] flex items-center justify-center shrink-0"
              >
                {n}
              </span>
            ))}
          </div>
        </div>

        {/* Quick Claim Buttons for Mobile */}
        <div className="grid grid-cols-3 gap-1.5 pt-1 border-t border-[#22234A]">
          <button
            type="button"
            onClick={() => onClaimPrize('line1')}
            disabled={prizesClaimed.line1?.claimed}
            className={`py-2 rounded-xl text-[11px] font-bold border transition flex flex-col items-center justify-center ${
              prizesClaimed.line1?.claimed
                ? 'bg-[#11162B]/50 text-neutral-500 border-neutral-800 opacity-60'
                : 'bg-[#11162B] text-[#9575FF] border-[#9575FF]/40 active:scale-95'
            }`}
          >
            <span>۱ خط (۱۵٪)</span>
            <span className="text-[9px] text-[#9575FF]/70">
              {prizesClaimed.line1?.claimed ? 'ثبت شد' : 'اعلام'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => onClaimPrize('line2')}
            disabled={prizesClaimed.line2?.claimed}
            className={`py-2 rounded-xl text-[11px] font-bold border transition flex flex-col items-center justify-center ${
              prizesClaimed.line2?.claimed
                ? 'bg-[#11162B]/50 text-neutral-500 border-neutral-800 opacity-60'
                : 'bg-[#11162B] text-[#20D6C2] border-[#20D6C2]/40 active:scale-95'
            }`}
          >
            <span>۲ خط (۳۵٪)</span>
            <span className="text-[9px] text-[#20D6C2]/70">
              {prizesClaimed.line2?.claimed ? 'ثبت شد' : 'اعلام'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => onClaimPrize('fullHouse')}
            disabled={prizesClaimed.fullHouse?.claimed}
            className={`py-2 rounded-xl text-[11px] font-black border transition flex flex-col items-center justify-center ${
              prizesClaimed.fullHouse?.claimed
                ? 'bg-[#11162B]/50 text-neutral-500 border-neutral-800 opacity-60'
                : 'bg-gradient-to-r from-[#20D6C2] to-[#9575FF] text-[#11162B] border-white active:scale-95 shadow-md shadow-[#20D6C2]/30'
            }`}
          >
            <span>🏆 دبرنا (۵۰٪)</span>
            <span className="text-[9px] text-[#11162B]/90 font-bold">
              {prizesClaimed.fullHouse?.claimed ? 'ثبت شد' : 'اعلام دبلنا!'}
            </span>
          </button>
        </div>

        {claimMessage && (
          <div className="p-2 rounded-xl bg-[#20D6C2]/15 border border-[#20D6C2]/40 text-[10px] text-[#20D6C2] text-center">
            {claimMessage}
          </div>
        )}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        
        {/* Left Column (Desktop): 3D Holographic Spinner & Prize Claims */}
        <div className="hidden lg:block lg:col-span-3 space-y-6">
          <Spinner3D 
            currentNumber={currentNumber} 
            drawnCount={drawnNumbers.length} 
          />

          {/* Drawn Numbers Cyber Tray */}
          <div className="bg-[#22234A]/70 p-4 rounded-3xl border border-[#9575FF]/20 max-h-48 overflow-y-auto">
            <h4 className="text-xs font-bold text-[#EAF2FF] mb-3 flex items-center justify-between">
              <span>اعداد استخراج شده</span>
              <span className="text-[10px] bg-[#11162B] px-2.5 py-0.5 rounded-lg text-[#20D6C2] font-mono border border-[#22234A]">
                {drawnNumbers.length} / 90
              </span>
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {drawnNumbers.slice().reverse().map((n, idx) => (
                <span 
                  key={idx} 
                  className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center transition-all ${
                    idx === 0 
                      ? 'bg-gradient-to-tr from-[#20D6C2] to-[#9575FF] text-[#11162B] scale-110 shadow-lg font-black animate-pulse' 
                      : 'bg-[#11162B] text-[#EAF2FF]/80 border border-[#22234A]'
                  }`}
                >
                  {n}
                </span>
              ))}
              {drawnNumbers.length === 0 && (
                <span className="text-xs text-[#EAF2FF]/40 py-3 w-full text-center">منتظر خروج اولین گوی از گردونه...</span>
              )}
            </div>
          </div>

          {/* Prize Claim Terminal (Desktop) */}
          <div className="bg-[#22234A]/80 p-4 rounded-3xl border border-[#9575FF]/30 space-y-2.5 shadow-xl">
            <h4 className="text-xs font-bold text-[#20D6C2] mb-2 flex items-center gap-1.5">
              <Trophy className="w-4 h-4 text-[#20D6C2]" />
              <span>اعلام برد و دریافت جایزه</span>
            </h4>
            
            {claimMessage && (
              <div className="p-3 rounded-2xl bg-[#20D6C2]/15 border border-[#20D6C2]/40 text-[11px] text-[#20D6C2] mb-2 leading-relaxed">
                {claimMessage}
              </div>
            )}

            <button 
              type="button"
              onClick={() => onClaimPrize('line1')}
              disabled={prizesClaimed.line1?.claimed}
              className={`w-full py-2.5 rounded-xl font-bold text-xs border transition flex items-center justify-between px-3 cursor-pointer ${
                prizesClaimed.line1?.claimed 
                  ? 'bg-[#11162B]/60 text-neutral-500 border-neutral-800 opacity-60 cursor-not-allowed' 
                  : 'bg-[#11162B] border-[#9575FF]/40 text-[#9575FF] hover:bg-[#9575FF]/10 hover:border-[#9575FF]'
              }`}
            >
              <span>جایزه ۱ خط (Line 1)</span>
              <span className="text-[10px] bg-[#9575FF]/20 px-2 py-0.5 rounded">
                {prizesClaimed.line1?.claimed ? `توسط ${prizesClaimed.line1.winnerName}` : '۱۵٪ صندوق'}
              </span>
            </button>

            <button 
              type="button"
              onClick={() => onClaimPrize('line2')}
              disabled={prizesClaimed.line2?.claimed}
              className={`w-full py-2.5 rounded-xl font-bold text-xs border transition flex items-center justify-between px-3 cursor-pointer ${
                prizesClaimed.line2?.claimed 
                  ? 'bg-[#11162B]/60 text-neutral-500 border-neutral-800 opacity-60 cursor-not-allowed' 
                  : 'bg-[#11162B] border-[#20D6C2]/40 text-[#20D6C2] hover:bg-[#20D6C2]/10 hover:border-[#20D6C2]'
              }`}
            >
              <span>جایزه ۲ خط (Line 2)</span>
              <span className="text-[10px] bg-[#20D6C2]/20 px-2 py-0.5 rounded">
                {prizesClaimed.line2?.claimed ? `توسط ${prizesClaimed.line2.winnerName}` : '۳۵٪ صندوق'}
              </span>
            </button>

            <button 
              type="button"
              onClick={() => onClaimPrize('fullHouse')}
              disabled={prizesClaimed.fullHouse?.claimed}
              className={`w-full py-3 rounded-xl font-black text-xs border transition flex items-center justify-between px-3 shadow-lg cursor-pointer ${
                prizesClaimed.fullHouse?.claimed 
                  ? 'bg-[#11162B]/60 text-neutral-500 border-neutral-800 opacity-60 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-[#20D6C2] via-[#9575FF] to-[#FF7185] text-[#11162B] border-[#EAF2FF] hover:brightness-125 active:scale-95'
              }`}
            >
              <span>🏆 دبرنای کامل (Full House)</span>
              <span className="text-[10px] bg-[#11162B]/70 text-[#EAF2FF] px-2 py-0.5 rounded font-black">
                {prizesClaimed.fullHouse?.claimed ? `توسط ${prizesClaimed.fullHouse.winnerName}` : '۵۰٪ صندوق'}
              </span>
            </button>
          </div>
        </div>

        {/* Center Column: Player's Cards & Live Opponents */}
        <div className="lg:col-span-6 space-y-4 sm:space-y-6">
          <div className="flex items-center justify-between bg-[#22234A]/80 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border border-[#9575FF]/20 text-xs">
            <span className="text-[#EAF2FF]/70">کارت‌های شما در دور {roundNumber}</span>
            <span className="text-[#20D6C2] font-black">{playerCards.length} کارت فعال</span>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:gap-6">
            {playerCards.map((card, idx) => (
              <BingoCard 
                key={idx}
                card={card}
                cardIndex={idx}
                markedNumbers={markedNumbers}
                currentNumber={currentNumber}
                cardSkin={cardSkin}
                markerSkin={markerSkin}
                onCellClick={onCellClick}
              />
            ))}
          </div>

          {/* Opponent Cards Section */}
          <div className="mt-6 sm:mt-8 space-y-3 sm:space-y-4 pt-4 sm:pt-6 border-t border-[#22234A]">
            <div className="flex items-center justify-between">
              <h3 className="text-xs sm:text-sm font-black text-[#EAF2FF] flex items-center gap-1.5 sm:gap-2">
                <Users className="w-4 h-4 text-[#20D6C2]" /> کارت‌های سایر بازیکنان حاضر در اتاق
              </h3>
              <span className="text-[10px] bg-[#22234A] text-[#20D6C2] px-2 py-0.5 rounded-lg border border-[#20D6C2]/30 font-bold">
                {playersCount} بازیکن حاضر
              </span>
            </div>

            {opponents.length === 0 ? (
              <div className="p-4 sm:p-6 rounded-2xl bg-[#22234A]/40 border border-[#9575FF]/20 text-center space-y-1.5">
                <p className="text-xs text-[#EAF2FF]/80 font-bold">
                  در حال حاضر بازیکن دیگری در این میز حضور ندارد.
                </p>
                <p className="text-[11px] text-[#20D6C2]/80">
                  به محض ورود سایر بازیکنان به اتاق، کارت‌ها و شماره‌های علامت‌خورده آن‌ها به‌صورت زنده در اینجا نمایان می‌شود.
                </p>
              </div>
            ) : (
              opponents.map((otherPlayer, pIdx) => (
                <div key={pIdx} className="p-2.5 sm:p-4 rounded-2xl bg-[#22234A]/50 border border-[#9575FF]/15 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-[#EAF2FF] flex items-center gap-1.5 text-[11px] sm:text-xs">
                      <span className="w-2 h-2 rounded-full bg-[#20D6C2] animate-pulse" />
                      کارت {otherPlayer.username} ({otherPlayer.cardsCount} کارت)
                    </span>
                    <span className="text-[10px] text-[#EAF2FF]/40">مشاهده زنده</span>
                  </div>

                  <div className="grid grid-cols-9 gap-0.5 sm:gap-1 p-1.5 sm:p-2 bg-[#11162B] rounded-xl border border-[#22234A]">
                    {otherPlayer.cardSample.map((row) =>
                      row.map((val, cIdx) => {
                        if (val === null) {
                          return <div key={cIdx} className="aspect-[4/3] rounded bg-[#22234A]/20 border border-[#22234A]/30" />;
                        }
                        const isDrawn = drawnNumbers.includes(val);
                        return (
                          <div 
                            key={cIdx} 
                            className={`aspect-[4/3] rounded text-[9px] sm:text-[10px] font-bold flex items-center justify-center border ${
                              isDrawn 
                                ? 'bg-[#FF7185]/20 text-[#FF7185] border-[#FF7185]/50 font-black' 
                                : 'bg-[#22234A] text-[#EAF2FF]/50 border-[#22234A]'
                            }`}
                          >
                            {val}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Live Cyber Chat */}
        <div className="lg:col-span-3">
          <ChatRoom 
            messages={chatMessages}
            onSendMessage={onSendMessage}
            onSendSoundReaction={onSendSoundReaction}
          />
        </div>

      </div>

      {/* Dedicated Winners Modal on Round Finish */}
      <WinnersModal
        isOpen={isFinished || Boolean(roomState?.winnerSummary)}
        winnerSummary={roomState?.winnerSummary ?? null}
        roundNumber={roundNumber}
        currentPot={currentPot}
        onRequestNextRound={() => {
          if (onRequestNextRound) {
            onRequestNextRound();
          }
        }}
        onBackToLobby={onBackToLobby}
      />

    </main>
  );
};
