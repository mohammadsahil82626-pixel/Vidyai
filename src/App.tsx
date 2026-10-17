/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  FileText,
  Bookmark,
  Award,
  Settings as SettingsIcon,
  Sun,
  Moon,
  Sparkles,
  GraduationCap,
  Menu,
  X,
  BookOpen,
  ArrowRight,
  Shield,
  CheckCircle,
} from 'lucide-react';
import { EducationBoard, SavedNote, StudyLanguage } from './types';
import { ChatBot } from './components/ChatBot';
import { SmartNotesGenerator } from './components/SmartNotesGenerator';
import { SavedNotesView } from './components/SavedNotesView';
import { QuizArena } from './components/QuizArena';
import { SettingsView } from './components/SettingsView';

// Pre-seeded high-quality initial notes showcasing the complete 12-section architecture
const INITIAL_SAMPLE_NOTES: SavedNote[] = [
  {
    id: 'sample-light-1',
    title: 'Light - Reflection and Refraction',
    studentClass: 'Class 10',
    board: 'CBSE',
    subject: 'Physics',
    language: 'Hinglish',
    level: 'Standard Study Notes',
    learningPurpose: 'Exam Preparation',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    content: `## 1. Chapter Title, Class & Subject
**Class:** 10th CBSE | **Subject:** Science (Physics) | **Chapter:** Light – Reflection & Refraction | **Language:** Hinglish

## 2. Learning Objectives
- Spherical mirrors (Concave aur Convex) ke image formation rules aur ray diagrams master karna.
- Mirror formula aur Lens formula me sign convention ($u, v, f$) ki accurate calculation sikhna.
- Refraction ke laws aur Snell's law ka conceptual reason samajhna.
- Lens power ($P = 1/f$) aur numerical calculations me full marks score karna.

## 3. Chapter Overview
Light ek electromagnetic radiation hai jo human eye me vision produce karti hai. Is chapter me hum do core phenomena study karte hain: Reflection (light ka mirror se bounce back hona) aur Refraction (light ka ek medium se doosre me enter karne par bend hona). Board exams me mirror formula, lens formula, and sign convention se numericals aur ray diagrams guaranteed aate hain.

## 4. Topic-wise Explanations
### Laws of Reflection
1. **First Law:** Incident ray, normal at point of incidence, and reflected ray all lie in the same plane.
2. **Second Law:** Angle of incidence equals angle of reflection ($\\angle i = \\angle r$).

### Refraction & Snell's Law
Jab light ray ek optical medium se doosre optical medium me travel karti hai, toh speed change hone ki wajah se ray bend ho jaati hai:
- **Rarer to Denser (e.g. Air to Glass):** Ray normal ki taraf bend hoti hai (towards the normal).
- **Denser to Rarer (e.g. Glass to Air):** Ray normal se door bend hoti hai (away from normal).
- **Snell's Law:** $\\frac{\\sin i}{\\sin r} = \\text{constant} = n_{21}$ (Medium 2 ka refractive index medium 1 ke respect me).

## 5. Key Definitions & Terminology
- **Pole (P):** Spherical mirror ke reflecting surface ka geometric center.
- **Center of Curvature (C):** Us imaginary sphere ka center jiska spherical mirror ek part hota hai.
- **Focus (F):** Principal axis par vo point jahan parallel incident rays reflection ke baad meet karti hain (ya appear hoti hain).
- **Focal Length ($f$):** Pole ($P$) aur Focus ($F$) ke beech ki distance ($R = 2f$).
- **Dioptre (D):** Lens power ki SI unit. 1 Dioptre us lens ki power hai jiski focal length 1 meter ho.

## 6. Important Facts, Concepts & Examples
- **Shaving Mirrors & Headlights:** Concave mirror use karte hain because when object is placed between Pole and Focus, it produces an erect, highly magnified image.
- **Vehicle Rear-View Mirrors:** Convex mirror use karte hain because it always provides an erect, diminished image and gives a much wider field of view.
- **Speed of Light:** In vacuum $c = 3 \\times 10^8\\text{ m/s}$. In water $v \\approx 2.25 \\times 10^8\\text{ m/s}$.

## 7. Formulas, Units & Step-by-Step Examples
\`\`\`text
1. Mirror Formula: 1/f = 1/v + 1/u
2. Lens Formula:   1/f = 1/v - 1/u
3. Magnification (Mirror): m = -v/u = h'/h
4. Magnification (Lens):   m = +v/u = h'/h
5. Power of Lens:          P = 1/f(in meters) = 100/f(in cm)  [Unit: Dioptre (D)]
\`\`\`
*Step-by-Step Worked Example:*
- **Given:** Concave mirror, $f = -15\\text{ cm}$, object distance $u = -30\\text{ cm}$. Find image distance $v$.
- **Step 1:** Mirror formula: $1/v = 1/f - 1/u = 1/(-15) - 1/(-30) = -1/15 + 1/30 = -1/30$.
- **Step 2:** $v = -30\\text{ cm}$. Image is at $C$, real and inverted, same size ($m = -(-30)/(-30) = -1$).

## 8. Important Distinctions & Comparison Tables
| Feature | Concave Mirror | Convex Mirror |
| :--- | :--- | :--- |
| **Reflecting Surface** | Curved inwards | Curved outwards |
| **Focus Nature** | Real focus ($f < 0$) | Virtual focus ($f > 0$) |
| **Image Types** | Real & Inverted (mostly), Virtual & Magnified (when between P & F) | Always Virtual, Erect & Diminished |
| **Field of View** | Narrow | Very wide |

## 9. Common Misconceptions & Clarifications
- **Misconception:** "Optical density aur mass density same cheez hoti hai."
  *Reality:* Bilkul nahi! Example: Kerosene ki mass density water se kam hai (it floats), but optical density water se zyada hai (refractive index of kerosene = 1.44 > water = 1.33).
- **Misconception:** "Focal length mirror ko water me immerse karne par badal jaati hai."
  *Reality:* Mirror ki focal length medium par depend nahi karti ($f = R/2$). Lens ki focal length badal jaati hai!

## 10. Exam-Focused Key Points & Scoring Tips
- **Sign Convention Golden Rule:** $u$ (object distance) hamesha negative ($-$) lo! Concave mirror/lens ke liye $f$ hamesha negative ($-$), Convex mirror/lens ke liye $f$ hamesha positive ($+$).
- **Power Calculation Trap:** Formula $P = 1/f$ me $f$ hamesha meters me hona chahiye! Agar cm me diya hai, toh $P = 100/f(\\text{in cm})$ use karo.
- **Frequent 3-Mark Question:** Draw ray diagram for Concave Mirror when object is between Pole and Focus.

## 11. Important Questions with Accurate Answers
- **Q1: Why do stars twinkle while planets do not?**
  *Answer:* Stars are point-sized distant light sources. Atmospheric refraction causes their light to fluctuate continuously, causing twinkling. Planets are closer extended sources; fluctuations average out.
- **Q2: Ek concave lens ki focal length 20 cm hai. Lens ki power kya hogi?**
  *Answer:* Concave lens has negative focal length: $f = -20\\text{ cm} = -0.2\\text{ m}$. Power $P = 1/(-0.2) = -5.0\\text{ D}$.
- **Q3: State Snell's law of refraction.**
  *Answer:* The ratio of sine of angle of incidence to sine of angle of refraction is constant for a given pair of media: $\\sin i / \\sin r = n_{21}$.
- **Q4: What is the relation between focal length and radius of curvature?**
  *Answer:* $R = 2f$ or $f = R/2$.

## 12. Final Quick-Revision Sheet & Mind Map
- **Reflection:** Spherical Mirrors $\\rightarrow$ Concave (converging, $f < 0$) vs Convex (diverging, $f > 0$).
- **Refraction:** Bending of light $\\rightarrow$ Snell's Law $\\rightarrow$ Refractive index $n = c/v$.
- **Lenses:** Convex (converging, $f > 0$) vs Concave (diverging, $f < 0$).
- **Core Formulae:** Mirror ($1/f = 1/v + 1/u$, $m = -v/u$) vs Lens ($1/f = 1/v - 1/u$, $m = v/u$).`,
  },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<'notes' | 'chat' | 'saved' | 'quiz' | 'settings'>(
    'notes'
  );

  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const savedTheme = localStorage.getItem('vidyaai_theme');
    if (savedTheme) return savedTheme === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const [savedNotes, setSavedNotes] = useState<SavedNote[]>(() => {
    try {
      const stored = localStorage.getItem('vidyaai_saved_notes');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to parse saved notes from localStorage', e);
    }
    return INITIAL_SAMPLE_NOTES;
  });

  const [activeNoteForGenerator, setActiveNoteForGenerator] = useState<SavedNote | null>(null);
  const [activeNoteContextForChat, setActiveNoteContextForChat] = useState<{
    title: string;
    content: string;
  } | null>(null);

  const [defaultLanguage, setDefaultLanguage] = useState<StudyLanguage>('English');
  const [defaultBoard, setDefaultBoard] = useState<EducationBoard>('CBSE');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('vidyaai_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('vidyaai_theme', 'light');
    }
  }, [isDarkMode]);

  useEffect(() => {
    try {
      localStorage.setItem('vidyaai_saved_notes', JSON.stringify(savedNotes));
    } catch (e) {
      console.warn('Failed to write saved notes to localStorage', e);
    }
  }, [savedNotes]);

  const handleSaveNote = (newNoteData: Omit<SavedNote, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newNote: SavedNote = {
      ...newNoteData,
      id: `note-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setSavedNotes((prev) => [newNote, ...prev]);
  };

  const handleDeleteNote = (id: string) => {
    setSavedNotes((prev) => prev.filter((n) => n.id !== id));
  };

  const handleRenameNote = (id: string, newTitle: string) => {
    setSavedNotes((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, title: newTitle, updatedAt: new Date().toISOString() } : n
      )
    );
  };

  const handleClearAllNotes = () => {
    setSavedNotes([]);
  };

  const handleExportNotesJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(savedNotes, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `VidyaAI_Saved_Notes_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleOpenNoteInGenerator = (note: SavedNote) => {
    setActiveNoteForGenerator(note);
    setActiveTab('notes');
  };

  const handleAskAiAboutNotes = (title: string, content: string) => {
    setActiveNoteContextForChat({ title, content });
    setActiveTab('chat');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col md:flex-row transition-colors duration-200">
      {/* Desktop Sidebar Navigation */}
      <aside className="hidden md:flex flex-col w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0 h-screen sticky top-0 z-30 select-none">
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-lg tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
                  VidyaAI
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                  STUDIO
                </span>
              </div>
              <p className="text-[11px] text-slate-400">AI Student Smart Companion</p>
            </div>
          </div>
        </div>

        {/* Navigation items */}
        <nav className="p-3 space-y-1.5 flex-1">
          {/* Smart Notes Generator */}
          <button
            type="button"
            onClick={() => setActiveTab('notes')}
            className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'notes'
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
            }`}
          >
            <div className="flex items-center gap-3">
              <FileText className="w-4 h-4 shrink-0" />
              <span>Make Notes Studio</span>
            </div>
            <span
              className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                activeTab === 'notes'
                  ? 'bg-white/20 text-white'
                  : 'bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300'
              }`}
            >
              CORE
            </span>
          </button>

          {/* AI Chatbot */}
          <button
            type="button"
            onClick={() => setActiveTab('chat')}
            className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'chat'
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
            }`}
          >
            <MessageSquare className="w-4 h-4 shrink-0" />
            <span>AI Study Chat</span>
          </button>

          {/* Saved Notes */}
          <button
            type="button"
            onClick={() => setActiveTab('saved')}
            className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'saved'
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
            }`}
          >
            <div className="flex items-center gap-3">
              <Bookmark className="w-4 h-4 shrink-0" />
              <span>Saved Notes</span>
            </div>
            {savedNotes.length > 0 && (
              <span
                className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                  activeTab === 'saved'
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                {savedNotes.length}
              </span>
            )}
          </button>

          {/* Quiz Arena */}
          <button
            type="button"
            onClick={() => setActiveTab('quiz')}
            className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'quiz'
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
            }`}
          >
            <Award className="w-4 h-4 shrink-0" />
            <span>Quiz Arena</span>
          </button>

          {/* Settings */}
          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'settings'
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
            }`}
          >
            <SettingsIcon className="w-4 h-4 shrink-0" />
            <span>Settings &amp; Guide</span>
          </button>
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Dark Appearance</span>
            <button
              type="button"
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-500" />}
            </button>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
            <span>Gemini 3.8 Flash Active</span>
          </div>
        </div>
      </aside>

      {/* Mobile Top Navigation Bar */}
      <header className="md:hidden border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-40 p-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <span className="font-extrabold text-base tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
              VidyaAI
            </span>
            <span className="text-[10px] ml-1.5 px-1.5 py-0.2 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold">
              NOTES
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Menu Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-x-0 top-16 z-40 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-4 shadow-xl space-y-2 animate-in slide-in-from-top-2">
          <button
            type="button"
            onClick={() => {
              setActiveTab('notes');
              setIsMobileMenuOpen(false);
            }}
            className={`w-full flex items-center justify-between p-3 rounded-xl text-sm font-semibold ${
              activeTab === 'notes' ? 'bg-blue-600 text-white' : 'hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center gap-3">
              <FileText className="w-4 h-4" />
              <span>Make Notes Studio</span>
            </div>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
              CORE
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('chat');
              setIsMobileMenuOpen(false);
            }}
            className={`w-full flex items-center gap-3 p-3 rounded-xl text-sm font-semibold ${
              activeTab === 'chat' ? 'bg-blue-600 text-white' : 'hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>AI Study Chat</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('saved');
              setIsMobileMenuOpen(false);
            }}
            className={`w-full flex items-center justify-between p-3 rounded-xl text-sm font-semibold ${
              activeTab === 'saved' ? 'bg-blue-600 text-white' : 'hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center gap-3">
              <Bookmark className="w-4 h-4" />
              <span>Saved Notes</span>
            </div>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800">
              {savedNotes.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('quiz');
              setIsMobileMenuOpen(false);
            }}
            className={`w-full flex items-center gap-3 p-3 rounded-xl text-sm font-semibold ${
              activeTab === 'quiz' ? 'bg-blue-600 text-white' : 'hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Quiz Arena</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('settings');
              setIsMobileMenuOpen(false);
            }}
            className={`w-full flex items-center gap-3 p-3 rounded-xl text-sm font-semibold ${
              activeTab === 'settings' ? 'bg-blue-600 text-white' : 'hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <SettingsIcon className="w-4 h-4" />
            <span>Settings &amp; Guide</span>
          </button>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
        {activeTab === 'notes' && (
          <SmartNotesGenerator
            onSaveNote={handleSaveNote}
            initialNote={activeNoteForGenerator}
            onAskAiAboutNotes={handleAskAiAboutNotes}
          />
        )}

        {activeTab === 'chat' && (
          <ChatBot
            activeNoteContext={activeNoteContextForChat}
            onClearNoteContext={() => setActiveNoteContextForChat(null)}
            onOpenNotesGeneratorWithTopic={(topic) => {
              setActiveNoteForGenerator({
                id: 'draft',
                title: topic,
                content: '',
                studentClass: 'Class 10',
                board: 'CBSE',
                subject: 'Science',
                language: 'English',
                level: 'Standard Study Notes',
                learningPurpose: 'Exam Preparation',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              });
              setActiveTab('notes');
            }}
          />
        )}

        {activeTab === 'saved' && (
          <SavedNotesView
            notes={savedNotes}
            onOpenNote={handleOpenNoteInGenerator}
            onDeleteNote={handleDeleteNote}
            onRenameNote={handleRenameNote}
            onClearAllNotes={handleClearAllNotes}
            onExportNotesJson={handleExportNotesJson}
          />
        )}

        {activeTab === 'quiz' && (
          <QuizArena
            savedNotes={savedNotes}
            onOpenNotesGenerator={() => setActiveTab('notes')}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsView
            isDarkMode={isDarkMode}
            onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
            defaultLanguage={defaultLanguage}
            onSetDefaultLanguage={setDefaultLanguage}
            defaultBoard={defaultBoard}
            onSetDefaultBoard={setDefaultBoard}
          />
        )}
      </main>

      {/* Mobile Bottom Tab Navigation */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 flex justify-around p-2 z-40 text-xs">
        <button
          type="button"
          onClick={() => setActiveTab('notes')}
          className={`flex flex-col items-center py-1 px-2 rounded-lg ${
            activeTab === 'notes' ? 'text-blue-600 font-bold' : 'text-slate-500'
          }`}
        >
          <FileText className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Notes</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('chat')}
          className={`flex flex-col items-center py-1 px-2 rounded-lg ${
            activeTab === 'chat' ? 'text-blue-600 font-bold' : 'text-slate-500'
          }`}
        >
          <MessageSquare className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Chat</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('saved')}
          className={`flex flex-col items-center py-1 px-2 rounded-lg ${
            activeTab === 'saved' ? 'text-blue-600 font-bold' : 'text-slate-500'
          }`}
        >
          <Bookmark className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Saved ({savedNotes.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('quiz')}
          className={`flex flex-col items-center py-1 px-2 rounded-lg ${
            activeTab === 'quiz' ? 'text-blue-600 font-bold' : 'text-slate-500'
          }`}
        >
          <Award className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Quiz</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('settings')}
          className={`flex flex-col items-center py-1 px-2 rounded-lg ${
            activeTab === 'settings' ? 'text-blue-600 font-bold' : 'text-slate-500'
          }`}
        >
          <SettingsIcon className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Guide</span>
        </button>
      </nav>
    </div>
  );
}
