
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
          <div className={`w-10 h-10 ${branding.bgClass} rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-slate-200 dark:shadow-none transform rotate-3`}>
            {branding.logo}
          </div>
          <div className="hidden md:block">
            {/* Title */}
            <h1 className={`font-bold text-xl ${branding.colorClass}`}>{branding.title}</h1>
            {currentView !== ViewState.SUBJECT_SELECTION && (
              <span className="text-xs text-slate-500 dark:text-slate-400 block">بازگشت به منوی اصلی</span>
            )}
          </div>
        </div>

        {/* Center Title - ROJHALAT with Subject Border Color */}
        <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 whitespace-nowrap z-10">
            <span className={`font-black text-lg sm:text-xl text-black dark:text-white tracking-wide drop-shadow-sm border-2 ${branding.borderClass} px-3 py-1 bg-white dark:bg-slate-900`}>
                گروه: ROJHALAT
            </span>
        </div>

        <button 
          onClick={toggleTheme} 
          className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors z-20 relative"
          aria-label="Toggle theme"
        >
          {isDark ? '☀️' : '🌙'}
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
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
            
            {/* Right Side: Credits (Boxed) */}
            <div className={`border-2 ${branding.borderClass} p-4 rounded-xl flex flex-col gap-2 items-center md:items-start w-full md:w-auto text-right bg-white dark:bg-slate-900 shadow-sm transition-colors`}>
                
                {/* Designer */}
                <div className="flex flex-col sm:flex-row items-center sm:items-baseline gap-1 sm:gap-2">
                    <span className="text-black dark:text-slate-200 font-bold text-sm sm:text-base">
                        طراح و مدیر اجرایی:
                    </span>
                    <span className={`${branding.colorClass} font-black text-lg drop-shadow-sm`}>
                        آمیار مرادی فر
                    </span>
                </div>

                {/* Sponsor */}
                <div className="flex flex-col sm:flex-row items-center sm:items-baseline gap-1 sm:gap-2">
                    <span className={`${branding.colorClass} font-bold text-sm sm:text-base`}>
                        اسپانسر و یاری دهنده:
                    </span>
                    <span className={`${branding.colorClass} font-black text-lg drop-shadow-sm`}>
                        امیر مرادی فر
                    </span>
                </div>
            </div>

            {/* Left Side: Phone Number (Green Box) */}
            <div className="flex items-center justify-center border-2 border-green-400 px-6 py-4 rounded-xl bg-white dark:bg-slate-900 shadow-sm">
                <a href="tel:09301424710" className="text-green-500 dark:text-green-400 font-black text-2xl tracking-widest hover:text-green-600 dark:hover:text-green-300 transition-colors flex items-center gap-2" dir="ltr">
                    <span className="font-[Vazirmatn]">۰۹۳۰۱۴۲۴۷۱۰</span>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                      <path fillRule="evenodd" d="M1.5 4.5a3 3 0 013-3h1.372c.86 0 1.61.586 1.819 1.42l1.105 4.423a1.875 1.875 0 01-.694 1.955l-1.293.97c-.135.101-.164.249-.126.352a11.285 11.285 0 006.697 6.697c.103.038.25.009.352-.126l.97-1.293a1.875 1.875 0 011.955-.694l4.423 1.105c.834.209 1.42.959 1.42 1.82V19.5a3 3 0 01-3 3h-2.25C8.552 22.5 1.5 15.448 1.5 6V4.5z" clipRule="evenodd" />
                    </svg>
                </a>
            </div>
            
        </div>
      </footer>
    </div>
  );
};
