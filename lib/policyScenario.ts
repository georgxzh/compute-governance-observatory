import { NotableModel } from "./notableModels";
import { Threshold, TrainingCluster } from "./types";
import { compareToThreshold } from "./thresholds";
import { clusterPeakFlopsPerSecond } from "./trainingClusters";

export interface ScenarioCell {
  modelId: string;
  thresholdId: string;
  exceeds: boolean;
  ratio: number;
}

/**
 * For each (model, threshold) pair, would that model's known compute have
 * crossed that threshold? This is illustrative only: it shows which
 * *already-trained* models would be flagged by a given threshold as
 * currently set, not a prediction of whether a lab would actually cross a
 * future threshold, change its training approach in response, or how
 * "training compute" would be defined/audited in practice.
 */
export function runScenario(models: NotableModel[], thresholds: Threshold[]): ScenarioCell[] {
  const cells: ScenarioCell[] = [];
  for (const model of models) {
    for (const threshold of thresholds) {
      const { exceeds, ratio } = compareToThreshold(model.computeFlops, threshold.flops);
      cells.push({ modelId: model.id, thresholdId: threshold.id, exceeds, ratio });
    }
  }
  return cells;
}

export interface ClusterScenarioCell {
  clusterId: string;
  thresholdId: string;
  exceeds: boolean;
  ratio: number;
  impliedFlops: number;
}

/**
 * Training clusters measure peak *capacity* (FLOP/s), not training compute
 * (FLOPs) — the two aren't directly comparable to a compute threshold. This
 * bridges them the same way the live estimator turns a cluster's own inputs
 * into a compute figure: if a cluster ran a single training job flat-out
 * for `durationDays` at `mfu` utilization, how much compute would that
 * produce? That implied figure — not the cluster's raw capacity — is what
 * gets compared to each threshold. It's explicitly hypothetical: it
 * describes what a cluster *could* produce under an assumed dedicated-use
 * scenario, not compute any model actually consumed.
 */
export function runClusterScenario(
  clusters: TrainingCluster[],
  thresholds: Threshold[],
  durationDays: number,
  mfu: number
): ClusterScenarioCell[] {
  const durationSeconds = durationDays * 24 * 3600;
  const cells: ClusterScenarioCell[] = [];
  for (const cluster of clusters) {
    const impliedFlops = clusterPeakFlopsPerSecond(cluster) * durationSeconds * mfu;
    for (const threshold of thresholds) {
      const { exceeds, ratio } = compareToThreshold(impliedFlops, threshold.flops);
      cells.push({ clusterId: cluster.id, thresholdId: threshold.id, exceeds, ratio, impliedFlops });
    }
  }
  return cells;
}
