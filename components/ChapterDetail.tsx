
import React from 'react';
import { ViewState } from '../types';

interface ChapterDetailProps {
  chapterId: string;
  chapterTitle: string;
  onNavigate: (view: ViewState, initialPrompt?: string) => void;
  onBack: () => void;
}

export const ChapterDetail: React.FC<ChapterDetailProps> = ({ chapterId, chapterTitle, onNavigate, onBack }) => {
  
  // Extract just the chapter name without "Chapter X:" prefix if possible for cleaner UI
  const displayTitle = chapterTitle.includes(':') ? chapterTitle.split(':')[1].trim() : chapterTitle;

  const cards = [
    {
      title: 'نمونه سوال',
      desc: 'سوالات تشریحی با پاسخ کامل',
      icon: '📋',
      color: 'bg-purple-100 text-purple-600',
      action: () => onNavigate(ViewState.SAMPLE_QUESTIONS)
    },
    {
      title: 'گام به گام',
      desc: 'پاسخ تشریحی تمرینات کتاب',
      icon: '📖',
      color: 'bg-emerald-100 text-emerald-600',
      action: () => onNavigate(ViewState.STEP_BY_STEP, undefined)
    },
    {
      title: 'فلش کارت',
      desc: 'آزمون سریع ۵ سوالی',
      icon: '🧠',
      color: 'bg-indigo-100 text-indigo-600',
      action: () => onNavigate(ViewState.FLASHCARD, undefined)
    },
    {
      title: 'آزمون تستی',
      desc: 'خودت رو با ۵ سوال چالشی محک بزن',
      icon: '🔢',
      color: 'bg-blue-100 text-blue-600',
      action: () => onNavigate(ViewState.QUIZ, undefined)
    }
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] py-8 animate-in fade-in zoom-in-95 duration-300">
      <div className="text-center mb-12 space-y-4">
        <h2 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-100">
          برای <span className="text-indigo-600 dark:text-indigo-400">{displayTitle}</span> چه کاری انجام بدیم؟
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-5xl">
        {cards.map((card, idx) => (
          <button
            key={idx}
            onClick={card.action}
            className="flex flex-col items-center text-center bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group"
          >
            <div className={`w-20 h-20 ${card.color} dark:bg-opacity-20 rounded-full flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform`}>
              {card.icon}
            </div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-3">{card.title}</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm">{card.desc}</p>
          </button>
        ))}
      </div>

      <button
        onClick={onBack}
        className="mt-16 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors flex items-center gap-2 text-sm font-medium"
      >
        <span>انتخاب فصل دیگر</span>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </svg>
      </button>
    </div>
  );
};
