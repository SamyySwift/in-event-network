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

  const cellSize = grid[0].length > 15 ? 'w-7 h-7 text-xs' : 'w-8 h-8 text-sm';

  return (
    <div className="inline-block select-none">
      <div
        className="grid gap-1 p-4 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 rounded-lg border-2 border-primary/20 shadow-lg"
        style={{
          gridTemplateColumns: `repeat(${grid[0].length}, minmax(0, 1fr))`,
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
                  cellSize,
                  'flex items-center justify-center font-bold rounded-md cursor-pointer transition-all duration-200',
                  isSelected && 'bg-gradient-to-br from-green-400 to-green-600 text-white shadow-md scale-105 ring-2 ring-green-300',
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
