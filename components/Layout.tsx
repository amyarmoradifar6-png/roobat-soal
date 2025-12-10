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
        <div className="max-w-6xl mx-auto px-6 flex flex-col items-center gap-4">
            
            {/* Group Name */}
            <div className="flex items-center gap-2">
                <span className="text-slate-500 dark:text-slate-400 text-sm">
                    گروه:
                </span>
                <span className={`${branding.colorClass} font-black text-2xl tracking-widest`}>
                    ROJHALAT
                </span>
            </div>

            {/* Credits */}
            <div className={`flex flex-col md:flex-row gap-4 items-center text-center`}>
                {/* Designer */}
                <div className="flex items-center gap-1">
                    <span className="text-slate-500 dark:text-slate-400 text-xs">
                        طراح:
                    </span>
                    <span className={`text-slate-800 dark:text-slate-200 font-bold text-sm`}>
                        آمیار مرادی فر
                    </span>
                </div>

                <div className="hidden md:block w-1 h-1 bg-slate-300 rounded-full"></div>

                {/* Sponsor */}
                <div className="flex items-center gap-1">
                    <span className="text-slate-500 dark:text-slate-400 text-xs">
                        اسپانسر:
                    </span>
                    <span className={`text-slate-800 dark:text-slate-200 font-bold text-sm`}>
                        امیر مرادی فر
                    </span>
                </div>
            </div>
            
        </div>
      </footer>
    </div>
  );
};