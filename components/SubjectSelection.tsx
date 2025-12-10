import React from 'react';
import { SUBJECTS } from '../constants';
import { Subject, SubjectId } from '../types';

interface SubjectSelectionProps {
  onSelectSubject: (subject: Subject) => void;
}

export const SubjectSelection: React.FC<SubjectSelectionProps> = ({ onSelectSubject }) => {
  
  const getAnimationClass = (id: SubjectId) => {
    switch (id) {
      case SubjectId.PHYSICS:
        return 'animate-spark';
      case SubjectId.CHEMISTRY:
        return 'animate-pour origin-bottom';
      default:
        return 'animate-float';
    }
  };

  const getIconSize = (id: SubjectId) => {
     if (id === SubjectId.GEOMETRY) return 'text-5xl'; // Bigger triangle
     return 'text-3xl';
  };

  return (
    <div className="space-y-10 py-8 pb-20">
      {/* Hero Section */}
      <div className="text-center space-y-4 animate-fade-up">
        <h1 className="text-3xl md:text-5xl font-black text-slate-800 dark:text-slate-100">
          دستیار هوشمند <span className="text-amber-500">گام‌به‌گام</span>
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-lg max-w-2xl mx-auto font-medium">
          برای شروع، درس مورد نظرت رو انتخاب کن تا هوش مصنوعی کمکت کنه.
        </p>
      </div>

      {/* Subjects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {SUBJECTS.map((subject, index) => (
          <button
            key={subject.id}
            onClick={() => onSelectSubject(subject)}
            className={`group bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] hover:shadow-xl dark:shadow-none border-2 border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] active:scale-95 relative overflow-hidden text-right animate-fade-up delay-${(index + 1) * 100}`}
            style={{ animationFillMode: 'both' }}
          >
            <div className="flex justify-between items-start mb-4">
               {/* Icon with specific animations */}
              <div className={`w-16 h-16 ${subject.bgClass} bg-opacity-10 dark:bg-opacity-20 rounded-2xl flex items-center justify-center ${getIconSize(subject.id)} transition-transform duration-300 group-hover:scale-110`}>
                <span className={`filter drop-shadow-sm ${getAnimationClass(subject.id)}`}>{subject.icon}</span>
              </div>
              
              {/* Arrow Icon */}
              <div className="text-slate-300 group-hover:text-indigo-500 transition-colors self-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8 rotate-180">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
              </div>
            </div>

            <h3 className={`text-2xl font-bold mb-2 ${subject.colorClass}`}>
              {subject.title}
            </h3>
            
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed font-medium">
              {subject.description}
            </p>

            <div className={`absolute bottom-0 left-0 w-full h-1 ${subject.bgClass} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left`}></div>
          </button>
        ))}
      </div>
    </div>
  );
};