import React, { useState, useRef, useEffect } from 'react';
import {
  FileText,
  Upload,
  Sparkles,
  Download,
  Copy,
  Printer,
  RefreshCw,
  Scissors,
  HelpCircle,
  Languages,
  Award,
  BookmarkPlus,
  Edit3,
  Check,
  AlertCircle,
  FileCheck2,
  Trash2,
  Loader2,
  Eye,
  Save,
  BookOpen,
  School,
  Sliders,
  ChevronRight,
  Layers,
  MessageSquare,
  Maximize2,
  Minimize2,
  GraduationCap,
  ArrowRight,
  CheckCircle,
} from 'lucide-react';
import {
  EducationBoard,
  LearningPurpose,
  NotesLevel,
  PdfVerificationResult,
  SavedNote,
  StudentClass,
  StudyLanguage,
  Subject,
} from '../types';
import { MarkdownRenderer } from './MarkdownRenderer';
import { downloadNotesAsPdf } from '../utils/pdfExport';
import { ExplainModal } from './ExplainModal';
import { TranslateModal } from './TranslateModal';
import { QuizModal } from './QuizModal';
import { FlashcardsModal } from './FlashcardsModal';

interface SmartNotesGeneratorProps {
  onSaveNote: (note: Omit<SavedNote, 'id' | 'createdAt' | 'updatedAt'>) => void;
  initialNote?: SavedNote | null;
  onAskAiAboutNotes?: (noteTitle: string, noteContent: string) => void;
}

