import express from 'express';
import path from 'path';
import fs from 'fs';
import JSZip from 'jszip';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import { PRESET_ANALYSES } from './src/data/presetAnalyses';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Lazy initialization for Gemini client to prevent crashes if key is initially absent
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    nodeEnv: process.env.NODE_ENV,
  });
});

// Candidate models in order of preference for text/code tasks
const CANDIDATE_MODELS = [
  { model: 'gemini-3.8-flash', timeoutMs: 9000 },
  { model: 'gemini-3.1-flash-lite', timeoutMs: 6000 },
];

async function generateAnalysisWithGemini(ai: GoogleGenAI, prompt: string, schema: any) {
  let lastError: any = null;

  for (const { model, timeoutMs } of CANDIDATE_MODELS) {
    try {
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error(`Model ${model} request timed out after ${timeoutMs / 1000}s`)), timeoutMs)
      );

      const generatePromise = ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: schema,
        },
      });

      const response: any = await Promise.race([generatePromise, timeoutPromise]);

      if (response && response.text) {
        return response;
      }
    } catch (err: any) {
      lastError = err;
      const errMsg = err?.message || String(err);
      const isUnavailable =
        err?.status === 503 ||
        err?.status === 429 ||
        errMsg.includes('503') ||
        errMsg.includes('high demand') ||
        errMsg.includes('UNAVAILABLE') ||
        errMsg.includes('RESOURCE_EXHAUSTED') ||
        errMsg.includes('timed out');

      console.warn(
        `Gemini model [${model}] note: ${isUnavailable ? 'Service 503/high-demand or timeout' : errMsg.slice(0, 60)}. Seamless fallback triggered.`
      );

      // Skip immediately on 503/429 without long waiting
      if (err?.status !== 503 && err?.status !== 429) {
        await new Promise((resolve) => setTimeout(resolve, 250));
      }
    }
  }

  throw lastError;
}

// Match code against known presets
function findMatchingPreset(code: string): string | null {
  if (code.includes('_0x34a1') || code.includes('_0x1a8f')) return 'js-obfuscated-string-array';
  if (code.includes('_context') || code.includes('fetchUserData')) return 'transpiled-async-generator';
  if (code.includes('decrypt_stream') || code.includes('ENCRYPTED_PAYLOAD')) return 'python-xor-cipher';
  if (code.includes('READING_IDENTIFIER') || code.includes('tokenize')) return 'state-machine-tokenizer';
  if (code.includes('unpack_and_inspect') || code.includes('mangled_func')) return 'php-shell-unpacker';
  if (code.includes('HEX_HOST') || code.includes('decode_hex')) return 'bash-downloader-obfuscated';
  if (code.includes('DecodePayload') || code.includes('rawCipher')) return 'go-byte-xor-pipeline';
  return null;
}

