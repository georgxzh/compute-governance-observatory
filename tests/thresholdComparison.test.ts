import { describe, expect, it } from "vitest";
import {
  allComparisonRows,
  clusterRows,
  knownRunRows,
  notableModelRows,
} from "../lib/thresholdComparison";
import { KNOWN_RUNS } from "../lib/knownRuns";
import { NOTABLE_MODELS } from "../lib/notableModels";
import { TRAINING_CLUSTERS } from "../lib/trainingClusters";
import { compareToThreshold, DEFAULT_THRESHOLDS } from "../lib/thresholds";

describe("knownRunRows", () => {
  const rows = knownRunRows();

  it("has one row per known run", () => {
    expect(rows.length).toBe(KNOWN_RUNS.length);
  });

  it("uses reportedFlops directly when available (e.g. GPT-3)", () => {
    const gpt3 = rows.find((r) => r.id === "gpt-3-175b")!;
    expect(gpt3.provenance).toBe("reported");
    expect(gpt3.computeFlops).toBe(3.14e23);
  });

  it("falls back to a calculated 6ND figure when reportedFlops is absent (e.g. Llama 2)", () => {
    const llama2 = rows.find((r) => r.id === "llama-2-70b")!;
    expect(llama2.provenance).toBe("calculated");
    expect(llama2.computeFlops).toBeGreaterThan(0);
  });
});

describe("notableModelRows", () => {
  it("has one row per notable model, carrying over its own provenance", () => {
    const rows = notableModelRows();
    expect(rows.length).toBe(NOTABLE_MODELS.length);
    const gpt4 = rows.find((r) => r.id === "gpt-4")!;
    expect(gpt4.provenance).toBe("estimated");
  });
});

describe("clusterRows", () => {
  it("is always estimated, and scales with duration", () => {
    const short = clusterRows(30);
    const long = clusterRows(60);
    for (const cluster of TRAINING_CLUSTERS) {
      const shortRow = short.find((r) => r.id === cluster.id)!;
      const longRow = long.find((r) => r.id === cluster.id)!;
      expect(shortRow.provenance).toBe("estimated");
      expect(longRow.computeFlops / shortRow.computeFlops).toBeCloseTo(2, 6);
    }
  });
});

describe("allComparisonRows", () => {
  const rows = allComparisonRows(90);

  it("combines known runs, notable models, and clusters", () => {
    expect(rows.length).toBe(
      KNOWN_RUNS.length + NOTABLE_MODELS.length + TRAINING_CLUSTERS.length
    );
  });

  it("every row's compute figure can be meaningfully compared to the EU AI Act threshold", () => {
    const threshold = DEFAULT_THRESHOLDS.find((t) => t.id === "eu-ai-act-systemic-risk")!;
    for (const row of rows) {
      const { ratio } = compareToThreshold(row.computeFlops, threshold.flops);
      expect(Number.isFinite(ratio)).toBe(true);
      expect(ratio).toBeGreaterThan(0);
    }
  });
});
