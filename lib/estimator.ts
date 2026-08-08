import { getChip } from "./hardware";
import { EstimatorInput, EstimatorOutput } from "./types";

const SECONDS_PER_HOUR = 3600;
const HOURS_PER_DAY = 24;

/**
 * Training compute via the standard dense-transformer approximation
 * (Kaplan et al. 2020 / Hoffmann et al. 2022 / Epoch AI convention):
 * one forward+backward pass costs ~6 FLOPs per parameter per token.
 *
 * This assumes a dense architecture. For mixture-of-experts models,
 * `parameters` should be the active (not total) parameter count.
 */
export function trainingFlops(parameters: number, tokens: number): number {
  return 6 * parameters * tokens;
}

/**
 * Wall-clock training time implied by a compute budget, a cluster, and an
 * assumed model FLOPs utilization (MFU). MFU is the ratio of achieved to
 * peak hardware throughput and is the single biggest source of uncertainty
 * here — real training runs typically land around 0.3-0.55 depending on
 * model/cluster/interconnect, never at the chip's advertised peak.
 */
export function trainingSeconds(
  flops: number,
  chipCount: number,
  peakFlopsPerSecond: number,
  mfu: number
): number {
  const effectiveFlopsPerSecond = chipCount * peakFlopsPerSecond * mfu;
  return flops / effectiveFlopsPerSecond;
}

/**
 * Inverse of trainingSeconds: how many chips are needed to hit a target
 * training duration for a given compute budget.
 */
export function chipsRequired(
  flops: number,
  targetSeconds: number,
  peakFlopsPerSecond: number,
  mfu: number
): number {
  return flops / (targetSeconds * peakFlopsPerSecond * mfu);
}

/**
 * Energy consumed by the accelerators over the training run, scaled by PUE
 * (power usage effectiveness) to account for datacenter overhead such as
 * cooling and power delivery losses. PUE ~1.1 is typical for modern
 * hyperscale datacenters; older/less efficient facilities run higher.
 */
export function energyKWh(
  chipCount: number,
  tdpWatts: number,
  seconds: number,
  pue: number
): number {
  const hours = seconds / SECONDS_PER_HOUR;
  return (chipCount * tdpWatts * hours * pue) / 1000;
}

/**
 * Two cost lines, kept separate so they aren't double-counted:
 * - computeCostUsd: renting the chips for the duration of the run (the
 *   dominant real-world cost; cloud rates already price in power/cooling).
 * - energyCostUsd: the raw electricity cost alone, useful for comparing
 *   against self-hosted/owned-datacenter economics.
 */
export function computeCostUsd(
  chipCount: number,
  seconds: number,
  cloudUsdPerHour: number
): number {
  const hours = seconds / SECONDS_PER_HOUR;
  return chipCount * hours * cloudUsdPerHour;
}

export function energyCostUsd(kWh: number, electricityUsdPerKwh: number): number {
  return kWh * electricityUsdPerKwh;
}

export function estimate(input: EstimatorInput): EstimatorOutput {
  const chip = getChip(input.chipId);
  const flops = trainingFlops(input.parameters, input.tokens);
  const seconds = trainingSeconds(
    flops,
    input.chipCount,
    chip.peakFlopsPerSecond,
    input.mfu
  );
  const kWh = energyKWh(input.chipCount, chip.tdpWatts, seconds, input.pue);
  const cloudRate = input.cloudUsdPerHourOverride ?? chip.cloudUsdPerHour;

  return {
    trainingFlops: flops,
    trainingSeconds: seconds,
    trainingDays: seconds / SECONDS_PER_HOUR / HOURS_PER_DAY,
    energyKWh: kWh,
    computeCostUsd: computeCostUsd(input.chipCount, seconds, cloudRate),
    energyCostUsd: energyCostUsd(kWh, input.electricityUsdPerKwh),
  };
}

export const DEFAULT_MFU_BY_VENDOR: Record<string, number> = {
  NVIDIA: 0.4,
  AMD: 0.35,
  Google: 0.45,
};

export const DEFAULT_PUE = 1.1;
export const DEFAULT_ELECTRICITY_USD_PER_KWH = 0.1;