export const SmartNotesGenerator: React.FC<SmartNotesGeneratorProps> = ({
  onSaveNote,
  initialNote,
  onAskAiAboutNotes,
}) => {
  // Form State
  const [studentClass, setStudentClass] = useState<StudentClass>(
    (initialNote?.studentClass as StudentClass) || 'Class 10'
  );
  const [board, setBoard] = useState<EducationBoard>(
    (initialNote?.board as EducationBoard) || 'CBSE'
  );
  const [subject, setSubject] = useState<Subject>(
    (initialNote?.subject as Subject) || 'Science'
  );
  const [customSubject, setCustomSubject] = useState('');
  const [customGrade, setCustomGrade] = useState('');
  const [chapterName, setChapterName] = useState(initialNote?.title || '');
  const [language, setLanguage] = useState<StudyLanguage>(
    initialNote?.language || 'English'
  );
  const [notesLevel, setNotesLevel] = useState<NotesLevel>(
    initialNote?.level || (initialNote?.length as NotesLevel) || 'Standard Study Notes'
  );
  const [learningPurpose, setLearningPurpose] = useState<LearningPurpose>(
    initialNote?.learningPurpose || (initialNote?.examFocus as LearningPurpose) || 'Exam Preparation'
  );
  const [customInstructions, setCustomInstructions] = useState('');

  // PDF Upload State
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfBase64, setPdfBase64] = useState<string | null>(null);
  const [pdfVerification, setPdfVerification] = useState<PdfVerificationResult | null>(null);
  const [isVerifyingPdf, setIsVerifyingPdf] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Generation & Output State
  const [generatedNotes, setGeneratedNotes] = useState<string>(initialNote?.content || '');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // Notes Action states
  const [isEditing, setIsEditing] = useState(false);
  const [editedNotes, setEditedNotes] = useState(initialNote?.content || '');
  const [copied, setCopied] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isShortening, setIsShortening] = useState(false);
  const [isExpanding, setIsExpanding] = useState(false);

  // Modals
  const [explainTopic, setExplainTopic] = useState('');
  const [isExplainOpen, setIsExplainOpen] = useState(false);
  const [isTranslateOpen, setIsTranslateOpen] = useState(false);
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [isFlashcardsOpen, setIsFlashcardsOpen] = useState(false);

  // When initialNote changes (e.g. reopened from saved library)
  useEffect(() => {
    if (initialNote) {
      setChapterName(initialNote.title);
      setGeneratedNotes(initialNote.content);
      setEditedNotes(initialNote.content);
      if (initialNote.studentClass) setStudentClass(initialNote.studentClass as StudentClass);
      if (initialNote.board) setBoard(initialNote.board as EducationBoard);
      if (initialNote.subject) setSubject(initialNote.subject as Subject);
      if (initialNote.language) setLanguage(initialNote.language);
      if (initialNote.level) setNotesLevel(initialNote.level);
      if (initialNote.learningPurpose) setLearningPurpose(initialNote.learningPurpose);
    }
  }, [initialNote]);

  const effectiveClass = studentClass === 'College / Other' && customGrade ? customGrade : studentClass;
  const effectiveSubject = subject === 'Custom' ? customSubject || 'General Subject' : subject;

  // Handle PDF file selection & server verification
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPdfError(null);
    setPdfVerification(null);

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setPdfError('Only valid PDF documents (.pdf) are accepted.');
      return;
    }

    if (file.size > 26 * 1024 * 1024) {
      setPdfError('File size exceeds 26MB. Please upload a single chapter or smaller document.');
      return;
    }

    if (file.size === 0) {
      setPdfError('The uploaded file is empty (0 bytes).');
      return;
    }

    setIsVerifyingPdf(true);
    setPdfFile(file);

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const resultString = reader.result as string;
        const base64Data = resultString.split(',')[1];
        setPdfBase64(base64Data);

        try {
          const res = await fetch('/api/verify-pdf', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              base64Data,
              fileName: file.name,
              fileSize: file.size,
            }),
          });

          const data = await res.json();
          if (!res.ok) {
            setPdfError(data.error || 'Invalid or corrupted PDF file.');
            setPdfBase64(null);
          } else {
            setPdfVerification(data);
            if (!chapterName) {
              const cleanedName = file.name.replace(/\.pdf$/i, '').replace(/[-_]/g, ' ');
              setChapterName(cleanedName);
            }
          }
        } catch (fetchErr: any) {
          setPdfError('Failed to verify document: ' + fetchErr.message);
        } finally {
          setIsVerifyingPdf(false);
        }
      };

      reader.onerror = () => {
        setPdfError('Failed to read file from disk.');
        setIsVerifyingPdf(false);
      };

      reader.readAsDataURL(file);
    } catch (err: any) {
      setPdfError('File processing error: ' + err.message);
      setIsVerifyingPdf(false);
    }
  };

  const handleRemovePdf = () => {
    setPdfFile(null);
    setPdfBase64(null);
    setPdfVerification(null);
    setPdfError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Main Generator Function
  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!chapterName.trim() && !pdfBase64) {
      setError('Please provide either a Chapter name/number OR upload a chapter PDF document.');
      return;
    }

    setError(null);
    setIsGenerating(true);
    setGenerationStep('Analyzing chapter syllabus & identifying learning objectives...');

    try {
      if (pdfBase64) {
        setGenerationStep('Reading multi-page document structure, formulas, and diagrams...');
      }

      const res = await fetch('/api/generate-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentClass: effectiveClass,
          board,
          subject: effectiveSubject,
          chapterName: chapterName.trim(),
          language,
          level: notesLevel,
          learningPurpose,
          customInstructions: customInstructions.trim(),
          pdfBase64,
          pdfFileName: pdfFile?.name,
        }),
      });

      setGenerationStep('Synthesizing 12-section notes, comparison tables & exam Q&As...');

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Server failed to generate notes.');
      }

      setGeneratedNotes(data.notes);
      setEditedNotes(data.notes);
      setIsEditing(false);

      setTimeout(() => {
        const notesElement = document.getElementById('generated-notes-section');
        if (notesElement) {
          notesElement.scrollIntoView({ behavior: 'smooth' });
        }
      }, 150);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to generate notes. Please verify connection and try again.');
    } finally {
      setIsGenerating(false);
      setGenerationStep('');
    }
  };

  const handleCopyNotes = () => {
    const textToCopy = isEditing ? editedNotes : generatedNotes;
    if (textToCopy) {
      navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadPdf = () => {
    const text = isEditing ? editedNotes : generatedNotes;
    downloadNotesAsPdf(
      `${effectiveSubject} - ${chapterName || 'Smart Notes'}`,
      text,
      {
        chapterName: chapterName || pdfFile?.name || 'Academic Notes',
        studentClass: effectiveClass,
        board,
        subject: effectiveSubject,
        language,
        length: notesLevel,
        examFocus: learningPurpose,
        generatedAt: new Date().toISOString(),
      }
    );
  };

  const handlePrint = () => {
    window.print();
  };

  // Action: Make Shorter
  const handleMakeShorter = async () => {
    if (!generatedNotes) return;
    setIsShortening(true);

    try {
      const res = await fetch('/api/notes-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'make_shorter',
          notesText: isEditing ? editedNotes : generatedNotes,
          subject: effectiveSubject,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to compress notes.');
      }

      setGeneratedNotes(data.result);
      setEditedNotes(data.result);
      setNotesLevel('Quick Revision');
    } catch (err: any) {
      alert('Error shortening notes: ' + err.message);
    } finally {
      setIsShortening(false);
    }
  };

  // Action: Make Detailed
  const handleMakeDetailed = async () => {
    if (!generatedNotes) return;
    setIsExpanding(true);

    try {
      const res = await fetch('/api/notes-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'make_detailed',
          notesText: isEditing ? editedNotes : generatedNotes,
          subject: effectiveSubject,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to expand notes.');
      }

      setGeneratedNotes(data.result);
      setEditedNotes(data.result);
      setNotesLevel('Complete Chapter Notes');
    } catch (err: any) {
      alert('Error expanding notes: ' + err.message);
    } finally {
      setIsExpanding(false);
    }
  };

  // Action: Save Note
  const handleSaveToLibrary = () => {
    const noteContent = isEditing ? editedNotes : generatedNotes;
    if (!noteContent) return;

    onSaveNote({
      title: chapterName.trim() || `${effectiveSubject} Chapter Notes`,
      content: noteContent,
      studentClass: effectiveClass,
      board,
      subject: effectiveSubject,
      language,
      level: notesLevel,
      learningPurpose,
      hadPdf: Boolean(pdfBase64),
      pdfFileName: pdfFile?.name,
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60">
              AI Notes Studio
            </span>
            <span className="text-xs text-slate-500">• 12-Section Exam Engine</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white mt-1.5 tracking-tight">
            Make Notes Studio
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Generate exam-ready structured notes from curriculum topics or uploaded chapter PDFs in English, Hindi, or Hinglish.
          </p>
        </div>

        {generatedNotes && (
          <div className="flex items-center gap-2 self-start md:self-auto">
            <button
              type="button"
              onClick={handleDownloadPdf}
              className="px-4 py-2.5 text-sm font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-xs flex items-center gap-2 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Download PDF</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Guided Form Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <form onSubmit={handleGenerate} className="p-6 md:p-8 space-y-6">
          {/* Row 1: Class, Board, Subject */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Class */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                1. Class or Grade
              </label>
              <select
                value={studentClass}
                onChange={(e) => setStudentClass(e.target.value as StudentClass)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              >
                <option value="Class 6">Class 6 (Grade 6)</option>
                <option value="Class 7">Class 7 (Grade 7)</option>
                <option value="Class 8">Class 8 (Grade 8)</option>
                <option value="Class 9">Class 9 (Grade 9)</option>
                <option value="Class 10">Class 10 (Board Exam)</option>
                <option value="Class 11">Class 11 (Senior Secondary)</option>
                <option value="Class 12">Class 12 (Board Exam)</option>
                <option value="College / Other">Custom Grade / College</option>
              </select>
            </div>

            {/* Board */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                2. Education Board
              </label>
              <select
                value={board}
                onChange={(e) => setBoard(e.target.value as EducationBoard)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              >
                <option value="CBSE">CBSE (NCERT)</option>
                <option value="ICSE">ICSE / ISC</option>
                <option value="State Board">State Board</option>
                <option value="Other">Other / International</option>
              </select>
            </div>

            {/* Subject */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                3. Subject
              </label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value as Subject)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              >
                <option value="Science">Science (General)</option>
                <option value="Mathematics">Mathematics</option>
                <option value="Physics">Physics</option>
                <option value="Chemistry">Chemistry</option>
                <option value="Biology">Biology</option>
                <option value="Social Science">Social Science (SST)</option>
                <option value="History">History</option>
                <option value="Geography">Geography</option>
                <option value="Civics">Civics / Political Science</option>
                <option value="English">English</option>
                <option value="Hindi">Hindi</option>
                <option value="Computer Science">Computer Science / IT</option>
                <option value="Custom">Custom Subject...</option>
              </select>
            </div>
          </div>

          {/* Optional custom inputs */}
          {studentClass === 'College / Other' && (
            <div className="space-y-1.5 animate-in fade-in">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Specify Custom Grade / Course
              </label>
              <input
                type="text"
                value={customGrade}
                onChange={(e) => setCustomGrade(e.target.value)}
                placeholder="e.g. B.Sc Physics 1st Year, Diploma Engineering, JEE Prep..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>
          )}

          {subject === 'Custom' && (
            <div className="space-y-1.5 animate-in fade-in">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Specify Custom Subject
              </label>
              <input
                type="text"
                value={customSubject}
                onChange={(e) => setCustomSubject(e.target.value)}
                placeholder="e.g. Economics, Accountancy, Environmental Studies..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>
          )}

          {/* Row 2: Chapter Name / Number */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              4. Chapter Name or Chapter Number
            </label>
            <input
              type="text"
              value={chapterName}
              onChange={(e) => setChapterName(e.target.value)}
              placeholder="e.g. Chapter 10: Light - Reflection and Refraction, or Quadratic Equations, or French Revolution..."
              className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden transition-all"
            />
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Students can generate notes either by typing chapter details OR by uploading a chapter PDF. Neither is mandatory over the other.
            </p>
          </div>

          {/* Row 3: PDF Processing Card */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-blue-600" />
                <span>5. Optional Chapter PDF Upload</span>
              </label>
              <span className="text-[11px] text-slate-500">Supports text &amp; scanned book chapters up to 26MB</span>
            </div>

            {!pdfFile ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-400 rounded-2xl p-6 text-center cursor-pointer transition-colors bg-slate-50/50 dark:bg-slate-850 hover:bg-blue-50/20 dark:hover:bg-blue-950/20 group"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="application/pdf,.pdf"
                  className="hidden"
                />
                <div className="w-12 h-12 mx-auto rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/60 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:scale-105 transition-transform">
                  <Upload className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-2.5">
                  Click to upload chapter PDF or drag &amp; drop
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
                  Gemini multimodal vision reads diagrams, formulas, tables, and handwritten/scanned textbook pages.
                </p>
              </div>
            ) : (
              <div className="p-4 rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/30 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-blue-600 text-white shrink-0 mt-0.5">
                    <FileCheck2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-sm text-slate-900 dark:text-white">
                        {pdfFile.name}
                      </h4>
                      <span className="text-xs text-slate-500 font-mono">
                        ({(pdfFile.size / (1024 * 1024)).toFixed(2)} MB)
                      </span>
                    </div>

                    {isVerifyingPdf && (
                      <p className="text-xs text-blue-600 dark:text-blue-400 flex items-center gap-1.5 mt-1">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Inspecting PDF structure, font streams &amp; OCR layers...</span>
                      </p>
                    )}

                    {!isVerifyingPdf && pdfVerification && (
                      <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs text-slate-600 dark:text-slate-300">
                        <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-medium">
                          ✓ Verified Document ({pdfVerification.estimatedPages} estimated pages)
                        </span>
                        {pdfVerification.isLikelyScanned && (
                          <span className="px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 font-medium">
                            Scanned Document (Multimodal Vision OCR Active)
                          </span>
                        )}
                        <span className="text-slate-500 text-[11px]">{pdfVerification.infoNote}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
                  >
                    Replace
                  </button>
                  <button
                    type="button"
                    onClick={handleRemovePdf}
                    className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                    title="Remove PDF"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="application/pdf,.pdf"
                    className="hidden"
                  />
                </div>
              </div>
            )}

            {pdfError && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{pdfError}</span>
              </div>
            )}
          </div>

          {/* Row 4: Language, Notes Level (3 Quality Levels), Learning Purpose */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
            {/* Notes Language */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                6. Notes Language
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as StudyLanguage)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              >
                <option value="English">English</option>
                <option value="Hindi">हिन्दी (Hindi)</option>
                <option value="Hinglish">Hinglish (Easy Indian Student Style)</option>
              </select>
            </div>

            {/* Notes Quality Level */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                7. Notes Level
              </label>
              <select
                value={notesLevel}
                onChange={(e) => setNotesLevel(e.target.value as NotesLevel)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              >
                <option value="Quick Revision">Quick Revision (Concise &amp; High-Yield)</option>
                <option value="Standard Study Notes">Standard Study Notes (Balanced Concepts)</option>
                <option value="Complete Chapter Notes">Complete Chapter Notes (Deep &amp; Exhaustive)</option>
              </select>
            </div>

            {/* Learning Purpose */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                8. Learning Purpose
              </label>
              <select
                value={learningPurpose}
                onChange={(e) => setLearningPurpose(e.target.value as LearningPurpose)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              >
                <option value="Exam Preparation">Exam Preparation (High-Yield Focus)</option>
                <option value="Understand Concepts">Understand Concepts (Analogies &amp; Visuals)</option>
                <option value="School Homework">School Homework (Standard Definitions &amp; Solved Steps)</option>
                <option value="Last-Minute Revision">Last-Minute Revision (Formulas &amp; Traps)</option>
              </select>
            </div>
          </div>

          {/* Optional custom instructions */}
          <div className="space-y-1.5 pt-1">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center justify-between">
              <span>9. Optional Custom Focus / Teacher Tips</span>
              <span className="text-[11px] text-slate-400 font-normal">e.g. Emphasize differences, include mnemonics, or solve 2 numericals</span>
            </label>
            <input
              type="text"
              value={customInstructions}
              onChange={(e) => setCustomInstructions(e.target.value)}
              placeholder="e.g. Include mnemonics for periodic table trends, emphasize sign conventions for mirror formula..."
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
          </div>

          {/* Live Configuration Preview Card */}
          <div className="p-4 rounded-xl bg-slate-50/80 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <span className="font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider text-[10px]">
                Active Generation Preset
              </span>
              <div className="flex flex-wrap items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
                <span className="px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300">
                  {effectiveClass} • {board}
                </span>
                <span>•</span>
                <span className="font-semibold text-slate-900 dark:text-white">{effectiveSubject}</span>
                <span>•</span>
                <span>{chapterName || (pdfFile ? pdfFile.name : 'Target Chapter')}</span>
                <span>•</span>
                <span className="text-amber-600 dark:text-amber-400 font-semibold">{notesLevel}</span>
                <span>•</span>
                <span className="text-indigo-600 dark:text-indigo-400 font-semibold">{learningPurpose}</span>
                <span>•</span>
                <span>Lang: {language}</span>
              </div>
            </div>
            {pdfFile && (
              <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[11px] font-semibold shrink-0">
                PDF Attached
              </span>
            )}
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Unable to generate notes</p>
                <p className="text-xs opacity-90 mt-0.5">{error}</p>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isGenerating || isVerifyingPdf}
              className="w-full py-4 px-6 rounded-2xl font-bold text-base bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:via-indigo-700 hover:to-blue-800 text-white shadow-lg shadow-blue-500/25 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-3 transition-all transform active:scale-[0.99]"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>{generationStep || 'Building Educational Notes...'}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 text-amber-300" />
                  <span>
                    Generate {notesLevel} for {effectiveSubject} ({language})
                  </span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Generated Notes Workspace */}
      {generatedNotes && (
        <div id="generated-notes-section" className="space-y-4 animate-in fade-in duration-300">
          {/* Action Toolbar */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                Notes Workspace • {effectiveSubject} ({notesLevel})
              </h3>
            </div>

            {/* Complete Functional Actions */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Copy */}
              <button
                type="button"
                onClick={handleCopyNotes}
                className="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition-colors"
                title="Copy all notes"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>

              {/* Download PDF */}
              <button
                type="button"
                onClick={handleDownloadPdf}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 flex items-center gap-1.5 transition-colors"
                title="Download formatted PDF"
              >
                <Download className="w-3.5 h-3.5" />
                <span>PDF Download</span>
              </button>

              {/* Print */}
              <button
                type="button"
                onClick={handlePrint}
                className="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition-colors"
                title="Print formatted notes"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print</span>
              </button>

              {/* Make Shorter */}
              <button
                type="button"
                onClick={handleMakeShorter}
                disabled={isShortening}
                className="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition-colors"
                title="Compress to ultra-short cheat sheet"
              >
                {isShortening ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
                ) : (
                  <Scissors className="w-3.5 h-3.5 text-amber-500" />
                )}
                <span>Make Shorter</span>
              </button>

              {/* Make Detailed */}
              <button
                type="button"
                onClick={handleMakeDetailed}
                disabled={isExpanding}
                className="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition-colors"
                title="Expand notes with in-depth mechanisms and proofs"
              >
                {isExpanding ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
                ) : (
                  <Maximize2 className="w-3.5 h-3.5 text-indigo-500" />
                )}
                <span>Make Detailed</span>
              </button>

              {/* Explain difficult point */}
              <button
                type="button"
                onClick={() => {
                  setExplainTopic('');
                  setIsExplainOpen(true);
                }}
                className="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition-colors"
                title="Explain any tricky concept with simple analogies"
              >
                <HelpCircle className="w-3.5 h-3.5 text-indigo-500" />
                <span>Explain Point</span>
              </button>

              {/* Translate */}
              <button
                type="button"
                onClick={() => setIsTranslateOpen(true)}
                className="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition-colors"
                title="Translate into another supported language"
              >
                <Languages className="w-3.5 h-3.5 text-cyan-500" />
                <span>Translate</span>
              </button>

              {/* Flashcards Action */}
              <button
                type="button"
                onClick={() => setIsFlashcardsOpen(true)}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 flex items-center gap-1.5 transition-colors"
                title="Generate active recall flashcards"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Flashcards</span>
              </button>

              {/* Quiz Action */}
              <button
                type="button"
                onClick={() => setIsQuizOpen(true)}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 hover:bg-amber-100 dark:hover:bg-amber-900/60 flex items-center gap-1.5 transition-colors"
                title="Generate 5-question test from these notes"
              >
                <Award className="w-3.5 h-3.5" />
                <span>Quiz</span>
              </button>

              {/* Ask AI Follow-up about notes */}
              {onAskAiAboutNotes && (
                <button
                  type="button"
                  onClick={() =>
                    onAskAiAboutNotes(
                      chapterName || effectiveSubject,
                      isEditing ? editedNotes : generatedNotes
                    )
                  }
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 flex items-center gap-1.5 transition-colors"
                  title="Ask AI follow-up doubt directly about these notes"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Ask AI Follow-up</span>
                </button>
              )}

              {/* Edit Notes toggle */}
              <button
                type="button"
                onClick={() => {
                  if (isEditing) {
                    setGeneratedNotes(editedNotes);
                  }
                  setIsEditing(!isEditing);
                }}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg border flex items-center gap-1.5 transition-colors ${
                  isEditing
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                    : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
                title="Edit notes before downloading"
              >
                {isEditing ? <Eye className="w-3.5 h-3.5" /> : <Edit3 className="w-3.5 h-3.5" />}
                <span>{isEditing ? 'Done Editing' : 'Edit Notes'}</span>
              </button>

              {/* Save for later */}
              <button
                type="button"
                onClick={handleSaveToLibrary}
                className="px-3 py-1.5 text-xs font-medium rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 transition-colors shadow-2xs"
                title="Save notes to your browser library"
              >
                {savedSuccess ? <Check className="w-3.5 h-3.5" /> : <BookmarkPlus className="w-3.5 h-3.5" />}
                <span>{savedSuccess ? 'Saved!' : 'Save Notes'}</span>
              </button>

              {/* Regenerate */}
              <button
                type="button"
                onClick={() => handleGenerate()}
                disabled={isGenerating}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"
                title="Regenerate notes"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Printable Document Layout Card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 md:p-10 printable-notes">
            {/* Header banner */}
            <div className="pb-6 border-b border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300">
                  {effectiveClass} • {board}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300">
                  {effectiveSubject}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300">
                  Level: {notesLevel}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300">
                  Purpose: {learningPurpose}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  Lang: {language}
                </span>
                {pdfFile && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300">
                    Source: {pdfFile.name}
                  </span>
                )}
              </div>
              <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white">
                {chapterName || `${effectiveSubject} Revision Notes`}
              </h2>
            </div>

            {/* Notes body: Editable textarea OR formatted Markdown view */}
            {isEditing ? (
              <div className="pt-6 space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Editing in Markdown format. You can add personal teacher tips, formulas, or homework cues.</span>
                  <button
                    type="button"
                    onClick={() => {
                      setGeneratedNotes(editedNotes);
                      setIsEditing(false);
                    }}
                    className="px-3 py-1 rounded bg-blue-600 text-white font-medium hover:bg-blue-700"
                  >
                    Save &amp; Preview
                  </button>
                </div>
                <textarea
                  value={editedNotes}
                  onChange={(e) => setEditedNotes(e.target.value)}
                  rows={25}
                  className="w-full p-4 font-mono text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-850 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:outline-hidden leading-relaxed"
                />
              </div>
            ) : (
              <div className="pt-6">
                <MarkdownRenderer
                  content={generatedNotes}
                  showTableOfContents={true}
                  onExplainPoint={(point) => {
                    setExplainTopic(point);
                    setIsExplainOpen(true);
                  }}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modals */}
      <ExplainModal
        isOpen={isExplainOpen}
        initialTopic={explainTopic}
        notesContext={isEditing ? editedNotes : generatedNotes}
        onClose={() => setIsExplainOpen(false)}
      />

      <TranslateModal
        isOpen={isTranslateOpen}
        currentLanguage={language}
        notesText={isEditing ? editedNotes : generatedNotes}
        onTranslated={(translated, newLang) => {
          setGeneratedNotes(translated);
          setEditedNotes(translated);
          setLanguage(newLang);
        }}
        onClose={() => setIsTranslateOpen(false)}
      />

      <QuizModal
        isOpen={isQuizOpen}
        chapterTitle={chapterName || effectiveSubject}
        notesText={isEditing ? editedNotes : generatedNotes}
        onClose={() => setIsQuizOpen(false)}
      />

      <FlashcardsModal
        isOpen={isFlashcardsOpen}
        chapterTitle={chapterName || effectiveSubject}
        notesText={isEditing ? editedNotes : generatedNotes}
        onClose={() => setIsFlashcardsOpen(false)}
      />
    </div>
  );
};
