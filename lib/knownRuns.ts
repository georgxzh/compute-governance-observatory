import { KnownRun } from "./types";

/**
 * Five public training runs spanning four hardware generations (TPU v4,
 * V100, A100, H100), used to sanity-check the estimator formulas in
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
  {
    id: "palm-540b",
    name: "PaLM (540B)",
    parameters: 540_000_000_000,
    tokens: 780_000_000_000,
    chipId: "tpu-v4",
    chipCount: 6144,
    chipCountProvenance: "reported",
    reportedFlops: 2.56e24,
    reportedMfu: 0.462,
    source:
      "Chowdhery et al. 2022, 'PaLM: Scaling Language Modeling with Pathways': 540B model, 780B tokens, trained on 6,144 TPU v4 chips (two Pods of 3,072) with a reported training efficiency (model FLOPs utilization) of 46.2%.",
    notes:
      "The only run here where MFU itself is directly reported rather than assumed — Google explicitly measured and published their achieved hardware utilization, which is the norm this project otherwise has to estimate for every other run (including its own live estimator).",
  },
  {
    id: "chinchilla-70b",
    name: "Chinchilla (70B)",
    parameters: 70_000_000_000,
    tokens: 1_400_000_000_000,
    chipId: "tpu-v4",
    chipCount: 256,
    chipCountProvenance: "estimated",
    reportedFlops: 5.76e23,
    source:
      "Hoffmann et al. 2022, 'Training Compute-Optimal Large Language Models' (the Chinchilla paper): 70B model, 1.4T tokens, ~5.76x10^23 FLOPs of training compute.",
    notes:
      "reportedFlops is directly stated in the paper (it's the foundational result behind the 6ND-style compute-optimal scaling laws this whole estimator relies on), but the paper doesn't specify a chip count/training duration for this particular model, so chipCount and chip choice (TPU v4, DeepMind's typical training hardware in this era) here are illustrative assumptions only.",
  },
];
