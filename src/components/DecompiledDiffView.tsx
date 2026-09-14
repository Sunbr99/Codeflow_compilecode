import React, { useState } from 'react';
import { Copy, Check, Download, FileCode, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

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
  const [copiedOriginal, setCopiedOriginal] = useState(false);
  const [copiedDecompiled, setCopiedDecompiled] = useState(false);

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

  const handleDownload = () => {
    const extensions: Record<string, string> = {
      python: 'py',
      javascript: 'js',
      typescript: 'ts',
      go: 'go',
      'clean-pseudocode': 'txt',
    };
    const ext = extensions[targetLanguage] || 'txt';
    const blob = new Blob([decompiledCode], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `decompiled_script.${ext}`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden flex flex-col space-y-4 p-4">
      {/* Overview Banner */}
      <div className="p-4 rounded-xl bg-slate-900 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-bold text-slate-100">
              การแกะโค้ดและแปลงค่า (Decompilation & Translation)
            </span>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
              {sourceLanguage} ➔ {targetLanguage.toUpperCase()}
            </span>
          </div>
          <p className="text-xs text-slate-300">
            แปลงโครงสร้างโค้ดที่ถูกซ่อน, บิดรูป, หรือถูกคอมไพล์กลับเป็นโค้ดที่สะอาด อ่านง่าย พร้อมระบุชื่อตัวแปรที่ตรงความหมาย
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleDownload}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>ดาวน์โหลดไฟล์ผลลัพธ์</span>
          </button>
        </div>
      </div>

      {/* Obfuscation Patterns Identified */}
      {obfuscationPatterns.length > 0 && (
        <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs">
          <span className="font-bold text-slate-800 block mb-1">
            เทคนิคที่ตรวจพบในโค้ดต้นฉบับและทำการคลี่คลาย:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {obfuscationPatterns.map((pat, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded-md bg-white border border-slate-300 text-slate-700 font-mono text-[11px]"
              >
                ✓ {pat}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Side-by-Side Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left: Original Code */}
        <div className="flex flex-col rounded-xl border border-slate-800 bg-slate-950 overflow-hidden text-xs">
          <div className="px-3 py-2 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-slate-400">
            <span className="font-semibold text-slate-300">
              1. โค้ดต้นฉบับ ({sourceLanguage})
            </span>
            <button
              type="button"
              onClick={handleCopyOriginal}
              className="p-1 text-slate-400 hover:text-slate-200"
              title="คัดลอกโค้ดต้นฉบับ"
            >
              {copiedOriginal ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
          <pre className="p-3 font-mono text-[11px] leading-relaxed text-slate-400 overflow-auto max-h-[460px] whitespace-pre-wrap">
            {originalCode}
          </pre>
        </div>

        {/* Right: Decompiled Clean Code */}
        <div className="flex flex-col rounded-xl border border-emerald-900/60 bg-slate-950 overflow-hidden text-xs shadow-md">
          <div className="px-3 py-2 bg-emerald-950/80 border-b border-emerald-900/60 flex items-center justify-between text-emerald-300">
            <span className="font-semibold text-emerald-200">
              2. โค้ดที่แกะและปรับเป็นภาษา {targetLanguage.toUpperCase()} (Clean)
            </span>
            <button
              type="button"
              onClick={handleCopyDecompiled}
              className="p-1 text-emerald-400 hover:text-emerald-200"
              title="คัดลอกโค้ดที่แกะแล้ว"
            >
              {copiedDecompiled ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
          <pre className="p-3 font-mono text-[11px] leading-relaxed text-emerald-300 overflow-auto max-h-[460px] whitespace-pre-wrap bg-slate-950/90">
            {decompiledCode}
          </pre>
        </div>
      </div>

      {/* Explanation Notes */}
      {decompiledExplanation && (
        <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200 text-xs text-slate-800 leading-relaxed">
          <span className="font-bold text-emerald-900 block mb-1">
            คำอธิบายการคลี่คลายตรรกะโค้ด:
          </span>
          <p>{decompiledExplanation}</p>
        </div>
      )}
    </div>
  );
};
