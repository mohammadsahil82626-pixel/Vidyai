import React, { useState, useEffect } from 'react';
import {
  X,
  SquarePen,
  MessageSquare,
  FileText,
  Bookmark,
  Layers,
  Award,
  Settings as SettingsIcon,
  HelpCircle,
  Search,
  Trash2,
  GraduationCap,
  Sun,
  Moon,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { Conversation, SavedNote } from '../types';

export type AppTab = 'chat' | 'notes' | 'saved' | 'library' | 'quiz' | 'settings' | 'help';

interface SideDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: AppTab;
  onSelectTab: (tab: AppTab) => void;
  conversations: Conversation[];
  activeConversationId: string;
  onSelectConversation: (id: string) => void;
  onNewChat: () => void;
  onDeleteConversation: (id: string) => void;
  savedNotesCount: number;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export const SideDrawer: React.FC<SideDrawerProps> = ({
  isOpen,
  onClose,
  activeTab,
  onSelectTab,
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewChat,
  onDeleteConversation,
  savedNotesCount,
  isDarkMode,
  onToggleDarkMode,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Close on Escape key or Android Back
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Support Android back button by listening to popstate
  useEffect(() => {
    if (isOpen) {
      window.history.pushState({ drawer: 'open' }, '');
      const handlePopState = () => {
        onClose();
      };
      window.addEventListener('popstate', handlePopState);
      return () => {
        window.removeEventListener('popstate', handlePopState);
      };
    }
  }, [isOpen, onClose]);

  const filteredConversations = conversations.filter((c) =>
    (c.title || 'Conversation').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleNavClick = (tab: AppTab) => {
    onSelectTab(tab);
    onClose();
  };

  const handleConversationClick = (id: string) => {
    onSelectConversation(id);
    onSelectTab('chat');
    onClose();
  };

  const handleNewChatClick = () => {
    onNewChat();
    onSelectTab('chat');
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden="true"
      />

      {/* Sliding Drawer */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 sm:w-80 bg-white dark:bg-[#070b22] border-r border-slate-200 dark:border-blue-500/20 shadow-2xl flex flex-col transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-xs">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white">
                  <span>Vidya</span>
                  <span className="text-sky-400">AI</span>
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                  STUDENT
                </span>
              </div>
              <p className="text-[11px] text-slate-400">AI Student Smart Agent</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Primary Action: New Chat Button */}
        <div className="p-3">
          <button
            type="button"
            onClick={handleNewChatClick}
            className="w-full py-2.5 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-500 bg-slate-50 dark:bg-slate-800/80 hover:bg-blue-50/50 dark:hover:bg-blue-950/30 text-slate-900 dark:text-white text-xs font-semibold flex items-center justify-between transition-all group shadow-2xs"
          >
            <div className="flex items-center gap-2.5">
              <SquarePen className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" />
              <span>New Chat</span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">Fresh</span>
          </button>
        </div>

        {/* Main Navigation Links */}
        <nav className="px-3 py-1 space-y-1">
          {/* Chat */}
          <button
            type="button"
            onClick={() => handleNavClick('chat')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-colors ${
              activeTab === 'chat'
                ? 'bg-blue-600 text-white font-semibold shadow-xs'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <MessageSquare className="w-4 h-4" />
              <span>AI Study Chat</span>
            </div>
          </button>

          {/* Make Notes */}
          <button
            type="button"
            onClick={() => handleNavClick('notes')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-colors ${
              activeTab === 'notes'
                ? 'bg-blue-600 text-white font-semibold shadow-xs'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <FileText className="w-4 h-4" />
              <span>Make Notes</span>
            </div>
            <span
              className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${
                activeTab === 'notes'
                  ? 'bg-white/20 text-white'
                  : 'bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300'
              }`}
            >
              CORE
            </span>
          </button>

          {/* My Notes */}
          <button
            type="button"
            onClick={() => handleNavClick('saved')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-colors ${
              activeTab === 'saved'
                ? 'bg-blue-600 text-white font-semibold shadow-xs'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Bookmark className="w-4 h-4" />
              <span>My Notes</span>
            </div>
            {savedNotesCount > 0 && (
              <span
                className={`text-[10px] font-semibold px-2 py-0.2 rounded-full ${
                  activeTab === 'saved'
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                {savedNotesCount}
              </span>
            )}
          </button>

          {/* Library or Saved Items */}
          <button
            type="button"
            onClick={() => handleNavClick('library')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-colors ${
              activeTab === 'library'
                ? 'bg-blue-600 text-white font-semibold shadow-xs'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Layers className="w-4 h-4" />
              <span>Library / Saved Items</span>
            </div>
            <span
              className={`text-[9px] font-semibold px-1.5 py-0.2 rounded-md ${
                activeTab === 'library'
                  ? 'bg-white/20 text-white'
                  : 'bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400'
              }`}
            >
              DECKS
            </span>
          </button>

          {/* Quiz Arena */}
          <button
            type="button"
            onClick={() => handleNavClick('quiz')}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium transition-colors ${
              activeTab === 'quiz'
                ? 'bg-blue-600 text-white font-semibold shadow-xs'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Quiz Arena</span>
          </button>

          {/* Settings */}
          <button
            type="button"
            onClick={() => handleNavClick('settings')}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium transition-colors ${
              activeTab === 'settings'
                ? 'bg-blue-600 text-white font-semibold shadow-xs'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
            }`}
          >
            <SettingsIcon className="w-4 h-4" />
            <span>Settings</span>
          </button>

          {/* Help and About */}
          <button
            type="button"
            onClick={() => handleNavClick('help')}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium transition-colors ${
              activeTab === 'help'
                ? 'bg-blue-600 text-white font-semibold shadow-xs'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>Help and About</span>
          </button>
        </nav>

        {/* Divider & Chat History Section */}
        <div className="mt-2 pt-3 border-t border-slate-200 dark:border-slate-800 px-3 flex-1 flex flex-col min-h-0">
          <div className="flex items-center justify-between pb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Chat History
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              {conversations.length} saved
            </span>
          </div>

          {/* Search Conversations */}
          <div className="relative mb-2">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search chat history..."
              className="w-full pl-8 pr-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Chat List Scroll Area */}
          <div className="flex-1 overflow-y-auto space-y-1 pr-1">
            {filteredConversations.length === 0 ? (
              <div className="py-6 text-center text-slate-400 text-xs">
                {searchQuery ? 'No matching chats' : 'No previous conversations'}
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const isActive = activeTab === 'chat' && conv.id === activeConversationId;
                return (
                  <div
                    key={conv.id}
                    className={`group flex items-center justify-between px-2.5 py-2 rounded-xl text-xs transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-medium border border-blue-200 dark:border-blue-900/50'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white'
                    }`}
                    onClick={() => handleConversationClick(conv.id)}
                  >
                    <div className="flex items-center gap-2 truncate flex-1 pr-2">
                      <MessageSquare className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{conv.title || 'Conversation'}</span>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteConversation(conv.id);
                      }}
                      className="p-1 rounded opacity-0 group-hover:opacity-100 hover:text-rose-500 transition-opacity"
                      title="Delete conversation"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Drawer Bottom Footer */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-[11px] text-slate-500 font-mono">gemini-3.8-flash</span>
          </div>

          <button
            type="button"
            onClick={onToggleDarkMode}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shadow-2xs"
            title="Toggle theme"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </aside>
    </>
  );
};
