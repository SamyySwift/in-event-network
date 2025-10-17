import { useState, useEffect, useCallback, useRef } from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface WordSearchGridProps {
  grid: any[][];
  words: string[];
  onWordFound: (word: string) => void;
  foundWords: Set<string>;
  isGameActive: boolean;
}

export const WordSearchGrid = ({
  grid,
  words,
  onWordFound,
  foundWords,
  isGameActive,
}: WordSearchGridProps) => {
  const [selectedCells, setSelectedCells] = useState<Set<string>>(new Set());
  const [isDragging, setIsDragging] = useState(false);
  const [currentSelection, setCurrentSelection] = useState<string[]>([]);
  const gridRef = useRef<HTMLDivElement>(null);

  const getCellKey = (row: number, col: number) => `${row}-${col}`;

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

  // Responsive cell sizing based on grid size and screen
  const gridLength = grid[0].length;
  const getCellClasses = () => {
    if (gridLength > 15) {
      return 'w-5 h-5 text-[10px] sm:w-6 sm:h-6 sm:text-xs md:w-7 md:h-7 md:text-sm';
    }
    return 'w-6 h-6 text-xs sm:w-7 sm:h-7 sm:text-sm md:w-8 md:h-8 md:text-base';
  };

  return (
    <div className="inline-block select-none w-full overflow-x-auto touch-none">
      <div
        ref={gridRef}
        className="grid gap-0.5 sm:gap-1 p-2 sm:p-4 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 rounded-lg border-2 border-primary/20 shadow-lg mx-auto select-none"
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
            const selectionIndex = currentSelection.indexOf(key);

            return (
              <motion.div
                key={key}
                data-cell="true"
                data-row={rowIndex}
                data-col={colIndex}
                className={cn(
                  getCellClasses(),
                  'flex items-center justify-center font-bold rounded cursor-pointer select-none touch-none',
                  isSelected && 'bg-gradient-to-br from-green-400 to-green-600 text-white shadow-lg scale-105 ring-2 ring-green-300',
                  isCurrentlySelecting && !isSelected && 'bg-gradient-to-br from-primary to-secondary text-white shadow-md scale-105 ring-2 ring-primary/50',
                  !isSelected && !isCurrentlySelecting && 'bg-white dark:bg-gray-800 hover:bg-primary/10 shadow-sm'
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
                        scale: [1, 1.1, 1.05],
                        transition: { duration: 0.2 }
                      }
                    : isSelected
                    ? {
                        rotate: [0, -5, 5, 0],
                        scale: 1.05,
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