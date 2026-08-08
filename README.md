# Compute Governance Observatory

A dashboard that estimates the compute, chips, energy, cost, and training
time behind an AI training run, compares hardware options, and validates its
own formulas against published, real training runs — so people outside
compute-governance research can get a sense of how large a given run is
without piecing it together from scattered papers, datasheets, and cloud
pricing pages.

This is the Week 1 milestone from the project's action plan (due Aug 13):
build the core estimator + hardware comparison table, and test it against at
least three public training runs. Regulatory thresholds, reported/estimated
labeling, and the policy-scenario feature are later milestones.

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

`lib/hardware.ts` has specs for V100, A100 (40GB/80GB), H100, H200, B200,
AMD MI300X, and Google TPU v4/v5e/v5p: peak dense BF16/FP16 throughput, TDP,
memory, release year, and a representative on-demand cloud $/hr (which
varies a lot by provider/region/contract — treat it as an editable default,
not a quote).

## Validated against three public training runs

`lib/knownRuns.ts` holds three fixtures spanning three hardware generations,
each with its numbers traced to a specific public source and a note on what
that source actually reports vs. what's assumed to fill a gap:

- **GPT-3 (175B)** — reported total compute (~3.14x10^23 FLOPs) from the
  GPT-3 paper's Appendix D.
- **Llama 2 (70B)** — reported GPU-hours (1,720,320 on A100-80GB) from
  Table 2 of the Llama 2 paper.
- **Llama 3.1 (405B)** — reported parameters, tokens, chip count (16,384
  H100s), duration (~54 days), and total compute (~3.8x10^25 FLOPs) from
  Meta's "Llama 3 Herd of Models" paper — the most fully-specified of the
  three.

`tests/estimator.test.ts` checks the 6ND formula against each run's reported
FLOPs (within 10%), and, for the two runs with published chip/time data,
checks that the *implied* MFU needed to reproduce their reported chip-hours
from the 6ND estimate falls in the realistic 0.2-0.65 band. The same
comparison is shown live in the app's validation table.

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
