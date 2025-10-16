import { useState, useEffect } from 'react';
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

  const getCellKey = (row: number, col: number) => `${row}-${col}`;

  const handleMouseDown = (row: number, col: number) => {
    if (!isGameActive) return;
    setIsDragging(true);
    const key = getCellKey(row, col);
    setCurrentSelection([key]);
  };

  const handleMouseEnter = (row: number, col: number) => {
    if (!isDragging || !isGameActive) return;
    const key = getCellKey(row, col);
    setCurrentSelection((prev) => [...prev, key]);
  };

  const handleMouseUp = () => {
    if (!isGameActive) return;
    setIsDragging(false);
    checkWord();
    setCurrentSelection([]);
  };

  const checkWord = () => {
    if (currentSelection.length === 0) return;

    const selectedLetters = currentSelection
      .map((key) => {
        const [row, col] = key.split('-').map(Number);
        return grid[row][col].letter;
      })
      .join('');

    const foundWord = words.find(
      (word) =>
        word.toUpperCase() === selectedLetters &&
        !foundWords.has(word.toUpperCase())
    );

    if (foundWord) {
      setSelectedCells((prev) => new Set([...prev, ...currentSelection]));
      onWordFound(foundWord.toUpperCase());
    }
  };

  useEffect(() => {
    window.addEventListener('mouseup', handleMouseUp);
    return () => window.removeEventListener('mouseup', handleMouseUp);
  }, [isDragging, currentSelection]);

  // Responsive cell sizing based on grid size and screen
  const gridLength = grid[0].length;
  const getCellClasses = () => {
    if (gridLength > 15) {
      return 'w-5 h-5 text-[10px] sm:w-6 sm:h-6 sm:text-xs md:w-7 md:h-7 md:text-sm';
    }
    return 'w-6 h-6 text-xs sm:w-7 sm:h-7 sm:text-sm md:w-8 md:h-8 md:text-base';
  };

  return (
    <div className="inline-block select-none w-full overflow-x-auto">
      <div
        className="grid gap-0.5 sm:gap-1 p-2 sm:p-4 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 rounded-lg border-2 border-primary/20 shadow-lg mx-auto"
        style={{
          gridTemplateColumns: `repeat(${grid[0].length}, minmax(0, 1fr))`,
          maxWidth: 'min(100%, 600px)',
        }}
      >
        {grid.map((row, rowIndex) =>
          row.map((cell, colIndex) => {
            const key = getCellKey(rowIndex, colIndex);
            const isSelected = selectedCells.has(key);
            const isCurrentlySelecting = currentSelection.includes(key);

            return (
              <motion.div
                key={key}
                className={cn(
                  getCellClasses(),
                  'flex items-center justify-center font-bold rounded cursor-pointer transition-all duration-200',
                  isSelected && 'bg-gradient-to-br from-green-400 to-green-600 text-white shadow-md scale-105 ring-1 ring-green-300',
                  isCurrentlySelecting && !isSelected && 'bg-gradient-to-br from-primary to-primary-foreground text-primary-foreground shadow-sm scale-105',
                  !isSelected && !isCurrentlySelecting && 'bg-white dark:bg-gray-800 hover:bg-primary/10 hover:scale-105 shadow-sm'
                )}
                whileHover={{ scale: isGameActive ? 1.1 : 1 }}
                whileTap={{ scale: isGameActive ? 0.95 : 1 }}
                animate={isSelected ? { 
                  rotate: [0, -5, 5, 0],
                  transition: { duration: 0.3 }
                } : {}}
                onMouseDown={() => handleMouseDown(rowIndex, colIndex)}
                onMouseEnter={() => handleMouseEnter(rowIndex, colIndex)}
              >
                {cell.letter}
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
};