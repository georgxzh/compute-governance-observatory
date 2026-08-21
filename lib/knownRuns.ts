import { KnownRun } from "./types";

/**
 * Three public training runs spanning three hardware generations (V100 ->
 * A100 -> H100), used to sanity-check the estimator formulas in
 * tests/estimator.test.ts and displayed in the app's ValidationTable.
 *
 * Every numeric field notes whether it's directly published by the model's
 * creators ("reported") or an assumption we're making to fill a gap the
 * source doesn't cover ("assumed/illustrative") — this is the same
 * reported-vs-estimated distinction the full project will apply to every
 * number it shows.
 */
export const KNOWN_RUNS: KnownRun[] = [
  {
    id: "gpt-3-175b",
    name: "GPT-3 (175B)",
    parameters: 175_000_000_000,
    tokens: 300_000_000_000,
    chipId: "v100-sxm2",
    chipCount: 1024,
    chipCountProvenance: "estimated",
    reportedFlops: 3.14e23,
    source:
      "Brown et al. 2020, 'Language Models are Few-Shot Learners' (GPT-3 paper), Appendix D / Table D.1: total training compute of ~3.14x10^23 FLOPs (3640 petaflop/s-days).",
    notes:
      "reportedFlops is directly published by OpenAI. The paper does not state GPU count or wall-clock duration, so chipCount (1024x V100) here is an illustrative assumption based on commonly-cited estimates for clusters of that era, not an OpenAI-published figure — trainingDays/energy/cost derived from it should be read as illustrative only.",
  },
  {
    id: "llama-2-70b",
    name: "Llama 2 (70B)",
    parameters: 70_000_000_000,
    tokens: 2_000_000_000_000,
    chipId: "a100-80gb-sxm",
    chipCount: 2048,
    chipCountProvenance: "estimated",
    reportedChipHours: 1_720_320,
    reportedTrainingDays: 1_720_320 / 2048 / 24,
    trainingDaysProvenance: "estimated",
    source:
      "Touvron et al. 2023, 'Llama 2: Open Foundation and Fine-Tuned Chat Models', Table 2: 1,720,320 A100-80GB GPU-hours for the 70B model.",
    notes:
      "reportedChipHours (GPU-hours) is directly published by Meta. reportedFlops is not stated as a single number in the paper, so it's left undefined here and only the estimator's 6ND calculation is shown for it. The 2048-GPU cluster size is an assumed typical scale (per Meta's published RSC infrastructure), used only to convert the reported GPU-hours into an illustrative wall-clock duration (~35 days); the chip-hours total itself does not depend on this split.",
  },
  {
    id: "llama-3-1-405b",
    name: "Llama 3.1 (405B)",
    parameters: 405_000_000_000,
    tokens: 15_600_000_000_000,
    chipId: "h100-sxm",
    chipCount: 16384,
    chipCountProvenance: "reported",
    reportedFlops: 3.8e25,
    reportedTrainingDays: 54,
    trainingDaysProvenance: "reported",
    source:
      "Meta AI, 'The Llama 3 Herd of Models' (2024): 405B model pre-trained on up to 16K H100-80GB GPUs, ~3.8x10^25 FLOPs, over ~54 days.",
    notes:
      "Parameter count, token count, chip count, training duration, and total FLOPs are all directly reported by Meta — the most fully-specified of the three runs.",
  },
];