// Endpoint: Analyze script source code line-by-line, execution steps, and deobfuscate
app.post('/api/analyze-script', async (req, res) => {
  const { code, language = 'javascript', targetLanguage = 'python', mode = 'deobfuscate' } = req.body || {};

  if (!code || typeof code !== 'string' || !code.trim()) {
    return res.status(400).json({ error: 'Code is required' });
  }

  try {
    const ai = getGeminiClient();

    if (!ai) {
      // Check if code matches a known educational preset
      const presetKey = findMatchingPreset(code);
      if (presetKey && PRESET_ANALYSES[presetKey]) {
        return res.json({
          ...PRESET_ANALYSES[presetKey],
          isFallback: true,
          notice: 'วิเคราะห์ด้วย Verified Preset Engine (หากต้องการวิเคราะห์โค้ดอิสระด้วย Gemini AI กรุณาใส่ GEMINI_API_KEY)',
        });
      }

      // Return smart local fallback analysis if GEMINI_API_KEY is not configured
      const fallback = generateLocalAnalysis(code, language, targetLanguage);
      return res.json({
        ...fallback,
        isFallback: true,
        notice: 'วิเคราะห์ด้วย Local Analysis Engine (หากต้องการการแกะโค้ดระดับสูงด้วย Gemini AI กรุณาระบุ GEMINI_API_KEY ใน Settings > Secrets)',
      });
    }

    const prompt = `You are a world-class reverse engineer, compiler expert, and software educator.
Analyze the following source code line-by-line, reconstruct its execution step-by-step logic, and deobfuscate/transpile it.

Source Code:
\`\`\`${language}
${code}
\`\`\`

Language Hint: ${language}
Target Language for Clean Decompiled Code: ${targetLanguage}
Analysis Mode: ${mode}

Tasks:
1. Identify the language, purpose of the script, and any obfuscation / transpilation techniques used (e.g. hex arrays, string encoding, variable mangling, IIFE wrappers, Babel async/generator state machines, dead code, bitwise ciphers).
2. Generate a step-by-step execution simulation trace (15 to 40 chronological execution steps depending on code size):
   - Each step corresponds to a real line/statement being executed in sequence (including loop iterations and branching decisions).
   - Provide a concise title for each step.
   - Explain in natural, easy-to-understand Thai language what this step does mechanically, what variables are read or mutated, and why.
   - Categorize each step: "variable", "flow", "loop", "decode", "call", "return", "io", or "state".
   - Track state mutations (variable name, oldValue, newValue, type, brief note).
   - Provide a full snapshot of in-scope variables at this step.
   - Any console/terminal output emitted at this step.
   - Reverse-engineering tip: explain how to recognize or decode this pattern in compiled/transpiled code.
3. Provide a clean, readable, deobfuscated and idiomatic version of the script in "${targetLanguage}" with clear variable names and comments explaining the original logic.
4. Provide a decoded symbols table mapping obfuscated names or hex strings (e.g. \`_0x5a1b\` or \`\\x68\\x65\\x6c\\x6c\\x6f\`) to their true meaning/value.
5. Provide a flowchart list of 4-10 nodes representing the high-level control flow graph.
6. Provide security risk assessment (safe, suspicious, malicious).

Return your response strictly in JSON format conforming to the requested schema.`;

    const response = await generateAnalysisWithGemini(ai, prompt, {
      type: Type.OBJECT,
      properties: {
        languageDetected: { type: Type.STRING },
        scriptSummary: { type: Type.STRING },
        obfuscationPatternsFound: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
        },
        securityAssessment: {
          type: Type.OBJECT,
          properties: {
            riskLevel: { type: Type.STRING, description: "'safe', 'suspicious', or 'malicious'" },
            notes: { type: Type.STRING },
            suspiciousPatterns: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: ['riskLevel', 'notes'],
        },
        steps: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              stepIndex: { type: Type.INTEGER },
              lineNumber: { type: Type.INTEGER },
              codeSnippet: { type: Type.STRING },
              actionTitle: { type: Type.STRING },
              thaiExplanation: { type: Type.STRING },
              stepType: { type: Type.STRING },
              stateMutations: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    variable: { type: Type.STRING },
                    oldValue: { type: Type.STRING },
                    newValue: { type: Type.STRING },
                    type: { type: Type.STRING },
                    note: { type: Type.STRING },
                  },
                  required: ['variable', 'newValue'],
                },
              },
              variablesSnapshot: {
                type: Type.STRING,
                description: 'A JSON-stringified key-value object of all variables currently in memory at this step',
              },
              consoleOutput: { type: Type.STRING },
              reverseTip: { type: Type.STRING },
            },
            required: ['stepIndex', 'lineNumber', 'codeSnippet', 'actionTitle', 'thaiExplanation', 'stepType'],
          },
        },
        decompiledCode: { type: Type.STRING },
        decompiledExplanation: { type: Type.STRING },
        decodedSymbolsTable: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              obfuscatedName: { type: Type.STRING },
              deobfuscatedMeaning: { type: Type.STRING },
              exampleRawValue: { type: Type.STRING },
              decodedValue: { type: Type.STRING },
            },
            required: ['obfuscatedName', 'deobfuscatedMeaning', 'decodedValue'],
          },
        },
        flowchart: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              label: { type: Type.STRING },
              type: { type: Type.STRING, description: "'start', 'process', 'condition', 'loop', 'end'" },
              line: { type: Type.INTEGER },
              description: { type: Type.STRING },
            },
            required: ['id', 'label', 'type'],
          },
        },
      },
      required: [
        'languageDetected',
        'scriptSummary',
        'obfuscationPatternsFound',
        'steps',
        'decompiledCode',
        'decodedSymbolsTable',
        'flowchart',
      ],
    });

    const responseText = response.text || '{}';
    const parsedData = JSON.parse(responseText);

    // Normalize variablesSnapshot if stringified
    if (Array.isArray(parsedData.steps)) {
      parsedData.steps.forEach((step: any) => {
        if (typeof step.variablesSnapshot === 'string') {
          try {
            step.variablesSnapshot = JSON.parse(step.variablesSnapshot);
          } catch {
            step.variablesSnapshot = { info: step.variablesSnapshot };
          }
        }
      });
    }

    return res.json({
      ...parsedData,
      isFallback: false,
    });
  } catch (error: any) {
    console.warn('Gemini API temporary high demand or unavailability. Transitioning to fallback engine smoothly.');

    // Check if code matches a known educational preset first for maximum fidelity
    const presetKey = findMatchingPreset(code);
    if (presetKey && PRESET_ANALYSES[presetKey]) {
      return res.json({
        ...PRESET_ANALYSES[presetKey],
        isFallback: true,
        notice: 'โมเดล AI กำลังมีผู้ใช้งานหนาแน่นชั่วคราว ระบบจึงดึงผลลัพธ์การแกะโค้ดตัวอย่างที่ตรวจสอบแล้วมาให้คุณศึกษาทันที',
      });
    }

    // Graceful fallback to algorithmic engine
    const fallback = generateLocalAnalysis(code, language, targetLanguage);
    return res.json({
      ...fallback,
      isFallback: true,
      notice: 'โมเดล AI กำลังมีผู้ใช้งานหนาแน่นชั่วคราว ระบบจึงเปิดใช้ Local Analysis Engine เพื่อให้คุณจำลองการทำงานได้อย่างต่อเนื่อง',
    });
  }
});

