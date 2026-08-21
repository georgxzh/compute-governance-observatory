import { describe, expect, it } from "vitest";
import { runScenario } from "../lib/policyScenario";
import { NOTABLE_MODELS } from "../lib/notableModels";
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
