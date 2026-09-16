/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { CodeViewer } from './components/CodeViewer';
import { ExecutionStepper } from './components/ExecutionStepper';
import { MemoryInspector } from './components/MemoryInspector';
import { FlowGraph } from './components/FlowGraph';
import { ConsoleOutput } from './components/ConsoleOutput';
import { DecompiledDiffView } from './components/DecompiledDiffView';
import { SecurityBadge } from './components/SecurityBadge';
import { PRESET_SCRIPTS } from './data/presets';
import { PRESET_ANALYSES } from './data/presetAnalyses';
import { AnalysisResult, PresetScript } from './types';
import { AlertCircle, Info, Sparkles, Terminal, RefreshCw, Smartphone } from 'lucide-react';
import { downloadAppProjectZip, downloadAnalysisPackageZip } from './utils/exportZip';
import { AndroidInstallModal } from './components/AndroidInstallModal';
import { StringUnpackerModal } from './components/StringUnpackerModal';
import { AutoPatchModal } from './components/AutoPatchModal';
import { UnitTestGeneratorModal } from './components/UnitTestGeneratorModal';

export default function App() {
  const initialPreset = PRESET_SCRIPTS[0];
  const [currentPresetId, setCurrentPresetId] = useState<string>(initialPreset.id);
  const [code, setCode] = useState<string>(initialPreset.code);
  const [language, setLanguage] = useState<string>(initialPreset.language);
  const [targetLanguage, setTargetLanguage] = useState<string>(initialPreset.defaultTargetLanguage);
  const [activeTab, setActiveTab] = useState<'simulator' | 'flow' | 'decompiled' | 'symbols'>('simulator');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [isAndroidModalOpen, setIsAndroidModalOpen] = useState<boolean>(false);
  const [isStringUnpackerOpen, setIsStringUnpackerOpen] = useState<boolean>(false);
  const [isAutoPatchOpen, setIsAutoPatchOpen] = useState<boolean>(false);
  const [isUnitTestGenOpen, setIsUnitTestGenOpen] = useState<boolean>(false);
  // Initialize with precomputed analysis for instant load without 503 latency
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(
    () => PRESET_ANALYSES[initialPreset.id] || null
  );
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [breakpoints, setBreakpoints] = useState<Set<number>>(new Set());
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Perform code analysis
  const runAnalysis = useCallback(async (codeToAnalyze: string, lang: string, targetLang: string) => {
    setIsAnalyzing(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/analyze-script', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: codeToAnalyze,
          language: lang,
          targetLanguage: targetLang,
          mode: 'deobfuscate',
        }),
      });

      if (!res.ok) {
        throw new Error(`HTTP error ${res.status}: ${res.statusText}`);
      }

      const data: AnalysisResult = await res.json();
      setAnalysisResult(data);
      setCurrentStepIndex(0);
    } catch (err: any) {
      console.warn('Analysis network/server notice:', err);
      // Fallback to preset analysis if matching
      const matchingPreset = PRESET_SCRIPTS.find((p) => p.code.trim() === codeToAnalyze.trim());
      if (matchingPreset && PRESET_ANALYSES[matchingPreset.id]) {
        setAnalysisResult({
          ...PRESET_ANALYSES[matchingPreset.id],
          isFallback: true,
          notice: 'โมเดล AI กำลังมีผู้ใช้งานหนาแน่นชั่วคราว ระบบจึงใช้ผลการวิเคราะห์ตัวอย่างที่ตรวจสอบแล้วให้คุณทำงานต่อได้ทันที',
        });
        setCurrentStepIndex(0);
      } else {
        setErrorMessage(
          `โมเดล AI กำลังมีผู้ใช้งานหนาแน่นชั่วคราว (High demand spike). ท่านสามารถกด "วิเคราะห์สคริปต์" เพื่อลองใหม่อีกครั้ง หรือเลือกตัวอย่าง Preset สคริปต์ด้านบนได้ทันที`
        );
      }
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  // Handle selecting a preset
  const handleSelectPreset = (preset: PresetScript) => {
    setCurrentPresetId(preset.id);
    setCode(preset.code);
    setLanguage(preset.language);
    setTargetLanguage(preset.defaultTargetLanguage);
    setBreakpoints(new Set());
    setErrorMessage(null);

    // If precomputed analysis exists, load it immediately for 0ms lag
    if (PRESET_ANALYSES[preset.id]) {
      setAnalysisResult(PRESET_ANALYSES[preset.id]);
      setCurrentStepIndex(0);
    } else {
      runAnalysis(preset.code, preset.language, preset.defaultTargetLanguage);
    }
  };

  // Handle file upload
  const handleFileUpload = (content: string, fileName: string) => {
    setCurrentPresetId('custom');
    setCode(content);

    let detectedLang = 'javascript';
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (ext === 'py') detectedLang = 'python';
    else if (ext === 'ts') detectedLang = 'typescript';
    else if (ext === 'php') detectedLang = 'php';
    else if (ext === 'sh' || ext === 'bash') detectedLang = 'shell';
    else if (ext === 'go') detectedLang = 'go';
    else if (ext === 'c' || ext === 'cpp') detectedLang = 'c';
    else if (ext === 'java') detectedLang = 'java';

    setLanguage(detectedLang);
    setBreakpoints(new Set());
    runAnalysis(content, detectedLang, targetLanguage);
  };

  // Toggle breakpoint
  const handleToggleBreakpoint = (line: number) => {
    setBreakpoints((prev) => {
      const next = new Set(prev);
      if (next.has(line)) {
        next.delete(line);
      } else {
        next.add(line);
      }
      return next;
    });
  };

  // Jump to specific line by finding its step
  const handleJumpToLine = (line: number) => {
    if (!analysisResult || !analysisResult.steps) return;
    const stepIdx = analysisResult.steps.findIndex((s) => s.lineNumber === line);
    if (stepIdx !== -1) {
      setCurrentStepIndex(stepIdx);
    }
  };

  const steps = analysisResult?.steps || [];
  const currentStep = steps[currentStepIndex] || null;
  const activeLine = currentStep ? currentStep.lineNumber : 0;

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans">
      {/* Header Bar */}
      <Header
        currentPresetId={currentPresetId}
        onSelectPreset={handleSelectPreset}
        sourceLanguage={language}
        onSourceLanguageChange={(newLang) => {
          setLanguage(newLang);
          if (code.trim()) {
            runAnalysis(code, newLang, targetLanguage);
          }
        }}
        targetLanguage={targetLanguage}
        onTargetLanguageChange={(lang) => {
          setTargetLanguage(lang);
          if (analysisResult) {
            runAnalysis(code, language, lang);
          }
        }}
        onAnalyze={() => runAnalysis(code, language, targetLanguage)}
        isAnalyzing={isAnalyzing}
        onFileUpload={handleFileUpload}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onDownloadProjectZip={downloadAppProjectZip}
        onDownloadAnalysisZip={() => {
          downloadAnalysisPackageZip(code, analysisResult, language, targetLanguage);
        }}
        hasAnalysisResult={Boolean(analysisResult)}
        onOpenAndroidModal={() => setIsAndroidModalOpen(true)}
        onOpenStringUnpacker={() => setIsStringUnpackerOpen(true)}
        onOpenAutoPatch={() => setIsAutoPatchOpen(true)}
        onOpenUnitTestGen={() => setIsUnitTestGenOpen(true)}
      />

      {/* Notice / Informational Banner */}
      {analysisResult?.notice && (
        <div className="max-w-7xl mx-auto px-4 mt-3 w-full">
          <div className="p-3 bg-blue-50 border border-blue-200 text-blue-900 rounded-xl text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-2xs">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-blue-600 shrink-0" />
              <span>{analysisResult.notice}</span>
            </div>
            <button
              type="button"
              onClick={() => runAnalysis(code, language, targetLanguage)}
              disabled={isAnalyzing}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-white hover:bg-blue-100 border border-blue-300 text-blue-800 rounded-lg font-medium text-[11px] shrink-0 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3 h-3 ${isAnalyzing ? 'animate-spin' : ''}`} />
              <span>วิเคราะห์ด้วย AI อีกครั้ง</span>
            </button>
          </div>
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="max-w-7xl mx-auto px-4 mt-3 w-full">
          <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-xs flex items-center justify-between gap-2 shadow-2xs">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => runAnalysis(code, language, targetLanguage)}
              className="px-2.5 py-1 bg-amber-200/80 hover:bg-amber-300 rounded-md text-amber-900 font-medium text-[11px] shrink-0 transition-colors"
            >
              ลองอีกครั้ง
            </button>
          </div>
        </div>
      )}

      {/* Main Workspace Container */}
      <main className="max-w-7xl mx-auto px-4 py-4 w-full flex-1 flex flex-col space-y-4">
        {/* Top Summary & Security Bar */}
        {analysisResult && (
          <div className="space-y-2">
            <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 text-sm">
                    {analysisResult.scriptSummary.slice(0, 90)}...
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono text-[10px] border border-slate-200">
                    ภาษา: {analysisResult.languageDetected}
                  </span>
                </div>
                <div className="text-slate-500">
                  ตรวจพบขั้นตอนการทำงาน: <strong className="text-slate-800">{steps.length} ขั้นตอน</strong> | 
                  ความยาวโค้ด: <strong className="text-slate-800">{code.split('\n').length} บรรทัด</strong>
                </div>
              </div>

              {/* Obfuscation Pattern Badges */}
              {analysisResult.obfuscationPatternsFound && analysisResult.obfuscationPatternsFound.length > 0 && (
                <div className="flex flex-wrap gap-1.5 items-center">
                  <span className="text-slate-400 font-medium text-[11px] mr-1">ตรวจพบ:</span>
                  {analysisResult.obfuscationPatternsFound.slice(0, 3).map((pat, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200 font-mono text-[10px]"
                    >
                      {pat}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Security Audit Badge */}
            {analysisResult.securityAssessment && (
              <SecurityBadge security={analysisResult.securityAssessment} />
            )}
          </div>
        )}

        {/* Tab 1: Execution Simulator View */}
        {activeTab === 'simulator' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1">
            {/* Left Column: Code Viewer (Line by Line Trace) */}
            <div className="lg:col-span-6 min-h-[500px] flex flex-col">
              <CodeViewer
                code={code}
                onCodeChange={(newCode) => {
                  setCode(newCode);
                  setCurrentPresetId('custom');
                }}
                activeLine={activeLine}
                breakpoints={breakpoints}
                onToggleBreakpoint={handleToggleBreakpoint}
                steps={steps}
                currentStepIndex={currentStepIndex}
                onJumpToLine={handleJumpToLine}
              />
            </div>

            {/* Right Column: Execution Stepper, Memory Inspector, and Virtual Console */}
            <div className="lg:col-span-6 flex flex-col space-y-4">
              {/* Stepper & Active Step Card */}
              <ExecutionStepper
                steps={steps}
                currentStepIndex={currentStepIndex}
                onStepChange={setCurrentStepIndex}
                breakpoints={breakpoints}
              />

              {/* Live Memory & Variables Inspector */}
              <div className="min-h-[220px]">
                <MemoryInspector
                  currentStep={currentStep}
                  decodedSymbols={analysisResult?.decodedSymbolsTable || []}
                />
              </div>

              {/* Virtual Stdout Console */}
              <div className="min-h-[160px]">
                <ConsoleOutput
                  steps={steps}
                  currentStepIndex={currentStepIndex}
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: System Flow Diagram */}
        {activeTab === 'flow' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-5 min-h-[500px]">
              <CodeViewer
                code={code}
                onCodeChange={setCode}
                activeLine={activeLine}
                breakpoints={breakpoints}
                onToggleBreakpoint={handleToggleBreakpoint}
                steps={steps}
                currentStepIndex={currentStepIndex}
                onJumpToLine={handleJumpToLine}
              />
            </div>
            <div className="lg:col-span-7">
              <FlowGraph
                nodes={analysisResult?.flowchart || []}
                currentStep={currentStep}
                onJumpToLine={(line) => {
                  handleJumpToLine(line);
                  setActiveTab('simulator');
                }}
              />
            </div>
          </div>
        )}

        {/* Tab 3: Decompiled Side-by-Side Code View */}
        {activeTab === 'decompiled' && (
          <DecompiledDiffView
            originalCode={code}
            decompiledCode={analysisResult?.decompiledCode || '// ยังไม่มีผลการแกะโค้ด'}
            decompiledExplanation={analysisResult?.decompiledExplanation}
            targetLanguage={targetLanguage}
            sourceLanguage={language}
            obfuscationPatterns={analysisResult?.obfuscationPatternsFound || []}
          />
        )}

        {/* Tab 4: Decoded Symbols Focus */}
        {activeTab === 'symbols' && (
          <div className="min-h-[500px]">
            <MemoryInspector
              currentStep={currentStep}
              decodedSymbols={analysisResult?.decodedSymbolsTable || []}
            />
          </div>
        )}
      </main>

      {/* Global Status Footer */}
      <footer className="border-t border-slate-200 bg-white py-3 px-4 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">CodeFlow Decompiler & Visualizer</span>
            <span>—</span>
            <span>เครื่องมือวิเคราะห์ขั้นตอนระบบการทำงานของสคริปต์และแกะโค้ดแปลงค่า</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400 font-mono text-[11px]">
            <span>Full-stack Express + Vite</span>
            <span>Multi-Model AI Resilience Engine</span>
          </div>
        </div>
      </footer>

      {/* Android & Termux Installation Modal */}
      <AndroidInstallModal
        isOpen={isAndroidModalOpen}
        onClose={() => setIsAndroidModalOpen(false)}
        onDownloadProjectZip={downloadAppProjectZip}
      />

      {/* Binary & String Unpacker Tool Modal */}
      <StringUnpackerModal
        isOpen={isStringUnpackerOpen}
        onClose={() => setIsStringUnpackerOpen(false)}
      />

      {/* AI Automated Vulnerability Patching Modal */}
      <AutoPatchModal
        isOpen={isAutoPatchOpen}
        onClose={() => setIsAutoPatchOpen(false)}
        security={analysisResult?.securityAssessment}
        originalCode={code}
      />

      {/* Automated Unit Test Generator Modal */}
      <UnitTestGeneratorModal
        isOpen={isUnitTestGenOpen}
        onClose={() => setIsUnitTestGenOpen(false)}
        analysisResult={analysisResult}
        code={code}
        language={language}
      />
    </div>
  );
}
