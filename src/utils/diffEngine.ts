export type DiffLineType = 'unchanged' | 'added' | 'removed' | 'modified';

export interface TokenSpan {
  text: string;
  isChanged: boolean;
}

export interface AlignedDiffRow {
  id: string;
  type: DiffLineType;
  origLineNumber?: number;
  origText?: string;
  decLineNumber?: number;
  decText?: string;
  origTokens?: TokenSpan[];
  decTokens?: TokenSpan[];
}

export interface UnifiedDiffLine {
  id: string;
  type: DiffLineType;
  origLineNumber?: number;
  decLineNumber?: number;
  text: string;
  prefix: '+' | '-' | '~' | ' ';
  tokens?: TokenSpan[];
}

export interface DiffStats {
  totalOrigLines: number;
  totalDecLines: number;
  addedLines: number;
  removedLines: number;
  modifiedLines: number;
  unchangedLines: number;
  totalChanges: number;
  changePercentage: number;
}

/**
 * Tokenize a line into words/identifiers, symbols, and whitespace
 */
function tokenizeWords(line: string): string[] {
  if (!line) return [];
  const tokens: string[] = [];
  const regex = /([a-zA-Z0-9_$]+|\s+|[^\s\w])/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(line)) !== null) {
    tokens.push(match[0]);
  }
  return tokens;
}

/**
 * Simple LCS-based token diff between two lines to highlight changed words
 */
