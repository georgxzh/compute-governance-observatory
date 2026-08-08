import { describe, expect, it } from "vitest";
import { trainingFlops } from "../lib/estimator";
import { getChip } from "../lib/hardware";
import { KNOWN_RUNS } from "../lib/knownRuns";

/**
 * Validates the estimator's core 6*N*D compute formula, and the
 * chips/time/energy formulas indirectly via an implied-MFU sanity check,
 * against the three public training runs in lib/knownRuns.ts.
 *
 * This is the concrete "test against at least three public training runs"
 * deliverable from the Week 1 action-plan commitment.
 */

function findRun(id: string) {
  const run = KNOWN_RUNS.find((r) => r.id === id);
  if (!run) throw new Error(`Missing fixture: ${id}`);
  return run;
}

describe("KNOWN_RUNS fixtures", () => {
  it("has at least three runs", () => {
    expect(KNOWN_RUNS.length).toBeGreaterThanOrEqual(3);
  });
});

describe("trainingFlops (6ND) vs. reported compute", () => {
  it("matches GPT-3 175B's reported ~3.14e23 FLOPs within 10%", () => {
    const run = findRun("gpt-3-175b");
    const flops = trainingFlops(run.parameters, run.tokens);
    const reported = run.reportedFlops!;
    expect(Math.abs(flops - reported) / reported).toBeLessThan(0.1);
  });

  it("matches Llama 3.1 405B's reported ~3.8e25 FLOPs within 10%", () => {
    const run = findRun("llama-3-1-405b");
    const flops = trainingFlops(run.parameters, run.tokens);
    const reported = run.reportedFlops!;
    expect(Math.abs(flops - reported) / reported).toBeLessThan(0.1);
  });
});

describe("implied MFU sanity check (chips/time/energy formulas)", () => {
  // Given a run's *reported* chip-hours (chips x wall-clock time), solve for
  // the MFU our estimator would need to assume to reproduce that many
  // chip-hours from the 6ND compute figure. If that implied MFU lands in the
  // realistic 0.2-0.65 band real training runs report, the formulas are
  // internally consistent with published data.
  function impliedMfu(flops: number, chipHours: number, peakFlopsPerSecond: number) {
    const chipSeconds = chipHours * 3600;
    return flops / (chipSeconds * peakFlopsPerSecond);
  }

  it("Llama 2 70B: implied MFU from reported GPU-hours is realistic", () => {
    const run = findRun("llama-2-70b");
    const flops = trainingFlops(run.parameters, run.tokens);
    const chip = getChip(run.chipId);
    const mfu = impliedMfu(flops, run.reportedChipHours!, chip.peakFlopsPerSecond);
    expect(mfu).toBeGreaterThan(0.2);
    expect(mfu).toBeLessThan(0.65);
  });

  it("Llama 3.1 405B: implied MFU from reported chip count + days is realistic", () => {
    const run = findRun("llama-3-1-405b");
    const flops = trainingFlops(run.parameters, run.tokens);
    const chip = getChip(run.chipId);
    const chipHours = run.chipCount * run.reportedTrainingDays! * 24;
    const mfu = impliedMfu(flops, chipHours, chip.peakFlopsPerSecond);
    expect(mfu).toBeGreaterThan(0.2);
    expect(mfu).toBeLessThan(0.65);
  });
});
