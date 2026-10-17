import React, { useState } from 'react';
import {
  Award,
  Sparkles,
  BookOpen,
  RefreshCw,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Loader2,
  Sliders,
  ChevronRight,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { QuizQuestion, SavedNote } from '../types';

interface QuizArenaProps {
  savedNotes: SavedNote[];
  onOpenNotesGenerator: () => void;
}

export const QuizArena: React.FC<QuizArenaProps> = ({ savedNotes, onOpenNotesGenerator }) => {
  const [topicInput, setTopicInput] = useState('');
  const [selectedNoteId, setSelectedNoteId] = useState<string>('custom');
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');

  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [revealed, setRevealed] = useState<Record<number, boolean>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFinished, setIsFinished] = useState(false);
  const [quizTitle, setQuizTitle] = useState('');

  const handleStartQuiz = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    let textForQuiz = '';
    let title = '';

    if (selectedNoteId !== 'custom') {
      const note = savedNotes.find((n) => n.id === selectedNoteId);
      if (note) {
        textForQuiz = note.content;
        title = note.title;
      }
    } else {
      if (!topicInput.trim()) {
        setError('Please enter a chapter topic or select one of your saved notes.');
        return;
      }
      textForQuiz = `Subject Topic: ${topicInput}. Difficulty Level: ${difficulty}. Please focus on board exam high-yield questions for this topic.`;
      title = topicInput;
    }

    setIsLoading(true);
    setError(null);
    setQuizTitle(title);
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
          notesText: textForQuiz,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate quiz.');
      }

      if (Array.isArray(data.quiz) && data.quiz.length > 0) {
        setQuestions(data.quiz);
      } else {
        throw new Error('Received empty question set from model.');
      }
    } catch (err: any) {
      setError(err.message || 'Error creating questions.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectOption = (optIdx: number) => {
    if (revealed[currentIndex]) return;
    setSelectedAnswers((prev) => ({ ...prev, [currentIndex]: optIdx }));
    setRevealed((prev) => ({ ...prev, [currentIndex]: true }));
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsFinished(true);
      const correctCount = questions.reduce((acc, q, idx) => {
        return selectedAnswers[idx] === q.correctIndex ? acc + 1 : acc;
      }, 0);

      if (correctCount >= Math.ceil(questions.length * 0.6)) {
        confetti({
          particleCount: 90,
          spread: 80,
          origin: { y: 0.6 },
        });
      }
    }
  };

  const totalScore = questions.reduce((acc, q, idx) => {
    return selectedAnswers[idx] === q.correctIndex ? acc + 1 : acc;
  }, 0);

  const currentQ = questions[currentIndex];
  const userChoice = selectedAnswers[currentIndex];
  const isQuestionAnswered = revealed[currentIndex];

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-5">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60">
            Interactive Recall
          </span>
          <span className="text-xs text-slate-500">• Test Conceptual Mastery</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white mt-1.5 tracking-tight">
          Quiz Arena
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          Challenge yourself with instant 5-question MCQs synthesized from your saved notes or any syllabus topic.
        </p>
      </div>

      {/* Configuration Box if no active quiz */}
      {questions.length === 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 shadow-sm space-y-6">
          <form onSubmit={handleStartQuiz} className="space-y-5">
            <h3 className="font-bold text-slate-900 dark:text-white text-base">Select Quiz Source</h3>

            {/* Source selector */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div
                onClick={() => setSelectedNoteId('custom')}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  selectedNoteId === 'custom'
                    ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/20 ring-1 ring-amber-500/30'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-850'
                }`}
              >
                <div className="font-semibold text-sm text-slate-900 dark:text-white">Custom Chapter Topic</div>
                <p className="text-xs text-slate-500 mt-1">Type any board exam chapter or concept you want to practice</p>
              </div>

              <div
                onClick={() => {
                  if (savedNotes.length > 0) {
                    setSelectedNoteId(savedNotes[0].id);
                  } else {
                    alert('You have no saved notes yet. Generate notes first or type a custom topic.');
                  }
                }}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  selectedNoteId !== 'custom'
                    ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/20 ring-1 ring-amber-500/30'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-850'
                }`}
              >
                <div className="font-semibold text-sm text-slate-900 dark:text-white">
                  From My Saved Notes ({savedNotes.length})
                </div>
                <p className="text-xs text-slate-500 mt-1">Test your recall from notes saved in your local library</p>
              </div>
            </div>

            {/* Custom input */}
            {selectedNoteId === 'custom' ? (
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Enter Subject &amp; Chapter
                </label>
                <input
                  type="text"
                  value={topicInput}
                  onChange={(e) => setTopicInput(e.target.value)}
                  placeholder="e.g. CBSE 10th Science - Chemical Reactions & Equations, or Class 12 Calculus..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                />
              </div>
            ) : (
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Choose Saved Note
                </label>
                <select
                  value={selectedNoteId}
                  onChange={(e) => setSelectedNoteId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                >
                  {savedNotes.map((n) => (
                    <option key={n.id} value={n.id}>
                      {n.title} ({n.subject} - {n.studentClass})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Difficulty selection */}
            <div className="space-y-1.5 pt-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Difficulty Level
              </label>
              <div className="flex gap-2">
                {(['Easy', 'Medium', 'Hard'] as const).map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDifficulty(d)}
                    className={`flex-1 py-2 text-xs font-semibold rounded-xl border transition-colors ${
                      difficulty === d
                        ? 'bg-amber-500 text-white border-amber-500 shadow-2xs'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">{error}</p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-6 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-md shadow-amber-500/20 disabled:opacity-50 flex items-center justify-center gap-2 transition-all"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Generating MCQs &amp; Traps...</span>
                </>
              ) : (
                <>
                  <Award className="w-4 h-4" />
                  <span>Start 5-Question Quiz</span>
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* Active Quiz Area */}
      {questions.length > 0 && !isFinished && currentQ && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
            <div>
              <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                {quizTitle}
              </span>
              <h3 className="font-bold text-slate-900 dark:text-white text-base mt-0.5">
                Question {currentIndex + 1} of {questions.length}
              </h3>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 font-mono text-slate-600 dark:text-slate-300">
              Score: {totalScore}
            </span>
          </div>

          {/* Progress line */}
          <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-500 rounded-full transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
            />
          </div>

          {/* Question text */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-slate-900 dark:text-white font-semibold text-base leading-snug">
            {currentQ.question}
          </div>

          {/* Options */}
          <div className="space-y-3">
            {currentQ.options.map((opt, optIdx) => {
              const isSelected = userChoice === optIdx;
              const isCorrect = currentQ.correctIndex === optIdx;

              let style =
                'border-slate-200 dark:border-slate-700 hover:border-amber-400 bg-white dark:bg-slate-850 text-slate-800 dark:text-slate-200';

              if (isQuestionAnswered) {
                if (isCorrect) {
                  style =
                    'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 font-medium ring-1 ring-emerald-500/30';
                } else if (isSelected && !isCorrect) {
                  style =
                    'border-rose-400 bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200 ring-1 ring-rose-400/30';
                } else {
                  style = 'opacity-50 border-slate-200 dark:border-slate-800 text-slate-500';
                }
              }

              return (
                <button
                  key={optIdx}
                  type="button"
                  disabled={isQuestionAnswered}
                  onClick={() => handleSelectOption(optIdx)}
                  className={`w-full text-left p-4 rounded-xl border text-sm transition-all flex items-center justify-between group ${style}`}
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

          {/* Explanation reveal */}
          {isQuestionAnswered && (
            <div className="p-4 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 text-xs text-slate-700 dark:text-slate-300 space-y-1 animate-in fade-in">
              <span className="font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Conceptual Reasoning:</span>
              </span>
              <p className="leading-relaxed">{currentQ.explanation}</p>
            </div>
          )}

          {/* Next Button */}
          {isQuestionAnswered && (
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold flex items-center gap-2 shadow-xs transition-colors"
              >
                <span>{currentIndex === questions.length - 1 ? 'Finish Quiz' : 'Next Question'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Finished Result View */}
      {isFinished && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 text-center space-y-6 shadow-sm">
          <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center text-white shadow-lg">
            <Award className="w-10 h-10" />
          </div>

          <div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white">
              Quiz Completed: {totalScore} / {questions.length} Correct
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              {totalScore === questions.length
                ? '🌟 Brilliant score! You have full retention of this chapter.'
                : totalScore >= 3
                ? '🎯 Well done! A quick revision of the weak spots will make it 100%.'
                : '📚 Good practice session! Re-generate smart notes to reinforce key points.'}
            </p>
          </div>

          <div className="flex justify-center gap-3">
            <button
              type="button"
              onClick={() => {
                setQuestions([]);
                setIsFinished(false);
              }}
              className="px-4 py-2.5 text-sm font-medium rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 text-slate-700 dark:text-slate-300"
            >
              Choose Another Topic
            </button>
            <button
              type="button"
              onClick={onOpenNotesGenerator}
              className="px-5 py-2.5 text-sm font-medium rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-xs"
            >
              Generate Notes for this Chapter
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
