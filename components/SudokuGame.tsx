import React, { useState, useEffect } from 'react';

interface SudokuGameProps {
  onBack: () => void;
}

// Simple Sudoku generator using transformations on a base valid board
const generateSudoku = () => {
    const base = "123456789456789123789123456214365897365897214897214365531642978642978531978531642";
    let board = base.split('').map(Number);

    // Helper to get index
    const idx = (r: number, c: number) => r * 9 + c;

    // Swap rows within same band
    for (let b = 0; b < 3; b++) {
        const r1 = b * 3 + Math.floor(Math.random() * 3);
        const r2 = b * 3 + Math.floor(Math.random() * 3);
        if (r1 !== r2) {
            for (let c = 0; c < 9; c++) {
                const temp = board[idx(r1, c)];
                board[idx(r1, c)] = board[idx(r2, c)];
                board[idx(r2, c)] = temp;
            }
        }
    }

    // Swap cols within same band
    for (let b = 0; b < 3; b++) {
        const c1 = b * 3 + Math.floor(Math.random() * 3);
        const c2 = b * 3 + Math.floor(Math.random() * 3);
        if (c1 !== c2) {
            for (let r = 0; r < 9; r++) {
                const temp = board[idx(r, c1)];
                board[idx(r, c1)] = board[idx(r, c2)];
                board[idx(r, c2)] = temp;
            }
        }
    }

    // Create puzzle by removing numbers
    const puzzle = [...board];
    const attempts = 40; // Difficulty
    for (let i = 0; i < attempts; i++) {
        const r = Math.floor(Math.random() * 9);
        const c = Math.floor(Math.random() * 9);
        puzzle[idx(r, c)] = 0;
    }

    return { solved: board, puzzle: puzzle };
};

export const SudokuGame: React.FC<SudokuGameProps> = ({ onBack }) => {
  const [gameData, setGameData] = useState<{solved: number[], puzzle: number[]} | null>(null);
  const [currentBoard, setCurrentBoard] = useState<number[]>([]);
  const [selectedCell, setSelectedCell] = useState<number | null>(null);
  const [won, setWon] = useState(false);

  useEffect(() => {
    startNewGame();
  }, []);

  const startNewGame = () => {
      const data = generateSudoku();
      setGameData(data);
      setCurrentBoard([...data.puzzle]);
      setWon(false);
      setSelectedCell(null);
  };

  const handleCellClick = (index: number) => {
      // Can only select empty cells from the original puzzle
      if (gameData && gameData.puzzle[index] === 0) {
          setSelectedCell(index);
      } else {
          setSelectedCell(null);
      }
  };

  const handleNumberInput = (num: number) => {
      if (selectedCell !== null && !won) {
          const newBoard = [...currentBoard];
          newBoard[selectedCell] = num;
          setCurrentBoard(newBoard);
          
          // Check win
          if (gameData && !newBoard.includes(0)) {
              // Simple check against solved
              let correct = true;
              for(let i=0; i<81; i++) {
                  if (newBoard[i] !== gameData.solved[i]) {
                      correct = false; 
                      break;
                  }
              }
              if (correct) setWon(true);
          }
      }
  };

  if (!gameData) return <div>Loading...</div>;

  return (
    <div className="flex flex-col items-center animate-in fade-in zoom-in-95 duration-300 pb-10">
        
        {/* Header */}
        <div className="w-full max-w-lg flex justify-between items-center mb-6 px-2">
            <div>
                <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100">سودوکو</h2>
                <p className="text-slate-500 text-sm">اعداد ۱ تا ۹ رو بدون تکرار بچین!</p>
            </div>
            <button onClick={onBack} className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200">
                بازگشت
            </button>
        </div>

        {won && (
            <div className="mb-6 bg-green-100 text-green-800 px-6 py-3 rounded-xl font-bold animate-bounce">
                🎉 عالی بود! برنده شدی!
            </div>
        )}

        {/* Board */}
        <div className="bg-slate-800 p-2 rounded-xl shadow-xl">
            <div className="grid grid-cols-9 gap-0.5 bg-slate-400 border-2 border-slate-600">
                {currentBoard.map((cell, idx) => {
                    const row = Math.floor(idx / 9);
                    const col = idx % 9;
                    const isRightBorder = col === 2 || col === 5;
                    const isBottomBorder = row === 2 || row === 5;
                    const isOriginal = gameData.puzzle[idx] !== 0;
                    const isSelected = selectedCell === idx;
                    const isError = !isOriginal && cell !== 0 && cell !== gameData.solved[idx];

                    return (
                        <div 
                            key={idx}
                            onClick={() => handleCellClick(idx)}
                            className={`
                                w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 flex items-center justify-center text-lg sm:text-xl font-bold cursor-pointer select-none transition-colors
                                ${isRightBorder ? 'border-r-2 border-r-slate-800' : ''}
                                ${isBottomBorder ? 'border-b-2 border-b-slate-800' : ''}
                                ${isOriginal ? 'bg-slate-200 text-slate-900' : 'bg-white text-indigo-600'}
                                ${isSelected ? '!bg-indigo-500 !text-white' : ''}
                                ${isError && !isSelected ? 'text-red-500 bg-red-50' : ''}
                                hover:bg-indigo-100
                            `}
                        >
                            {cell !== 0 ? cell : ''}
                        </div>
                    );
                })}
            </div>
        </div>

        {/* Controls */}
        <div className="mt-8 grid grid-cols-5 gap-2 sm:gap-4">
             {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                 <button 
                    key={num}
                    onClick={() => handleNumberInput(num)}
                    className="w-12 h-12 rounded-xl bg-white dark:bg-slate-800 border-b-4 border-slate-200 dark:border-slate-700 active:border-b-0 active:translate-y-1 text-xl font-bold text-slate-700 dark:text-slate-200 shadow-sm transition-all"
                 >
                     {num}
                 </button>
             ))}
             <button 
                onClick={() => handleNumberInput(0)}
                className="col-span-1 w-12 h-12 rounded-xl bg-red-50 dark:bg-red-900/20 border-b-4 border-red-200 dark:border-red-800 active:border-b-0 active:translate-y-1 text-red-500 font-bold flex items-center justify-center"
             >
                 ⌫
             </button>
        </div>

        <button 
            onClick={startNewGame}
            className="mt-8 px-6 py-2 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
        >
            بازی جدید
        </button>

    </div>
  );
};