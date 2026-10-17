export type StepType =
  | 'variable'
  | 'flow'
  | 'loop'
  | 'decode'
  | 'call'
  | 'return'
  | 'io'
  | 'state';

export interface StateMutation {
  variable: string;
  oldValue?: string;
  newValue: string;
  type?: string;
  note?: string;
}

export interface ExecutionStep {
  stepIndex: number;
  lineNumber: number;
  codeSnippet: string;
  actionTitle: string;
  thaiExplanation: string;
  stepType: StepType;
  stateMutations?: StateMutation[];
  variablesSnapshot?: Record<string, any>;
  consoleOutput?: string | null;
  reverseTip?: string;
  executionTimeMs?: number; // e.g. 0.42 ms
  memoryFootprintKb?: number; // e.g. 14.8 KB
}

export interface DecodedSymbol {
  obfuscatedName: string;
  deobfuscatedMeaning: string;
  exampleRawValue?: string;
  decodedValue: string;
}

export interface FlowNode {
  id: string;
  label: string;
  type: 'start' | 'process' | 'condition' | 'loop' | 'end';
  line?: number;
  description?: string;
}

export interface SecurityAssessment {
  riskLevel: 'safe' | 'suspicious' | 'malicious';
  notes: string;
  suspiciousPatterns?: string[];
}

export interface AnalysisResult {
  languageDetected: string;
  scriptSummary: string;
  obfuscationPatternsFound: string[];
  securityAssessment?: SecurityAssessment;
  steps: ExecutionStep[];
  decompiledCode: string;
  decompiledExplanation?: string;
  decodedSymbolsTable: DecodedSymbol[];
  flowchart: FlowNode[];
  isFallback?: boolean;
  executionEngine?: 'local-sandbox' | 'local-preset' | 'cloud-gemini';
  notice?: string;
  errorNotice?: string;
}

export interface ApiInteractionLog {
  id: string;
  timestamp: string; // ISO string
  endpoint: string;
  method: 'POST' | 'GET' | 'PRESET-CACHE';
  status: number | 'CACHED' | 'ERROR';
  latencyMs: number;
  engine: 'cloud-gemini' | 'local-sandbox' | 'local-preset' | 'unknown';
  requestPayload: {
    code: string;
    language: string;
    targetLanguage: string;
    mode?: string;
  };
  responsePayload: any;
  isSuccess: boolean;
  errorMessage?: string;
  responseSizeKb?: number;
}

export interface PresetScript {
  id: string;
  title: string;
  language: string;
  category: string;
  description: string;
  defaultTargetLanguage: string;
  code: string;
  precomputedAnalysis?: AnalysisResult;
}

export interface ScriptFileItem {
  id: string;
  name: string;
  path: string;
  content: string;
  sizeBytes: number;
  lineCount: number;
  language: string;
  isSelected: boolean;
}

export type VulnerabilitySeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'SAFE';

export interface ScriptVulnerability {
  id: string;
  title: string;
  severity: VulnerabilitySeverity;
  cwe?: string;
  lineNumber?: number;
  snippet?: string;
  description: string;
  impact: string;
  remediation: string;
}

export interface FileSecurityReport {
  filePath: string;
  fileName: string;
  language: string;
  lineCount: number;
  riskLevel: 'safe' | 'low' | 'medium' | 'high' | 'critical';
  riskScore: number; // 0 - 100
  vulnerabilities: ScriptVulnerability[];
  summary: string;
  cleanCodeRecommendation?: string;
}

export interface CrossScriptRiskChain {
  fromFile: string;
  toFile: string;
  riskDescription: string;
  severity: VulnerabilitySeverity;
  vector: string;
}

export interface CollectiveSecurityReport {
  reportId: string;
  generatedAt: string;
  totalFilesAnalyzed: number;
  totalLinesAnalyzed: number;
  overallScore: number; // 0-100 (100 = safest, Grade A)
  overallRiskLevel: 'SAFE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  vulnerabilityCounts: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    safeFiles: number;
  };
  executiveSummary: string;
  keyFindings: string[];
  fileReports: FileSecurityReport[];
  crossScriptChains: CrossScriptRiskChain[];
  vulnerabilityMatrix: {
    categories: string[];
    fileScores: Record<string, Record<string, number>>;
  };
  remediationPlan: Array<{
    priority: 'P1 - Immediate' | 'P2 - High' | 'P3 - Moderate';
    action: string;
    affectedFiles: string[];
    codeFixGuidance: string;
  }>;
  engineUsed: 'cloud-gemini' | 'local-static-analyzer';
}
