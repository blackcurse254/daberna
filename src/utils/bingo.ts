/**
 * 3x9 Traditional 90-ball Daberna / Bingo Card Generator & Validators
 */

export type BingoCardMatrix = (number | null)[][];

export const generateBingoCard = (): BingoCardMatrix => {
  const card: BingoCardMatrix = Array.from({ length: 3 }, () => Array(9).fill(null));

  for (let r = 0; r < 3; r++) {
    const colIndices: number[] = [];
    while (colIndices.length < 5) {
      const idx = Math.floor(Math.random() * 9);
      if (!colIndices.includes(idx)) colIndices.push(idx);
    }
    colIndices.sort((a, b) => a - b);

    colIndices.forEach((c) => {
      const min = c === 0 ? 1 : c * 10;
      const max = c === 8 ? 90 : c * 10 + 9;
      let val: number;
      let attempts = 0;
      do {
        val = Math.floor(Math.random() * (max - min + 1)) + min;
        attempts++;
      } while (
        (card[0][c] === val || card[1][c] === val || card[2][c] === val) &&
        attempts < 50
      );
      card[r][c] = val;
    });
  }

  return card;
};

export const checkCardCompletedLines = (
  card: BingoCardMatrix,
  drawnOrMarked: Set<number> | number[]
): number => {
  const checkSet = drawnOrMarked instanceof Set ? drawnOrMarked : new Set(drawnOrMarked);
  let completed = 0;

  for (let r = 0; r < 3; r++) {
    let full = true;
    for (let c = 0; c < 9; c++) {
      const val = card[r][c];
      if (val !== null && !checkSet.has(val)) {
        full = false;
        break;
      }
    }
    if (full) completed++;
  }

  return completed;
};

export const checkCardFullHouse = (
  card: BingoCardMatrix,
  drawnOrMarked: Set<number> | number[]
): boolean => {
  const checkSet = drawnOrMarked instanceof Set ? drawnOrMarked : new Set(drawnOrMarked);

  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 9; c++) {
      const val = card[r][c];
      if (val !== null && !checkSet.has(val)) {
        return false;
      }
    }
  }

  return true;
};
