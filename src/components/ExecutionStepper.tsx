import React, { useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  FastForward,
  Sparkles,
  ArrowRight,
  HelpCircle,
  Activity,
  Cpu,
  RefreshCw,
} from 'lucide-react';
import { ExecutionStep, StepType } from '../types';

interface ExecutionStepperProps {
  steps: ExecutionStep[];
  currentStepIndex: number;
  onStepChange: (index: number) => void;
  breakpoints: Set<number>;
}

export const ExecutionStepper: React.FC<ExecutionStepperProps> = ({
  steps,
  currentStepIndex,
  onStepChange,
  breakpoints,
}) => {
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [playbackSpeed, setPlaybackSpeed] = React.useState<number>(1); // 1x
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const currentStep = steps[currentStepIndex] || null;
  const totalSteps = steps.length;

  const currentStepRef = useRef(currentStepIndex);
  currentStepRef.current = currentStepIndex;

  const stepsRef = useRef(steps);
  stepsRef.current = steps;

  const breakpointsRef = useRef(breakpoints);
  breakpointsRef.current = breakpoints;

  // Auto-play timer
  useEffect(() => {
    if (isPlaying) {
      const intervalMs = Math.max(250, 1200 / playbackSpeed);
      timerRef.current = setInterval(() => {
        const cur = currentStepRef.current;
        const stps = stepsRef.current;
        const brks = breakpointsRef.current;

        if (cur >= stps.length - 1) {
          setIsPlaying(false);
          return;
        }
        const nextIndex = cur + 1;
        onStepChange(nextIndex);

        const nextStep = stps[nextIndex];
        if (nextStep && brks.has(nextStep.lineNumber)) {
          setIsPlaying(false);
        }
        if (nextIndex >= stps.length - 1) {
          setIsPlaying(false);
        }
      }, intervalMs);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, playbackSpeed, onStepChange]);

  const handleTogglePlay = () => {
    if (currentStepIndex >= totalSteps - 1) {
      onStepChange(0);
      setIsPlaying(true);
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const handleNextBreakpoint = () => {
    if (totalSteps === 0) return;
    for (let i = currentStepIndex + 1; i < totalSteps; i++) {
      if (breakpoints.has(steps[i].lineNumber)) {
        onStepChange(i);
        return;
      }
    }
    // If no breakpoint found ahead, go to last
    onStepChange(totalSteps - 1);
  };

  const getStepTypeBadge = (type: StepType) => {
    switch (type) {
      case 'variable':
        return { label: 'ตัวแปร (Variable)', color: 'bg-blue-50 text-blue-700 border-blue-200' };
      case 'decode':
        return { label: 'ถอดรหัส (Deobfuscate)', color: 'bg-purple-50 text-purple-700 border-purple-200' };
      case 'flow':
        return { label: 'ควบคุมคำสั่ง (Control Flow)', color: 'bg-amber-50 text-amber-700 border-amber-200' };
      case 'loop':
        return { label: 'วนซ้ำ (Loop Iteration)', color: 'bg-orange-50 text-orange-700 border-orange-200' };
      case 'call':
        return { label: 'เรียกฟังก์ชัน (Call)', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
      case 'io':
        return { label: 'อินพุต/เอาต์พุต (Console I/O)', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      case 'return':
        return { label: 'คืนค่า (Return)', color: 'bg-rose-50 text-rose-700 border-rose-200' };
      default:
        return { label: 'สเตท (State Transition)', color: 'bg-slate-100 text-slate-700 border-slate-200' };
    }
  };

  if (totalSteps === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-6 text-center shadow-xs">
        <Cpu className="w-8 h-8 text-slate-400 mx-auto mb-2 animate-pulse" />
        <h3 className="text-sm font-semibold text-slate-800">ยังไม่ได้เริ่มการจำลองขั้นตอน</h3>
        <p className="text-xs text-slate-500 mt-1">
          กดปุ่ม &quot;วิเคราะห์ & จำลองการทำงาน&quot; ด้านบนเพื่อแตกขั้นตอนการทำงานทีละบรรทัด
        </p>
      </div>
    );
  }

  const badge = currentStep ? getStepTypeBadge(currentStep.stepType) : null;

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden flex flex-col">
      {/* VCR Player Controls Bar */}
      <div className="px-4 py-3 bg-slate-50/80 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
        {/* Playback Buttons */}
        <div className="flex items-center gap-1">
          {/* Reset */}
          <button
            id="vcr-reset-btn"
            type="button"
            onClick={() => {
              setIsPlaying(false);
              onStepChange(0);
            }}
            className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 transition-colors"
            title="รีเซ็ตกลับไปขั้นตอนแรก"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Step Back */}
          <button
            id="vcr-step-back-btn"
            type="button"
            disabled={currentStepIndex <= 0}
            onClick={() => {
              setIsPlaying(false);
              onStepChange(Math.max(0, currentStepIndex - 1));
            }}
            className="p-1.5 rounded-lg text-slate-700 hover:text-slate-900 hover:bg-slate-200/70 disabled:opacity-30 disabled:pointer-events-none transition-colors"
            title="ย้อนกลับ 1 ขั้นตอน"
          >
            <SkipBack className="w-4 h-4" />
          </button>

          {/* Play/Pause */}
          <button
            id="vcr-play-pause-btn"
            type="button"
            onClick={handleTogglePlay}
            className={`px-3 py-1.5 rounded-lg font-medium text-xs flex items-center gap-1.5 text-white transition-all shadow-xs ${
              isPlaying
                ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/20'
                : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'
            }`}
            title={isPlaying ? 'หยุดชั่วคราว' : 'เล่นต่อเนื่องอัตโนมัติ'}
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-current" />
                <span>หยุด</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>เล่นจำลอง</span>
              </>
            )}
          </button>

          {/* Step Next */}
          <button
            id="vcr-step-forward-btn"
            type="button"
            disabled={currentStepIndex >= totalSteps - 1}
            onClick={() => {
              setIsPlaying(false);
              onStepChange(Math.min(totalSteps - 1, currentStepIndex + 1));
            }}
            className="p-1.5 rounded-lg text-slate-700 hover:text-slate-900 hover:bg-slate-200/70 disabled:opacity-30 disabled:pointer-events-none transition-colors"
            title="ข้ามไป 1 ขั้นตอนข้างหน้า"
          >
            <SkipForward className="w-4 h-4" />
          </button>

          {/* Run to Next Breakpoint */}
          <button
            id="vcr-run-breakpoint-btn"
            type="button"
            onClick={handleNextBreakpoint}
            className="p-1.5 rounded-lg text-slate-700 hover:text-slate-900 hover:bg-slate-200/70 transition-colors"
            title="ข้ามไปยัง Breakpoint ถัดไป"
          >
            <FastForward className="w-4 h-4" />
          </button>
        </div>

        {/* Timeline Slider / Scrubber */}
        <div className="flex-1 min-w-[160px] max-w-sm flex items-center gap-2">
          <input
            id="execution-timeline-slider"
            type="range"
            min={0}
            max={totalSteps - 1}
            value={currentStepIndex}
            onChange={(e) => {
              setIsPlaying(false);
              onStepChange(parseInt(e.target.value, 10));
            }}
            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
          />
        </div>

        {/* Speed & Counter */}
        <div className="flex items-center gap-2">
          {/* Speed selector */}
          <div className="flex items-center rounded-lg border border-slate-200 bg-white p-0.5 text-[11px] font-medium text-slate-600">
            {[0.5, 1, 2, 4].map((speed) => (
              <button
                key={speed}
                type="button"
                onClick={() => setPlaybackSpeed(speed)}
                className={`px-1.5 py-0.5 rounded-md transition-colors ${
                  playbackSpeed === speed
                    ? 'bg-slate-900 text-white shadow-2xs font-semibold'
                    : 'hover:text-slate-900'
                }`}
              >
                {speed}x
              </button>
            ))}
          </div>

          {/* Step Count Badge */}
          <div className="px-2.5 py-1 rounded-lg bg-slate-900 text-slate-100 font-mono text-xs font-semibold">
            {currentStepIndex + 1} / {totalSteps}
          </div>
        </div>
      </div>

      {/* Active Step Content Card */}
      {currentStep && (
        <div className="p-4 space-y-3.5">
          {/* Top Line & Title */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 font-mono text-xs font-bold border border-slate-200">
                บรรทัดที่ {currentStep.lineNumber}
              </span>
              {badge && (
                <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${badge.color}`}>
                  {badge.label}
                </span>
              )}
            </div>
            <span className="text-xs text-slate-500 font-mono">
              Step #{currentStep.stepIndex}
            </span>
          </div>

          {/* Action Title */}
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              {currentStep.actionTitle}
            </h2>
          </div>

          {/* Code Snippet Box */}
          <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-emerald-400 font-mono text-xs overflow-x-auto">
            <span className="text-slate-500 mr-2 select-none">$</span>
            <span className="font-semibold text-slate-100">{currentStep.codeSnippet}</span>
          </div>

          {/* Thai Explanation */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs leading-relaxed text-slate-800">
            <div className="flex items-start gap-2">
              <Activity className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-900 block mb-1">กลไกการทำงานระดับระบบ:</span>
                <p>{currentStep.thaiExplanation}</p>
              </div>
            </div>
          </div>

          {/* State Mutations (Variable changes in this step) */}
          {currentStep.stateMutations && currentStep.stateMutations.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                การเปลี่ยนแปลงค่าใน Memory (State Mutations):
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {currentStep.stateMutations.map((mutation, idx) => (
                  <div
                    key={idx}
                    className="p-2 rounded-lg bg-emerald-50/70 border border-emerald-200 text-xs flex items-center justify-between gap-2"
                  >
                    <div className="font-mono font-bold text-slate-800 truncate">
                      {mutation.variable}
                    </div>
                    <div className="flex items-center gap-1.5 font-mono text-[11px] shrink-0">
                      {mutation.oldValue !== undefined && (
                        <>
                          <span className="text-slate-500 line-through truncate max-w-[80px]">
                            {mutation.oldValue}
                          </span>
                          <ArrowRight className="w-3 h-3 text-slate-400" />
                        </>
                      )}
                      <span className="text-emerald-700 font-bold bg-white px-1.5 py-0.5 rounded-sm shadow-2xs border border-emerald-300 truncate max-w-[120px]">
                        {mutation.newValue}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reverse-Engineering Insight Box */}
          {currentStep.reverseTip && (
            <div className="p-3 rounded-lg bg-purple-50/70 border border-purple-200 text-xs text-purple-950 flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-purple-900 block mb-0.5">
                  เทคนิคการแกะโค้ด (Reverse-Engineering Insight):
                </span>
                <p className="text-purple-800 leading-normal">{currentStep.reverseTip}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