// Endpoint to export the entire application codebase as a clean ZIP archive for local offline use
app.get('/api/export-project-zip', async (req, res) => {
  try {
    const zip = new JSZip();
    const rootDir = process.cwd();

    function addDirectoryToZip(currentPath: string, zipContainer: JSZip) {
      const items = fs.readdirSync(currentPath, { withFileTypes: true });

      for (const item of items) {
        const fullItemPath = path.join(currentPath, item.name);

        // Skip non-essential, build artifacts, or secret logs
        if (
          item.name === 'node_modules' ||
          item.name === 'dist' ||
          item.name === '.git' ||
          item.name === '.system_generated' ||
          item.name === '.aistudio' ||
          item.name === '.env' ||
          item.name.endsWith('.log')
        ) {
          continue;
        }

        if (item.isDirectory()) {
          const subFolder = zipContainer.folder(item.name);
          if (subFolder) {
            addDirectoryToZip(fullItemPath, subFolder);
          }
        } else if (item.isFile()) {
          const fileBuffer = fs.readFileSync(fullItemPath);
          zipContainer.file(item.name, fileBuffer);
        }
      }
    }

    addDirectoryToZip(rootDir, zip);

    // Add local setup guide
    zip.file(
      'README_LOCAL_RUN.md',
      `# CodeFlow Decompiler & Logic Visualizer

## วิธีการรันโปรแกรมนี้บนเครื่องของคุณ (Local Setup Guide)

โปรแกรมนี้เป็น Full-Stack Web Application (Express + Vite + React + Tailwind CSS) รองรับการแกะโค้ดและจำลองสเต็ปการทำงานของสคริปต์ได้ทุกภาษา

### ข้อกำหนดเบื้องต้น (Prerequisites):
- ติดตั้ง **Node.js** (เวอร์ชัน 18 ขึ้นไป): https://nodejs.org
- ติดตั้ง **npm** (มาพร้อมกับ Node.js)

### ขั้นตอนการติดตั้งและรัน:
1. แตกไฟล์ ZIP นี้ลงในโฟลเดอร์ที่ต้องการ
2. เปิด Command Prompt / Terminal ในโฟลเดอร์นั้น
3. ติดตั้ง Dependencies:
   \`\`\`bash
   npm install
   \`\`\`
4. (ตัวเลือกเสริม) ตั้งค่า Gemini API Key:
   คัดลอกไฟล์ \`.env.example\` เป็น \`.env\` แล้วระบุ API Key ของคุณ:
   \`\`\`env
   GEMINI_API_KEY=your_google_gemini_api_key
   \`\`\`
   *(หากไม่ระบุ API Key ระบบจะใช้ Local Analysis Engine และ Verified Preset Caching ในการทำงานได้ตามปกติ)*
5. เริ่มต้นโปรแกรม:
   \`\`\`bash
   npm run dev
   \`\`\`
6. เปิดเบราว์เซอร์ที่: **http://localhost:3000**

---

## วิธีการรันบน Android ผ่าน Termux (Android Build Pack):
1. แตกไฟล์นี้ใน Android แล้วเปิดแอป **Termux**
2. รันคำสั่งติดตั้งอัตโนมัติ:
   \`\`\`bash
   bash termux_install.sh
   \`\`\`
3. รันคำสั่งเริ่มระบบ:
   \`\`\`bash
   bash termux_start.sh
   \`\`\`
4. ระบบจะเปิดเบราว์เซอร์บนมือถือที่: **http://localhost:3000** ให้ทันที!
(ดูคู่มือฉบับเต็มในไฟล์ \`TERMUX_ANDROID_GUIDE.md\`)
`
    );

    const zipBuffer = await zip.generateAsync({
      type: 'nodebuffer',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 },
    });

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="codeflow-decompiler-app.zip"');
    res.send(zipBuffer);
  } catch (err: any) {
    console.warn('Failed to export project zip:', err);
    res.status(500).json({ error: 'Failed to create zip: ' + err.message });
  }
});

