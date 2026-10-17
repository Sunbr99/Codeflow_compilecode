import React, { useState, useRef, useMemo } from 'react';
import JSZip from 'jszip';
import {
  ShieldAlert,
  ShieldCheck,
  Shield,
  FolderArchive,
  FolderUp,
  FileCode,
  Upload,
  Play,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Download,
  FileText,
  Copy,
  Check,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Code2,
  Layers,
  Sparkles,
  Info,
  Trash2,
  Eye,
  Filter,
  Search,
  ArrowRight,
  Lock,
  Flame,
  Radio,
} from 'lucide-react';
import {
  ScriptFileItem,
  CollectiveSecurityReport,
  FileSecurityReport,
  ScriptVulnerability,
  VulnerabilitySeverity,
} from '../types';
import { SAMPLE_BATCH_PACKS, SampleBatchPack } from '../data/sampleBatchPacks';

interface BatchSecurityAuditProps {
  onLoadScriptToEditor: (code: string, language: string, title: string) => void;
  onClose?: () => void;
}

export const BatchSecurityAudit: React.FC<BatchSecurityAuditProps> = ({
  onLoadScriptToEditor,
  onClose,
}) => {
  const [files, setFiles] = useState<ScriptFileItem[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState<string>('');
  const [report, setReport] = useState<CollectiveSecurityReport | null>(null);
  const [reportTab, setReportTab] = useState<'matrix' | 'files' | 'chains' | 'plan'>('matrix');

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSeverityFilter, setSelectedSeverityFilter] = useState<string>('all');
  const [previewFile, setPreviewFile] = useState<ScriptFileItem | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // File Inputs
  const zipInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);
  const filesInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Helper to detect language
  const detectLanguage = (path: string): string => {
    const ext = path.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'js':
      case 'mjs':
      case 'cjs':
      case 'jsx':
        return 'javascript';
      case 'ts':
      case 'tsx':
        return 'typescript';
      case 'py':
        return 'python';
      case 'php':
        return 'php';
      case 'sh':
      case 'bash':
        return 'shell';
      case 'go':
        return 'go';
      case 'java':
        return 'java';
      case 'c':
      case 'cpp':
      case 'h':
        return 'c/cpp';
      case 'rb':
        return 'ruby';
      case 'sql':
        return 'sql';
      default:
        return 'auto';
    }
  };

  // ZIP File Handler (using JSZip)
  const handleZipFile = async (file: File) => {
    setIsAnalyzing(true);
    setAnalysisProgress(`กำลังแตกไฟล์และอ่านสคริปต์จาก ZIP: ${file.name}...`);
    try {
      const zip = await JSZip.loadAsync(file);
      const extracted: ScriptFileItem[] = [];

      const entries = Object.keys(zip.files);
      const binaryExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.ico', '.pdf', '.exe', '.dll', '.so', '.dylib', '.zip', '.tar', '.gz', '.woff', '.woff2'];

      for (const relativePath of entries) {
        const entry = zip.files[relativePath];
        if (entry.dir) continue;
        if (relativePath.includes('__MACOSX') || relativePath.includes('.DS_Store') || relativePath.startsWith('.')) continue;

        const isBinary = binaryExtensions.some((ext) => relativePath.toLowerCase().endsWith(ext));
        if (isBinary) continue;

        try {
          const content = await entry.async('text');
          if (content && content.trim().length > 0) {
            const fileName = relativePath.split('/').pop() || relativePath;
            extracted.push({
              id: `f-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
              name: fileName,
              path: relativePath,
              content,
              sizeBytes: new Blob([content]).size,
              lineCount: content.split('\n').length,
              language: detectLanguage(relativePath),
              isSelected: true,
            });
          }
        } catch {}
      }

      if (extracted.length > 0) {
        setFiles((prev) => [...prev, ...extracted]);
      }
    } catch (err: any) {
      alert(`ไม่สามารถเปิดไฟล์ ZIP ได้: ${err?.message || 'รูปแบบไฟล์ไม่ถูกต้อง'}`);
    } finally {
      setIsAnalyzing(false);
      setAnalysisProgress('');
      if (zipInputRef.current) zipInputRef.current.value = '';
    }
  };

  // Folder Upload Handler
  const handleFolderUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = e.target.files;
    if (!uploadedFiles || uploadedFiles.length === 0) return;

    const newFiles: ScriptFileItem[] = [];
    const readers: Promise<void>[] = [];

    Array.from(uploadedFiles).forEach((file: any) => {
      const path = file.webkitRelativePath || file.name;
      const isSystem = path.includes('.git/') || path.includes('node_modules/') || path.includes('.DS_Store');
      if (isSystem) return;

      const p = new Promise<void>((resolve) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const content = event.target?.result as string;
          if (content && typeof content === 'string') {
            newFiles.push({
              id: `f-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
              name: file.name,
              path,
              content,
              sizeBytes: file.size,
              lineCount: content.split('\n').length,
              language: detectLanguage(path),
              isSelected: true,
            });
          }
          resolve();
        };
        reader.onerror = () => resolve();
        reader.readAsText(file);
      });
      readers.push(p);
    });

    Promise.all(readers).then(() => {
      if (newFiles.length > 0) {
        setFiles((prev) => [...prev, ...newFiles]);
      }
      if (folderInputRef.current) folderInputRef.current.value = '';
    });
  };

  // Multiple Files Upload Handler
  const handleMultipleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = e.target.files;
    if (!uploadedFiles || uploadedFiles.length === 0) return;

    const newFiles: ScriptFileItem[] = [];
    const readers: Promise<void>[] = [];

    Array.from(uploadedFiles).forEach((fileItem: any) => {
      const file = fileItem as File;
      if (file.name.endsWith('.zip')) {
        handleZipFile(file);
        return;
      }

      const p = new Promise<void>((resolve) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const content = event.target?.result as string;
          if (content && typeof content === 'string') {
            newFiles.push({
              id: `f-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
              name: file.name,
              path: file.name,
              content,
              sizeBytes: file.size,
              lineCount: content.split('\n').length,
              language: detectLanguage(file.name),
              isSelected: true,
            });
          }
          resolve();
        };
        reader.onerror = () => resolve();
        reader.readAsText(file);
      });
      readers.push(p);
    });

    Promise.all(readers).then(() => {
      if (newFiles.length > 0) {
        setFiles((prev) => [...prev, ...newFiles]);
      }
      if (filesInputRef.current) filesInputRef.current.value = '';
    });
  };

  // Drag and Drop Handler
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files) as File[];
      const zipFile = droppedFiles.find((f: File) => f.name.toLowerCase().endsWith('.zip'));

      if (zipFile) {
        handleZipFile(zipFile);
      } else {
        const newFiles: ScriptFileItem[] = [];
        const readers: Promise<void>[] = [];

        droppedFiles.forEach((file: File) => {
          const p = new Promise<void>((resolve) => {
            const reader = new FileReader();
            reader.onload = (ev) => {
              const content = ev.target?.result as string;
              if (content) {
                newFiles.push({
                  id: `f-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
                  name: file.name,
                  path: file.name,
                  content,
                  sizeBytes: file.size,
                  lineCount: content.split('\n').length,
                  language: detectLanguage(file.name),
                  isSelected: true,
                });
              }
              resolve();
            };
            reader.readAsText(file);
          });
          readers.push(p);
        });

        Promise.all(readers).then(() => {
          setFiles((prev) => [...prev, ...newFiles]);
        });
      }
    }
  };

  // Load Preset Pack
  const handleLoadSamplePack = (pack: SampleBatchPack) => {
    const loaded: ScriptFileItem[] = pack.files.map((f, i) => ({
      id: `preset-${pack.id}-${i}-${Date.now()}`,
      name: f.name,
      path: f.path,
      content: f.content,
      sizeBytes: new Blob([f.content]).size,
      lineCount: f.content.split('\n').length,
      language: f.language,
      isSelected: true,
    }));
    setFiles(loaded);
    setReport(null);
  };

  // Run Batch Analysis
  const runBatchAnalysis = async () => {
    const selectedFiles = files.filter((f) => f.isSelected);
    if (selectedFiles.length === 0) {
      alert('กรุณาเลือกอย่างน้อย 1 ไฟล์เพื่อทำการวิเคราะห์');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisProgress(`กำลังวิเคราะห์ความปลอดภัยของสคริปต์ ${selectedFiles.length} ไฟล์...`);

    try {
      const payload = {
        files: selectedFiles.map((f) => ({
          path: f.path,
          name: f.name,
          content: f.content,
          language: f.language,
        })),
      };

      const resp = await fetch('/api/batch-security-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!resp.ok) {
        throw new Error(`API Error: ${resp.status} ${resp.statusText}`);
      }

      const reportData: CollectiveSecurityReport = await resp.json();
      setReport(reportData);
    } catch (err: any) {
      alert(`การวิเคราะห์ขัดข้อง: ${err?.message || 'กรุณาลองใหม่อีกครั้ง'}`);
    } finally {
      setIsAnalyzing(false);
      setAnalysisProgress('');
    }
  };

  // Filtered files for detailed report view
  const filteredFileReports = useMemo(() => {
    if (!report) return [];
    return report.fileReports.filter((fr) => {
      if (selectedSeverityFilter !== 'all') {
        if (selectedSeverityFilter === 'safe' && fr.riskLevel !== 'safe') return false;
        if (selectedSeverityFilter === 'critical' && fr.riskLevel !== 'critical') return false;
        if (selectedSeverityFilter === 'high' && fr.riskLevel !== 'high') return false;
        if (selectedSeverityFilter === 'medium' && fr.riskLevel !== 'medium') return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = fr.fileName.toLowerCase().includes(q) || fr.filePath.toLowerCase().includes(q);
        const matchesSummary = fr.summary.toLowerCase().includes(q);
        const matchesVuln = fr.vulnerabilities.some(
          (v) => v.title.toLowerCase().includes(q) || (v.cwe && v.cwe.toLowerCase().includes(q))
        );
        return matchesName || matchesSummary || matchesVuln;
      }
      return true;
    });
  }, [report, selectedSeverityFilter, searchQuery]);

  // Download Markdown Report
  const handleDownloadMarkdown = () => {
    if (!report) return;

    let md = `# 🛡️ Collective Security Audit Report (รายงานความปลอดภัยระดับชุดสคริปต์)
**Report ID**: \`${report.reportId}\`  
**Generated At**: ${new Date(report.generatedAt).toLocaleString()}  
**Total Files Analyzed**: ${report.totalFilesAnalyzed}  
**Total Lines Analyzed**: ${report.totalLinesAnalyzed}  
**Overall Security Score**: **${report.overallScore}/100** (Grade: ${getGrade(report.overallScore)})  
**Collective Risk Level**: **${report.overallRiskLevel}**  
**Engine Used**: \`${report.engineUsed}\`  

---

## 1. Executive Summary
${report.executiveSummary}

### Key Strategic Findings:
${report.keyFindings.map((f) => `- ${f}`).join('\n')}

---

## 2. Vulnerability Statistics
- 🚨 **Critical Vulnerabilities**: ${report.vulnerabilityCounts.critical}
- ⚠️ **High Vulnerabilities**: ${report.vulnerabilityCounts.high}
- ⚡ **Medium Vulnerabilities**: ${report.vulnerabilityCounts.medium}
- ℹ️ **Low Vulnerabilities**: ${report.vulnerabilityCounts.low}
- ✅ **Completely Clean Files**: ${report.vulnerabilityCounts.safeFiles} of ${report.totalFilesAnalyzed}

---

## 3. Comparative Vulnerability Matrix
| File Path | Language | Risk Level | Score | Primary Vulnerability Findings |
|---|---|---|---|---|
${report.fileReports
  .map(
    (fr) =>
      `| \`${fr.filePath}\` | ${fr.language} | **${fr.riskLevel.toUpperCase()}** | ${fr.riskScore}/100 | ${
        fr.vulnerabilities.length > 0
          ? fr.vulnerabilities.map((v) => `${v.title} (${v.cwe || v.severity})`).join(', ')
          : 'None (Clean)'
      } |`
  )
  .join('\n')}

