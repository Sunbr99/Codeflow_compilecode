import React, { useState, useMemo } from 'react';
import {
  Activity,
  Clock,
  Database,
  Search,
  Copy,
  Check,
  Trash2,
  Download,
  Code,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Terminal,
  Zap,
  Cpu,
  Layers,
  ArrowRight,
  Filter,
  Eye,
  FileJson,
  CheckCircle,
  XCircle,
  Server,
  Sparkles
} from 'lucide-react';
import { ApiInteractionLog as ApiLogType } from '../types';

interface ApiInteractionLogProps {
  logs: ApiLogType[];
  onClearLogs: () => void;
  onTriggerAnalysis: () => void;
  isAnalyzing: boolean;
  activeCode: string;
}

export const ApiInteractionLog: React.FC<ApiInteractionLogProps> = ({
  logs,
  onClearLogs,
  onTriggerAnalysis,
  isAnalyzing,
  activeCode,
}) => {
  const [selectedLogId, setSelectedLogId] = useState<string | null>(() => {
    return logs.length > 0 ? logs[0].id : null;
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'success' | 'error' | 'cached'>('all');
  const [engineFilter, setEngineFilter] = useState<'all' | 'cloud-gemini' | 'local-sandbox' | 'local-preset'>('all');
  const [detailTab, setDetailTab] = useState<'overview' | 'response' | 'request'>('overview');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // If logs change and selectedLogId is not in logs, pick the first
  const activeLog = useMemo(() => {
    if (!logs.length) return null;
    const found = logs.find((l) => l.id === selectedLogId);
    return found || logs[0];
  }, [logs, selectedLogId]);

  // Compute metrics
  const metrics = useMemo(() => {
    if (!logs.length) {
      return {
        total: 0,
        avgLatency: 0,
        minLatency: 0,
        maxLatency: 0,
        successRate: 100,
        geminiCount: 0,
        localCount: 0,
        presetCount: 0,
      };
    }

    const total = logs.length;
    const totalLatency = logs.reduce((acc, curr) => acc + curr.latencyMs, 0);
    const avgLatency = Math.round(totalLatency / total);
    const latencies = logs.map((l) => l.latencyMs);
    const minLatency = Math.min(...latencies);
    const maxLatency = Math.max(...latencies);
    const successCount = logs.filter((l) => l.isSuccess).length;
    const successRate = Math.round((successCount / total) * 100);

    const geminiCount = logs.filter((l) => l.engine === 'cloud-gemini').length;
    const localCount = logs.filter((l) => l.engine === 'local-sandbox').length;
    const presetCount = logs.filter((l) => l.engine === 'local-preset').length;

    return {
      total,
      avgLatency,
      minLatency,
      maxLatency,
      successRate,
      geminiCount,
      localCount,
      presetCount,
    };
  }, [logs]);

  // Filter logs
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      // Status filter
      if (statusFilter === 'success' && (!log.isSuccess || log.status === 'CACHED')) return false;
      if (statusFilter === 'error' && log.isSuccess) return false;
      if (statusFilter === 'cached' && log.status !== 'CACHED' && log.engine !== 'local-preset') return false;

      // Engine filter
      if (engineFilter !== 'all' && log.engine !== engineFilter) return false;

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const codeMatch = log.requestPayload.code.toLowerCase().includes(query);
        const langMatch = log.requestPayload.language.toLowerCase().includes(query);
        const endpointMatch = log.endpoint.toLowerCase().includes(query);
        const engineMatch = log.engine.toLowerCase().includes(query);
        const errMatch = log.errorMessage?.toLowerCase().includes(query) || false;
        const responseMatch = JSON.stringify(log.responsePayload || {}).toLowerCase().includes(query);

        if (!codeMatch && !langMatch && !endpointMatch && !engineMatch && !errMatch && !responseMatch) {
          return false;
        }
      }

      return true;
    });
  }, [logs, statusFilter, engineFilter, searchQuery]);

  // Copy helper
  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => {
      setCopiedKey(null);
    }, 2000);
  };

  // Export all logs as JSON
  const handleExportLogs = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(logs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `codeflow-api-interaction-logs-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Format latency badge
  const getLatencyColor = (ms: number) => {
    if (ms < 300) return 'text-emerald-700 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800';
    if (ms < 1500) return 'text-cyan-700 bg-cyan-50 border-cyan-200 dark:bg-cyan-950/40 dark:text-cyan-300 dark:border-cyan-800';
    return 'text-amber-700 bg-amber-50 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800';
  };

  const getEngineBadge = (engine: string) => {
    switch (engine) {
      case 'cloud-gemini':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800">
            <Sparkles className="w-2.5 h-2.5" />
            Gemini Core AI
          </span>
        );
      case 'local-sandbox':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800">
            <Cpu className="w-2.5 h-2.5" />
            Local Sandbox
          </span>
        );
      case 'local-preset':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800">
            <Zap className="w-2.5 h-2.5" />
            Zero-Lag Preset
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300">
            {engine}
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col space-y-4">
      {/* Top Banner & Telemetry Transparency Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-5 shadow-sm border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-indigo-500/20 border border-indigo-400/30 rounded-xl text-indigo-300">
                <Activity className="w-5 h-5" />
              </div>
              <h2 className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-2">
                API Interaction Log & Telemetry Debugger
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono">
                  Live Trace
                </span>
              </h2>
            </div>
            <p className="text-xs text-slate-300 max-w-2xl">
              บันทึกและตรวจสอบค่า Latency (เวลาตอบสนอง), Payload คำขอ (Request) และผลลัพธ์โครงสร้างข้อมูล JSON (Response Payload) ของทุกการวิเคราะห์สคริปต์แบบเรียลไทม์เพื่อความโปร่งใส 100%
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onTriggerAnalysis}
              disabled={isAnalyzing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} />
              <span>{isAnalyzing ? 'กำลังยิงเรียก API...' : 'ทดสอบยิง API (Trigger Run)'}</span>
            </button>

            <button
              type="button"
              onClick={handleExportLogs}
              disabled={logs.length === 0}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition-colors cursor-pointer disabled:opacity-40"
              title="ส่งออกประวัติการเรียก API เป็นไฟล์ JSON"
            >
              <Download className="w-3.5 h-3.5" />
              <span>ส่งออก JSON</span>
            </button>

            <button
              type="button"
              onClick={onClearLogs}
              disabled={logs.length === 0}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-800/60 text-xs font-medium transition-colors cursor-pointer disabled:opacity-40"
              title="ล้างประวัติการเรียก API ทั้งหมด"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>ล้างประวัติ</span>
            </button>
          </div>
        </div>

        {/* Real-time Telemetry Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-800">
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3">
            <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mb-1">
              <Server className="w-3.5 h-3.5 text-indigo-400" />
              <span>รอบการเรียก API รวม</span>
            </div>
            <div className="text-xl font-bold font-mono text-white">
              {metrics.total} <span className="text-xs font-normal text-slate-400">runs</span>
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3">
            <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mb-1">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>ความเร็วเฉลี่ย (Avg Latency)</span>
            </div>
            <div className="text-xl font-bold font-mono text-cyan-300">
              {metrics.avgLatency} <span className="text-xs font-normal text-slate-400">ms</span>
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3">
            <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mb-1">
              <Zap className="w-3.5 h-3.5 text-emerald-400" />
              <span>เร็วสุด / ช้าสุด</span>
            </div>
            <div className="text-sm font-bold font-mono text-white flex items-baseline gap-1 mt-1">
              <span className="text-emerald-400">{metrics.minLatency} ms</span>
              <span className="text-slate-500">/</span>
              <span className="text-amber-400">{metrics.maxLatency} ms</span>
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3">
            <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mb-1">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>อัตราความสำเร็จ (Success Rate)</span>
            </div>
            <div className="text-xl font-bold font-mono text-emerald-400">
              {metrics.successRate}%
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ค้นหาตามโค้ด, Endpoint, หรือคำใน Response..."
            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        {/* Filter Badges */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                statusFilter === 'all'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              ทั้งหมด ({logs.length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('success')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                statusFilter === 'success'
                  ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              200 OK
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('cached')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                statusFilter === 'cached'
                  ? 'bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-400 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Cached
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('error')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                statusFilter === 'error'
                  ? 'bg-white dark:bg-slate-700 text-red-600 dark:text-red-400 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Errors
            </button>
          </div>

          <select
            value={engineFilter}
            onChange={(e) => setEngineFilter(e.target.value as any)}
            className="px-2.5 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-[11px] text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
          >
            <option value="all">ทุก Engine ({logs.length})</option>
            <option value="cloud-gemini">Cloud Gemini AI ({metrics.geminiCount})</option>
            <option value="local-sandbox">Local Sandbox ({metrics.localCount})</option>
            <option value="local-preset">Zero-Lag Preset ({metrics.presetCount})</option>
          </select>
        </div>
      </div>

      {/* Main Split Layout: Left Log List, Right Detail Inspector */}
      {logs.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center space-y-4">
          <div className="w-14 h-14 mx-auto bg-indigo-50 dark:bg-indigo-950/60 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
            <Activity className="w-7 h-7" />
          </div>
          <div className="space-y-1.5 max-w-md mx-auto">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              ยังไม่มีประวัติการเรียก API
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              เมื่อคุณกดปุ่ม "วิเคราะห์ & แกะโค้ด" หรือเปลี่ยนสคริปต์ ระบบจะเริ่มบันทึกค่า Latency และโครงสร้าง Response JSON ให้ตรวจสอบทันที
            </p>
          </div>
          <button
            type="button"
            onClick={onTriggerAnalysis}
            disabled={isAnalyzing}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} />
            <span>เริ่มยิงวิเคราะห์โค้ดเดี๋ยวนี้</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          {/* Left Column: Log Entries List (4 or 5 cols) */}
          <div className="lg:col-span-5 flex flex-col space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500 px-1 font-medium">
              <span>รายการการเรียก ({filteredLogs.length} รายการ)</span>
              <span>เรียงจากล่าสุด</span>
            </div>

            <div className="max-h-[620px] overflow-y-auto space-y-2 pr-1">
              {filteredLogs.map((log) => {
                const isSelected = activeLog?.id === log.id;
                const formattedTime = new Date(log.timestamp).toLocaleTimeString();

                return (
                  <div
                    key={log.id}
                    onClick={() => setSelectedLogId(log.id)}
                    className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-500/60 shadow-sm ring-1 ring-indigo-500/30'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-1.5">
                        {/* Status badge */}
                        {log.isSuccess ? (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                            {log.status === 'CACHED' ? '304 CACHE' : `${log.status} OK`}
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300">
                            ERR
                          </span>
                        )}

                        {/* HTTP Method */}
                        <span className="font-mono text-[10px] font-bold text-slate-600 dark:text-slate-400">
                          {log.method}
                        </span>

                        {/* Latency badge */}
                        <span className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold border ${getLatencyColor(log.latencyMs)}`}>
                          {log.latencyMs} ms
                        </span>
                      </div>

                      <div className="text-[11px] text-slate-400 font-mono">
                        {formattedTime}
                      </div>
                    </div>

                    {/* Middle details: Endpoint & Engine */}
                    <div className="flex items-center justify-between gap-2 my-1">
                      <span className="font-mono text-[11px] text-slate-800 dark:text-slate-200 truncate">
                        {log.endpoint}
                      </span>
                      {getEngineBadge(log.engine)}
                    </div>

                    {/* Code preview & payload preview */}
                    <div className="mt-1.5 pt-1.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
                      <span className="truncate max-w-[200px] font-mono text-slate-600 dark:text-slate-400">
                        {log.requestPayload.code.slice(0, 40).replace(/\n/g, ' ')}...
                      </span>
                      <span className="font-mono text-[10px] text-slate-400">
                        {log.responseSizeKb ? `${log.responseSizeKb} KB` : '~'}
                      </span>
                    </div>
                  </div>
                );
              })}

              {filteredLogs.length === 0 && (
                <div className="p-8 text-center text-xs text-slate-400 bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-800 rounded-xl">
                  ไม่พบรายการที่ตรงกับเงื่อนไขการค้นหา
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Selected Log Detail & Payload Inspector (7 cols) */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden flex flex-col min-h-[620px]">
            {activeLog ? (
              <>
                {/* Header of Active Log */}
                <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-wrap items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-bold text-slate-900 dark:text-white">
                        {activeLog.method} {activeLog.endpoint}
                      </span>
                      {getEngineBadge(activeLog.engine)}
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-3 font-mono">
                      <span>ID: {activeLog.id}</span>
                      <span>•</span>
                      <span>เวลา: {new Date(activeLog.timestamp).toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Latency Pill & Action */}
                  <div className="flex items-center gap-2">
                    <div className={`px-3 py-1.5 rounded-lg border font-mono font-bold text-xs flex items-center gap-1.5 ${getLatencyColor(activeLog.latencyMs)}`}>
                      <Clock className="w-3.5 h-3.5" />
                      <span>Latency: {activeLog.latencyMs} ms</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCopy(JSON.stringify(activeLog, null, 2), 'all')}
                      className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-medium flex items-center gap-1 cursor-pointer transition-colors"
                      title="คัดลอกข้อมูลการเรียกและผลลัพธ์ทั้งหมด"
                    >
                      {copiedKey === 'all' ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-600">คัดลอกแล้ว</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>คัดลอก Log</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Subtabs for Detail Inspection */}
                <div className="flex items-center border-b border-slate-200 dark:border-slate-800 px-4 text-xs bg-white dark:bg-slate-900">
                  <button
                    type="button"
                    onClick={() => setDetailTab('overview')}
                    className={`px-4 py-2.5 font-medium border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                      detailTab === 'overview'
                        ? 'border-indigo-600 text-indigo-700 dark:text-indigo-400 dark:border-indigo-400'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>ภาพรวม & ค่าตัวเลข (Overview)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDetailTab('response')}
                    className={`px-4 py-2.5 font-medium border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                      detailTab === 'response'
                        ? 'border-indigo-600 text-indigo-700 dark:text-indigo-400 dark:border-indigo-400'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <FileJson className="w-3.5 h-3.5" />
                    <span>Response Payload (JSON)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDetailTab('request')}
                    className={`px-4 py-2.5 font-medium border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                      detailTab === 'request'
                        ? 'border-indigo-600 text-indigo-700 dark:text-indigo-400 dark:border-indigo-400'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <Code className="w-3.5 h-3.5" />
                    <span>Request Payload</span>
                  </button>
                </div>

                {/* Tab 1: Overview */}
                {detailTab === 'overview' && (
                  <div className="p-4 space-y-4 flex-1 overflow-y-auto text-xs">
                    {/* Execution Engine & Status Card */}
                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-3">
                      <div className="font-semibold text-slate-900 dark:text-white flex items-center justify-between">
                        <span>สรุปการประมวลผล (Execution Summary)</span>
                        <span className="font-mono text-[11px] text-slate-500">
                          Status: {activeLog.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                        <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                          <span className="text-slate-400 block mb-0.5">Engine ที่รัน</span>
                          <span className="font-semibold font-mono text-slate-800 dark:text-slate-200">
                            {activeLog.engine}
                          </span>
                        </div>
                        <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                          <span className="text-slate-400 block mb-0.5">Latency</span>
                          <span className="font-semibold font-mono text-slate-800 dark:text-slate-200">
                            {activeLog.latencyMs} ms
                          </span>
                        </div>
                        <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                          <span className="text-slate-400 block mb-0.5">ภาษาต้นทาง</span>
                          <span className="font-semibold font-mono text-slate-800 dark:text-slate-200">
                            {activeLog.requestPayload.language}
                          </span>
                        </div>
                        <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                          <span className="text-slate-400 block mb-0.5">ภาษาเป้าหมาย</span>
                          <span className="font-semibold font-mono text-slate-800 dark:text-slate-200">
                            {activeLog.requestPayload.targetLanguage}
                          </span>
                        </div>
                      </div>

                      {/* Error or Notice notice */}
                      {activeLog.errorMessage && (
                        <div className="p-2.5 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                          <div>
                            <strong className="block font-semibold">ข้อผิดพลาดที่บันทึกได้:</strong>
                            <span>{activeLog.errorMessage}</span>
                          </div>
                        </div>
                      )}

                      {activeLog.responsePayload?.notice && (
                        <div className="p-2.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-blue-800 dark:text-blue-300 flex items-start gap-2">
                          <Sparkles className="w-4 h-4 shrink-0 mt-0.5 text-blue-600" />
                          <div>
                            <strong className="block font-semibold">บันทึกข้อความจากเซิร์ฟเวอร์ (Notice):</strong>
                            <span>{activeLog.responsePayload.notice}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Returned Data Highlights */}
                    {activeLog.responsePayload && (
                      <div className="space-y-2">
                        <h4 className="font-semibold text-slate-900 dark:text-white">
                          องค์ประกอบในผลลัพธ์ (Payload Highlights)
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                            <span className="text-slate-500 dark:text-slate-400 block mb-1">ขั้นตอนการทำงาน (Steps)</span>
                            <span className="text-lg font-bold font-mono text-indigo-600 dark:text-indigo-400">
                              {activeLog.responsePayload.steps?.length || 0} ขั้นตอน
                            </span>
                          </div>

                          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                            <span className="text-slate-500 dark:text-slate-400 block mb-1">สัญลักษณ์ถอดรหัส (Symbols)</span>
                            <span className="text-lg font-bold font-mono text-purple-600 dark:text-purple-400">
                              {activeLog.responsePayload.decodedSymbolsTable?.length || 0} รายการ
                            </span>
                          </div>

                          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                            <span className="text-slate-500 dark:text-slate-400 block mb-1">ประเมินความปลอดภัย (Risk)</span>
                            <span className="text-sm font-bold font-mono uppercase text-emerald-600 dark:text-emerald-400">
                              {activeLog.responsePayload.securityAssessment?.riskLevel || 'SAFE'}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Request Code Snippet Preview */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-slate-500">
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          สคริปต์ที่ส่งไปวิเคราะห์ในรอบนี้ ({activeLog.requestPayload.code.split('\n').length} บรรทัด)
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopy(activeLog.requestPayload.code, 'code')}
                          className="hover:text-slate-900 text-[11px] flex items-center gap-1 cursor-pointer"
                        >
                          {copiedKey === 'code' ? 'คัดลอกแล้ว' : 'คัดลอกโค้ด'}
                        </button>
                      </div>
                      <pre className="p-3 rounded-xl bg-slate-950 text-slate-200 font-mono text-[11px] overflow-x-auto max-h-48 border border-slate-800 leading-relaxed">
                        {activeLog.requestPayload.code}
                      </pre>
                    </div>
                  </div>
                )}

                {/* Tab 2: Full Response Payload (JSON) */}
                {detailTab === 'response' && (
                  <div className="p-4 flex-1 flex flex-col space-y-2 overflow-hidden text-xs">
                    <div className="flex items-center justify-between text-slate-500">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900 dark:text-white">
                          โครงสร้างข้อมูล Response JSON ทั้งหมด
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {activeLog.responseSizeKb ? `(${activeLog.responseSizeKb} KB)` : ''}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleCopy(JSON.stringify(activeLog.responsePayload, null, 2), 'response-json')}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-md text-[11px] font-medium flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          {copiedKey === 'response-json' ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span className="text-emerald-600">คัดลอกสำเร็จ</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>คัดลอก Response JSON</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="flex-1 overflow-auto rounded-xl border border-slate-800 bg-[#0b0f19]">
                      <pre className="p-4 text-emerald-300 font-mono text-[11px] leading-relaxed whitespace-pre overflow-x-auto selection:bg-indigo-500 selection:text-white">
                        {JSON.stringify(activeLog.responsePayload, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}

                {/* Tab 3: Request Payload */}
                {detailTab === 'request' && (
                  <div className="p-4 flex-1 flex flex-col space-y-3 overflow-hidden text-xs">
                    <div className="flex items-center justify-between text-slate-500">
                      <span className="font-semibold text-slate-900 dark:text-white">
                        HTTP POST Body Payload
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopy(JSON.stringify(activeLog.requestPayload, null, 2), 'req-json')}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-md text-[11px] font-medium flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        {copiedKey === 'req-json' ? 'คัดลอกสำเร็จ' : 'คัดลอก Request JSON'}
                      </button>
                    </div>

                    <div className="flex-1 overflow-auto rounded-xl border border-slate-800 bg-[#0b0f19]">
                      <pre className="p-4 text-cyan-300 font-mono text-[11px] leading-relaxed whitespace-pre overflow-x-auto">
                        {JSON.stringify(activeLog.requestPayload, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="p-12 text-center text-slate-400">
                กรุณาเลือกรายการการเรียก API ทางด้านซ้ายเพื่อดูรายละเอียด
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
