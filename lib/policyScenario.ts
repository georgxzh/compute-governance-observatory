import { NotableModel } from "./notableModels";
import { Threshold } from "./types";
import { compareToThreshold } from "./thresholds";

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
