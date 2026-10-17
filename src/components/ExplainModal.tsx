import React, { useState } from 'react';
import { X, Sparkles, Loader2, Lightbulb, BookOpen, AlertCircle, Copy, Check } from 'lucide-react';
import { MarkdownRenderer } from './MarkdownRenderer';

interface ExplainModalProps {
  isOpen: boolean;
  initialTopic: string;
  notesContext: string;
  onClose: () => void;
}

export const ExplainModal: React.FC<ExplainModalProps> = ({
  isOpen,
  initialTopic,
  notesContext,
  onClose,
}) => {
  const [topic, setTopic] = useState(initialTopic);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Update topic if initialTopic changes
  React.useEffect(() => {
    if (initialTopic) {
      setTopic(initialTopic);
      handleExplain(initialTopic);
    }
  }, [initialTopic]);

  if (!isOpen) return null;

  async function handleExplain(targetTopic: string) {
    if (!targetTopic.trim()) return;
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/notes-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'explain_point',
          notesText: notesContext,
          pointToExplain: targetTopic,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate explanation.');
      }

      setExplanation(data.result);
    } catch (err: any) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setIsLoading(false);
    }
  }

  const handleCopy = () => {
    if (explanation) {
      navigator.clipboard.writeText(explanation);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-slate-800 dark:to-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Explain a Difficult Point</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Simple real-world analogies, step-by-step breakdown &amp; memory tricks
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

        {/* Input Bar */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
            What concept or formula is tricky?
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Electromagnetic Induction, Photosynthesis, Why is acceleration zero at terminal velocity..."
              className="flex-1 px-4 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition-all"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleExplain(topic);
              }}
            />
            <button
              type="button"
              onClick={() => handleExplain(topic)}
              disabled={isLoading || !topic.trim()}
              className="px-5 py-2.5 rounded-xl font-medium text-sm bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white flex items-center gap-2 transition-all shadow-xs shrink-0"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Explaining...</span>
                </>
              ) : (
                <>
                  <Lightbulb className="w-4 h-4" />
                  <span>Break Down</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Content area */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {isLoading && (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 animate-pulse">
                <Sparkles className="w-6 h-6 animate-spin" />
              </div>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                Crafting an intuitive 10-year-old style analogy...
              </p>
              <p className="text-xs text-slate-500 max-w-sm">
                Breaking down the math, science, or timeline into relatable real-life terms.
              </p>
            </div>
          )}

          {error && (
            <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/50 text-rose-700 dark:text-rose-300 flex items-start gap-3 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Unable to explain</p>
                <p className="text-xs opacity-90">{error}</p>
              </div>
            </div>
          )}

          {!isLoading && explanation && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800/50">
                  Intuitive Breakdown
                </span>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="text-emerald-500">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Explanation</span>
                    </>
                  )}
                </button>
              </div>

              <div className="prose dark:prose-invert max-w-none text-sm text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50/60 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200/60 dark:border-slate-800">
                <MarkdownRenderer content={explanation} />
              </div>
            </div>
          )}

          {!isLoading && !explanation && !error && (
            <div className="py-10 text-center text-slate-400 space-y-2">
              <BookOpen className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600" />
              <p className="text-sm">Type any concept above or click "Break Down" to get an effortless explanation.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
