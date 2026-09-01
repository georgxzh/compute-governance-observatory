"use client";

import { useMemo, useState } from "react";
import {
  allComparisonRows,
  COMPARISON_CATEGORIES,
  ComparisonCategory,
} from "@/lib/thresholdComparison";
import { DEFAULT_THRESHOLDS, compareToThreshold } from "@/lib/thresholds";
import { formatFlops, formatScientific } from "@/lib/format";
import ProvenanceBadge from "./ProvenanceBadge";

export default function ThresholdComparisonTable() {
  const [durationDays, setDurationDays] = useState(90);
  const [activeCategory, setActiveCategory] = useState<ComparisonCategory | "All">("All");

  const rows = useMemo(() => {
    const all = allComparisonRows(durationDays).sort((a, b) => b.computeFlops - a.computeFlops);
    return activeCategory === "All" ? all : all.filter((r) => r.category === activeCategory);
  }, [durationDays, activeCategory]);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-lg font-semibold text-neutral-100">
          Training runs & clusters vs. thresholds
        </h2>
        <p className="mt-1 max-w-3xl text-xs text-neutral-500">
          One table, three kinds of row, ranked by compute: <strong>validated runs</strong>{" "}
          (compute a model actually consumed, checked against its own paper),{" "}
          <strong>notable models</strong> (compute other notable models consumed, with mixed
          confidence — see badges), and <strong>clusters (hypothetical)</strong> — what a known
          cluster&apos;s installed capacity would produce if dedicated to one training run for
          the duration below, not compute anything actually consumed. This always compares
          against the thresholds&apos; original default values, not any edits made in the panel
          above.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div className="flex flex-wrap gap-1 rounded-md border border-neutral-800 p-0.5 text-xs">
          {(["All", ...COMPARISON_CATEGORIES] as const).map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`rounded px-2 py-1 ${
                activeCategory === category
                  ? "bg-neutral-800 text-neutral-100"
                  : "text-neutral-400 hover:text-neutral-200"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-2 text-xs text-neutral-400">
          Cluster hypothetical duration:
          <input
            type="number"
            min={1}
            value={durationDays}
            onChange={(e) => setDurationDays(e.target.valueAsNumber)}
            className="w-16 rounded-md border border-neutral-700 bg-neutral-900 px-2 py-1 text-neutral-100"
          />
          days
        </label>
      </div>

      <div className="overflow-x-auto rounded-lg border border-neutral-800">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-neutral-900 text-neutral-400">
            <tr>
              <th className="px-3 py-2 font-medium">Name</th>
              <th className="px-3 py-2 font-medium">Type</th>
              <th className="px-3 py-2 font-medium">Compute</th>
              {DEFAULT_THRESHOLDS.map((threshold) => (
                <th key={threshold.id} className="px-3 py-2 font-medium">
                  {threshold.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={`${row.category}-${row.id}`} className="text-neutral-300">
                <td className="px-3 py-2 text-neutral-100">{row.label}</td>
                <td className="px-3 py-2 text-xs text-neutral-500">{row.category}</td>
                <td className="px-3 py-2">
                  <div className="flex items-center gap-2">
                    <span>{formatFlops(row.computeFlops)}</span>
                    <ProvenanceBadge provenance={row.provenance} />
                  </div>
                </td>
                {DEFAULT_THRESHOLDS.map((threshold) => {
                  const { exceeds, ratio } = compareToThreshold(
                    row.computeFlops,
                    threshold.flops
                  );
                  return (
                    <td key={threshold.id} className="px-3 py-2">
                      <span className={exceeds ? "text-red-400" : "text-emerald-400"}>
                        {exceeds ? "Exceeds" : "Below"}
                      </span>{" "}
                      <span className="text-xs text-neutral-500">({ratio.toFixed(2)}x)</span>
                      <div className="text-xs text-neutral-600">
                        {formatScientific(row.computeFlops)}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-neutral-500">
        This is <span className="italic">illustrative only</span>. It shows which already-known
        compute figures (real or hypothetical) a threshold would flag today — not a prediction
        of whether a lab would actually cross a future threshold, change its training approach
        in response, or how &quot;training compute&quot; would be defined or audited in
        practice.
      </p>
    </div>
  );
}
