import { KNOWN_RUNS } from "./knownRuns";
import { NOTABLE_MODELS } from "./notableModels";
import { TRAINING_CLUSTERS, clusterPeakFlopsPerSecond } from "./trainingClusters";
import { DEFAULT_MFU_BY_VENDOR, trainingFlops } from "./estimator";
import { getChip } from "./hardware";
import { Provenance } from "./types";

export type ComparisonCategory = "Validated run" | "Notable model" | "Cluster (hypothetical)";

export interface ComparisonRow {
  id: string;
  label: string;
  category: ComparisonCategory;
  computeFlops: number;
  provenance: Provenance;
}

export const COMPARISON_CATEGORIES: ComparisonCategory[] = [
  "Validated run",
  "Notable model",
  "Cluster (hypothetical)",
];

/** Validated training runs: reported compute where published, else the 6ND estimate. */
export function knownRunRows(): ComparisonRow[] {
  return KNOWN_RUNS.map((run) => ({
    id: run.id,
    label: run.name,
    category: "Validated run",
    computeFlops: run.reportedFlops ?? trainingFlops(run.parameters, run.tokens),
    provenance: run.reportedFlops ? "reported" : "calculated",
  }));
}

/** Notable models: each one's own best public compute estimate. */
export function notableModelRows(): ComparisonRow[] {
  return NOTABLE_MODELS.map((model) => ({
    id: model.id,
    label: model.name,
    category: "Notable model",
    computeFlops: model.computeFlops,
    provenance: model.computeProvenance,
  }));
}

/**
 * Training clusters: an explicitly hypothetical figure — what a cluster's
 * installed capacity would produce if dedicated to a single training job
 * for `durationDays` at a typical MFU for its chip vendor. Always
 * `estimated`, since it describes what a cluster *could* produce, not
 * compute anything actually consumed.
 */
export function clusterRows(durationDays: number): ComparisonRow[] {
  const seconds = durationDays * 24 * 3600;
  return TRAINING_CLUSTERS.map((cluster) => {
    const mfu = DEFAULT_MFU_BY_VENDOR[getChip(cluster.chipId).vendor] ?? 0.4;
    return {
      id: cluster.id,
      label: cluster.name,
      category: "Cluster (hypothetical)",
      computeFlops: clusterPeakFlopsPerSecond(cluster) * seconds * mfu,
      provenance: "estimated",
    };
  });
}

export function allComparisonRows(durationDays: number): ComparisonRow[] {
  return [...knownRunRows(), ...notableModelRows(), ...clusterRows(durationDays)];
}
