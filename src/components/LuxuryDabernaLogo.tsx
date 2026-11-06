import React from 'react';

export const LuxuryDabernaLogo: React.FC = () => (
  <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#20D6C2] via-[#9575FF] to-[#FF7185] p-0.5 shadow-lg shadow-[#9575FF]/30 flex items-center justify-center group transition-transform duration-300 hover:scale-105">
    {/* Outer Energy Pulse */}
    <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-[#20D6C2] to-[#9575FF] opacity-40 blur-sm animate-pulse" />
    
    {/* Inner Core */}
    <div className="relative w-full h-full bg-[#11162B] rounded-[14px] flex items-center justify-center border border-[#9575FF]/40 overflow-hidden">
      {/* Dynamic ambient highlight */}
      <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-[#20D6C2]/20 blur-sm" />
      <div className="absolute -bottom-3 -left-3 w-8 h-8 rounded-full bg-[#9575FF]/25 blur-sm" />
      
      <span className="relative text-transparent bg-clip-text bg-gradient-to-b from-[#EAF2FF] via-[#20D6C2] to-[#9575FF] font-black text-xl tracking-tighter drop-shadow-[0_0_8px_rgba(32,214,194,0.7)]">
        ۹۰
      </span>
    </div>
  </div>
);
