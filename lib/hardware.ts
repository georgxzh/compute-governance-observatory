import { Chip } from "./types";

/**
 * Peak FLOPs are dense (no structured-sparsity) matmul throughput at the chip's
 * primary training precision (BF16 for recent NVIDIA/AMD/Google chips, FP16
 * tensor-core for V100 which predates BF16 tensor cores).
 *
 * Cloud $/hr figures are representative on-demand list prices and vary a lot
 * by provider, region, and contract length (reserved/spot pricing can be
 * 2-4x lower) — treat them as order-of-magnitude, editable defaults, not quotes.
 */
export const HARDWARE: Chip[] = [
  {
    id: "v100-sxm2",
    name: "NVIDIA V100 SXM2 (32GB)",
    vendor: "NVIDIA",
    releaseYear: 2017,
    peakFlopsPerSecond: 125e12,
    precision: "fp16",
    tdpWatts: 300,
    memoryGB: 32,
    cloudUsdPerHour: 2.5,
    source: "NVIDIA V100 datasheet (125 TFLOPS FP16 tensor-core, dense)",
  },
  {
    id: "a100-40gb-sxm",
    name: "NVIDIA A100 SXM (40GB)",
    vendor: "NVIDIA",
    releaseYear: 2020,
    peakFlopsPerSecond: 312e12,
    precision: "bf16",
    tdpWatts: 400,
    memoryGB: 40,
    cloudUsdPerHour: 1.8,
    source: "NVIDIA A100 datasheet (312 TFLOPS BF16 tensor-core, dense)",
  },
  {
    id: "a100-80gb-sxm",
    name: "NVIDIA A100 SXM (80GB)",
    vendor: "NVIDIA",
    releaseYear: 2020,
    peakFlopsPerSecond: 312e12,
    precision: "bf16",
    tdpWatts: 400,
    memoryGB: 80,
    cloudUsdPerHour: 2.0,
    source: "NVIDIA A100 datasheet (312 TFLOPS BF16 tensor-core, dense)",
  },
  {
    id: "h100-sxm",
    name: "NVIDIA H100 SXM (80GB)",
    vendor: "NVIDIA",
    releaseYear: 2023,
    peakFlopsPerSecond: 989e12,
    precision: "bf16",
    tdpWatts: 700,
    memoryGB: 80,
    cloudUsdPerHour: 2.5,
    source: "NVIDIA H100 datasheet (989 TFLOPS BF16 tensor-core, dense)",
  },
  {
    id: "h200-sxm",
    name: "NVIDIA H200 SXM (141GB)",
    vendor: "NVIDIA",
    releaseYear: 2024,
    peakFlopsPerSecond: 989e12,
    precision: "bf16",
    tdpWatts: 700,
    memoryGB: 141,
    cloudUsdPerHour: 3.5,
    source: "NVIDIA H200 datasheet (same BF16 compute as H100, more/faster memory)",
  },
  {
    id: "b200",
    name: "NVIDIA B200",
    vendor: "NVIDIA",
    releaseYear: 2025,
    peakFlopsPerSecond: 2250e12,
    precision: "bf16",
    tdpWatts: 1000,
    memoryGB: 192,
    cloudUsdPerHour: 6.5,
    source: "NVIDIA Blackwell B200 datasheet (2250 TFLOPS BF16 tensor-core, dense)",
  },
  {
    id: "mi300x",
    name: "AMD Instinct MI300X",
    vendor: "AMD",
    releaseYear: 2023,
    peakFlopsPerSecond: 1307e12,
    precision: "bf16",
    tdpWatts: 750,
    memoryGB: 192,
    cloudUsdPerHour: 2.2,
    source: "AMD MI300X datasheet (1307.4 TFLOPS BF16, dense)",
  },
  {
    id: "tpu-v4",
    name: "Google TPU v4",
    vendor: "Google",
    releaseYear: 2021,
    peakFlopsPerSecond: 275e12,
    precision: "bf16",
    tdpWatts: 192,
    memoryGB: 32,
    cloudUsdPerHour: 3.2,
    source: "Google TPU v4 datasheet (275 TFLOPS BF16 per chip)",
  },
  {
    id: "tpu-v5e",
    name: "Google TPU v5e",
    vendor: "Google",
    releaseYear: 2023,
    peakFlopsPerSecond: 197e12,
    precision: "bf16",
    tdpWatts: 300,
    memoryGB: 16,
    cloudUsdPerHour: 1.2,
    source: "Google TPU v5e datasheet (197 TFLOPS BF16 per chip)",
  },
  {
    id: "tpu-v5p",
    name: "Google TPU v5p",
    vendor: "Google",
    releaseYear: 2023,
    peakFlopsPerSecond: 459e12,
    precision: "bf16",
    tdpWatts: 400,
    memoryGB: 95,
    cloudUsdPerHour: 4.2,
    source: "Google TPU v5p datasheet (459 TFLOPS BF16 per chip)",
  },
];

export function getChip(id: string): Chip {
  const chip = HARDWARE.find((c) => c.id === id);
  if (!chip) throw new Error(`Unknown chip id: ${id}`);
  return chip;
}
