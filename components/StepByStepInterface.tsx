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

  // Helper to convert English digits to Persian digits for TEXT only
  const toPersianDigits = (str: string) => {
    return str.replace(/[0-9]/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[parseInt(d)]);
  };

  // Helper to process text: fixes raw LaTeX leakage and formats content
  const processText = (text: string) => {
    if (!text) return '';
    
    // 1. Attempt to fix common raw LaTeX patterns that aren't wrapped in $
    // Replaces cases like "frac{...}{...}" with "$$\frac{...}{...}$$" if not already wrapped
    // This is a heuristic fix for the "frac" issue seen in the screenshot.
    let processed = text;
    
    // If text contains latex commands but no $, wrap lines
    const hasLatex = /\\(frac|times|text|sqrt|hat|vec|sin|cos)/.test(processed);
    const hasDelimiters = /\$|\\\[/.test(processed);

    if (hasLatex && !hasDelimiters) {
        // Aggressively wrap things that look like math lines
        const lines = processed.split('\n');
        processed = lines.map(line => {
             if (/\\(frac|times|text|sqrt)/.test(line)) {
                 return `$$ ${line} $$`;
             }
             return line;
        }).join('\n');
    }

    return processed;
  };

  // Helper to render text mixed with LaTeX
  const renderContent = (text: string) => {
    if (!text) return null;
    const cleanText = processText(text);
    
    const blockParts = cleanText.split(/\$\$(.*?)\$\$/g);

    return blockParts.map((blockPart, blockIndex) => {
      // Block Math
      if (blockIndex % 2 === 1) {
        if ((window as any).katex) {
          try {
            const html = (window as any).katex.renderToString(blockPart, {
              throwOnError: false,
              displayMode: true,
              output: 'html',
            });
            return <div key={`block-${blockIndex}`} className="my-3 py-2 overflow-x-auto" dir="ltr" dangerouslySetInnerHTML={{ __html: html }} />;
          } catch (e) {
            return <div key={`block-${blockIndex}`} className="my-2 text-center code font-mono text-sm bg-gray-100 p-1 rounded" dir="ltr">{blockPart}</div>;
          }
        } else {
          return <div key={`block-${blockIndex}`} className="my-2 text-center code" dir="ltr">{blockPart}</div>;
        }
      }

      // Text mixed with Inline Math
      const inlineParts = blockPart.split(/\$(.*?)\$/g);
      
      return (
        <span key={`text-${blockIndex}`} className="leading-loose">
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
                  return <span key={`inline-${inlineIndex}`} className="mx-1 inline-block text-indigo-800 dark:text-indigo-300 font-bold" dir="ltr" dangerouslySetInnerHTML={{ __html: html }} />;
                } catch (e) {
                  return <code key={`inline-${inlineIndex}`} className="mx-1 bg-slate-100 dark:bg-slate-800 px-1 rounded dir-ltr">{part}</code>;
                }
              }
              return <code key={`inline-${inlineIndex}`}>{part}</code>;
            }
            
            // Plain text formatting
            if (!part.trim()) return null;

            // Check for bold headers
            if (part.includes('فرمول:') || part.includes('محاسبه:') || part.includes('پاسخ:')) {
                return <strong key={`plain-${inlineIndex}`} className="block mt-4 mb-2 text-emerald-700 dark:text-emerald-400 text-lg border-b border-emerald-100 dark:border-emerald-900 w-fit pb-1">{toPersianDigits(part)}</strong>;
            }

            return <span key={`plain-${inlineIndex}`}>{toPersianDigits(part)}</span>;
          })}
        </span>
      );
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-20 text-center animate-in fade-in duration-500">
        <div className="w-16 h-16 border-4 border-emerald-200 dark:border-emerald-800 border-t-emerald-600 dark:border-t-emerald-400 rounded-full animate-spin mb-4"></div>
        <h3 className="text-xl font-bold text-slate-700 dark:text-slate-200">در حال نوشتن گام‌به‌گام...</h3>
        <p className="text-slate-500 mt-2">دقیقاً مثل کتاب درسی</p>
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
             <span className="text-emerald-600 dark:text-emerald-400 font-bold text-sm tracking-wide bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1 rounded-full">آموزش تشریحی</span>
           </div>
           <h2 className="text-2xl md:text-3xl font-black text-slate-800 dark:text-slate-100 mt-2">
             گام به گام: {initialChapter}
           </h2>
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
             <div className="p-6 md:p-8 relative bg-gradient-to-l from-slate-50 to-white dark:from-slate-900 dark:to-slate-900">
                <div className="absolute top-6 right-6 w-8 h-8 rounded-lg bg-slate-800 dark:bg-slate-700 text-white flex items-center justify-center font-bold text-lg shadow-lg shadow-slate-300 dark:shadow-none">
                  {idx + 1}
                </div>
                <div className="pr-12 text-justify">
                   <div className="text-lg md:text-xl font-bold text-slate-800 dark:text-slate-100 leading-9">
                     {renderContent(exercise.question)}
                   </div>
                </div>
             </div>

             {/* Solution Section (Book Style) */}
             <div className="bg-white dark:bg-slate-900 p-6 md:p-8 border-t-2 border-dashed border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2 mb-6">
                    <div className="w-1 h-6 bg-emerald-500 rounded-full"></div>
                    <span className="text-emerald-700 dark:text-emerald-400 font-bold text-lg">پاسخ تشریحی</span>
                </div>
                <div className="text-slate-700 dark:text-slate-300 leading-9 text-justify text-lg space-y-4">
                    {renderContent(exercise.solution)}
                </div>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};