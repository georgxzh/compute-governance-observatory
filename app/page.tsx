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
      <a
        href="https://bluedot.org"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Built following a BlueDot Impact course"
        className="fixed bottom-4 right-4 opacity-25 grayscale transition-opacity hover:opacity-70"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/bluedot-impact-logo.svg" alt="BlueDot Impact" className="h-4 w-auto" />
      </a>
    </div>
  );
}
