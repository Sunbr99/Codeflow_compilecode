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
import { AnalysisResult, PresetScript, ApiInteractionLog as ApiLogType } from './types';
import { AlertCircle, Info, Sparkles, Terminal, RefreshCw, Smartphone } from 'lucide-react';
import { downloadAppProjectZip, downloadAnalysisPackageZip } from './utils/exportZip';
import { ApiInteractionLog } from './components/ApiInteractionLog';
import { AndroidInstallModal } from './components/AndroidInstallModal';
import { StringUnpackerModal } from './components/StringUnpackerModal';
import { AutoPatchModal } from './components/AutoPatchModal';
import { UnitTestGeneratorModal } from './components/UnitTestGeneratorModal';
import { TermuxDiagnosticsModal } from './components/TermuxDiagnosticsModal';
import { UniversalPolyglotModal } from './components/UniversalPolyglotModal';
import { VirtualBoxTerminalModal } from './components/VirtualBoxTerminalModal';
import { VisualAstTimeTravelModal } from './components/VisualAstTimeTravelModal';
import { PromptSandboxModal } from './components/PromptSandboxModal';
import { LocalPrivacyBar } from './components/LocalPrivacyBar';
import { SettingsThemeModal } from './components/SettingsThemeModal';
import { SplashIntro } from './components/SplashIntro';
import { ThemePalette } from './types/theme';
import { PRESET_THEMES } from './utils/themeExtractor';
import { PerformanceMonitorOverlay } from './components/PerformanceMonitorOverlay';
import { enrichStepsWithPerformanceMetrics } from './utils/performanceMetrics';
import { BatchSecurityAudit } from './components/BatchSecurityAudit';
import { AppBrandAssetsModal } from './components/AppBrandAssetsModal';

