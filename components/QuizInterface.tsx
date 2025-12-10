import React, { useState, useEffect } from 'react';
import { QuizState, Subject } from '../types';
import { generateQuizQuestions } from '../services/geminiService';

interface QuizInterfaceProps {
  initialChapter?: string | null;
  subject: Subject | null;
  onBack: () => void;
}

export const QuizInterface: React.FC<QuizInterfaceProps> = ({ initialChapter, subject, onBack }) => {
  const [loading, setLoading] = useState(false);
  const [state, setState] = useState<QuizState>({
    questions: [],
    currentIndex: 0,
    score: 0,
    showResults: false,
    selectedAnswers: [],
  });

  // Effect to automatically start if initialChapter is provided
  useEffect(() => {
    if (initialChapter && state.questions.length === 0 && !loading) {
       startQuiz(initialChapter);
    }
  }, [initialChapter]);

  const startQuiz = async (chapter: string) => {
    setLoading(true);
    const subjectName = subject ? subject.title : 'درس';
    const questions = await generateQuizQuestions(subjectName, chapter);
    setState({
      questions,
      currentIndex: 0,
      score: 0,
      showResults: false,
      selectedAnswers: new Array(questions.length).fill(null),
    });
    setLoading(false);
  };

  const handleAnswer = (optionIndex: number) => {
    const newSelectedAnswers = [...state.selectedAnswers];
    newSelectedAnswers[state.currentIndex] = optionIndex;
    setState(prev => ({ ...prev, selectedAnswers: newSelectedAnswers }));
  };

  const nextQuestion = () => {
    if (state.currentIndex < state.questions.length - 1) {
      setState(prev => ({ ...prev, currentIndex: prev.currentIndex + 1 }));
    } else {
      finishQuiz();
    }
  };

  const prevQuestion = () => {
    if (state.currentIndex > 0) {
      setState(prev => ({ ...prev, currentIndex: prev.currentIndex - 1 }));
    }
  };

  const finishQuiz = () => {
    let score = 0;
    state.questions.forEach((q, idx) => {
      if (state.selectedAnswers[idx] === q.correctIndex) score++;
    });
    setState(prev => ({ ...prev, score, showResults: true }));
  };

  const reset = () => {
    if (initialChapter) {
        onBack();
    } else {
        setState({
        questions: [],
        currentIndex: 0,
        score: 0,
        showResults: false,
        selectedAnswers: [],
        });
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-20 text-center animate-fade-up">
        <div className="w-16 h-16 border-4 border-indigo-200 dark:border-indigo-800 border-t-indigo-600 dark:border-t-indigo-400 rounded-full animate-spin mb-4"></div>
        <h3 className="text-xl font-bold text-slate-700 dark:text-slate-200">در حال طراحی سوالات...</h3>
        <p className="text-slate-500 dark:text-slate-400 mt-2">لطفا چند لحظه صبر کنید</p>
      </div>
    );
  }

  // Error State
  if (initialChapter && state.questions.length === 0 && !loading) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4 animate-fade-up">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center text-3xl mb-4">
                ⚠️
            </div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">خطا در دریافت سوالات</h3>
            <div className="flex flex-col sm:flex-row gap-4 mt-8">
                <button 
                    onClick={() => initialChapter && startQuiz(initialChapter)} 
                    className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-medium"
                >
                    تلاش مجدد
                </button>
                <button 
                    onClick={onBack} 
                    className="px-6 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-50 transition-colors font-medium"
                >
                    بازگشت
                </button>
            </div>
        </div>
      );
  }

  // Results View
  if (state.showResults) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 md:p-8 transition-colors animate-fade-up">
        <div className="text-center mb-8">
          <div className="inline-block p-4 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 mb-4 animate-pop-in">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0V5.625a2.25 2.25 0 11-4.5 0v3.375M12 11.25c2.485 0 4.5-2.015 4.5-4.5a4.5 4.5 0 00-9 0c0 2.485 2.015 4.5 4.5 4.5z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">نتایج آزمون</h2>
          <p className="text-lg mt-2 font-medium text-slate-700 dark:text-slate-300">
            امتیاز شما: <span className="text-indigo-600 dark:text-indigo-400 text-2xl">{state.score}</span> از {state.questions.length}
          </p>
        </div>
        
        <div className="space-y-6">
          {state.questions.map((q, idx) => {
            const userAns = state.selectedAnswers[idx];
            const isCorrect = userAns === q.correctIndex;
            return (
              <div key={idx} className={`p-4 rounded-xl border ${isCorrect ? 'border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800' : 'border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800'} animate-fade-up delay-${Math.min((idx+1)*100, 500)}`}>
                <p className="font-bold text-slate-800 dark:text-slate-100 mb-3">{idx + 1}. {q.question}</p>
                <div className="space-y-2 mb-3">
                   {q.options.map((opt, oIdx) => (
                     <div key={oIdx} className={`flex items-center gap-2 text-sm ${
                        oIdx === q.correctIndex ? 'text-green-700 dark:text-green-400 font-bold' : 
                        (oIdx === userAns && !isCorrect) ? 'text-red-700 dark:text-red-400 line-through' : 'text-slate-600 dark:text-slate-400'
                     }`}>
                       {opt}
                       {(oIdx === q.correctIndex) && <span>✅</span>}
                       {(oIdx === userAns && !isCorrect) && <span>❌</span>}
                     </div>
                   ))}
                </div>
                <div className="text-sm bg-white/60 dark:bg-black/20 p-3 rounded-lg">
                  <span className="font-bold text-slate-700 dark:text-slate-300">توضیحات: </span>
                  <span className="text-slate-600 dark:text-slate-400">{q.explanation}</span>
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-8 text-center">
            <button onClick={reset} className="px-6 py-2 bg-slate-800 dark:bg-slate-700 text-white rounded-lg hover:bg-slate-900 dark:hover:bg-slate-600">بازگشت</button>
        </div>
      </div>
    );
  }

  // Taking Quiz View
  if (!state.questions[state.currentIndex]) return null;
  
  const currentQuestion = state.questions[state.currentIndex];
  const progressPercentage = ((state.currentIndex + 1) / state.questions.length) * 100;

  return (
    <div className="max-w-3xl mx-auto">
      
      {/* Header Info */}
      <div className="mb-4 flex justify-between items-center text-slate-500 dark:text-slate-400 font-bold text-sm md:text-base animate-fade-up">
        <span>{initialChapter}</span>
        <span>سوال {state.currentIndex + 1} از {state.questions.length}</span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full mb-8 overflow-hidden animate-fade-up delay-100">
        <div 
          className="bg-indigo-600 dark:bg-indigo-500 h-full rounded-full transition-all duration-500 ease-out" 
          style={{ width: `${progressPercentage}%` }}
        ></div>
      </div>

      {/* Question Card */}
      <div key={state.currentIndex} className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-sm border border-slate-200 dark:border-slate-800 p-6 md:p-10 min-h-[400px] flex flex-col transition-colors animate-fade-up">
        
        {/* Question Text */}
        <h3 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-slate-100 leading-loose mb-10 text-right">
          {currentQuestion.question}
        </h3>

        {/* Options */}
        <div className="space-y-4 flex-1">
          {currentQuestion.options.map((option, idx) => (
            <button
              key={idx}
              onClick={() => handleAnswer(idx)}
              className={`w-full p-4 rounded-xl text-right border transition-all duration-200 flex items-center justify-between group bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700 animate-slide-in-right delay-${(idx+1)*100}`}
            >
              <span className={`text-slate-700 dark:text-slate-200 font-medium ${state.selectedAnswers[state.currentIndex] === idx ? 'text-indigo-700 dark:text-indigo-300' : ''}`}>
                  {option}
              </span>
              
              {/* Radio Circle */}
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors mr-4 ${
                state.selectedAnswers[state.currentIndex] === idx 
                  ? 'border-indigo-600 bg-white' 
                  : 'border-slate-300 dark:border-slate-600 group-hover:border-indigo-400'
              }`}>
                {state.selectedAnswers[state.currentIndex] === idx && (
                  <div className="w-3 h-3 bg-indigo-600 rounded-full animate-pop-in"></div>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-10 pt-6">
          <button
            onClick={prevQuestion}
            disabled={state.currentIndex === 0}
            className={`px-4 py-2 font-medium transition-colors ${
                state.currentIndex === 0 
                ? 'text-slate-300 dark:text-slate-600 cursor-not-allowed' 
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            سوال قبل
          </button>
          
          <button
            onClick={nextQuestion}
            disabled={state.selectedAnswers[state.currentIndex] === null}
            className="px-8 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-200 dark:shadow-none font-bold text-sm transform active:scale-95"
          >
            {state.currentIndex === state.questions.length - 1 ? 'پایان آزمون' : 'سوال بعدی'}
          </button>
        </div>
      </div>
    </div>
  );
};