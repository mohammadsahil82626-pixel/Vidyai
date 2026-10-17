export type StudyLanguage = 'English' | 'Hindi' | 'Hinglish';

export type NotesLevel = 'Quick Revision' | 'Standard Study Notes' | 'Complete Chapter Notes';

// Backward compatibility alias
export type NotesLength = NotesLevel | 'Ultra Short' | 'Short' | 'Detailed';

export type LearningPurpose =
  | 'Understand Concepts'
  | 'School Homework'
  | 'Exam Preparation'
  | 'Last-Minute Revision';

export type StudentClass =
  | 'Class 6'
  | 'Class 7'
  | 'Class 8'
  | 'Class 9'
  | 'Class 10'
  | 'Class 11'
  | 'Class 12'
  | 'College / Other'
  | string;

export type EducationBoard = 'CBSE' | 'ICSE' | 'State Board' | 'Other';

export type Subject =
  | 'Science'
  | 'Mathematics'
  | 'Physics'
  | 'Chemistry'
  | 'Biology'
  | 'English'
  | 'Hindi'
  | 'Social Science'
  | 'History'
  | 'Geography'
  | 'Civics'
  | 'Computer Science'
  | 'Custom';

export type ExamFocus =
  | 'full revision'
  | 'definitions'
  | 'formulas'
  | 'important questions'
  | 'conceptual understanding'
  | LearningPurpose;

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  isError?: boolean;
  attachedPdfName?: string;
}

export interface Conversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface SavedNote {
  id: string;
  title: string;
  content: string;
  studentClass: string;
  board: string;
  subject: string;
  language: StudyLanguage;
  level?: NotesLevel;
  length?: string;
  learningPurpose?: LearningPurpose;
  examFocus?: string;
  createdAt: string;
  updatedAt: string;
  hadPdf?: boolean;
  pdfFileName?: string;
  tags?: string[];
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
}

export interface Flashcard {
  id: number;
  front: string;
  back: string;
  category?: string;
}

export interface PdfVerificationResult {
  isValid: boolean;
  fileName: string;
  sizeBytes: number;
  estimatedPages: number;
  isLikelyScanned: boolean;
  infoNote?: string;
}
