import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  X, 
  Maximize2, 
  Minimize2, 
  Play, 
  Pause, 
  RotateCcw, 
  SkipBack, 
  SkipForward, 
  Rewind, 
  FastForward,
  Sparkles,
  Code2,
  Workflow,
  Sliders,
  FileCode,
  Terminal,
  Layers,
  ArrowDown,
  CheckCircle2,
  GitBranch,
  Repeat,
  Zap,
  Activity,
  Edit3,
  Check
} from 'lucide-react';

interface VisualAstTimeTravelModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCode?: string;
  initialFilename?: string;
}

interface AstNode {
  id: string;
  type: 'function' | 'varDecl' | 'loop' | 'expr' | 'call' | 'return' | 'branch';
  label: string;
  detail: string;
  lineNumber: number;
  depth: number;
  parentId?: string;
}

interface TimelineSnapshot {
  stepIndex: number;
  lineNumber: number;
  activeAstId: string;
  actionDescription: string;
  variables: Record<string, any>;
  variableChanges?: string[];
  outputLine?: string;
}

interface CodePreset {
  id: string;
  filename: string;
  language: string;
  code: string;
}

const PRESETS: CodePreset[] = [
  {
    id: 'objc-c',
    filename: 'main.m',
    language: 'Objective-C / C',
    code: `// Classic Objective-C / C Hybrid Code
#import <Foundation/Foundation.h>

int main() {
    int counter = 0;

    for (int i = 0; i < 5; i++) {
        counter += i * 2;
        printf("Step %d: Value = %d\\n", i, counter);
    }

    return 0;
}`
  },
  {
    id: 'js-ts',
    filename: 'algorithm.ts',
    language: 'TypeScript',
    code: `// Modern TypeScript State Transformation
function computeMetrics(): number {
    let totalScore = 10;
    const factor = 3;

    for (let step = 1; step <= 4; step++) {
        totalScore = totalScore + (step * factor);
        console.log(\`[Iter \${step}] Score: \${totalScore}\`);
    }

    return totalScore;
}`
  },
  {
    id: 'python',
    filename: 'pipeline.py',
    language: 'Python',
    code: `# Python AST & State Simulation
def process_pipeline():
    accumulator = 1
    multiplier = 2

    for index in range(1, 5):
        accumulator = accumulator * multiplier + index
        print(f"Index {index} -> Acc: {accumulator}")

    return accumulator`
  }
];

