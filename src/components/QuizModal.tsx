import React, { useState, useEffect } from 'react';
import { X, Award, CheckCircle2, XCircle, HelpCircle, Loader2, RefreshCw, Sparkles, ArrowRight, BookOpen } from 'lucide-react';
import confetti from 'canvas-confetti';
import { QuizQuestion } from '../types';

interface QuizModalProps {
  isOpen: boolean;
  notesText: string;
  chapterTitle: string;
  onClose: () => void;
}

export const QuizModal: React.FC<QuizModalProps> = ({
  isOpen,
  notesText,
  chapterTitle,
  onClose,
}) => {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [revealed, setRevealed] = useState<Record<number, boolean>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    if (isOpen && notesText && questions.length === 0) {
      loadQuiz();
    }
  }, [isOpen, notesText]);

  async function loadQuiz() {
    setIsLoading(true);
    setError(null);
    setCurrentIndex(0);
    setSelectedAnswers({});
    setRevealed({});
    setIsFinished(false);

    try {
      const res = await fetch('/api/notes-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate_quiz',
          notesText,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate quiz.');
      }

      if (Array.isArray(data.quiz) && data.quiz.length > 0) {
        setQuestions(data.quiz);
      } else {
        throw new Error('Received empty question set.');
      }
    } catch (err: any) {
      setError(err.message || 'Error creating quiz questions.');
    } finally {
      setIsLoading(false);
    }
  }

  const handleSelectOption = (optionIndex: number) => {
    if (revealed[currentIndex]) return; // already locked

    setSelectedAnswers((prev) => ({ ...prev, [currentIndex]: optionIndex }));
    setRevealed((prev) => ({ ...prev, [currentIndex]: true }));
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsFinished(true);
      // Trigger celebratory confetti if score >= 60%
      const correctCount = questions.reduce((acc, q, idx) => {
        return selectedAnswers[idx] === q.correctIndex ? acc + 1 : acc;
      }, 0);

      if (correctCount >= Math.ceil(questions.length * 0.6)) {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      }
    }
  };

  if (!isOpen) return null;

  const currentQ = questions[currentIndex];
  const userChoice = selectedAnswers[currentIndex];
  const isQuestionAnswered = revealed[currentIndex];

  const totalScore = questions.reduce((acc, q, idx) => {
    return selectedAnswers[idx] === q.correctIndex ? acc + 1 : acc;
  }, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-slate-800 dark:to-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500 text-white shadow-xs">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Quick Chapter Quiz</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-sm">
                {chapterTitle || 'Based on Generated Smart Notes'}
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

        {/* Content area */}
        <div className="p-6 overflow-y-auto flex-1">
          {isLoading && (
            <div className="py-16 text-center space-y-4">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 flex items-center justify-center text-amber-500 animate-pulse">
                <Sparkles className="w-7 h-7 animate-spin" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-800 dark:text-slate-200 text-base">
                  Synthesizing Concept Questions...
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Extracting key definitions, formulas, and tricky board exam traps from your notes.
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="py-10 text-center space-y-4">
              <p className="text-sm text-rose-600 dark:text-rose-400">{error}</p>
              <button
                type="button"
                onClick={loadQuiz}
                className="px-4 py-2 text-sm rounded-xl bg-amber-500 hover:bg-amber-600 text-white inline-flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Retry Generation</span>
              </button>
            </div>
          )}

          {!isLoading && !error && isFinished && (
            <div className="py-8 text-center space-y-6">
              <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center text-white shadow-lg">
                <Award className="w-10 h-10" />
              </div>

              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-3 py-1 rounded-full border border-amber-200 dark:border-amber-800/50">
                  Quiz Completed
                </span>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-3">
                  Score: {totalScore} / {questions.length}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  {totalScore === questions.length
                    ? '🎉 Phenomenal! You have complete mastery over this chapter!'
                    : totalScore >= 3
                    ? '👍 Great revision! You got the core concepts solid.'
                    : '📖 Good effort! Review the definitions and formulas once more.'}
                </p>
              </div>

              {/* Breakdown list */}
              <div className="text-left bg-slate-50 dark:bg-slate-800/40 rounded-xl p-4 border border-slate-200 dark:border-slate-700/60 space-y-2.5">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Summary Review</h4>
                {questions.map((q, idx) => {
                  const isCorrect = selectedAnswers[idx] === q.correctIndex;
                  return (
                    <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                      {isCorrect ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <span className="font-semibold text-slate-900 dark:text-slate-100">Q{idx + 1}: </span>
                        <span>{q.question}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={loadQuiz}
                  className="px-4 py-2.5 text-sm font-medium rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Retake with New Questions</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 text-sm font-medium rounded-xl bg-amber-500 hover:bg-amber-600 text-white shadow-xs transition-colors"
                >
                  Back to Notes
                </button>
              </div>
            </div>
          )}

          {!isLoading && !error && !isFinished && currentQ && (
            <div className="space-y-5">
              {/* Progress Bar */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
                  <span>
                    Question {currentIndex + 1} of {questions.length}
                  </span>
                  {currentQ.difficulty && (
                    <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {currentQ.difficulty}
                    </span>
                  )}
                </div>
                <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full transition-all duration-300"
                    style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                  />
                </div>
              </div>

              {/* Question text */}
              <div className="p-4 rounded-xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60">
                <h4 className="font-semibold text-slate-900 dark:text-white text-base leading-snug">
                  {currentQ.question}
                </h4>
              </div>

              {/* Options */}
              <div className="space-y-2.5">
                {currentQ.options.map((opt, optIdx) => {
                  const isSelected = userChoice === optIdx;
                  const isCorrect = currentQ.correctIndex === optIdx;

                  let optionStyle =
                    'border-slate-200 dark:border-slate-700 hover:border-amber-400 dark:hover:border-amber-600 bg-white dark:bg-slate-850 text-slate-800 dark:text-slate-200';

                  if (isQuestionAnswered) {
                    if (isCorrect) {
                      optionStyle =
                        'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 font-medium ring-1 ring-emerald-500/30';
                    } else if (isSelected && !isCorrect) {
                      optionStyle =
                        'border-rose-400 bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200 ring-1 ring-rose-400/30';
                    } else {
                      optionStyle = 'opacity-50 border-slate-200 dark:border-slate-800 text-slate-500';
                    }
                  }

                  return (
                    <button
                      key={optIdx}
                      type="button"
                      disabled={isQuestionAnswered}
                      onClick={() => handleSelectOption(optIdx)}
                      className={`w-full text-left p-3.5 rounded-xl border text-sm transition-all flex items-center justify-between group ${optionStyle}`}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 ${
                            isQuestionAnswered && isCorrect
                              ? 'bg-emerald-500 text-white'
                              : isQuestionAnswered && isSelected && !isCorrect
                              ? 'bg-rose-500 text-white'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                          }`}
                        >
                          {String.fromCharCode(65 + optIdx)}
                        </span>
                        <span>{opt}</span>
                      </div>

                      {isQuestionAnswered && isCorrect && (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                      )}
                      {isQuestionAnswered && isSelected && !isCorrect && (
                        <XCircle className="w-5 h-5 text-rose-500 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Explanation Reveal */}
              {isQuestionAnswered && (
                <div className="p-4 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 text-xs text-slate-700 dark:text-slate-300 space-y-1 animate-in fade-in">
                  <div className="flex items-center gap-1.5 font-bold text-amber-700 dark:text-amber-400">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Concept Explanation:</span>
                  </div>
                  <p className="leading-relaxed">{currentQ.explanation}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {!isLoading && !error && !isFinished && (
          <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Score: <strong className="text-slate-800 dark:text-slate-200">{totalScore}</strong>
            </span>

            {isQuestionAnswered ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-5 py-2 text-sm font-medium rounded-xl bg-amber-500 hover:bg-amber-600 text-white flex items-center gap-2 shadow-xs transition-colors"
              >
                <span>{currentIndex === questions.length - 1 ? 'Show Final Score' : 'Next Question'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <p className="text-xs text-slate-400 italic">Select an option to check answer</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
