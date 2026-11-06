import React from 'react';
import { Radio } from 'lucide-react';

interface Spinner3DProps {
  currentNumber: number | null;
  drawnCount: number;
}

export const Spinner3D: React.FC<Spinner3DProps> = ({ currentNumber, drawnCount }) => {
  return (
    <div className="relative bg-gradient-to-b from-[#22234A] to-[#11162B] p-6 rounded-3xl border border-[#9575FF]/30 text-center shadow-[0_8px_32px_rgba(17,22,43,0.8)] overflow-hidden">
      
      {/* Background Energy Glows */}
      <div className="absolute -top-12 -left-12 w-32 h-32 rounded-full bg-[#20D6C2]/15 blur-2xl pointer-events-none" />
      <div className="absolute -bottom-12 -right-12 w-32 h-32 rounded-full bg-[#9575FF]/20 blur-2xl pointer-events-none" />

      {/* Header Pill */}
      <div className="inline-flex items-center gap-2 text-[10px] text-[#20D6C2] font-black px-3.5 py-1.5 rounded-full bg-[#11162B] border border-[#20D6C2]/30 mb-4 shadow-[0_0_12px_rgba(32,214,194,0.15)]">
        <Radio className="w-3.5 h-3.5 text-[#20D6C2] animate-pulse" />
        <span>گردونه کوانتومی دیجیتال</span>
      </div>

      <h3 className="text-xs font-bold text-[#EAF2FF]/60 mb-3">شماره استخراج‌شده لحظه‌ای</h3>

      {/* 3D Kinetic Holographic Sphere */}
      <div className="relative w-40 h-40 mx-auto mb-4 select-none">
        
        {/* Luminous Orbital Energy Ring */}
        <div 
          className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#20D6C2] via-[#9575FF] to-[#FF7185] p-1 shadow-[0_0_35px_rgba(149,117,255,0.4)] animate-spin" 
          style={{ animationDuration: '10s' }}
        />
        
        {/* Glass Refraction Inner Drum */}
        <div className="relative w-full h-full rounded-full bg-gradient-to-br from-[#11162B] via-[#22234A] to-[#11162B] flex flex-col items-center justify-center border-4 border-[#20D6C2]/60 shadow-inner overflow-hidden">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#20D6C2] via-[#9575FF] to-transparent" />
          
          <span className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-[#EAF2FF] via-[#20D6C2] to-[#9575FF] tracking-tighter drop-shadow-[0_0_16px_rgba(32,214,194,0.85)] animate-bounce">
            {currentNumber !== null ? currentNumber : '--'}
          </span>
          <span className="text-[10px] text-[#EAF2FF]/70 font-bold mt-1 tracking-wider">از ۹۰</span>
        </div>
      </div>

      <p className="text-[11px] text-[#EAF2FF]/70 font-medium">
        سرعت خروج هوشمند: هر ۳٫۲ ثانیه
      </p>

      <div className="mt-2.5 inline-block px-3.5 py-1 rounded-xl bg-[#11162B] border border-[#22234A] text-[11px] text-[#20D6C2] font-mono font-bold shadow-inner">
        {drawnCount} شماره خارج شده
      </div>
    </div>
  );
};
