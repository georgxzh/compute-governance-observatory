import EstimatorApp from "./components/EstimatorApp";

export default function Home() {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <main className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-10">
        <header className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold">Compute Governance Observatory</h1>
          <p className="max-w-3xl text-sm text-neutral-400">
            Estimate the compute, chips, energy, cost, and training time behind an AI
            training run, compare hardware options, and check the underlying formulas
            against three public training runs.
          </p>
        </header>
        <EstimatorApp />
      </main>
    </div>
  );
}
