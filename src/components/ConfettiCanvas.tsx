import React from 'react';

interface ConfettiCanvasProps {
  active: boolean;
}

export const ConfettiCanvas: React.FC<ConfettiCanvasProps> = ({ active }) => {
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
