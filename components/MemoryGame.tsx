import React, { useState, useEffect } from 'react';

interface MemoryGameProps {
  onBack: () => void;
}

const ICONS = ['⚛️', '🔭', '🔋', '💡', '🧲', '🧪', '📐', '🛡️'];

export const MemoryGame: React.FC<MemoryGameProps> = ({ onBack }) => {
  const [cards, setCards] = useState<{id: number, icon: string, isFlipped: boolean, isMatched: boolean}[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [isWon, setIsWon] = useState(false);

  useEffect(() => {
    startNewGame();
  }, []);

  const startNewGame = () => {
    // Duplicate and shuffle
    const deck = [...ICONS, ...ICONS]
        .sort(() => Math.random() - 0.5)
        .map((icon, index) => ({
            id: index,
            icon,
            isFlipped: false,
            isMatched: false
        }));
    
    setCards(deck);
    setFlippedIndices([]);
    setMoves(0);
    setIsWon(false);
  };

  const handleCardClick = (index: number) => {
    if (flippedIndices.length === 2 || cards[index].isFlipped || cards[index].isMatched) return;

    const newCards = [...cards];
    newCards[index].isFlipped = true;
    setCards(newCards);

    const newFlipped = [...flippedIndices, index];
    setFlippedIndices(newFlipped);

    if (newFlipped.length === 2) {
        setMoves(m => m + 1);
        const [firstIdx, secondIdx] = newFlipped;
        
        if (newCards[firstIdx].icon === newCards[secondIdx].icon) {
            // Match
            setTimeout(() => {
                newCards[firstIdx].isMatched = true;
                newCards[secondIdx].isMatched = true;
                setCards([...newCards]);
                setFlippedIndices([]);
                
                if (newCards.every(c => c.isMatched)) {
                    setIsWon(true);
                }
            }, 500);
        } else {
            // No Match
            setTimeout(() => {
                newCards[firstIdx].isFlipped = false;
                newCards[secondIdx].isFlipped = false;
                setCards([...newCards]);
                setFlippedIndices([]);
            }, 1000);
        }
    }
  };

  return (
    <div className="flex flex-col items-center animate-in fade-in zoom-in-95 duration-300 pb-10">
        
        {/* Header */}
        <div className="w-full max-w-lg flex justify-between items-center mb-6 px-2">
            <div>
                <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100">بازی حافظه</h2>
                <p className="text-slate-500 text-sm">تعداد حرکت: {moves}</p>
            </div>
            <button onClick={onBack} className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200">
                بازگشت
            </button>
        </div>

        {isWon && (
            <div className="mb-6 bg-green-100 text-green-800 px-6 py-3 rounded-xl font-bold animate-bounce text-center">
                🎉 آفرین! همه رو پیدا کردی!
            </div>
        )}

        <div className="grid grid-cols-4 gap-3 md:gap-4 p-4 bg-slate-100 dark:bg-slate-800 rounded-3xl">
            {cards.map((card, index) => (
                <button
                    key={card.id}
                    onClick={() => handleCardClick(index)}
                    className={`
                        w-16 h-16 sm:w-20 sm:h-20 rounded-2xl text-3xl sm:text-4xl flex items-center justify-center transition-all duration-300 transform perspective-1000
                        ${card.isFlipped || card.isMatched 
                            ? 'bg-white dark:bg-slate-700 rotate-y-180 shadow-md border-b-4 border-indigo-200 dark:border-indigo-900' 
                            : 'bg-indigo-500 text-transparent border-b-4 border-indigo-700 hover:bg-indigo-600'}
                    `}
                >
                    {(card.isFlipped || card.isMatched) ? card.icon : '❓'}
                </button>
            ))}
        </div>

        <button 
            onClick={startNewGame}
            className="mt-8 px-6 py-2 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
        >
            شروع مجدد
        </button>
    </div>
  );
};