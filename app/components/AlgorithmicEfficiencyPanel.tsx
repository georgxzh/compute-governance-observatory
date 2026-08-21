"use client";

import { useState } from "react";
import { computeEquivalentAtBaseline, DEFAULT_DOUBLING_MONTHS } from "@/lib/algorithmicEfficiency";
import { formatFlops, formatScientific } from "@/lib/format";
import ProvenanceBadge from "./ProvenanceBadge";

interface Props {
  trainingFlops: number;
}

const CURRENT_YEAR = new Date().getFullYear();

export default function AlgorithmicEfficiencyPanel({ trainingFlops }: Props) {
  const [modelYear, setModelYear] = useState(CURRENT_YEAR);
  const [baselineYear, setBaselineYear] = useState(2012);
  const [doublingMonths, setDoublingMonths] = useState(DEFAULT_DOUBLING_MONTHS);

  const equivalentFlops = computeEquivalentAtBaseline(
    trainingFlops,
    modelYear,
    baselineYear,
    doublingMonths
  );

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-neutral-800 bg-neutral-950 p-4">
      <h2 className="text-lg font-semibold text-neutral-100">Algorithmic efficiency adjustment</h2>
      <p className="text-xs text-neutral-500">
        The same capability level typically needs less raw compute over time as architectures,
        data, and training recipes improve. This shows how much compute your run above would be{" "}
        <span className="italic">equivalent to</span> if it had instead been trained using an
        earlier year&apos;s algorithms.
      </p>

      <div className="grid grid-cols-3 gap-3 text-sm">
        <label className="flex flex-col gap-1">
          <span className="text-neutral-300">Model&apos;s year</span>
          <input
            type="number"
            value={modelYear}
            onChange={(e) => setModelYear(e.target.valueAsNumber)}
            className="rounded-md border border-neutral-700 bg-neutral-900 px-2 py-1 text-neutral-100"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-neutral-300">Baseline year</span>
          <input
            type="number"
            value={baselineYear}
            onChange={(e) => setBaselineYear(e.target.valueAsNumber)}
            className="rounded-md border border-neutral-700 bg-neutral-900 px-2 py-1 text-neutral-100"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-neutral-300">Doubling time (months)</span>
          <input
            type="number"
            step={0.5}
            value={doublingMonths}
            onChange={(e) => setDoublingMonths(e.target.valueAsNumber)}
            className="rounded-md border border-neutral-700 bg-neutral-900 px-2 py-1 text-neutral-100"
          />
        </label>
      </div>

      <div className="flex items-center justify-between rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2">
        <div className="flex flex-col">
          <span className="text-xs uppercase tracking-wide text-neutral-500">
            Compute-equivalent using {baselineYear} algorithms
          </span>
          <span className="text-xl font-semibold text-neutral-100">
            {formatFlops(equivalentFlops)}
          </span>
          <span className="text-xs text-neutral-500">{formatScientific(equivalentFlops)}</span>
        </div>
        <ProvenanceBadge provenance="estimated" />
      </div>

      <p className="text-xs text-neutral-500">
        Default doubling time ({DEFAULT_DOUBLING_MONTHS} months) is Epoch AI&apos;s (2024) point
        estimate for language models — their own reported range spans roughly 5-14 months, and
        the estimate itself is actively debated, hence the <span className="italic">estimated</span>{" "}
        label regardless of the inputs you choose.
      </p>
    </div>
  );
}