export function computeWordDiff(
  lineA: string,
  lineB: string
): { wordsA: TokenSpan[]; wordsB: TokenSpan[] } {
  const tokensA = tokenizeWords(lineA);
  const tokensB = tokenizeWords(lineB);

  // If either is empty
  if (tokensA.length === 0) {
    return {
      wordsA: [],
      wordsB: tokensB.map((t) => ({ text: t, isChanged: true })),
    };
  }
  if (tokensB.length === 0) {
    return {
      wordsA: tokensA.map((t) => ({ text: t, isChanged: true })),
      wordsB: [],
    };
  }

  // Bound computation for safety on very long single lines
  const maxTokens = 120;
  const aSlice = tokensA.slice(0, maxTokens);
  const bSlice = tokensB.slice(0, maxTokens);

  const m = aSlice.length;
  const n = bSlice.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (aSlice[i - 1] === bSlice[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  // Backtrack to find common tokens
  const matchedA = new Set<number>();
  const matchedB = new Set<number>();
  let i = m;
  let j = n;

  while (i > 0 && j > 0) {
    if (aSlice[i - 1] === bSlice[j - 1]) {
      matchedA.add(i - 1);
      matchedB.add(j - 1);
      i--;
      j--;
    } else if (dp[i - 1][j] >= dp[i][j - 1]) {
      i--;
    } else {
      j--;
    }
  }

  const wordsA: TokenSpan[] = tokensA.map((text, idx) => ({
    text,
    // Only mark non-whitespace as changed
    isChanged: text.trim().length > 0 && !matchedA.has(idx),
  }));

  const wordsB: TokenSpan[] = tokensB.map((text, idx) => ({
    text,
    isChanged: text.trim().length > 0 && !matchedB.has(idx),
  }));

  return { wordsA, wordsB };
}

/**
 * Computes aligned side-by-side diff and unified diff between original and decompiled source code
 */
export function computeCodeDiff(
  originalCode: string,
  decompiledCode: string
): {
  alignedRows: AlignedDiffRow[];
  unifiedLines: UnifiedDiffLine[];
  stats: DiffStats;
} {
  const origLines = (originalCode || '').replace(/\r\n/g, '\n').split('\n');
  const decLines = (decompiledCode || '').replace(/\r\n/g, '\n').split('\n');

  // Handle empty cases cleanly
  if (!originalCode.trim() && !decompiledCode.trim()) {
    return {
      alignedRows: [],
      unifiedLines: [],
      stats: {
        totalOrigLines: 0,
        totalDecLines: 0,
        addedLines: 0,
        removedLines: 0,
        modifiedLines: 0,
        unchangedLines: 0,
        totalChanges: 0,
        changePercentage: 0,
      },
    };
  }

  const m = origLines.length;
  const n = decLines.length;

  // Trim common prefix
  let prefixCount = 0;
  while (
    prefixCount < m &&
    prefixCount < n &&
    origLines[prefixCount] === decLines[prefixCount]
  ) {
    prefixCount++;
  }

  // Trim common suffix
  let suffixCount = 0;
  while (
    suffixCount < m - prefixCount &&
    suffixCount < n - prefixCount &&
    origLines[m - 1 - suffixCount] === decLines[n - 1 - suffixCount]
  ) {
    suffixCount++;
  }

  const midOrig = origLines.slice(prefixCount, m - suffixCount);
  const midDec = decLines.slice(prefixCount, n - suffixCount);

  // Compute LCS on the middle portion
  // Limit max matrix size to avoid performance issues if large
  const maxMid = 500;
  const useLCS = midOrig.length <= maxMid && midDec.length <= maxMid;

  type RawEdit =
    | { type: 'equal'; origText: string; decText: string }
    | { type: 'delete'; origText: string }
    | { type: 'insert'; decText: string };

  const rawEdits: RawEdit[] = [];

  // Prefix lines
  for (let i = 0; i < prefixCount; i++) {
    rawEdits.push({
      type: 'equal',
      origText: origLines[i],
      decText: decLines[i],
    });
  }

  if (useLCS) {
    const oLen = midOrig.length;
    const dLen = midDec.length;
    const dp: number[][] = Array.from({ length: oLen + 1 }, () =>
      new Array(dLen + 1).fill(0)
    );

    for (let i = 1; i <= oLen; i++) {
      for (let j = 1; j <= dLen; j++) {
        if (midOrig[i - 1] === midDec[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1] + 1;
        } else {
          dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
        }
      }
    }

    // Backtrack LCS
    const midEdits: RawEdit[] = [];
    let i = oLen;
    let j = dLen;

    while (i > 0 || j > 0) {
      if (i > 0 && j > 0 && midOrig[i - 1] === midDec[j - 1]) {
        midEdits.push({
          type: 'equal',
          origText: midOrig[i - 1],
          decText: midDec[j - 1],
        });
        i--;
        j--;
      } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
        midEdits.push({
          type: 'insert',
          decText: midDec[j - 1],
        });
        j--;
      } else if (i > 0 && (j === 0 || dp[i][j - 1] < dp[i - 1][j])) {
        midEdits.push({
          type: 'delete',
          origText: midOrig[i - 1],
        });
        i--;
      }
    }

    midEdits.reverse();
    rawEdits.push(...midEdits);
  } else {
    // Fallback for massive line counts: simple pairing
    let i = 0;
    let j = 0;
    while (i < midOrig.length || j < midDec.length) {
      if (i < midOrig.length && j < midDec.length) {
        if (midOrig[i] === midDec[j]) {
          rawEdits.push({ type: 'equal', origText: midOrig[i], decText: midDec[j] });
          i++;
          j++;
        } else {
          rawEdits.push({ type: 'delete', origText: midOrig[i] });
          rawEdits.push({ type: 'insert', decText: midDec[j] });
          i++;
          j++;
        }
      } else if (i < midOrig.length) {
        rawEdits.push({ type: 'delete', origText: midOrig[i] });
        i++;
      } else {
        rawEdits.push({ type: 'insert', decText: midDec[j] });
        j++;
      }
    }
  }

  // Suffix lines
  for (let i = 0; i < suffixCount; i++) {
    const origIdx = m - suffixCount + i;
    const decIdx = n - suffixCount + i;
    rawEdits.push({
      type: 'equal',
      origText: origLines[origIdx],
      decText: decLines[decIdx],
    });
  }

  // Now group rawEdits into AlignedDiffRow and UnifiedDiffLine
  // Combining adjacent deletes + inserts into 'modified' rows for cleaner side-by-side comprehension!
  const alignedRows: AlignedDiffRow[] = [];
  const unifiedLines: UnifiedDiffLine[] = [];

  let origLineNum = 1;
  let decLineNum = 1;
  let rowId = 0;

  let addedCount = 0;
  let removedCount = 0;
  let modifiedCount = 0;
  let unchangedCount = 0;

  let k = 0;
  while (k < rawEdits.length) {
    const edit = rawEdits[k];

    if (edit.type === 'equal') {
      const row: AlignedDiffRow = {
        id: `row-${rowId++}`,
        type: 'unchanged',
        origLineNumber: origLineNum,
        origText: edit.origText,
        decLineNumber: decLineNum,
        decText: edit.decText,
      };
      alignedRows.push(row);

      unifiedLines.push({
        id: `uni-${rowId}`,
        type: 'unchanged',
        origLineNumber: origLineNum,
        decLineNumber: decLineNum,
        text: edit.origText,
        prefix: ' ',
      });

      origLineNum++;
      decLineNum++;
      unchangedCount++;
      k++;
    } else {
      // Collect consecutive deletes and inserts
      const deletes: string[] = [];
      const inserts: string[] = [];

      while (k < rawEdits.length && (rawEdits[k].type === 'delete' || rawEdits[k].type === 'insert')) {
        const item = rawEdits[k];
        if (item.type === 'delete') {
          deletes.push(item.origText);
        } else if (item.type === 'insert') {
          inserts.push(item.decText);
        }
        k++;
      }

      // Pair up deletes and inserts as 'modified'
      const pairCount = Math.min(deletes.length, inserts.length);

      for (let p = 0; p < pairCount; p++) {
        const delText = deletes[p];
        const insText = inserts[p];
        const { wordsA, wordsB } = computeWordDiff(delText, insText);

        alignedRows.push({
          id: `row-${rowId++}`,
          type: 'modified',
          origLineNumber: origLineNum,
          origText: delText,
          decLineNumber: decLineNum,
          decText: insText,
          origTokens: wordsA,
          decTokens: wordsB,
        });

        // Unified format shows the deletion followed by the modification/insertion
        unifiedLines.push({
          id: `uni-${rowId}-del`,
          type: 'removed',
          origLineNumber: origLineNum,
          text: delText,
          prefix: '-',
          tokens: wordsA,
        });
        unifiedLines.push({
          id: `uni-${rowId}-mod`,
          type: 'modified',
          decLineNumber: decLineNum,
          text: insText,
          prefix: '~',
          tokens: wordsB,
        });

        origLineNum++;
        decLineNum++;
        modifiedCount++;
      }

      // Remaining deletes (purely removed lines from original)
      for (let d = pairCount; d < deletes.length; d++) {
        const delText = deletes[d];
        alignedRows.push({
          id: `row-${rowId++}`,
          type: 'removed',
          origLineNumber: origLineNum,
          origText: delText,
        });

        unifiedLines.push({
          id: `uni-${rowId}`,
          type: 'removed',
          origLineNumber: origLineNum,
          text: delText,
          prefix: '-',
        });

        origLineNum++;
        removedCount++;
      }

      // Remaining inserts (purely added lines in decompiled)
      for (let s = pairCount; s < inserts.length; s++) {
        const insText = inserts[s];
        alignedRows.push({
          id: `row-${rowId++}`,
          type: 'added',
          decLineNumber: decLineNum,
          decText: insText,
        });

        unifiedLines.push({
          id: `uni-${rowId}`,
          type: 'added',
          decLineNumber: decLineNum,
          text: insText,
          prefix: '+',
        });

        decLineNum++;
        addedCount++;
      }
    }
  }

  const totalChanges = addedCount + removedCount + modifiedCount;
  const totalLines = origLines.length + decLines.length;
  const changePercentage = totalLines > 0 ? Math.round((totalChanges / Math.max(origLines.length, decLines.length)) * 100) : 0;

  return {
    alignedRows,
    unifiedLines,
    stats: {
      totalOrigLines: origLines.length,
      totalDecLines: decLines.length,
      addedLines: addedCount,
      removedLines: removedCount,
      modifiedLines: modifiedCount,
      unchangedLines: unchangedCount,
      totalChanges,
      changePercentage,
    },
  };
}
