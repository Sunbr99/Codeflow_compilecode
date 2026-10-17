import React, { useState } from 'react';
import { Terminal, Play, Sparkles, Copy, Check, Trash2, Cpu, FileCode, Layers, RefreshCw, Zap } from 'lucide-react';

interface PromptSandboxModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CommandSnippet {
  id: string;
  name: string;
  category: 'termux' | 'ai-prompt' | 'system' | 'custom';
  command: string;
  description: string;
}

const PRESET_SNIPPETS: CommandSnippet[] = [
  {
    id: '1',
    name: 'Termux Full Package Sync & Upgrade',
    category: 'termux',
    command: 'pkg update -y && pkg upgrade -y && pkg install nodejs python git build-essential -y',
    description: 'อัปเดตระบบ Termux และติดตั้งแพ็กเกจหลักที่จำเป็นทั้งหมด'
  },
  {
    id: '2',
    name: 'AI Code Deobfuscator & Unpacker',
    category: 'ai-prompt',
    command: 'ANALYZE_OBFUSCATION --deep-scan --extract-strings --target=python',
    description: 'สั่ง AI สแกนโค้ดสคริปต์ที่ถูกเข้ารหัสและแกะค่าสตริงออกมาตรงๆ'
  },
  {
    id: '3',
    name: 'Android Gradle Clean & Build APK',
    category: 'termux',
    command: 'cd android && ./gradlew clean && ./gradlew assembleDebug --refresh-dependencies',
    description: 'ล้างแคช Gradle และคอมไพล์โปรเจกต์เป็นไฟล์ APK (ต้องรันบน Termux แท้)'
  },
  {
    id: '4',
    name: 'Virtual Memory & AST Inspector',
    category: 'system',
    command: 'SYSTEM_INSPECT --ast-tree --dump-memory --trace-steps',
    description: 'ตรวจสอบโครงสร้าง AST โครงข่ายหน่วยความจำและลำดับการทำงานของสคริปต์'
  }
];

