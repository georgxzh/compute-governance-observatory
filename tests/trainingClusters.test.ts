import { describe, expect, it } from "vitest";
import { clusterPeakFlopsPerSecond, TRAINING_CLUSTERS } from "../lib/trainingClusters";
import { getChip } from "../lib/hardware";

describe("TRAINING_CLUSTERS", () => {
  it("has at least four clusters", () => {
    expect(TRAINING_CLUSTERS.length).toBeGreaterThanOrEqual(4);
  });

  it("spans at least three organizations", () => {
    const orgs = new Set(TRAINING_CLUSTERS.map((c) => c.organization));
    expect(orgs.size).toBeGreaterThanOrEqual(3);
  });

  it("every cluster references a real chip and has a source", () => {
    for (const cluster of TRAINING_CLUSTERS) {
      expect(() => getChip(cluster.chipId)).not.toThrow();
      expect(cluster.chipCount).toBeGreaterThan(0);
      expect(cluster.source.length).toBeGreaterThan(0);
    }
  });
});

describe("clusterPeakFlopsPerSecond", () => {
  it("equals chip count times that chip's peak FLOPs/s", () => {
    const cluster = TRAINING_CLUSTERS.find((c) => c.id === "microsoft-eagle")!;
    const chip = getChip(cluster.chipId);
    expect(clusterPeakFlopsPerSecond(cluster)).toBe(cluster.chipCount * chip.peakFlopsPerSecond);
  });

  it("xAI's Colossus has a larger peak capacity than Microsoft's Eagle", () => {
    const colossus = TRAINING_CLUSTERS.find((c) => c.id === "xai-colossus")!;
    const eagle = TRAINING_CLUSTERS.find((c) => c.id === "microsoft-eagle")!;
    expect(clusterPeakFlopsPerSecond(colossus)).toBeGreaterThan(
      clusterPeakFlopsPerSecond(eagle)
    );
  });
});
