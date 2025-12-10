import React from 'react';
import { ViewState, Subject, Chapter } from '../types';

interface DashboardProps {
  subject: Subject;
  chapters: Chapter[];
  onNavigate: (view: ViewState) => void;
  onChapterSelect: (chapterId: string) => void;
  onBackToSubjects: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ subject, chapters, onNavigate, onChapterSelect, onBackToSubjects }) => {
  
  // Helper to assign different animations based on index to make the page feel "alive"
  const getChapterAnimation = (index: number) => {
    const animations = [
      'animate-float',       // Up and down
      'animate-wiggle',      // Rotation shake
      'animate-heartbeat',   // Pulse scale
      'animate-slide-slow',  // Diagonal slide
    ];
    return animations[index % animations.length];
  };

  return (
    <div className="space-y-10 py-4 pb-20">
      {/* Back Button */}
      <button 
        onClick={onBackToSubjects}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-transform hover:scale-105 active:scale-95 font-medium mb-4 animate-fade-up"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
           <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" />
        </svg>
        <span>انتخاب درس دیگر</span>
      </button>

      {/* Hero Section */}
      <div className="text-center space-y-4 animate-fade-up delay-100">
        <h1 className="text-3xl md:text-4xl font-black text-slate-800 dark:text-slate-100">
          دستیار هوشمند <span className={subject.colorClass}>{subject.fullTitle}</span>
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-lg max-w-2xl mx-auto font-medium">
          فصل مورد نظرت رو انتخاب کن تا با آزمون، فلش‌کارت و گام‌به‌گام کمکت کنم.
        </p>
      </div>

      {/* Chapters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {chapters.map((chapter, index) => (
          <div 
            key={chapter.id}
            onClick={() => onChapterSelect(chapter.id)}
            className={`group bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] hover:shadow-xl dark:shadow-none border border-slate-100 dark:border-slate-800 transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] active:scale-95 relative overflow-hidden cursor-pointer animate-fade-up delay-${Math.min((index + 2) * 100, 700)}`}
          >
            <div className="flex justify-between items-start mb-4">
               {/* Icon with Animation & Night Glow */}
               <div className={`w-14 h-14 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-3xl transition-transform duration-300 group-hover:scale-110`}>
                <span className={`
                    ${getChapterAnimation(index)} 
                    /* Dark Mode Glow Effect */
                    dark:drop-shadow-[0_0_15px_rgba(255,255,255,0.6)] 
                    dark:filter
                `}>
                    {chapter.icon}
                </span>
              </div>
              
              {/* Arrow Icon */}
              <div className="text-slate-300 group-hover:text-indigo-500 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 rotate-180">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
              </div>
            </div>

            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">
              {chapter.title}
            </h3>
            
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-6">
              {chapter.description}
            </p>

            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              {chapter.tags && chapter.tags.map((tag, idx) => (
                <span 
                  key={idx} 
                  className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-medium rounded-lg"
                >
                  {tag}
                </span>
              ))}
              <span className="px-2 py-1.5 text-slate-400 text-xs">...</span>
            </div>
          </div>
        ))}
        
        {/* Global Solver Card */}
         <div 
            onClick={() => onNavigate(ViewState.SOLVER)}
            className={`group bg-gradient-to-br ${subject.id === 'MATH' ? 'from-blue-600 to-indigo-700' : subject.id === 'CHEMISTRY' ? 'from-emerald-600 to-teal-700' : subject.id === 'GEOMETRY' ? 'from-rose-600 to-pink-700' : 'from-amber-500 to-orange-600'} rounded-3xl p-6 md:p-8 shadow-xl text-white cursor-pointer hover:-translate-y-1 hover:scale-[1.01] active:scale-95 transition-all duration-300 relative overflow-hidden md:col-span-2 flex flex-col md:flex-row items-center gap-6 animate-fade-up delay-300`}
          >
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-3xl backdrop-blur-sm animate-[bounce_3s_infinite]">
                <span className="drop-shadow-lg">🧮</span>
            </div>
            <div className="flex-1 text-center md:text-right">
                <h3 className="text-xl font-bold mb-2">حل‌المسائل جامع</h3>
                <p className="text-white/90 text-sm opacity-90">
                    سوال یا مسئله‌ای داری که نمی‌تونی حل کنی؟ اینجا بنویس تا گام‌به‌گام برات حلش کنم.
                </p>
            </div>
            <div className="bg-white text-slate-900 px-6 py-3 rounded-xl font-bold text-sm hover:bg-slate-100 transition-colors">
                شروع حل تمرین
            </div>
         </div>
      </div>

      {/* Brain Games Section */}
      <div className="pt-8 border-t border-slate-200 dark:border-slate-800 animate-fade-up delay-500">
        <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center justify-center gap-2">
                <span>🎮</span>
                <span>باشگاه مغز و سرگرمی</span>
            </h2>
            <p className="text-slate-500 text-sm mt-1">کمی استراحت کن و ذهنت رو برای یادگیری بهتر آماده کن!</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Sudoku Card */}
            <button 
                onClick={() => onNavigate(ViewState.SUDOKU)}
                className="bg-sky-50 dark:bg-sky-900/20 border border-sky-100 dark:border-sky-800 p-6 rounded-3xl flex flex-col items-center gap-4 hover:shadow-lg hover:scale-105 active:scale-95 transition-all group h-full animate-pop-in delay-100"
            >
                <div className="w-16 h-16 bg-white dark:bg-sky-900 rounded-2xl flex items-center justify-center text-3xl shadow-sm group-hover:scale-110 transition-transform">
                    <span className="animate-spin-slow dark:drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">🧩</span>
                </div>
                <div className="text-center">
                    <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">سودوکو</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">تقویت منطق و تمرکز</p>
                </div>
            </button>

            {/* Memory Game Card */}
            <button 
                onClick={() => onNavigate(ViewState.MEMORY_GAME)}
                className="bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-800 p-6 rounded-3xl flex flex-col items-center gap-4 hover:shadow-lg hover:scale-105 active:scale-95 transition-all group h-full animate-pop-in delay-200"
            >
                <div className="w-16 h-16 bg-white dark:bg-rose-900 rounded-2xl flex items-center justify-center text-3xl shadow-sm group-hover:scale-110 transition-transform">
                    <span className="animate-pulse dark:drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">🧠</span>
                </div>
                <div className="text-center">
                    <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">بازی حافظه</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">تقویت حافظه تصویری</p>
                </div>
            </button>

            {/* Word Guess Card */}
            <button 
                onClick={() => onNavigate(ViewState.WORD_GUESS)}
                className="bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-800 p-6 rounded-3xl flex flex-col items-center gap-4 hover:shadow-lg hover:scale-105 active:scale-95 transition-all group h-full animate-pop-in delay-300"
            >
                <div className="w-16 h-16 bg-white dark:bg-orange-900 rounded-2xl flex items-center justify-center text-3xl shadow-sm group-hover:scale-110 transition-transform">
                    <span className="animate-wiggle dark:drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">🔡</span>
                </div>
                <div className="text-center">
                    <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">حدس کلمه</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">واژگان علمی رو پیدا کن!</p>
                </div>
            </button>

            {/* Liquid Sort Card */}
            <button 
                onClick={() => onNavigate(ViewState.LIQUID_SORT)}
                className="bg-teal-50 dark:bg-teal-900/20 border border-teal-100 dark:border-teal-800 p-6 rounded-3xl flex flex-col items-center gap-4 hover:shadow-lg hover:scale-105 active:scale-95 transition-all group h-full animate-pop-in delay-400"
            >
                <div className="w-16 h-16 bg-white dark:bg-teal-900 rounded-2xl flex items-center justify-center text-3xl shadow-sm group-hover:scale-110 transition-transform">
                    <span className="animate-pour dark:drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">🥤</span>
                </div>
                <div className="text-center">
                    <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">آزمایشگاه مایعات</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">جداسازی مواد شیمیایی</p>
                </div>
            </button>
        </div>
      </div>
    </div>
  );
};