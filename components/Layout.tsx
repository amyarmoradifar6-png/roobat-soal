import React from 'react';
import { ViewState, Subject } from '../types';

interface LayoutProps {
  currentView: ViewState;
  selectedSubject: Subject | null;
  onNavigateHome: () => void;
  isDark: boolean;
  toggleTheme: () => void;
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ currentView, selectedSubject, onNavigateHome, isDark, toggleTheme, children }) => {
  
  // Default branding if no subject is selected
  const branding = selectedSubject ? {
     title: selectedSubject.fullTitle,
     colorClass: selectedSubject.colorClass,
     bgClass: selectedSubject.bgClass,
     borderClass: selectedSubject.borderClass,
     logo: selectedSubject.title.charAt(0)
  } : {
     title: 'دستیار طلایی',
     colorClass: 'text-amber-600 dark:text-amber-400',
     bgClass: 'bg-amber-500',
     borderClass: 'border-amber-400',
     logo: 'G'
  };

  const handleLinkClick = (e: React.MouseEvent) => {
    e.preventDefault();
    alert('این آدرس وب‌سایت در حال حاضر نمایشی است و هنوز ثبت نهایی نشده است.\n(This is a demo URL)');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors duration-300 font-[Vazirmatn]">
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 shadow-sm p-4 sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 relative">
        <div 
          className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity z-20 relative"
          onClick={onNavigateHome}
        >
          {/* Logo */}
          <div className={`w-10 h-10 ${branding.bgClass} rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-slate-200 dark:shadow-none transform rotate-3 hover:scale-110 transition-transform`}>
            {branding.logo}
          </div>
          <div className="hidden md:block">
            {/* Title */}
            <h1 className={`font-bold text-xl ${branding.colorClass}`}>{branding.title}</h1>
            {currentView !== ViewState.SUBJECT_SELECTION && currentView !== ViewState.WELCOME && (
              <span className="text-xs text-slate-500 dark:text-slate-400 block">بازگشت به منوی اصلی</span>
            )}
          </div>
        </div>

        {/* Theme Toggle - High Contrast Style */}
        <button 
          onClick={toggleTheme} 
          className="p-2.5 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:scale-105 active:scale-95 transition-all z-20 relative shadow-md"
          aria-label="Toggle theme"
        >
           {/* In Day mode (Black Button): Show White Moon. In Night mode (White Button): Show Black Sun. */}
          {isDark ? (
            <span className="text-xl">☀️</span>
          ) : (
            <span className="text-xl">🌙</span>
          )}
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
        <div className="max-w-6xl mx-auto p-4 md:p-8">
          {children}
        </div>
      </main>

      {/* Footer / Credits */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-6 mt-auto">
        <div className="max-w-6xl mx-auto px-6 flex flex-col-reverse md:flex-row justify-between items-center gap-4">
            
            {/* Website Address (Right side in RTL) */}
            <a 
              href="#" 
              onClick={handleLinkClick}
              className="text-slate-400 hover:text-indigo-600 dark:text-slate-500 dark:hover:text-indigo-400 text-sm font-mono tracking-wider transition-colors"
            >
                www.dastyartalaei.ir
            </a>

            {/* Designer Signature (Left side in RTL) */}
            <div className="flex items-center gap-2 group select-none">
                <span className="text-slate-400 text-[10px] uppercase tracking-widest opacity-60 group-hover:opacity-100 transition-opacity">
                    Design & Dev:
                </span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-700 to-slate-900 dark:from-slate-100 dark:to-slate-400 font-black text-sm tracking-wide group-hover:from-indigo-600 group-hover:to-purple-600 transition-all duration-300 transform group-hover:scale-105 inline-block">
                    Amyar Moradifar
                </span>
            </div>
            
        </div>
      </footer>
    </div>
  );
};