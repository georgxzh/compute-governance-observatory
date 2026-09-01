export type Precision = "fp16" | "bf16";

/**
 * How confident is this number?
 * - "reported": stated directly by a primary source (a paper, a datasheet, a law)
 * - "calculated": deterministically derived from reported inputs via a formula
 * - "estimated": fills a gap the sources don't cover, using an assumption
 */
export type Provenance = "reported" | "calculated" | "estimated";

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
  /** Is the chipCount above itself published by the source, or an assumption? */
  chipCountProvenance: Provenance;
  /** Reported training compute in FLOPs, if the source publishes one directly (else undefined) */
  reportedFlops?: number;
  /** Reported wall-clock training time in days, if published (or derived, see notes) */
  reportedTrainingDays?: number;
  /** Is reportedTrainingDays itself published directly, or derived via an assumption? */
  trainingDaysProvenance?: Provenance;
  /** Reported total GPU/chip-hours, if that's what the source actually publishes */
  reportedChipHours?: number;
  /** Reported/implied MFU, if the source states or lets us derive one */
  reportedMfu?: number;
  source: string;
  notes?: string;
}

export interface TrainingCluster {
  id: string;
  name: string;
  organization: string;
  country: string;
  chipId: string;
  chipCount: number;
  /** Is the chipCount above itself published by the operator, or a third-party estimate? */
  chipCountProvenance: Provenance;
  /** Year the cluster came online / was announced at this scale */
  year: number;
  source: string;
  notes?: string;
}

export interface Threshold {
  id: string;
  name: string;
  /** Compute threshold, in FLOPs */
  flops: number;
  source: string;
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
