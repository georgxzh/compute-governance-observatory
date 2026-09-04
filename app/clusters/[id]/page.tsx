import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { TRAINING_CLUSTERS } from "@/lib/trainingClusters";
import ClusterDetail from "@/app/components/ClusterDetail";

// Every cluster page is prerendered at build time — the ids come from the
// dataset, so there's nothing dynamic to resolve at request time.
export function generateStaticParams() {
  return TRAINING_CLUSTERS.map((cluster) => ({ id: cluster.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const cluster = TRAINING_CLUSTERS.find((c) => c.id === id);
  if (!cluster) return { title: "Cluster not found" };
  return {
    title: `${cluster.name} — Compute Governance Observatory`,
    description: `${cluster.chipCount.toLocaleString("en-US")} accelerators at ${
      cluster.organization
    }: racks, power draw, and what it could train.`,
  };
}

export default async function ClusterPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cluster = TRAINING_CLUSTERS.find((c) => c.id === id);
  if (!cluster) notFound();

  const others = TRAINING_CLUSTERS.filter((c) => c.id !== cluster.id);

  return (
    <div className="min-h-screen bg-[#08080c] text-neutral-100">
      <main className="mx-auto flex max-w-4xl flex-col gap-8 px-6 py-10">
        <header className="flex flex-col gap-3">
          <Link
            href="/clusters"
            className="w-fit text-xs text-neutral-500 transition-colors hover:text-accent-light"
          >
            ← All training clusters
          </Link>
        </header>

        <ClusterDetail cluster={cluster} />

        <div className="flex flex-col gap-3 border-t border-neutral-900 pt-6">
          <h2 className="text-sm font-semibold text-neutral-300">Compare with</h2>
          <div className="flex flex-wrap gap-2">
            {others.map((other) => (
              <Link
                key={other.id}
                href={`/clusters/${other.id}`}
                className="rounded-full border border-neutral-800 px-4 py-2 text-xs text-neutral-400 transition-colors hover:border-accent/50 hover:text-neutral-100"
              >
                {other.name}{" "}
                <span className="text-neutral-600">
                  ({other.chipCount.toLocaleString("en-US")} chips)
                </span>
              </Link>
            ))}
          </div>
          <Link
            href="/app#clusters"
            className="mt-2 w-fit text-xs text-neutral-500 transition-colors hover:text-accent-light"
          >
            See these clusters alongside the full estimator and threshold data →
          </Link>
        </div>
      </main>
    </div>
  );
}
