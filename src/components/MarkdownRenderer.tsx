import React, { useState, useMemo } from 'react';
import {
  Check,
  Copy,
  Lightbulb,
  Bookmark,
  Sparkles,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Award,
  Target,
  List,
} from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
  onExplainPoint?: (point: string) => void;
  showTableOfContents?: boolean;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
  onExplainPoint,
  showTableOfContents = true,
}) => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [revealedAnswers, setRevealedAnswers] = useState<Record<number, boolean>>({});
  const [isTocOpen, setIsTocOpen] = useState(false);

  const handleCopyCode = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const toggleAnswer = (qIndex: number) => {
    setRevealedAnswers((prev) => ({ ...prev, [qIndex]: !prev[qIndex] }));
  };

  // Extract table of contents headers
  const tocItems = useMemo(() => {
    const items: { id: string; text: string; level: number }[] = [];
    const lines = content.split('\n');
    lines.forEach((line) => {
      const trimmed = line.trim();
      if (trimmed.startsWith('## ')) {
        const text = trimmed.replace(/^##\s*/, '').replace(/\*\*/g, '');
        const id = 'section-' + text.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        items.push({ id, text, level: 2 });
      }
    });
    return items;
  }, [content]);

  // Helper to parse inline styles: bold, code, math
  const renderInlineFormatted = (text: string): React.ReactNode => {
    if (!text) return null;

    const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*|\$[^\$]+\$)/g);

    return parts.map((part, idx) => {
      if (part.startsWith('`') && part.endsWith('`')) {
        const codeText = part.slice(1, -1);
        return (
          <code
            key={idx}
            className="px-1.5 py-0.5 mx-0.5 text-xs font-mono font-medium rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60"
          >
            {codeText}
          </code>
        );
      }
      if (part.startsWith('**') && part.endsWith('**')) {
        const boldText = part.slice(2, -2);
        return (
          <strong key={idx} className="font-semibold text-slate-900 dark:text-slate-100">
            {boldText}
          </strong>
        );
      }
      if (part.startsWith('$') && part.endsWith('$')) {
        const mathText = part.slice(1, -1);
        return (
          <span
            key={idx}
            className="px-1.5 py-0.5 mx-0.5 font-mono text-sm bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200 border border-amber-200 dark:border-amber-800/50 rounded inline-block"
          >
            {mathText}
          </span>
        );
      }
      return part;
    });
  };

  const lines = content.split('\n');
  const renderedElements: React.ReactNode[] = [];

  let inCodeBlock = false;
  let codeBlockLang = '';
  let codeBlockLines: string[] = [];
  let tableRows: string[][] = [];
  let inTable = false;
  let questionCounter = 0;

  const flushTable = (key: string) => {
    if (tableRows.length === 0) return;
    const headerRow = tableRows[0];
    const bodyRows = tableRows.slice(1).filter((r) => !r.every((cell) => cell.match(/^[-:]+$/)));

    renderedElements.push(
      <div key={key} className="my-4 overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="bg-slate-100 dark:bg-slate-800/90 text-slate-800 dark:text-slate-200">
              {headerRow.map((h, i) => (
                <th key={i} className="px-3.5 py-2.5 font-bold border-b border-slate-200 dark:border-slate-700">
                  {renderInlineFormatted(h.trim())}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900/60">
            {bodyRows.map((row, rIdx) => (
              <tr key={rIdx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                {row.map((cell, cIdx) => (
                  <td key={cIdx} className="px-3.5 py-2 text-slate-700 dark:text-slate-300">
                    {renderInlineFormatted(cell.trim())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
    tableRows = [];
    inTable = false;
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    // Code block detection
    if (trimmed.startsWith('```')) {
      if (inTable) flushTable(`table-${i}`);

      if (inCodeBlock) {
        const codeString = codeBlockLines.join('\n');
        const codeId = `code-${i}`;
        renderedElements.push(
          <div key={codeId} className="my-3 rounded-xl overflow-hidden border border-slate-800 bg-slate-950 shadow-md">
            <div className="flex items-center justify-between px-3.5 py-1.5 bg-slate-900 border-b border-slate-800 text-xs text-slate-400 font-mono">
              <span className="font-semibold text-slate-300">{codeBlockLang || 'Formula / Code'}</span>
              <button
                type="button"
                onClick={() => handleCopyCode(codeString, codeId)}
                className="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-slate-800 text-slate-300 transition-colors"
                title="Copy code"
              >
                {copiedCode === codeId ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
            <pre className="p-3.5 text-sm font-mono text-emerald-300 overflow-x-auto whitespace-pre leading-relaxed">
              {codeString}
            </pre>
          </div>
        );
        inCodeBlock = false;
        codeBlockLines = [];
        codeBlockLang = '';
        continue;
      } else {
        inCodeBlock = true;
        codeBlockLang = trimmed.replace('```', '').trim();
        codeBlockLines = [];
        continue;
      }
    }

    if (inCodeBlock) {
      codeBlockLines.push(rawLine);
      continue;
    }

    // Markdown Table Detection
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      inTable = true;
      const cells = trimmed
        .slice(1, -1)
        .split('|')
        .map((c) => c.trim());
      tableRows.push(cells);
      continue;
    } else if (inTable) {
      flushTable(`table-${i}`);
    }

    if (!trimmed) continue;

    // Headers ## Section Header
    if (trimmed.startsWith('## ')) {
      const title = trimmed.replace(/^##\s*/, '');
      const lower = title.toLowerCase();
      const sectionId = 'section-' + title.toLowerCase().replace(/[^a-z0-9]+/g, '-');

      // Visual icon based on section content
      let icon = <span className="w-2 h-5 rounded-sm bg-gradient-to-b from-blue-600 to-indigo-600 dark:from-blue-500 dark:to-indigo-500 shadow-xs" />;
      if (lower.includes('misconception')) {
        icon = <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />;
      } else if (lower.includes('exam') || lower.includes('scoring')) {
        icon = <Award className="w-5 h-5 text-indigo-500 shrink-0" />;
      } else if (lower.includes('objective')) {
        icon = <Target className="w-5 h-5 text-emerald-500 shrink-0" />;
      }

      renderedElements.push(
        <div
          id={sectionId}
          key={`h2-${i}`}
          className="mt-7 mb-3 pt-4 pb-2 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between group scroll-mt-20"
        >
          <div className="flex items-center gap-2.5">
            {icon}
            <h2 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              {renderInlineFormatted(title)}
            </h2>
          </div>
          {onExplainPoint && (
            <button
              type="button"
              onClick={() => onExplainPoint(title)}
              className="text-xs px-2.5 py-1 rounded-lg text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors flex items-center gap-1.5 opacity-90 group-hover:opacity-100"
              title="Explain this topic in simple terms"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Explain Simply</span>
            </button>
          )}
        </div>
      );
      continue;
    }

    // Headers ### Subheaders
    if (trimmed.startsWith('### ')) {
      const subTitle = trimmed.replace(/^###\s*/, '');
      renderedElements.push(
        <div key={`h3-${i}`} className="mt-4 mb-2 flex items-center justify-between">
          <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <Bookmark className="w-4 h-4 text-indigo-500 shrink-0" />
            <span>{renderInlineFormatted(subTitle)}</span>
          </h3>
          {onExplainPoint && (
            <button
              type="button"
              onClick={() => onExplainPoint(subTitle)}
              className="text-xs text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-300 flex items-center gap-1"
            >
              <Lightbulb className="w-3 h-3" />
              <span>Break down</span>
            </button>
          )}
        </div>
      );
      continue;
    }

    // Header ####
    if (trimmed.startsWith('#### ')) {
      renderedElements.push(
        <h4 key={`h4-${i}`} className="mt-3 mb-1 text-sm font-semibold text-slate-700 dark:text-slate-300">
          {renderInlineFormatted(trimmed.replace(/^####\s*/, ''))}
        </h4>
      );
      continue;
    }

    // Callout quote / Important Tip
    if (trimmed.startsWith('> ')) {
      renderedElements.push(
        <blockquote
          key={`quote-${i}`}
          className="my-3 pl-4 py-2.5 border-l-4 border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/30 text-slate-700 dark:text-slate-300 text-sm rounded-r-xl"
        >
          {renderInlineFormatted(trimmed.replace(/^>\s*/, ''))}
        </blockquote>
      );
      continue;
    }

    // Detect Revision Question/Answer pattern
    const qMatch = trimmed.match(/^(\*{0,2}(?:Q\d*|Question\s*\d*|\d+\.)[:\.]?\*{0,2})\s*(.*)/i);
    const ansMatch = trimmed.match(/^(\*{0,2}(?:Ans|Answer)[:\.]?\*{0,2})\s*(.*)/i);

    if (qMatch && !ansMatch && trimmed.toLowerCase().includes('?')) {
      questionCounter++;
      const currentQIdx = questionCounter;
      const isRevealed = Boolean(revealedAnswers[currentQIdx]);

      // Check if next line is the answer
      let nextAnsText = '';
      if (i + 1 < lines.length) {
        const nextTrimmed = lines[i + 1].trim();
        const nextAnsMatch = nextTrimmed.match(/^(\*{0,2}(?:Ans|Answer)[:\.]?\*{0,2})\s*(.*)/i);
        if (nextAnsMatch) {
          nextAnsText = nextAnsMatch[2];
        }
      }

      renderedElements.push(
        <div
          key={`q-${i}`}
          className="my-3 p-4 rounded-xl border border-blue-100 dark:border-blue-900/50 bg-blue-50/40 dark:bg-blue-950/20"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-2.5 text-sm font-medium text-slate-900 dark:text-slate-100">
              <span className="px-2 py-0.5 rounded text-xs font-bold bg-blue-600 text-white shrink-0 mt-0.5">
                Q{currentQIdx}
              </span>
              <span>{renderInlineFormatted(qMatch[2] || trimmed)}</span>
            </div>
            <button
              type="button"
              onClick={() => toggleAnswer(currentQIdx)}
              className="text-xs px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-1 shrink-0 transition-colors shadow-2xs"
            >
              {isRevealed ? (
                <>
                  <ChevronUp className="w-3.5 h-3.5" />
                  <span>Hide Answer</span>
                </>
              ) : (
                <>
                  <ChevronDown className="w-3.5 h-3.5" />
                  <span>Show Answer</span>
                </>
              )}
            </button>
          </div>
          {isRevealed && (
            <div className="mt-3 pt-3 border-t border-blue-200/60 dark:border-blue-800/60 text-sm text-slate-700 dark:text-slate-300 bg-white/80 dark:bg-slate-900/70 p-3 rounded-lg leading-relaxed animate-in fade-in">
              <span className="font-bold text-emerald-700 dark:text-emerald-400 mr-1.5">Answer:</span>
              <span>{renderInlineFormatted(nextAnsText || 'Refer to textbook explanation and steps above.')}</span>
            </div>
          )}
        </div>
      );

      // Skip next line if it was the answer text
      if (nextAnsText) {
        i++;
      }
      continue;
    }

    // Answer lines standalone
    if (ansMatch) {
      renderedElements.push(
        <div key={`ans-${i}`} className="my-2 p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 text-sm text-slate-800 dark:text-slate-200">
          <span className="font-bold text-emerald-700 dark:text-emerald-400 mr-1.5">Answer:</span>
          <span>{renderInlineFormatted(ansMatch[2])}</span>
        </div>
      );
      continue;
    }

    // Bullet points
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ') || trimmed.startsWith('• ')) {
      const itemContent = trimmed.replace(/^[-*•]\s*/, '');
      renderedElements.push(
        <div key={`bullet-${i}`} className="flex items-start gap-2.5 my-1.5 text-sm text-slate-700 dark:text-slate-300">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0 mt-2" />
          <div className="flex-1 leading-relaxed">{renderInlineFormatted(itemContent)}</div>
        </div>
      );
      continue;
    }

    // Numbered list
    const numListMatch = trimmed.match(/^(\d+\.)\s*(.*)/);
    if (numListMatch) {
      renderedElements.push(
        <div key={`num-${i}`} className="flex items-start gap-2.5 my-1.5 text-sm text-slate-700 dark:text-slate-300">
          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-1.5 py-0.5 rounded border border-indigo-200/50 dark:border-indigo-800/50 shrink-0 mt-0.5">
            {numListMatch[1]}
          </span>
          <div className="flex-1 leading-relaxed">{renderInlineFormatted(numListMatch[2])}</div>
        </div>
      );
      continue;
    }

    // Standard paragraph
    renderedElements.push(
      <p key={`p-${i}`} className="my-2 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
        {renderInlineFormatted(trimmed)}
      </p>
    );
  }

  if (inTable) flushTable('table-end');

  return (
    <div className="markdown-student-notes text-slate-800 dark:text-slate-200 select-text">
      {/* Table of contents quick navigation bar */}
      {showTableOfContents && tocItems.length > 2 && (
        <div className="mb-6 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-850 no-print">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              <List className="w-4 h-4 text-blue-600" />
              <span>Chapter Navigation ({tocItems.length} Sections)</span>
            </div>
            <button
              type="button"
              onClick={() => setIsTocOpen(!isTocOpen)}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-medium"
            >
              <span>{isTocOpen ? 'Collapse' : 'Show All Sections'}</span>
              {isTocOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Quick jump pills */}
          <div className="flex flex-wrap gap-1.5 mt-2.5">
            {tocItems.slice(0, isTocOpen ? tocItems.length : 6).map((item, idx) => (
              <a
                key={idx}
                href={`#${item.id}`}
                className="px-2.5 py-1 text-xs rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-blue-400 hover:text-blue-600 transition-colors shadow-2xs"
              >
                {item.text.replace(/^\d+\.\s*/, '')}
              </a>
            ))}
          </div>
        </div>
      )}

      {renderedElements}
    </div>
  );
};
