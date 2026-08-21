import { Threshold } from "./types";

/**
 * Starting set of regulatory compute thresholds. Users can edit the FLOPs
 * value of any threshold in the UI (regulators periodically revise these,
 * and reasonable people can disagree about how a given training run's
 * compute should be counted against them) or add their own.
 */
export const DEFAULT_THRESHOLDS: Threshold[] = [
  {
    id: "eu-ai-act-systemic-risk",
    name: "EU AI Act — systemic-risk GPAI presumption",
    flops: 1e25,
    source:
      "Regulation (EU) 2024/1689 (EU AI Act), Article 51(2): a general-purpose AI model is presumed to have systemic risk if the cumulative compute used for its training exceeds 10^25 FLOPs.",
  },
];

export interface ThresholdComparison {
  ratio: number;
  exceeds: boolean;
}

/** How does a training run's compute compare to a regulatory threshold? */
export function compareToThreshold(flops: number, thresholdFlops: number): ThresholdComparison {
  const ratio = flops / thresholdFlops;
  return { ratio, exceeds: ratio >= 1 };
}
