import { Provenance } from "./types";

export interface NotableModel {
  id: string;
  name: string;
  organization: string;
  country: string;
  year: number;
  /** Best public compute estimate, in FLOPs */
  computeFlops: number;
  computeProvenance: Provenance;
  source: string;
  notes?: string;
}

/**
 * A small set of notable models spanning several organizations and
 * countries, for the company/country compute comparison view. This is not
 * an attempt at a comprehensive database (see Epoch AI's for that) — it's
 * enough entries to make the comparison meaningful, each traceable to a
 * specific public source with its own reported/calculated/estimated label.
 *
 * "Compute capacity across companies and countries" here means each
 * organization's single most compute-intensive *known* model, not a
 * measure of national compute infrastructure as a whole.
 */
export const NOTABLE_MODELS: NotableModel[] = [
  {
    id: "gpt-3-175b",
    name: "GPT-3 (175B)",
    organization: "OpenAI",
    country: "United States",
    year: 2020,
    computeFlops: 3.14e23,
    computeProvenance: "reported",
    source: "Brown et al. 2020, GPT-3 paper, Appendix D / Table D.1.",
  },
  {
    id: "gpt-4",
    name: "GPT-4",
    organization: "OpenAI",
    country: "United States",
    year: 2023,
    computeFlops: 2.1e25,
    computeProvenance: "estimated",
    source:
      "Widely-cited third-party estimate (e.g. Epoch AI's compute database); OpenAI has not officially disclosed GPT-4's parameter count, token count, or training compute.",
    notes: "Order-of-magnitude estimate only — treat with wide uncertainty.",
  },
  {
    id: "gemini-1-0-ultra",
    name: "Gemini 1.0 Ultra",
    organization: "Google DeepMind",
    country: "United States",
    year: 2023,
    computeFlops: 5e25,
    computeProvenance: "estimated",
    source:
      "Widely-cited third-party estimate (e.g. Epoch AI's compute database); Google has not officially disclosed Gemini 1.0 Ultra's training compute.",
    notes: "Order-of-magnitude estimate only — treat with wide uncertainty.",
  },
  {
    id: "llama-2-70b",
    name: "Llama 2 (70B)",
    organization: "Meta",
    country: "United States",
    year: 2023,
    computeFlops: 8.4e23,
    computeProvenance: "calculated",
    source: "Touvron et al. 2023, Llama 2 paper, Table 2 (1,720,320 A100-80GB GPU-hours).",
    notes: "6ND estimate from reported parameters/tokens; the paper reports GPU-hours, not FLOPs directly.",
  },
  {
    id: "llama-3-1-405b",
    name: "Llama 3.1 (405B)",
    organization: "Meta",
    country: "United States",
    year: 2024,
    computeFlops: 3.8e25,
    computeProvenance: "reported",
    source: "Meta AI, 'The Llama 3 Herd of Models' (2024).",
  },
  {
    id: "qwen2-5-72b",
    name: "Qwen2.5 (72B)",
    organization: "Alibaba",
    country: "China",
    year: 2024,
    computeFlops: 7.78e24,
    computeProvenance: "calculated",
    source: "Qwen Team, Alibaba, 'Qwen2.5 Technical Report' (2024): 72B dense model, pretrained on up to 18T tokens.",
    notes: "6ND estimate from reported parameters/tokens.",
  },
  {
    id: "deepseek-v3",
    name: "DeepSeek-V3",
    organization: "DeepSeek",
    country: "China",
    year: 2024,
    computeFlops: 3.29e24,
    computeProvenance: "calculated",
    source:
      "DeepSeek-AI, 'DeepSeek-V3 Technical Report' (2024): 671B total / 37B active params (MoE), 14.8T tokens, 2.788M H800 GPU-hours.",
    notes:
      "6ND estimate uses active (not total) parameters since this is a mixture-of-experts model. The paper reports GPU-hours directly (2.788M H800 hours) rather than a single FLOPs figure.",
  },
  {
    id: "falcon-180b",
    name: "Falcon (180B)",
    organization: "TII",
    country: "United Arab Emirates",
    year: 2023,
    computeFlops: 3.78e24,
    computeProvenance: "calculated",
    source:
      "Almazrouei et al. 2023, 'The Falcon Series of Open Language Models': 180B params, 3.5T tokens of RefinedWeb.",
    notes: "6ND estimate from reported parameters/tokens.",
  },
];
