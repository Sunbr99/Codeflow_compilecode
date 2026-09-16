import React, { useRef, useState } from 'react';
import {
  Play,
  Sparkles,
  Upload,
  FileCode,
  FileCode2,
  Terminal,
  Code2,
  RefreshCw,
  Layers,
  Download,
  FolderArchive,
  FileCheck2,
  ChevronDown,
  Smartphone
} from 'lucide-react';
import { PresetScript } from '../types';
import { PRESET_SCRIPTS } from '../data/presets';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface HeaderProps {
  currentPresetId: string;
  onSelectPreset: (preset: PresetScript) => void;
  sourceLanguage: string;
  onSourceLanguageChange: (lang: string) => void;
  targetLanguage: string;
  onTargetLanguageChange: (lang: string) => void;
  onAnalyze: () => void;
  isAnalyzing: boolean;
  onFileUpload: (content: string, fileName: string) => void;
  activeTab: 'simulator' | 'flow' | 'decompiled' | 'symbols';
  onTabChange: (tab: 'simulator' | 'flow' | 'decompiled' | 'symbols') => void;
  onDownloadProjectZip: () => void;
  onDownloadAnalysisZip: () => void;
  hasAnalysisResult: boolean;
  onOpenAndroidModal: () => void;
  onOpenStringUnpacker: () => void;
  onOpenAutoPatch: () => void;
  onOpenUnitTestGen: () => void;
}

export const SUPPORTED_SOURCE_LANGUAGES = [
  { id: 'auto', label: '⚡ Auto-Detect (ตรวจหาอัตโนมัติ)' },
  { id: 'javascript', label: 'JavaScript / Node.js' },
  { id: 'typescript', label: 'TypeScript' },
  { id: 'python', label: 'Python' },
  { id: 'php', label: 'PHP' },
  { id: 'shell', label: 'Bash / Linux Shell' },
  { id: 'powershell', label: 'PowerShell' },
  { id: 'c', label: 'C Language' },
  { id: 'cpp', label: 'C++' },
  { id: 'csharp', label: 'C# / .NET' },
  { id: 'java', label: 'Java' },
  { id: 'go', label: 'Golang' },
  { id: 'rust', label: 'Rust' },
  { id: 'ruby', label: 'Ruby' },
  { id: 'kotlin', label: 'Kotlin' },
  { id: 'swift', label: 'Swift' },
  { id: 'lua', label: 'Lua' },
  { id: 'perl', label: 'Perl' },
  { id: 'sql', label: 'SQL Script' },
  { id: 'custom', label: 'ภาษาอื่นๆ / Custom Script' },
];

export const TARGET_LANGUAGES = [
  { id: 'python', label: 'Python 3' },
  { id: 'javascript', label: 'JavaScript (Modern ES6+)' },
  { id: 'typescript', label: 'TypeScript (Strict Typed)' },
  { id: 'go', label: 'Golang' },
  { id: 'cpp', label: 'C++' },
  { id: 'rust', label: 'Rust' },
  { id: 'clean-pseudocode', label: 'Pseudocode (ภาษาไทย/อังกฤษ)' },
];

