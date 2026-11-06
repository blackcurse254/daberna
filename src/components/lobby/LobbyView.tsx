import React from 'react';
import { Sparkles, Flame, Users, ShieldCheck, Trophy, Layers, ArrowLeft } from 'lucide-react';
import { RoomConfig } from '../../types';

interface LobbyViewProps {
  cardCount: number;
  setCardCount: (count: number) => void;
  rooms: RoomConfig[];
  onJoinRoom: (room: RoomConfig) => void;
}

export const LobbyView: React.FC<LobbyViewProps> = ({
  cardCount,
  setCardCount,
  rooms,
  onJoinRoom
}) => {
  return (
    <main className="max-w-7xl mx-auto px-4 mt-6 md:mt-8 space-y-8">
      
      {/* Futuristic Hero Section */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#22234A] via-[#11162B] to-[#11162B] p-6 sm:p-10 border border-[#9575FF]/30 shadow-2xl">
        {/* Luminous Energy Lines */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#20D6C2] to-[#9575FF]" />
        <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-[#9575FF]/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-[#20D6C2]/15 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#20D6C2]/10 border border-[#20D6C2]/30 text-[#20D6C2] text-xs font-bold mb-4 shadow-[0_0_12px_rgba(32,214,194,0.2)]">
            <ShieldCheck className="w-4 h-4 text-[#20D6C2]" />
            <span>پلتفرم قرعه‌کشی رمزنگاری‌شده و منصفانه (Provably Fair SHA-256)</span>
          </div>

          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-[#EAF2FF] leading-tight mb-4 tracking-tight">
            میزهای زنده دبرنا در <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-l from-[#20D6C2] via-[#9575FF] to-[#EAF2FF]">
              فضای بازی دیجیتال و آینده‌نگرانه
            </span>
          </h2>

          <p className="text-[#EAF2FF]/75 text-xs sm:text-sm leading-relaxed mb-6 max-w-2xl">
            اعداد به‌صورت زنده، بدون دخالت انسانی و تحت نظارت رمزنگاری سرور استخراج می‌شوند. سریع‌تر از دیگران خطوط کارت خود را کامل کرده و پاداش و سکه‌های صندوق را تسخیر کنید.
          </p>
          
          {/* Futuristic Card Multiplier Selector */}
          <div className="inline-flex flex-col sm:flex-row sm:items-center gap-3 bg-[#11162B]/90 p-3 rounded-2xl border border-[#22234A] shadow-inner">
            <span className="text-xs font-bold text-[#EAF2FF] flex items-center gap-2 px-2">
              <Layers className="w-4 h-4 text-[#9575FF]" />
              تعداد کارت‌های هم‌زمان شما:
            </span>
            <div className="flex gap-2">
              {[1, 2, 3, 4].map(num => (
                <button 
                  key={num} 
                  type="button"
                  onClick={() => setCardCount(num)}
                  className={`px-4 py-2 rounded-xl font-black text-xs sm:text-sm transition-all cursor-pointer flex items-center gap-1.5 ${
                    cardCount === num 
                      ? 'bg-gradient-to-r from-[#20D6C2] to-[#9575FF] text-[#11162B] shadow-lg shadow-[#20D6C2]/30 scale-105 border border-[#20D6C2]' 
                      : 'bg-[#22234A] text-[#EAF2FF]/70 hover:text-white hover:bg-[#22234A]/80 border border-transparent'
                  }`}
                >
                  <span>{num}</span>
                  <span className="text-[10px] font-bold">کارت</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Futuristic Rooms Grid */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2.5">
            <Flame className="w-5 h-5 text-[#20D6C2] animate-pulse" />
            <h3 className="text-lg md:text-xl font-black text-[#EAF2FF]">میزهای فعال دبرنا</h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-[#20D6C2] font-semibold bg-[#20D6C2]/10 px-2.5 py-1 rounded-xl border border-[#20D6C2]/30 hidden sm:inline">
              شروع خودکار با ۱۰ بازیکن
            </span>
            <span className="text-xs text-[#9575FF] font-semibold bg-[#22234A]/60 px-3 py-1 rounded-xl border border-[#9575FF]/20">
              دورهای پیوسته و بی‌نهایت
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {rooms.map((room) => {
            const totalEntry = room.entry * cardCount;
            const netPot = room.entry * 10;

            const isGold = room.id === 'gold';
            const isSilver = room.id === 'silver';

            return (
              <div 
                key={room.id}
                className={`relative rounded-3xl p-6 shadow-2xl flex flex-col justify-between transition-all duration-300 hover:-translate-y-1.5 group overflow-hidden border ${
                  isGold 
                    ? 'bg-gradient-to-b from-[#22234A] to-[#11162B] border-[#9575FF]/50 shadow-[0_10px_35px_rgba(149,117,255,0.15)]'
                    : isSilver 
                    ? 'bg-gradient-to-b from-[#22234A] to-[#11162B] border-[#20D6C2]/40 shadow-[0_10px_35px_rgba(32,214,194,0.12)]'
                    : 'bg-gradient-to-b from-[#22234A]/90 to-[#11162B] border-[#FF7185]/35 shadow-[0_10px_30px_rgba(255,113,133,0.1)]'
                }`}
              >
                {/* Ambient Highlight */}
                <div className={`absolute -top-16 -right-16 w-36 h-36 rounded-full blur-3xl opacity-20 ${
                  isGold ? 'bg-[#9575FF]' : isSilver ? 'bg-[#20D6C2]' : 'bg-[#FF7185]'
                }`} />

                <div>
                  <div className="flex justify-between items-center mb-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-black border ${
                      isGold 
                        ? 'bg-[#9575FF]/20 text-[#EAF2FF] border-[#9575FF]/50'
                        : isSilver
                        ? 'bg-[#20D6C2]/20 text-[#20D6C2] border-[#20D6C2]/50'
                        : 'bg-[#FF7185]/20 text-[#FF7185] border-[#FF7185]/50'
                    }`}>
                      {room.badge}
                    </span>
                    <div className="flex items-center gap-1.5 text-xs text-[#EAF2FF] bg-[#11162B]/80 px-3 py-1 rounded-xl border border-[#22234A]">
                      <Users className="w-3.5 h-3.5 text-[#20D6C2]" />
                      <span>ظرفیت میز: ۱۰ بازیکن</span>
                    </div>
                  </div>

                  <h4 className="text-xl md:text-2xl font-black text-[#EAF2FF] mb-1 group-hover:text-[#20D6C2] transition-colors">
                    {room.name}
                  </h4>
                  <p className="text-xs text-[#EAF2FF]/60 mb-6">{room.tag}</p>

                  <div className="space-y-3 bg-[#11162B]/90 p-4 rounded-2xl border border-[#22234A] mb-6 text-xs">
                    <div className="flex justify-between text-[#EAF2FF]/70">
                      <span>ورودی هر کارت:</span>
                      <span className="font-bold text-[#EAF2FF]">{room.entry.toLocaleString('fa-IR')} سکه</span>
                    </div>
                    <div className="flex justify-between text-[#EAF2FF]/70">
                      <span>فاکتور ورود ({cardCount} کارت):</span>
                      <span className="font-bold text-[#20D6C2]">{totalEntry.toLocaleString('fa-IR')} سکه</span>
                    </div>
                    <div className="flex justify-between text-[#EAF2FF]/80 pt-2.5 border-t border-[#22234A]">
                      <span className="flex items-center gap-1">
                        <Trophy className="w-3.5 h-3.5 text-[#20D6C2]" />
                        سقف صندوق میز (۱۰ بازیکن):
                      </span>
                      <span className="font-black text-[#20D6C2] text-sm">
                        {netPot.toLocaleString('fa-IR')} سکه
                      </span>
                    </div>
                  </div>
                </div>

                <button 
                  type="button"
                  onClick={() => onJoinRoom(room)}
                  className={`w-full py-3.5 rounded-2xl font-black text-xs sm:text-sm shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    isGold
                      ? 'bg-gradient-to-r from-[#20D6C2] to-[#9575FF] text-[#11162B] shadow-[#9575FF]/20 hover:brightness-125'
                      : isSilver
                      ? 'bg-gradient-to-r from-[#20D6C2] to-[#20D6C2] text-[#11162B] shadow-[#20D6C2]/20 hover:brightness-110'
                      : 'bg-gradient-to-r from-[#FF7185] to-[#9575FF] text-[#11162B] shadow-[#FF7185]/20 hover:brightness-110'
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  <span>ورود به بازی ({totalEntry.toLocaleString('fa-IR')} سکه)</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

    </main>
  );
};
