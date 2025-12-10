import React, { useState, useEffect } from 'react';

interface WordGuessGameProps {
  onBack: () => void;
}

const PHYSICS_WORDS = [
  { word: 'چگالی', hint: 'جرم در واحد حجم' },
  { word: 'دماسنج', hint: 'وسیله اندازه‌گیری گرما' },
  { word: 'پتانسیل', hint: 'نوعی انرژی ذخیره شده' },
  { word: 'جابجایی', hint: 'فاصله مستقیم مبدا تا مقصد' },
  { word: 'دقت', hint: 'نزدیکی اندازه‌گیری به مقدار واقعی' },
  { word: 'فشار', hint: 'نیرو بر واحد سطح' },
  { word: 'پاسکال', hint: 'یکای فشار در SI' },
  { word: 'ترمودینامیک', hint: 'علم مطالعه گرما و کار' },
  { word: 'کلوین', hint: 'یکای مطلق دما' },
  { word: 'توان', hint: 'آهنگ انجام کار' },
  { word: 'بازده', hint: 'نسبت انرژی مفید به کل' },
  { word: 'ارشمیدس', hint: 'دانشمندی که نیروی شناوری را کشف کرد' },
];

const ALPHABET = 'آابپتثجچحخدذرزژسشصضطظعغفقکگلمنوهی'.split('');

export const WordGuessGame: React.FC<WordGuessGameProps> = ({ onBack }) => {
  const [currentWordObj, setCurrentWordObj] = useState<{word: string, hint: string} | null>(null);
  const [guessedLetters, setGuessedLetters] = useState<Set<string>>(new Set());
  const [wrongCount, setWrongCount] = useState(0);
  const [gameStatus, setGameStatus] = useState<'playing' | 'won' | 'lost'>('playing');

  useEffect(() => {
    startNewGame();
  }, []);

  const startNewGame = () => {
    const random = PHYSICS_WORDS[Math.floor(Math.random() * PHYSICS_WORDS.length)];
    setCurrentWordObj(random);
    setGuessedLetters(new Set());
    setWrongCount(0);
    setGameStatus('playing');
  };

  const handleGuess = (letter: string) => {
    if (gameStatus !== 'playing' || !currentWordObj || guessedLetters.has(letter)) return;

    const newGuessed = new Set(guessedLetters);
    newGuessed.add(letter);
    setGuessedLetters(newGuessed);

    if (!currentWordObj.word.includes(letter)) {
      const newWrong = wrongCount + 1;
      setWrongCount(newWrong);
      if (newWrong >= 6) {
        setGameStatus('lost');
      }
    } else {
      // Check win
      const isWon = currentWordObj.word.split('').every(char => newGuessed.has(char));
      if (isWon) setGameStatus('won');
    }
  };

  if (!currentWordObj) return <div>Loading...</div>;

  return (
    <div className="flex flex-col items-center animate-in fade-in zoom-in-95 duration-300 pb-10">
        
        {/* Header */}
        <div className="w-full max-w-lg flex justify-between items-center mb-6 px-2">
            <div>
                <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100">حدس کلمه فیزیکی</h2>
                <p className="text-slate-500 text-sm">کلمه پنهان شده رو پیدا کن!</p>
            </div>
            <button onClick={onBack} className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200">
                بازگشت
            </button>
        </div>

        {/* Game Status Messages */}
        {gameStatus === 'won' && (
            <div className="mb-6 bg-green-100 text-green-800 px-6 py-3 rounded-xl font-bold animate-bounce text-center">
                🎉 آفرین! کلمه رو درست حدس زدی.
            </div>
        )}
        {gameStatus === 'lost' && (
            <div className="mb-6 bg-red-100 text-red-800 px-6 py-3 rounded-xl font-bold animate-shake text-center">
                ❌ باختی! کلمه "{currentWordObj.word}" بود.
            </div>
        )}

        {/* Battery / Health Indicator */}
        <div className="mb-8 flex gap-2">
            {[...Array(6)].map((_, i) => (
                <div key={i} className={`w-8 h-12 rounded-lg border-2 border-slate-300 dark:border-slate-600 transition-all ${i < (6 - wrongCount) ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-transparent'}`}></div>
            ))}
        </div>

        {/* Word Display */}
        <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-lg mb-8 flex flex-wrap justify-center gap-3">
            {currentWordObj.word.split('').map((char, idx) => (
                <div key={idx} className="w-12 h-14 border-b-4 border-slate-300 dark:border-slate-600 flex items-center justify-center text-2xl font-bold text-slate-800 dark:text-slate-100">
                    {(guessedLetters.has(char) || gameStatus === 'lost') ? char : ''}
                </div>
            ))}
        </div>

        {/* Hint */}
        <div className="mb-8 text-center bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 px-4 py-2 rounded-lg text-sm">
            💡 راهنمایی: {currentWordObj.hint}
        </div>

        {/* Keyboard */}
        <div className="max-w-2xl flex flex-wrap justify-center gap-2">
            {ALPHABET.map((char) => {
                const isGuessed = guessedLetters.has(char);
                const isCorrect = currentWordObj.word.includes(char);
                let btnClass = "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700";
                
                if (isGuessed) {
                    btnClass = isCorrect 
                        ? "bg-green-500 text-white border-green-600" 
                        : "bg-slate-300 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed opacity-50";
                }

                return (
                    <button
                        key={char}
                        onClick={() => handleGuess(char)}
                        disabled={isGuessed || gameStatus !== 'playing'}
                        className={`w-10 h-12 rounded-lg font-bold text-lg shadow-sm border-b-4 border-slate-200 dark:border-slate-700 transition-all active:translate-y-1 active:border-b-0 ${btnClass}`}
                    >
                        {char}
                    </button>
                );
            })}
        </div>

        <button 
            onClick={startNewGame}
            className="mt-10 px-6 py-2 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
        >
            کلمه جدید
        </button>
    </div>
  );
};