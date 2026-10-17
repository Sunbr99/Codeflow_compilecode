import React, { useState, useRef, useEffect } from 'react';
import { 
  Terminal, 
  X, 
  Minimize2, 
  Maximize2, 
  Play, 
  ShieldCheck, 
  Code2, 
  Layers, 
  Cloud, 
  Lock, 
  RotateCcw,
  Sparkles,
  User,
  Edit2,
  Check
} from 'lucide-react';
import { executeVirtualBoxCommand, SUGGESTED_COMMANDS, CommandCategoryItem } from '../utils/virtualBoxCommands';
import { getTermuxUserIdentity, saveTermuxUsername, TermuxUserIdentity } from '../utils/userSession';

interface VirtualBoxTerminalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAst?: (filename?: string, code?: string) => void;
}

interface TerminalLine {
  id: string;
  type: 'input' | 'output' | 'error' | 'success' | 'system';
  text: string;
}

export const VirtualBoxTerminalModal: React.FC<VirtualBoxTerminalModalProps> = ({ isOpen, onClose, onOpenAst }) => {
  const [userIdentity, setUserIdentity] = useState<TermuxUserIdentity>(getTermuxUserIdentity());
  const [isEditingUser, setIsEditingUser] = useState<boolean>(false);
  const [usernameInput, setUsernameInput] = useState<string>(userIdentity.username);

  const [inputVal, setInputVal] = useState<string>('');
  const [currentDir, setCurrentDir] = useState<string>('~');
  const [isMaximized, setIsMaximized] = useState<boolean>(false);
  const [activeCategory, setActiveCategory] = useState<'all' | 'se' | 'fullstack' | 'infra' | 'sec'>('all');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState<number>(-1);

  const [lines, setLines] = useState<TerminalLine[]>([]);

  useEffect(() => {
    const ident = getTermuxUserIdentity();
    setUserIdentity(ident);
    setUsernameInput(ident.username);
    setLines([
      { id: '1', type: 'system', text: `Termux Android Linux Environment (aarch64 / ARMv8-A)` },
      { id: '2', type: 'system', text: `Kernel: 6.5.0-termux-android #1 SMP PREEMPT (uid=${ident.uid})` },
      { id: '3', type: 'success', text: `Active Session: ${ident.username}@${ident.hostname} (Home: /data/data/com.termux/files/home)` },
      { id: '4', type: 'system', text: `🛡️ Security Shield: Isolated Sandbox Active | Remote Hijack & Ingress Blocked` },
      { id: '5', type: 'output', text: 'Tip: Type "sec-audit", "ufw status", or "check-tunnel" to verify security posture.' },
      { id: '6', type: 'output', text: '--------------------------------------------------------------------------------' }
    ]);
  }, [isOpen]);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [lines]);

  if (!isOpen) return null;

  const runCommand = (cmdToRun: string) => {
    const trimmed = cmdToRun.trim();
    if (!trimmed) return;

    // Record history
    setHistory((prev) => [...prev, trimmed]);
    setHistoryIdx(-1);

    if (trimmed.toLowerCase() === 'clear') {
      setLines([
        { id: Date.now().toString(), type: 'system', text: 'Terminal screen cleared.' }
      ]);
      setInputVal('');
      return;
    }

    if (trimmed.toLowerCase() === 'exit') {
      onClose();
      return;
    }

    // Support changing username directly via command: export USER=myname or chsh -s myname or hostname myname
    const exportMatch = trimmed.match(/^export\s+USER=([a-zA-Z0-9_\-]+)/i) || 
                        trimmed.match(/^hostname\s+([a-zA-Z0-9_\-]+)/i) ||
                        trimmed.match(/^chsh\s+([a-zA-Z0-9_\-]+)/i);

    if (exportMatch && exportMatch[1]) {
      const newUser = exportMatch[1];
      const updated = saveTermuxUsername(newUser, userIdentity.hostname);
      setUserIdentity(updated);
      setUsernameInput(updated.username);
      setLines([
        ...lines,
        { id: Date.now().toString(), type: 'input', text: `${userIdentity.username}@${userIdentity.hostname}:${currentDir} $ ${trimmed}` },
        { id: `${Date.now()}_1`, type: 'success', text: `[Termux User Updated]: Active user identity changed to "${updated.username}". Identity saved to session storage.` }
      ]);
      setInputVal('');
      return;
    }

    const res = executeVirtualBoxCommand(trimmed, currentDir, userIdentity.username, userIdentity.hostname);
    if (res.newDir) {
      setCurrentDir(res.newDir);
    }

    if (res.openAst && onOpenAst) {
      setTimeout(() => {
        onOpenAst(res.openAst?.filename, res.openAst?.code);
      }, 500);
    }

    const newEntries: TerminalLine[] = [
      ...lines,
      { id: Date.now().toString(), type: 'input', text: `${userIdentity.username}@${userIdentity.hostname}:${currentDir} $ ${trimmed}` },
      ...res.lines.map((l, idx) => ({
        id: `${Date.now()}_${idx}`,
        type: l.type,
        text: l.text
      }))
    ];

    setLines(newEntries);
    setInputVal('');
  };

  const handleSaveUsername = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (usernameInput.trim()) {
      const updated = saveTermuxUsername(usernameInput);
      setUserIdentity(updated);
      setIsEditingUser(false);
      setLines(prev => [
        ...prev,
        { id: Date.now().toString(), type: 'system', text: `User identity switched to "${updated.username}@${updated.hostname}"` }
      ]);
    } else {
      setIsEditingUser(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    runCommand(inputVal);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length === 0) return;
      const nextIdx = historyIdx === -1 ? history.length - 1 : Math.max(0, historyIdx - 1);
      setHistoryIdx(nextIdx);
      setInputVal(history[nextIdx] || '');
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIdx === -1) return;
      const nextIdx = historyIdx + 1;
      if (nextIdx >= history.length) {
        setHistoryIdx(-1);
        setInputVal('');
      } else {
        setHistoryIdx(nextIdx);
        setInputVal(history[nextIdx] || '');
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      // Simple autocompletion
      const current = inputVal.toLowerCase().trim();
      if (current) {
        const match = SUGGESTED_COMMANDS.find(s => s.cmd.toLowerCase().startsWith(current));
        if (match) {
          setInputVal(match.cmd);
        }
      }
    }
  };

  const filteredCommands = activeCategory === 'all' 
    ? SUGGESTED_COMMANDS 
    : SUGGESTED_COMMANDS.filter(c => c.category === activeCategory);

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-2 sm:p-5">
      <div className={`bg-slate-950 border border-emerald-500/40 rounded-2xl shadow-2xl w-full ${isMaximized ? 'h-[96vh] max-w-[98vw]' : 'max-w-5xl h-[750px]'} overflow-hidden flex flex-col text-slate-100 transition-all duration-200`}>
        {/* Terminal Header */}
        <div className="px-4 py-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between select-none">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-rose-500 inline-block cursor-pointer hover:opacity-80" onClick={onClose} title="Close"></span>
              <span className="w-3 h-3 rounded-full bg-amber-500 inline-block cursor-pointer hover:opacity-80" onClick={() => setIsMaximized(!isMaximized)} title="Toggle Maximize"></span>
              <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block cursor-pointer hover:opacity-80" onClick={() => runCommand('clear')} title="Clear"></span>
            </div>
            <div className="flex items-center gap-2 ml-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              {isEditingUser ? (
                <form onSubmit={handleSaveUsername} className="flex items-center gap-1.5">
                  <span className="text-xs text-slate-400 font-mono">user:</span>
                  <input
                    type="text"
                    value={usernameInput}
                    onChange={(e) => setUsernameInput(e.target.value)}
                    className="px-1.5 py-0.5 text-xs bg-slate-800 text-emerald-300 font-mono rounded border border-emerald-500/50 w-28 focus:outline-none"
                    placeholder="u0_a248"
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="p-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[10px] cursor-pointer"
                    title="บันทึกชื่อผู้ใช้"
                  >
                    <Check className="w-3 h-3" />
                  </button>
                </form>
              ) : (
                <div 
                  onClick={() => setIsEditingUser(true)}
                  className="flex items-center gap-1.5 cursor-pointer group hover:bg-slate-800/80 px-2 py-0.5 rounded transition-colors"
                  title="คลิกเพื่อแก้ไขชื่อ User ตามใจชอบ"
                >
                  <span className="font-mono font-bold text-xs text-emerald-400 group-hover:text-emerald-300">
                    {userIdentity.username}
                  </span>
                  <span className="text-slate-500 font-mono text-xs">@{userIdentity.hostname}:~</span>
                  <Edit2 className="w-3 h-3 text-slate-500 group-hover:text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 bg-sky-500/15 text-sky-300 text-[10px] font-mono rounded border border-sky-500/30">
              <ShieldCheck className="w-3 h-3 text-sky-400" /> Remote Guard: ON
            </span>
            <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-500/15 text-emerald-300 text-[10px] font-mono rounded border border-emerald-500/30">
              <Sparkles className="w-3 h-3" /> UID: {userIdentity.uid} (Android Termux)
            </span>
            <button
              onClick={() => setIsMaximized(!isMaximized)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title={isMaximized ? 'Minimize' : 'Maximize'}
            >
              {isMaximized ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="Close Terminal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Category Filter Bar */}
        <div className="px-4 py-2 bg-slate-900/90 border-b border-slate-800 flex items-center gap-1.5 overflow-x-auto text-[11px]">
          <span className="text-slate-400 font-mono text-[10px] uppercase tracking-wider mr-1 hidden sm:inline">Suite:</span>
          
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-2.5 py-1 rounded-md font-mono transition-colors cursor-pointer whitespace-nowrap ${
              activeCategory === 'all'
                ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-500/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            All Commands
          </button>

          <button
            onClick={() => setActiveCategory('se')}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md font-mono transition-colors cursor-pointer whitespace-nowrap ${
              activeCategory === 'se'
                ? 'bg-blue-500/25 text-blue-300 border border-blue-500/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Code2 className="w-3 h-3 text-blue-400" />
            Software Eng & Git
          </button>

          <button
            onClick={() => setActiveCategory('fullstack')}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md font-mono transition-colors cursor-pointer whitespace-nowrap ${
              activeCategory === 'fullstack'
                ? 'bg-purple-500/25 text-purple-300 border border-purple-500/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Layers className="w-3 h-3 text-purple-400" />
            Full-Stack & DB
          </button>

          <button
            onClick={() => setActiveCategory('infra')}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md font-mono transition-colors cursor-pointer whitespace-nowrap ${
              activeCategory === 'infra'
                ? 'bg-amber-500/25 text-amber-300 border border-amber-500/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Cloud className="w-3 h-3 text-amber-400" />
            Infra & DevOps / K8s
          </button>

          <button
            onClick={() => setActiveCategory('sec')}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md font-mono transition-colors cursor-pointer whitespace-nowrap ${
              activeCategory === 'sec'
                ? 'bg-rose-500/25 text-rose-300 border border-rose-500/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Lock className="w-3 h-3 text-rose-400" />
            Security & Reverse
          </button>
        </div>

        {/* Quick-Run Action Chips Bar */}
        <div className="px-4 py-2 bg-slate-950/90 border-b border-slate-800/80 flex items-center gap-2 overflow-x-auto select-none scrollbar-thin">
          <span className="text-[10px] text-slate-500 font-mono shrink-0">Quick Run:</span>
          {filteredCommands.slice(0, 10).map((item) => (
            <button
              key={item.cmd}
              onClick={() => runCommand(item.cmd)}
              className="px-2 py-0.5 bg-slate-900 hover:bg-emerald-950/80 text-slate-300 hover:text-emerald-300 border border-slate-700/70 hover:border-emerald-500/40 rounded text-[11px] font-mono transition-all shrink-0 cursor-pointer shadow-2xs"
              title={item.description}
            >
              <span className="text-emerald-400 mr-1">$</span>
              {item.cmd}
            </button>
          ))}
        </div>

        {/* Terminal Screen Body */}
        <div 
          className="flex-1 p-4 font-mono text-xs overflow-y-auto space-y-2 bg-[#080d16] text-emerald-400 cursor-text select-text"
          onClick={() => inputRef.current?.focus()}
        >
          {lines.map((l) => {
            let textColor = 'text-emerald-400';
            if (l.type === 'error') textColor = 'text-rose-400';
            if (l.type === 'system') textColor = 'text-cyan-300 font-bold';
            if (l.type === 'input') textColor = 'text-amber-300 font-semibold';
            if (l.type === 'success') textColor = 'text-emerald-300';

            return (
              <div key={l.id} className={`${textColor} leading-relaxed whitespace-pre-wrap`}>
                {l.text}
              </div>
            );
          })}

          {/* Active Command Input Line */}
          <form onSubmit={handleFormSubmit} className="flex items-center gap-2 pt-1">
            <span className="shrink-0 font-mono text-xs">
              <span className="text-emerald-400 font-bold">{userIdentity.username}@{userIdentity.hostname}</span>
              <span className="text-slate-500">:</span>
              <span className="text-blue-400 font-semibold">{currentDir}</span>
              <span className="text-amber-400 font-bold ml-1">$</span>
            </span>
            <input
              ref={inputRef}
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-transparent text-emerald-300 font-mono text-xs focus:outline-none caret-emerald-400"
              placeholder="พิมพ์คำสั่ง เช่น git status, docker ps, kubectl get pods, export USER=ชื่อ, whoami..."
              autoFocus
            />
          </form>
          <div ref={bottomRef} />
        </div>

        {/* Terminal Footer Quick Bar */}
        <div className="px-4 py-2.5 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400 select-none">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-emerald-400 font-mono">
              <ShieldCheck className="w-3.5 h-3.5" /> Root Shell Active (ARM64 & x86_64)
            </span>
            <span className="hidden md:inline text-slate-500">|</span>
            <span className="hidden md:inline text-slate-400 font-mono">History: ↑ / ↓ Arrow Keys</span>
            <span className="hidden lg:inline text-slate-500">|</span>
            <span className="hidden lg:inline text-slate-400 font-mono">Tab: Autocomplete</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => runCommand('help')}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[10px] font-mono transition-colors border border-slate-700 cursor-pointer"
            >
              help
            </button>
            <button
              onClick={() => runCommand('git status')}
              className="px-2.5 py-1 bg-blue-950 hover:bg-blue-900 text-blue-300 rounded text-[10px] font-mono transition-colors border border-blue-500/30 cursor-pointer"
            >
              git status
            </button>
            <button
              onClick={() => runCommand('kubectl get pods -A')}
              className="px-2.5 py-1 bg-amber-950 hover:bg-amber-900 text-amber-300 rounded text-[10px] font-mono transition-colors border border-amber-500/30 cursor-pointer"
            >
              k8s pods
            </button>
            <button
              onClick={() => runCommand('clear')}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[10px] font-mono transition-colors border border-slate-700 cursor-pointer"
            >
              clear
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
