import React, { useState } from 'react';
import {
  Bookmark,
  Search,
  Trash2,
  Edit2,
  Download,
  Calendar,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  FileText,
  AlertTriangle,
  Check,
  X,
} from 'lucide-react';
import { SavedNote } from '../types';
import { downloadNotesAsPdf } from '../utils/pdfExport';

interface SavedNotesViewProps {
  notes: SavedNote[];
  onOpenNote: (note: SavedNote) => void;
  onDeleteNote: (id: string) => void;
  onRenameNote: (id: string, newTitle: string) => void;
  onClearAllNotes: () => void;
  onExportNotesJson: () => void;
}

export const SavedNotesView: React.FC<SavedNotesViewProps> = ({
  notes,
  onOpenNote,
  onDeleteNote,
  onRenameNote,
  onClearAllNotes,
  onExportNotesJson,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Filter notes
  const filteredNotes = notes.filter((n) => {
    const matchesSearch =
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.content.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSubject = selectedSubject === 'All' || n.subject === selectedSubject;
    return matchesSearch && matchesSubject;
  });

  const uniqueSubjects = Array.from(new Set(notes.map((n) => n.subject))).filter(Boolean);

  const startRename = (note: SavedNote) => {
    setRenamingId(note.id);
    setNewTitle(note.title);
  };

  const submitRename = (id: string) => {
    if (newTitle.trim()) {
      onRenameNote(id, newTitle.trim());
    }
    setRenamingId(null);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
              Personal Study Vault
            </span>
            <span className="text-xs text-slate-500">• {notes.length} Chapters Saved</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white mt-1.5 tracking-tight">
            Saved Smart Notes
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Re-read, download, rename, and test yourself on your previously generated study notes.
          </p>
        </div>

        {notes.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onExportNotesJson}
              className="px-3.5 py-2 text-xs font-medium rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Backup (JSON)</span>
            </button>
            <button
              type="button"
              onClick={() => setShowClearConfirm(true)}
              className="px-3.5 py-2 text-xs font-medium rounded-xl border border-rose-200 dark:border-rose-900 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-1.5 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear All</span>
            </button>
          </div>
        )}
      </div>

      {/* Privacy Notice Banner */}
      <div className="p-4 rounded-xl bg-slate-100/80 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 flex items-start gap-3 text-xs text-slate-600 dark:text-slate-400">
        <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
        <div>
          <strong className="text-slate-800 dark:text-slate-200">100% Student Privacy: </strong>
          Your generated notes are stored strictly inside your browser's local sandbox storage. No student notes, PDFs, or queries are ever exposed to other users or retained on public servers.
        </div>
      </div>

      {/* Clear All Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-sm w-full border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
            <div className="w-12 h-12 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Clear All Saved Notes?</h3>
              <p className="text-xs text-slate-500 mt-1">
                This will permanently delete all {notes.length} saved study chapters from this browser. This action cannot be undone.
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 py-2 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onClearAllNotes();
                  setShowClearConfirm(false);
                }}
                className="flex-1 py-2 text-xs font-semibold rounded-xl bg-rose-600 text-white hover:bg-rose-700"
              >
                Delete All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search & Subject Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search saved chapters, concepts, formulas, or subjects..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-850 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
          />
        </div>

        {uniqueSubjects.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            <button
              type="button"
              onClick={() => setSelectedSubject('All')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium shrink-0 transition-colors ${
                selectedSubject === 'All'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
              }`}
            >
              All Subjects
            </button>
            {uniqueSubjects.map((sub) => (
              <button
                key={sub}
                type="button"
                onClick={() => setSelectedSubject(sub)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium shrink-0 transition-colors ${
                  selectedSubject === sub
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                }`}
              >
                {sub}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Notes Grid */}
      {filteredNotes.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center space-y-3">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
            <Bookmark className="w-8 h-8" />
          </div>
          <h3 className="font-bold text-slate-800 dark:text-slate-200 text-base">
            {notes.length === 0 ? 'No Saved Notes Yet' : 'No matching notes found'}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {notes.length === 0
              ? 'When you generate smart notes, click "Save Notes" in the toolbar to access them anytime here.'
              : 'Try searching with a different term or clear the subject filter.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredNotes.map((note) => {
            const isBeingRenamed = renamingId === note.id;

            return (
              <div
                key={note.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 shadow-xs hover:shadow-md transition-all p-5 flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  {/* Badges */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-100 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300">
                        {note.subject}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {note.studentClass}
                      </span>
                    </div>

                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(note.createdAt).toLocaleDateString()}</span>
                    </span>
                  </div>

                  {/* Title (or edit mode) */}
                  {isBeingRenamed ? (
                    <div className="flex items-center gap-1.5 pt-1">
                      <input
                        type="text"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        className="flex-1 px-2.5 py-1 text-sm rounded-lg border border-blue-500 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') submitRename(note.id);
                          if (e.key === 'Escape') setRenamingId(null);
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => submitRename(note.id)}
                        className="p-1.5 rounded-lg bg-emerald-600 text-white"
                        title="Save title"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setRenamingId(null)}
                        className="p-1.5 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                        title="Cancel"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-slate-900 dark:text-white text-base leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {note.title}
                      </h3>
                      <button
                        type="button"
                        onClick={() => startRename(note)}
                        className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Rename chapter title"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {/* Snippet */}
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed">
                    {note.content.replace(/#+\s*/g, '').slice(0, 180)}...
                  </p>
                </div>

                {/* Footer Controls */}
                <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    {/* PDF Download direct button */}
                    <button
                      type="button"
                      onClick={() =>
                        downloadNotesAsPdf(note.title, note.content, {
                          chapterName: note.title,
                          studentClass: note.studentClass,
                          board: note.board,
                          subject: note.subject,
                          language: note.language,
                          length: note.length,
                          examFocus: note.examFocus,
                          generatedAt: note.createdAt,
                        })
                      }
                      className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"
                      title="Download PDF"
                    >
                      <Download className="w-4 h-4" />
                    </button>

                    {/* Delete button */}
                    <button
                      type="button"
                      onClick={() => onDeleteNote(note.id)}
                      className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                      title="Delete note"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Open in Generator */}
                  <button
                    type="button"
                    onClick={() => onOpenNote(note)}
                    className="px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1.5 transition-colors shadow-2xs"
                  >
                    <span>Open &amp; Study</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
