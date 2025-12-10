import React, { useState, useEffect } from 'react';

interface LiquidSortGameProps {
  onBack: () => void;
}

// Colors representing physics/chemistry liquids
const LIQUIDS = [
  { id: 0, color: 'bg-blue-500', name: 'آب' },          // Water
  { id: 1, color: 'bg-slate-400', name: 'جیوه' },       // Mercury
  { id: 2, color: 'bg-yellow-400', name: 'روغن' },      // Oil
  { id: 3, color: 'bg-red-500', name: 'پلاسما' },       // Magma/Plasma
  { id: 4, color: 'bg-purple-500', name: 'الکل' },      // Alcohol
];

const TUBE_CAPACITY = 4;

export const LiquidSortGame: React.FC<LiquidSortGameProps> = ({ onBack }) => {
  const [tubes, setTubes] = useState<number[][]>([]);
  const [selectedTube, setSelectedTube] = useState<number | null>(null);
  const [isWon, setIsWon] = useState(false);

  useEffect(() => {
    startNewGame();
  }, []);

  const startNewGame = () => {
    // 4 colors, 4 units each = 16 units total.
    // Distribute into 4 tubes, plus 2 empty tubes = 6 tubes total.
    
    // Create the pool of liquids
    let pool: number[] = [];
    LIQUIDS.slice(0, 4).forEach(liquid => {
        pool.push(...Array(4).fill(liquid.id));
    });
    
    // Shuffle
    pool = pool.sort(() => Math.random() - 0.5);

    // Distribute to first 4 tubes
    const newTubes: number[][] = [];
    for(let i=0; i<4; i++) {
        newTubes.push(pool.slice(i*4, (i+1)*4));
    }
    // Add 2 empty tubes
    newTubes.push([]);
    newTubes.push([]);

    setTubes(newTubes);
    setSelectedTube(null);
    setIsWon(false);
  };

  const handleTubeClick = (index: number) => {
      if (isWon) return;

      // Deselect if clicking same tube
      if (selectedTube === index) {
          setSelectedTube(null);
          return;
      }

      // Select source
      if (selectedTube === null) {
          if (tubes[index].length > 0) {
              setSelectedTube(index);
          }
          return;
      }

      // Try to pour
      // Source: tubes[selectedTube], Dest: tubes[index]
      const sourceTube = [...tubes[selectedTube]];
      const destTube = [...tubes[index]];

      if (sourceTube.length === 0) {
          setSelectedTube(index); // Switch selection if empty (shouldn't happen logic wise but safe)
          return;
      }

      const liquidToMove = sourceTube[sourceTube.length - 1];

      // Check valid move: Dest empty OR Dest top color same as Source top color AND Dest has space
      if (destTube.length < TUBE_CAPACITY) {
          if (destTube.length === 0 || destTube[destTube.length - 1] === liquidToMove) {
              // Valid move
              sourceTube.pop();
              destTube.push(liquidToMove);

              const newTubes = [...tubes];
              newTubes[selectedTube] = sourceTube;
              newTubes[index] = destTube;
              setTubes(newTubes);
              setSelectedTube(null);

              checkWin(newTubes);
          } else {
             // Invalid move (color mismatch), just select the new tube if it has liquid
             if (tubes[index].length > 0) setSelectedTube(index);
             else setSelectedTube(null);
          }
      } else {
          // Dest full, change selection
          if (tubes[index].length > 0) setSelectedTube(index);
          else setSelectedTube(null);
      }
  };

  const checkWin = (currentTubes: number[][]) => {
      const won = currentTubes.every(tube => {
          if (tube.length === 0) return true;
          if (tube.length !== TUBE_CAPACITY) return false;
          const firstColor = tube[0];
          return tube.every(c => c === firstColor);
      });
      if (won) setIsWon(true);
  };

  return (
    <div className="flex flex-col items-center animate-in fade-in zoom-in-95 duration-300 pb-10 min-h-[80vh]">
        
        {/* Header */}
        <div className="w-full max-w-lg flex justify-between items-center mb-6 px-2">
            <div>
                <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100">آزمایشگاه مایعات</h2>
                <p className="text-slate-500 text-sm">مایعات هم‌رنگ رو توی یک لوله جمع کن.</p>
            </div>
            <button onClick={onBack} className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200">
                بازگشت
            </button>
        </div>

        {isWon && (
            <div className="mb-8 bg-green-100 text-green-800 px-6 py-3 rounded-xl font-bold animate-bounce text-center">
                🎉 عالی! همه مواد خالص‌سازی شدند.
            </div>
        )}

        {/* Game Area */}
        <div className="flex flex-wrap justify-center gap-8 mt-10">
            {tubes.map((tube, idx) => (
                <div 
                    key={idx}
                    onClick={() => handleTubeClick(idx)}
                    className={`
                        w-14 h-48 border-4 border-t-0 rounded-b-3xl relative flex flex-col-reverse overflow-hidden cursor-pointer transition-all duration-200
                        ${selectedTube === idx ? 'border-indigo-500 -translate-y-4 shadow-xl' : 'border-slate-300 dark:border-slate-600 hover:border-slate-400'}
                    `}
                    style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
                >
                    {/* Render Liquid Segments */}
                    {tube.map((colorId, i) => {
                        const liquidInfo = LIQUIDS.find(l => l.id === colorId);
                        return (
                            <div 
                                key={i} 
                                className={`w-full h-1/4 ${liquidInfo?.color} transition-all duration-500 border-t border-white/20`}
                                title={liquidInfo?.name}
                            ></div>
                        );
                    })}
                </div>
            ))}
        </div>
        
        {/* Legend */}
        <div className="mt-12 flex flex-wrap justify-center gap-4">
             {LIQUIDS.slice(0, 4).map(l => (
                 <div key={l.id} className="flex items-center gap-2 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-lg shadow-sm">
                     <div className={`w-4 h-4 rounded-full ${l.color}`}></div>
                     <span className="text-xs text-slate-600 dark:text-slate-300">{l.name}</span>
                 </div>
             ))}
        </div>

        <button 
            onClick={startNewGame}
            className="mt-12 px-6 py-2 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
        >
            آزمایش جدید
        </button>
    </div>
  );
};