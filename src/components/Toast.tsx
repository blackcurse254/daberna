import React from 'react';
import { AlertCircle } from 'lucide-react';

interface ToastProps {
  message: string | null;
}

export const Toast: React.FC<ToastProps> = ({ message }) => {
  if (!message) return null;
  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-[#11162B]/95 text-[#EAF2FF] px-4 py-2.5 rounded-2xl font-bold text-xs shadow-[0_0_25px_rgba(32,214,194,0.35)] flex items-center gap-2.5 border border-[#20D6C2]/50 backdrop-blur-xl animate-fade-in">
      <AlertCircle className="w-4 h-4 shrink-0 text-[#20D6C2] animate-pulse" />
      <span className="tracking-wide">{message}</span>
    </div>
  );
};
