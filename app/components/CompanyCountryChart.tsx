"use client";

import { useMemo, useState } from "react";
import { NOTABLE_MODELS } from "@/lib/notableModels";
import { formatFlops } from "@/lib/format";
import ProvenanceBadge from "./ProvenanceBadge";

type GroupBy = "organization" | "country";

function groupTotals(groupBy: GroupBy) {
  const totals = new Map<string, number>();
  for (const model of NOTABLE_MODELS) {
    const key = model[groupBy];
    totals.set(key, (totals.get(key) ?? 0) + model.computeFlops);
  }
  return [...totals.entries()].sort((a, b) => b[1] - a[1]);
}

export default function CompanyCountryChart() {
  const [groupBy, setGroupBy] = useState<GroupBy>("organization");

  const rows = useMemo(() => groupTotals(groupBy), [groupBy]);
  const maxLog = Math.log10(Math.max(...rows.map(([, flops]) => flops)));
  const minLog = Math.log10(Math.min(...rows.map(([, flops]) => flops)));

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-neutral-100">
          Compute by {groupBy === "organization" ? "company" : "country"}
        </h2>
        <div className="flex gap-1 rounded-md border border-neutral-800 p-0.5 text-xs">
          {(["organization", "country"] as const).map((option) => (
            <button
              key={option}
              onClick={() => setGroupBy(option)}
              className={`rounded px-2 py-1 ${
                groupBy === option
                  ? "bg-neutral-800 text-neutral-100"
                  : "text-neutral-400 hover:text-neutral-200"
              }`}
            >
              {option === "organization" ? "By company" : "By country"}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2 rounded-lg border border-neutral-800 bg-neutral-950 p-4">
        {rows.map(([label, flops]) => {
          const logFlops = Math.log10(flops);
          const widthPct =
            maxLog === minLog ? 100 : 5 + (95 * (logFlops - minLog)) / (maxLog - minLog);
          return (
            <div key={label} className="flex items-center gap-3">
              <span className="w-40 shrink-0 truncate text-sm text-neutral-300" title={label}>
                {label}
              </span>
              <div className="flex-1 rounded bg-neutral-900">
                <div
                  className="rounded bg-sky-700 py-1 pl-2 text-xs text-sky-100"
                  style={{ width: `${widthPct}%` }}
                >
                  {formatFlops(flops)}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-xs text-neutral-500">
        Bars use a <span className="italic">log scale</span> — training compute spans many
        orders of magnitude, so a linear scale would make smaller runs invisible. Each
        company&apos;s/country&apos;s total is the sum of its notable models&apos; individual
        compute figures below (mixed <ProvenanceBadge provenance="reported" />
        {" "}
        <ProvenanceBadge provenance="calculated" /> <ProvenanceBadge provenance="estimated" /> —
        see each model&apos;s own source in the table below), not a measure of national or
        organizational compute infrastructure as a whole.
      </p>

      <div className="overflow-x-auto rounded-lg border border-neutral-800">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="bg-neutral-900 text-neutral-400">
            <tr>
              <th className="px-3 py-2 font-medium">Model</th>
              <th className="px-3 py-2 font-medium">Organization</th>
              <th className="px-3 py-2 font-medium">Country</th>
              <th className="px-3 py-2 font-medium">Year</th>
              <th className="px-3 py-2 font-medium">Compute</th>
            </tr>
          </thead>
          <tbody>
            {NOTABLE_MODELS.map((model) => (
              <tr key={model.id} className="text-neutral-300">
                <td className="px-3 py-2">{model.name}</td>
                <td className="px-3 py-2">{model.organization}</td>
                <td className="px-3 py-2">{model.country}</td>
                <td className="px-3 py-2">{model.year}</td>
                <td className="px-3 py-2">
                  <div className="flex items-center gap-2">
                    <span>{formatFlops(model.computeFlops)}</span>
                    <ProvenanceBadge provenance={model.computeProvenance} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
