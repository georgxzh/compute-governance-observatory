import { describe, expect, it } from "vitest";
import { runClusterScenario, runScenario } from "../lib/policyScenario";
import { NOTABLE_MODELS } from "../lib/notableModels";
import { TRAINING_CLUSTERS } from "../lib/trainingClusters";
import { DEFAULT_THRESHOLDS } from "../lib/thresholds";

describe("runScenario", () => {
  const cells = runScenario(NOTABLE_MODELS, DEFAULT_THRESHOLDS);

  it("produces one cell per model x threshold pair", () => {
    expect(cells.length).toBe(NOTABLE_MODELS.length * DEFAULT_THRESHOLDS.length);
  });

  it("flags Llama 3.1 405B as exceeding the EU AI Act threshold", () => {
    const cell = cells.find(
      (c) => c.modelId === "llama-3-1-405b" && c.thresholdId === "eu-ai-act-systemic-risk"
    );
    expect(cell?.exceeds).toBe(true);
  });

  it("does not flag GPT-3 175B as exceeding the EU AI Act threshold", () => {
    const cell = cells.find(
      (c) => c.modelId === "gpt-3-175b" && c.thresholdId === "eu-ai-act-systemic-risk"
    );
    expect(cell?.exceeds).toBe(false);
  });
});

describe("runClusterScenario", () => {
  it("produces one cell per cluster x threshold pair", () => {
    const cells = runClusterScenario(TRAINING_CLUSTERS, DEFAULT_THRESHOLDS, 90, 0.4);
    expect(cells.length).toBe(TRAINING_CLUSTERS.length * DEFAULT_THRESHOLDS.length);
  });

  it("flags xAI's Colossus as exceeding the EU AI Act threshold over a 90-day dedicated run", () => {
    const colossus = TRAINING_CLUSTERS.find((c) => c.id === "xai-colossus")!;
    const cells = runClusterScenario([colossus], DEFAULT_THRESHOLDS, 90, 0.4);
    const cell = cells.find((c) => c.thresholdId === "eu-ai-act-systemic-risk");
    expect(cell?.exceeds).toBe(true);
  });

  it("keeps a small cluster below the EU AI Act threshold over a very short dedicated run", () => {
    const pod = TRAINING_CLUSTERS.find((c) => c.id === "google-tpu-v4-pod")!;
    const cells = runClusterScenario([pod], DEFAULT_THRESHOLDS, 1, 0.45);
    const cell = cells.find((c) => c.thresholdId === "eu-ai-act-systemic-risk");
    expect(cell?.exceeds).toBe(false);
  });

  it("implied compute scales linearly with duration", () => {
    const colossus = TRAINING_CLUSTERS.find((c) => c.id === "xai-colossus")!;
    const short = runClusterScenario([colossus], DEFAULT_THRESHOLDS, 10, 0.4)[0].impliedFlops;
    const long = runClusterScenario([colossus], DEFAULT_THRESHOLDS, 20, 0.4)[0].impliedFlops;
    expect(long / short).toBeCloseTo(2, 6);
  });
});
