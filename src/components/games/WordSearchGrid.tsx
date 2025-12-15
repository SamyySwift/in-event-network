import { useState, useEffect, useCallback, useRef } from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface WordSearchGridProps {
  grid: any[][];
  words: string[];
  onWordFound: (word: string) => void;
  foundWords: Set<string>;
  isGameActive: boolean;
  hintCells?: Set<string>;
}

// Fun colors for the grid cells
const CELL_COLORS = [
  'bg-pink-200 border-pink-400',
  'bg-blue-200 border-blue-400',
  'bg-green-200 border-green-400',
  'bg-yellow-200 border-yellow-400',
  'bg-purple-200 border-purple-400',
  'bg-cyan-200 border-cyan-400',
  'bg-orange-200 border-orange-400',
];

export const WordSearchGrid = ({
  grid,
  words,
  onWordFound,
  foundWords,
  isGameActive,
  hintCells = new Set(),
}: WordSearchGridProps) => {
  const [selectedCells, setSelectedCells] = useState<Set<string>>(new Set());
  const [isDragging, setIsDragging] = useState(false);
  const [currentSelection, setCurrentSelection] = useState<string[]>([]);
  const gridRef = useRef<HTMLDivElement>(null);

  const getCellKey = (row: number, col: number) => `${row}-${col}`;
  
  // Get a consistent color for each cell based on position
  const getCellColor = (row: number, col: number) => {
    const index = (row + col) % CELL_COLORS.length;
    return CELL_COLORS[index];
  };

  // Check if cell is a hint cell
  const isHintCell = (row: number, col: number) => hintCells.has(getCellKey(row, col));

  const checkWord = useCallback(() => {
    if (currentSelection.length === 0) return;

    const selectedLetters = currentSelection
      .map((key) => {
        const [row, col] = key.split('-').map(Number);
        return grid[row][col].letter;
      })
      .join('');

    // Check both forward and backward
    const foundWord = words.find(
      (word) =>
        (word.toUpperCase() === selectedLetters ||
        word.toUpperCase() === selectedLetters.split('').reverse().join('')) &&
        !foundWords.has(word.toUpperCase())
    );

    if (foundWord) {
      setSelectedCells((prev) => new Set([...prev, ...currentSelection]));
      onWordFound(foundWord.toUpperCase());
    }
  }, [currentSelection, grid, words, foundWords, onWordFound]);

  const handleStart = useCallback((row: number, col: number, e: React.MouseEvent | React.TouchEvent) => {
    if (!isGameActive) return;
    e.preventDefault();
    setIsDragging(true);
    const key = getCellKey(row, col);
    setCurrentSelection([key]);
  }, [isGameActive]);

  const handleMove = useCallback((row: number, col: number) => {
    if (!isDragging || !isGameActive) return;
    const key = getCellKey(row, col);
    setCurrentSelection((prev) => {
      // Prevent adding the same cell multiple times in sequence
      if (prev[prev.length - 1] === key) return prev;
      return [...prev, key];
    });
  }, [isDragging, isGameActive]);

  const handleEnd = useCallback(() => {
    if (!isGameActive || !isDragging) return;
    setIsDragging(false);
    checkWord();
    setCurrentSelection([]);
  }, [isGameActive, isDragging, checkWord]);

  // Mouse events
  const handleMouseDown = (row: number, col: number, e: React.MouseEvent) => {
    handleStart(row, col, e);
  };

  const handleMouseEnter = (row: number, col: number) => {
    handleMove(row, col);
  };

  // Touch events
  const handleTouchStart = (row: number, col: number, e: React.TouchEvent) => {
    handleStart(row, col, e);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !isGameActive) return;
    e.preventDefault();
    
    const touch = e.touches[0];
    const element = document.elementFromPoint(touch.clientX, touch.clientY);
    
    if (element && element.hasAttribute('data-cell')) {
      const row = parseInt(element.getAttribute('data-row') || '0');
      const col = parseInt(element.getAttribute('data-col') || '0');
      handleMove(row, col);
    }
  };

  useEffect(() => {
    const handleMouseUp = () => handleEnd();
    const handleTouchEnd = () => handleEnd();

    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchend', handleTouchEnd);
    
    return () => {
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleEnd]);

  // Responsive cell sizing based on grid size - smaller tiles for larger grids
  const gridLength = grid[0]?.length || 10;
  const getCellClasses = () => {
    // 13x13 (hard) - smallest tiles
    if (gridLength >= 13) {
      return 'w-5 h-5 text-[9px] sm:w-6 sm:h-6 sm:text-[10px] md:w-7 md:h-7 md:text-xs';
    }
    // 12x12 (medium) - medium tiles
    if (gridLength >= 12) {
      return 'w-6 h-6 text-[10px] sm:w-7 sm:h-7 sm:text-xs md:w-8 md:h-8 md:text-sm';
    }
    // 10x10 (easy) - largest tiles
    return 'w-7 h-7 text-xs sm:w-8 sm:h-8 sm:text-sm md:w-10 md:h-10 md:text-base';
  };

  return (
    <div className="inline-block select-none w-full overflow-x-auto touch-none">
      <div
        ref={gridRef}
        className="grid gap-1 sm:gap-1.5 p-3 sm:p-4 bg-blue-400 rounded-2xl border-4 border-blue-600 shadow-xl mx-auto select-none"
        style={{
          gridTemplateColumns: `repeat(${grid[0].length}, minmax(0, 1fr))`,
          maxWidth: 'min(100%, 600px)',
        }}
        onTouchMove={handleTouchMove}
      >
        {grid.map((row, rowIndex) =>
          row.map((cell, colIndex) => {
            const key = getCellKey(rowIndex, colIndex);
            const isSelected = selectedCells.has(key);
            const isCurrentlySelecting = currentSelection.includes(key);
            const cellColor = getCellColor(rowIndex, colIndex);

            return (
              <motion.div
                key={key}
                data-cell="true"
                data-row={rowIndex}
                data-col={colIndex}
                className={cn(
                  getCellClasses(),
                  'flex items-center justify-center font-black rounded-lg cursor-pointer select-none touch-none border-3 shadow-sm',
                  isSelected && 'bg-green-500 text-white border-green-700 scale-110 shadow-lg',
                  isCurrentlySelecting && !isSelected && 'bg-orange-500 text-white border-orange-700 scale-110 shadow-md',
                  !isSelected && !isCurrentlySelecting && isHintCell(rowIndex, colIndex) && 'bg-yellow-300 border-yellow-500 text-gray-800 shadow-[0_0_15px_rgba(250,204,21,0.8)]',
                  !isSelected && !isCurrentlySelecting && !isHintCell(rowIndex, colIndex) && `${cellColor} text-gray-800`
                )}
                style={{
                  userSelect: 'none',
                  WebkitUserSelect: 'none',
                  msUserSelect: 'none',
                  WebkitTouchCallout: 'none',
                }}
                initial={false}
                animate={
                  isCurrentlySelecting && !isSelected
                    ? {
                        scale: [1, 1.15, 1.1],
                        transition: { duration: 0.2 }
                      }
                    : isSelected
                    ? {
                        rotate: [0, -5, 5, 0],
                        scale: 1.1,
                        transition: { duration: 0.3 }
                      }
                    : { scale: 1, rotate: 0 }
                }
                onMouseDown={(e) => handleMouseDown(rowIndex, colIndex, e)}
                onMouseEnter={() => handleMouseEnter(rowIndex, colIndex)}
                onTouchStart={(e) => handleTouchStart(rowIndex, colIndex, e)}
                onDragStart={(e) => e.preventDefault()}
              >
                <span className="select-none pointer-events-none">
                  {cell.letter}
                </span>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
};
