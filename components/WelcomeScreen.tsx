import React from 'react';

interface WelcomeScreenProps {
  onStart: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-6 animate-fade-up">
      <div className="mb-8 relative">
        <div className="w-32 h-32 bg-amber-500 rounded-3xl flex items-center justify-center text-7xl text-white shadow-2xl animate-float">
          G
        </div>
        <div className="absolute -top-4 -right-4 text-4xl animate-bounce delay-100">✨</div>
        <div className="absolute -bottom-4 -left-4 text-4xl animate-bounce delay-300">🎓</div>
      </div>
      
      <h1 className="text-4xl md:text-6xl font-black text-slate-800 dark:text-slate-100 mb-4 tracking-tight">
        فیزیک <span className="text-amber-500">طلایی</span>
      </h1>
      
      <p className="text-lg md:text-xl text-slate-500 dark:text-slate-400 max-w-md mb-12 leading-relaxed">
        به دستیار هوشمند و تعاملی پایه دهم خوش آمدید. آماده‌اید یادگیری را متحول کنید؟
      </p>

      <button
        onClick={onStart}
        className="px-10 py-4 bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-900 rounded-2xl font-bold text-lg shadow-xl shadow-amber-500/20 hover:scale-105 active:scale-95 transition-all duration-300"
      >
        شروع کنید
      </button>
    </div>
  );
};