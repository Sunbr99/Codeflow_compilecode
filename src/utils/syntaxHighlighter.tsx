import React from 'react';
import { TokenSpan } from './diffEngine';

interface SyntaxHighlighterProps {
  text: string;
  language?: string;
  diffType?: 'unchanged' | 'added' | 'removed' | 'modified';
  tokens?: TokenSpan[];
  highlightChangedWords?: boolean;
}

const JS_KEYWORDS = new Set([
  'function', 'return', 'var', 'let', 'const', 'if', 'else', 'switch', 'case', 'default',
  'while', 'for', 'do', 'break', 'continue', 'class', 'extends', 'import', 'from', 'export',
  'async', 'await', 'yield', 'try', 'catch', 'finally', 'throw', 'typeof', 'instanceof',
  'void', 'new', 'this', 'super', 'debugger', 'interface', 'type', 'enum'
]);

const PY_KEYWORDS = new Set([
  'def', 'return', 'if', 'elif', 'else', 'while', 'for', 'in', 'not', 'and', 'or', 'is',
  'try', 'except', 'finally', 'raise', 'with', 'as', 'lambda', 'yield', 'pass', 'class',
  'import', 'from', 'global', 'nonlocal', 'assert', 'async', 'await'
]);

const GO_KEYWORDS = new Set([
  'func', 'package', 'import', 'return', 'if', 'else', 'for', 'range', 'switch', 'case',
  'default', 'go', 'chan', 'select', 'defer', 'type', 'struct', 'interface', 'var', 'const',
  'map', 'make', 'len', 'cap'
]);

const BUILTINS = new Set([
  'true', 'false', 'null', 'undefined', 'None', 'True', 'False', 'nil', 'NaN', 'Infinity',
  'console', 'log', 'print', 'len', 'range', 'document', 'window', 'Math', 'JSON',
  'Array', 'Object', 'Promise', 'Map', 'Set', 'list', 'dict', 'str', 'int', 'float', 'bool'
]);

/**
 * Tokenize a single text chunk into typed syntax elements
 */
