import Link from "next/link";
import type { Metadata } from "next";
import { TRAINING_CLUSTERS, clusterPeakFlopsPerSecond } from "@/lib/trainingClusters";
import { chipsPerRack, rackCount } from "@/lib/rackTopology";
import { clusterPowerMW } from "@/lib/clusterInsights";
import { getChip } from "@/lib/hardware";
import { formatCount, formatFlopsPerSecond } from "@/lib/format";

export const metadata: Metadata = {
  title: "Training clusters — Compute Governance Observatory",
  description:
    "Known AI training clusters visualized: racks, servers, accelerators, power draw, and what each could train.",
};

export default function ClustersIndexPage() {
  const clusters = [...TRAINING_CLUSTERS].sort(
    (a, b) => clusterPeakFlopsPerSecond(b) - clusterPeakFlopsPerSecond(a)
  );

  return (
    <div className="min-h-screen bg-[#08080c] text-neutral-100">
      <main className="mx-auto flex max-w-4xl flex-col gap-8 px-6 py-10">
        <header className="flex flex-col gap-3">
          <Link
            href="/"
            className="w-fit text-xs text-neutral-500 transition-colors hover:text-accent-light"
          >
            ← Compute Governance Observatory
          </Link>
          <h1 className="font-display text-3xl tracking-tight text-neutral-50">
            Training clusters
          </h1>
          <p className="max-w-2xl text-sm text-neutral-400">
            The machines frontier models are trained on, drawn to scale — accelerators inside
            servers, servers inside racks, racks across a data hall. Pick one to see its
            layout, power draw, and how quickly it could have trained known models.
          </p>
        </header>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {clusters.map((cluster) => (
            <Link
              key={cluster.id}
              href={`/clusters/${cluster.id}`}
              className="group flex flex-col gap-3 rounded-xl border border-neutral-800 bg-neutral-950/60 p-5 transition-colors hover:border-accent/50"
            >
              <div>
                <h2 className="text-base font-semibold text-neutral-100">{cluster.name}</h2>
                <p className="text-xs text-neutral-500">
                  {cluster.organization}, {cluster.country} ({cluster.year})
                </p>
              </div>

              {/* miniature data-hall preview */}
              <div className="flex flex-wrap content-start gap-[2px] overflow-hidden rounded-md border border-neutral-800 bg-neutral-900/40 p-2">
                {Array.from({ length: Math.min(rackCount(cluster), 240) }).map((_, i) => (
                  <span key={i} className="h-2 w-[3px] rounded-[1px] bg-accent/70" />
                ))}
                {rackCount(cluster) > 240 && (
                  <span className="ml-1 self-end text-[10px] text-neutral-500">
                    +{formatCount(rackCount(cluster) - 240)} more
                  </span>
                )}
              </div>

              <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-neutral-400">
                <div className="flex justify-between">
                  <dt>Accelerators</dt>
                  <dd className="text-neutral-200">{formatCount(cluster.chipCount)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt>Racks</dt>
                  <dd className="text-neutral-200">{formatCount(rackCount(cluster))}</dd>
                </div>
                <div className="flex justify-between">
                  <dt>Per rack</dt>
                  <dd className="text-neutral-200">{chipsPerRack(cluster)} chips</dd>
                </div>
                <div className="flex justify-between">
                  <dt>Power</dt>
                  <dd className="text-neutral-200">{clusterPowerMW(cluster).toFixed(1)} MW</dd>
                </div>
                <div className="flex justify-between">
                  <dt>Chip</dt>
                  <dd className="truncate text-neutral-200" title={getChip(cluster.chipId).name}>
                    {getChip(cluster.chipId).name.replace("NVIDIA ", "").replace("Google ", "")}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt>Peak</dt>
                  <dd className="text-neutral-200">
                    {formatFlopsPerSecond(clusterPeakFlopsPerSecond(cluster))}
                  </dd>
                </div>
              </dl>

              <span className="text-xs text-accent-light opacity-0 transition-opacity group-hover:opacity-100">
                Visualize →
              </span>
            </Link>
          ))}
        </div>

        <p className="border-t border-neutral-900 pt-6 text-xs text-neutral-500">
          Looking for the estimator, validated training runs, and regulatory threshold
          comparisons?{" "}
          <Link href="/app" className="text-neutral-300 underline hover:text-accent-light">
            Open the full dashboard
          </Link>
          .
        </p>
      </main>
    </div>
  );
}
