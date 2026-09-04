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

