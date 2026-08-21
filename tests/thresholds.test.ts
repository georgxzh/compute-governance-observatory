import { describe, expect, it } from "vitest";
import { trainingFlops } from "../lib/estimator";
import { KNOWN_RUNS } from "../lib/knownRuns";
import { compareToThreshold, DEFAULT_THRESHOLDS } from "../lib/thresholds";

/**
 * Validates the EU AI Act systemic-risk threshold comparison (Week 2
 * action-plan commitment) against the same three known runs, so the
 * threshold logic is checked against real numbers, not just made up ones.
 */

function euThreshold() {
  const threshold = DEFAULT_THRESHOLDS.find((t) => t.id === "eu-ai-act-systemic-risk");
  if (!threshold) throw new Error("Missing eu-ai-act-systemic-risk threshold");
  return threshold;
}

describe("EU AI Act threshold (10^25 FLOPs)", () => {
  it("is set to 10^25 FLOPs", () => {
    expect(euThreshold().flops).toBe(1e25);
  });

  it("GPT-3 175B (~3.14e23 FLOPs) is well below the threshold", () => {
    const run = KNOWN_RUNS.find((r) => r.id === "gpt-3-175b")!;
    const flops = trainingFlops(run.parameters, run.tokens);
    const { exceeds, ratio } = compareToThreshold(flops, euThreshold().flops);
    expect(exceeds).toBe(false);
    expect(ratio).toBeLessThan(0.05);
  });

  it("Llama 3.1 405B (~3.8e25 FLOPs) exceeds the threshold", () => {
    const run = KNOWN_RUNS.find((r) => r.id === "llama-3-1-405b")!;
    const flops = trainingFlops(run.parameters, run.tokens);
    const { exceeds, ratio } = compareToThreshold(flops, euThreshold().flops);
    expect(exceeds).toBe(true);
    expect(ratio).toBeGreaterThan(1);
  });
});
