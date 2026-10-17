import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  ArrowUp,
  Plus,
  FileText,
  Upload,
  Lightbulb,
  Sparkles,
  RefreshCw,
  Copy,
  Trash2,
  Check,
  AlertCircle,
  BookOpen,
  Bot,
  User,
  Square,
  FileCheck2,
  X,
  Languages,
  Award,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { ChatMessage, StudyLanguage } from '../types';
import { MarkdownRenderer } from './MarkdownRenderer';
import { ExplainModal } from './ExplainModal';
import { VidyaLogoOrb } from './VidyaLogoOrb';

interface ChatBotProps {
  messages: ChatMessage[];
  onUpdateMessages: (updater: (prev: ChatMessage[]) => ChatMessage[]) => void;
  onOpenNotesGeneratorWithTopic?: (topic: string, pdfBase64?: string, pdfName?: string) => void;
  activeNoteContext?: { title: string; content: string } | null;
  onClearNoteContext?: () => void;
  language: StudyLanguage;
  onSetLanguage: (lang: StudyLanguage) => void;
}

export const ChatBot: React.FC<ChatBotProps> = ({
  messages,
  onUpdateMessages,
  onOpenNotesGeneratorWithTopic,
  activeNoteContext,
  onClearNoteContext,
  language,
  onSetLanguage,
}) => {
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Plus menu open state
  const [isPlusMenuOpen, setIsPlusMenuOpen] = useState(false);

  // Attached PDF in chat
  const [attachedPdf, setAttachedPdf] = useState<{
    file: File;
    base64: string;
    sizeMb: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Feynman Explain Modal state
  const [explainTopic, setExplainTopic] = useState('');
  const [isExplainModalOpen, setIsExplainModalOpen] = useState(false);

  const abortControllerRef = useRef<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const plusMenuRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isStreaming]);

  // Close plus menu on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (plusMenuRef.current && !plusMenuRef.current.contains(e.target as Node)) {
        setIsPlusMenuOpen(false);
      }
    };
    if (isPlusMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isPlusMenuOpen]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 140)}px`;
    }
  }, [input]);

  const handleCopyMessage = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Real PDF file picker & read
  const handlePdfUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      alert('Please upload a valid PDF document (.pdf).');
      return;
    }

    if (file.size > 26 * 1024 * 1024) {
      alert('File size exceeds 26MB. Please upload a smaller document or chapter.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const resultString = reader.result as string;
      const base64 = resultString.split(',')[1];
      setAttachedPdf({
        file,
        base64,
        sizeMb: (file.size / (1024 * 1024)).toFixed(2),
      });
      setIsPlusMenuOpen(false);
    };
    reader.readAsDataURL(file);
  };

  const handleSend = async (userText?: string) => {
    const textToSend = (userText || input).trim();
    if ((!textToSend && !attachedPdf) || isStreaming) return;

    // Check for slash command /notes or /note
    if (textToSend.startsWith('/notes') || textToSend.startsWith('/note')) {
      const topic = textToSend.replace(/^\/notes?\s*/, '').trim();
      if (onOpenNotesGeneratorWithTopic) {
        onOpenNotesGeneratorWithTopic(
          topic || 'Selected Topic',
          attachedPdf?.base64,
          attachedPdf?.file.name
        );
        setInput('');
        setAttachedPdf(null);
        return;
      }
    }

    setError(null);
    const userMsgId = `user-${Date.now()}`;
    const newUserMsg: ChatMessage = {
      id: userMsgId,
      role: 'user',
      content: textToSend || `Please analyze this attached document: ${attachedPdf?.file.name}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      attachedPdfName: attachedPdf?.file.name,
    };

    const newAssistantMsgId = `assistant-${Date.now()}`;
    const newAssistantMsg: ChatMessage = {
      id: newAssistantMsgId,
      role: 'assistant',
      content: '',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    onUpdateMessages((prev) => [...prev, newUserMsg, newAssistantMsg]);
    setInput('');
    setIsStreaming(true);

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      const historyPayload = [...messages, newUserMsg]
        .filter((m) => m && m.content && m.content.trim() && !m.isError)
        .map((m) => ({
          role: m.role,
          content: m.content.trim(),
        }));

      let subjectContext: string | undefined = undefined;
      if (activeNoteContext) {
        subjectContext = `Follow-up regarding Notes "${activeNoteContext.title}". NOTES EXCERPT: ${activeNoteContext.content.slice(0, 3000)}`;
      }
      if (attachedPdf) {
        subjectContext = `${subjectContext ? subjectContext + ' - ' : ''}Student has attached document: ${attachedPdf.file.name}.`;
      }

      let accumulatedText = '';

      // Primary Attempt: Server-Sent Events (SSE) streaming
      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'text/event-stream, application/json',
          },
          body: JSON.stringify({
            messages: historyPayload,
            language,
            subjectContext,
            pdfBase64: attachedPdf?.base64,
            pdfFileName: attachedPdf?.file.name,
            stream: true,
          }),
          signal: abortController.signal,
        });

        if (response.ok && response.body) {
          const reader = response.body.getReader();
          const decoder = new TextDecoder();

          while (true) {
            const { value, done } = await reader.read();
            if (done) break;

            const chunkStr = decoder.decode(value, { stream: true });
            const lines = chunkStr.split('\n');

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const dataStr = line.slice(6).trim();
                if (dataStr === '[DONE]') break;

                try {
                  const parsed = JSON.parse(dataStr);
                  if (parsed.text) {
                    accumulatedText += parsed.text;
                    onUpdateMessages((prev) =>
                      prev.map((m) =>
                        m.id === newAssistantMsgId ? { ...m, content: accumulatedText } : m
                      )
                    );
                  } else if (parsed.error) {
                    throw new Error(parsed.error);
                  }
                } catch (pErr: any) {
                  if (pErr.message && !pErr.message.includes('Unexpected end of JSON')) {
                    throw pErr;
                  }
                }
              }
            }
          }
        }
      } catch (streamErr: any) {
        if (streamErr.name === 'AbortError') throw streamErr;
        console.warn('SSE stream error, trying unary fallback...', streamErr);
      }

      // Fallback: If streaming produced empty output or proxy dropped SSE
      if (!accumulatedText.trim() && !abortController.signal.aborted) {
        const fallbackRes = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({
            messages: historyPayload,
            language,
            subjectContext,
            pdfBase64: attachedPdf?.base64,
            pdfFileName: attachedPdf?.file.name,
            stream: false,
          }),
          signal: abortController.signal,
        });

        if (!fallbackRes.ok) {
          const errorData = await fallbackRes.json().catch(() => ({}));
          throw new Error(errorData.error || `Server responded with ${fallbackRes.status}`);
        }

        const data = await fallbackRes.json();
        accumulatedText = data.text || '';
        onUpdateMessages((prev) =>
          prev.map((m) =>
            m.id === newAssistantMsgId ? { ...m, content: accumulatedText } : m
          )
        );
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.log('Chat generation stopped by user.');
      } else {
        console.error('Chat error:', err);
        const errMsg = err.message || 'Error communicating with AI tutor.';
        setError(errMsg);
        onUpdateMessages((prev) =>
          prev.map((m) =>
            m.id === newAssistantMsgId
              ? {
                  ...m,
                  content:
                    m.content ||
                    `⚠️ **Connection Alert:** ${errMsg}\n\nPlease click **Retry** below.`,
                  isError: true,
                }
              : m
          )
        );
      }
    } finally {
      setIsStreaming(false);
      abortControllerRef.current = null;
      setAttachedPdf(null);
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
      onUpdateMessages((prev) => prev.slice(0, -1));
      handleSend(lastUserMessage.content);
    }
  };

  // Clean prompt cards for empty conversation state
  const promptCards = [
    {
      title: "Newton's 3rd Law",
      desc: 'Real-world sports and driving examples in Hinglish',
      prompt: "Explain Newton's 3rd Law with everyday sports examples in Hinglish.",
    },
    {
      title: 'Quadratic Formula',
      desc: 'Step-by-step derivation and solved board example',
      prompt: 'Derive the quadratic formula step-by-step and solve 2x² - 5x + 3 = 0.',
    },
    {
      title: 'Arteries vs Veins',
      desc: 'Clear comparison table with anatomical diagrams',
      prompt: 'Provide a structured comparison table between Arteries and Veins with structure and function.',
    },
    {
      title: 'French Revolution',
      desc: 'Top 4 causes and key timeline for board exams',
      prompt: 'Explain the top 4 causes of the French Revolution organized for a 5-mark board answer.',
    },
  ];

  const isConversationEmpty = messages.length <= 1;

  return (
    <div className="flex flex-col h-full min-h-0 max-w-4xl mx-auto w-full relative">
      {/* Active Note Context Notification Banner */}
      {activeNoteContext && (
        <div className="px-4 py-2.5 mx-4 mt-2 bg-indigo-50/90 dark:bg-indigo-950/50 border border-indigo-200/80 dark:border-indigo-800/60 rounded-xl flex items-center justify-between text-xs text-indigo-900 dark:text-indigo-200 shadow-xs shrink-0">
          <div className="flex items-center gap-2 truncate pr-2">
            <BookOpen className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
            <span className="font-bold">Active Note:</span>
            <span className="truncate">{activeNoteContext.title}</span>
          </div>
          {onClearNoteContext && (
            <button
              type="button"
              onClick={onClearNoteContext}
              className="p-1 rounded-md hover:bg-indigo-200/60 dark:hover:bg-indigo-800/60 text-indigo-600 dark:text-indigo-400 transition-colors"
              title="Detach notes context"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {/* Messages Scroll Area */}
      <div className="flex-1 p-4 md:p-6 overflow-y-auto space-y-6">
        {/* Welcoming Greeting & 4 Quick Action Cards matching futuristic identity */}
        {!messages.some((m) => m.role === 'user') && (
          <div className="py-6 md:py-10 text-center max-w-xl mx-auto space-y-6 animate-in fade-in duration-500">
            {/* 3D Glowing Celestial Planet with Orbital Rings & Graduation Cap */}
            <div className="flex justify-center">
              <VidyaLogoOrb size="hero" />
            </div>

            <div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
                Your AI{' '}
                <span className="bg-gradient-to-r from-sky-400 via-blue-400 to-indigo-400 dark:from-sky-300 dark:via-blue-400 dark:to-indigo-300 bg-clip-text text-transparent">
                  study companion
                </span>
              </h1>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-2 font-medium">
                Learn smarter. Create notes. Ask anything.
              </p>
            </div>

            {/* 4 Feature Cards (2x2 Grid) */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4 text-left pt-2">
              {/* Card 1: Explain a topic */}
              <button
                type="button"
                onClick={() => {
                  setExplainTopic(input.trim());
                  setIsExplainModalOpen(true);
                }}
                className="p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 dark:border-blue-500/20 bg-white/80 dark:bg-[#070b24]/75 backdrop-blur-md hover:border-blue-400 dark:hover:border-blue-500/50 hover:bg-blue-50/50 dark:hover:bg-blue-950/30 transition-all group flex items-center justify-between shadow-xs hover:shadow-md"
              >
                <div className="flex items-center gap-2.5 sm:gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-500/15 dark:bg-blue-500/20 border border-blue-500/30 text-sky-500 dark:text-sky-400 flex items-center justify-center shrink-0">
                    <Lightbulb className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-500 dark:group-hover:text-sky-400 transition-colors">
                      Explain
                    </h4>
                    <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
                      a topic
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-500 dark:group-hover:text-sky-400 group-hover:translate-x-0.5 transition-all shrink-0 ml-1" />
              </button>

              {/* Card 2: Solve a problem */}
              <button
                type="button"
                onClick={() => {
                  setInput('Please solve this problem step-by-step with formulas and final answer: ');
                  textareaRef.current?.focus();
                }}
                className="p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 dark:border-purple-500/20 bg-white/80 dark:bg-[#070b24]/75 backdrop-blur-md hover:border-purple-400 dark:hover:border-purple-500/50 hover:bg-purple-50/50 dark:hover:bg-purple-950/30 transition-all group flex items-center justify-between shadow-xs hover:shadow-md"
              >
                <div className="flex items-center gap-2.5 sm:gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-500/15 dark:bg-purple-500/20 border border-purple-500/30 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                    <span className="font-serif font-bold text-lg leading-none">π</span>
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white group-hover:text-purple-500 dark:group-hover:text-purple-400 transition-colors">
                      Solve
                    </h4>
                    <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
                      a problem
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-purple-500 dark:group-hover:text-purple-400 group-hover:translate-x-0.5 transition-all shrink-0 ml-1" />
              </button>

              {/* Card 3: Make study notes */}
              <button
                type="button"
                onClick={() => {
                  if (onOpenNotesGeneratorWithTopic) {
                    onOpenNotesGeneratorWithTopic(
                      input.trim() || 'Selected Chapter',
                      attachedPdf?.base64,
                      attachedPdf?.file.name
                    );
                  }
                }}
                className="p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 dark:border-teal-500/20 bg-white/80 dark:bg-[#070b24]/75 backdrop-blur-md hover:border-teal-400 dark:hover:border-teal-500/50 hover:bg-teal-50/50 dark:hover:bg-teal-950/30 transition-all group flex items-center justify-between shadow-xs hover:shadow-md"
              >
                <div className="flex items-center gap-2.5 sm:gap-3">
                  <div className="w-10 h-10 rounded-full bg-teal-500/15 dark:bg-teal-500/20 border border-teal-500/30 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white group-hover:text-teal-500 dark:group-hover:text-teal-400 transition-colors">
                      Make
                    </h4>
                    <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
                      study notes
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-teal-500 dark:group-hover:text-teal-400 group-hover:translate-x-0.5 transition-all shrink-0 ml-1" />
              </button>

              {/* Card 4: Summarize a PDF */}
              <button
                type="button"
                onClick={() => {
                  fileInputRef.current?.click();
                }}
                className="p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 dark:border-indigo-500/20 bg-white/80 dark:bg-[#070b24]/75 backdrop-blur-md hover:border-indigo-400 dark:hover:border-indigo-500/50 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30 transition-all group flex items-center justify-between shadow-xs hover:shadow-md"
              >
                <div className="flex items-center gap-2.5 sm:gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-500/15 dark:bg-indigo-500/20 border border-indigo-500/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                    <FileCheck2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors">
                      Summarize
                    </h4>
                    <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
                      a PDF
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all shrink-0 ml-1" />
              </button>
            </div>
          </div>
        )}

        {/* Message Thread */}
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
                className={`max-w-[88%] md:max-w-[80%] rounded-2xl p-4 shadow-xs relative ${
                  isUser
                    ? 'bg-blue-600 text-white rounded-tr-xs'
                    : msg.isError
                    ? 'bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200 rounded-tl-xs'
                    : 'bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-tl-xs'
                }`}
              >
                {/* Attached PDF badge on user message */}
                {msg.attachedPdfName && (
                  <div className="mb-2 pb-2 border-b border-blue-500/50 flex items-center gap-1.5 text-xs text-blue-100">
                    <FileCheck2 className="w-4 h-4" />
                    <span>Attached PDF: {msg.attachedPdfName}</span>
                  </div>
                )}

                {/* Content */}
                {isUser ? (
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                ) : (
                  <div>
                    {msg.content ? (
                      <MarkdownRenderer
                        content={msg.content}
                        showTableOfContents={false}
                        onExplainPoint={(pt) => {
                          setExplainTopic(pt);
                          setIsExplainModalOpen(true);
                        }}
                      />
                    ) : (
                      <div className="flex items-center gap-2 py-1 text-slate-500 text-sm">
                        <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce" />
                        <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce [animation-delay:0.2s]" />
                        <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce [animation-delay:0.4s]" />
                        <span className="text-xs font-medium ml-1">Formulating response...</span>
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
                          onClick={() => onOpenNotesGeneratorWithTopic(msg.content.slice(0, 60))}
                          className="hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-1 transition-colors font-medium"
                          title="Generate structured Smart Notes from this topic"
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
          <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              type="button"
              onClick={handleRetryLast}
              className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-medium flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Retry</span>
            </button>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ChatGPT-Inspired Bottom Composer Container */}
      <div className="safe-area-bottom p-3 md:p-4 bg-gradient-to-t from-slate-50 via-slate-50/95 to-transparent dark:from-[#050816] dark:via-[#050816]/95 dark:to-transparent shrink-0">
        <div className="relative max-w-3xl mx-auto">
          {/* Attached Document Preview Badge above composer */}
          {attachedPdf && (
            <div className="mb-2 px-3 py-2 rounded-xl bg-blue-50 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-800/70 flex items-center justify-between text-xs text-blue-900 dark:text-blue-200 shadow-xs animate-in slide-in-from-bottom-2">
              <div className="flex items-center gap-2 truncate">
                <FileCheck2 className="w-4 h-4 text-blue-600 shrink-0" />
                <span className="font-semibold truncate">{attachedPdf.file.name}</span>
                <span className="text-slate-500 font-mono text-[11px]">({attachedPdf.sizeMb} MB)</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {onOpenNotesGeneratorWithTopic && (
                  <button
                    type="button"
                    onClick={() => {
                      onOpenNotesGeneratorWithTopic(
                        attachedPdf.file.name.replace(/\.pdf$/i, ''),
                        attachedPdf.base64,
                        attachedPdf.file.name
                      );
                      setAttachedPdf(null);
                    }}
                    className="px-2 py-0.5 rounded bg-blue-600 text-white text-[10px] font-bold hover:bg-blue-700"
                  >
                    Convert to Smart Notes
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setAttachedPdf(null)}
                  className="p-1 rounded hover:bg-blue-200/50 dark:hover:bg-blue-800/50"
                  title="Remove attached PDF"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Plus Tools Floating Menu Popup */}
          {isPlusMenuOpen && (
            <div
              ref={plusMenuRef}
              className="absolute bottom-16 left-0 z-50 w-64 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-2 space-y-1 animate-in zoom-in-95 duration-150"
            >
              <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                AI Study Tools
              </div>

              {/* Upload PDF */}
              <button
                type="button"
                onClick={() => {
                  fileInputRef.current?.click();
                }}
                className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-3 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors"
              >
                <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/80 text-blue-600">
                  <Upload className="w-4 h-4" />
                </div>
                <div>
                  <div>Upload Chapter PDF</div>
                  <div className="text-[10px] font-normal text-slate-400">Read &amp; analyze textbook document</div>
                </div>
              </button>

              {/* Make Notes */}
              <button
                type="button"
                onClick={() => {
                  setIsPlusMenuOpen(false);
                  if (onOpenNotesGeneratorWithTopic) {
                    onOpenNotesGeneratorWithTopic(
                      input.trim() || 'Current Topic',
                      attachedPdf?.base64,
                      attachedPdf?.file.name
                    );
                    setInput('');
                    setAttachedPdf(null);
                  }
                }}
                className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-3 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors"
              >
                <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <div>Make Notes Studio</div>
                  <div className="text-[10px] font-normal text-slate-400">12-section syllabus revision notes</div>
                </div>
              </button>

              {/* Explain Topic */}
              <button
                type="button"
                onClick={() => {
                  setIsPlusMenuOpen(false);
                  setExplainTopic(input.trim());
                  setIsExplainModalOpen(true);
                }}
                className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-3 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors"
              >
                <div className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/80 text-amber-600">
                  <Lightbulb className="w-4 h-4" />
                </div>
                <div>
                  <div>Explain a Concept</div>
                  <div className="text-[10px] font-normal text-slate-400">10-year-old style intuitive analogy</div>
                </div>
              </button>

              {/* Study Help */}
              <button
                type="button"
                onClick={() => {
                  setIsPlusMenuOpen(false);
                  const topic = input.trim() || 'this chapter';
                  handleSend(`Can you provide high-yield study help for ${topic}? Please include:\n1. Top 3 exam concepts\n2. Key formulas with SI units\n3. Common board exam trap to avoid\n4. A 2-minute quick memory tip.`);
                }}
                className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-3 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors"
              >
                <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <div>Study Help</div>
                  <div className="text-[10px] font-normal text-slate-400">High-yield exam review &amp; formulas</div>
                </div>
              </button>

              {/* Quick Language Toggle */}
              <div className="pt-1.5 mt-1 border-t border-slate-100 dark:border-slate-800 px-3 py-1 flex items-center justify-between text-xs text-slate-500">
                <span>Response Lang:</span>
                <select
                  value={language}
                  onChange={(e) => {
                    onSetLanguage(e.target.value as StudyLanguage);
                    setIsPlusMenuOpen(false);
                  }}
                  className="text-xs font-semibold bg-transparent text-blue-600 dark:text-blue-400 focus:outline-hidden"
                >
                  <option value="English">English</option>
                  <option value="Hindi">हिन्दी (Hindi)</option>
                  <option value="Hinglish">Hinglish</option>
                </select>
              </div>
            </div>
          )}

          {/* Hidden File Input for PDF */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handlePdfUpload}
            accept="application/pdf,.pdf"
            className="hidden"
          />

          {/* Main Futuristic Rounded Capsule Composer Box */}
          <div className="vidya-glass flex items-center gap-2 p-1.5 sm:p-2 rounded-[1.35rem] border-blue-500/25 bg-white/85 dark:bg-[#070b22]/85 backdrop-blur-2xl shadow-xl shadow-blue-950/20 focus-within:border-blue-500/60 focus-within:ring-2 focus-within:ring-blue-500/30 transition-all">
            {/* ➕ Plus Tool Button */}
            <button
              type="button"
              onClick={() => setIsPlusMenuOpen(!isPlusMenuOpen)}
              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all shrink-0 ${
                isPlusMenuOpen || attachedPdf
                  ? 'bg-blue-600 text-white rotate-45 shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800/90 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
              title="Add PDF or open AI study tools"
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {/* Input Textarea */}
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing && e.keyCode !== 229) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Ask VidyaAI anything..."
              rows={1}
              className="flex-1 py-1 px-3 text-sm bg-transparent text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-400/80 focus:outline-hidden resize-none leading-relaxed min-h-[36px] max-h-[140px]"
            />

            {/* Send or Stop Button */}
            {isStreaming ? (
              <button
                type="button"
                onClick={handleStopStream}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center shrink-0 hover:opacity-90 transition-opacity shadow-md"
                title="Stop generation"
              >
                <Square className="w-4 h-4 fill-current" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleSend()}
                disabled={!input.trim() && !attachedPdf}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-tr from-blue-600 via-blue-500 to-sky-400 disabled:from-slate-300 disabled:to-slate-300 dark:disabled:from-slate-800 dark:disabled:to-slate-800 text-white disabled:text-slate-500 flex items-center justify-center shrink-0 shadow-md shadow-blue-500/35 hover:scale-105 active:scale-95 transition-all disabled:cursor-not-allowed disabled:shadow-none"
                title="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Concept Explain Modal */}
      <ExplainModal
        isOpen={isExplainModalOpen}
        initialTopic={explainTopic}
        notesContext={messages.map((m) => m.content).join('\n')}
        onClose={() => setIsExplainModalOpen(false)}
      />
    </div>
  );
};
