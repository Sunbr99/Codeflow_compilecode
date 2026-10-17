import React, { useState } from 'react';
import { ShieldCheck, Lock, Cloud, HardDrive, Trash2, Info, CheckCircle2, AlertTriangle } from 'lucide-react';

interface LocalPrivacyBarProps {
  executionEngine?: 'local-sandbox' | 'local-preset' | 'cloud-gemini';
  isAnalyzing: boolean;
  onClearCache: () => void;
  cachedStepsCount?: number;
  hasData: boolean;
}

export const LocalPrivacyBar: React.FC<LocalPrivacyBarProps> = ({
  executionEngine = 'local-preset',
  isAnalyzing,
  onClearCache,
  cachedStepsCount = 0,
  hasData,
}) => {
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [clearedFeedback, setClearedFeedback] = useState(false);

  const isLocal = executionEngine === 'local-sandbox' || executionEngine === 'local-preset';

  const handleConfirmClear = () => {
    onClearCache();
    setShowClearConfirm(false);
    setClearedFeedback(true);
    setTimeout(() => {
      setClearedFeedback(false);
    }, 2800);
  };

  return (
    <div className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
      {/* Left: Mode Indicator */}
      <div className="flex items-center gap-2.5">
        {isLocal ? (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-600/40 text-emerald-800 dark:text-emerald-300 rounded-lg font-semibold text-[11px] shadow-2xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <HardDrive className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Local-Only Mode: Sandbox ทำงานในเครื่อง (Zero-Cloud Leak)</span>
          </div>
        ) : (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-sky-50 dark:bg-sky-950/70 border border-sky-300 dark:border-sky-600/40 text-sky-800 dark:text-sky-300 rounded-lg font-semibold text-[11px] shadow-2xs">
            <Cloud className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
            <span>Cloud-Assisted Engine: วิเคราะห์ด้วย Gemini API (Encrypted Session)</span>
          </div>
        )}

        <div className="hidden md:flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
          <Lock className="w-3.5 h-3.5 text-slate-400" />
          <span>
            {isLocal
              ? 'ข้อมูลสคริปต์ถูกแยกย่อยและจำลองในหน่วยความจำ RAM ของเบราว์เซอร์เท่านั้น'
              : 'ผลวิเคราะห์ถูกประมวลผลผ่านช่องทางความปลอดภัยแบบเข้ารหัส'}
          </span>
        </div>
      </div>

      {/* Right: Cache & Privacy Purge Controls */}
      <div className="flex items-center gap-2 ml-auto">
        {clearedFeedback && (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800/40 animate-fade-in">
            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
            ล้างข้อมูลและแคชชั่วคราวทั้งหมดแล้ว (RAM Purged)
          </span>
        )}

        {showClearConfirm ? (
          <div className="flex items-center gap-1.5 bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-700/60 px-2.5 py-1 rounded-lg">
            <span className="text-[11px] text-rose-800 dark:text-rose-200 font-medium">ยืนยันการล้างข้อมูล?</span>
            <button
              id="confirm-clear-cache-button"
              type="button"
              onClick={handleConfirmClear}
              className="px-2 py-0.5 bg-rose-600 hover:bg-rose-700 text-white rounded font-medium text-[10px] cursor-pointer"
            >
              ล้างทันที
            </button>
            <button
              type="button"
              onClick={() => setShowClearConfirm(false)}
              className="px-2 py-0.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-200 text-slate-700 rounded text-[10px] cursor-pointer"
            >
              ยกเลิก
            </button>
          </div>
        ) : (
          <button
            id="clear-cache-privacy-toggle"
            type="button"
            disabled={!hasData || isAnalyzing}
            onClick={() => setShowClearConfirm(true)}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer shadow-2xs ${
              hasData && !isAnalyzing
                ? 'bg-slate-100 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300 dark:bg-slate-800 dark:hover:bg-rose-950/50 dark:hover:text-rose-300 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                : 'bg-slate-50 dark:bg-slate-800/50 text-slate-400 border border-slate-100 dark:border-slate-800 cursor-not-allowed opacity-60'
            }`}
            title="ลบผลการแกะโค้ด, แคชตัวแปรในหน่วยความจำ และประวัติการรันทั้งหมดเพื่อความเป็นส่วนตัวสูงสุด"
          >
            <Trash2 className="w-3.5 h-3.5 text-slate-500 hover:text-rose-600" />
            <span>ล้างแคช & ข้อมูลวิเคราะห์ (Clear Cache)</span>
            {cachedStepsCount > 0 && (
              <span className="px-1.5 py-0.2 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded text-[10px] font-mono">
                {cachedStepsCount}
              </span>
            )}
          </button>
        )}
      </div>
    </div>
  );
};