---

## 4. Cross-Script Attack Surface Chains
${
  report.crossScriptChains.length === 0
    ? 'No cross-script vulnerability chaining detected.'
    : report.crossScriptChains
        .map(
          (c, idx) => `### Chain ${idx + 1}: ${c.vector}
- **From File**: \`${c.fromFile}\`
- **To Target**: \`${c.toFile}\`
- **Severity**: **${c.severity}**
- **Risk Detail**: ${c.riskDescription}
`
        )
        .join('\n')
}

---

## 5. Prioritized Action Plan
${report.remediationPlan
  .map(
    (plan) => `### [${plan.priority}] ${plan.action}
**Affected Files**: ${plan.affectedFiles.map((f) => `\`${f}\``).join(', ')}  
**Fix Guidance**: ${plan.codeFixGuidance}
`
  )
  .join('\n')}

---

*Report automatically generated by CodeFlow Decompiler & Batch Security Engine.*
`;

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Security_Audit_Report_${report.reportId}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Download JSON Report
  const handleDownloadJson = () => {
    if (!report) return;
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Security_Audit_Report_${report.reportId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Copy helper
  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  function getGrade(score: number): string {
    if (score >= 90) return 'A+ (Excellent)';
    if (score >= 80) return 'A (Secure)';
    if (score >= 70) return 'B (Good)';
    if (score >= 55) return 'C (Moderate Risk)';
    if (score >= 40) return 'D (High Risk)';
    return 'F (Critical Action Required)';
  }

  function getScoreColor(score: number): string {
    if (score >= 80) return 'text-emerald-400 border-emerald-500 bg-emerald-950/30';
    if (score >= 60) return 'text-amber-400 border-amber-500 bg-amber-950/30';
    if (score >= 40) return 'text-orange-400 border-orange-500 bg-orange-950/30';
    return 'text-rose-400 border-rose-500 bg-rose-950/30';
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden flex flex-col space-y-4 p-4 text-slate-800">
      {/* Top Banner */}
      <div className="p-4 rounded-xl bg-slate-900 text-white flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-400 animate-pulse" />
            <h2 className="text-base font-bold text-slate-100">
              การตรวจสอบความปลอดภัยทั้งชุดสคริปต์ (Batch Security Audit & Vulnerability Matrix)
            </h2>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-rose-950 text-rose-300 border border-rose-800">
              Multi-Script / ZIP / Folder
            </span>
          </div>
          <p className="text-xs text-slate-300">
            อัปโหลดโฟลเดอร์หรือไฟล์ ZIP เพื่อให้ AI และ Static Analyzer ตรวจหาช่องโหว่เปรียบเทียบข้ามไฟล์ (Cross-Script Vulnerability Comparison) พร้อมรายงานสรุปความเสี่ยงภาพรวม
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2 shrink-0">
          {report && (
            <>
              <button
                type="button"
                onClick={handleDownloadMarkdown}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors shadow-2xs"
                title="ดาวน์โหลดรายงานสรุปแบบ Markdown (.md)"
              >
                <Download className="w-3.5 h-3.5 text-slate-400" />
                <span>โหลดรายงาน (.md)</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadJson}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors shadow-2xs"
                title="ดาวน์โหลดข้อมูล JSON"
              >
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                <span>โหลด JSON</span>
              </button>
            </>
          )}

          {files.length > 0 && (
            <button
              type="button"
              onClick={runBatchAnalysis}
              disabled={isAnalyzing}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-md cursor-pointer ${
                isAnalyzing
                  ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/30'
              }`}
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>กำลังวิเคราะห์...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>เริ่มตรวจสอบความปลอดภัย ({files.filter((f) => f.isSelected).length} ไฟล์)</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Hidden File Inputs */}
      <input
        ref={zipInputRef}
        type="file"
        accept=".zip"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleZipFile(f);
        }}
      />
      {/* Folder input with webkitdirectory */}
      <input
        ref={folderInputRef}
        type="file"
        // @ts-ignore
        webkitdirectory="true"
        directory="true"
        multiple
        className="hidden"
        onChange={handleFolderUpload}
      />
      <input
        ref={filesInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleMultipleFiles}
      />

      {/* Upload Zone & Preset Loaders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Dropzone Box */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`lg:col-span-2 border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center transition-all ${
            isDragging
              ? 'border-emerald-500 bg-emerald-50/60'
              : 'border-slate-300 bg-slate-50/50 hover:bg-slate-50'
          }`}
        >
          <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mb-3 text-emerald-600">
            <Upload className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-800 mb-1">
            ลากวางไฟล์ ZIP หรือเลือกโฟลเดอร์สคริปต์ที่นี่
          </h3>
          <p className="text-xs text-slate-500 max-w-md mb-4">
            รองรับไฟล์ ZIP, โฟลเดอร์โปรเจกต์ (Folder Directory), และไฟล์สคริปต์หลายไฟล์พร้อมกัน (.js, .ts, .py, .php, .sh, .go, .java ฯลฯ)
          </p>

          <div className="flex items-center flex-wrap justify-center gap-2.5">
            <button
              type="button"
              onClick={() => zipInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-white border border-slate-300 hover:border-slate-400 text-slate-700 text-xs font-semibold shadow-2xs hover:bg-slate-100 cursor-pointer transition-colors"
            >
              <FolderArchive className="w-4 h-4 text-emerald-600" />
              <span>เลือกไฟล์ ZIP Archive (.zip)</span>
            </button>

            <button
              type="button"
              onClick={() => folderInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-white border border-slate-300 hover:border-slate-400 text-slate-700 text-xs font-semibold shadow-2xs hover:bg-slate-100 cursor-pointer transition-colors"
            >
              <FolderUp className="w-4 h-4 text-blue-600" />
              <span>เลือกโฟลเดอร์ (Directory)</span>
            </button>

            <button
              type="button"
              onClick={() => filesInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-white border border-slate-300 hover:border-slate-400 text-slate-700 text-xs font-semibold shadow-2xs hover:bg-slate-100 cursor-pointer transition-colors"
            >
              <FileCode className="w-4 h-4 text-purple-600" />
              <span>เลือกหลายไฟล์ (Multiple Files)</span>
            </button>
          </div>
        </div>

        {/* 1-Click Sample Preset Packs */}
        <div className="border border-slate-200 bg-slate-50/60 rounded-xl p-4 flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 mb-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>ชุดสคริปต์ตัวอย่างสำหรับทดสอบ (Demo Packs):</span>
            </div>
            <p className="text-[11px] text-slate-500 mb-2">
              คลิกเพื่อโหลดชุดสคริปต์จำลองและทดสอบการเปรียบเทียบช่องโหว่ได้ทันที:
            </p>
          </div>

          <div className="space-y-2">
            {SAMPLE_BATCH_PACKS.map((pack) => (
              <button
                key={pack.id}
                type="button"
                onClick={() => handleLoadSamplePack(pack)}
                className="w-full text-left p-2.5 rounded-lg bg-white border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/40 transition-all cursor-pointer shadow-2xs group flex items-start justify-between gap-2"
              >
                <div>
                  <div className="font-semibold text-xs text-slate-800 group-hover:text-emerald-700">
                    {pack.name}
                  </div>
                  <div className="text-[10px] text-slate-500 line-clamp-1">
                    {pack.description}
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 shrink-0 mt-1 transition-transform group-hover:translate-x-0.5" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Progress Notification */}
      {isAnalyzing && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-3 text-xs text-emerald-800 animate-pulse">
          <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" />
          <span className="font-medium">{analysisProgress || 'กำลังประมวลผลข้อมูล...'}</span>
        </div>
      )}

      {/* Uploaded File Queue Manager */}
      {files.length > 0 && (
        <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
          <div className="px-4 py-2.5 bg-slate-100/70 border-b border-slate-200 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-700">รายการสคริปต์ในคิว</span>
              <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 font-mono text-[10px]">
                {files.length} ไฟล์ ({files.reduce((a, c) => a + c.lineCount, 0)} บรรทัด)
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  const allSelected = files.every((f) => f.isSelected);
                  setFiles(files.map((f) => ({ ...f, isSelected: !allSelected })));
                }}
                className="text-xs text-slate-600 hover:text-slate-900 underline"
              >
                {files.every((f) => f.isSelected) ? 'ยกเลิกการเลือกทั้งหมด' : 'เลือกทั้งหมด'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setFiles([]);
                  setReport(null);
                }}
                className="text-xs text-rose-600 hover:text-rose-800 inline-flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" />
                <span>ล้างรายการ</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto max-h-48 divide-y divide-slate-100 text-xs">
            {files.map((f) => (
              <div
                key={f.id}
                className="px-4 py-2 flex items-center justify-between hover:bg-slate-50 transition-colors gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <input
                    type="checkbox"
                    checked={f.isSelected}
                    onChange={(e) => {
                      setFiles(
                        files.map((item) =>
                          item.id === f.id ? { ...item, isSelected: e.target.checked } : item
                        )
                      );
                    }}
                    className="rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                  />
                  <div className="min-w-0">
                    <span className="font-mono text-xs font-semibold text-slate-800 truncate block">
                      {f.path}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {f.lineCount} lines • {(f.sizeBytes / 1024).toFixed(1)} KB
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-100 text-slate-700 border border-slate-200">
                    {f.language}
                  </span>
                  <button
                    type="button"
                    onClick={() => setPreviewFile(f)}
                    className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200"
                    title="ดูเนื้อหาโค้ด"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setFiles(files.filter((item) => item.id !== f.id))}
                    className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                    title="ลบออกจากคิว"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Collective Security Report Section */}
      {report && (
        <div className="space-y-4 pt-2">
          {/* Executive KPI Scorecard */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {/* Score Gauge Card */}
            <div className={`p-4 rounded-xl border flex flex-col justify-between ${getScoreColor(report.overallScore)}`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider">คะแนนความปลอดภัยภาพรวม</span>
                <Shield className="w-4 h-4" />
              </div>
              <div className="my-2">
                <span className="text-3xl font-extrabold font-mono">{report.overallScore}</span>
                <span className="text-sm font-normal text-slate-400"> / 100</span>
                <div className="text-xs font-bold mt-0.5">
                  เกรด: {getGrade(report.overallScore)}
                </div>
              </div>
              <div className="text-[11px] opacity-80">
                ระดับความเสี่ยง: <span className="font-bold underline">{report.overallRiskLevel}</span>
              </div>
            </div>

            {/* Criticals & Highs */}
            <div className="p-4 rounded-xl border border-rose-800/50 bg-rose-950/20 flex flex-col justify-between text-rose-300">
              <div className="flex items-center justify-between text-xs font-bold">
                <span>ช่องโหว่วิกฤติ (Critical / RCE)</span>
                <Flame className="w-4 h-4 text-rose-400" />
              </div>
              <div className="my-2">
                <span className="text-3xl font-extrabold font-mono text-rose-400">
                  {report.vulnerabilityCounts.critical}
                </span>
                <span className="text-xs text-rose-300/80 ml-1">จุด</span>
              </div>
              <div className="text-[11px] text-rose-300/90">
                ความเสี่ยงสูง (High): <span className="font-bold">{report.vulnerabilityCounts.high}</span> จุด
              </div>
            </div>

            {/* Medium & Low */}
            <div className="p-4 rounded-xl border border-amber-800/50 bg-amber-950/20 flex flex-col justify-between text-amber-300">
              <div className="flex items-center justify-between text-xs font-bold">
                <span>ช่องโหว่ปานกลาง & ต่ำ</span>
                <AlertTriangle className="w-4 h-4 text-amber-400" />
              </div>
              <div className="my-2">
                <span className="text-3xl font-extrabold font-mono text-amber-400">
                  {report.vulnerabilityCounts.medium + report.vulnerabilityCounts.low}
                </span>
                <span className="text-xs text-amber-300/80 ml-1">จุด</span>
              </div>
              <div className="text-[11px] text-amber-300/90">
                Medium: {report.vulnerabilityCounts.medium} | Low: {report.vulnerabilityCounts.low}
              </div>
            </div>

            {/* Safe Files Ratio */}
            <div className="p-4 rounded-xl border border-emerald-800/50 bg-emerald-950/20 flex flex-col justify-between text-emerald-300">
              <div className="flex items-center justify-between text-xs font-bold">
                <span>สคริปต์ที่ปลอดภัย (100% Clean)</span>
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="my-2">
                <span className="text-3xl font-extrabold font-mono text-emerald-400">
                  {report.vulnerabilityCounts.safeFiles}
                </span>
                <span className="text-xs text-emerald-300/80 ml-1">/ {report.totalFilesAnalyzed} ไฟล์</span>
              </div>
              <div className="text-[11px] text-emerald-300/90">
                เครื่องมือ: {report.engineUsed}
              </div>
            </div>
          </div>

          {/* Executive Summary Card */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-100 text-sm">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>สรุปภาพรวมความมั่นคงปลอดภัยของระบบ (Executive Summary)</span>
            </div>
            <p className="leading-relaxed text-slate-300">{report.executiveSummary}</p>

            {report.keyFindings.length > 0 && (
              <div className="pt-2 border-t border-slate-800">
                <span className="font-semibold text-slate-300 block mb-1">ข้อค้นพบเชิงกลยุทธ์สำคัญ:</span>
                <ul className="list-disc pl-5 space-y-1 text-slate-400">
                  {report.keyFindings.map((finding, idx) => (
                    <li key={idx}>{finding}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Report Sub-Tabs */}
          <div className="border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs">
              <button
                type="button"
                onClick={() => setReportTab('matrix')}
                className={`py-2 px-3 border-b-2 font-semibold transition-colors flex items-center gap-1.5 ${
                  reportTab === 'matrix'
                    ? 'border-emerald-600 text-emerald-700'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>ตารางเปรียบเทียบช่องโหว่ (Vulnerability Matrix)</span>
              </button>

              <button
                type="button"
                onClick={() => setReportTab('files')}
                className={`py-2 px-3 border-b-2 font-semibold transition-colors flex items-center gap-1.5 ${
                  reportTab === 'files'
                    ? 'border-emerald-600 text-emerald-700'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <FileCode className="w-3.5 h-3.5" />
                <span>รายละเอียดรายไฟล์ ({report.fileReports.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setReportTab('chains')}
                className={`py-2 px-3 border-b-2 font-semibold transition-colors flex items-center gap-1.5 ${
                  reportTab === 'chains'
                    ? 'border-emerald-600 text-emerald-700'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Radio className="w-3.5 h-3.5" />
                <span>ความเสี่ยงข้ามสคริปต์ (Cross-Script Chains: {report.crossScriptChains.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setReportTab('plan')}
                className={`py-2 px-3 border-b-2 font-semibold transition-colors flex items-center gap-1.5 ${
                  reportTab === 'plan'
                    ? 'border-emerald-600 text-emerald-700'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>แผนปรับปรุงความปลอดภัย (Remediation Plan)</span>
              </button>
            </div>
          </div>

          {/* Tab 1: Comparative Vulnerability Matrix (Heatmap Table) */}
          {reportTab === 'matrix' && (
            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-900 text-slate-200 border-b border-slate-800 text-[11px]">
                      <th className="p-3 font-semibold">ไฟล์สคริปต์ (Script Path)</th>
                      <th className="p-3 font-semibold text-center">ภาษา</th>
                      <th className="p-3 font-semibold text-center">ระดับความเสี่ยง</th>
                      <th className="p-3 font-semibold text-center">คะแนน</th>
                      <th className="p-3 font-semibold text-center">Command & Eval</th>
                      <th className="p-3 font-semibold text-center">Secrets & Auth</th>
                      <th className="p-3 font-semibold text-center">SSRF & Network</th>
                      <th className="p-3 font-semibold text-center">Obfuscation</th>
                      <th className="p-3 font-semibold text-right">การจัดการ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {report.fileReports.map((fr) => {
                      const counts = report.vulnerabilityMatrix.fileScores[fr.fileName] || {
                        'Command & Code Injection': 0,
                        'Hardcoded Secrets & Auth': 0,
                        'SSRF & Network Exposure': 0,
                        'Obfuscation & Backdoors': 0,
                      };

                      const riskBadge =
                        fr.riskLevel === 'critical'
                          ? 'bg-rose-100 text-rose-800 border-rose-300'
                          : fr.riskLevel === 'high'
                          ? 'bg-orange-100 text-orange-800 border-orange-300'
                          : fr.riskLevel === 'medium'
                          ? 'bg-amber-100 text-amber-800 border-amber-300'
                          : fr.riskLevel === 'low'
                          ? 'bg-blue-100 text-blue-800 border-blue-300'
                          : 'bg-emerald-100 text-emerald-800 border-emerald-300';

                      return (
                        <tr key={fr.filePath} className="hover:bg-slate-50 transition-colors">
                          <td className="p-3 font-mono font-semibold text-slate-800">
                            {fr.filePath}
                          </td>
                          <td className="p-3 text-center">
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-100 text-slate-700 border border-slate-200">
                              {fr.language}
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase ${riskBadge}`}>
                              {fr.riskLevel}
                            </span>
                          </td>
                          <td className="p-3 text-center font-mono font-bold">
                            <span className={fr.riskScore < 50 ? 'text-rose-600' : fr.riskScore < 80 ? 'text-amber-600' : 'text-emerald-600'}>
                              {fr.riskScore}
                            </span>
                          </td>
                          <td className="p-3 text-center font-mono">
                            {counts['Command & Code Injection'] > 0 ? (
                              <span className="px-1.5 py-0.5 rounded bg-rose-500 text-white font-bold text-[10px]">
                                {counts['Command & Code Injection']}
                              </span>
                            ) : (
                              <span className="text-slate-300">-</span>
                            )}
                          </td>
                          <td className="p-3 text-center font-mono">
                            {counts['Hardcoded Secrets & Auth'] > 0 ? (
                              <span className="px-1.5 py-0.5 rounded bg-orange-500 text-white font-bold text-[10px]">
                                {counts['Hardcoded Secrets & Auth']}
                              </span>
                            ) : (
                              <span className="text-slate-300">-</span>
                            )}
                          </td>
                          <td className="p-3 text-center font-mono">
                            {counts['SSRF & Network Exposure'] > 0 ? (
                              <span className="px-1.5 py-0.5 rounded bg-amber-500 text-white font-bold text-[10px]">
                                {counts['SSRF & Network Exposure']}
                              </span>
                            ) : (
                              <span className="text-slate-300">-</span>
                            )}
                          </td>
                          <td className="p-3 text-center font-mono">
                            {counts['Obfuscation & Backdoors'] > 0 ? (
                              <span className="px-1.5 py-0.5 rounded bg-purple-500 text-white font-bold text-[10px]">
                                {counts['Obfuscation & Backdoors']}
                              </span>
                            ) : (
                              <span className="text-slate-300">-</span>
                            )}
                          </td>
                          <td className="p-3 text-right">
                            <button
                              type="button"
                              onClick={() => {
                                const targetFile = files.find((f) => f.path === fr.filePath || f.name === fr.fileName);
                                if (targetFile) {
                                  onLoadScriptToEditor(targetFile.content, targetFile.language, targetFile.name);
                                }
                              }}
                              className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 hover:text-emerald-800 hover:underline"
                              title="เปิดสคริปต์นี้ใน CodeFlow Decompiler & Simulator"
                            >
                              <span>เปิดใน Editor</span>
                              <ExternalLink className="w-3 h-3" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab 2: Detailed File-by-File Vulnerabilities */}
          {reportTab === 'files' && (
            <div className="space-y-3">
              {/* Filter & Search Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs">
                <div className="flex items-center gap-2">
                  <Filter className="w-3.5 h-3.5 text-slate-500" />
                  <span className="font-semibold text-slate-700">กรองตามความรุนแรง:</span>
                  <select
                    value={selectedSeverityFilter}
                    onChange={(e) => setSelectedSeverityFilter(e.target.value)}
                    className="bg-white border border-slate-300 rounded px-2 py-1 text-xs"
                  >
                    <option value="all">แสดงทั้งหมด ({report.fileReports.length})</option>
                    <option value="critical">เฉพาะ Critical</option>
                    <option value="high">เฉพาะ High</option>
                    <option value="medium">เฉพาะ Medium</option>
                    <option value="safe">เฉพาะไฟล์ที่ปลอดภัย (Safe)</option>
                  </select>
                </div>

                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="ค้นหาชื่อไฟล์, CWE หรือช่องโหว่..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-white border border-slate-300 rounded-lg pl-8 pr-3 py-1 text-xs w-60"
                  />
                </div>
              </div>

              {/* File Cards */}
              <div className="space-y-3">
                {filteredFileReports.map((fr) => (
                  <div
                    key={fr.filePath}
                    className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs"
                  >
                    {/* Header */}
                    <div className="p-3 bg-slate-100/60 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <FileCode className="w-4 h-4 text-slate-600" />
                        <span className="font-mono font-bold text-xs text-slate-800">
                          {fr.filePath}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-200 text-slate-700">
                          {fr.language}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            fr.riskLevel === 'critical'
                              ? 'bg-rose-100 text-rose-800'
                              : fr.riskLevel === 'high'
                              ? 'bg-orange-100 text-orange-800'
                              : fr.riskLevel === 'medium'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {fr.riskLevel} (Score: {fr.riskScore}/100)
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          const targetFile = files.find((f) => f.path === fr.filePath || f.name === fr.fileName);
                          if (targetFile) {
                            onLoadScriptToEditor(targetFile.content, targetFile.language, targetFile.name);
                          }
                        }}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 text-xs font-semibold cursor-pointer shadow-2xs transition-colors shrink-0"
                      >
                        <Code2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>แกะโค้ดใน Main Editor</span>
                      </button>
                    </div>

                    {/* Summary & Vulnerabilities */}
                    <div className="p-3 text-xs space-y-3">
                      <p className="text-slate-600">{fr.summary}</p>

                      {fr.vulnerabilities.length === 0 ? (
                        <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>ไม่พบช่องโหว่ความปลอดภัยที่เป็นอันตรายในไฟล์นี้</span>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {fr.vulnerabilities.map((v) => {
                            const sevPill =
                              v.severity === 'CRITICAL'
                                ? 'bg-rose-600 text-white'
                                : v.severity === 'HIGH'
                                ? 'bg-orange-600 text-white'
                                : v.severity === 'MEDIUM'
                                ? 'bg-amber-500 text-white'
                                : 'bg-blue-600 text-white';

                            return (
                              <div
                                key={v.id}
                                className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 space-y-1.5"
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <div className="flex items-center gap-2">
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${sevPill}`}>
                                      {v.severity}
                                    </span>
                                    {v.cwe && (
                                      <span className="px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 font-mono text-[10px]">
                                        {v.cwe}
                                      </span>
                                    )}
                                    <span className="font-bold text-slate-800">{v.title}</span>
                                    {typeof v.lineNumber === 'number' && (
                                      <span className="text-[11px] text-slate-400 font-mono">
                                        (บรรทัดที่ {v.lineNumber})
                                      </span>
                                    )}
                                  </div>
                                </div>

                                {v.snippet && (
                                  <pre className="p-2 rounded bg-slate-900 text-rose-300 font-mono text-[11px] overflow-x-auto">
                                    {v.snippet}
                                  </pre>
                                )}

                                <p className="text-slate-600">{v.description}</p>

                                <div className="p-2 rounded bg-emerald-50/80 border border-emerald-200/80 text-[11px] text-emerald-900 flex items-start gap-1.5">
                                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                                  <div>
                                    <span className="font-bold">แนวทางแก้ไข (Remediation): </span>
                                    <span>{v.remediation}</span>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 3: Cross-Script Attack Surface Chains */}
          {reportTab === 'chains' && (
            <div className="space-y-3 text-xs">
              {report.crossScriptChains.length === 0 ? (
                <div className="p-6 text-center text-slate-500 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <ShieldCheck className="w-6 h-6 text-emerald-600 mx-auto" />
                  <div className="font-bold text-slate-800">ไม่พบความเชื่อมโยงช่องโหว่ข้ามสคริปต์ (Zero Cross-Script Risk Chains)</div>
                  <p className="text-xs">แต่ละโมดูลไม่มีการส่งต่อพารามิเตอร์ที่นำไปสู่ช่องโหว่ประเภท RCE หรือ Sink อันตรายในโมดูลอื่น</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {report.crossScriptChains.map((c, i) => (
                    <div
                      key={i}
                      className="p-3.5 rounded-xl border border-rose-200 bg-rose-50/40 space-y-2 text-rose-950"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-rose-900">{c.vector}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-600 text-white">
                          {c.severity}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 font-mono text-[11px] bg-white p-2 rounded border border-rose-200">
                        <span className="text-slate-800 font-semibold">{c.fromFile}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                        <span className="text-rose-700 font-semibold">{c.toFile}</span>
                      </div>
                      <p className="text-xs text-rose-800 leading-relaxed">{c.riskDescription}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab 4: Prioritized Remediation Action Plan */}
          {reportTab === 'plan' && (
            <div className="space-y-3 text-xs">
              {report.remediationPlan.map((plan, i) => (
                <div
                  key={i}
                  className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2.5 py-0.5 rounded text-[11px] font-bold ${
                          plan.priority.includes('P1')
                            ? 'bg-rose-600 text-white'
                            : plan.priority.includes('P2')
                            ? 'bg-orange-600 text-white'
                            : 'bg-amber-500 text-white'
                        }`}
                      >
                        {plan.priority}
                      </span>
                      <span className="font-bold text-sm text-slate-800">{plan.action}</span>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-500 flex items-center gap-1.5 flex-wrap">
                    <span className="font-semibold text-slate-700">ไฟล์ที่ต้องแก้ไข:</span>
                    {plan.affectedFiles.map((af, j) => (
                      <span key={j} className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 font-mono text-slate-700">
                        {af}
                      </span>
                    ))}
                  </div>

                  <div className="p-3 rounded-lg bg-emerald-50/70 border border-emerald-200 text-emerald-900 leading-relaxed">
                    <span className="font-bold">แนวทางโค้ดแก้ไข (Code Guidance): </span>
                    <span>{plan.codeFixGuidance}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Code Preview Drawer / Modal */}
      {previewFile && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-slate-800 rounded-xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="px-4 py-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-slate-300 text-xs">
              <div className="flex items-center gap-2">
                <FileCode className="w-4 h-4 text-emerald-400" />
                <span className="font-bold font-mono">{previewFile.path}</span>
                <span className="text-[10px] text-slate-400">({previewFile.lineCount} บรรทัด)</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleCopy(previewFile.content, 'preview')}
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono"
                >
                  {copiedKey === 'preview' ? 'Copied' : 'Copy'}
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewFile(null)}
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs"
                >
                  ปิด
                </button>
              </div>
            </div>
            <pre className="p-4 font-mono text-[11px] text-slate-300 overflow-auto flex-1 whitespace-pre leading-relaxed">
              {previewFile.content}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
