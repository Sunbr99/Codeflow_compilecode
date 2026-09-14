import React, { useState } from 'react';
import { Database, Search, KeyRound, Layers, Check, Copy } from 'lucide-react';
import { ExecutionStep, DecodedSymbol } from '../types';

interface MemoryInspectorProps {
  currentStep: ExecutionStep | null;
  decodedSymbols: DecodedSymbol[];
}

export const MemoryInspector: React.FC<MemoryInspectorProps> = ({
  currentStep,
  decodedSymbols,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'variables' | 'symbols' | 'stack'>('variables');
  const [filterText, setFilterText] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const variables = currentStep?.variablesSnapshot || {};
  const mutatedVars = new Set(
    (currentStep?.stateMutations || []).map((m) => m.variable)
  );

  const variableEntries = Object.entries(variables).filter(([k, v]) => {
    if (!filterText) return true;
    const q = filterText.toLowerCase();
    return k.toLowerCase().includes(q) || JSON.stringify(v).toLowerCase().includes(q);
  });

  const filteredSymbols = decodedSymbols.filter((s) => {
    if (!filterText) return true;
    const q = filterText.toLowerCase();
    return (
      s.obfuscatedName.toLowerCase().includes(q) ||
      s.deobfuscatedMeaning.toLowerCase().includes(q) ||
      s.decodedValue.toLowerCase().includes(q)
    );
  });

  const handleCopy = (text: string, keyId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyId);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  const renderValueBadge = (val: any) => {
    if (val === null) return <span className="text-slate-400 font-mono">null</span>;
    if (val === undefined) return <span className="text-slate-400 font-mono">undefined</span>;
    if (typeof val === 'boolean') {
      return <span className="text-sky-600 font-mono font-semibold">{val ? 'true' : 'false'}</span>;
    }
    if (typeof val === 'number') {
      return <span className="text-orange-600 font-mono font-semibold">{val}</span>;
    }
    if (typeof val === 'string') {
      return <span className="text-emerald-700 font-mono break-all">&quot;{val}&quot;</span>;
    }
    if (typeof val === 'object') {
      return (
        <pre className="text-[11px] font-mono text-slate-800 bg-slate-100 p-1.5 rounded-md overflow-x-auto max-h-32">
          {JSON.stringify(val, null, 2)}
        </pre>
      );
    }
    return <span className="font-mono text-slate-700">{String(val)}</span>;
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden flex flex-col h-full">
      {/* Tab Header */}
      <div className="px-3 pt-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setActiveSubTab('variables')}
            className={`px-3 py-1.5 rounded-t-lg text-xs font-semibold flex items-center gap-1.5 transition-colors border-t border-x ${
              activeSubTab === 'variables'
                ? 'bg-white border-slate-200 text-slate-900 shadow-2xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Database className="w-3.5 h-3.5 text-blue-600" />
            <span>หน่วยความจำ (Memory & Variables)</span>
            <span className="px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-700 text-[10px]">
              {Object.keys(variables).length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('symbols')}
            className={`px-3 py-1.5 rounded-t-lg text-xs font-semibold flex items-center gap-1.5 transition-colors border-t border-x ${
              activeSubTab === 'symbols'
                ? 'bg-white border-slate-200 text-slate-900 shadow-2xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5 text-purple-600" />
            <span>ตารางถอดรหัส (Decoded Symbols)</span>
            <span className="px-1.5 py-0.2 rounded-full bg-purple-100 text-purple-700 text-[10px]">
              {decodedSymbols.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('stack')}
            className={`px-3 py-1.5 rounded-t-lg text-xs font-semibold flex items-center gap-1.5 transition-colors border-t border-x ${
              activeSubTab === 'stack'
                ? 'bg-white border-slate-200 text-slate-900 shadow-2xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-indigo-600" />
            <span>Call Stack</span>
          </button>
        </div>

        {/* Quick Filter */}
        <div className="relative pb-1.5">
          <Search className="w-3 h-3 absolute left-2 top-2 text-slate-400" />
          <input
            type="text"
            placeholder="กรองข้อมูล..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            className="text-[11px] pl-6 pr-2 py-0.5 rounded-md border border-slate-200 bg-white text-slate-700 focus:outline-none focus:border-slate-400 w-28 lg:w-36"
          />
        </div>
      </div>

      {/* Tab Body */}
      <div className="p-3 flex-1 overflow-auto">
        {activeSubTab === 'variables' && (
          <div>
            {variableEntries.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                ยังไม่มีตัวแปรถูกสร้างใน Scope หรือหน่วยความจำ ณ ขั้นตอนนี้
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {variableEntries.map(([key, val]) => {
                  const isMutated = mutatedVars.has(key);
                  return (
                    <div
                      key={key}
                      className={`py-2 px-2.5 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-2 transition-colors ${
                        isMutated
                          ? 'bg-emerald-50/80 border border-emerald-300 font-semibold'
                          : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-800">
                          {key}
                        </span>
                        {isMutated && (
                          <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.2 rounded-sm bg-emerald-600 text-white font-sans font-bold">
                            เพิ่งเปลี่ยนค่า
                          </span>
                        )}
                        <span className="text-[10px] text-slate-400 font-mono">
                          ({typeof val})
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {renderValueBadge(val)}
                        <button
                          type="button"
                          onClick={() => handleCopy(typeof val === 'object' ? JSON.stringify(val) : String(val), key)}
                          className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
                          title="คัดลอกค่า"
                        >
                          {copiedKey === key ? (
                            <Check className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeSubTab === 'symbols' && (
          <div>
            {filteredSymbols.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                ไม่พบสัญลักษณ์ที่ถูกเข้ารหัส หรือยังไม่ได้ผ่านการแกะโค้ด
              </div>
            ) : (
              <div className="border border-slate-200 rounded-lg overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                    <tr>
                      <th className="py-2 px-3">ชื่อที่ถูก Obfuscate</th>
                      <th className="py-2 px-3">ความหมายที่แท้จริง</th>
                      <th className="py-2 px-3">ค่าที่ถอดรหัสได้</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredSymbols.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="py-2 px-3 font-mono font-bold text-pink-700 break-all">
                          {item.obfuscatedName}
                        </td>
                        <td className="py-2 px-3 text-slate-800 font-medium">
                          {item.deobfuscatedMeaning}
                        </td>
                        <td className="py-2 px-3 font-mono text-emerald-700 bg-emerald-50/30 break-all">
                          {item.decodedValue}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeSubTab === 'stack' && (
          <div className="space-y-2">
            <div className="p-3 rounded-lg bg-slate-900 text-slate-200 text-xs font-mono space-y-1.5">
              <div className="flex items-center justify-between text-emerald-400 border-b border-slate-800 pb-1">
                <span>[Active Frame #1] Global Context / Main Loop</span>
                <span>Line {currentStep?.lineNumber || 1}</span>
              </div>
              <p className="text-slate-400 text-[11px]">
                สโคปกำลังประมวลผลสคริปต์หลักใน Global Scope
              </p>
            </div>
            <div className="p-2.5 rounded-lg border border-slate-200 text-xs text-slate-600 bg-slate-50">
              <span className="font-semibold block mb-1">Execution State:</span>
              <span>Step: {currentStep?.stepIndex || 1} | Action: {currentStep?.actionTitle || '-'}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
