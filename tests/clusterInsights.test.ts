import { describe, expect, it } from "vitest";
import {
  chipsPerDot,
  clusterEnergyPerDayMWh,
  clusterMfu,
  clusterPowerMW,
  dotCount,
  timeToTrainDays,
} from "../lib/clusterInsights";
import { TRAINING_CLUSTERS } from "../lib/trainingClusters";
import { getChip } from "../lib/hardware";

function findCluster(id: string) {
  const cluster = TRAINING_CLUSTERS.find((c) => c.id === id);
  if (!cluster) throw new Error(`Missing cluster fixture: ${id}`);
  return cluster;
}

describe("clusterPowerMW", () => {
  it("is chip count x TDP x PUE, converted to megawatts", () => {
    const colossus = findCluster("xai-colossus");
    const chip = getChip(colossus.chipId);
    const expected = (colossus.chipCount * chip.tdpWatts * 1.1) / 1_000_000;
    expect(clusterPowerMW(colossus)).toBeCloseTo(expected, 6);
  });

  it("puts a 100k-H100 cluster in the tens-of-megawatts range", () => {
    const power = clusterPowerMW(findCluster("xai-colossus"));
    expect(power).toBeGreaterThan(50);
    expect(power).toBeLessThan(120);
  });
});

describe("clusterEnergyPerDayMWh", () => {
  it("is 24 hours of the cluster's power draw", () => {
    const cluster = findCluster("microsoft-eagle");
    expect(clusterEnergyPerDayMWh(cluster)).toBeCloseTo(clusterPowerMW(cluster) * 24, 6);
  });
});

describe("timeToTrainDays", () => {
  it("takes less time on a bigger cluster than a smaller one", () => {
    const flops = 3.8e25; // Llama 3.1 405B
    const onColossus = timeToTrainDays(findCluster("xai-colossus"), flops);
    const onPod = timeToTrainDays(findCluster("google-tpu-v4-pod"), flops);
    expect(onColossus).toBeLessThan(onPod);
  });

  it("scales inversely with compute budget", () => {
    const cluster = findCluster("xai-colossus");
    const small = timeToTrainDays(cluster, 1e24);
    const big = timeToTrainDays(cluster, 2e24);
    expect(big / small).toBeCloseTo(2, 6);
  });

  it("uses the chip vendor's default MFU when none is given", () => {
    const cluster = findCluster("google-tpu-v4-pod");
    expect(clusterMfu(cluster)).toBe(0.45);
    expect(timeToTrainDays(cluster, 1e24)).toBeCloseTo(
      timeToTrainDays(cluster, 1e24, 0.45),
      6
    );
  });
});

describe("chipsPerDot / dotCount", () => {
  it("keeps the largest cluster at or under the target dot count", () => {
    const perDot = chipsPerDot(TRAINING_CLUSTERS, 200);
    for (const cluster of TRAINING_CLUSTERS) {
      expect(dotCount(cluster, perDot)).toBeLessThanOrEqual(200);
    }
  });

  it("gives every cluster at least one dot", () => {
    const perDot = chipsPerDot(TRAINING_CLUSTERS, 200);
    for (const cluster of TRAINING_CLUSTERS) {
      expect(dotCount(cluster, perDot)).toBeGreaterThanOrEqual(1);
    }
  });

  it("keeps clusters visually proportional on one shared scale", () => {
    const perDot = chipsPerDot(TRAINING_CLUSTERS, 200);
    const colossus = findCluster("xai-colossus");
    const pod = findCluster("google-tpu-v4-pod");
    const chipRatio = colossus.chipCount / pod.chipCount;
    const dotRatio = dotCount(colossus, perDot) / dotCount(pod, perDot);
    // Rounding to whole dots costs some precision, but the visual should
    // still land within 20% of the true ratio.
    expect(Math.abs(dotRatio - chipRatio) / chipRatio).toBeLessThan(0.2);
  });
});
