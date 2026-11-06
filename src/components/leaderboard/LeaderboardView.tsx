import React from 'react';
import { Trophy, Flame, Award, Shield } from 'lucide-react';

interface LeaderboardItem {
  rank: number;
  name: string;
  wins: number;
  totalWon: number;
  badge: string;
}

interface LeaderboardViewProps {
  leaderboard: LeaderboardItem[];
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({ leaderboard }) => {
  return (
    <main className="max-w-4xl mx-auto px-4 mt-8">
      <div className="bg-gradient-to-br from-[#22234A] to-[#11162B] rounded-3xl border border-[#9575FF]/30 p-6 sm:p-8 shadow-2xl backdrop-blur relative overflow-hidden">
        
        {/* Glow Accents */}
        <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-[#20D6C2]/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-[#9575FF]/15 blur-3xl pointer-events-none" />

        <div className="flex items-center gap-3.5 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#20D6C2] to-[#9575FF] p-0.5 shadow-lg shadow-[#9575FF]/20 flex items-center justify-center">
            <div className="w-full h-full bg-[#11162B] rounded-[14px] flex items-center justify-center">
              <Trophy className="w-6 h-6 text-[#20D6C2]" />
            </div>
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-black text-[#EAF2FF]">تالار قهرمانان و برترین‌ها</h2>
            <p className="text-xs text-[#EAF2FF]/60 mt-0.5">رده‌بندی برترین بازیکنان دبرنا بر اساس بیشترین سود ثبت‌شده در سرور</p>
          </div>
        </div>

        <div className="space-y-3">
          {leaderboard.map((player) => {
            const isTop1 = player.rank === 1;
            const isTop2 = player.rank === 2;
            const isTop3 = player.rank === 3;

            return (
              <div 
                key={player.rank} 
                className={`flex items-center justify-between p-4 rounded-2xl border transition-all duration-200 ${
                  isTop1 
                    ? 'bg-gradient-to-r from-[#22234A] via-[#11162B] to-[#22234A] border-[#20D6C2]/60 shadow-[0_0_20px_rgba(32,214,194,0.15)] scale-[1.01]' 
                    : isTop2
                    ? 'bg-[#22234A]/80 border-[#9575FF]/40'
                    : isTop3
                    ? 'bg-[#22234A]/60 border-[#FF7185]/35'
                    : 'bg-[#11162B]/80 border-[#22234A]'
                }`}
              >
                <div className="flex items-center gap-4">
                  <span className={`w-8 font-black text-center text-sm md:text-base ${
                    isTop1 ? 'text-[#20D6C2]' : isTop2 ? 'text-[#9575FF]' : isTop3 ? 'text-[#FF7185]' : 'text-[#EAF2FF]/60'
                  }`}>
                    {player.badge}
                  </span>
                  <div>
                    <h4 className="font-bold text-sm text-[#EAF2FF] flex items-center gap-1.5">
                      {player.name}
                      {isTop1 && <Flame className="w-3.5 h-3.5 text-[#20D6C2]" />}
                    </h4>
                    <span className="text-[11px] text-[#EAF2FF]/50">{player.wins} بار دبرنا شده</span>
                  </div>
                </div>

                <div className="text-left">
                  <span className="block font-black text-[#20D6C2] text-sm md:text-base">
                    {player.totalWon.toLocaleString('fa-IR')} سکه
                  </span>
                  <span className="text-[10px] text-[#9575FF]">مجموع جوایز دریافتی</span>
                </div>
              </div>
            );
          })}

          {leaderboard.length === 0 && (
            <div className="text-center text-[#EAF2FF]/40 py-8 text-xs">
              در حال به‌روزرسانی رده‌بندی قهرمانان از سرور...
            </div>
          )}
        </div>
      </div>
    </main>
  );
};
