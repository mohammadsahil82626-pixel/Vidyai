import React, { useState, useEffect } from 'react';
import {
  X,
  Layers,
  RotateCw,
  CheckCircle2,
  XCircle,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Loader2,
  RefreshCw,
  Award,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Flashcard } from '../types';

interface FlashcardsModalProps {
  isOpen: boolean;
  notesText: string;
  chapterTitle: string;
  onClose: () => void;
}

export const FlashcardsModal: React.FC<FlashcardsModalProps> = ({
  isOpen,
  notesText,
  chapterTitle,
  onClose,
}) => {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [masteredIds, setMasteredIds] = useState<Set<number>>(new Set());
  const [reviewIds, setReviewIds] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    if (isOpen && notesText && flashcards.length === 0) {
      loadFlashcards();
    }
  }, [isOpen, notesText]);

  async function loadFlashcards() {
    setIsLoading(true);
    setError(null);
    setCurrentIndex(0);
    setIsFlipped(false);
    setMasteredIds(new Set());
    setReviewIds(new Set());
    setIsCompleted(false);

    try {
      const res = await fetch('/api/notes-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate_flashcards',
          notesText,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to extract flashcards.');
      }

      if (Array.isArray(data.flashcards) && data.flashcards.length > 0) {
        setFlashcards(data.flashcards);
      } else {
        throw new Error('No flashcards returned from notes.');
      }
    } catch (err: any) {
      setError(err.message || 'Error creating flashcards.');
    } finally {
      setIsLoading(false);
    }
  }

  const handleMarkMastered = () => {
    if (!currentCard) return;
    const newMastered = new Set(masteredIds).add(currentCard.id);
    setMasteredIds(newMastered);
    advanceCard(newMastered.size);
  };

  const handleMarkReview = () => {
    if (!currentCard) return;
    const newReview = new Set(reviewIds).add(currentCard.id);
    setReviewIds(newReview);
    advanceCard(masteredIds.size);
  };

  const advanceCard = (currentMasteredCount: number) => {
    setIsFlipped(false);
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsCompleted(true);
      if (currentMasteredCount >= Math.ceil(flashcards.length * 0.5)) {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      }
    }
  };

  if (!isOpen) return null;

  const currentCard = flashcards[currentIndex];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-slate-800 dark:to-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-600 text-white shadow-xs">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Active Recall Flashcards</h3>
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

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 flex flex-col justify-center">
          {isLoading && (
            <div className="py-16 text-center space-y-4">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 animate-pulse">
                <Sparkles className="w-7 h-7 animate-spin" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-800 dark:text-slate-200 text-base">
                  Extracting Key Flashcard Concepts...
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Synthesizing formulas, definitions, and high-frequency terms for active recall.
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="py-10 text-center space-y-4">
              <p className="text-sm text-rose-600 dark:text-rose-400">{error}</p>
              <button
                type="button"
                onClick={loadFlashcards}
                className="px-4 py-2 text-sm rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white inline-flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Retry Extraction</span>
              </button>
            </div>
          )}

          {!isLoading && !error && isCompleted && (
            <div className="py-8 text-center space-y-6">
              <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center text-white shadow-lg">
                <Award className="w-10 h-10" />
              </div>

              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800/50">
                  Deck Completed!
                </span>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-3">
                  Mastered: {masteredIds.size} / {flashcards.length}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  {masteredIds.size === flashcards.length
                    ? '🌟 Perfect recall! You have all definitions and formulas memorized.'
                    : '👍 Great practice! Review the flagged cards once more before your exam.'}
                </p>
              </div>

              <div className="flex justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={loadFlashcards}
                  className="px-4 py-2.5 text-sm font-medium rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Practice Deck Again</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 text-sm font-medium rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors"
                >
                  Back to Notes
                </button>
              </div>
            </div>
          )}

          {!isLoading && !error && !isCompleted && currentCard && (
            <div className="space-y-5">
              {/* Card Meta & Counter */}
              <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 font-semibold">
                  {currentCard.category || 'Key Concept'}
                </span>
                <span>
                  Card {currentIndex + 1} of {flashcards.length}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                  style={{ width: `${((currentIndex + 1) / flashcards.length) * 100}%` }}
                />
              </div>

              {/* 3D Flip Card Container */}
              <div
                onClick={() => setIsFlipped(!isFlipped)}
                className="cursor-pointer perspective-1000 min-h-[220px] rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-emerald-400 dark:hover:border-emerald-500 transition-all p-6 flex flex-col justify-between bg-slate-50/70 dark:bg-slate-850 shadow-xs relative group select-none"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] uppercase font-bold tracking-wider text-slate-400">
                    {isFlipped ? 'Answer / Explanation' : 'Prompt / Question'}
                  </span>
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 group-hover:scale-105 transition-transform">
                    <RotateCw className="w-3.5 h-3.5" />
                    <span>Click to flip</span>
                  </span>
                </div>

                <div className="my-auto py-4 text-center">
                  <p
                    className={`leading-relaxed transition-all ${
                      isFlipped
                        ? 'text-sm text-slate-800 dark:text-slate-100 font-normal'
                        : 'text-lg font-bold text-slate-900 dark:text-white'
                    }`}
                  >
                    {isFlipped ? currentCard.back : currentCard.front}
                  </p>
                </div>

                <div className="text-[11px] text-center text-slate-400">
                  {isFlipped ? 'Did you recall this correctly?' : 'Tap card to check answer'}
                </div>
              </div>

              {/* Action Buttons: Knew It vs Review Again */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleMarkReview}
                  className="py-3 px-4 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/20 hover:bg-rose-100 dark:hover:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-2xs"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Review Again</span>
                </button>
                <button
                  type="button"
                  onClick={handleMarkMastered}
                  className="py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-xs"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Mastered (Knew It!)</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
