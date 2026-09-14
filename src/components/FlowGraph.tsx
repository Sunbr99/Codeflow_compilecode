import React from 'react';
import { ArrowDown, CheckCircle2, CircleDot, PlayCircle, GitBranch, Repeat, Terminal } from 'lucide-react';
import { FlowNode, ExecutionStep } from '../types';

interface FlowGraphProps {
  nodes: FlowNode[];
  currentStep: ExecutionStep | null;
  onJumpToLine: (line: number) => void;
}

export const FlowGraph: React.FC<FlowGraphProps> = ({
  nodes,
  currentStep,
  onJumpToLine,
}) => {
  if (!nodes || nodes.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-xs text-slate-500">
        ไม่พบผังการทำงาน กรุณากดวิเคราะห์สคริปต์
      </div>
    );
  }

  const getNodeIcon = (type: string) => {
    switch (type) {
      case 'start':
        return <PlayCircle className="w-4 h-4 text-blue-600" />;
      case 'condition':
        return <GitBranch className="w-4 h-4 text-purple-600" />;
      case 'loop':
        return <Repeat className="w-4 h-4 text-orange-600" />;
      case 'end':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      default:
        return <CircleDot className="w-4 h-4 text-slate-600" />;
    }
  };

  // Check if this node is currently active
  const isNodeActive = (node: FlowNode, idx: number) => {
    if (!currentStep) return idx === 0;
    if (node.line && currentStep.lineNumber) {
      // Direct line match or proximity
      return Math.abs(node.line - currentStep.lineNumber) <= 3;
    }
    return false;
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
      <div className="max-w-xl mx-auto space-y-2">
        <div className="text-center mb-6">
          <h2 className="text-base font-bold text-slate-900">
            ผังระบบการทำงานของสคริปต์ (Execution Flow Architecture)
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            คลิกที่โหนดเพื่อกระโดดไปยังขั้นตอนและบรรทัดที่เกี่ยวข้องในสคริปต์
          </p>
        </div>

        {nodes.map((node, index) => {
          const active = isNodeActive(node, index);
          const isLast = index === nodes.length - 1;

          return (
            <React.Fragment key={node.id}>
              {/* Flow Node Card */}
              <div
                onClick={() => node.line && onJumpToLine(node.line)}
                className={`relative group p-4 rounded-xl border transition-all cursor-pointer ${
                  active
                    ? 'bg-emerald-50/80 border-emerald-500 shadow-md ring-2 ring-emerald-400/30 scale-[1.02]'
                    : 'bg-slate-50/60 border-slate-200 hover:border-slate-300 hover:bg-white'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                        active
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-white border border-slate-200 text-slate-700'
                      }`}
                    >
                      {getNodeIcon(node.type)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">
                          {node.label}
                        </span>
                        {node.line && (
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-sm bg-slate-200/80 text-slate-700">
                            Line {node.line}
                          </span>
                        )}
                        {active && (
                          <span className="text-[10px] uppercase font-bold px-1.5 py-0.2 rounded-full bg-emerald-600 text-white animate-pulse">
                            กำลังทำงาน
                          </span>
                        )}
                      </div>
                      {node.description && (
                        <p className="text-xs text-slate-600 mt-1">
                          {node.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <span className="text-[11px] font-mono text-slate-400 uppercase">
                    {node.type}
                  </span>
                </div>
              </div>

              {/* Connecting Line / Arrow */}
              {!isLast && (
                <div className="flex justify-center py-1">
                  <div className="flex flex-col items-center">
                    <div className="w-0.5 h-3 bg-slate-300"></div>
                    <ArrowDown className="w-3.5 h-3.5 text-slate-400 -my-1" />
                    <div className="w-0.5 h-2 bg-slate-300"></div>
                  </div>
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
