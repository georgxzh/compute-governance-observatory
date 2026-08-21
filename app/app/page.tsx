import Link from "next/link";
import EstimatorApp from "@/app/components/EstimatorApp";

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-[#08080c] text-neutral-100">
      <main className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-10">
        <header className="flex flex-col gap-3">
          <Link
            href="/"
            className="w-fit text-xs text-neutral-500 transition-colors hover:text-accent-light"
          >
            ← Compute Governance Observatory
          </Link>
          <h1 className="font-display text-3xl tracking-tight text-neutral-50">
            The estimator
          </h1>
          <p className="max-w-3xl text-sm text-neutral-400">
            Estimate the compute, chips, energy, cost, and training time behind an AI
            training run, compare hardware options, and check the underlying formulas
            against five public training runs.
          </p>
        </header>
        <EstimatorApp />
      </main>
    </div>
  );
}
