import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Sparkles,
  RefreshCw,
  Copy,
  Trash2,
  PlusCircle,
  Check,
  AlertCircle,
  Languages,
  BookOpen,
  MessageSquare,
  Bot,
  User,
  StopCircle,
  FileText,
  X,
  Layers,
} from 'lucide-react';
import { ChatMessage, StudyLanguage } from '../types';
import { MarkdownRenderer } from './MarkdownRenderer';

interface ChatBotProps {
  onOpenNotesGeneratorWithTopic?: (topic: string) => void;
  activeNoteContext?: { title: string; content: string } | null;
  onClearNoteContext?: () => void;
}

export const ChatBot: React.FC<ChatBotProps> = ({
  onOpenNotesGeneratorWithTopic,
  activeNoteContext,
  onClearNoteContext,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    return [
      {
        id: 'welcome-1',
        role: 'assistant',
        content: `Namaste & Welcome! 🙏 I am **VidyaAI**, your personal academic tutor and study companion.

I can explain any concept, solve doubts, and give exam tips in **English**, **हिन्दी (Hindi)**, or conversational **Hinglish**!

Feel free to ask questions like:
- *"Explain Newton's 3rd Law in Hinglish with cricket example"*
- *"How to solve quadratic equations by completing the square?"*
- *"Difference between Mitosis and Meiosis in tabular form"*
- *"Why did the French Revolution happen? Give top 4 causes"*

💡 **Tip:** You can click the **Make Notes** button in the composer below at any time to convert any topic or doubt into high-yield structured study notes!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ];
  });

  const [input, setInput] = useState('');
  const [language, setLanguage] = useState<StudyLanguage>('English');
  const [subjectFilter, setSubjectFilter] = useState('All Subjects');
  const [isStreaming, setIsStreaming] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isStreaming]);

  // When activeNoteContext is provided, add an introductory assistant prompt
  useEffect(() => {
    if (activeNoteContext) {
      setMessages((prev) => [
        ...prev,
        {
          id: `note-ctx-${Date.now()}`,
          role: 'assistant',
          content: `📖 **Active Notes Context Loaded:** *${activeNoteContext.title}*\n\nI have the full content of these notes ready. You can ask me any follow-up question, such as:\n- *"Explain Section 4 in simpler terms"* \n- *"Give me 3 more numericals like question 2"* \n- *"What are the most likely 5-mark board exam questions from this chapter?"*`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }
  }, [activeNoteContext]);

  const handleCopyMessage = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleNewChat = () => {
    if (isStreaming && abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    if (onClearNoteContext) onClearNoteContext();
    setMessages([
      {
        id: 'new-chat-welcome',
        role: 'assistant',
        content: `Ready for a new study session! 🚀 What chapter or topic would you like to master today? You can ask in English, Hindi, or Hinglish.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setError(null);
    setInput('');
  };

  const handleClearChat = () => {
    setMessages([]);
    setError(null);
  };

  const handleSend = async (userText?: string) => {
    const textToSend = (userText || input).trim();
    if (!textToSend || isStreaming) return;

    // Check for slash command /notes or /note
    if (textToSend.startsWith('/notes') || textToSend.startsWith('/note')) {
      const topic = textToSend.replace(/^\/notes?\s*/, '').trim();
      if (onOpenNotesGeneratorWithTopic) {
        onOpenNotesGeneratorWithTopic(topic || 'Selected Topic');
        setInput('');
        return;
      }
    }

    setError(null);
    const userMsgId = `user-${Date.now()}`;
    const newUserMsg: ChatMessage = {
      id: userMsgId,
      role: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newAssistantMsgId = `assistant-${Date.now()}`;
    const newAssistantMsg: ChatMessage = {
      id: newAssistantMsgId,
      role: 'assistant',
      content: '',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, newUserMsg, newAssistantMsg]);
    setInput('');
    setIsStreaming(true);

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      // Build history for backend
      const historyPayload = [...messages, newUserMsg].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      // If active note context exists, append to system context
      let subjectContext = subjectFilter !== 'All Subjects' ? subjectFilter : undefined;
      if (activeNoteContext) {
        subjectContext = `${subjectContext ? subjectContext + ' - ' : ''}Follow-up regarding Notes "${activeNoteContext.title}". NOTES EXCERPT: ${activeNoteContext.content.slice(0, 3000)}`;
      }

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: historyPayload,
          language,
          subjectContext,
          stream: true,
        }),
        signal: abortController.signal,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server responded with ${response.status}`);
      }

      if (!response.body) {
        throw new Error('No response stream received.');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedText = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunkStr = decoder.decode(value, { stream: true });
        const lines = chunkStr.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.slice(6).trim();
            if (dataStr === '[DONE]') {
              break;
            }
            try {
              const parsed = JSON.parse(dataStr);
              if (parsed.text) {
                accumulatedText += parsed.text;
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === newAssistantMsgId ? { ...m, content: accumulatedText } : m
                  )
                );
              } else if (parsed.error) {
                throw new Error(parsed.error);
              }
            } catch (pErr) {
              // Ignore partial JSON chunks
            }
          }
        }
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.log('Chat generation was stopped by user.');
      } else {
        console.error('Chat error:', err);
        setError(err.message || 'Error communicating with AI tutor.');
        setMessages((prev) =>
          prev.map((m) =>
            m.id === newAssistantMsgId
              ? {
                  ...m,
                  content:
                    m.content ||
                    `⚠️ Error: ${err.message || 'Unable to generate response. Please click Retry below.'}`,
                  isError: true,
                }
              : m
          )
        );
      }
    } finally {
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  };

  const handleStopStream = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsStreaming(false);
    }
  };

  const handleRetryLast = () => {
    const lastUserMessage = [...messages].reverse().find((m) => m.role === 'user');
    if (lastUserMessage) {
      setMessages((prev) => prev.slice(0, -1));
      handleSend(lastUserMessage.content);
    }
  };

  // Quick prompt suggestions
  const quickSuggestions = [
    {
      title: 'Hinglish Physics',
      query: "Explain Newton's 3rd Law with everyday cricket or driving examples in Hinglish.",
    },
    {
      title: 'CBSE 10th Math',
      query: 'Derive the quadratic formula step by step and show how to use it.',
    },
    {
      title: 'Biology Table',
      query: 'Make a clear comparison table between Arteries and Veins with structure & function.',
    },
    {
      title: 'Hindi Explanation',
      query: 'प्रकाश संश्लेषण (Photosynthesis) की प्रक्रिया को सरल हिन्दी में समझाइए।',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto flex flex-col h-[calc(100vh-140px)] min-h-[550px] bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      {/* Top Chat Control Bar */}
      <div className="p-3.5 md:px-6 bg-slate-50 dark:bg-slate-850 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-slate-900 dark:text-white text-sm">VidyaAI Academic Tutor</h2>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <p className="text-[11px] text-slate-500">Multilingual CBSE/ICSE Doubt Solver</p>
          </div>
        </div>

        {/* Controls: Language, Subject, New Chat, Clear */}
        <div className="flex items-center gap-2">
          {/* Language Selector */}
          <div className="flex items-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-0.5 text-xs">
            {(['English', 'Hinglish', 'Hindi'] as StudyLanguage[]).map((lang) => (
              <button
                key={lang}
                type="button"
                onClick={() => setLanguage(lang)}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  language === lang
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {lang === 'Hindi' ? 'हिन्दी' : lang}
              </button>
            ))}
          </div>

          {/* New Chat */}
          <button
            type="button"
            onClick={handleNewChat}
            className="p-1.5 md:px-2.5 md:py-1 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition-colors"
            title="Start fresh conversation"
          >
            <PlusCircle className="w-3.5 h-3.5 text-blue-600" />
            <span className="hidden md:inline">New Chat</span>
          </button>

          {/* Clear Chat */}
          <button
            type="button"
            onClick={handleClearChat}
            className="p-1.5 rounded-lg text-xs text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
            title="Clear all messages"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Active Note Context Banner if follow-up mode is active */}
      {activeNoteContext && (
        <div className="px-4 py-2 bg-indigo-50/80 dark:bg-indigo-950/40 border-b border-indigo-100 dark:border-indigo-900/60 flex items-center justify-between text-xs text-indigo-900 dark:text-indigo-200">
          <div className="flex items-center gap-2 truncate">
            <BookOpen className="w-4 h-4 text-indigo-600 shrink-0" />
            <span className="font-semibold">Attached Note Context:</span>
            <span className="truncate">{activeNoteContext.title}</span>
          </div>
          {onClearNoteContext && (
            <button
              type="button"
              onClick={onClearNoteContext}
              className="p-1 rounded hover:bg-indigo-200/50 dark:hover:bg-indigo-800/50 text-indigo-600 dark:text-indigo-400"
              title="Detach notes context"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {/* Messages Scroll Area */}
      <div className="flex-1 p-4 md:p-6 overflow-y-auto space-y-6">
        {messages.map((msg, index) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id || index}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'} group`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-white text-xs shadow-xs ${
                  isUser
                    ? 'bg-gradient-to-tr from-slate-700 to-slate-900'
                    : 'bg-gradient-to-tr from-blue-600 to-indigo-600'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              {/* Message Bubble */}
              <div
                className={`max-w-[85%] md:max-w-[78%] rounded-2xl p-4 shadow-xs relative ${
                  isUser
                    ? 'bg-blue-600 text-white rounded-tr-xs'
                    : msg.isError
                    ? 'bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200 rounded-tl-xs'
                    : 'bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-tl-xs'
                }`}
              >
                {/* User Text or Assistant Markdown */}
                {isUser ? (
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                ) : (
                  <div>
                    {msg.content ? (
                      <MarkdownRenderer content={msg.content} />
                    ) : (
                      <div className="flex items-center gap-2 py-1 text-slate-500 text-sm">
                        <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce" />
                        <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce [animation-delay:0.2s]" />
                        <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce [animation-delay:0.4s]" />
                        <span className="text-xs font-medium ml-1">Thinking and formulating...</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Footer bar with timestamp and action buttons */}
                <div
                  className={`mt-2 flex items-center justify-between text-[10px] ${
                    isUser ? 'text-blue-200' : 'text-slate-400'
                  }`}
                >
                  <span>{msg.timestamp}</span>

                  {!isUser && msg.content && (
                    <div className="flex items-center gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => handleCopyMessage(msg.content, msg.id)}
                        className="hover:text-slate-600 dark:hover:text-slate-200 flex items-center gap-1 transition-colors"
                        title="Copy text"
                      >
                        {copiedId === msg.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-500" />
                            <span className="text-emerald-500">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>

                      {onOpenNotesGeneratorWithTopic && index > 0 && (
                        <button
                          type="button"
                          onClick={() => onOpenNotesGeneratorWithTopic(msg.content.slice(0, 50))}
                          className="hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-1 transition-colors font-medium"
                          title="Generate structured smart notes from this topic"
                        >
                          <FileText className="w-3 h-3 text-blue-600" />
                          <span>Make Notes</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              type="button"
              onClick={handleRetryLast}
              className="px-2.5 py-1 rounded bg-rose-600 hover:bg-rose-700 text-white font-medium flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Retry</span>
            </button>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts Bar */}
      {messages.length <= 2 && (
        <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="text-[11px] font-semibold text-slate-400 shrink-0 uppercase tracking-wider">
            Quick Topics:
          </span>
          {quickSuggestions.map((sug, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleSend(sug.query)}
              className="px-2.5 py-1 rounded-full text-xs bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 hover:text-blue-600 transition-colors shrink-0 shadow-2xs"
            >
              {sug.title}
            </button>
          ))}
        </div>
      )}

      {/* Input Box Area with Prominent "Make Notes" Tool Integration */}
      <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
        <div className="relative rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-850 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all shadow-xs">
          {/* Quick AI Tools Bar inside composer */}
          <div className="flex items-center justify-between px-3 pt-2 pb-1 border-b border-slate-200/50 dark:border-slate-700/50 text-xs">
            <div className="flex items-center gap-2">
              {/* Prominent "Make Notes" tool */}
              <button
                type="button"
                onClick={() => {
                  if (onOpenNotesGeneratorWithTopic) {
                    onOpenNotesGeneratorWithTopic(input.trim() || 'Current Topic');
                  }
                }}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 font-semibold text-xs transition-colors shadow-2xs"
                title="Generate complete structured Smart Notes from this topic"
              >
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>Make Notes</span>
              </button>

              <span className="text-[11px] text-slate-400 hidden sm:inline">
                Type <code className="font-mono text-slate-600 dark:text-slate-300">/notes [topic]</code> or ask any question
              </span>
            </div>

            <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
              <span>Lang:</span>
              <span className="font-semibold text-blue-600 dark:text-blue-400">{language}</span>
            </div>
          </div>

          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={`Ask any school subject doubt or formula in ${language}... (Press Enter to send, Shift+Enter for new line)`}
            rows={2}
            className="w-full px-4 pt-2.5 pb-10 text-sm bg-transparent text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden resize-none leading-relaxed"
          />

          <div className="absolute bottom-2.5 right-3 flex items-center gap-2">
            {isStreaming ? (
              <button
                type="button"
                onClick={handleStopStream}
                className="px-3 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <StopCircle className="w-3.5 h-3.5" />
                <span>Stop</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleSend()}
                disabled={!input.trim()}
                className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs disabled:cursor-not-allowed"
              >
                <span>Ask Vidya</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
