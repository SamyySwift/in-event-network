import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

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

  return (
    <div className="inline-block select-none">
      <div
        className="grid gap-1 p-4 bg-card rounded-lg border"
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
              <div
                key={key}
                className={cn(
                  'w-8 h-8 flex items-center justify-center font-bold text-sm rounded cursor-pointer transition-colors',
                  isSelected && 'bg-primary text-primary-foreground',
                  isCurrentlySelecting && !isSelected && 'bg-primary/50',
                  !isSelected && !isCurrentlySelecting && 'bg-muted hover:bg-muted/80'
                )}
                onMouseDown={() => handleMouseDown(rowIndex, colIndex)}
                onMouseEnter={() => handleMouseEnter(rowIndex, colIndex)}
              >
                {cell.letter}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
