import React, { useState } from 'react';
import { X, Languages, Loader2, Check, AlertCircle, ArrowRight } from 'lucide-react';
import { StudyLanguage } from '../types';

interface TranslateModalProps {
  isOpen: boolean;
  currentLanguage: StudyLanguage;
  notesText: string;
  onTranslated: (translatedText: string, newLang: StudyLanguage) => void;
  onClose: () => void;
}

export const TranslateModal: React.FC<TranslateModalProps> = ({
  isOpen,
  currentLanguage,
  notesText,
  onTranslated,
  onClose,
}) => {
  const [targetLang, setTargetLang] = useState<StudyLanguage>(
    currentLanguage === 'English' ? 'Hinglish' : 'English'
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const languages: { id: StudyLanguage; label: string; desc: string }[] = [
    {
      id: 'English',
      label: 'English',
      desc: 'Standard academic English with formal terminology and clear explanations',
    },
    {
      id: 'Hindi',
      label: 'हिन्दी (Hindi)',
      desc: 'Rich Devanagari Hindi preserving scientific and mathematical standards',
    },
    {
      id: 'Hinglish',
      label: 'Hinglish',
      desc: 'Natural Indian student conversational style: Roman English script mixed with Hindi',
    },
  ];

  async function handleTranslate() {
    if (targetLang === currentLanguage) {
      onClose();
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/notes-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'translate',
          notesText,
          targetLanguage: targetLang,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Translation failed.');
      }

      onTranslated(data.result, targetLang);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Translation error occurred.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-600 text-white shadow-xs">
              <Languages className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Translate Smart Notes</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Preserves all formulas, structure, and exam questions
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300">
            <span>Current Language:</span>
            <span className="font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-800/50">
              {currentLanguage}
            </span>
          </div>

          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            Select Target Language
          </label>

          <div className="space-y-2.5">
            {languages.map((l) => {
              const isSelected = targetLang === l.id;
              const isCurrent = currentLanguage === l.id;

              return (
                <button
                  key={l.id}
                  type="button"
                  onClick={() => setTargetLang(l.id)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-start justify-between ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/60 dark:bg-blue-950/40 ring-2 ring-blue-500/20'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-850'
                  }`}
                >
                  <div className="space-y-0.5 pr-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-slate-900 dark:text-white">{l.label}</span>
                      {isCurrent && (
                        <span className="text-[10px] uppercase font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.2 rounded">
                          Current
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{l.desc}</p>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                      isSelected
                        ? 'border-blue-600 bg-blue-600 text-white'
                        : 'border-slate-300 dark:border-slate-600'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3" />}
                  </div>
                </button>
              );
            })}
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/50 text-rose-700 dark:text-rose-300 flex items-start gap-2 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleTranslate}
            disabled={isLoading || targetLang === currentLanguage}
            className="px-5 py-2 text-sm font-medium rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white flex items-center gap-2 shadow-xs transition-all"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Translating...</span>
              </>
            ) : (
              <>
                <span>Translate to {targetLang}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
