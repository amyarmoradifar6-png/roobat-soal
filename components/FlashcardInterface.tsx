import React, { useState, useEffect } from 'react';
import { Flashcard, Subject } from '../types';
import { generateFlashcards } from '../services/geminiService';

interface FlashcardInterfaceProps {
  initialChapter: string | null;
  subject: Subject | null;
  onBack: () => void;
}

export const FlashcardInterface: React.FC<FlashcardInterfaceProps> = ({ initialChapter, subject, onBack }) => {
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (initialChapter) {
      loadCards(initialChapter);
    }
  }, [initialChapter]);

  const loadCards = async (chapter: string) => {
    setLoading(true);
    setError(false);
    try {
      const subjectName = subject ? subject.title : 'درس';
      const generatedCards = await generateFlashcards(subjectName, chapter);
      if (generatedCards && generatedCards.length > 0) {
        setCards(generatedCards);
        setCurrentIndex(0);
        setIsFlipped(false);
      } else {
        setError(true);
      }
    } catch (e) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < cards.length - 1) {
      setIsFlipped(false);
      setTimeout(() => setCurrentIndex(prev => prev + 1), 200);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setIsFlipped(false);
      setTimeout(() => setCurrentIndex(prev => prev - 1), 200);
    }
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-20 text-center">
        <div className="w-16 h-16 border-4 border-emerald-200 dark:border-emerald-800 border-t-emerald-600 dark:border-t-emerald-400 rounded-full animate-spin mb-4"></div>
        <h3 className="text-xl font-bold text-slate-700 dark:text-slate-200">در حال آماده‌سازی کارت‌ها...</h3>
      </div>
    );
  }

  if (error || cards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
         <div className="text-red-500 text-5xl mb-4">⚠️</div>
         <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4">خطا در دریافت کارت‌ها</h3>
         <button onClick={() => initialChapter && loadCards(initialChapter)} className="px-6 py-2 bg-emerald-600 text-white rounded-xl">تلاش مجدد</button>
         <button onClick={onBack} className="mt-4 text-slate-500">بازگشت</button>
      </div>
    );
  }

  const currentCard = cards[currentIndex];

  return (
    <div className="flex flex-col items-center max-w-2xl mx-auto py-4 animate-in fade-in duration-500">
      
      {/* Header Info */}
      <div className="w-full flex justify-between items-center mb-6 px-4">
        {/* Counter Pill (Left) */}
        <div className="bg-slate-100 dark:bg-slate-800 px-4 py-1.5 rounded-full text-slate-600 dark:text-slate-300 font-bold text-sm shadow-sm">
          {currentIndex + 1} / {cards.length}
        </div>

        {/* Title (Right) */}
        <div className="flex items-center gap-2 text-slate-800 dark:text-slate-100 font-bold text-base md:text-lg">
          <span>فلش‌کارت‌های {initialChapter}</span>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-emerald-500">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 8.25V6a2.25 2.25 0 00-2.25-2.25H6A2.25 2.25 0 003.75 6v8.25A2.25 2.25 0 006 16.5h2.25m8.25-8.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-7.5A2.25 2.25 0 018.25 18v-1.5m8.25-8.25h-6a2.25 2.25 0 00-2.25 2.25v6" />
          </svg>
        </div>
      </div>

      {/* Card Container */}
      <div className="relative w-full aspect-[4/3] md:aspect-[16/10] perspective-1000 mb-8 group cursor-pointer" onClick={handleFlip}>
        <div 
            className={`relative w-full h-full duration-500 transform-style-3d transition-all ${isFlipped ? 'rotate-y-180' : ''}`}
            style={{ transformStyle: 'preserve-3d', transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
        >
          {/* Front Face */}
          <div 
            className="absolute w-full h-full backface-hidden bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-[0_8px_30px_rgba(0,0,0,0.06)] dark:shadow-none border border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center p-8 text-center"
            style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
          >
             <span className="text-indigo-400 dark:text-indigo-300 font-bold text-sm mb-6">
               سوال / مفهوم
             </span>
             <h3 className="text-2xl md:text-3xl font-black text-slate-800 dark:text-slate-100 leading-relaxed max-w-lg">
               {currentCard.front}
             </h3>
             <span className="absolute bottom-8 text-slate-400 text-xs md:text-sm font-medium">
               برای مشاهده پاسخ کلیک کنید
             </span>
          </div>

          {/* Back Face */}
          <div 
            className="absolute w-full h-full backface-hidden bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-[0_8px_30px_rgba(0,0,0,0.06)] dark:shadow-none border border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center p-8 text-center rotate-y-180"
            style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
          >
             <span className="text-emerald-500 dark:text-emerald-400 font-bold text-sm mb-6">
               پاسخ
             </span>
             <p className="text-xl md:text-2xl font-bold text-slate-800 dark:text-slate-100 leading-loose max-w-lg">
               {currentCard.back}
             </p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-6 mb-12 w-full">
        <button 
          onClick={(e) => { e.stopPropagation(); handlePrev(); }}
          disabled={currentIndex === 0}
          className="w-14 h-14 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-600 dark:hover:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </button>

        <button 
          onClick={(e) => { e.stopPropagation(); handleFlip(); }}
          className="h-14 px-8 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300 rounded-2xl font-bold flex items-center gap-3 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors"
        >
          <span>چرخاندن کارت</span>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
          </svg>
        </button>

        <button 
          onClick={(e) => { e.stopPropagation(); handleNext(); }}
          disabled={currentIndex === cards.length - 1}
          className="w-14 h-14 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-600 dark:hover:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 rotate-180">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </button>
      </div>

      <button onClick={onBack} className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 font-medium underline underline-offset-4 decoration-slate-300 transition-colors text-sm">
        بازگشت به منوی فصل
      </button>
    </div>
  );
};