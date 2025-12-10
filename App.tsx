import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { SubjectSelection } from './components/SubjectSelection';
import { ChatInterface } from './components/ChatInterface';
import { QuizInterface } from './components/QuizInterface';
import { FlashcardInterface } from './components/FlashcardInterface';
import { ProblemSolver } from './components/ProblemSolver';
import { ChapterDetail } from './components/ChapterDetail';
import { StepByStepInterface } from './components/StepByStepInterface';
import { SampleQuestionsInterface } from './components/SampleQuestionsInterface';
import { SudokuGame } from './components/SudokuGame';
import { MemoryGame } from './components/MemoryGame';
import { WordGuessGame } from './components/WordGuessGame';
import { LiquidSortGame } from './components/LiquidSortGame';
import { WelcomeScreen } from './components/WelcomeScreen';
import { ViewState, Subject, SubjectId } from './types';
import { SUBJECT_CHAPTERS } from './constants';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.WELCOME);
  const [isDark, setIsDark] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(null);
  const [initialChatPrompt, setInitialChatPrompt] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark(!isDark);

  const handleStartApp = () => {
    setCurrentView(ViewState.SUBJECT_SELECTION);
  };

  const handleSubjectSelect = (subject: Subject) => {
    setSelectedSubject(subject);
    setCurrentView(ViewState.HOME);
  };

  const handleChapterSelect = (chapterId: string) => {
    setSelectedChapterId(chapterId);
    setCurrentView(ViewState.CHAPTER_DETAIL);
  };

  const handleNavigateFromDetail = (view: ViewState, prompt?: string) => {
    if (prompt) {
      setInitialChatPrompt(prompt);
    } else {
      setInitialChatPrompt(undefined);
    }
    setCurrentView(view);
  };

  const handleBackToDashboard = () => {
      setSelectedChapterId(null);
      setInitialChatPrompt(undefined);
      setCurrentView(ViewState.HOME);
  }

  const handleBackToSubjects = () => {
    setSelectedSubject(null);
    setSelectedChapterId(null);
    setInitialChatPrompt(undefined);
    setCurrentView(ViewState.SUBJECT_SELECTION);
  }
  
  const handleBackToDetail = () => {
      setInitialChatPrompt(undefined);
      if (selectedChapterId) {
        setCurrentView(ViewState.CHAPTER_DETAIL);
      } else {
        setCurrentView(ViewState.HOME);
      }
  }

  // Get Current Chapters based on Subject
  const currentChapters = selectedSubject ? SUBJECT_CHAPTERS[selectedSubject.id] : [];
  const currentChapterData = currentChapters.find(c => c.id === selectedChapterId);

  const renderContent = () => {
    switch (currentView) {
      case ViewState.WELCOME:
        return <WelcomeScreen onStart={handleStartApp} />;

      case ViewState.SUBJECT_SELECTION:
        return <SubjectSelection onSelectSubject={handleSubjectSelect} />;

      case ViewState.HOME:
        if (!selectedSubject) return <SubjectSelection onSelectSubject={handleSubjectSelect} />;
        return (
          <Dashboard 
            subject={selectedSubject}
            chapters={currentChapters}
            onNavigate={setCurrentView} 
            onChapterSelect={handleChapterSelect} 
            onBackToSubjects={handleBackToSubjects}
          />
        );
      
      case ViewState.CHAPTER_DETAIL:
        if (!selectedChapterId || !currentChapterData) return null;
        return (
          <ChapterDetail 
            chapterId={selectedChapterId} 
            chapterTitle={currentChapterData.title}
            onNavigate={handleNavigateFromDetail}
            onBack={handleBackToDashboard}
          />
        );

      case ViewState.CHAT:
        return <ChatInterface initialPrompt={initialChatPrompt} />;
        
      case ViewState.QUIZ:
        return <QuizInterface initialChapter={selectedChapterId} onBack={handleBackToDetail} />;
        
      case ViewState.FLASHCARD:
        return <FlashcardInterface initialChapter={selectedChapterId} onBack={handleBackToDetail} />;

      case ViewState.STEP_BY_STEP:
        return <StepByStepInterface initialChapter={selectedChapterId} onBack={handleBackToDetail} />;

      case ViewState.SAMPLE_QUESTIONS:
        return <SampleQuestionsInterface initialChapter={selectedChapterId} onBack={handleBackToDetail} />;

      case ViewState.SOLVER:
        // Solver can be accessed from Dashboard (no chapter selected) or detail.
        // If accessed from Dashboard, back button goes to Dashboard.
        const handleSolverBack = selectedChapterId ? handleBackToDetail : handleBackToDashboard;
        return <ProblemSolver onBack={handleSolverBack} />;

      case ViewState.SUDOKU:
        return <SudokuGame onBack={handleBackToDashboard} />;

      case ViewState.MEMORY_GAME:
        return <MemoryGame onBack={handleBackToDashboard} />;

      case ViewState.WORD_GUESS:
        return <WordGuessGame onBack={handleBackToDashboard} />;

      case ViewState.LIQUID_SORT:
        return <LiquidSortGame onBack={handleBackToDashboard} />;
        
      default:
        return <SubjectSelection onSelectSubject={handleSubjectSelect} />;
    }
  };

  return (
    <Layout 
      currentView={currentView} 
      selectedSubject={selectedSubject}
      onNavigateHome={handleBackToSubjects} 
      isDark={isDark} 
      toggleTheme={toggleTheme}
    >
      {renderContent()}
    </Layout>
  );
};

export default App;