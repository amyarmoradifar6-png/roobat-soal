
export enum ViewState {
  SUBJECT_SELECTION = 'SUBJECT_SELECTION', // New View
  HOME = 'HOME', // Chapter Selection (Dashboard)
  CHAT = 'CHAT',
  QUIZ = 'QUIZ',
  FLASHCARD = 'FLASHCARD',
  SOLVER = 'SOLVER',
  STEP_BY_STEP = 'STEP_BY_STEP',
  SAMPLE_QUESTIONS = 'SAMPLE_QUESTIONS',
  CHAPTER_DETAIL = 'CHAPTER_DETAIL',
  SUDOKU = 'SUDOKU',
  MEMORY_GAME = 'MEMORY_GAME',
  WORD_GUESS = 'WORD_GUESS',
  LIQUID_SORT = 'LIQUID_SORT'
}

export enum SubjectId {
  PHYSICS = 'PHYSICS',
  MATH = 'MATH',
  GEOMETRY = 'GEOMETRY',
  CHEMISTRY = 'CHEMISTRY'
}

export interface Subject {
  id: SubjectId;
  title: string; // e.g., "فیزیک"
  fullTitle: string; // e.g., "فیزیک طلایی"
  icon: string;
  colorClass: string; // Tailwind class for text color
  bgClass: string; // Tailwind class for background
  borderClass: string;
  description: string;
}

export interface Chapter {
  id: string;
  title: string;
  icon: string;
  description: string;
  tags: string[];
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface Flashcard {
  front: string; 
  back: string; 
}

export interface StepByStepExercise {
  question: string;
  solution: string;
}

export interface SampleQuestion {
  question: string;
  answer: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  isLoading?: boolean;
}

export interface QuizState {
  questions: QuizQuestion[];
  currentIndex: number;
  score: number;
  showResults: boolean;
  selectedAnswers: (number | null)[];
}