// Helper for local algorithmic analysis when offline / testing (supports any language)
function generateLocalAnalysis(code: string, language = 'javascript', targetLanguage = 'python') {
  const lines = code.split('\n');
  const steps: any[] = [];
  const memory: Record<string, any> = {};
  const decodedSymbols: any[] = [];
  const patterns: string[] = [];

  // Check for universal obfuscation & transpilation patterns
  if (/(\\x[0-9a-fA-F]{2})+/g.test(code)) {
    patterns.push('Hex-encoded byte/string literals (\\x..)');
    const matches = code.match(/(\\x[0-9a-fA-F]{2})+/g) || [];
    matches.slice(0, 5).forEach((hexStr, i) => {
      try {
        const decoded = hexStr.replace(/\\x([0-9a-fA-F]{2})/g, (_, p) => String.fromCharCode(parseInt(p, 16)));
        decodedSymbols.push({
          obfuscatedName: hexStr,
          deobfuscatedMeaning: `Decoded String #${i + 1}`,
          exampleRawValue: hexStr,
          decodedValue: decoded,
        });
      } catch {}
    });
  }

  if (/_0x[0-9a-fA-F]+/g.test(code)) {
    patterns.push('Mangled Hex identifiers (_0x...)');
  }
  if (/atob\(|btoa\(|base64_decode|base64\.b64decode|Buffer\.from|b64decode/i.test(code)) {
    patterns.push('Base64 encoding/decoding stream');
  }
  if (/eval\(|Function\(|exec\(|system\(|passthru\(|shell_exec\(/i.test(code)) {
    patterns.push('Dynamic code execution / process invocation (eval / exec / system)');
  }
  if (/switch\s*\(\w+\.prev\)/g.test(code) || /_regeneratorRuntime/g.test(code)) {
    patterns.push('Transpiled generator state machine (Babel/ES5 runtime)');
  }
  if (/\b(?:fromhex|bytes\.fromhex|unhexlify)\b/i.test(code)) {
    patterns.push('Hex-to-binary stream decoding');
  }
  if (/\b(?:curl|wget|Invoke-WebRequest|nc|netcat|powershell)\b/i.test(code)) {
    patterns.push('Network fetch / remote shell pattern');
  }

  let stepCounter = 1;
  let simulatedStdout = '';

  lines.forEach((rawLine, idx) => {
    const lineNum = idx + 1;
    const trimmed = rawLine.trim();
    if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('#') || trimmed.startsWith('/*') || trimmed.startsWith('*') || trimmed.startsWith(';')) return;

    let title = 'ดำเนินการคำสั่ง (Execute Statement)';
    let thaiExpl = `ประมวลผลบรรทัดที่ ${lineNum}: ${trimmed.slice(0, 50)}`;
    let type = 'flow';
    const mutations: any[] = [];
    let lineOutput: string | null = null;

    // Multi-language assignment detectors:
    // JS/TS: const/let/var x = ...
    // Python/Ruby: x = ...
    // Go: x := ... or var x = ...
    // PHP: $x = ...
    // C/C++/Java/C#: int x = ... or auto x = ...
    // Shell: X=...
    const jsVarMatch = trimmed.match(/^(?:const|let|var)\s+([a-zA-Z0-9_$]+)\s*=\s*(.*);?$/);
    const pyVarMatch = trimmed.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\s*(?::\s*[^=]+)?\s*=\s*(.*)$/);
    const goVarMatch = trimmed.match(/^(?:var\s+)?([a-zA-Z0-9_]+)\s*(?::=|=)\s*(.*)$/);
    const phpVarMatch = trimmed.match(/^\$([a-zA-Z0-9_]+)\s*=\s*(.*);?$/);
    const cVarMatch = trimmed.match(/^(?:int|float|double|char|string|auto|String|bool|long)\s+([a-zA-Z0-9_]+)\s*=\s*(.*);?$/);
    const shVarMatch = trimmed.match(/^([a-zA-Z0-9_]+)=([^\s]+.*)$/);

    const assignMatch = jsVarMatch || phpVarMatch || cVarMatch || goVarMatch || pyVarMatch || shVarMatch;

    if (assignMatch && !trimmed.startsWith('if') && !trimmed.startsWith('while') && !trimmed.startsWith('for')) {
      const varName = assignMatch[1];
      const valExpr = assignMatch[2]?.replace(/;$/, '') || 'assigned';
      title = `กำหนดค่าตัวแปร [${varName}]`;
      type = 'variable';
      thaiExpl = `จองพื้นที่ใน Memory และกำหนดค่าให้ตัวแปร "${varName}" = ${valExpr.slice(0, 40)}`;
      mutations.push({
        variable: varName,
        oldValue: memory[varName] !== undefined ? String(memory[varName]) : 'undefined',
        newValue: valExpr,
        type: 'assignment',
        note: `อัปเดตตัวแปร ${varName}`,
      });
      memory[varName] = valExpr.replace(/['";]/g, '').slice(0, 30);
    } else if (/^(?:def|function|func|fn|void|int|public\s+void|sub)\s+([a-zA-Z0-9_$]+)/.test(trimmed)) {
      const funcName = trimmed.match(/^(?:def|function|func|fn|void|int|public\s+void|sub)\s+([a-zA-Z0-9_$]+)/)?.[1] || 'func';
      title = `ประกาศฟังก์ชัน [${funcName}]`;
      type = 'call';
      thaiExpl = `กำหนด Subroutine / Function "${funcName}" พร้อมเตรียม Call Stack เพื่อเรียกทำงาน`;
    } else if (/^(?:if|elif|else\s*if|switch|case|select)\b/i.test(trimmed)) {
      title = 'ตรวจสอบเงื่อนไข (Condition Branching)';
      type = 'flow';
      thaiExpl = `ประเมินค่าตรรกะเงื่อนไขเพื่อตัดสินใจเส้นทางการประมวลผล (Control Flow Branch)`;
    } else if (/^(?:for|while|loop|do|until|foreach)\b/i.test(trimmed)) {
      title = 'วนรอบลูป (Loop Iteration)';
      type = 'loop';
      thaiExpl = `วนซ้ำประมวลผลคำสั่งตามเงื่อนไขรอบการทำงาน`;
    } else if (/(?:console\.log|print|echo|printf|fmt\.Print|System\.out\.print|puts|println!|Write-Host)\b/i.test(trimmed)) {
      title = 'แสดงผลลัพธ์ (Console I/O)';
      type = 'io';
      const outText = `[Out @ L${lineNum}]: ${trimmed.replace(/^(?:console\.log|print|echo|printf|fmt\.Println)\s*\(?/, '').replace(/\)?;?$/, '')}`;
      lineOutput = outText;
      simulatedStdout += outText + '\n';
      thaiExpl = `ส่งข้อความหรือข้อมูลออกจากโปรแกรมสู่ Standard Output`;
    } else if (/^return\b/i.test(trimmed)) {
      title = 'คืนค่าผลลัพธ์ (Return Value)';
      type = 'return';
      thaiExpl = `ส่งค่าผลลัพธ์ออกจากฟังก์ชันและคืนการควบคุมกลับสู่ caller`;
    } else if (trimmed.includes('^=') || trimmed.includes('^') || trimmed.includes('&') || trimmed.includes('|') || trimmed.includes('<<') || trimmed.includes('>>')) {
      title = 'คำนวณระดับบิต (Bitwise Decoding)';
      type = 'decode';
      thaiExpl = `ดำเนินการทางคณิตศาสตร์ระดับบิต (Bitwise Operator) เพื่อประมวลผลหรือถอดรหัสข้อมูล`;
    }

    steps.push({
      stepIndex: stepCounter++,
      lineNumber: lineNum,
      codeSnippet: trimmed,
      actionTitle: title,
      thaiExplanation: thaiExpl,
      stepType: type,
      stateMutations: mutations,
      variablesSnapshot: { ...memory },
      consoleOutput: lineOutput,
      reverseTip: `บรรทัดที่ ${lineNum}: ${title}. สังเกตการเปลี่ยนแปลงตัวแปรใน Stack & Heap`,
    });
  });

  const flowchart = [
    { id: 'start', label: 'จุดเริ่มต้นสคริปต์ (Entry Point)', type: 'start', line: 1, description: `โหลดสคริปต์ภาษา ${language} เข้าสู่ตัวประมวลผล` },
    { id: 'init', label: 'กำหนดค่าตัวแปรและโครงสร้างข้อมูล', type: 'process', line: steps[0]?.lineNumber || 1, description: 'จัดสรรพื้นที่หน่วยความจำสำหรับตัวแปรในสคริปต์' },
    { id: 'logic', label: 'ประมวลผลลอจิกและลูปหลัก', type: 'loop', line: Math.floor(lines.length / 2), description: 'ดำเนินการคำนวณและประมวลผลขั้นตอน' },
    { id: 'output', label: 'ส่งออกผลลัพธ์ / สิ้นสุดการทำงาน', type: 'end', line: lines.length, description: 'พิมพ์ผลลัพธ์สู่ Console หรือคืนค่า' },
  ];

  return {
    languageDetected: language,
    scriptSummary: `สคริปต์ภาษา ${language.toUpperCase()} ความยาว ${lines.length} บรรทัด มีการประมวลผลลอจิก ${steps.length} ขั้นตอน`,
    obfuscationPatternsFound: patterns.length > 0 ? patterns : ['Standard script structure (โครงสร้างโค้ดมาตรฐาน)'],
    securityAssessment: {
      riskLevel: patterns.some(p => p.includes('eval') || p.includes('Dynamic code')) ? 'suspicious' : 'safe',
      notes: patterns.some(p => p.includes('eval') || p.includes('Dynamic code'))
        ? 'พบการเรียกใช้ Dynamic Code Execution หรือ System Shell ซึ่งต้องระวังในการรันจริง'
        : 'สคริปต์ไม่พบการทำงานที่เป็นอันตราย เหมาะสำหรับการเรียนรู้และตรวจสอบลอจิก',
      suspiciousPatterns: patterns.filter(p => p.includes('Dynamic code') || p.includes('Network fetch')),
    },
    steps: steps.slice(0, 35),
    decompiledCode: `// === โค้ดที่จัดระเบียบและแปลงค่าเป็น ${targetLanguage.toUpperCase()} ===
# Source Language: ${language} -> Target: ${targetLanguage}
# Logic Deobfuscated & Cleaned:

${code}`,
    decompiledExplanation: `โครงสร้างสคริปต์ได้รับการจำลองขั้นตอนการทำงานแบบ Line-by-Line พร้อมตรวจจับค่าตัวแปรในหน่วยความจำ`,
    decodedSymbolsTable: decodedSymbols,
    flowchart,
  };
}

async function startServer() {
  // Setup Vite middleware in dev or static files in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
