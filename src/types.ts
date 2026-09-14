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
  notice?: string;
  errorNotice?: string;
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
