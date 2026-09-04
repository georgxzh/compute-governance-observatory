import { TrainingCluster } from "./types";
import { getChip } from "./hardware";
import { clusterPeakFlopsPerSecond } from "./trainingClusters";
import { DEFAULT_MFU_BY_VENDOR, DEFAULT_PUE } from "./estimator";

/**
 * Continuous power draw of a cluster's accelerators at full load, scaled by
 * PUE for datacenter overhead. This is chip TDP x count — real facilities
 * also draw power for storage, networking, and idle capacity, so treat it
 * as a floor on the cluster's own draw, not a facility-wide figure.
 */
export function clusterPowerMW(cluster: TrainingCluster, pue: number = DEFAULT_PUE): number {
  const chip = getChip(cluster.chipId);
  return (cluster.chipCount * chip.tdpWatts * pue) / 1_000_000;
}

export function clusterEnergyPerDayMWh(
  cluster: TrainingCluster,
  pue: number = DEFAULT_PUE
): number {
  return clusterPowerMW(cluster, pue) * 24;
}

/** The default MFU assumption for this cluster's chip vendor. */
export function clusterMfu(cluster: TrainingCluster): number {
  return DEFAULT_MFU_BY_VENDOR[getChip(cluster.chipId).vendor] ?? 0.4;
}

/**
 * How long this cluster would take to produce a given training-compute
 * budget, if fully dedicated to it. Same formula as the live estimator's
 * trainingSeconds, expressed per-cluster.
 */
export function timeToTrainDays(
  cluster: TrainingCluster,
  flops: number,
  mfu: number = clusterMfu(cluster)
): number {
  const effectiveFlopsPerSecond = clusterPeakFlopsPerSecond(cluster) * mfu;
  return flops / effectiveFlopsPerSecond / 86_400;
}

const DOT_SCALES = [1, 5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000, 10_000];

/**
 * How many chips each dot represents in the chip-grid visual. Deliberately
 * one shared scale across every cluster so the grids stay comparable to
 * each other — a cluster 25x bigger should *look* 25x bigger.
 */
export function chipsPerDot(clusters: TrainingCluster[], targetMaxDots = 200): number {
  if (clusters.length === 0) return 1;
  const maxChips = Math.max(...clusters.map((c) => c.chipCount));
  const raw = maxChips / targetMaxDots;
  return DOT_SCALES.find((scale) => scale >= raw) ?? DOT_SCALES[DOT_SCALES.length - 1];
}

export function dotCount(cluster: TrainingCluster, perDot: number): number {
  return Math.max(1, Math.ceil(cluster.chipCount / perDot));
}
