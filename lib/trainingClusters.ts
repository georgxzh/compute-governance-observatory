import { getChip } from "./hardware";
import { TrainingCluster } from "./types";

/**
 * A small set of publicly documented AI training clusters/supercomputers —
 * distinct from lib/notableModels.ts. Notable models measure compute a
 * specific model *consumed* during training; this measures a cluster's
 * installed peak *capacity*, independent of any one training run.
 *
 * Coverage here leans US-heavy. That's not a claim that AI compute
 * capacity is concentrated there — it reflects which operators publish
 * verifiable chip counts (official announcements, TOP500 listings) versus
 * which are only covered by third-party estimates too uncertain to include
 * at the same confidence level as the rest of this project's data.
 */
export const TRAINING_CLUSTERS: TrainingCluster[] = [
  {
    id: "xai-colossus",
    name: "Colossus",
    organization: "xAI",
    country: "United States",
    chipId: "h100-sxm",
    chipCount: 100_000,
    chipCountProvenance: "reported",
    year: 2024,
    topology: {
      chipsPerServer: 8,
      serversPerRack: 8,
      provenance: "reported",
      source:
        "Colossus uses Supermicro liquid-cooled 4U servers with 8 GPUs each, 8 servers per rack (64 GPUs/rack), grouped into 512-GPU arrays — per Supermicro's and xAI's public descriptions of the build.",
    },
    source:
      "xAI's own announcement (Sept 2024): Colossus (Memphis, TN) came online with 100,000 NVIDIA H100 GPUs, described at the time as the largest AI training supercomputer in single-cluster operation.",
    notes:
      "xAI has since announced plans to expand Colossus toward 200,000+ GPUs (mixing in H200s); this entry reflects the initial, most solidly reported 100K figure rather than later expansion targets.",
  },
  {
    id: "microsoft-eagle",
    name: "Eagle",
    organization: "Microsoft Azure",
    country: "United States",
    chipId: "h100-sxm",
    chipCount: 14_400,
    chipCountProvenance: "reported",
    year: 2023,
    source:
      "TOP500 list (June 2023): Microsoft's Eagle supercomputer ranked #3 globally with 14,400 NVIDIA H100 GPUs.",
  },
  {
    id: "meta-rsc",
    name: "Research SuperCluster (RSC)",
    organization: "Meta",
    country: "United States",
    chipId: "a100-80gb-sxm",
    chipCount: 16_000,
    chipCountProvenance: "reported",
    year: 2022,
    source:
      "Meta AI blog, 'Introducing the AI Research SuperCluster' (2022): initial buildout of 6,080 A100 GPUs, with a planned full build-out of 16,000 A100-80GB GPUs.",
    notes:
      "16,000 is Meta's own announced target scale for RSC's full build-out, not necessarily the exact count operating at every point in time.",
  },
  {
    id: "google-tpu-v4-pod",
    name: "TPU v4 Pod (single pod)",
    organization: "Google",
    country: "United States",
    chipId: "tpu-v4",
    chipCount: 4_096,
    chipCountProvenance: "reported",
    year: 2021,
    source:
      "Google, 'TPU v4: An Optically Reconfigurable Supercomputer for Machine Learning' (ISCA 2023): each TPU v4 Pod contains up to 4,096 chips.",
    notes:
      "This is the documented capacity of a single standard pod, not Google's total fleet — Google operates many pods (PaLM alone used two, see the validated-runs table above).",
  },
];

/** A cluster's installed peak throughput, independent of any training run. */
export function clusterPeakFlopsPerSecond(cluster: TrainingCluster): number {
  const chip = getChip(cluster.chipId);
  return cluster.chipCount * chip.peakFlopsPerSecond;
}