export const Header: React.FC<HeaderProps> = ({
  currentPresetId,
  onSelectPreset,
  sourceLanguage,
  onSourceLanguageChange,
  targetLanguage,
  onTargetLanguageChange,
  onAnalyze,
  isAnalyzing,
  onFileUpload,
  activeTab,
  onTabChange,
  onDownloadProjectZip,
  onDownloadAnalysisZip,
  hasAnalysisResult,
  onOpenAndroidModal,
  onOpenStringUnpacker,
  onOpenAutoPatch,
  onOpenUnitTestGen,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const { isInstallable, isInstalled, install } = usePWAInstall();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        onFileUpload(content, file.name);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <header className="border-b border-slate-200 bg-white/95 backdrop-blur sticky top-0 z-30 shadow-xs">
      {/* Top Main Bar */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        {/* Brand & Identity */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-900 text-emerald-400 flex items-center justify-center shadow-sm">
            <Code2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-slate-900">
                CodeFlow Decompiler
              </h1>
              <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                Logic Visualizer
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">
              วิเคราะห์ขั้นตอนการทำงานทีละบรรทัด รองรับสคริปต์ทุกภาษา พร้อมแกะโค้ดแปลงค่า
            </p>
          </div>
        </div>

        {/* Controls & Actions */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Preset Selector */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700">
            <Layers className="w-3.5 h-3.5 text-slate-500" />
            <span className="font-medium text-slate-500 hidden md:inline">ตัวอย่าง:</span>
            <select
              id="preset-selector"
              value={currentPresetId}
              onChange={(e) => {
                const found = PRESET_SCRIPTS.find((p) => p.id === e.target.value);
                if (found) onSelectPreset(found);
              }}
              className="bg-transparent text-slate-800 font-medium focus:outline-none cursor-pointer text-xs pr-1 max-w-[150px] sm:max-w-none truncate"
            >
              {PRESET_SCRIPTS.map((preset) => (
                <option key={preset.id} value={preset.id}>
                  {preset.title}
                </option>
              ))}
              <option value="custom">✏️ สคริปต์กำหนดเอง (Custom Script)</option>
            </select>
          </div>

          {/* Source Language Selector */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700">
            <span className="font-medium text-slate-500 hidden xl:inline">ภาษาสคริปต์:</span>
            <select
              id="source-language-select"
              value={sourceLanguage}
              onChange={(e) => onSourceLanguageChange(e.target.value)}
              className="bg-transparent text-slate-800 font-medium focus:outline-none cursor-pointer text-xs pr-1"
            >
              {SUPPORTED_SOURCE_LANGUAGES.map((lang) => (
                <option key={lang.id} value={lang.id}>
                  {lang.label}
                </option>
              ))}
            </select>
          </div>

          {/* Upload Button */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".js,.ts,.jsx,.tsx,.py,.php,.sh,.bash,.ps1,.txt,.c,.cpp,.h,.hpp,.cs,.go,.rs,.rb,.java,.kt,.swift,.lua,.pl,.sql,.json"
            className="hidden"
            id="file-upload-input"
          />
          <button
            id="upload-script-button"
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-colors shadow-2xs cursor-pointer"
            title="อัปโหลดไฟล์สคริปต์ใดก็ได้ (.js, .py, .php, .sh, .c, .go, .java...)"
          >
            <Upload className="w-3.5 h-3.5 text-slate-600" />
            <span>นำเข้าสคริปต์</span>
          </button>

          {/* Target Language for Decompilation */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700">
            <span className="font-medium text-slate-500 hidden lg:inline">แกะโค้ดเป็น:</span>
            <select
              id="target-language-select"
              value={targetLanguage}
              onChange={(e) => onTargetLanguageChange(e.target.value)}
              className="bg-transparent text-slate-800 font-medium focus:outline-none cursor-pointer text-xs"
            >
              {TARGET_LANGUAGES.map((lang) => (
                <option key={lang.id} value={lang.id}>
                  → {lang.label}
                </option>
              ))}
            </select>
          </div>

          {/* Analyze Button */}
          <button
            id="start-analysis-button"
            type="button"
            onClick={onAnalyze}
            disabled={isAnalyzing}
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg shadow-sm transition-all cursor-pointer ${
              isAnalyzing
                ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20 active:scale-98'
            }`}
          >
            {isAnalyzing ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>กำลังวิเคราะห์...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-emerald-200" />
                <span>วิเคราะห์ & แกะโค้ด</span>
              </>
            )}
          </button>

          {/* Android & Termux Install Button */}
          <button
            id="android-install-header-button"
            type="button"
            onClick={onOpenAndroidModal}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer shadow-2xs ${
              isInstallable
                ? 'bg-emerald-500 hover:bg-emerald-600 text-white animate-pulse'
                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300'
            }`}
            title="ติดตั้งเป็น Application บนเครื่อง Android หรือ Build รันบน Termux"
          >
            <Smartphone className="w-3.5 h-3.5 text-emerald-700" />
            <span className="hidden xl:inline">ติดตั้งลง Android / Termux</span>
            <span className="xl:hidden">Android</span>
          </button>

          {/* String Unpacker Tool Button */}
          <button
            id="string-unpacker-button"
            type="button"
            onClick={onOpenStringUnpacker}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg transition-colors cursor-pointer shadow-2xs"
            title="เครื่องมือถอดรหัสสตริงและ Base64/Hex/XOR"
          >
            <Terminal className="w-3.5 h-3.5 text-purple-600" />
            <span className="hidden xl:inline">ถอดรหัสสตริง</span>
          </button>

          {/* AI Auto-Patch Tool Button */}
          <button
            id="ai-autopatch-button"
            type="button"
            onClick={onOpenAutoPatch}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors cursor-pointer shadow-2xs"
            title="ระบบสร้างแพทช์ความปลอดภัยอัตโนมัติด้วย AI"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span className="hidden xl:inline">สร้างแพทช์แก้ช่องโหว่</span>
          </button>

          {/* Unit Test Generator Tool Button */}
          <button
            id="unit-test-generator-button"
            type="button"
            onClick={onOpenUnitTestGen}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors cursor-pointer shadow-2xs"
            title="ระบบสร้าง Unit Test อัตโนมัติจากผลวิเคราะห์"
          >
            <FileCode className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden xl:inline">สร้าง Unit Test</span>
          </button>

          {/* Download ZIP Dropdown / Button */}
          <div className="relative">
            <button
              id="download-zip-menu-button"
              type="button"
              onClick={() => setShowExportMenu((prev) => !prev)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition-colors cursor-pointer shadow-2xs"
              title="ดาวน์โหลดโปรแกรมหรือผลการแกะโค้ดเป็นไฟล์ ZIP"
            >
              <Download className="w-3.5 h-3.5 text-slate-700" />
              <span>ดาวน์โหลด (.zip)</span>
              <ChevronDown className="w-3 h-3 text-slate-500" />
            </button>

            {showExportMenu && (
              <>
                {/* Backdrop closer */}
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowExportMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-76 bg-white rounded-xl shadow-xl border border-slate-200 z-50 p-2 text-xs divide-y divide-slate-100">
                  <div className="p-2 space-y-1">
                    <div className="font-semibold text-slate-900">ดาวน์โหลดลงเครื่อง (Export ZIP)</div>
                    <p className="text-[11px] text-slate-500">เลือกไฟล์ที่คุณต้องการบันทึกลงในอุปกรณ์:</p>
                  </div>

                  {/* Option 1: Full App Codebase */}
                  <div className="py-1">
                    <button
                      id="export-app-project-button"
                      type="button"
                      onClick={() => {
                        setShowExportMenu(false);
                        onDownloadProjectZip();
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-slate-50 rounded-lg flex items-start gap-2.5 transition-colors cursor-pointer group"
                    >
                      <FolderArchive className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                      <div>
                        <div className="font-semibold text-slate-800 group-hover:text-emerald-700">
                          📦 ตัวโปรแกรมทั้งหมด (App Source Code)
                        </div>
                        <div className="text-[11px] text-slate-500">
                          แพ็กเกจ Full-Stack พร้อมไฟล์เซิร์ฟเวอร์ & วิธีรันแบบออฟไลน์
                        </div>
                      </div>
                    </button>
                  </div>

                  {/* Option 2: Android & Termux Build Pack */}
                  <div className="py-1">
                    <button
                      id="export-android-termux-guide-button"
                      type="button"
                      onClick={() => {
                        setShowExportMenu(false);
                        onOpenAndroidModal();
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-emerald-50/60 rounded-lg flex items-start gap-2.5 transition-colors cursor-pointer group"
                    >
                      <Smartphone className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                      <div>
                        <div className="font-semibold text-slate-800 group-hover:text-emerald-700 flex items-center gap-1.5">
                          <span>📱 ติดตั้งบน Android / Termux Build Pack</span>
                        </div>
                        <div className="text-[11px] text-slate-500">
                          ติดตั้งเป็น PWA หรือใช้สคริปต์ Termux รันบนมือถือแบบ 1-Click
                        </div>
                      </div>
                    </button>
                  </div>

                  {/* Option 3: Analysis Report */}
                  <div className="pt-1">
                    <button
                      id="export-analysis-package-button"
                      type="button"
                      disabled={!hasAnalysisResult}
                      onClick={() => {
                        setShowExportMenu(false);
                        onDownloadAnalysisZip();
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg flex items-start gap-2.5 transition-colors ${
                        hasAnalysisResult
                          ? 'hover:bg-slate-50 cursor-pointer group'
                          : 'opacity-50 cursor-not-allowed'
                      }`}
                    >
                      <FileCheck2 className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                      <div>
                        <div className="font-semibold text-slate-800 group-hover:text-blue-700">
                          📄 ผลการแกะโค้ด & รายงาน (.zip)
                        </div>
                        <div className="text-[11px] text-slate-500">
                          สคริปต์ที่แกะแล้ว + JSON Trace + ตารางตัวแปร + รายงาน Markdown
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between border-t border-slate-100 text-xs">
        <div className="flex items-center gap-1 -mb-px overflow-x-auto">
          <button
            id="tab-simulator"
            type="button"
            onClick={() => onTabChange('simulator')}
            className={`inline-flex items-center gap-2 px-4 py-2.5 border-b-2 font-medium transition-colors whitespace-nowrap ${
              activeTab === 'simulator'
                ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            <Play className="w-3.5 h-3.5" />
            <span>จำลองการทำงานทีละบรรทัด (Execution Simulator)</span>
          </button>

          <button
            id="tab-flow"
            type="button"
            onClick={() => onTabChange('flow')}
            className={`inline-flex items-center gap-2 px-4 py-2.5 border-b-2 font-medium transition-colors whitespace-nowrap ${
              activeTab === 'flow'
                ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>ผังระบบการทำงาน (System Flow Diagram)</span>
          </button>

          <button
            id="tab-decompiled"
            type="button"
            onClick={() => onTabChange('decompiled')}
            className={`inline-flex items-center gap-2 px-4 py-2.5 border-b-2 font-medium transition-colors whitespace-nowrap ${
              activeTab === 'decompiled'
                ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            <FileCode2 className="w-3.5 h-3.5" />
            <span>โค้ดที่แกะ/แปลงค่าแล้ว (Clean Decompiled Code)</span>
          </button>

          <button
            id="tab-symbols"
            type="button"
            onClick={() => onTabChange('symbols')}
            className={`inline-flex items-center gap-2 px-4 py-2.5 border-b-2 font-medium transition-colors whitespace-nowrap ${
              activeTab === 'symbols'
                ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>ตารางถอดรหัสสัญลักษณ์ (Decoded Symbols)</span>
          </button>
        </div>

        <div className="hidden lg:flex items-center gap-2 text-[11px] text-slate-500 py-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>Multi-Language Universal Decompiler Engine</span>
        </div>
      </div>
    </header>
  );
};