function tokenizeCodeString(text: string, lang: string): React.ReactNode[] {
  if (!text) return [];

  // Line comments
  const trimmed = text.trim();
  if (trimmed.startsWith('//') || trimmed.startsWith('#')) {
    return [<span key="comment" className="text-slate-500 italic font-mono">{text}</span>];
  }

  // Regex for keywords, hex escapes, obfuscation identifiers, strings, numbers, operators
  const tokenRegex = /(\\x[0-9a-fA-F]{2}|\\u[0-9a-fA-F]{4}|0x[0-9a-fA-F]+|_0x[0-9a-fA-F]+|"[^"\\]*(?:\\.[^"\\]*)*"|'[^'\\]*(?:\\.[^'\\]*)*'|`[^`\\]*(?:\\.[^`\\]*)*`|\b[a-zA-Z_$][a-zA-Z0-9_$]*\b|\b[0-9]+(?:\.[0-9]+)?\b|===|!==|==|!=|=>|->|<=|>=|&&|\|\||[{}()[\].,;:+\-*/%&|^!~=<>])/g;

  const nodes: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  const lowerLang = (lang || '').toLowerCase();
  const isPython = lowerLang.includes('py');
  const isGo = lowerLang.includes('go');
  const keywords = isPython ? PY_KEYWORDS : isGo ? GO_KEYWORDS : JS_KEYWORDS;

  while ((match = tokenRegex.exec(text)) !== null) {
    // Gap before match
    if (match.index > lastIndex) {
      nodes.push(
        <span key={`gap-${lastIndex}`} className="text-slate-300">
          {text.substring(lastIndex, match.index)}
        </span>
      );
    }

    const token = match[0];
    const key = `tok-${match.index}-${token}`;

    // Hex escape sequences \x68
    if (/^\\x[0-9a-fA-F]{2}$/.test(token) || /^\\u[0-9a-fA-F]{4}$/.test(token)) {
      nodes.push(
        <span
          key={key}
          className="bg-amber-950/90 text-amber-300 font-bold px-0.5 rounded border border-amber-700/60 font-mono shadow-xs"
          title={`Hex literal: ${token}`}
        >
          {token}
        </span>
      );
    }
    // Obfuscated identifiers e.g. _0x34f1
    else if (/_0x[0-9a-fA-F]+/.test(token)) {
      nodes.push(
        <span
          key={key}
          className="text-pink-400 font-semibold underline decoration-dotted decoration-pink-500/70"
          title={`Obfuscated Identifier: ${token}`}
        >
          {token}
        </span>
      );
    }
    // Hex numbers 0x1a4
    else if (/^0x[0-9a-fA-F]+$/i.test(token)) {
      nodes.push(<span key={key} className="text-amber-400 font-mono">{token}</span>);
    }
    // Strings
    else if (/^("[^"]*"|'[^']*'|`[^`]*`)$/.test(token)) {
      nodes.push(<span key={key} className="text-emerald-300">{token}</span>);
    }
    // Language Keywords
    else if (keywords.has(token)) {
      nodes.push(<span key={key} className="text-purple-400 font-semibold">{token}</span>);
    }
    // Builtin types / constants
    else if (BUILTINS.has(token)) {
      nodes.push(<span key={key} className="text-sky-300 font-medium">{token}</span>);
    }
    // Numbers
    else if (/^[0-9]+(?:\.[0-9]+)?$/.test(token)) {
      nodes.push(<span key={key} className="text-orange-300 font-mono">{token}</span>);
    }
    // Operators
    else if (/^[+\-*/%^&|!=<>~?:]+$/.test(token)) {
      nodes.push(<span key={key} className="text-rose-400 font-bold">{token}</span>);
    }
    // Braces / Punctuation
    else if (/^[{}()[\].,;]$/.test(token)) {
      nodes.push(<span key={key} className="text-slate-400">{token}</span>);
    }
    // Identifiers
    else {
      nodes.push(<span key={key} className="text-cyan-200">{token}</span>);
    }

    lastIndex = tokenRegex.lastIndex;
  }

  // Trailing part
  if (lastIndex < text.length) {
    nodes.push(
      <span key={`tail-${lastIndex}`} className="text-slate-300">
        {text.substring(lastIndex)}
      </span>
    );
  }

  return nodes;
}

/**
 * Syntax-Aware Highlighted Code Line with optional word-diff marker
 */
export const SyntaxHighlightedLine: React.FC<SyntaxHighlighterProps> = ({
  text,
  language = 'javascript',
  diffType = 'unchanged',
  tokens,
  highlightChangedWords = true,
}) => {
  if (!text && (!tokens || tokens.length === 0)) {
    return <span className="text-slate-600 select-none">&nbsp;</span>;
  }

  // If word-level tokens are provided from diff comparison
  if (highlightChangedWords && tokens && tokens.length > 0) {
    return (
      <span className="font-mono text-[11px] leading-relaxed">
        {tokens.map((tok, idx) => {
          const renderedSyntax = tokenizeCodeString(tok.text, language);

          if (tok.isChanged) {
            // Changed token gets an informative inline highlight box
            const badgeClass =
              diffType === 'modified'
                ? 'bg-amber-950/70 border border-amber-600/60 rounded px-1 text-amber-200 shadow-xs'
                : diffType === 'added'
                ? 'bg-emerald-950/70 border border-emerald-600/60 rounded px-1 text-emerald-200 shadow-xs'
                : 'bg-rose-950/70 border border-rose-600/60 rounded px-1 text-rose-200 line-through opacity-85';

            return (
              <span key={idx} className={`inline-block my-0.2 mx-0.5 ${badgeClass}`}>
                {renderedSyntax}
              </span>
            );
          }

          return <React.Fragment key={idx}>{renderedSyntax}</React.Fragment>;
        })}
      </span>
    );
  }

  // Full line syntax parsing without word-level segmentation
  return (
    <span className="font-mono text-[11px] leading-relaxed">
      {tokenizeCodeString(text, language)}
    </span>
  );
};
