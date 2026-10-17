import React, { useState } from 'react';
import {
  Timer,
  Cpu,
  HardDrive,
  BarChart3,
  TrendingUp,
  Activity,
  Zap,
  ChevronDown,
  ChevronUp,
  X,
  Gauge
} from 'lucide-react';
import { ExecutionStep } from '../types';

interface PerformanceMonitorOverlayProps {
  steps: ExecutionStep[];
  currentStepIndex: number;
  onSelectStep?: (index: number) => void;
  isOpen: boolean;
  onToggleOpen: () => void;
}

export const PerformanceMonitorOverlay: React.FC<PerformanceMonitorOverlayProps> = ({
  steps,
  currentStepIndex,
  onSelectStep,
  isOpen,
  onToggleOpen,
}) => {
  const [viewMode, setViewMode] = useState<'current' | 'all'>('current');
  const currentStep = steps[currentStepIndex] || null;

  if (steps.length === 0) return null;

  // Calculate aggregate metrics
  const totalExecutionTime = steps.reduce((sum, s) => sum + (s.executionTimeMs || 0), 0);
  const maxMemoryFootprint = steps.reduce((max, s) => Math.max(max, s.memoryFootprintKb || 0), 0);
  const minMemoryFootprint = steps.reduce(
    (min, s) => Math.min(min, s.memoryFootprintKb || 9999),
    steps[0]?.memoryFootprintKb || 0
  );
  const avgExecutionTime = totalExecutionTime / (steps.length || 1);

  // Peak step index
  const peakTimeStep = steps.reduce(
    (prev, curr, idx) => ((curr.executionTimeMs || 0) > (prev.step.executionTimeMs || 0) ? { step: curr, index: idx } : prev),
    { step: steps[0], index: 0 }
  );

  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg text-slate-100 transition-all">
      {/* Top Bar Header */}
      <div className="px-3.5 py-2.5 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
            <Activity className="w-3.5 h-3.5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 font-bold text-slate-100">
              <span>Performance Monitor Overlay</span>
              <span className="px-1.5 py-0.2 text-[10px] uppercase font-mono font-bold bg-cyan-950 text-cyan-400 border border-cyan-700/50 rounded">
                Live Profiler
              </span>
            </div>
          </div>
        </div>

        {/* Aggregate Quick Stats in Header */}
        <div className="hidden sm:flex items-center gap-4 text-[11px] font-mono">
          <div className="flex items-center gap-1 text-slate-300">
            <Timer className="w-3 h-3 text-cyan-400" />
            <span className="text-slate-400">Total:</span>
            <span className="font-bold text-cyan-300">{totalExecutionTime.toFixed(2)} ms</span>
          </div>

          <div className="flex items-center gap-1 text-slate-300">
            <HardDrive className="w-3 h-3 text-emerald-400" />
            <span className="text-slate-400">Peak RAM:</span>
            <span className="font-bold text-emerald-300">{maxMemoryFootprint.toFixed(1)} KB</span>
          </div>

          <div className="flex items-center gap-1 text-slate-300">
            <Cpu className="w-3 h-3 text-amber-400" />
            <span className="text-slate-400">Steps:</span>
            <span className="font-bold text-slate-200">{steps.length}</span>
          </div>
        </div>

        {/* Toggle Button */}
        <button
          id="toggle-perf-monitor-btn"
          type="button"
          onClick={onToggleOpen}
          className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-colors cursor-pointer text-[11px]"
        >
          <span>{isOpen ? 'ซ่อน Overlay' : 'แสดงรายละเอียด'}</span>
          {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Expanded Profiler Details */}
      {isOpen && (
        <div className="p-3.5 space-y-3.5 text-xs bg-slate-900/90">
          {/* Active Step Metrics Highlights */}
          {currentStep && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {/* Metric 1: Step Execution Time */}
              <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <Timer className="w-3 h-3 text-cyan-400" />
                    <span>Step Execution Time</span>
                  </div>
                  <div className="text-base font-bold font-mono text-cyan-300">
                    {(currentStep.executionTimeMs || 0).toFixed(3)}{' '}
                    <span className="text-xs font-normal text-cyan-500">ms</span>
                  </div>
                </div>
                <div className="text-right text-[10px] text-slate-400">
                  <div>Avg: {avgExecutionTime.toFixed(2)} ms</div>
                  <div className="text-cyan-400/80 font-mono">Step #{currentStep.stepIndex}</div>
                </div>
              </div>

              {/* Metric 2: Memory Footprint */}
              <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <HardDrive className="w-3 h-3 text-emerald-400" />
                    <span>Heap / Memory Footprint</span>
                  </div>
                  <div className="text-base font-bold font-mono text-emerald-300">
                    {(currentStep.memoryFootprintKb || 0).toFixed(2)}{' '}
                    <span className="text-xs font-normal text-emerald-500">KB</span>
                  </div>
                </div>
                <div className="text-right text-[10px] text-slate-400">
                  <div>Max: {maxMemoryFootprint.toFixed(1)} KB</div>
                  <div className="text-emerald-400/80 font-mono">
                    {currentStep.stateMutations?.length || 0} mutation(s)
                  </div>
                </div>
              </div>

              {/* Metric 3: Instruction & Opcode Complexity */}
              <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <Zap className="w-3 h-3 text-amber-400" />
                    <span>Opcode Cost / Type</span>
                  </div>
                  <div className="text-base font-bold font-mono text-amber-300 capitalize">
                    {currentStep.stepType}
                  </div>
                </div>
                <div className="text-right text-[10px] text-slate-400">
                  <div>Line #{currentStep.lineNumber}</div>
                  <div className="text-amber-400/80 font-mono">
                    {((currentStep.executionTimeMs || 0) / (totalExecutionTime || 1) * 100).toFixed(1)}% of total
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Sparkline / Bar Graph Timeline of all steps */}
          <div className="space-y-1.5 p-3 rounded-xl bg-slate-950/90 border border-slate-800">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                <BarChart3 className="w-3.5 h-3.5 text-cyan-400" />
                <span>Execution Time & Memory Heatmap per Step</span>
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setViewMode(viewMode === 'current' ? 'all' : 'current')}
                  className="text-[10px] text-cyan-400 hover:text-cyan-300 underline cursor-pointer"
                >
                  {viewMode === 'current' ? 'แสดงตารางทุกขั้นตอน' : 'ย่อมุมมอง'}
                </button>
              </div>
            </div>

            {/* Interactive Step Bars */}
            <div className="pt-2">
              <div className="flex items-end gap-1 h-14 w-full overflow-x-auto pb-1">
                {steps.map((step, idx) => {
                  const isCurrent = idx === currentStepIndex;
                  const timeMs = step.executionTimeMs || 0.1;
                  const heightPercent = Math.min(100, Math.max(15, (timeMs / (peakTimeStep.step.executionTimeMs || 1)) * 100));

                  return (
                    <div
                      key={idx}
                      onClick={() => onSelectStep && onSelectStep(idx)}
                      title={`Step #${step.stepIndex} (บรรทัด ${step.lineNumber}): ${timeMs.toFixed(2)} ms | ${(step.memoryFootprintKb || 0).toFixed(1)} KB`}
                      className={`group relative flex-1 min-w-[14px] max-w-[28px] rounded-t flex flex-col justify-end items-center cursor-pointer transition-all ${
                        isCurrent ? 'bg-cyan-400 ring-2 ring-cyan-300/80' : 'bg-slate-700 hover:bg-slate-600'
                      }`}
                      style={{ height: `${heightPercent}%` }}
                    >
                      {isCurrent && (
                        <div className="absolute -top-4 w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-1 border-t border-slate-800/80">
                <span>Step #1</span>
                <span className="text-cyan-400">
                  Current Step: #{currentStep?.stepIndex || 1} (บรรทัด {currentStep?.lineNumber || 0})
                </span>
                <span>Step #{steps.length}</span>
              </div>
            </div>
          </div>

          {/* Full Breakdown Table (Toggleable) */}
          {viewMode === 'all' && (
            <div className="max-h-48 overflow-y-auto rounded-xl border border-slate-800 bg-slate-950/60 divide-y divide-slate-800/60 text-[11px] font-mono">
              <div className="grid grid-cols-5 p-2 bg-slate-900 font-bold text-slate-400 sticky top-0">
                <span>Step #</span>
                <span>Line</span>
                <span>Type</span>
                <span>Exec Time</span>
                <span>Memory</span>
              </div>
              {steps.map((st, idx) => (
                <div
                  key={idx}
                  onClick={() => onSelectStep && onSelectStep(idx)}
                  className={`grid grid-cols-5 p-2 transition-colors cursor-pointer ${
                    idx === currentStepIndex
                      ? 'bg-cyan-950/60 text-cyan-300 font-bold'
                      : 'hover:bg-slate-800/50 text-slate-300'
                  }`}
                >
                  <span>#{st.stepIndex}</span>
                  <span>L{st.lineNumber}</span>
                  <span className="capitalize">{st.stepType}</span>
                  <span className="text-cyan-400">{(st.executionTimeMs || 0).toFixed(3)} ms</span>
                  <span className="text-emerald-400">{(st.memoryFootprintKb || 0).toFixed(1)} KB</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
