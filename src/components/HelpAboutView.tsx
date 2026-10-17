import React from 'react';
import {
  HelpCircle,
  GraduationCap,
  Sparkles,
  BookOpen,
  FileText,
  MessageSquare,
  Award,
  Upload,
  CheckCircle2,
  Cpu,
  Layers,
  ArrowRight,
} from 'lucide-react';

interface HelpAboutViewProps {
  onOpenMakeNotes: () => void;
  onOpenChat: () => void;
  onOpenQuiz: () => void;
}

export const HelpAboutView: React.FC<HelpAboutViewProps> = ({
  onOpenMakeNotes,
  onOpenChat,
  onOpenQuiz,
}) => {
  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12 animate-in fade-in duration-300">
      {/* Hero Header */}
      <div className="rounded-3xl p-6 md:p-8 bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-600 text-white shadow-xl shadow-blue-500/15 relative overflow-hidden">
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Academic Tutor &amp; Notes Engine</span>
          </div>
          <h1 className="text-2xl md:text-4xl font-black tracking-tight">
            About VidyaAI Study Platform
          </h1>
          <p className="text-blue-100 text-sm md:text-base max-w-2xl leading-relaxed">
            Designed for students across CBSE, ICSE, State Boards, and competitive exams.
            Combines Google Gemini 3.8 Flash with structured pedagogy, multilingual understanding
            (English, Hindi, Hinglish), and 12-section syllabus notes.
          </p>
        </div>

        {/* Ambient background decoration */}
        <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
      </div>

      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          type="button"
          onClick={onOpenMakeNotes}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-left hover:border-blue-500 transition-all group shadow-xs"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/80 text-blue-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <FileText className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center justify-between">
            <span>Make Notes Studio</span>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Generate 12-section chapter revision notes from syllabus topics or uploaded PDFs.
          </p>
        </button>

        <button
          type="button"
          onClick={onOpenChat}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-left hover:border-blue-500 transition-all group shadow-xs"
        >
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <MessageSquare className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center justify-between">
            <span>AI Study Chat</span>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Ask any doubt in English, Hindi, or Hinglish with math formatting and code blocks.
          </p>
        </button>

        <button
          type="button"
          onClick={onOpenQuiz}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-left hover:border-blue-500 transition-all group shadow-xs"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/80 text-amber-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <Award className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center justify-between">
            <span>Quiz Arena</span>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 transition-colors" />
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Take instant MCQ quizzes on your saved notes or any chapter to test exam mastery.
          </p>
        </button>
      </div>

      {/* 12-Section Architecture Guide */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-4 shadow-xs">
        <div className="flex items-center gap-2.5">
          <Layers className="w-5 h-5 text-blue-600" />
          <h2 className="text-base md:text-lg font-bold text-slate-900 dark:text-white">
            The 12-Section Smart Notes Architecture
          </h2>
        </div>
        <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          Unlike generic chat summaries, VidyaAI organizes study notes according to proven board exam pedagogy:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 text-xs">
          {[
            { num: '01', title: 'Chapter, Class & Subject' },
            { num: '02', title: 'Learning Objectives' },
            { num: '03', title: 'Chapter Overview & Summary' },
            { num: '04', title: 'Topic-by-Topic Breakdown' },
            { num: '05', title: 'Key Definitions & Terms' },
            { num: '06', title: 'Core Facts & Examples' },
            { num: '07', title: 'Formulas & Solved Problems' },
            { num: '08', title: 'Comparison Tables & Distinctions' },
            { num: '09', title: 'Common Misconceptions' },
            { num: '10', title: 'Exam Scoring Tips & Mark Traps' },
            { num: '11', title: 'Important Questions & Answers' },
            { num: '12', title: 'Quick-Revision Sheet & Mind Map' },
          ].map((sec) => (
            <div
              key={sec.num}
              className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-center gap-3"
            >
              <span className="font-mono font-bold text-blue-600 dark:text-blue-400 text-xs shrink-0">
                {sec.num}
              </span>
              <span className="font-medium text-slate-800 dark:text-slate-200 leading-snug">
                {sec.title}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Multilingual Support & Curriculum */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-3 shadow-xs">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Supported Boards</h3>
          </div>
          <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span><strong>CBSE:</strong> NCERT aligned chapters with marking scheme emphasis.</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span><strong>ICSE / ISC:</strong> CISCE syllabus structure with comprehensive definitions.</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span><strong>State Boards:</strong> UP, Maharashtra, Bihar, Rajasthan, Karnataka, etc.</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span><strong>Higher Secondary &amp; College:</strong> Physics, Chemistry, Math, Bio, CS, Humanities.</span>
            </li>
          </ul>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-3 shadow-xs">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Study in Your Language</h3>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            VidyaAI is natively trained to explain complicated scientific and mathematical concepts in:
          </p>
          <div className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
            <div className="p-2.5 rounded-xl bg-blue-50/50 dark:bg-blue-950/40 border border-blue-200/50 dark:border-blue-900/50">
              <span className="font-bold text-blue-700 dark:text-blue-300">Hinglish: </span>
              <span className="text-slate-600 dark:text-slate-300">
                Natural conversational Roman Hindi used by students across India.
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/40 border border-emerald-200/50 dark:border-emerald-900/50">
              <span className="font-bold text-emerald-700 dark:text-emerald-300">हिन्दी (Hindi): </span>
              <span className="text-slate-600 dark:text-slate-300">
                Pure Devanagari script with standard scientific terms and definitions.
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-100/70 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <span className="font-bold text-slate-800 dark:text-slate-200">English: </span>
              <span className="text-slate-600 dark:text-slate-300">
                Crisp, academic English ideal for standard board answer sheets.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Useful Keyboard Shortcuts & Navigation */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-3 shadow-xs">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-blue-600" />
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">Pro Tips &amp; Shortcuts</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600 dark:text-slate-400">
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800">
            <span>Send message in chat</span>
            <kbd className="px-2 py-0.5 rounded bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 font-mono text-[11px] font-semibold text-slate-800 dark:text-slate-200">
              Enter
            </kbd>
          </div>
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800">
            <span>Newline in chat input</span>
            <kbd className="px-2 py-0.5 rounded bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 font-mono text-[11px] font-semibold text-slate-800 dark:text-slate-200">
              Shift + Enter
            </kbd>
          </div>
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800">
            <span>Close side drawer</span>
            <kbd className="px-2 py-0.5 rounded bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 font-mono text-[11px] font-semibold text-slate-800 dark:text-slate-200">
              Esc
            </kbd>
          </div>
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800">
            <span>Quick notes command in chat</span>
            <span className="font-mono text-[11px] font-semibold text-blue-600 dark:text-blue-400">
              /notes [topic]
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
