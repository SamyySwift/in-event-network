export interface GridCell {
  letter: string;
  isPartOfWord: boolean;
  wordIndex?: number;
}

export interface WordPosition {
  word: string;
  startRow: number;
  startCol: number;
  direction: 'horizontal' | 'vertical' | 'diagonal';
}

const DIRECTIONS = [
  { dx: 1, dy: 0, name: 'horizontal' },
  { dx: 0, dy: 1, name: 'vertical' },
  { dx: 1, dy: 1, name: 'diagonal' },
] as const;

export const generateWordSearchGrid = (
  words: string[],
  gridSize: number = 15
): { grid: GridCell[][]; positions: WordPosition[] } => {
  const grid: GridCell[][] = Array(gridSize)
    .fill(null)
    .map(() =>
      Array(gridSize)
        .fill(null)
        .map(() => ({ letter: '', isPartOfWord: false }))
    );

  const positions: WordPosition[] = [];
  const upperWords = words.map(w => w.toUpperCase());

  // Try to place each word
  upperWords.forEach((word, wordIndex) => {
    let placed = false;
    let attempts = 0;
    const maxAttempts = 100;

    while (!placed && attempts < maxAttempts) {
      attempts++;
      
      const direction = DIRECTIONS[Math.floor(Math.random() * DIRECTIONS.length)];
      const startRow = Math.floor(Math.random() * gridSize);
      const startCol = Math.floor(Math.random() * gridSize);

      if (canPlaceWord(grid, word, startRow, startCol, direction.dx, direction.dy, gridSize)) {
        placeWord(grid, word, startRow, startCol, direction.dx, direction.dy, wordIndex);
        positions.push({
          word,
          startRow,
          startCol,
          direction: direction.name as any,
        });
        placed = true;
      }
    }
  });

  // Fill empty cells with random letters
  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      if (!grid[i][j].letter) {
        grid[i][j].letter = String.fromCharCode(65 + Math.floor(Math.random() * 26));
      }
    }
  }

  return { grid, positions };
};

const canPlaceWord = (
  grid: GridCell[][],
  word: string,
  row: number,
  col: number,
  dx: number,
  dy: number,
  gridSize: number
): boolean => {
  const endRow = row + (word.length - 1) * dy;
  const endCol = col + (word.length - 1) * dx;

  if (endRow >= gridSize || endCol >= gridSize || endRow < 0 || endCol < 0) {
    return false;
  }

  for (let i = 0; i < word.length; i++) {
    const r = row + i * dy;
    const c = col + i * dx;
    const cell = grid[r][c];
    
    if (cell.letter && cell.letter !== word[i]) {
      return false;
    }
  }

  return true;
};

const placeWord = (
  grid: GridCell[][],
  word: string,
  row: number,
  col: number,
  dx: number,
  dy: number,
  wordIndex: number
): void => {
  for (let i = 0; i < word.length; i++) {
    const r = row + i * dy;
    const c = col + i * dx;
    grid[r][c] = {
      letter: word[i],
      isPartOfWord: true,
      wordIndex,
    };
  }
};
