/**
 * Algorithmic efficiency: over time, the same capability level can be
 * reached with less raw training compute, because architectures, data
 * curation, and training recipes keep improving independently of hardware.
 * Epoch AI's "Algorithmic progress in language models" (2024) estimates
 * this "compute-equivalent gain" doubles roughly every 5-14 months, with a
 * point estimate around 8-9 months — the range itself is contested, which
 * is exactly why this is exposed as an editable assumption, not a constant.
 *
 * This models a model trained in `year` as needing `multiplier`x more raw
 * compute if it had been trained using `baselineYear`'s (less efficient,
 * if baselineYear < year) algorithms instead.
 */
export const DEFAULT_DOUBLING_MONTHS = 8.5;

export function algorithmicEfficiencyMultiplier(
  year: number,
  baselineYear: number,
  doublingMonths: number
): number {
  const monthsElapsed = (year - baselineYear) * 12;
  return Math.pow(2, monthsElapsed / doublingMonths);
}

/**
 * The compute a model trained in `year` would have needed if built with
 * `baselineYear`'s algorithmic efficiency instead of its own — i.e. its
 * raw compute scaled up (if baselineYear predates year) by the algorithmic
 * efficiency gained since then.
 */
export function computeEquivalentAtBaseline(
  flops: number,
  year: number,
  baselineYear: number,
  doublingMonths: number = DEFAULT_DOUBLING_MONTHS
): number {
  return flops * algorithmicEfficiencyMultiplier(year, baselineYear, doublingMonths);
}
