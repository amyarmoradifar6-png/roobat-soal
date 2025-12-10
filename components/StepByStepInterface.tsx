import React, { useState, useEffect } from 'react';
import { StepByStepExercise, Subject } from '../types';
import { generateStepByStepExercises } from '../services/geminiService';

interface StepByStepInterfaceProps {
  initialChapter: string | null;
  subject: Subject | null;
  onBack: () => void;
}

export const StepByStepInterface: React.FC<StepByStepInterfaceProps> = ({ initialChapter, subject, onBack }) => {
  const [exercises, setExercises] = useState<StepByStepExercise[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (initialChapter) {
      loadExercises(initialChapter);
    }
  }, [initialChapter]);

  const loadExercises = async (chapter: string) => {
    setLoading(true);
    setError(false);
    try {
      const subjectName = subject ? subject.title : 'درس';
      const data = await generateStepByStepExercises(subjectName, chapter);
      if (data && data.length > 0) {
        setExercises(data);
      } else {
        setError(true);
      }
    } catch (e) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  // Helper to render text mixed with LaTeX (Inline $...$ and Block $$...$$)
  const renderContent = (text: string) => {
    if (!text) return null;

    // First split by block math $$...$$
    const blockParts = text.split(/\$\$(.*?)\$\$/g);

    return blockParts.map((blockPart, blockIndex) => {
      // Odd indices in blockParts are Block Math ($$)
      if (blockIndex % 2 === 1) {
        if ((window as any).katex) {
          try {
            const html = (window as any).katex.renderToString(blockPart, {
              throwOnError: false,
              displayMode: true, // Center align
              output: 'html',
            });
            return <div key={`block-${blockIndex}`} className="my-2" dangerouslySetInnerHTML={{ __html: html }} />;
          } catch (e) {
            return <div key={`block-${blockIndex}`} className="my-2 text-center code">{blockPart}</div>;
          }
        } else {
          return <div key={`block-${blockIndex}`} className="my-2 text-center code">{blockPart}</div>;
        }
      }

      // Even indices are text which might contain inline math $...$
      const inlineParts = blockPart.split(/\$(.*?)\$/g);
      
      return (
        <span key={`text-${blockIndex}`}>
          {inlineParts.map((part, inlineIndex) => {
            if (inlineIndex % 2 === 1) {
              // Inline Math
              if ((window as any).katex) {
                try {
                  const html = (window as any).katex.renderToString(part, {
                    throwOnError: false,
                    displayMode: false,
                    output: 'html',
                  });
                  return <span key={`inline-${inlineIndex}`} className="mx-1 text-emerald-800 dark:text-emerald-300 font-bold" dangerouslySetInnerHTML={{ __html: html }} />;
                } catch (e) {
                  return <code key={`inline-${inlineIndex}`} className="mx-1 bg-slate-100 dark:bg-slate-800 px-1 rounded dir-ltr">{part}</code>;
                }
              }
              return <code key={`inline-${inlineIndex}`}>{part}</code>;
            }
            
            // Plain text
            if (part.includes('فرمول:') || part.includes('جایگذاری و محاسبات:') || part.includes('پاسخ نهایی:')) {
               return (
                 <span key={`plain-${inlineIndex}`} className="font-bold text-slate-800 dark:text-slate-100 block mt-4 mb-2">
                   {part}
                 </span>
               );
            }

            return <span key={`plain-${inlineIndex}`}>{part}</span>;
          })}
        </span>
      );
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-20 text-center animate-in fade-in duration-500">
        <div className="w-16 h-16 border-4 border-emerald-200 dark:border-emerald-800 border-t-emerald-600 dark:border-t-emerald-400 rounded-full animate-spin mb-4"></div>
        <h3 className="text-xl font-bold text-slate-700 dark:text-slate-200">در حال استخراج تمرینات مهم...</h3>
        <p className="text-slate-500 mt-2">لطفا صبر کنید</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
         <div className="text-red-500 text-5xl mb-4">⚠️</div>
         <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4">خطا در دریافت اطلاعات</h3>
         <button onClick={() => initialChapter && loadExercises(initialChapter)} className="px-6 py-2 bg-emerald-600 text-white rounded-xl">تلاش مجدد</button>
         <button onClick={onBack} className="mt-4 text-slate-500">بازگشت</button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500 pb-10">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
           <div className="flex items-center gap-2 mb-1">
             <span className="text-emerald-600 dark:text-emerald-400 font-bold text-sm tracking-wide">آموزش تشریحی</span>
           </div>
           <h2 className="text-2xl md:text-3xl font-black text-slate-800 dark:text-slate-100">
             گام به گام: {initialChapter}
           </h2>
           <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">پاسخ تشریحی تمرینات مهم کتاب درسی</p>
        </div>
        <button 
            onClick={onBack}
            className="flex items-center gap-2 text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors font-medium text-sm bg-white dark:bg-slate-800 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm"
        >
            <span>بازگشت</span>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 rotate-180">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
        </button>
      </div>

      {/* Exercises List */}
      <div className="space-y-8">
        {exercises.map((exercise, idx) => (
          <div key={idx} className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
             
             {/* Question Section */}
             <div className="p-6 md:p-8 relative">
                <div className="absolute top-6 right-6 w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-500 text-sm">
                  {idx + 1}
                </div>
                <div className="pr-12">
                   <h3 className="text-lg md:text-xl font-bold text-slate-800 dark:text-slate-100 leading-loose">
                     {renderContent(exercise.question)}
                   </h3>
                </div>
             </div>

             {/* Solution Section (Green Box style) */}
             <div className="bg-emerald-50 dark:bg-emerald-900/10 p-6 md:p-8 border-t border-emerald-100 dark:border-emerald-800/50">
                <div className="flex items-center gap-2 mb-6 text-emerald-700 dark:text-emerald-400 font-bold text-lg border-b border-emerald-200 dark:border-emerald-800 pb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>پاسخ تشریحی:</span>
                </div>
                <div className="text-slate-700 dark:text-slate-300 leading-loose">
                    {renderContent(exercise.solution)}
                </div>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};