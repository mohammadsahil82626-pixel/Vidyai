import React, { useState, useEffect } from 'react';
import {
  Settings,
  Cpu,
  Moon,
  Sun,
  Shield,
  BookOpen,
  CheckCircle,
  AlertCircle,
  HelpCircle,
  Lightbulb,
  GraduationCap,
  Sparkles,
} from 'lucide-react';
import { EducationBoard, StudyLanguage } from '../types';

interface SettingsViewProps {
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  defaultLanguage: StudyLanguage;
  onSetDefaultLanguage: (lang: StudyLanguage) => void;
  defaultBoard: EducationBoard;
  onSetDefaultBoard: (board: EducationBoard) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  isDarkMode,
  onToggleDarkMode,
  defaultLanguage,
  onSetDefaultLanguage,
  defaultBoard,
  onSetDefaultBoard,
}) => {
  const [healthStatus, setHealthStatus] = useState<any>(null);
  const [isLoadingHealth, setIsLoadingHealth] = useState(false);

  useEffect(() => {
    checkHealth();
  }, []);

  async function checkHealth() {
    setIsLoadingHealth(true);
    try {
      const res = await fetch('/api/health');
      const data = await res.json();
      setHealthStatus(data);
    } catch (err) {
      setHealthStatus({ status: 'error', error: 'Server unreachable' });
    } finally {
      setIsLoadingHealth(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-5">
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Settings &amp; Syllabus Guide
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          Customize your study preferences, verify AI server status, and review exam preparation strategies.
        </p>
      </div>

      {/* Preferences Section */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-6">
        <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
          <Settings className="w-5 h-5 text-blue-600" />
          <span>App &amp; Study Preferences</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Theme Mode */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="font-semibold text-sm text-slate-900 dark:text-white">Appearance Theme</span>
              <p className="text-xs text-slate-500">Switch between crisp light mode and eye-friendly dark mode</p>
            </div>
            <button
              type="button"
              onClick={onToggleDarkMode}
              className="p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 transition-colors shadow-2xs"
            >
              {isDarkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-indigo-600" />}
            </button>
          </div>

          {/* Default Language */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850 space-y-2">
            <span className="font-semibold text-sm text-slate-900 dark:text-white block">Default Study Language</span>
            <div className="flex gap-2">
              {(['English', 'Hinglish', 'Hindi'] as StudyLanguage[]).map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => onSetDefaultLanguage(lang)}
                  className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold transition-colors ${
                    defaultLanguage === lang
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {lang === 'Hindi' ? 'हिन्दी' : lang}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* AI Backend & Diagnostics Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
            <Cpu className="w-5 h-5 text-indigo-600" />
            <span>AI Model Engine &amp; Connectivity</span>
          </h3>
          <button
            type="button"
            onClick={checkHealth}
            className="text-xs px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 text-slate-600 dark:text-slate-300"
          >
            Check Status
          </button>
        </div>

        <div className="p-4 rounded-xl bg-slate-50/70 dark:bg-slate-850 border border-slate-200 dark:border-slate-700/70 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Core Model:</span>
            <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">gemini-3.8-flash</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Multimodal PDF Engine:</span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">Native Document &amp; Vision OCR Active</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500">API Status:</span>
            {healthStatus?.configured ? (
              <span className="flex items-center gap-1.5 text-emerald-600 font-semibold">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Configured via Server Environment</span>
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-amber-600 font-semibold">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Default Studio Runtime Environment</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Board Exam Strategy Guide */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-5">
        <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
          <GraduationCap className="w-5 h-5 text-amber-500" />
          <span>High-Yield Board Exam Strategies</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl border border-blue-100 dark:border-blue-900/60 bg-blue-50/40 dark:bg-blue-950/20 space-y-2">
            <div className="flex items-center gap-2 font-bold text-blue-700 dark:text-blue-300">
              <Sparkles className="w-4 h-4" />
              <span>Active Recall</span>
            </div>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Don't just passively read notes. Use the <strong>Test Yourself (Quiz)</strong> button and the hide/reveal answers in Section 9 of your notes to test memory retrieval before looking at answers.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-indigo-100 dark:border-indigo-900/60 bg-indigo-50/40 dark:bg-indigo-950/20 space-y-2">
            <div className="flex items-center gap-2 font-bold text-indigo-700 dark:text-indigo-300">
              <Lightbulb className="w-4 h-4" />
              <span>Feynman Technique</span>
            </div>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              If a theorem or biological process seems confusing, click <strong>Explain Point</strong>. VidyaAI translates high-level textbook jargon into real-life everyday analogies you will never forget.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-emerald-100 dark:border-emerald-900/60 bg-emerald-50/40 dark:bg-emerald-950/20 space-y-2">
            <div className="flex items-center gap-2 font-bold text-emerald-700 dark:text-emerald-300">
              <BookOpen className="w-4 h-4" />
              <span>Last Minute Revision</span>
            </div>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              24 hours before the exam, use <strong>Make Shorter</strong> to condense 10-page notes into an ultra-compact single-page formula cheat sheet for rapid memory reinforcement.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
