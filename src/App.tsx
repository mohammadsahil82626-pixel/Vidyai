/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Menu,
  SquarePen,
  GraduationCap,
  Sparkles,
  Sun,
  Moon,
  ChevronDown,
  Cpu,
  CheckCircle2,
} from 'lucide-react';
import {
  Conversation,
  EducationBoard,
  SavedNote,
  StudyLanguage,
  ChatMessage,
} from './types';
import { SideDrawer, AppTab } from './components/SideDrawer';
import { ChatBot } from './components/ChatBot';
import { SmartNotesGenerator } from './components/SmartNotesGenerator';
import { SavedNotesView } from './components/SavedNotesView';
import { LibraryView } from './components/LibraryView';
import { QuizArena } from './components/QuizArena';
import { SettingsView } from './components/SettingsView';
import { HelpAboutView } from './components/HelpAboutView';
import { CosmicBackground } from './components/CosmicBackground';

// Pre-seeded sample notes showcasing the complete 12-section architecture
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

const INITIAL_CONVERSATION: Conversation = {
  id: 'conv-initial-1',
  title: 'Welcome to VidyaAI',
  messages: [
    {
      id: 'welcome-msg',
      role: 'assistant',
      content:
        'Namaste & Hello! I am **VidyaAI**, your smart academic companion powered by Google Gemini 3.8 Flash.\n\nI can help you understand tough topics in **English**, **हिन्दी (Hindi)**, or **Hinglish**, solve homework doubts step-by-step, or generate comprehensive **12-Section Smart Notes** from your syllabus or uploaded chapter PDFs.\n\nWhat would you like to study or revise today?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export default function App() {
  const [activeTab, setActiveTab] = useState<AppTab>('chat');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);

  // Theme state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const savedTheme = localStorage.getItem('vidyaai_theme');
    if (savedTheme) return savedTheme === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Conversations state (multi-turn chat persistence)
  const [conversations, setConversations] = useState<Conversation[]>(() => {
    try {
      const stored = localStorage.getItem('vidyaai_conversations');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to parse conversations from localStorage', e);
    }
    return [INITIAL_CONVERSATION];
  });

  const [activeConversationId, setActiveConversationId] = useState<string>(() => {
    return conversations[0]?.id || 'conv-initial-1';
  });

  // Saved Notes state
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

  // Pre-load note context
  const [activeNoteForGenerator, setActiveNoteForGenerator] = useState<SavedNote | null>(null);
  const [activeNoteContextForChat, setActiveNoteContextForChat] = useState<{
    title: string;
    content: string;
  } | null>(null);

  // User preferences
  const [studyLanguage, setStudyLanguage] = useState<StudyLanguage>('English');
  const [defaultBoard, setDefaultBoard] = useState<EducationBoard>('CBSE');

  // Sync theme
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('vidyaai_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('vidyaai_theme', 'light');
    }
  }, [isDarkMode]);

  // Sync notes
  useEffect(() => {
    try {
      localStorage.setItem('vidyaai_saved_notes', JSON.stringify(savedNotes));
    } catch (e) {
      console.warn('Failed to write saved notes to localStorage', e);
    }
  }, [savedNotes]);

  // Sync conversations
  useEffect(() => {
    try {
      localStorage.setItem('vidyaai_conversations', JSON.stringify(conversations));
    } catch (e) {
      console.warn('Failed to write conversations to localStorage', e);
    }
  }, [conversations]);

  // Active conversation object
  const activeConversation =
    conversations.find((c) => c.id === activeConversationId) ||
    conversations[0] ||
    INITIAL_CONVERSATION;

  // Update messages in the currently active conversation
  const handleUpdateMessages = (updater: (prev: ChatMessage[]) => ChatMessage[]) => {
    setConversations((prevConvs) => {
      return prevConvs.map((conv) => {
        if (conv.id === activeConversation.id) {
          const updatedMessages = updater(conv.messages);

          // Auto-generate title from first user query if still default
          let title = conv.title;
          if (title === 'Welcome to VidyaAI' || title === 'New Conversation' || !title) {
            const firstUserMsg = updatedMessages.find((m) => m.role === 'user');
            if (firstUserMsg && firstUserMsg.content) {
              title = firstUserMsg.content.slice(0, 36).trim();
              if (firstUserMsg.content.length > 36) title += '...';
            }
          }

          return {
            ...conv,
            title,
            messages: updatedMessages,
            updatedAt: new Date().toISOString(),
          };
        }
        return conv;
      });
    });
  };

  // Start a fresh conversation
  const handleNewChat = () => {
    const newConvId = `conv-${Date.now()}`;
    const newConv: Conversation = {
      id: newConvId,
      title: 'New Conversation',
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setConversations((prev) => [newConv, ...prev]);
    setActiveConversationId(newConvId);
    setActiveTab('chat');
    setIsDrawerOpen(false);
  };

  // Delete conversation
  const handleDeleteConversation = (id: string) => {
    setConversations((prev) => {
      const remaining = prev.filter((c) => c.id !== id);
      if (remaining.length === 0) {
        const fresh: Conversation = {
          id: `conv-${Date.now()}`,
          title: 'New Conversation',
          messages: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setActiveConversationId(fresh.id);
        return [fresh];
      }
      if (activeConversationId === id) {
        setActiveConversationId(remaining[0].id);
      }
      return remaining;
    });
  };

  // Save generated note
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
    const dataStr =
      'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(savedNotes, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute(
      'download',
      `VidyaAI_Saved_Notes_${new Date().toISOString().slice(0, 10)}.json`
    );
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
    <div className="h-[100dvh] w-screen overflow-hidden bg-slate-50 dark:bg-[#050816] text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-300 relative">
      {/* Animated Cosmic Background (Aurora waves, glowing nebula, and stardust) */}
      <CosmicBackground isDarkMode={isDarkMode} />

      {/* Side Drawer Component */}
      <SideDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          setIsDrawerOpen(false);
        }}
        conversations={conversations}
        activeConversationId={activeConversationId}
        onSelectConversation={(id) => {
          setActiveConversationId(id);
          setActiveTab('chat');
        }}
        onNewChat={handleNewChat}
        onDeleteConversation={handleDeleteConversation}
        savedNotesCount={savedNotes.length}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
      />

      {/* Top App Bar — Minimal, Futuristic, Translucent Glass */}
      <header className="h-16 shrink-0 px-3 md:px-6 border-b border-slate-200/70 dark:border-blue-500/15 bg-white/70 dark:bg-[#050816]/68 backdrop-blur-2xl flex items-center justify-between z-30 select-none shadow-[0_1px_0_rgba(255,255,255,0.08)]">
        {/* Top-Left: Hamburger Menu Button */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsDrawerOpen(true)}
            className="p-2 -ml-1 rounded-xl text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-800/80 active:scale-95 transition-all"
            title="Open menu"
            aria-label="Open navigation drawer"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Brand Name & Logo */}
          <div
            onClick={() => setActiveTab('chat')}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-400 flex items-center justify-center text-white shadow-xs group-hover:shadow-blue-500/25 transition-all">
              <GraduationCap className="w-4 h-4" />
            </div>
            <div className="flex items-center tracking-tight font-extrabold text-base md:text-lg text-slate-900 dark:text-white">
              <span>Vidya</span>
              <span className="text-sky-400">AI</span>
            </div>
          </div>
        </div>

        {/* Center: Compact Model Selector Pill */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-slate-200/90 dark:border-blue-500/30 bg-slate-100/90 dark:bg-[#070b24]/90 hover:bg-slate-200/90 dark:hover:bg-[#0c143d] text-slate-700 dark:text-slate-200 text-xs font-semibold transition-all shadow-2xs"
            title="Active AI Model"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0 shadow-[0_0_8px_#34d399]" />
            <span className="font-medium text-xs">Flash</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {/* Model info dropdown modal */}
          {isModelDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsModelDropdownOpen(false)}
              />
              <div className="absolute top-10 left-1/2 -translate-x-1/2 z-50 w-72 p-4 rounded-2xl bg-white/95 dark:bg-[#0a0f2b]/95 backdrop-blur-xl border border-slate-200 dark:border-blue-500/30 shadow-2xl text-xs space-y-2.5 animate-in fade-in zoom-in-95">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/80 text-blue-500">
                    <Cpu className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">Google Gemini 3.8 Flash</h4>
                    <p className="text-[10px] text-slate-400">Fast reasoning &amp; Multimodal PDF</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1.5 text-slate-600 dark:text-slate-400 text-[11px]">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>Multilingual (English, Hindi, Hinglish)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>In-memory PDF Chapter Analysis</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>12-Section CBSE &amp; ICSE Pedagogical Output</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Top-Right: Theme Toggle & New Chat Icon */}
        <div className="flex items-center gap-1 md:gap-2">
          {/* Theme Toggle */}
          <button
            type="button"
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 transition-colors"
            title={isDarkMode ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-500" />}
          </button>

          {/* New Chat Button (Square with pencil) */}
          <button
            type="button"
            onClick={handleNewChat}
            className="p-2 rounded-xl text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 active:scale-95 transition-all"
            title="Start New Chat"
            aria-label="Start new chat"
          >
            <SquarePen className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Content Area — Clean, Immersive (No Bottom Navigation) */}
      <main className="flex-1 overflow-hidden relative flex flex-col w-full h-[calc(100dvh-4rem)]">
        {/* Chat Tab: Takes full height with fixed bottom composer */}
        {activeTab === 'chat' && (
          <div className="flex-1 h-full w-full overflow-hidden flex flex-col">
            <ChatBot
              messages={activeConversation.messages}
              onUpdateMessages={handleUpdateMessages}
              activeNoteContext={activeNoteContextForChat}
              onClearNoteContext={() => setActiveNoteContextForChat(null)}
              language={studyLanguage}
              onSetLanguage={setStudyLanguage}
              onOpenNotesGeneratorWithTopic={(topic, pdfBase64, pdfName) => {
                setActiveNoteForGenerator({
                  id: 'draft',
                  title: topic,
                  content: '',
                  studentClass: 'Class 10',
                  board: defaultBoard,
                  subject: 'Science',
                  language: studyLanguage,
                  level: 'Standard Study Notes',
                  learningPurpose: 'Exam Preparation',
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                  hadPdf: Boolean(pdfBase64),
                  pdfFileName: pdfName,
                });
                setActiveTab('notes');
              }}
            />
          </div>
        )}

        {/* Other Tabs: Scrollable Content Container */}
        {activeTab !== 'chat' && (
          <div className="flex-1 overflow-y-auto p-4 md:p-8 max-w-7xl mx-auto w-full">
            {activeTab === 'notes' && (
              <SmartNotesGenerator
                onSaveNote={handleSaveNote}
                initialNote={activeNoteForGenerator}
                onAskAiAboutNotes={handleAskAiAboutNotes}
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

            {activeTab === 'library' && (
              <LibraryView
                notes={savedNotes}
                onOpenNote={handleOpenNoteInGenerator}
                onOpenNotesGenerator={() => setActiveTab('notes')}
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
                defaultLanguage={studyLanguage}
                onSetDefaultLanguage={setStudyLanguage}
                defaultBoard={defaultBoard}
                onSetDefaultBoard={setDefaultBoard}
              />
            )}

            {activeTab === 'help' && (
              <HelpAboutView
                onOpenMakeNotes={() => setActiveTab('notes')}
                onOpenChat={() => setActiveTab('chat')}
                onOpenQuiz={() => setActiveTab('quiz')}
              />
            )}
          </div>
        )}
      </main>
    </div>
  );
}