export function PromptSandboxModal({ isOpen, onClose }: PromptSandboxModalProps) {
  const [activeTab, setActiveTab] = useState<'sandbox' | 'snippets' | 'library'>('sandbox');
  const [customPrompt, setCustomPrompt] = useState<string>('pkg update && node server.ts');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [executionLogs, setExecutionLogs] = useState<Array<{ id: string; time: string; prompt: string; output: string; status: 'success' | 'running' | 'error' }>>([
    {
      id: 'init-1',
      time: new Date().toLocaleTimeString(),
      prompt: 'SYSTEM_INIT --sandbox-mode=active',
      output: '[OK] Prompt Command Sandbox initialized successfully.\n[OK] Virtual Terminal Engine ready.\n[INFO] Type or select any prompt command to execute.',
      status: 'success'
    }
  ]);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [customLibraryCode, setCustomLibraryCode] = useState<string>('// Custom Library Plugin\nfunction executeCustomRoutine(input) {\n  return "Processed: " + input.toUpperCase();\n}');

  if (!isOpen) return null;

  const handleRunCommand = () => {
    if (!customPrompt.trim() || isRunning) return;
    setIsRunning(true);

    const newLogId = Date.now().toString();
    const timestamp = new Date().toLocaleTimeString();

    // Add running log
    setExecutionLogs(prev => [
      {
        id: newLogId,
        time: timestamp,
        prompt: customPrompt,
        output: 'Executing prompt command in sandbox environment...',
        status: 'running'
      },
      ...prev
    ]);

    setTimeout(() => {
      let simulatedOutput = '';
      let status: 'success' | 'error' = 'success';

      if (customPrompt.includes('pkg update') || customPrompt.includes('install')) {
        simulatedOutput = `[Termux Sandbox] Reading package lists... Done\n[Termux Sandbox] Building dependency tree...\n[Success] Packages nodejs, python, git verified & ready.`;
      } else if (customPrompt.includes('ANALYZE') || customPrompt.includes('AI')) {
        simulatedOutput = `[AI Engine] Deep scan completed.\n- Obfuscation Level: Low\n- Unpacked 3 hidden strings successfully.\n- Security Risk: SAFE.`;
      } else if (customPrompt.includes('gradlew')) {
        simulatedOutput = `[Gradle Sandbox] Task :app:clean UP-TO-DATE\n[Gradle Sandbox] Task :app:assembleDebug\nBUILD SUCCESSFUL in 4.2s\nOutput APK: android/app/build/outputs/apk/debug/app-debug.apk`;
      } else {
        simulatedOutput = `[Command Execution] Command executed successfully.\nResult for "${customPrompt}":\n-> Exit code: 0\n-> Execution time: 142ms\n-> Memory allocated: 18.4MB`;
      }

      setExecutionLogs(prev =>
        prev.map(log => log.id === newLogId ? { ...log, output: simulatedOutput, status } : log)
      );
      setIsRunning(false);
    }, 800);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredSnippets = selectedCategory === 'all' 
    ? PRESET_SNIPPETS 
    : PRESET_SNIPPETS.filter(s => s.category === selectedCategory);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-slate-900 border border-emerald-500/35 rounded-2xl w-full max-w-5xl h-[85vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        
        {/* Window Title Bar */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
            <div className="flex items-center space-x-2 ml-4">
              <Terminal className="w-5 h-5 text-emerald-400" />
              <span className="font-mono font-bold tracking-wide text-emerald-400">PROMPT COMMAND RUNNER & VIRTUAL OS SANDBOX</span>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white font-mono text-sm px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 transition-colors"
          >
            [CLOSE ✕]
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="bg-slate-900/90 border-b border-slate-800 px-6 flex space-x-2 pt-3">
          <button
            onClick={() => setActiveTab('sandbox')}
            className={`px-4 py-2 font-mono text-xs rounded-t-lg flex items-center space-x-2 transition-all ${
              activeTab === 'sandbox' 
                ? 'bg-emerald-500/20 text-emerald-300 border-t-2 border-emerald-400' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Play className="w-3.5 h-3.5 text-emerald-400" />
            <span>PROMPT COMMAND SANDBOX</span>
          </button>
          <button
            onClick={() => setActiveTab('snippets')}
            className={`px-4 py-2 font-mono text-xs rounded-t-lg flex items-center space-x-2 transition-all ${
              activeTab === 'snippets' 
                ? 'bg-emerald-500/20 text-emerald-300 border-t-2 border-emerald-400' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-yellow-400" />
            <span>PRESET SNIPPETS ({PRESET_SNIPPETS.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('library')}
            className={`px-4 py-2 font-mono text-xs rounded-t-lg flex items-center space-x-2 transition-all ${
              activeTab === 'library' 
                ? 'bg-emerald-500/20 text-emerald-300 border-t-2 border-emerald-400' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <FileCode className="w-3.5 h-3.5 text-blue-400" />
            <span>CUSTOM LIBRARY PLUGIN</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-hidden p-6 bg-slate-950 flex flex-col">
          
          {/* TAB 1: SANDBOX RUNNER */}
          {activeTab === 'sandbox' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full overflow-hidden">
              
              {/* Left Column: Prompt Input & Controls */}
              <div className="lg:col-span-1 flex flex-col space-y-4">
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col space-y-3 flex-1">
                  <label className="text-xs font-mono text-emerald-400 flex items-center justify-between">
                    <span>PROMPT & COMMAND INPUT</span>
                    <span className="text-[10px] text-slate-500">SANDBOX v2.4</span>
                  </label>
                  <textarea
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    placeholder="พิมพ์คำสั่งหรือ Prompt สำหรับรันระบบ..."
                    className="w-full flex-1 bg-slate-950 border border-slate-800 rounded-lg p-3 font-mono text-xs text-emerald-300 focus:outline-none focus:border-emerald-500 resize-none"
                    rows={6}
                  />
                  <div className="flex space-x-2">
                    <button
                      onClick={handleRunCommand}
                      disabled={isRunning || !customPrompt.trim()}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-slate-950 font-mono text-xs font-bold py-2.5 px-4 rounded-lg flex items-center justify-center space-x-2 transition-all shadow-lg shadow-emerald-900/30"
                    >
                      {isRunning ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>EXECUTING...</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 fill-current" />
                          <span>RUN PROMPT / COMMAND</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => setCustomPrompt('')}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-300 p-2.5 rounded-lg transition-colors"
                      title="Clear Input"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Quick Helper card */}
                <div className="bg-slate-900/50 border border-slate-800/80 rounded-xl p-4 text-xs font-mono text-slate-400">
                  <div className="flex items-center space-x-2 text-yellow-400 mb-2">
                    <Sparkles className="w-4 h-4" />
                    <span>คำแนะนำการใช้งาน:</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-slate-400">
                    ท่านสามารถพิมพ์ชุดคำสั่ง Termux, คำสั่ง AI Prompt หรือเลือกจากแถบ Preset Snippets เพื่อทดสอบการประมวลผลลัพธ์จำลองในระบบได้ทันที
                  </p>
                </div>
              </div>

              {/* Right Column: Execution Terminal Output Logs */}
              <div className="lg:col-span-2 flex flex-col bg-slate-900 border border-slate-800 rounded-xl overflow-hidden h-full">
                <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Terminal className="w-4 h-4 text-emerald-400" />
                    <span className="font-mono text-xs font-bold text-slate-300">EXECUTION CONSOLE & LOGS</span>
                  </div>
                  <button
                    onClick={() => setExecutionLogs([])}
                    className="text-xs font-mono text-slate-400 hover:text-red-400 transition-colors"
                  >
                    CLEAR LOGS
                  </button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 space-y-4 font-mono text-xs">
                  {executionLogs.map((log) => (
                    <div key={log.id} className="bg-slate-950 border border-slate-800/80 rounded-lg p-3 space-y-2">
                      <div className="flex items-center justify-between text-[11px] text-slate-500 border-b border-slate-900 pb-1.5">
                        <span className="text-emerald-400 font-bold">$ {log.prompt}</span>
                        <span>{log.time}</span>
                      </div>
                      <pre className="text-emerald-300/90 whitespace-pre-wrap leading-relaxed text-[11px]">
                        {log.output}
                      </pre>
                    </div>
                  ))}
                  {executionLogs.length === 0 && (
                    <div className="text-center py-16 text-slate-600 font-mono text-xs">
                      ยังไม่มีประวัติการรันคำสั่งในเซสชันนี้
                    </div>
                  )}
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: PRESET SNIPPETS */}
          {activeTab === 'snippets' && (
            <div className="flex flex-col h-full space-y-4 overflow-hidden">
              <div className="flex items-center justify-between">
                <div className="flex space-x-2">
                  {['all', 'termux', 'ai-prompt', 'system'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1.5 rounded-lg font-mono text-xs uppercase transition-colors ${
                        selectedCategory === cat 
                          ? 'bg-emerald-500 text-slate-950 font-bold' 
                          : 'bg-slate-900 text-slate-400 hover:text-white'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
                <span className="text-xs font-mono text-slate-400">คลิกที่ปุ่มใช้คำสั่งเพื่อส่งไปยัง Sandbox</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto flex-1 pr-2">
                {filteredSnippets.map((snippet) => (
                  <div key={snippet.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-3">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-emerald-400">{snippet.name}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 uppercase">{snippet.category}</span>
                      </div>
                      <p className="text-xs text-slate-400">{snippet.description}</p>
                    </div>
                    <div className="bg-slate-950 rounded-lg p-2.5 font-mono text-[11px] text-yellow-300/95 overflow-x-auto">
                      <code>{snippet.command}</code>
                    </div>
                    <div className="flex justify-end space-x-2 pt-2 border-t border-slate-800">
                      <button
                        onClick={() => handleCopy(snippet.command, snippet.id)}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs rounded-lg flex items-center space-x-1.5 transition-colors"
                      >
                        {copiedId === snippet.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedId === snippet.id ? 'COPIED!' : 'COPY'}</span>
                      </button>
                      <button
                        onClick={() => {
                          setCustomPrompt(snippet.command);
                          setActiveTab('sandbox');
                        }}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-mono text-xs font-bold rounded-lg flex items-center space-x-1.5 transition-colors"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>USE IN SANDBOX</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: CUSTOM LIBRARY PLUGIN */}
          {activeTab === 'library' && (
            <div className="flex flex-col h-full space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-mono text-sm font-bold text-slate-200">Custom JavaScript/Plugin Library Uploader</h3>
                  <p className="text-xs text-slate-400">เขียนหรืออัปโหลดไลบรารีคำสั่งเสริมเพื่อนำไปประมวลผลร่วมกับระบบ Prompt Sandbox</p>
                </div>
                <button
                  onClick={() => alert('บันทึกและคอมไพล์ไลบรารีปลั๊กอินเรียบร้อยแล้ว!')}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-mono text-xs font-bold rounded-lg transition-all"
                >
                  SAVE & COMPILE PLUGIN
                </button>
              </div>

              <div className="flex-1 bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col">
                <textarea
                  value={customLibraryCode}
                  onChange={(e) => setCustomLibraryCode(e.target.value)}
                  className="w-full flex-1 bg-slate-950 border border-slate-800 rounded-lg p-4 font-mono text-xs text-blue-300 focus:outline-none focus:border-blue-500 resize-none leading-relaxed"
                  rows={12}
                />
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="bg-slate-950 px-6 py-3 border-t border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
          <span>PROMPT RUNNER & SANDBOX ENGINE [READY]</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors"
          >
            ปิดหน้าต่าง
          </button>
        </div>

      </div>
    </div>
  );
}
