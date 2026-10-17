import React, { useState, useMemo } from 'react';
import {
  Copy,
  Check,
  Download,
  Sparkles,
  Columns,
  List,
  Filter,
  Search,
  FileCode,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Eye,
  Info,
} from 'lucide-react';
import { computeCodeDiff, AlignedDiffRow, UnifiedDiffLine, DiffStats } from '../utils/diffEngine';
import { SyntaxHighlightedLine } from '../utils/syntaxHighlighter';

interface DecompiledDiffViewProps {
  originalCode: string;
  decompiledCode: string;
  decompiledExplanation?: string;
  targetLanguage: string;
  sourceLanguage: string;
  obfuscationPatterns?: string[];
}

export const DecompiledDiffView: React.FC<DecompiledDiffViewProps> = ({
  originalCode,
  decompiledCode,
  decompiledExplanation,
  targetLanguage,
  sourceLanguage,
  obfuscationPatterns = [],
}) => {
  const [viewMode, setViewMode] = useState<'split' | 'unified'>('split');
  const [filterChangedOnly, setFilterChangedOnly] = useState<boolean>(false);
  const [highlightWords, setHighlightWords] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [copiedOriginal, setCopiedOriginal] = useState(false);
  const [copiedDecompiled, setCopiedDecompiled] = useState(false);
  const [copiedPatch, setCopiedPatch] = useState(false);

  // Compute Diff model
  const { alignedRows, unifiedLines, stats } = useMemo(() => {
    return computeCodeDiff(originalCode || '', decompiledCode || '');
  }, [originalCode, decompiledCode]);

  // Filter aligned rows for split view
  const filteredAlignedRows = useMemo(() => {
    return alignedRows.filter((row) => {
      if (filterChangedOnly && row.type === 'unchanged') {
        return false;
      }
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const origMatches = row.origText?.toLowerCase().includes(query);
        const decMatches = row.decText?.toLowerCase().includes(query);
        return origMatches || decMatches;
      }
      return true;
    });
  }, [alignedRows, filterChangedOnly, searchQuery]);

  // Filter unified lines
  const filteredUnifiedLines = useMemo(() => {
    return unifiedLines.filter((line) => {
      if (filterChangedOnly && line.type === 'unchanged') {
        return false;
      }
      if (searchQuery.trim()) {
        return line.text.toLowerCase().includes(searchQuery.toLowerCase());
      }
      return true;
    });
  }, [unifiedLines, filterChangedOnly, searchQuery]);

  const handleCopyOriginal = () => {
    navigator.clipboard.writeText(originalCode);
    setCopiedOriginal(true);
    setTimeout(() => setCopiedOriginal(false), 1500);
  };

  const handleCopyDecompiled = () => {
    navigator.clipboard.writeText(decompiledCode);
    setCopiedDecompiled(true);
    setTimeout(() => setCopiedDecompiled(false), 1500);
  };

  const handleCopyPatch = () => {
    const patchHeader = `--- original.${sourceLanguage}\n+++ decompiled.${targetLanguage}\n`;
    const patchBody = unifiedLines
      .map((l) => `${l.prefix} ${l.text}`)
      .join('\n');
    navigator.clipboard.writeText(patchHeader + patchBody);
    setCopiedPatch(true);
    setTimeout(() => setCopiedPatch(false), 1500);
  };

  const handleDownload = () => {
    const extensions: Record<string, string> = {
      python: 'py',
      javascript: 'js',
      typescript: 'ts',
      go: 'go',
      'clean-pseudocode': 'txt',
      c: 'c',
      php: 'php',
    };
    const ext = extensions[targetLanguage] || 'txt';
    const blob = new Blob([decompiledCode], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `decompiled_${sourceLanguage}_to_${targetLanguage}.${ext}`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadPatch = () => {
    const patchHeader = `--- a/source.${sourceLanguage}\n+++ b/target.${targetLanguage}\n`;
    const patchBody = unifiedLines
      .map((l) => `${l.prefix} ${l.text}`)
      .join('\n');
    const blob = new Blob([patchHeader + patchBody], { type: 'text/x-diff;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `code_changes.diff`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden flex flex-col space-y-4 p-4">
      {/* Overview Banner */}
      <div className="p-4 rounded-xl bg-slate-900 text-white flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center flex-wrap gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-bold text-slate-100">
              การแกะโค้ดและเปรียบเทียบความแตกต่าง (Decompiled Diff & Syntax Inspection)
            </span>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
              {sourceLanguage} ➔ {targetLanguage.toUpperCase()}
            </span>
          </div>
          <p className="text-xs text-slate-300">
            ระบบตรวจสอบการเปลี่ยนแปลงเชิงลึก (Syntax-Aware Diff) พร้อมไฮไลต์แยกสีตามสถานะบรรทัดที่ถูกปรับเปลี่ยน (Modified), เพิ่มใหม่ (Added), และกำจัดความซับซ้อน (Cleaned/Removed)
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2 shrink-0">
          <button
            type="button"
            onClick={handleCopyPatch}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
            title="คัดลอกไฟล์ Unified Diff Patch (.diff)"
          >
            {copiedPatch ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
            <span>{copiedPatch ? 'คัดลอก Patch แล้ว' : 'คัดลอก .diff'}</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadPatch}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
            title="ดาวน์โหลดไฟล์ .diff patch"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>โหลด .diff</span>
          </button>

          <button
            type="button"
            onClick={handleDownload}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>ดาวน์โหลดสคริปต์ผลลัพธ์</span>
          </button>
        </div>
      </div>

      {/* Diff Metrics & Statistics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
          <span className="text-[11px] text-slate-400">บรรทัดต้นฉบับ</span>
          <span className="text-base font-bold font-mono text-slate-200">
            {stats.totalOrigLines} <span className="text-[10px] font-normal text-slate-400">lines</span>
          </span>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
          <span className="text-[11px] text-slate-400">บรรทัดที่แกะแล้ว</span>
          <span className="text-base font-bold font-mono text-slate-200">
            {stats.totalDecLines} <span className="text-[10px] font-normal text-slate-400">lines</span>
          </span>
        </div>

        <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-800/60 flex flex-col justify-between">
          <span className="text-[11px] text-amber-300 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span> บรรทัดแก้ไข (Modified)
          </span>
          <span className="text-base font-bold font-mono text-amber-300">
            ~{stats.modifiedLines} <span className="text-[10px] font-normal text-amber-400/80">lines</span>
          </span>
        </div>

        <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-800/60 flex flex-col justify-between">
          <span className="text-[11px] text-emerald-300 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span> บรรทัดเพิ่มใหม่ (Added)
          </span>
          <span className="text-base font-bold font-mono text-emerald-300">
            +{stats.addedLines} <span className="text-[10px] font-normal text-emerald-400/80">lines</span>
          </span>
        </div>

        <div className="p-2.5 rounded-xl bg-rose-950/40 border border-rose-800/60 flex flex-col justify-between">
          <span className="text-[11px] text-rose-300 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-rose-400"></span> คลี่คลาย/ตัดทิ้ง (Cleaned)
          </span>
          <span className="text-base font-bold font-mono text-rose-300">
            -{stats.removedLines} <span className="text-[10px] font-normal text-rose-400/80">lines</span>
          </span>
        </div>

        <div className="p-2.5 rounded-xl bg-purple-950/40 border border-purple-800/60 flex flex-col justify-between">
          <span className="text-[11px] text-purple-300">อัตราการปรับเปลี่ยน</span>
          <span className="text-base font-bold font-mono text-purple-300">
            {stats.changePercentage}% <span className="text-[10px] font-normal text-purple-400/80">changed</span>
          </span>
        </div>
      </div>

      {/* Obfuscation Patterns Identified */}
      {obfuscationPatterns.length > 0 && (
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
          <span className="font-bold text-slate-800 block mb-1">
            เทคนิคการอำพรางที่ตรวจพบในโค้ดต้นฉบับและคลี่คลายเรียบร้อย:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {obfuscationPatterns.map((pat, idx) => (
              <span
                key={idx}
                className="px-2.5 py-0.5 rounded-md bg-white border border-slate-300 text-slate-700 font-mono text-[11px] shadow-2xs"
              >
                ✓ {pat}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Interactive Controls & Legend Toolbar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-col lg:flex-row lg:items-center justify-between gap-3 text-xs">
        {/* Left: View Mode Buttons */}
        <div className="flex items-center flex-wrap gap-2">
          <div className="inline-flex rounded-lg bg-slate-950 p-1 border border-slate-800">
            <button
              type="button"
              onClick={() => setViewMode('split')}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                viewMode === 'split'
                  ? 'bg-slate-800 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
              <span>เปรียบเทียบซ้าย-ขวา (Side-by-Side)</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('unified')}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                viewMode === 'unified'
                  ? 'bg-slate-800 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>เรียงต่อเนื่อง (Unified Diff)</span>
            </button>
          </div>

          {/* Filter Changed Only */}
          <button
            type="button"
            onClick={() => setFilterChangedOnly(!filterChangedOnly)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
              filterChangedOnly
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>{filterChangedOnly ? 'แสดงเฉพาะบรรทัดที่เปลี่ยน' : 'แสดงทุกบรรทัด'}</span>
          </button>

          {/* Toggle Word Highlights */}
          <button
            type="button"
            onClick={() => setHighlightWords(!highlightWords)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
              highlightWords
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>ไฮไลต์คำที่เปลี่ยน (Word Diff): {highlightWords ? 'เปิด' : 'ปิด'}</span>
          </button>
        </div>

        {/* Right: Search + Legend */}
        <div className="flex items-center flex-wrap gap-3">
          {/* Quick Search */}
          <div className="relative flex items-center">
            <Search className="w-3.5 h-3.5 absolute left-2.5 text-slate-500 pointer-events-none" />
            <input
              type="text"
              placeholder="ค้นหาใน Diff..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-950 text-slate-200 placeholder:text-slate-500 text-xs pl-8 pr-3 py-1.5 rounded-lg border border-slate-800 focus:outline-none focus:border-slate-600 w-40 sm:w-52"
            />
          </div>

          {/* Visual Legend */}
          <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
            <span className="flex items-center gap-1 text-amber-300">
              <span className="w-2 h-2 rounded-xs bg-amber-500"></span> ~ แก้ไข
            </span>
            <span className="flex items-center gap-1 text-emerald-300">
              <span className="w-2 h-2 rounded-xs bg-emerald-500"></span> + เพิ่ม
            </span>
            <span className="flex items-center gap-1 text-rose-300">
              <span className="w-2 h-2 rounded-xs bg-rose-500"></span> - ตัดทิ้ง
            </span>
          </div>
        </div>
      </div>

      {/* Main Diff Code Display */}
      {viewMode === 'split' ? (
        /* Side-by-Side (Split) View */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {/* Left: Original Code */}
          <div className="flex flex-col rounded-xl border border-slate-800 bg-slate-950 overflow-hidden text-xs shadow-md">
            <div className="px-3.5 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-slate-300">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 inline-block"></span>
                <span className="font-semibold text-slate-200">
                  1. โค้ดต้นฉบับ ({sourceLanguage})
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                  Original Source
                </span>
              </div>
              <button
                type="button"
                onClick={handleCopyOriginal}
                className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
                title="คัดลอกโค้ดต้นฉบับ"
              >
                {copiedOriginal ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            <div className="overflow-auto max-h-[580px] font-mono text-[11px] divide-y divide-slate-900">
              {filteredAlignedRows.length === 0 ? (
                <div className="p-8 text-center text-slate-500 italic">
                  ไม่มีรายการที่ตรงกับเงื่อนไขการค้นหา
                </div>
              ) : (
                filteredAlignedRows.map((row) => {
                  const isModified = row.type === 'modified';
                  const isRemoved = row.type === 'removed';
                  const isAddedOnOtherSide = row.type === 'added';

                  // Row background and border colors based on change status
                  let rowBg = 'hover:bg-slate-900/60';
                  let borderClass = 'border-l-4 border-transparent';
                  let gutterColor = 'text-slate-600';
                  let badge = <span className="w-3.5 inline-block text-slate-700">&nbsp;</span>;

                  if (isModified) {
                    rowBg = 'bg-amber-950/25 hover:bg-amber-950/40';
                    borderClass = 'border-l-4 border-amber-500';
                    gutterColor = 'text-amber-400 font-semibold bg-amber-950/50';
                    badge = (
                      <span
                        className="text-[10px] font-bold text-amber-300 font-mono"
                        title="บรรทัดนี้ถูกแปลงตรรกะในผลลัพธ์ (Modified)"
                      >
                        ~
                      </span>
                    );
                  } else if (isRemoved) {
                    rowBg = 'bg-rose-950/25 hover:bg-rose-950/40';
                    borderClass = 'border-l-4 border-rose-500';
                    gutterColor = 'text-rose-400 font-semibold bg-rose-950/50';
                    badge = (
                      <span
                        className="text-[10px] font-bold text-rose-300 font-mono"
                        title="บรรทัดอำพรางนี้ถูกคลี่คลายหรือตัดทิ้งในผลลัพธ์ (Cleaned/Removed)"
                      >
                        -
                      </span>
                    );
                  } else if (isAddedOnOtherSide) {
                    // Blank placeholder matching the added line on right side
                    return (
                      <div
                        key={row.id}
                        className="flex items-center min-h-[22px] bg-slate-900/40 text-slate-700 select-none px-2 py-0.5"
                      >
                        <span className="w-8 text-right pr-2 text-slate-700 font-mono text-[10px]">·</span>
                        <span className="w-4 text-center text-slate-800 font-mono">·</span>
                        <span className="text-slate-700 italic text-[10px] pl-2 font-mono select-none">
                          // — [ไม่มีในต้นฉบับ / สร้างใหม่ในผลลัพธ์]
                        </span>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={row.id}
                      className={`flex items-start min-h-[22px] px-1 py-0.5 transition-colors ${rowBg} ${borderClass}`}
                    >
                      {/* Line Number Gutter */}
                      <span className={`w-9 text-right pr-2 select-none font-mono text-[10px] shrink-0 pt-0.5 ${gutterColor}`}>
                        {row.origLineNumber ?? ''}
                      </span>

                      {/* Diff Badge */}
                      <span className="w-4 text-center shrink-0 pt-0.5 select-none">
                        {badge}
                      </span>

                      {/* Syntax-Aware Highlighting Content */}
                      <div className="flex-1 overflow-x-auto pl-1 pr-2 whitespace-pre break-all">
                        <SyntaxHighlightedLine
                          text={row.origText || ''}
                          language={sourceLanguage}
                          diffType={row.type}
                          tokens={row.origTokens}
                          highlightChangedWords={highlightWords}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right: Decompiled Clean Code */}
          <div className="flex flex-col rounded-xl border border-emerald-900/60 bg-slate-950 overflow-hidden text-xs shadow-md">
            <div className="px-3.5 py-2.5 bg-emerald-950/80 border-b border-emerald-900/60 flex items-center justify-between text-emerald-300">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block"></span>
                <span className="font-semibold text-emerald-200">
                  2. โค้ดที่แกะและแปลงเป็น {targetLanguage.toUpperCase()} (Clean)
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-900/60 text-emerald-300 border border-emerald-700/60">
                  Decompiled Target
                </span>
              </div>
              <button
                type="button"
                onClick={handleCopyDecompiled}
                className="p-1.5 rounded hover:bg-emerald-900/50 text-emerald-400 hover:text-emerald-200 transition-colors"
                title="คัดลอกโค้ดที่แกะแล้ว"
              >
                {copiedDecompiled ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            <div className="overflow-auto max-h-[580px] font-mono text-[11px] divide-y divide-slate-900 bg-slate-950/90">
              {filteredAlignedRows.length === 0 ? (
                <div className="p-8 text-center text-slate-500 italic">
                  ไม่มีรายการที่ตรงกับเงื่อนไขการค้นหา
                </div>
              ) : (
                filteredAlignedRows.map((row) => {
                  const isModified = row.type === 'modified';
                  const isAdded = row.type === 'added';
                  const isRemovedOnOtherSide = row.type === 'removed';

                  let rowBg = 'hover:bg-slate-900/60';
                  let borderClass = 'border-l-4 border-transparent';
                  let gutterColor = 'text-slate-600';
                  let badge = <span className="w-3.5 inline-block text-slate-700">&nbsp;</span>;

                  if (isModified) {
                    rowBg = 'bg-amber-950/25 hover:bg-amber-950/40';
                    borderClass = 'border-l-4 border-amber-500';
                    gutterColor = 'text-amber-400 font-semibold bg-amber-950/50';
                    badge = (
                      <span
                        className="text-[10px] font-bold text-amber-300 font-mono"
                        title="บรรทัดนี้ได้รับการแกะและแปลงโครงสร้างแล้ว (Modified Cleaned)"
                      >
                        ~
                      </span>
                    );
                  } else if (isAdded) {
                    rowBg = 'bg-emerald-950/25 hover:bg-emerald-950/40';
                    borderClass = 'border-l-4 border-emerald-500';
                    gutterColor = 'text-emerald-400 font-semibold bg-emerald-950/50';
                    badge = (
                      <span
                        className="text-[10px] font-bold text-emerald-300 font-mono"
                        title="บรรทัดโครงสร้างที่สร้างขึ้นใหม่ในภาษาเป้าหมาย (Added)"
                      >
                        +
                      </span>
                    );
                  } else if (isRemovedOnOtherSide) {
                    // Blank placeholder matching the removed line on left side
                    return (
                      <div
                        key={row.id}
                        className="flex items-center min-h-[22px] bg-slate-900/40 text-slate-700 select-none px-2 py-0.5"
                      >
                        <span className="w-8 text-right pr-2 text-slate-700 font-mono text-[10px]">·</span>
                        <span className="w-4 text-center text-slate-800 font-mono">·</span>
                        <span className="text-slate-700 italic text-[10px] pl-2 font-mono select-none">
                          // — [คลี่คลายโค้ดอำพรางเรียบร้อย / ไม่จำเป็นในโค้ดสะอาด]
                        </span>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={row.id}
                      className={`flex items-start min-h-[22px] px-1 py-0.5 transition-colors ${rowBg} ${borderClass}`}
                    >
                      {/* Line Number Gutter */}
                      <span className={`w-9 text-right pr-2 select-none font-mono text-[10px] shrink-0 pt-0.5 ${gutterColor}`}>
                        {row.decLineNumber ?? ''}
                      </span>

                      {/* Diff Badge */}
                      <span className="w-4 text-center shrink-0 pt-0.5 select-none">
                        {badge}
                      </span>

                      {/* Syntax-Aware Highlighting Content */}
                      <div className="flex-1 overflow-x-auto pl-1 pr-2 whitespace-pre break-all">
                        <SyntaxHighlightedLine
                          text={row.decText || ''}
                          language={targetLanguage}
                          diffType={row.type}
                          tokens={row.decTokens}
                          highlightChangedWords={highlightWords}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Unified Inline Diff View */
        <div className="flex flex-col rounded-xl border border-slate-800 bg-slate-950 overflow-hidden text-xs shadow-md">
          <div className="px-3.5 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-slate-300">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-200">
                Unified Timeline Diff ({sourceLanguage} ➔ {targetLanguage})
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                Git-Diff Format
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyPatch}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono transition-colors"
                title="คัดลอก Unified Patch"
              >
                {copiedPatch ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedPatch ? 'Copied' : 'Copy Patch'}</span>
              </button>
            </div>
          </div>

          <div className="overflow-auto max-h-[620px] font-mono text-[11px] divide-y divide-slate-900">
            {filteredUnifiedLines.length === 0 ? (
              <div className="p-8 text-center text-slate-500 italic">
                ไม่มีรายการที่ตรงกับเงื่อนไขการค้นหา
              </div>
            ) : (
              filteredUnifiedLines.map((line) => {
                let rowBg = 'hover:bg-slate-900/60';
                let borderClass = 'border-l-4 border-transparent';
                let prefixColor = 'text-slate-600';
                let lang = targetLanguage;

                if (line.type === 'added') {
                  rowBg = 'bg-emerald-950/30 hover:bg-emerald-950/50';
                  borderClass = 'border-l-4 border-emerald-500';
                  prefixColor = 'text-emerald-400 font-bold';
                  lang = targetLanguage;
                } else if (line.type === 'removed') {
                  rowBg = 'bg-rose-950/30 hover:bg-rose-950/50';
                  borderClass = 'border-l-4 border-rose-500';
                  prefixColor = 'text-rose-400 font-bold';
                  lang = sourceLanguage;
                } else if (line.type === 'modified') {
                  rowBg = 'bg-amber-950/30 hover:bg-amber-950/50';
                  borderClass = 'border-l-4 border-amber-500';
                  prefixColor = 'text-amber-400 font-bold';
                  lang = targetLanguage;
                }

                return (
                  <div
                    key={line.id}
                    className={`flex items-start min-h-[22px] px-1 py-0.5 transition-colors ${rowBg} ${borderClass}`}
                  >
                    {/* Line Numbers: Original & Decompiled */}
                    <span className="w-9 text-right pr-2 select-none font-mono text-[10px] text-slate-600 shrink-0 pt-0.5">
                      {line.origLineNumber ?? ''}
                    </span>
                    <span className="w-9 text-right pr-2 select-none font-mono text-[10px] text-slate-600 shrink-0 pt-0.5">
                      {line.decLineNumber ?? ''}
                    </span>

                    {/* Diff Indicator (+, -, ~, space) */}
                    <span className={`w-5 text-center shrink-0 pt-0.5 select-none font-mono ${prefixColor}`}>
                      {line.prefix}
                    </span>

                    {/* Syntax Highlighted Code */}
                    <div className="flex-1 overflow-x-auto pl-1 pr-2 whitespace-pre break-all">
                      <SyntaxHighlightedLine
                        text={line.text}
                        language={lang}
                        diffType={line.type}
                        tokens={line.tokens}
                        highlightChangedWords={highlightWords}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Explanation Notes */}
      {decompiledExplanation && (
        <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs text-slate-800 leading-relaxed shadow-2xs">
          <div className="flex items-center gap-2 mb-1.5 font-bold text-emerald-900">
            <Info className="w-4 h-4 text-emerald-600" />
            <span>คำอธิบายการคลี่คลายตรรกะโค้ด (Decompilation & Logic Clarification):</span>
          </div>
          <p className="text-slate-700 pl-6 leading-relaxed whitespace-pre-wrap">{decompiledExplanation}</p>
        </div>
      )}
    </div>
  );
};
