import { describe, expect, it } from "vitest";
import {
  basketballCourts,
  chipsPerRack,
  floorAreaM2,
  getTopology,
  rackAcceleratorKW,
  rackCount,
  racksPerGlyph,
  serverCount,
  SQM_PER_RACK,
} from "../lib/rackTopology";
import { TRAINING_CLUSTERS } from "../lib/trainingClusters";
import { getChip } from "../lib/hardware";

function findCluster(id: string) {
  const cluster = TRAINING_CLUSTERS.find((c) => c.id === id);
  if (!cluster) throw new Error(`Missing cluster fixture: ${id}`);
  return cluster;
}

describe("getTopology", () => {
  it("prefers a cluster's own published layout over the per-chip default", () => {
    const colossus = findCluster("xai-colossus");
    const topology = getTopology(colossus);
    expect(topology.provenance).toBe("reported");
    expect(topology.chipsPerServer).toBe(8);
    expect(topology.serversPerRack).toBe(8);
  });

  it("falls back to the per-chip default when a cluster has no layout of its own", () => {
    const eagle = findCluster("microsoft-eagle");
    expect(eagle.topology).toBeUndefined();
    expect(getTopology(eagle).provenance).toBe("estimated");
  });

  it("uses Google's reported 64-chips-per-rack figure for TPU v4", () => {
    const pod = findCluster("google-tpu-v4-pod");
    const topology = getTopology(pod);
    expect(topology.provenance).toBe("reported");
    expect(chipsPerRack(pod)).toBe(64);
  });

  it("gives every cluster a usable topology", () => {
    for (const cluster of TRAINING_CLUSTERS) {
      const topology = getTopology(cluster);
      expect(topology.chipsPerServer).toBeGreaterThan(0);
      expect(topology.serversPerRack).toBeGreaterThan(0);
      expect(topology.source.length).toBeGreaterThan(0);
    }
  });
});

describe("serverCount / rackCount", () => {
  it("divides Colossus's 100k GPUs into 8-GPU servers and 64-GPU racks", () => {
    const colossus = findCluster("xai-colossus");
    expect(serverCount(colossus)).toBe(12_500);
    expect(rackCount(colossus)).toBe(Math.ceil(12_500 / 8));
  });

  it("puts a TPU v4 pod's 4,096 chips in 64 racks", () => {
    expect(rackCount(findCluster("google-tpu-v4-pod"))).toBe(64);
  });

  it("never returns fewer racks than needed to hold every chip", () => {
    for (const cluster of TRAINING_CLUSTERS) {
      expect(rackCount(cluster) * chipsPerRack(cluster)).toBeGreaterThanOrEqual(
        cluster.chipCount
      );
    }
  });
});

describe("rackAcceleratorKW", () => {
  it("is chips-per-rack times the chip's TDP", () => {
    const colossus = findCluster("xai-colossus");
    const chip = getChip(colossus.chipId);
    expect(rackAcceleratorKW(colossus)).toBeCloseTo(
      (chipsPerRack(colossus) * chip.tdpWatts) / 1000,
      6
    );
  });

  it("puts a 64x H100 rack in the tens-of-kW range", () => {
    const kw = rackAcceleratorKW(findCluster("xai-colossus"));
    expect(kw).toBeGreaterThan(20);
    expect(kw).toBeLessThan(80);
  });
});

describe("floorAreaM2 / basketballCourts", () => {
  it("is rack count times the per-rack floor allowance", () => {
    const cluster = findCluster("meta-rsc");
    expect(floorAreaM2(cluster)).toBe(rackCount(cluster) * SQM_PER_RACK);
  });

  it("scales with cluster size", () => {
    expect(basketballCourts(findCluster("xai-colossus"))).toBeGreaterThan(
      basketballCourts(findCluster("google-tpu-v4-pod"))
    );
  });
});

describe("racksPerGlyph", () => {
  it("keeps the largest cluster's hall view under the glyph budget", () => {
    const perGlyph = racksPerGlyph(TRAINING_CLUSTERS, 2000);
    for (const cluster of TRAINING_CLUSTERS) {
      expect(Math.ceil(rackCount(cluster) / perGlyph)).toBeLessThanOrEqual(2000);
    }
  });
});
