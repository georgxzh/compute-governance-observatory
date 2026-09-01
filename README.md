# Compute Governance Observatory

A dashboard that estimates the compute, chips, energy, cost, and training
time behind an AI training run, compares hardware options, and validates its
own formulas against published, real training runs — so people outside
compute-governance research can get a sense of how large a given run is
without piecing it together from scattered papers, datasheets, and cloud
pricing pages.

This covers the project's first three action-plan milestones:
- **Week 1 (Aug 13):** the core estimator + hardware comparison table,
  tested against three public training runs.
- **Week 2 (Aug 20):** editable regulatory thresholds (starting with the EU
  AI Act's 10^25 FLOP threshold), and labeling every figure the app shows as
  **reported**, **calculated**, or **estimated**.
- **Week 3 (Aug 27):** company/country compute visualizations, an
  algorithmic-efficiency adjustment, and an illustrative policy-scenario
  feature.

Publishing the MVP and gathering outside feedback is the last step of the
Week 3 commitment and happens separately from this codebase. Since then,
the site has also gained a gated landing page (`/`, linking to the
dashboard at `/app`), two more validated training runs (PaLM 540B and
Chinchilla 70B), and a known-training-clusters comparison — beyond the
written action-plan milestones.

## Methodology

**Training compute (FLOPs).** `C = 6 x N x D`, where `N` is parameter count
and `D` is training tokens — the standard dense-transformer approximation
used by Kaplan et al. (2020), Hoffmann et al. (2022, "Chinchilla"), and
Epoch AI's compute-trends database. This assumes a dense architecture; for
mixture-of-experts models, `N` should be the *active* parameter count, not
the total.

**Training time.** `T = C / (chips x peak_FLOPs_per_chip x MFU)`. MFU (model
FLOPs utilization) is the ratio of achieved to advertised peak throughput,
and is the largest source of uncertainty in the whole estimate — real
training runs land around 0.3-0.55 depending on model, cluster, and
interconnect, never at the chip's datasheet peak. MFU is a user-editable
input, defaulted per hardware vendor.

**Chips required** is the same formula solved for chip count given a target
training time.

**Energy.** `E = chips x TDP_watts x hours x PUE / 1000` (kWh). PUE
(power usage effectiveness) captures datacenter overhead like cooling and
power delivery losses; ~1.1 is typical for modern hyperscale facilities.

**Cost** is reported as two separate lines so they aren't double-counted:
compute cost (`chips x hours x $/chip-hour`, a cloud rental rate that already
prices in power) and electricity cost (`energy x $/kWh`), which are two
different ways to think about "cost" depending on whether you're renting or
self-hosting.

## Hardware comparison table

`lib/hardware.ts` has specs for V100, A100 (40GB/80GB), H100, H800, H200,
B200, AMD MI300X, and Google TPU v4/v5e/v5p: peak dense BF16/FP16
throughput, TDP, memory, release year, and a representative on-demand cloud
$/hr (which varies a lot by provider/region/contract — treat it as an
editable default, not a quote).

## Validated against five public training runs

`lib/knownRuns.ts` holds five fixtures spanning four hardware generations,
each with its numbers traced to a specific public source and a note on what
that source actually reports vs. what's assumed to fill a gap:

- **GPT-3 (175B)** — reported total compute (~3.14x10^23 FLOPs) from the
  GPT-3 paper's Appendix D.
- **Llama 2 (70B)** — reported GPU-hours (1,720,320 on A100-80GB) from
  Table 2 of the Llama 2 paper.
- **Llama 3.1 (405B)** — reported parameters, tokens, chip count (16,384
  H100s), duration (~54 days), and total compute (~3.8x10^25 FLOPs) from
  Meta's "Llama 3 Herd of Models" paper — the most fully-specified of the
  five.
- **PaLM (540B)** — reported parameters, tokens, chip count (6,144 TPU v4),
  and — uniquely among these fixtures — a directly reported achieved MFU
  (46.2%) from Google's PaLM paper, rather than an assumed one.
- **Chinchilla (70B)** — reported total compute (~5.76x10^23 FLOPs) from
  the paper that established the compute-optimal scaling laws this whole
  estimator's 6ND formula is built on.

`tests/estimator.test.ts` checks the 6ND formula against each run's reported
FLOPs (within 10%), checks that the *implied* MFU needed to reproduce
Llama 2/3.1's reported chip-hours from the 6ND estimate falls in the
realistic 0.2-0.65 band, and — for PaLM specifically — feeds its genuinely
reported MFU into the estimator's own time formula and checks the resulting
duration lands in a plausible range. The same comparisons are shown live in
the app's validation table, where PaLM's estimator-duration figure is
labeled `Calculated` rather than `Estimated`, since it's derived from a
reported MFU instead of an assumed one.

## Regulatory thresholds

`lib/thresholds.ts` defines the starting threshold: the EU AI Act's
Article 51(2) presumption that a general-purpose AI model has systemic risk
once its training compute exceeds 10^25 FLOPs. The app's threshold panel
compares the current estimate's compute against every threshold live, edits
a threshold's FLOPs value in place, and supports adding custom thresholds —
useful for tracking proposed or non-EU rules (e.g. US export-control compute
caps) as they're defined.

## Reported / calculated / estimated labeling

Every figure the app displays is tagged with where it came from, via a
shared `Provenance` type (`reported` | `calculated` | `estimated`) and a
`ProvenanceBadge` component used consistently across the UI:

- **Reported** — stated directly by a primary source: a paper, a datasheet,
  a regulation's text (e.g. hardware peak FLOPs, the known runs' published
  compute/GPU-hours, the EU AI Act's default 10^25 threshold).
- **Calculated** — deterministically derived from reported inputs via a
  formula (e.g. every card in the live results panel, the 6ND estimate in
  the validation table).
- **Estimated** — fills a gap the sources don't cover, using an assumption
  (e.g. MFU/PUE/electricity-price defaults, representative cloud $/hr,
  GPT-3's illustrative chip count, or any threshold value once it's been
  edited away from its reported default).

## Company/country compute comparison

`lib/notableModels.ts` holds a small set of notable models (GPT-3, GPT-4,
Gemini 1.0 Ultra, Llama 2 70B, Llama 3.1 405B, Qwen2.5 72B, DeepSeek-V3,
Falcon 180B) spanning the United States, China, and the UAE, each with its
own `reported`/`calculated`/`estimated` compute figure and source. The
company/country view sums these by organization or country and renders them
on a log-scale bar chart — training compute spans many orders of magnitude,
so a linear scale would make smaller runs invisible. This is a comparison of
each org's/country's most compute-intensive *known* model, not a measure of
total national or organizational compute infrastructure.

## Training cluster capacity

`lib/trainingClusters.ts` holds a separate dataset from notable models: known
AI training clusters/supercomputers (xAI's Colossus, Microsoft's Eagle,
Meta's Research SuperCluster, a Google TPU v4 Pod) with their reported chip
count. This answers a different question than the compute-comparison view
above — *installed peak capacity* (`chip count x that chip's peak FLOPs/s`,
from `clusterPeakFlopsPerSecond()`) rather than compute a specific model
*consumed* during training. Coverage leans US-heavy; that's not a claim
about where compute capacity actually concentrates, it's a reflection of
which operators publish a verifiable chip count (official announcements,
TOP500 listings) at the same confidence level the rest of this project
holds itself to — the UI states this limitation directly rather than
padding the list with less certain figures.

## Algorithmic efficiency adjustment

`lib/algorithmicEfficiency.ts` models the well-documented effect that the
same capability level needs less raw compute over time as architectures,
data, and training recipes improve (Epoch AI's "Algorithmic progress in
language models" (2024) estimates this "compute-equivalent gain" doubles
roughly every 5-14 months). The app's panel shows what a given compute
figure would be equivalent to under an earlier year's algorithms, with the
model year, baseline year, and doubling time all editable — the doubling
time in particular is actively debated, so it's exposed as an assumption,
not baked in as a constant.

## Policy scenario (illustrative)

The policy-scenario table cross-references `lib/notableModels.ts` against
the default regulatory thresholds, showing which already-trained models
would be flagged by each threshold as currently set. This directly reflects
a limitation the project's own strategic assessment calls out: it can show
which known runs would cross a threshold, but it cannot predict how a lab
would actually respond to a new rule, or how "training compute" would be
defined or audited in practice — so the table is captioned as illustrative
only, and always compares against thresholds' original default values
rather than whatever a user has edited them to.

## Known limitations

- The 6ND formula assumes a dense transformer; MoE and non-transformer
  architectures need different accounting.
- MFU and PUE are user-supplied assumptions, not measured — outputs for
  cost/time/energy are only as good as those inputs.
- Cloud $/hr figures are representative on-demand rates, not live pricing.
- GPT-3's chip count/duration in `knownRuns.ts` are illustrative (not
  OpenAI-published) since the paper only reports total compute directly.

## Development

```bash
npm install
npm run dev    # local dev server
npm test       # Vitest validation suite
npm run build  # production build
```