export default function App() {
  const initialPreset = PRESET_SCRIPTS[0];
  const [currentPresetId, setCurrentPresetId] = useState<string>(initialPreset.id);
  const [code, setCode] = useState<string>(initialPreset.code);
  const [language, setLanguage] = useState<string>(initialPreset.language);
  const [targetLanguage, setTargetLanguage] = useState<string>(initialPreset.defaultTargetLanguage);
  const [activeTab, setActiveTab] = useState<'simulator' | 'flow' | 'decompiled' | 'symbols' | 'debug' | 'batch-security'>('simulator');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [isAndroidModalOpen, setIsAndroidModalOpen] = useState<boolean>(false);
  const [isStringUnpackerOpen, setIsStringUnpackerOpen] = useState<boolean>(false);
  const [isAutoPatchOpen, setIsAutoPatchOpen] = useState<boolean>(false);
  const [isUnitTestGenOpen, setIsUnitTestGenOpen] = useState<boolean>(false);
  const [isTermuxDiagOpen, setIsTermuxDiagOpen] = useState<boolean>(false);
  const [isPolyglotOpen, setIsPolyglotOpen] = useState<boolean>(false);
  const [isVirtualBoxOpen, setIsVirtualBoxOpen] = useState<boolean>(false);
  const [isVisualAstTimeTravelOpen, setIsVisualAstTimeTravelOpen] = useState<boolean>(false);
  const [isPromptSandboxOpen, setIsPromptSandboxOpen] = useState<boolean>(false);
  const [astModalParams, setAstModalParams] = useState<{ filename?: string; code?: string }>({});
  const [isThemeModalOpen, setIsThemeModalOpen] = useState<boolean>(false);
  const [isBrandAssetsOpen, setIsBrandAssetsOpen] = useState<boolean>(false);
  const [appTheme, setAppTheme] = useState<ThemePalette>(() => {
    try {
      const saved = localStorage.getItem('codeflow_custom_theme');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      // fallback
    }
    return PRESET_THEMES[0];
  });
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [showSplash, setShowSplash] = useState<boolean>(true);
  const [isPerfOverlayOpen, setIsPerfOverlayOpen] = useState<boolean>(true);
  // Track all API interactions with latency and payload data
  const [apiLogs, setApiLogs] = useState<ApiLogType[]>(() => {
    const initial = PRESET_ANALYSES[initialPreset.id];
    if (initial) {
      return [
        {
          id: `log-init-${Date.now()}`,
          timestamp: new Date().toISOString(),
          endpoint: '/api/analyze-script (zero-lag preset cache)',
          method: 'PRESET-CACHE',
          status: 'CACHED',
          latencyMs: 1,
          engine: 'local-preset',
          requestPayload: {
            code: initialPreset.code,
            language: initialPreset.language,
            targetLanguage: initialPreset.defaultTargetLanguage,
            mode: 'deobfuscate',
          },
          responsePayload: initial,
          isSuccess: true,
          responseSizeKb: Math.round(JSON.stringify(initial).length / 102.4) / 10,
        },
      ];
    }
    return [];
  });

  // Initialize with precomputed analysis for instant load without 503 latency
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(() => {
    const initial = PRESET_ANALYSES[initialPreset.id];
    if (initial) {
      return {
        ...initial,
        executionEngine: 'local-preset',
        steps: enrichStepsWithPerformanceMetrics(initial.steps),
      };
    }
    return null;
  });
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [breakpoints, setBreakpoints] = useState<Set<number>>(new Set());
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Perform code analysis with telemetry tracking
  const runAnalysis = useCallback(async (codeToAnalyze: string, lang: string, targetLang: string) => {
    setIsAnalyzing(true);
    setErrorMessage(null);
    const startTime = performance.now();

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
      const latencyMs = Math.round(performance.now() - startTime);
      const enrichedData: AnalysisResult = {
        ...data,
        steps: enrichStepsWithPerformanceMetrics(data.steps || []),
      };
      setAnalysisResult(enrichedData);
      setCurrentStepIndex(0);

      // Record successful API Interaction Log
      const logEntry: ApiLogType = {
        id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        timestamp: new Date().toISOString(),
        endpoint: '/api/analyze-script',
        method: 'POST',
        status: res.status,
        latencyMs,
        engine: (data.executionEngine as any) || (data.isFallback ? 'local-sandbox' : 'cloud-gemini'),
        requestPayload: {
          code: codeToAnalyze,
          language: lang,
          targetLanguage: targetLang,
          mode: 'deobfuscate',
        },
        responsePayload: data,
        isSuccess: true,
        responseSizeKb: Math.round(JSON.stringify(data).length / 102.4) / 10,
      };
      setApiLogs((prev) => [logEntry, ...prev]);
    } catch (err: any) {
      const latencyMs = Math.round(performance.now() - startTime);
      console.info('Analysis network notice:', err?.message || String(err));

      // Fallback to preset analysis if matching
      const matchingPreset = PRESET_SCRIPTS.find((p) => p.code.trim() === codeToAnalyze.trim());
      if (matchingPreset && PRESET_ANALYSES[matchingPreset.id]) {
        const presetAnalysis = PRESET_ANALYSES[matchingPreset.id];
        const enrichedFallback: AnalysisResult = {
          ...presetAnalysis,
          isFallback: true,
          executionEngine: 'local-preset',
          steps: enrichStepsWithPerformanceMetrics(presetAnalysis.steps || []),
          notice: 'โมเดล AI กำลังมีผู้ใช้งานหนาแน่นชั่วคราว ระบบจึงใช้ผลการวิเคราะห์ตัวอย่างที่ตรวจสอบแล้วให้คุณทำงานต่อได้ทันที',
        };
        setAnalysisResult(enrichedFallback);
        setCurrentStepIndex(0);

        // Record fallback interaction log
        const logEntry: ApiLogType = {
          id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          timestamp: new Date().toISOString(),
          endpoint: '/api/analyze-script (fallback: local-preset)',
          method: 'POST',
          status: 'CACHED',
          latencyMs,
          engine: 'local-preset',
          requestPayload: {
            code: codeToAnalyze,
            language: lang,
            targetLanguage: targetLang,
            mode: 'deobfuscate',
          },
          responsePayload: enrichedFallback,
          isSuccess: true,
          errorMessage: err?.message || String(err),
          responseSizeKb: Math.round(JSON.stringify(enrichedFallback).length / 102.4) / 10,
        };
        setApiLogs((prev) => [logEntry, ...prev]);
      } else {
        setErrorMessage(
          `โมเดล AI กำลังมีผู้ใช้งานหนาแน่นชั่วคราว (High demand spike). ท่านสามารถกด "วิเคราะห์สคริปต์" เพื่อลองใหม่อีกครั้ง หรือเลือกตัวอย่าง Preset สคริปต์ด้านบนได้ทันที`
        );

        // Record error log
        const logEntry: ApiLogType = {
          id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          timestamp: new Date().toISOString(),
          endpoint: '/api/analyze-script',
          method: 'POST',
          status: 'ERROR',
          latencyMs,
          engine: 'unknown',
          requestPayload: {
            code: codeToAnalyze,
            language: lang,
            targetLanguage: targetLang,
            mode: 'deobfuscate',
          },
          responsePayload: { error: err?.message || String(err) },
          isSuccess: false,
          errorMessage: err?.message || String(err),
        };
        setApiLogs((prev) => [logEntry, ...prev]);
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
      const pAnalysis = PRESET_ANALYSES[preset.id];
      setAnalysisResult({
        ...pAnalysis,
        executionEngine: 'local-preset',
        steps: enrichStepsWithPerformanceMetrics(pAnalysis.steps || []),
      });
      setCurrentStepIndex(0);

      // Log instant preset load into API Interaction Log
      const presetLog: ApiLogType = {
        id: `log-preset-${Date.now()}-${preset.id}`,
        timestamp: new Date().toISOString(),
        endpoint: `/preset/${preset.id} (zero-lag cache)`,
        method: 'PRESET-CACHE',
        status: 'CACHED',
        latencyMs: 1,
        engine: 'local-preset',
        requestPayload: {
          code: preset.code,
          language: preset.language,
          targetLanguage: preset.defaultTargetLanguage,
          mode: 'deobfuscate',
        },
        responsePayload: pAnalysis,
        isSuccess: true,
        responseSizeKb: Math.round(JSON.stringify(pAnalysis).length / 102.4) / 10,
      };
      setApiLogs((prev) => [presetLog, ...prev]);
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

  // Clear all cached analysis data, memory trace, and code for user privacy
  const handleClearAnalysisCache = () => {
    setAnalysisResult(null);
    setCurrentStepIndex(0);
    setBreakpoints(new Set());
    setErrorMessage(null);
    // Also clear custom code input to prevent residual memory leaks
    if (currentPresetId === 'custom') {
      setCode('// Workspace cache cleared. Paste or upload your code to begin.');
    }
  };

  const steps = analysisResult?.steps || [];
  const currentStep = steps[currentStepIndex] || null;
  const activeLine = currentStep ? currentStep.lineNumber : 0;

  // Dynamic background style based on custom appTheme
  const getAppBgClass = () => {
    if (appTheme.backgroundStyle === 'cyberpunk-grid') {
      return 'bg-[radial-gradient(#00f0ff_1px,transparent_1px)] [background-size:24px_24px] bg-slate-950 text-slate-100';
    }
    if (appTheme.backgroundStyle === 'deep-midnight') {
      return 'bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950 text-slate-100';
    }
    if (appTheme.backgroundStyle === 'warm-amber') {
      return isDarkMode ? 'bg-stone-950 text-stone-100' : 'bg-gradient-to-br from-amber-50/70 via-orange-50/40 to-yellow-50/60 text-stone-900';
    }
    if (appTheme.backgroundStyle === 'mesh-gradient') {
      return isDarkMode
        ? 'bg-gradient-to-tr from-slate-950 via-purple-950/40 to-slate-900 text-slate-100'
        : 'bg-gradient-to-tr from-slate-100 via-emerald-50/50 to-sky-50/60 text-slate-900';
    }
    if (appTheme.backgroundStyle === 'custom-image' && appTheme.customBgImage) {
      return 'text-slate-100 relative';
    }
    return isDarkMode ? 'bg-slate-950 text-slate-100 dark' : 'bg-slate-100 text-slate-900';
  };

  return (
    <div
      className={`min-h-screen flex flex-col font-sans relative transition-colors duration-200 ${getAppBgClass()} ${
        isDarkMode ? 'dark' : ''
      }`}
      style={{
        ...(appTheme.backgroundStyle === 'custom-image' && appTheme.customBgImage
          ? {
              backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.88), rgba(15, 23, 42, 0.92)), url(${appTheme.customBgImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundAttachment: 'fixed',
            }
          : {}),
      }}
    >
      {/* Splash Intro Screen */}
      {showSplash && (
        <SplashIntro
          onEnter={() => setShowSplash(false)}
          onOpenBrandAssets={() => setIsBrandAssetsOpen(true)}
        />
      )}

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
        onOpenTermuxDiagnostics={() => setIsTermuxDiagOpen(true)}
        onOpenPolyglotModal={() => setIsPolyglotOpen(true)}
        onOpenVirtualBox={() => setIsVirtualBoxOpen(true)}
        onOpenVisualAstTimeTravel={() => setIsVisualAstTimeTravelOpen(true)}
        onOpenPromptSandbox={() => setIsPromptSandboxOpen(true)}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode((prev) => !prev)}
        onOpenSettingsTheme={() => setIsThemeModalOpen(true)}
        onOpenSplash={() => setShowSplash(true)}
        onOpenBrandAssets={() => setIsBrandAssetsOpen(true)}
        apiLogCount={apiLogs.length}
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
        {/* Local-Only Mode Indicator & Privacy Purge Bar */}
        <LocalPrivacyBar
          executionEngine={analysisResult?.executionEngine || 'local-preset'}
          isAnalyzing={isAnalyzing}
          onClearCache={handleClearAnalysisCache}
          cachedStepsCount={steps.length}
          hasData={Boolean(analysisResult)}
        />

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

        {/* Performance Monitor Overlay: Execution Time & Memory Footprint per Step */}
        {steps.length > 0 && (
          <PerformanceMonitorOverlay
            steps={steps}
            currentStepIndex={currentStepIndex}
            onSelectStep={setCurrentStepIndex}
            isOpen={isPerfOverlayOpen}
            onToggleOpen={() => setIsPerfOverlayOpen((prev) => !prev)}
          />
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

        {/* Tab 5: API Interaction Log & Telemetry Debugger */}
        {activeTab === 'debug' && (
          <ApiInteractionLog
            logs={apiLogs}
            onClearLogs={() => setApiLogs([])}
            onTriggerAnalysis={() => runAnalysis(code, language, targetLanguage)}
            isAnalyzing={isAnalyzing}
            activeCode={code}
          />
        )}

        {/* Tab 6: Batch Security Audit & Collective Vulnerability Matrix */}
        {activeTab === 'batch-security' && (
          <BatchSecurityAudit
            onLoadScriptToEditor={(scriptCode, scriptLang, scriptTitle) => {
              setCode(scriptCode);
              setLanguage(scriptLang || 'javascript');
              setCurrentPresetId(`custom-${Date.now()}`);
              setActiveTab('simulator');
              // Automatically trigger analysis for the selected script
              runAnalysis(scriptCode, scriptLang || 'javascript', targetLanguage);
            }}
          />
        )}
      </main>

      {/* Global Status Footer */}
      <footer className="border-t border-cyan-500/30 bg-[#070b12] py-4 px-6 text-xs text-cyan-200 shadow-[0_-5px_20px_rgba(6,182,212,0.2)]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="relative flex flex-col sm:flex-row items-center gap-2 text-center sm:text-left">
            <span className="font-serif font-extrabold text-amber-300 drop-shadow-[0_0_8px_rgba(255,215,0,0.6)]">DARKNESS GENESIS :hk-bridge9</span>
            <span className="hidden sm:inline text-cyan-400">—</span>
            <span className="text-cyan-100/90 text-[11px] font-mono font-bold">™copyright w aistudio.&&gemini.</span>
            {/* Overlaid SDK package signature watermark */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 sm:translate-x-0 sm:left-4 opacity-25 pointer-events-none font-mono text-[9px] text-cyan-400 tracking-[0.25em] uppercase whitespace-nowrap">
              [SDK: @google/genai-v3.0.0-infra]
            </div>
          </div>
          <div className="flex items-center gap-3 font-mono text-[11px] text-cyan-300">
            <span className="px-2 py-0.5 rounded bg-cyan-950/70 border border-cyan-500/40 text-cyan-200">Full-stack Express + Vite</span>
            <span className="italic font-serif text-amber-300 font-bold drop-shadow-[0_0_8px_rgba(255,215,0,0.5)]">:hk-bridge9 • AI Studio & Gemini Core Engine</span>
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

      {/* Termux Diagnostics & Error Doctor Modal */}
      <TermuxDiagnosticsModal
        isOpen={isTermuxDiagOpen}
        onClose={() => setIsTermuxDiagOpen(false)}
      />

      {/* Universal Polyglot Code & Security Doctor Modal */}
      <UniversalPolyglotModal
        isOpen={isPolyglotOpen}
        onClose={() => setIsPolyglotOpen(false)}
      />

      {/* Virtual Box & Termux Terminal Modal */}
      <VirtualBoxTerminalModal
        isOpen={isVirtualBoxOpen}
        onClose={() => setIsVirtualBoxOpen(false)}
        onOpenAst={(fname, codeSnippet) => {
          setAstModalParams({ filename: fname, code: codeSnippet });
          setIsVisualAstTimeTravelOpen(true);
        }}
      />

      {/* Visual AST Mapping & Time-Travel Debugger (NeXTSTEP Studio) Modal */}
      <VisualAstTimeTravelModal
        isOpen={isVisualAstTimeTravelOpen}
        onClose={() => setIsVisualAstTimeTravelOpen(false)}
        initialFilename={astModalParams.filename}
        initialCode={astModalParams.code}
      />

      {/* Prompt Command Runner & OS Sandbox Modal */}
      <PromptSandboxModal
        isOpen={isPromptSandboxOpen}
        onClose={() => setIsPromptSandboxOpen(false)}
      />

      {/* Settings & Auto Theme from Image Customization Modal */}
      <SettingsThemeModal
        isOpen={isThemeModalOpen}
        onClose={() => setIsThemeModalOpen(false)}
        currentTheme={appTheme}
        onApplyTheme={(newTheme) => {
          setAppTheme(newTheme);
          try {
            localStorage.setItem('codeflow_custom_theme', JSON.stringify(newTheme));
          } catch (e) {
            // storage ignore
          }
        }}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode((prev) => !prev)}
      />

      {/* Official App Brand Assets & Icon Hub Modal */}
      <AppBrandAssetsModal
        isOpen={isBrandAssetsOpen}
        onClose={() => setIsBrandAssetsOpen(false)}
        onOpenSplash={() => setShowSplash(true)}
      />
    </div>
  );
}
