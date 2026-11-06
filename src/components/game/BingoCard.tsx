import React from 'react';
import { Sparkles, Check } from 'lucide-react';
import { CardSkin, MarkerSkin } from '../../types';
import { BingoCardMatrix } from '../../utils/bingo';

interface BingoCardProps {
  card: BingoCardMatrix;
  cardIndex: number;
  markedNumbers: Set<number>;
  currentNumber: number | null;
  cardSkin: CardSkin;
  markerSkin: MarkerSkin;
  onCellClick: (val: number) => void;
}

export const BingoCard: React.FC<BingoCardProps> = ({
  card,
  cardIndex,
  markedNumbers,
  currentNumber,
  cardSkin,
  markerSkin,
  onCellClick
}) => {
  // Futuristic Gaming card skins
  const getCardSkinStyle = () => {
    if (cardSkin === 'wood') {
      return 'bg-gradient-to-br from-[#11162B] via-[#22234A] to-[#11162B] border-[#FF7185]/40 shadow-[0_8px_30px_rgba(255,113,133,0.15)]';
    }
    if (cardSkin === 'classic') {
      return 'bg-gradient-to-br from-[#11162B] via-[#11162B] to-[#22234A] border-[#20D6C2]/35 shadow-[0_8px_30px_rgba(32,214,194,0.12)]';
    }
    // Neon Violet & Electric Turquoise VIP
    return 'bg-gradient-to-br from-[#22234A] via-[#11162B] to-[#22234A] border-[#9575FF]/45 shadow-[0_8px_32px_rgba(149,117,255,0.2)]';
  };

  // Futuristic markers optimized for mobile & desktop touch
  const renderMarker = (val: number) => {
    if (markerSkin === 'coin') {
      return (
        <div className="absolute inset-0.5 bg-gradient-to-tr from-[#9575FF] via-[#20D6C2] to-[#EAF2FF] border border-[#20D6C2] rounded-md sm:rounded-lg flex items-center justify-center shadow-md shadow-[#20D6C2]/40 animate-in fade-in zoom-in duration-150">
          <span className="text-[#11162B] font-black text-[10px] xs:text-xs sm:text-sm drop-shadow">{val}</span>
        </div>
      );
    }
    if (markerSkin === 'emerald') {
      return (
        <div className="absolute inset-0.5 bg-gradient-to-tr from-[#11162B] via-[#20D6C2] to-[#EAF2FF] border sm:border-2 border-[#20D6C2] rounded-md sm:rounded-lg flex items-center justify-center shadow-md shadow-[#20D6C2]/50 animate-in fade-in zoom-in duration-150">
          <span className="text-[#11162B] font-black text-[10px] xs:text-xs sm:text-sm">{val}</span>
        </div>
      );
    }
    if (markerSkin === 'diamond') {
      return (
        <div className="absolute inset-0.5 bg-gradient-to-tr from-[#22234A] via-[#9575FF] to-[#EAF2FF] border sm:border-2 border-[#9575FF] rounded-md sm:rounded-lg flex items-center justify-center shadow-md shadow-[#9575FF]/50 animate-in fade-in zoom-in duration-150">
          <span className="text-[#EAF2FF] font-black text-[10px] xs:text-xs sm:text-sm drop-shadow">{val}</span>
        </div>
      );
    }
    // Default: Cyber Bean (لوبیا نئونی سنتی-مدرن دبرنا)
    return (
      <div className="absolute inset-0.5 bg-gradient-to-tr from-[#FF7185] via-[#9575FF] to-[#20D6C2] border border-[#EAF2FF] rounded-md sm:rounded-lg flex items-center justify-center shadow-md shadow-[#FF7185]/40 animate-in fade-in zoom-in duration-150">
        <span className="text-[#11162B] font-black text-[10px] xs:text-xs sm:text-sm drop-shadow">{val}</span>
        <div className="w-1.5 sm:w-2 h-0.5 sm:h-1 bg-[#EAF2FF] rounded-full absolute bottom-0.5 rotate-12 shadow" />
      </div>
    );
  };

  // Calculate completed lines
  let completedLines = 0;
  for (let r = 0; r < 3; r++) {
    let full = true;
    for (let c = 0; c < 9; c++) {
      const v = card[r][c];
      if (v !== null && !markedNumbers.has(v)) {
        full = false;
        break;
      }
    }
    if (full) completedLines++;
  }

  return (
    <div className={`p-2.5 sm:p-5 rounded-2xl sm:rounded-3xl border ${getCardSkinStyle()} relative overflow-hidden transition-all duration-200`}>
      
      {/* Card Header info */}
      <div className="flex justify-between items-center mb-2 sm:mb-3">
        <span className="text-xs sm:text-sm font-bold text-[#20D6C2] flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#9575FF]" /> کارت بازی شماره {cardIndex + 1}
        </span>
        <div className="flex items-center gap-2">
          {completedLines > 0 && (
            <span className="px-2 sm:px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-black bg-[#20D6C2]/20 text-[#20D6C2] border border-[#20D6C2]/40 flex items-center gap-1 shadow-[0_0_10px_rgba(32,214,194,0.3)] animate-pulse">
              <Check className="w-3 h-3" /> {completedLines === 3 ? 'دبرنا کامل!' : `${completedLines} خط تکمیل شد`}
            </span>
          )}
        </div>
      </div>

      {/* 3x9 Matrix Grid - Mobile Responsive with precise touch targets */}
      <div className="grid grid-cols-9 gap-1 sm:gap-1.5 p-1.5 sm:p-3 rounded-xl sm:rounded-2xl bg-[#11162B]/90 border border-[#22234A] shadow-inner">
        {card.map((row, rIdx) => 
          row.map((cellVal, cIdx) => {
            const isEmpty = cellVal === null;
            const isMarked = cellVal !== null && markedNumbers.has(cellVal);
            const isJustDrawn = cellVal === currentNumber;

            if (isEmpty) {
              return (
                <div 
                  key={`${rIdx}-${cIdx}`}
                  className="aspect-[4/3] min-h-[26px] sm:min-h-[36px] rounded-md sm:rounded-lg border border-[#22234A]/40 bg-[#22234A]/20 flex items-center justify-center opacity-40 select-none"
                >
                  <div className="w-1 sm:w-1.5 h-1 sm:h-1.5 rounded-full bg-[#9575FF]/30" />
                </div>
              );
            }

            return (
              <button
                key={`${rIdx}-${cIdx}`}
                type="button"
                onClick={() => onCellClick(cellVal)}
                className={`aspect-[4/3] min-h-[26px] sm:min-h-[36px] rounded-md sm:rounded-lg font-black text-[11px] xs:text-xs sm:text-base transition-all duration-150 flex flex-col items-center justify-center relative overflow-hidden select-none cursor-pointer touch-manipulation ${
                  isMarked
                    ? 'scale-95'
                    : isJustDrawn
                    ? 'bg-[#20D6C2]/30 text-[#EAF2FF] border-2 border-[#20D6C2] shadow-[0_0_15px_rgba(32,214,194,0.6)] animate-pulse scale-105'
                    : 'bg-[#22234A] text-[#EAF2FF] border border-[#9575FF]/20 hover:border-[#20D6C2]/60 hover:bg-[#22234A]/90 active:scale-95'
                }`}
              >
                <span>{cellVal}</span>
                {isMarked && renderMarker(cellVal)}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};
