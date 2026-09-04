"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { TRAINING_CLUSTERS, clusterPeakFlopsPerSecond } from "@/lib/trainingClusters";
import { formatCount, formatFlopsPerSecond } from "@/lib/format";
import ProvenanceBadge from "./ProvenanceBadge";
import ClusterDetail from "./ClusterDetail";

type GroupBy = "organization" | "country";

function groupTotals(groupBy: GroupBy) {
  const totals = new Map<string, number>();
  for (const cluster of TRAINING_CLUSTERS) {
    const key = cluster[groupBy];
    totals.set(key, (totals.get(key) ?? 0) + clusterPeakFlopsPerSecond(cluster));
  }
  return [...totals.entries()].sort((a, b) => b[1] - a[1]);
}

export default function TrainingClustersChart() {
  const [groupBy, setGroupBy] = useState<GroupBy>("organization");
  // Allow linking straight into a cluster's visualization, e.g. from the
  // landing page: /app?cluster=xai-colossus#clusters
  const requestedId = useSearchParams().get("cluster");
  const [selectedId, setSelectedId] = useState<string | null>(
    requestedId && TRAINING_CLUSTERS.some((c) => c.id === requestedId) ? requestedId : null
  );
  const selectedCluster = TRAINING_CLUSTERS.find((c) => c.id === selectedId) ?? null;

  const rows = useMemo(() => groupTotals(groupBy), [groupBy]);
  const maxLog = Math.log10(Math.max(...rows.map(([, flops]) => flops)));
  const minLog = Math.log10(Math.min(...rows.map(([, flops]) => flops)));

  return (
    <div id="clusters" className="flex scroll-mt-24 flex-col gap-3">
      <div>
        <h2 className="text-lg font-semibold text-neutral-100">
          Training cluster capacity by {groupBy === "organization" ? "company" : "country"}
        </h2>
        <p className="mt-1 text-xs text-neutral-500">
          Peak installed throughput of known clusters — a different question from the compute
          a model consumed during training (see the sections above). Coverage here leans
          toward clusters with a publicly verifiable chip count (official announcements,
          TOP500 listings); it is not a survey of national compute infrastructure.
        </p>
      </div>

      <div className="flex gap-1 self-start rounded-md border border-neutral-800 p-0.5 text-xs">
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

      <div className="flex flex-col gap-2 rounded-lg border border-neutral-800 bg-neutral-950 p-4">
        {rows.map(([label, flopsPerSecond]) => {
          const logFlops = Math.log10(flopsPerSecond);
          const widthPct =
            maxLog === minLog ? 100 : 5 + (95 * (logFlops - minLog)) / (maxLog - minLog);
          return (
            <div key={label} className="flex items-center gap-3">
              <span className="w-40 shrink-0 truncate text-sm text-neutral-300" title={label}>
                {label}
              </span>
              <div className="flex-1 rounded bg-neutral-900">
                <div
                  className="rounded bg-accent/70 py-1 pl-2 text-xs text-neutral-50"
                  style={{ width: `${widthPct}%` }}
                >
                  {formatFlopsPerSecond(flopsPerSecond)}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="overflow-x-auto rounded-lg border border-neutral-800">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-neutral-900 text-neutral-400">
            <tr>
              <th className="px-3 py-2 font-medium">Cluster</th>
              <th className="px-3 py-2 font-medium">Organization</th>
              <th className="px-3 py-2 font-medium">Country</th>
              <th className="px-3 py-2 font-medium">Chips</th>
              <th className="px-3 py-2 font-medium">Peak capacity</th>
            </tr>
          </thead>
          <tbody>
            {TRAINING_CLUSTERS.map((cluster) => (
              <tr
                key={cluster.id}
                className={`align-top text-neutral-300 ${
                  selectedId === cluster.id ? "bg-neutral-900/60" : ""
                }`}
              >
                <td className="px-3 py-2">
                  <button
                    onClick={() =>
                      setSelectedId(selectedId === cluster.id ? null : cluster.id)
                    }
                    className="text-left text-neutral-100 underline decoration-neutral-700 underline-offset-4 transition-colors hover:decoration-accent hover:text-accent-light"
                  >
                    {cluster.name}
                    <span className="ml-1 text-xs text-neutral-500">({cluster.year})</span>
                  </button>
                </td>
                <td className="px-3 py-2">{cluster.organization}</td>
                <td className="px-3 py-2">{cluster.country}</td>
                <td className="px-3 py-2">
                  <div className="flex items-center gap-2">
                    <span>{formatCount(cluster.chipCount)}</span>
                    <ProvenanceBadge provenance={cluster.chipCountProvenance} />
                  </div>
                </td>
                <td className="px-3 py-2">
                  <div className="flex items-center gap-2">
                    <span>{formatFlopsPerSecond(clusterPeakFlopsPerSecond(cluster))}</span>
                    <ProvenanceBadge provenance="calculated" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedCluster ? (
        <ClusterDetail cluster={selectedCluster} onClose={() => setSelectedId(null)} />
      ) : (
        <p className="text-xs text-neutral-500">
          Click a cluster name above to see its scale visualized, its power draw, and how fast
          it could train each of the known runs.
        </p>
      )}

      <div className="flex flex-col gap-1 text-xs text-neutral-500">
        {TRAINING_CLUSTERS.map((cluster) => (
          <p key={cluster.id}>
            <span className="text-neutral-400">{cluster.name}:</span>{" "}
            {cluster.notes ?? "Chip count is directly reported by the operator or a listing body."}{" "}
            (<span className="italic">{cluster.source}</span>)
          </p>
        ))}
      </div>
    </div>
  );
}
