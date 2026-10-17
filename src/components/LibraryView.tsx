import React, { useState } from 'react';
import {
  Bookmark,
  Layers,
  FileText,
  Search,
  Sparkles,
  BookOpen,
  ArrowRight,
  ExternalLink,
  Tag,
  CheckCircle2,
  Brain,
  Download,
} from 'lucide-react';
import { SavedNote } from '../types';
import { FlashcardsModal } from './FlashcardsModal';
import { downloadNotesAsPdf } from '../utils/pdfExport';

interface LibraryViewProps {
  notes: SavedNote[];
  onOpenNote: (note: SavedNote) => void;
  onOpenNotesGenerator: () => void;
}

export const LibraryView: React.FC<LibraryViewProps> = ({
  notes,
  onOpenNote,
  onOpenNotesGenerator,
}) => {
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFlashcardNote, setActiveFlashcardNote] = useState<SavedNote | null>(null);

  const subjects = ['all', ...Array.from(new Set(notes.map((n) => n.subject).filter(Boolean)))];

  const filteredNotes = notes.filter((n) => {
    const matchesSubject = selectedSubject === 'all' || n.subject === selectedSubject;
    const matchesSearch =
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (n.content && n.content.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSubject && matchesSearch;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-600 flex items-center justify-center text-white shadow-xs">
              <Layers className="w-4 h-4" />
            </div>
            <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Study Library &amp; Saved Items
            </h1>
          </div>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Access all your generated chapter notes, flashcard decks, formulas, and revision materials.
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenNotesGenerator}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-colors shrink-0 self-start md:self-auto"
        >
          <Sparkles className="w-4 h-4" />
          <span>New Smart Notes</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notes, formulas, topics in your library..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs md:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Subject Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {subjects.map((subj) => (
            <button
              key={subj}
              type="button"
              onClick={() => setSelectedSubject(subj)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize whitespace-nowrap transition-colors ${
                selectedSubject === subj
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200/80 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {subj === 'all' ? 'All Subjects' : subj}
            </button>
          ))}
        </div>
      </div>

      {/* Notes Grid */}
      {filteredNotes.length === 0 ? (
        <div className="py-16 text-center rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 space-y-4">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">
              No items found in your library
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              {searchQuery
                ? 'Try a different search query or clear your filter.'
                : 'Generate your first chapter notes using the Make Notes Studio.'}
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenNotesGenerator}
            className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors inline-flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Generate Notes Now</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredNotes.map((note) => (
            <div
              key={note.id}
              className="rounded-2xl p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-blue-500/60 transition-all flex flex-col justify-between group shadow-xs hover:shadow-md"
            >
              <div className="space-y-3">
                {/* Badges */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 border border-blue-200/40 dark:border-blue-900/40">
                      {note.subject || 'General'}
                    </span>
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      {note.studentClass || 'Class 10'}
                    </span>
                  </div>

                  <span className="text-[10px] text-slate-400 font-mono">
                    {note.language || 'English'}
                  </span>
                </div>

                {/* Title */}
                <h3 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-2 leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {note.title}
                </h3>

                {/* Snippet */}
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed">
                  {note.content.replace(/^#+\s/gm, '').slice(0, 150)}...
                </p>
              </div>

              {/* Bottom Actions */}
              <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                {/* Flashcards trigger */}
                <button
                  type="button"
                  onClick={() => setActiveFlashcardNote(note)}
                  className="px-2.5 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 font-semibold flex items-center gap-1.5 transition-colors text-[11px]"
                  title="Practice interactive flashcards"
                >
                  <Brain className="w-3.5 h-3.5" />
                  <span>Flashcards</span>
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() =>
                      downloadNotesAsPdf(
                        note.title,
                        note.content,
                        {
                          chapterName: note.title,
                          studentClass: note.studentClass,
                          board: note.board,
                          subject: note.subject,
                          language: note.language,
                        }
                      )
                    }
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="Download PDF"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => onOpenNote(note)}
                    className="px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center gap-1 transition-colors text-[11px]"
                  >
                    <span>Open</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Flashcards Modal */}
      {activeFlashcardNote && (
        <FlashcardsModal
          isOpen={Boolean(activeFlashcardNote)}
          notesText={activeFlashcardNote.content}
          chapterTitle={activeFlashcardNote.title}
          onClose={() => setActiveFlashcardNote(null)}
        />
      )}
    </div>
  );
};
