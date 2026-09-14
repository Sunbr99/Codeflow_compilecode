import React, { useRef, useEffect } from 'react';
import { Copy, Check, Bookmark, Play, Edit3, Lock, Search, AlertCircle } from 'lucide-react';
import { ExecutionStep } from '../types';

interface CodeViewerProps {
  code: string;
  onCodeChange: (newCode: string) => void;
  activeLine: number;
  breakpoints: Set<number>;
  onToggleBreakpoint: (line: number) => void;
  steps: ExecutionStep[];
  currentStepIndex: number;
  onJumpToLine: (line: number) => void;
}

export const CodeViewer: React.FC<CodeViewerProps> = ({
  code,
  onCodeChange,
  activeLine,
  breakpoints,
  onToggleBreakpoint,
  steps,
  currentStepIndex,
  onJumpToLine,
}) => {
  const [isEditing, setIsEditing] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const activeLineRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll active line into view smoothly
  useEffect(() => {
    if (activeLineRef.current && containerRef.current && !isEditing) {
      activeLineRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [activeLine, isEditing]);

  const lines = code.split('\n');

  // Map each line to steps that land on this line
  const lineStepsMap = React.useMemo(() => {
    const map = new Map<number, number[]>();
    steps.forEach((step, idx) => {
      const existing = map.get(step.lineNumber) || [];
      existing.push(idx + 1);
      map.set(step.lineNumber, existing);
    });
    return map;
  }, [steps]);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  // Syntax highlighting tokenizer
  const renderHighlightedLine = (text: string) => {
    if (!text.trim()) {
      return <span>&nbsp;</span>;
    }

    // Single-line comment
    if (text.trim().startsWith('//') || text.trim().startsWith('#')) {
      return <span className="text-slate-500 italic">{text}</span>;
    }

    // Tokenize strings, hex escapes, keywords, numbers
    const parts = text.split(/(\\x[0-9a-fA-F]{2}|"[^"]*"|'[^']*'|`[^`]*`|\b(?:function|def|var|let|const|return|if|else|switch|case|while|for|break|class|import|from|export|async|await|yield|echo|print)\b|\b(?:true|false|null|undefined|None)\b|[0-9]+|0x[0-9a-fA-F]+)/g);

    return parts.map((part, idx) => {
      if (!part) return null;

      // Hex literal escape sequence (\x68 etc.)
      if (/^\\x[0-9a-fA-F]{2}$/.test(part)) {
        return (
          <span
            key={idx}
            className="bg-amber-950/80 text-amber-300 font-bold px-0.5 rounded-xs border border-amber-800/60"
            title={`Hex Encoded Byte: ${part}`}
          >
            {part}
          </span>
        );
      }

      // Hex numbers like 0x1f4
      if (/^0x[0-9a-fA-F]+$/.test(part)) {
        return <span key={idx} className="text-amber-400 font-semibold">{part}</span>;
      }

      // String literals
      if (/^("[^"]*"|'[^']*'|`[^`]*`)$/.test(part)) {
        return <span key={idx} className="text-emerald-300">{part}</span>;
      }

      // Keywords
      if (/^\b(?:function|def|var|let|const|return|if|else|switch|case|while|for|break|class|import|from|export|async|await|yield|echo|print)\b$/.test(part)) {
        return <span key={idx} className="text-purple-400 font-semibold">{part}</span>;
      }

      // Booleans and primitives
      if (/^\b(?:true|false|null|undefined|None)\b$/.test(part)) {
        return <span key={idx} className="text-sky-400">{part}</span>;
      }

      // Numbers
      if (/^[0-9]+$/.test(part)) {
        return <span key={idx} className="text-orange-400">{part}</span>;
      }

      // Obfuscated identifiers like _0x34a1
      if (/_0x[0-9a-fA-F]+/.test(part)) {
        return (
          <span key={idx} className="text-pink-300 underline decoration-dotted decoration-pink-500/50">
            {part}
          </span>
        );
      }

      return <span key={idx} className="text-slate-300">{part}</span>;
    });
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-md">
      {/* Top Code Pane Header */}
      <div className="flex items-center justify-between px-3.5 py-2.5 bg-slate-950 border-b border-slate-800 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5 mr-1">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500/80 inline-block"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block"></span>
          </div>
          <span className="font-semibold text-slate-200">สคริปต์ต้นฉบับ (Source Script)</span>
          <span className="text-[11px] text-slate-500">
            ({lines.length} บรรทัด)
          </span>
          {activeLine > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800/60 font-mono text-[10px]">
              กำลังทำงาน: บรรทัด {activeLine}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {/* Quick Search */}
          <div className="relative hidden md:flex items-center">
            <Search className="w-3 h-3 absolute left-2 text-slate-500 pointer-events-none" />
            <input
              type="text"
              placeholder="ค้นหาโค้ด..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-900 text-slate-300 text-[11px] pl-6 pr-2 py-1 rounded-md border border-slate-800 focus:outline-none focus:border-slate-600 w-28 lg:w-36"
            />
          </div>

          {/* Toggle Edit/View */}
          <button
            id="toggle-edit-code-btn"
            type="button"
            onClick={() => setIsEditing(!isEditing)}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md font-medium text-[11px] transition-colors ${
              isEditing
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
            title={isEditing ? 'บันทึกโค้ดและล็อคสำหรับการจำลอง' : 'แก้ไขสคริปต์ด้วยตนเอง'}
          >
            {isEditing ? (
              <>
                <Lock className="w-3 h-3" />
                <span>เสร็จสิ้น</span>
              </>
            ) : (
              <>
                <Edit3 className="w-3 h-3" />
                <span>แก้ไขโค้ด</span>
              </>
            )}
          </button>

          {/* Copy Button */}
          <button
            id="copy-source-code-btn"
            type="button"
            onClick={handleCopy}
            className="p-1 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            title="คัดลอกโค้ดต้นฉบับ"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Editor / Line Viewer Body */}
      <div ref={containerRef} className="flex-1 overflow-auto font-mono text-[12px] leading-relaxed relative select-text">
        {isEditing ? (
          <textarea
            id="source-code-textarea"
            value={code}
            onChange={(e) => onCodeChange(e.target.value)}
            className="w-full h-full min-h-[420px] p-4 bg-slate-900 text-slate-200 font-mono text-[12px] resize-none focus:outline-none leading-relaxed"
            placeholder="วางโค้ดที่ต้องการวิเคราะห์ที่นี่..."
            spellCheck={false}
          />
        ) : (
          <div className="py-2 min-w-full inline-block">
            {lines.map((lineText, idx) => {
              const lineNum = idx + 1;
              const isActive = lineNum === activeLine;
              const hasBreakpoint = breakpoints.has(lineNum);
              const stepIndices = lineStepsMap.get(lineNum);
              const isMatchSearch = searchQuery && lineText.toLowerCase().includes(searchQuery.toLowerCase());

              return (
                <div
                  key={lineNum}
                  ref={isActive ? activeLineRef : null}
                  onClick={() => onJumpToLine(lineNum)}
                  className={`flex items-stretch group transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-emerald-950/70 border-y border-emerald-500/50 shadow-inner'
                      : isMatchSearch
                      ? 'bg-amber-950/40'
                      : 'hover:bg-slate-850'
                  }`}
                >
                  {/* Breakpoint Gutter */}
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleBreakpoint(lineNum);
                    }}
                    className="w-7 shrink-0 flex items-center justify-center text-slate-600 hover:text-red-400 transition-colors"
                    title={hasBreakpoint ? 'ลบ Breakpoint' : 'คลิกเพื่อวาง Breakpoint'}
                  >
                    {hasBreakpoint ? (
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-xs shadow-red-500/50 animate-pulse"></span>
                    ) : (
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-700 opacity-0 group-hover:opacity-100"></span>
                    )}
                  </div>

                  {/* Line Number */}
                  <div className="w-9 shrink-0 text-right pr-3 select-none text-slate-600 group-hover:text-slate-400">
                    {lineNum}
                  </div>

                  {/* Active Indicator Arrow */}
                  <div className="w-5 shrink-0 flex items-center justify-center">
                    {isActive ? (
                      <span className="text-emerald-400 font-bold text-xs animate-pulse">▶</span>
                    ) : stepIndices && stepIndices.length > 0 ? (
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-600/60" title={`มี ${stepIndices.length} ขั้นตอนบนบรรทัดนี้`}></span>
                    ) : null}
                  </div>

                  {/* Code Line Content */}
                  <div className="flex-1 pr-4 whitespace-pre font-mono">
                    {renderHighlightedLine(lineText)}
                  </div>

                  {/* Step Badge (if multiple steps on this line) */}
                  {stepIndices && stepIndices.length > 0 && (
                    <div className="shrink-0 pr-3 flex items-center">
                      <span className="text-[10px] px-1.5 py-0.2 rounded-sm bg-slate-800 text-slate-400 group-hover:text-slate-300">
                        {stepIndices.length > 1 ? `${stepIndices.length} steps` : `step ${stepIndices[0]}`}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="px-3 py-1.5 bg-slate-950/90 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-red-500 inline-block"></span>
            คลิกที่ขอบเพื่อตั้ง Breakpoint ({breakpoints.size} จุด)
          </span>
          <span className="hidden sm:inline text-slate-600">|</span>
          <span className="hidden sm:inline">คลิกที่บรรทัดเพื่อกระโดดไปยังขั้นตอนนี้</span>
        </div>
        <div className="text-slate-500 font-mono">
          {steps.length > 0 ? `Step ${currentStepIndex + 1}/${steps.length}` : 'พร้อมจำลอง'}
        </div>
      </div>
    </div>
  );
};
