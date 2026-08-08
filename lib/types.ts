export type Precision = "fp16" | "bf16";

export interface Chip {
  /** Unique key, e.g. "h100-sxm" */
  id: string;
  /** Display name, e.g. "NVIDIA H100 SXM" */
  name: string;
  vendor: "NVIDIA" | "AMD" | "Google";
  /** Year the chip became broadly available */
  releaseYear: number;
  /** Peak dense (no sparsity) matmul throughput at the given precision, in FLOP/s */
  peakFlopsPerSecond: number;
  precision: Precision;
  /** Thermal design power, watts */
  tdpWatts: number;
  memoryGB: number;
  /** Typical on-demand cloud rental price, USD per chip-hour */
  cloudUsdPerHour: number;
  /** Where the specs above came from */
  source: string;
}

export interface KnownRun {
  id: string;
  name: string;
  /** Total (or active, for MoE) parameter count */
  parameters: number;
  /** Training tokens */
  tokens: number;
  chipId: string;
  chipCount: number;
  /** Reported training compute in FLOPs, if the source publishes one directly (else undefined) */
  reportedFlops?: number;
  /** Reported wall-clock training time in days, if published (or derived, see notes) */
  reportedTrainingDays?: number;
  /** Reported total GPU/chip-hours, if that's what the source actually publishes */
  reportedChipHours?: number;
  /** Reported/implied MFU, if the source states or lets us derive one */
  reportedMfu?: number;
  source: string;
  notes?: string;
}

export interface EstimatorInput {
  parameters: number;
  tokens: number;
  chipId: string;
  chipCount: number;
  /** Model FLOPs utilization, 0-1 */
  mfu: number;
  /** Datacenter power usage effectiveness overhead multiplier, e.g. 1.1 */
  pue: number;
  /** USD per kWh, for the secondary energy-cost line */
  electricityUsdPerKwh: number;
  /** Override the chip's default cloud $/hr, if set */
  cloudUsdPerHourOverride?: number;
}

export interface EstimatorOutput {
  trainingFlops: number;
  trainingSeconds: number;
  trainingDays: number;
  energyKWh: number;
  computeCostUsd: number;
  energyCostUsd: number;
}
