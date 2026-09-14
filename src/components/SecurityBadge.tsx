import React from 'react';
import { ShieldCheck, ShieldAlert, AlertTriangle, Bug } from 'lucide-react';
import { SecurityAssessment } from '../types';

interface SecurityBadgeProps {
  security?: SecurityAssessment;
}

export const SecurityBadge: React.FC<SecurityBadgeProps> = ({ security }) => {
  if (!security) return null;

  const getRiskConfig = () => {
    switch (security.riskLevel) {
      case 'malicious':
        return {
          icon: <ShieldAlert className="w-4 h-4 text-rose-600" />,
          title: 'ตรวจพบความเสี่ยงระดับสูง (High Risk / Malicious)',
          bgColor: 'bg-rose-50 border-rose-200 text-rose-900',
        };
      case 'suspicious':
        return {
          icon: <AlertTriangle className="w-4 h-4 text-amber-600" />,
          title: 'ตรวจพบพฤติกรรมน่าสงสัย (Suspicious Patterns)',
          bgColor: 'bg-amber-50 border-amber-200 text-amber-900',
        };
      default:
        return {
          icon: <ShieldCheck className="w-4 h-4 text-emerald-600" />,
          title: 'ปลอดภัยสำหรับการศึกษา (Educational / Safe)',
          bgColor: 'bg-emerald-50 border-emerald-200 text-emerald-900',
        };
    }
  };

  const config = getRiskConfig();

  return (
    <div className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs ${config.bgColor}`}>
      <div className="flex items-start gap-2">
        <div className="shrink-0 mt-0.5">{config.icon}</div>
        <div>
          <span className="font-bold block">{config.title}</span>
          <p className="opacity-90 mt-0.5">{security.notes}</p>
        </div>
      </div>

      {security.suspiciousPatterns && security.suspiciousPatterns.length > 0 && (
        <div className="flex flex-wrap gap-1 shrink-0">
          {security.suspiciousPatterns.map((pat, idx) => (
            <span
              key={idx}
              className="px-2 py-0.5 rounded-md bg-white/80 border border-current font-mono text-[10px]"
            >
              ⚠ {pat}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};
