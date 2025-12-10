
import React, { useState, useEffect } from 'react';
import { SampleQuestion } from '../types';
import { generateSampleQuestions } from '../services/geminiService';

interface SampleQuestionsInterfaceProps {
  initialChapter: string | null;
  onBack: () => void;
}

export const SampleQuestionsInterface: React.FC<SampleQuestionsInterfaceProps> = ({ initialChapter, onBack }) => {
  const [questions, setQuestions] = useState<SampleQuestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [expandedIndices, setExpandedIndices] = useState<number[]>([]);
  const [speakingIndex, setSpeakingIndex] = useState<{idx: number, type: 'q' | 'a'} | null>(null);

  useEffect(() => {
    if (initialChapter) {
      loadQuestions(initialChapter);
    }
  }, [initialChapter]);

  const loadQuestions = async (chapter: string) => {
    setLoading(true);
    setError(false);
    try {
      const data = await generateSampleQuestions('درس', chapter);
      if (data && data.length > 0) {
        setQuestions(data);
        setExpandedIndices([0]);
      } else {
        setError(true);
      }
    } catch (e) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const toggleQuestion = (index: number) => {
    setExpandedIndices(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index) 
        : [...prev, index]
    );
  };

  const speakText = (text: string, idx: number, type: 'q' | 'a', e: React.MouseEvent) => {
      e.stopPropagation();
      window.speechSynthesis.cancel();
      if (speakingIndex?.idx === idx && speakingIndex?.type === type) {
          setSpeakingIndex(null);
          return;
      }
      const cleanText = text.replace(/\$\$.*?\$\$/g, 'رابطه ریاضی').replace(/\$.*?\$/g, 'فرمول').replace(/[*#]/g, '');
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = 'fa-IR'; 
      utterance.rate = 0.9;
      utterance.onend = () => setSpeakingIndex(null);
      setSpeakingIndex({ idx, type });
      window.speechSynthesis.speak(utterance);
  };

  const renderContent = (text: string) => {
    if (!text) return null;
    const blockParts = text.split(/\$\$(.*?)\$\$/g);
    return blockParts.map((blockPart, blockIndex) => {
      if (blockIndex % 2 === 1) {
        if ((window as any).katex) {
          try {
            const html = (window as any).katex.renderToString(blockPart, {
              throwOnError: false,
              displayMode: true,
              output: 'html',
            });
            return <div key={`block-${blockIndex}`} className="my-2" dangerouslySetInnerHTML={{ __html: html }} />;
          } catch (e) { return <div key={`block-${blockIndex}`} className="my-2 text-center code">{blockPart}</div>; }
        } else { return <div key={`block-${blockIndex}`} className="my-2 text-center code">{blockPart}</div>; }
      }
      const inlineParts = blockPart.split(/\$(.*?)\$/g);
      return (
        <span key={`text-${blockIndex}`}>
          {inlineParts.map((part, inlineIndex) => {
            if (inlineIndex % 2 === 1) {
              if ((window as any).katex) {
                try {
                  const html = (window as any).katex.renderToString(part, {
                    throwOnError: false,
                    displayMode: false,
                    output: 'html',
                  });
                  return <span key={`inline-${inlineIndex}`} className="mx-1 font-bold text-indigo-700 dark:text-indigo-300" dangerouslySetInnerHTML={{ __html: html }} />;
                } catch (e) { return <code key={`inline-${inlineIndex}`} className="mx-1 bg-slate-100 dark:bg-slate-800 px-1 rounded dir-ltr">{part}</code>; }
              }
              return <code key={`inline-${inlineIndex}`}>{part}</code>;
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
        <div className="w-16 h-16 border-4 border-purple-200 dark:border-purple-800 border-t-purple-600 dark:border-t-purple-400 rounded-full animate-spin mb-4"></div>
        <h3 className="text-xl font-bold text-slate-700 dark:text-slate-200">در حال استخراج نمونه سوالات...</h3>
        <p className="text-slate-500 mt-2">لطفا صبر کنید</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
         <div className="text-red-500 text-5xl mb-4">⚠️</div>
         <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4">خطا در دریافت سوالات</h3>
         <button onClick={() => initialChapter && loadQuestions(initialChapter)} className="px-6 py-2 bg-purple-600 text-white rounded-xl">تلاش مجدد</button>
         <button onClick={onBack} className="mt-4 text-slate-500">بازگشت</button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div className="flex items-start gap-4">
           <div className="w-14 h-14 bg-purple-100 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center text-purple-600 dark:text-purple-400">
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
               </svg>
           </div>
           <div>
              <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100">
                نمونه سوالات امتحانی: {initialChapter}
              </h2>
              <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm font-medium">
                سوالات تشریحی و استاندارد برای آمادگی شب امتحان
              </p>
           </div>
        </div>
        <button onClick={onBack} className="text-slate-500 hover:text-purple-600 dark:hover:text-purple-400 transition-colors font-medium text-sm flex items-center gap-1">
            <span>بازگشت</span>
        </button>
      </div>

      <div className="space-y-4">
        {questions.map((q, idx) => {
          const isExpanded = expandedIndices.includes(idx);
          const isQuestionSpeaking = speakingIndex?.idx === idx && speakingIndex?.type === 'q';
          const isAnswerSpeaking = speakingIndex?.idx === idx && speakingIndex?.type === 'a';

          return (
            <div key={idx} className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden transition-all duration-300">
               <div onClick={() => toggleQuestion(idx)} className="p-6 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 flex items-center justify-center font-bold text-sm mt-1">
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 leading-relaxed">
                       {renderContent(q.question)}
                    </h3>
                  </div>
                  <button onClick={(e) => speakText(q.question, idx, 'q', e)} className={`p-2 rounded-full transition-colors ${isQuestionSpeaking ? 'bg-purple-100 text-purple-600' : 'text-slate-400 hover:text-purple-600 hover:bg-purple-50'}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill={isQuestionSpeaking ? "currentColor" : "none"} viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
                    </svg>
                  </button>
                  <div className={`text-slate-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                  </div>
               </div>
               <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                  <div className="p-6 pt-0">
                    <div className="bg-purple-50 dark:bg-purple-900/20 rounded-2xl p-6 border border-purple-100 dark:border-purple-800/30">
                       <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2 text-purple-700 dark:text-purple-400 font-bold text-sm">
                                <span>پاسخ نامه:</span>
                            </div>
                            <button onClick={(e) => speakText(q.answer, idx, 'a', e)} className={`p-2 rounded-full transition-colors ${isAnswerSpeaking ? 'bg-purple-200 text-purple-700' : 'text-purple-400 hover:text-purple-600 hover:bg-purple-100'}`}>
                                <svg xmlns="http://www.w3.org/2000/svg" fill={isAnswerSpeaking ? "currentColor" : "none"} viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
                                </svg>
                            </button>
                       </div>
                       <div className="prose prose-purple dark:prose-invert max-w-none whitespace-pre-wrap leading-loose text-slate-700 dark:text-slate-300">
                          {renderContent(q.answer)}
                       </div>
                    </div>
                  </div>
               </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