export const VisualAstTimeTravelModal: React.FC<VisualAstTimeTravelModalProps> = ({ 
  isOpen, 
  onClose,
  initialCode,
  initialFilename
}) => {
  const [selectedPreset, setSelectedPreset] = useState<string>(initialCode ? 'custom' : 'objc-c');
  const [code, setCode] = useState<string>(initialCode || PRESETS[0].code);
  const [filename, setFilename] = useState<string>(initialFilename || PRESETS[0].filename);
  const [isEditingCustomCode, setIsEditingCustomCode] = useState<boolean>(false);
  const [isMaximized, setIsMaximized] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'editor' | 'ast' | 'both'>('both');

  // If initialCode changes when reopened
  useEffect(() => {
    if (initialCode) {
      setCode(initialCode);
      setSelectedPreset('custom');
      if (initialFilename) setFilename(initialFilename);
      setCurrentStepIndex(0);
      setIsPlaying(false);
    }
  }, [initialCode, initialFilename, isOpen]);

  // Timeline / Time-Travel State
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const playTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Switch preset
  const handleSelectPreset = (presetId: string) => {
    if (presetId === 'custom') {
      setSelectedPreset('custom');
      setIsEditingCustomCode(true);
      return;
    }
    const found = PRESETS.find(p => p.id === presetId);
    if (found) {
      setSelectedPreset(found.id);
      setCode(found.code);
      setFilename(found.filename);
      setIsEditingCustomCode(false);
      setCurrentStepIndex(0);
      setIsPlaying(false);
    }
  };

  // Dynamic AST Parser & Simulation Generator
  const { astNodes, timeline } = useMemo(() => {
    const lines = code.split('\n');
    const nodes: AstNode[] = [];
    const snapshots: TimelineSnapshot[] = [];

    // Check code structure
    const isObjC = selectedPreset === 'objc-c';
    const isPy = selectedPreset === 'python';
    const isTS = selectedPreset === 'js-ts';

    if (isObjC) {
      // main.m AST
      nodes.push({
        id: 'fn-main',
        type: 'function',
        label: '[Function: main()]',
        detail: 'Entry Point with Foundation runtime',
        lineNumber: 4,
        depth: 0
      });
      nodes.push({
        id: 'var-counter',
        type: 'varDecl',
        label: '[VarDecl: counter = 0]',
        detail: 'Stack integer allocation',
        lineNumber: 5,
        depth: 0
      });
      nodes.push({
        id: 'for-loop',
        type: 'loop',
        label: '[For Loop: i < 5]',
        detail: 'Iterative control flow (0..4)',
        lineNumber: 7,
        depth: 0
      });
      nodes.push({
        id: 'expr-counter',
        type: 'expr',
        label: '[Expr: counter += i * 2]',
        detail: 'Arithmetic assignment mutation',
        lineNumber: 8,
        depth: 1,
        parentId: 'for-loop'
      });
      nodes.push({
        id: 'call-printf',
        type: 'call',
        label: '[Call: printf(...)]',
        detail: 'Formatted I/O buffer output',
        lineNumber: 9,
        depth: 1,
        parentId: 'for-loop'
      });
      nodes.push({
        id: 'ret-stmt',
        type: 'return',
        label: '[Return Statement: 0]',
        detail: 'Process exit code 0 (SUCCESS)',
        lineNumber: 12,
        depth: 0
      });

      // Generate simulated execution timeline
      snapshots.push({
        stepIndex: 0,
        lineNumber: 5,
        activeAstId: 'var-counter',
        actionDescription: 'Initialize stack variable counter = 0',
        variables: { counter: 0, i: 0 },
        variableChanges: ['counter = 0']
      });

      let currentCounter = 0;
      let snapIdx = 1;
      for (let i = 0; i < 5; i++) {
        // Loop condition check
        snapshots.push({
          stepIndex: snapIdx++,
          lineNumber: 7,
          activeAstId: 'for-loop',
          actionDescription: `Loop condition verified: i = ${i} (< 5)`,
          variables: { counter: currentCounter, i },
          variableChanges: i > 0 ? [`i = ${i}`] : undefined
        });

        // Loop body expression
        currentCounter += i * 2;
        snapshots.push({
          stepIndex: snapIdx++,
          lineNumber: 8,
          activeAstId: 'expr-counter',
          actionDescription: `Execute counter += ${i} * 2 (new value: ${currentCounter})`,
          variables: { counter: currentCounter, i },
          variableChanges: [`counter = ${currentCounter}`]
        });

        // Printf Call
        snapshots.push({
          stepIndex: snapIdx++,
          lineNumber: 9,
          activeAstId: 'call-printf',
          actionDescription: `Flush stdout: Step ${i}: Value = ${currentCounter}`,
          variables: { counter: currentCounter, i },
          outputLine: `Step ${i}: Value = ${currentCounter}`
        });
      }

      // Return statement
      snapshots.push({
        stepIndex: snapIdx++,
        lineNumber: 12,
        activeAstId: 'ret-stmt',
        actionDescription: 'Process successfully exited with code 0',
        variables: { counter: currentCounter, i: 5, returnValue: 0 }
      });

    } else if (isTS) {
      nodes.push({
        id: 'fn-comp',
        type: 'function',
        label: '[Function: computeMetrics()]',
        detail: 'TypeScript export returning number',
        lineNumber: 2,
        depth: 0
      });
      nodes.push({
        id: 'var-total',
        type: 'varDecl',
        label: '[VarDecl: totalScore = 10, factor = 3]',
        detail: 'Variable initialization',
        lineNumber: 3,
        depth: 0
      });
      nodes.push({
        id: 'for-ts',
        type: 'loop',
        label: '[For Loop: step <= 4]',
        detail: 'Loop through steps 1..4',
        lineNumber: 6,
        depth: 0
      });
      nodes.push({
        id: 'expr-ts',
        type: 'expr',
        label: '[Expr: totalScore += step * factor]',
        detail: 'Compound accumulation',
        lineNumber: 7,
        depth: 1,
        parentId: 'for-ts'
      });
      nodes.push({
        id: 'call-log',
        type: 'call',
        label: '[Call: console.log(...)]',
        detail: 'Console logging stream',
        lineNumber: 8,
        depth: 1,
        parentId: 'for-ts'
      });
      nodes.push({
        id: 'ret-ts',
        type: 'return',
        label: '[Return: totalScore]',
        detail: 'Return final scalar output',
        lineNumber: 11,
        depth: 0
      });

      let score = 10;
      const factor = 3;
      snapshots.push({
        stepIndex: 0,
        lineNumber: 3,
        activeAstId: 'var-total',
        actionDescription: 'Initialize totalScore = 10, factor = 3',
        variables: { totalScore: 10, factor: 3, step: 1 },
        variableChanges: ['totalScore = 10', 'factor = 3']
      });

      let sIdx = 1;
      for (let s = 1; s <= 4; s++) {
        snapshots.push({
          stepIndex: sIdx++,
          lineNumber: 6,
          activeAstId: 'for-ts',
          actionDescription: `Check iteration step = ${s} (<= 4)`,
          variables: { totalScore: score, factor, step: s }
        });
        score = score + (s * factor);
        snapshots.push({
          stepIndex: sIdx++,
          lineNumber: 7,
          activeAstId: 'expr-ts',
          actionDescription: `totalScore updated with step ${s} * factor: ${score}`,
          variables: { totalScore: score, factor, step: s },
          variableChanges: [`totalScore = ${score}`]
        });
        snapshots.push({
          stepIndex: sIdx++,
          lineNumber: 8,
          activeAstId: 'call-log',
          actionDescription: `Logged: [Iter ${s}] Score: ${score}`,
          variables: { totalScore: score, factor, step: s },
          outputLine: `[Iter ${s}] Score: ${score}`
        });
      }
      snapshots.push({
        stepIndex: sIdx++,
        lineNumber: 11,
        activeAstId: 'ret-ts',
        actionDescription: `Function returns computed totalScore: ${score}`,
        variables: { totalScore: score, factor, step: 5, returnValue: score }
      });

    } else if (selectedPreset === 'python') {
      // Python preset
      nodes.push({
        id: 'py-fn',
        type: 'function',
        label: '[Function: process_pipeline()]',
        detail: 'Python function definition',
        lineNumber: 2,
        depth: 0
      });
      nodes.push({
        id: 'py-var',
        type: 'varDecl',
        label: '[VarDecl: accumulator = 1, multiplier = 2]',
        detail: 'Python local frame variables',
        lineNumber: 3,
        depth: 0
      });
      nodes.push({
        id: 'py-loop',
        type: 'loop',
        label: '[For Loop: index in range(1, 5)]',
        detail: 'Iterator over range generator',
        lineNumber: 6,
        depth: 0
      });
      nodes.push({
        id: 'py-expr',
        type: 'expr',
        label: '[Expr: accumulator = acc * mul + idx]',
        detail: 'Binary operator arithmetic',
        lineNumber: 7,
        depth: 1,
        parentId: 'py-loop'
      });
      nodes.push({
        id: 'py-ret',
        type: 'return',
        label: '[Return: accumulator]',
        detail: 'Return accumulator value',
        lineNumber: 10,
        depth: 0
      });

      let acc = 1;
      const mul = 2;
      snapshots.push({
        stepIndex: 0,
        lineNumber: 3,
        activeAstId: 'py-var',
        actionDescription: 'Initialize accumulator = 1, multiplier = 2',
        variables: { accumulator: 1, multiplier: 2, index: 1 },
        variableChanges: ['accumulator = 1', 'multiplier = 2']
      });
      let pIdx = 1;
      for (let idx = 1; idx < 5; idx++) {
        snapshots.push({
          stepIndex: pIdx++,
          lineNumber: 6,
          activeAstId: 'py-loop',
          actionDescription: `Yield iterator index = ${idx}`,
          variables: { accumulator: acc, multiplier: mul, index: idx }
        });
        acc = acc * mul + idx;
        snapshots.push({
          stepIndex: pIdx++,
          lineNumber: 7,
          activeAstId: 'py-expr',
          actionDescription: `Computed accumulator = ${acc}`,
          variables: { accumulator: acc, multiplier: mul, index: idx },
          variableChanges: [`accumulator = ${acc}`],
          outputLine: `Index ${idx} -> Acc: ${acc}`
        });
      }
      snapshots.push({
        stepIndex: pIdx++,
        lineNumber: 10,
        activeAstId: 'py-ret',
        actionDescription: `Return final accumulator: ${acc}`,
        variables: { accumulator: acc, multiplier: mul, index: 5, returnValue: acc }
      });
    } else {
      // Dynamic Arbitrary Custom Code Parser & AST Builder
      let currentVars: Record<string, any> = {};
      let sIdx = 0;

      lines.forEach((lineText, idx) => {
        const lineNum = idx + 1;
        const trimmed = lineText.trim();
        if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('#')) return;

        // Function definition
        if (trimmed.startsWith('def ') || trimmed.startsWith('function ') || /^[a-zA-Z0-9_<>]+\s+[a-zA-Z0-9_]+\(/.test(trimmed)) {
          const fnId = `custom-fn-${lineNum}`;
          nodes.push({
            id: fnId,
            type: 'function',
            label: `[Function]: ${trimmed.slice(0, 32)}`,
            detail: `User declared sub-routine at line ${lineNum}`,
            lineNumber: lineNum,
            depth: 0
          });
          snapshots.push({
            stepIndex: sIdx++,
            lineNumber: lineNum,
            activeAstId: fnId,
            actionDescription: `Enter routine context: ${trimmed.slice(0, 45)}`,
            variables: { ...currentVars }
          });
        }
        // Variable declaration / assignment
        else if (trimmed.includes('=') && !trimmed.startsWith('if') && !trimmed.startsWith('for') && !trimmed.startsWith('while')) {
          const parts = trimmed.split('=');
          const rawVar = parts[0].replace(/(const|let|var|int|float|double|char\*|NSString\*|val)/g, '').trim();
          const cleanVar = rawVar.split(/[\s,\*]+/)[0] || `var_${lineNum}`;
          const rawVal = parts[1]?.replace(';', '').trim() || 'null';
          
          let parsedVal: any = rawVal;
          if (!isNaN(Number(rawVal))) parsedVal = Number(rawVal);
          else if (rawVal === 'true') parsedVal = true;
          else if (rawVal === 'false') parsedVal = false;

          currentVars = { ...currentVars, [cleanVar]: parsedVal };

          const varId = `custom-var-${lineNum}`;
          nodes.push({
            id: varId,
            type: 'varDecl',
            label: `[Assignment]: ${cleanVar} = ${rawVal.slice(0, 20)}`,
            detail: `Assign state in stack frame`,
            lineNumber: lineNum,
            depth: 1
          });
          snapshots.push({
            stepIndex: sIdx++,
            lineNumber: lineNum,
            activeAstId: varId,
            actionDescription: `Evaluate and store ${cleanVar} = ${rawVal.slice(0, 30)}`,
            variables: { ...currentVars },
            variableChanges: [`${cleanVar} = ${rawVal.slice(0, 20)}`]
          });
        }
        // Loop or iteration
        else if (trimmed.startsWith('for') || trimmed.startsWith('while')) {
          const loopId = `custom-loop-${lineNum}`;
          nodes.push({
            id: loopId,
            type: 'loop',
            label: `[Loop]: ${trimmed.slice(0, 28)}`,
            detail: `Iterative flow branch`,
            lineNumber: lineNum,
            depth: 1
          });
          snapshots.push({
            stepIndex: sIdx++,
            lineNumber: lineNum,
            activeAstId: loopId,
            actionDescription: `Test loop boundary condition: ${trimmed.slice(0, 35)}`,
            variables: { ...currentVars }
          });
        }
        // Return or Print
        else if (trimmed.startsWith('return') || trimmed.includes('print') || trimmed.includes('console.log')) {
          const isRet = trimmed.startsWith('return');
          const stmtId = `custom-stmt-${lineNum}`;
          nodes.push({
            id: stmtId,
            type: isRet ? 'return' : 'call',
            label: isRet ? `[Return Statement]` : `[I/O Output Call]`,
            detail: trimmed.slice(0, 35),
            lineNumber: lineNum,
            depth: 1
          });
          snapshots.push({
            stepIndex: sIdx++,
            lineNumber: lineNum,
            activeAstId: stmtId,
            actionDescription: isRet ? `Return computation to caller` : `Write to standard stream`,
            variables: { ...currentVars },
            outputLine: isRet ? undefined : trimmed.slice(0, 35)
          });
        }
      });

      if (nodes.length === 0) {
        nodes.push({
          id: 'custom-root',
          type: 'expr',
          label: '[Code Block]',
          detail: 'Analyzed source stream',
          lineNumber: 1,
          depth: 0
        });
        snapshots.push({
          stepIndex: 0,
          lineNumber: 1,
          activeAstId: 'custom-root',
          actionDescription: 'Ready to trace execution',
          variables: { status: 'parsed' }
        });
      }
    }

    return { astNodes: nodes, timeline: snapshots };
  }, [code, selectedPreset]);

  // Current active snapshot
  const currentSnapshot = timeline[currentStepIndex] || timeline[0] || {
    stepIndex: 0,
    lineNumber: 1,
    activeAstId: '',
    actionDescription: 'Idle',
    variables: {}
  };

  const totalSteps = Math.max(1, timeline.length);

  // Auto-play timer
  useEffect(() => {
    if (isPlaying) {
      playTimerRef.current = setInterval(() => {
        setCurrentStepIndex((prev) => {
          if (prev >= totalSteps - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 900 / playbackSpeed);
    } else {
      if (playTimerRef.current) clearInterval(playTimerRef.current);
    }
    return () => {
      if (playTimerRef.current) clearInterval(playTimerRef.current);
    };
  }, [isPlaying, totalSteps, playbackSpeed]);

  if (!isOpen) return null;

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentStepIndex(Number(e.target.value));
  };

  const handleStepBack = () => {
    setCurrentStepIndex((prev) => Math.max(0, prev - 1));
  };

  const handleStepForward = () => {
    setCurrentStepIndex((prev) => Math.min(totalSteps - 1, prev + 1));
  };

  const handleReset = () => {
    setCurrentStepIndex(0);
    setIsPlaying(false);
  };

  const codeLines = code.split('\n');

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      {/* NeXTSTEP OS Window Container */}
      <div 
        className={`bg-[#181818] border-2 border-slate-600 rounded-lg shadow-2xl w-full ${
          isMaximized ? 'h-[98vh] max-w-[99vw]' : 'max-w-6xl h-[820px]'
        } flex flex-col overflow-hidden text-slate-200 select-none font-sans`}
      >
        {/* Top Retro OS Menu Bar */}
        <div className="bg-[#2c2c2c] border-b border-black px-3 py-1.5 flex items-center justify-between text-xs font-mono select-none">
          <div className="flex items-center gap-4">
            <span className="font-bold text-slate-100 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-amber-400 rounded-xs inline-block"></span>
              NeXTSTEP OS v3.3
            </span>
            <div className="hidden md:flex items-center gap-3 text-slate-300">
              <span className="hover:text-white cursor-pointer px-1.5 py-0.5 hover:bg-slate-700 rounded-xs">File</span>
              <span className="hover:text-white cursor-pointer px-1.5 py-0.5 hover:bg-slate-700 rounded-xs">Edit</span>
              <span className="hover:text-white cursor-pointer px-1.5 py-0.5 hover:bg-slate-700 rounded-xs">View</span>
              <span className="hover:text-white cursor-pointer px-1.5 py-0.5 hover:bg-slate-700 rounded-xs">Build</span>
              <span className="text-emerald-400 font-bold px-1.5 py-0.5 bg-emerald-950/60 rounded-xs border border-emerald-500/30">
                AST Mapper
              </span>
              <span className="text-cyan-400 font-bold px-1.5 py-0.5 bg-cyan-950/60 rounded-xs border border-cyan-500/30">
                Time-Travel
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Presets dropdown */}
            <select
              value={selectedPreset}
              onChange={(e) => handleSelectPreset(e.target.value)}
              className="bg-[#1e1e1e] border border-slate-600 text-slate-200 text-[11px] px-2 py-0.5 rounded-xs font-mono focus:outline-none cursor-pointer"
            >
              <option value="custom">✏️ Custom User Code (Paste / Edit)</option>
              {PRESETS.map((p) => (
                <option key={p.id} value={p.id}>
                  Preset: {p.filename} ({p.language})
                </option>
              ))}
            </select>

            <button
              onClick={() => setIsEditingCustomCode(!isEditingCustomCode)}
              className={`px-2 py-0.5 rounded-xs font-mono text-[11px] flex items-center gap-1 border transition-colors cursor-pointer ${
                isEditingCustomCode 
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' 
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-600'
              }`}
              title="Edit / Paste Your Own Code"
            >
              {isEditingCustomCode ? <Check className="w-3 h-3 text-emerald-400" /> : <Edit3 className="w-3 h-3 text-amber-400" />}
              <span>{isEditingCustomCode ? 'Done Editing' : 'Edit Code'}</span>
            </button>

            <button
              onClick={() => setIsMaximized(!isMaximized)}
              className="p-1 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xs cursor-pointer"
              title="Maximize / Restore"
            >
              {isMaximized ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={onClose}
              className="p-1 hover:bg-rose-900 text-slate-400 hover:text-white rounded-xs cursor-pointer"
              title="Close"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Main Body Split: Left = Code Editor / Right = AST Map & Time-Travel Debugger */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-0 bg-[#121212]">
          
          {/* Left Column: NeXTSTEP Studio Code Editor (7 cols) */}
          <div className="lg:col-span-7 flex flex-col border-r border-slate-800 h-full min-h-0 bg-[#141414]">
            {/* Window Subheader */}
            <div className="bg-[#242424] border-b border-black px-3 py-1.5 flex items-center justify-between font-mono text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-slate-500 rounded-full inline-block"></span>
                <span className="text-slate-100 font-bold">NeXTSTEP Studio: {filename}</span>
              </div>
              <div className="flex items-center gap-3 text-[11px] text-slate-400">
                <span>Active Line: <strong className="text-amber-400">{currentSnapshot.lineNumber}</strong></span>
                <span className="text-slate-600">|</span>
                <span>Encoding: UTF-8</span>
              </div>
            </div>

            {/* Code Lines or Direct Custom Code Editor */}
            {isEditingCustomCode ? (
              <div className="flex-1 flex flex-col p-3 bg-[#131313] min-h-0">
                <div className="flex items-center justify-between pb-2 text-[11px] font-mono text-amber-400">
                  <span>พิมพ์หรือวางโค้ดที่คุณต้องการวิเคราะห์ AST & Time-Travel (รองรับทุกภาษา เช่น Python, TS, JS, C, Java, Go):</span>
                  <button
                    onClick={() => setIsEditingCustomCode(false)}
                    className="px-2 py-0.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[11px] font-mono flex items-center gap-1 cursor-pointer"
                  >
                    <Check className="w-3 h-3" /> ยืนยันโค้ด
                  </button>
                </div>
                <textarea
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value);
                    setSelectedPreset('custom');
                    setCurrentStepIndex(0);
                    setIsPlaying(false);
                  }}
                  placeholder="// Paste or write code here..."
                  className="flex-1 w-full bg-[#181818] border border-slate-700 text-slate-100 font-mono text-xs p-3 rounded focus:outline-none focus:border-amber-400 resize-none leading-relaxed"
                  spellCheck={false}
                />
              </div>
            ) : (
              <div className="flex-1 p-3 overflow-y-auto font-mono text-xs select-text space-y-0.5 bg-[#151515]">
                {codeLines.map((lineText, idx) => {
                  const lineNum = idx + 1;
                  const isActive = lineNum === currentSnapshot.lineNumber;

                  return (
                    <div
                      key={idx}
                      className={`flex items-center group transition-colors rounded-xs px-2 py-0.5 ${
                        isActive 
                          ? 'bg-amber-500/20 border-l-4 border-amber-400 text-amber-200 font-semibold' 
                          : 'hover:bg-slate-800/50 text-slate-300'
                      }`}
                    >
                      {/* Line number */}
                      <span className={`w-8 text-right pr-3 select-none text-[11px] font-mono ${
                        isActive ? 'text-amber-400 font-bold' : 'text-slate-600 group-hover:text-slate-400'
                      }`}>
                        {lineNum}
                      </span>

                      {/* Active execution indicator */}
                      <span className="w-4 select-none mr-1">
                        {isActive ? '▶' : ''}
                      </span>

                      {/* Line content */}
                      <span className="whitespace-pre flex-1">
                        {lineText}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Left Footer: Step Diagnostics Message */}
            <div className="bg-[#1b1b1b] border-t border-slate-800 px-3 py-2 text-[11px] font-mono flex items-center justify-between text-slate-400">
              <div className="flex items-center gap-2 truncate">
                <Terminal className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="text-emerald-300 font-medium truncate">
                  {currentSnapshot.actionDescription}
                </span>
              </div>
              {currentSnapshot.outputLine && (
                <span className="px-2 py-0.5 bg-black text-cyan-300 rounded border border-cyan-500/30 text-[10px] shrink-0">
                  stdout: {currentSnapshot.outputLine}
                </span>
              )}
            </div>
          </div>

          {/* Right Column: Visual AST Map (Top) & Time-Travel Debugger (Bottom) (5 cols) */}
          <div className="lg:col-span-5 flex flex-col h-full min-h-0 bg-[#161616]">
            
            {/* Top Right: Visual AST Structure Map */}
            <div className="flex-1 flex flex-col border-b-2 border-slate-800 min-h-0">
              <div className="bg-[#242424] border-b border-black px-3 py-1.5 flex items-center justify-between font-mono text-xs">
                <div className="flex items-center gap-2">
                  <Workflow className="w-3.5 h-3.5 text-purple-400" />
                  <span className="text-slate-100 font-bold">Visual AST Structure Map</span>
                </div>
                <span className="text-[10px] text-purple-300 bg-purple-950/60 px-1.5 py-0.5 rounded border border-purple-500/30 font-mono">
                  Live AST Graph
                </span>
              </div>

              {/* AST Tree Nodes list */}
              <div className="flex-1 p-3 overflow-y-auto space-y-1.5 font-mono text-xs bg-[#12141a]">
                {astNodes.map((node, index) => {
                  const isActive = node.id === currentSnapshot.activeAstId;
                  const isIndented = node.depth > 0;

                  return (
                    <React.Fragment key={node.id}>
                      {index > 0 && !isIndented && (
                        <div className="flex items-center justify-start pl-4 py-0.5 text-slate-600">
                          <ArrowDown className="w-3.5 h-3.5" />
                        </div>
                      )}

                      <div 
                        onClick={() => {
                          const targetIdx = timeline.findIndex(s => s.activeAstId === node.id);
                          if (targetIdx !== -1) setCurrentStepIndex(targetIdx);
                        }}
                        className={`p-2 rounded border transition-all cursor-pointer select-none ${
                          isIndented ? 'ml-6 border-l-2' : ''
                        } ${
                          isActive 
                            ? 'bg-purple-950/80 border-purple-400 shadow-md ring-1 ring-purple-400/50 text-purple-100 scale-[1.01]' 
                            : 'bg-[#1b1e28] border-slate-700/70 hover:border-slate-500 text-slate-300 hover:bg-[#202534]'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 truncate">
                            {node.type === 'function' && <span className="text-blue-400 font-bold">📄</span>}
                            {node.type === 'varDecl' && <span className="text-cyan-400 font-bold">🔹</span>}
                            {node.type === 'loop' && <span className="text-amber-400 font-bold">🔄</span>}
                            {node.type === 'expr' && <span className="text-emerald-400 font-bold">⚡</span>}
                            {node.type === 'call' && <span className="text-purple-400 font-bold">💬</span>}
                            {node.type === 'return' && <span className="text-rose-400 font-bold">🛑</span>}

                            <span className={`font-mono text-xs ${isActive ? 'font-bold text-white' : ''}`}>
                              {node.label}
                            </span>
                          </div>

                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                            isActive 
                              ? 'bg-purple-600 text-white font-bold animate-pulse' 
                              : 'bg-slate-800 text-slate-400'
                          }`}>
                            Line {node.lineNumber}
                          </span>
                        </div>

                        <div className="text-[10px] text-slate-400 mt-1 truncate pl-5">
                          {node.detail}
                        </div>
                      </div>
                    </React.Fragment>
                  );
                })}
              </div>
            </div>

            {/* Bottom Right: Time-Travel Debugger */}
            <div className="h-[310px] flex flex-col bg-[#14151b] border-t border-black">
              {/* Debugger Header */}
              <div className="bg-[#242424] border-b border-black px-3 py-1.5 flex items-center justify-between font-mono text-xs">
                <div className="flex items-center gap-2">
                  <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="text-slate-100 font-bold">Time-Travel Debugger</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-cyan-400">
                    Step {currentStepIndex} / {totalSteps - 1}
                  </span>
                </div>
              </div>

              {/* Debugger Body Controls */}
              <div className="p-3.5 flex-1 flex flex-col justify-between space-y-3">
                {/* Timeline Header Label */}
                <div className="flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-1.5 text-amber-400 font-bold uppercase tracking-wider text-[11px]">
                    <Rewind className="w-3.5 h-3.5" />
                    <span>REWIND STATE TIMELINE</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={handleReset}
                      className="p-1 text-slate-400 hover:text-white bg-slate-800 rounded-xs transition-colors cursor-pointer"
                      title="Reset to Step 0"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={handleStepBack}
                      className="p-1 text-slate-400 hover:text-white bg-slate-800 rounded-xs transition-colors cursor-pointer"
                      title="Step Backward"
                    >
                      <SkipBack className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setIsPlaying(!isPlaying)}
                      className={`p-1 rounded-xs transition-colors cursor-pointer ${
                        isPlaying ? 'bg-amber-600 text-white' : 'bg-emerald-600 text-white hover:bg-emerald-500'
                      }`}
                      title={isPlaying ? 'Pause' : 'Auto Play'}
                    >
                      {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={handleStepForward}
                      className="p-1 text-slate-400 hover:text-white bg-slate-800 rounded-xs transition-colors cursor-pointer"
                      title="Step Forward"
                    >
                      <SkipForward className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Interactive Time-Travel Slider */}
                <div className="space-y-1">
                  <input
                    type="range"
                    min={0}
                    max={totalSteps - 1}
                    value={currentStepIndex}
                    onChange={handleSliderChange}
                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 focus:outline-none"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>Start (Init)</span>
                    <span className="text-cyan-400 font-bold">● Current Step {currentStepIndex}</span>
                    <span>Finish</span>
                  </div>
                </div>

                {/* Live Variables Display Box (Matching User Screenshot) */}
                <div className="bg-[#0b0d13] border border-cyan-500/40 rounded p-2.5 font-mono text-xs space-y-2">
                  <div className="flex items-center justify-between text-slate-300 pb-1.5 border-b border-slate-800">
                    <span className="text-cyan-300 font-bold">
                      Step {currentStepIndex}/{totalSteps - 1}
                    </span>
                    <div className="flex items-center gap-3">
                      {Object.entries(currentSnapshot.variables).map(([k, v]) => (
                        <span key={k} className="text-slate-300">
                          {k} = <strong className="text-amber-400">{String(v)}</strong>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Variable Changes Diff pill */}
                  <div className="flex items-center gap-2 text-[11px]">
                    <span className="text-slate-500">Mutation:</span>
                    {currentSnapshot.variableChanges && currentSnapshot.variableChanges.length > 0 ? (
                      currentSnapshot.variableChanges.map((change, i) => (
                        <span key={i} className="px-2 py-0.5 bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 rounded text-[10px]">
                          {change}
                        </span>
                      ))
                    ) : (
                      <span className="text-slate-500 italic text-[10px]">No mutations on this instruction</span>
                    )}
                  </div>
                </div>

                {/* Playback Speed selector */}
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-1">
                  <span>Speed:</span>
                  <div className="flex items-center gap-1.5">
                    {[0.5, 1, 2].map((s) => (
                      <button
                        key={s}
                        onClick={() => setPlaybackSpeed(s)}
                        className={`px-2 py-0.5 rounded text-[10px] transition-colors cursor-pointer ${
                          playbackSpeed === s 
                            ? 'bg-cyan-600 text-white font-bold' 
                            : 'bg-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {s}x
                      </button>
                    ))}
                  </div>
                </div>

              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
