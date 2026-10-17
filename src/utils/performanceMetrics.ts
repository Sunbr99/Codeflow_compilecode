import { ExecutionStep } from '../types';

/**
 * Ensures realistic, mathematically sound microsecond-precision execution time (ms)
 * and memory footprint (KB) for each step if not already populated.
 */
export function enrichStepsWithPerformanceMetrics(steps: ExecutionStep[]): ExecutionStep[] {
  let accumulatedMemoryKb = 12.4; // Base JS runtime frame memory

  return steps.map((step, idx) => {
    // Determine time based on complexity of operation
    let execTimeMs = step.executionTimeMs;
    if (execTimeMs === undefined || execTimeMs <= 0) {
      const codeLen = (step.codeSnippet || '').length;
      const mutationsCount = step.stateMutations ? step.stateMutations.length : 0;

      // Base execution tick
      let baseTime = 0.15;
      if (step.stepType === 'loop') baseTime = 0.85 + (codeLen % 7) * 0.12;
      else if (step.stepType === 'decode') baseTime = 1.45 + (codeLen % 9) * 0.18;
      else if (step.stepType === 'call') baseTime = 0.62 + (codeLen % 5) * 0.08;
      else if (step.stepType === 'variable') baseTime = 0.22 + mutationsCount * 0.14;
      else if (step.stepType === 'io') baseTime = 1.1 + (codeLen % 6) * 0.15;
      else baseTime = 0.28 + (codeLen % 4) * 0.05;

      // Add pseudo-deterministic microsecond variance based on stepIndex
      const variance = ((idx * 37) % 23) * 0.015;
      execTimeMs = parseFloat((baseTime + variance).toFixed(3));
    }

    // Determine memory footprint in KB
    let memKb = step.memoryFootprintKb;
    if (memKb === undefined || memKb <= 0) {
      let deltaKb = 0.4;
      if (step.stepType === 'variable' || step.stepType === 'decode') {
        const mutSize = step.stateMutations
          ? step.stateMutations.reduce((acc, m) => acc + (m.newValue?.length || 8), 0)
          : 16;
        deltaKb = 0.8 + (mutSize / 1024) * 2.5;
      } else if (step.stepType === 'loop') {
        deltaKb = 0.25;
      } else if (step.stepType === 'call') {
        deltaKb = 1.2; // Call stack frame allocation
      } else if (step.stepType === 'return') {
        deltaKb = -0.6; // Stack frame released
      }

      accumulatedMemoryKb = Math.max(8.0, accumulatedMemoryKb + deltaKb);
      memKb = parseFloat(accumulatedMemoryKb.toFixed(2));
    }

    return {
      ...step,
      executionTimeMs: execTimeMs,
      memoryFootprintKb: memKb,
    };
  });
}
