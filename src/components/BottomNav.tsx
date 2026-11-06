import React from 'react';
import { Play, Award, User } from 'lucide-react';

interface BottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab }) => {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#11162B]/95 backdrop-blur-xl border-t border-[#22234A] px-3 py-2 flex justify-around items-center shadow-[0_-10px_25px_rgba(0,0,0,0.5)]">
      <button 
        onClick={() => setActiveTab('lobby')} 
        className={`flex flex-col items-center gap-1 text-[11px] font-bold px-3 py-1 rounded-xl transition ${
          activeTab === 'lobby' 
            ? 'text-[#20D6C2] bg-[#20D6C2]/10 shadow-[0_0_15px_rgba(32,214,194,0.2)]' 
            : 'text-slate-400 hover:text-white'
        }`}
      >
        <Play className="w-5 h-5" />
        <span>اتاق‌ها</span>
      </button>
      <button 
        onClick={() => setActiveTab('leaderboard')} 
        className={`flex flex-col items-center gap-1 text-[11px] font-bold px-3 py-1 rounded-xl transition ${
          activeTab === 'leaderboard' 
            ? 'text-[#9575FF] bg-[#9575FF]/10 shadow-[0_0_15px_rgba(149,117,255,0.2)]' 
            : 'text-slate-400 hover:text-white'
        }`}
      >
        <Award className="w-5 h-5" />
        <span>برترین‌ها</span>
      </button>
      <button 
        onClick={() => setActiveTab('profile')} 
        className={`flex flex-col items-center gap-1 text-[11px] font-bold px-3 py-1 rounded-xl transition ${
          activeTab === 'profile' 
            ? 'text-[#20D6C2] bg-[#20D6C2]/10 shadow-[0_0_15px_rgba(32,214,194,0.2)]' 
            : 'text-slate-400 hover:text-white'
        }`}
      >
        <User className="w-5 h-5" />
        <span>پروفایل</span>
      </button>
    </div>
  );
};
