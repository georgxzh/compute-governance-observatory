import { RackTopology, TrainingCluster } from "./types";
import { getChip } from "./hardware";

/**
 * Default physical packaging per chip type, used when a cluster doesn't
 * publish its own layout. Chips-per-server is the well-established figure
 * (NVIDIA HGX/DGX baseboards carry 8 accelerators; Google packages TPUs on
 * 4-chip trays). Servers-per-rack is the softer number — real density
 * depends on cooling, power delivery, and floor plan, so these are
 * conservative air-cooled-era defaults and are labeled estimated.
 */
const DEFAULT_TOPOLOGY_BY_CHIP: Record<string, RackTopology> = {
  "v100-sxm2": {
    chipsPerServer: 8,
    serversPerRack: 4,
    provenance: "estimated",
    source: "NVIDIA DGX-1 carries 8 V100s; rack density is a typical air-cooled assumption.",
  },
  "a100-40gb-sxm": {
    chipsPerServer: 8,
    serversPerRack: 4,
    provenance: "estimated",
    source: "NVIDIA DGX A100 carries 8 A100s (6U, ~6.5 kW); rack density is a typical assumption.",
  },
  "a100-80gb-sxm": {
    chipsPerServer: 8,
    serversPerRack: 4,
    provenance: "estimated",
    source: "NVIDIA DGX A100 carries 8 A100s (6U, ~6.5 kW); rack density is a typical assumption.",
  },
  "h100-sxm": {
    chipsPerServer: 8,
    serversPerRack: 4,
    provenance: "estimated",
    source:
      "NVIDIA HGX/DGX H100 carries 8 H100s (8U, ~10 kW); 4 per rack is a typical air-cooled density.",
  },
  "h800-sxm": {
    chipsPerServer: 8,
    serversPerRack: 4,
    provenance: "estimated",
    source: "Same HGX 8-GPU baseboard as H100; rack density is a typical assumption.",
  },
  "h200-sxm": {
    chipsPerServer: 8,
    serversPerRack: 4,
    provenance: "estimated",
    source: "Same HGX 8-GPU baseboard as H100; rack density is a typical assumption.",
  },
  b200: {
    chipsPerServer: 8,
    serversPerRack: 8,
    provenance: "estimated",
    source:
      "HGX B200 carries 8 accelerators; Blackwell racks are liquid-cooled and denser than Hopper air-cooled racks.",
  },
  mi300x: {
    chipsPerServer: 8,
    serversPerRack: 4,
    provenance: "estimated",
    source: "AMD MI300X platforms ship as 8-accelerator baseboards; rack density is an assumption.",
  },
  "tpu-v4": {
    chipsPerServer: 4,
    serversPerRack: 16,
    provenance: "reported",
    source:
      "Google, 'TPU v4: An Optically Reconfigurable Supercomputer' (ISCA 2023): 64 TPU v4 chips per rack, arranged as a 4x4x4 cube.",
  },
  "tpu-v5e": {
    chipsPerServer: 4,
    serversPerRack: 16,
    provenance: "estimated",
    source: "Assumes TPU v4-style 64-chip racks; Google has not detailed v5e rack packaging.",
  },
  "tpu-v5p": {
    chipsPerServer: 4,
    serversPerRack: 16,
    provenance: "estimated",
    source: "Assumes TPU v4-style 64-chip racks.",
  },
};

const FALLBACK_TOPOLOGY: RackTopology = {
  chipsPerServer: 8,
  serversPerRack: 4,
  provenance: "estimated",
  source: "Generic 8-accelerator server, 4 servers per rack.",
};

/** Square metres of floor per rack, including its share of aisle space. */
export const SQM_PER_RACK = 3;

/** A basketball court, for making floor area legible. */
export const SQM_PER_BASKETBALL_COURT = 420;

export function getTopology(cluster: TrainingCluster): RackTopology {
  return cluster.topology ?? DEFAULT_TOPOLOGY_BY_CHIP[cluster.chipId] ?? FALLBACK_TOPOLOGY;
}

export function chipsPerRack(cluster: TrainingCluster): number {
  const topology = getTopology(cluster);
  return topology.chipsPerServer * topology.serversPerRack;
}

export function serverCount(cluster: TrainingCluster): number {
  return Math.ceil(cluster.chipCount / getTopology(cluster).chipsPerServer);
}

export function rackCount(cluster: TrainingCluster): number {
  return Math.ceil(serverCount(cluster) / getTopology(cluster).serversPerRack);
}

/** Accelerator-only draw of a single rack, in kW (excludes CPU/NIC/fan overhead). */
export function rackAcceleratorKW(cluster: TrainingCluster): number {
  return (chipsPerRack(cluster) * getChip(cluster.chipId).tdpWatts) / 1000;
}

export function floorAreaM2(cluster: TrainingCluster): number {
  return rackCount(cluster) * SQM_PER_RACK;
}

export function basketballCourts(cluster: TrainingCluster): number {
  return floorAreaM2(cluster) / SQM_PER_BASKETBALL_COURT;
}

/**
 * How many racks each glyph stands for in the data-hall view. One glyph per
 * rack while that stays renderable, then a round scale beyond it — kept
 * uniform across clusters so hall sizes stay visually comparable.
 */
const GLYPH_SCALES = [1, 2, 5, 10, 25, 50, 100];

export function racksPerGlyph(clusters: TrainingCluster[], maxGlyphs = 2000): number {
  if (clusters.length === 0) return 1;
  const maxRacks = Math.max(...clusters.map(rackCount));
  const raw = maxRacks / maxGlyphs;
  return GLYPH_SCALES.find((scale) => scale >= raw) ?? GLYPH_SCALES[GLYPH_SCALES.length - 1];
}
