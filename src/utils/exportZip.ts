import JSZip from 'jszip';
import { AnalysisResult } from '../types';

export function getFileExtension(language: string): string {
  const lang = (language || '').toLowerCase().trim();
  switch (lang) {
    case 'python':
      return 'py';
    case 'javascript':
      return 'js';
    case 'typescript':
      return 'ts';
    case 'php':
      return 'php';
    case 'shell':
    case 'bash':
      return 'sh';
    case 'powershell':
      return 'ps1';
    case 'c':
      return 'c';
    case 'cpp':
      return 'cpp';
    case 'csharp':
      return 'cs';
    case 'java':
      return 'java';
    case 'go':
    case 'golang':
      return 'go';
    case 'rust':
      return 'rs';
    case 'ruby':
      return 'rb';
    case 'lua':
      return 'lua';
    case 'perl':
      return 'pl';
    case 'sql':
      return 'sql';
    default:
      return 'txt';
  }
}

/**
 * Download the complete application codebase (Node.js + React + Express) as a standalone ZIP
 */
export async function downloadAppProjectZip(): Promise<void> {
  try {
    const res = await fetch('/api/export-project-zip');
    if (!res.ok) {
      throw new Error(`Export API returned status ${res.status}`);
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const downloadLink = document.createElement('a');
    downloadLink.href = url;
    downloadLink.download = 'codeflow-decompiler-app.zip';
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(url);
  } catch {
    // Graceful fallback to direct navigation link if fetch fails
    const downloadLink = document.createElement('a');
    downloadLink.href = '/api/export-project-zip';
    downloadLink.download = 'codeflow-decompiler-app.zip';
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  }
}

/**
 * Generate and download an analysis report ZIP containing the original script,
 * decompiled script, execution trace JSON, decoded symbols CSV, and Markdown audit report.
 */
export async function downloadAnalysisPackageZip(
  originalCode: string,
  analysis: AnalysisResult | null,
  sourceLang: string,
  targetLang: string
): Promise<void> {
  const zip = new JSZip();
  const sourceExt = getFileExtension(sourceLang);
  const targetExt = getFileExtension(targetLang);
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);

  // 1. Original Source Script
  zip.file(`source_script.${sourceExt}`, originalCode);

  // 2. Decompiled & Deobfuscated Script
  if (analysis?.decompiledCode) {
    zip.file(`decompiled_code.${targetExt}`, analysis.decompiledCode);
  }

  // 3. Execution Simulation Steps (JSON)
  if (analysis?.steps && analysis.steps.length > 0) {
    zip.file('execution_steps_trace.json', JSON.stringify(analysis.steps, null, 2));
  }

  // 4. Decoded Symbols Table (CSV)
  if (analysis?.decodedSymbolsTable && analysis.decodedSymbolsTable.length > 0) {
    const csvHeader = 'Obfuscated Symbol,Deobfuscated Meaning,Raw Value,Decoded Value\n';
    const csvRows = analysis.decodedSymbolsTable
      .map((s) => {
        const escapeCsv = (val?: string) => `"${(val || '').replace(/"/g, '""')}"`;
        return `${escapeCsv(s.obfuscatedName)},${escapeCsv(s.deobfuscatedMeaning)},${escapeCsv(s.exampleRawValue)},${escapeCsv(s.decodedValue)}`;
      })
      .join('\n');
    zip.file('decoded_symbols.csv', csvHeader + csvRows);
  }

  // 5. Executive Summary Report (Markdown)
  const reportMarkdown = `# รายงานผลการวิเคราะห์และแกะโค้ดสคริปต์ (CodeFlow Analysis Report)
วันที่วิเคราะห์: ${new Date().toLocaleString('th-TH')}
ภาษาที่ตรวจพบ: ${analysis?.languageDetected || sourceLang}
ภาษาเป้าหมายที่แปลงค่า: ${targetLang}
ระดับความเสี่ยงด้านความปลอดภัย: ${analysis?.securityAssessment?.riskLevel?.toUpperCase() || 'SAFE'}

## สรุปภาพรวมของสคริปต์ (Script Summary)
${analysis?.scriptSummary || 'ไม่มีข้อมูลสรุป'}

## เทคนิค Obfuscation / Transpilation ที่ตรวจพบ
${
  analysis?.obfuscationPatternsFound && analysis.obfuscationPatternsFound.length > 0
    ? analysis.obfuscationPatternsFound.map((p) => `- ${p}`).join('\n')
    : '- โครงสร้างโค้ดมาตรฐาน'
}

## การประเมินความปลอดภัย (Security Audit)
- **ระดับความเสี่ยง**: ${analysis?.securityAssessment?.riskLevel || 'safe'}
- **ข้อสังเกต**: ${analysis?.securityAssessment?.notes || 'ไม่มีข้อบ่งชี้ความเสี่ยง'}
${
  analysis?.securityAssessment?.suspiciousPatterns && analysis.securityAssessment.suspiciousPatterns.length > 0
    ? `\n**พฤติกรรมที่ควรระวัง:**\n${analysis.securityAssessment.suspiciousPatterns.map((p) => `- ${p}`).join('\n')}`
    : ''
}

## ตารางสัญลักษณ์ที่ถอดรหัสแล้ว (Decoded Symbols)
| สัญลักษณ์เดิม (Obfuscated) | ความหมายจริง | ค่าที่ถอดรหัสได้ |
|---|---|---|
${
  analysis?.decodedSymbolsTable && analysis.decodedSymbolsTable.length > 0
    ? analysis.decodedSymbolsTable.map((s) => `| \`${s.obfuscatedName}\` | ${s.deobfuscatedMeaning} | \`${s.decodedValue}\` |`).join('\n')
    : '| - | ไม่พบสัญลักษณ์เข้ารหัส | - |'
}

## ลำดับการประมวลผล (Execution Steps Count)
- จำนวนขั้นตอนที่จำลอง: ${analysis?.steps?.length || 0} ขั้นตอน

---
สร้างโดย **CodeFlow Decompiler & Logic Visualizer**
`;
  zip.file('SUMMARY_REPORT.md', reportMarkdown);

  // Generate Blob and trigger download
  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `codeflow-analysis-${sourceLang}-to-${targetLang}-${timestamp}.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
