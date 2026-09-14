import React, { useState } from 'react';
import { Terminal, Copy, Check, Trash2, ArrowDownCircle } from 'lucide-react';
import { ExecutionStep } from '../types';

interface ConsoleOutputProps {
  steps: ExecutionStep[];
  currentStepIndex: number;
}

export const ConsoleOutput: React.FC<ConsoleOutputProps> = ({
  steps,
  currentStepIndex,
}) => {
  const [copied, setCopied] = useState(false);

  // Collect console outputs emitted from step 0 up to currentStepIndex
  const outputLogs = React.useMemo(() => {
    const logs: { text: string; stepIndex: number; line: number }[] = [];
    for (let i = 0; i <= currentStepIndex && i < steps.length; i++) {
      const step = steps[i];
      if (step.consoleOutput) {
        logs.push({
          text: step.consoleOutput,
          stepIndex: step.stepIndex,
          line: step.lineNumber,
        });
      }
    }
    return logs;
  }, [steps, currentStepIndex]);

  const handleCopy = () => {
    const fullText = outputLogs.map((l) => l.text).join('\n');
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-md flex flex-col h-full font-mono text-xs">
      {/* Console Header */}
      <div className="px-3 py-2 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-slate-400">
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-emerald-400" />
          <span className="font-semibold text-slate-200">คอนโซลจำลอง (Virtual Stdout Console)</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-400 font-sans">
            {outputLogs.length} ข้อความ
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleCopy}
            disabled={outputLogs.length === 0}
            className="p-1 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800 disabled:opacity-30 transition-colors"
            title="คัดลอกข้อความในคอนโซล"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Console Stream Body */}
      <div className="p-3 flex-1 overflow-auto space-y-1.5 min-h-[140px] text-[11px] leading-relaxed">
        {outputLogs.length === 0 ? (
          <div className="py-6 text-center text-slate-600 italic">
            ยังไม่มีคำสั่งพิมพ์ (print / console.log) ทำงานจนถึงขั้นตอนนี้
          </div>
        ) : (
          outputLogs.map((log, idx) => (
            <div key={idx} className="flex items-start gap-2 hover:bg-slate-900/60 p-1 rounded-xs">
              <span className="text-slate-600 select-none shrink-0 font-mono">
                [L{log.line}]
              </span>
              <span className="text-emerald-400 select-none shrink-0">➜</span>
              <span className="text-slate-200 font-mono break-all whitespace-pre-wrap flex-1">
                {log.text}
              </span>
            </div>
          ))
        )}
      </div>

      {/* Terminal Footer */}
      <div className="px-3 py-1 bg-slate-900/60 border-t border-slate-800/80 text-[10px] text-slate-500 flex items-center justify-between">
        <span>จำลองสภาพแวดล้อม Runtime Output Sandbox</span>
        <span className="text-emerald-500">● Live Stream</span>
      </div>
    </div>
  );
};
