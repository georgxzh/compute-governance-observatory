import Link from "next/link";

const FEATURES = [
  {
    title: "Compute, chip, energy & cost estimator",
    description:
      "Enter a model's parameters, tokens, and hardware, and get training compute, time, energy, and cost — every figure labeled reported, calculated, or estimated.",
  },
  {
    title: "Hardware comparison",
    description:
      "Eleven accelerators from V100 through B200, MI300X, and TPU v4/v5e/v5p, with sourced peak throughput, power draw, and representative cloud pricing.",
  },
  {
    title: "Validated against real runs",
    description:
      "The core formula is checked against five public training runs — GPT-3, Llama 2 70B, Llama 3.1 405B, PaLM 540B, and Chinchilla 70B — landing within 2% of their publicly reported compute figures.",
  },
  {
    title: "Regulatory thresholds",
    description:
      "The EU AI Act's 10^25 FLOP systemic-risk threshold, live-compared against your estimate — editable, and extensible with custom thresholds.",
  },
  {
    title: "Company & country compute",
    description:
      "Notable models from OpenAI, Google DeepMind, Meta, Alibaba, DeepSeek, and TII compared by compute consumed, plus known clusters like xAI's Colossus and Microsoft's Eagle compared by installed capacity.",
  },
  {
    title: "Policy scenarios",
    description:
      "See which known models a threshold would flag today — clearly illustrative, not a prediction of how labs would respond to new rules.",
  },
];

export default function Landing() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-[#08080c] text-neutral-100">
      {/* ambient background */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(60% 50% at 50% 0%, rgba(108,99,255,0.22), transparent 70%), radial-gradient(40% 35% at 85% 15%, rgba(166,141,244,0.12), transparent 70%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />

      <main className="relative z-10 mx-auto flex w-full max-w-5xl flex-1 flex-col items-center px-6 py-24 text-center sm:py-32">
        <span className="rounded-full border border-neutral-800 bg-neutral-950/60 px-3 py-1 text-xs tracking-wide text-neutral-400">
          An open-source compute governance tool
        </span>

        <h1 className="mt-8 max-w-3xl font-display text-5xl leading-[1.1] tracking-tight text-neutral-50 sm:text-7xl">
          Compute Governance
          <br />
          Observatory
        </h1>

        <p className="mt-6 max-w-xl text-balance text-base leading-relaxed text-neutral-400 sm:text-lg">
          Estimate the compute, chips, energy, and cost behind an AI training run, and see
          how it stacks up against the regulatory thresholds meant to catch the most
          capable systems before they&apos;re deployed.
        </p>

        <Link
          href="/app"
          className="group mt-10 inline-flex items-center gap-2 rounded-full bg-accent px-7 py-3 text-sm font-medium text-white shadow-[0_0_40px_-8px_rgba(108,99,255,0.6)] transition-all hover:bg-accent-dark hover:shadow-[0_0_50px_-6px_rgba(108,99,255,0.8)]"
        >
          Enter the observatory
          <span className="transition-transform group-hover:translate-x-1">→</span>
        </Link>

        <div className="mt-28 grid w-full grid-cols-1 gap-4 text-left sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="rounded-xl border border-neutral-800 bg-neutral-950/40 p-5 backdrop-blur-sm transition-colors hover:border-accent/50"
            >
              <h2 className="text-sm font-semibold text-neutral-100">{feature.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-neutral-500">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </main>

      <footer className="relative z-10 border-t border-neutral-900 px-6 py-6 text-center text-xs text-neutral-600">
        Built as part of a personal action plan on AI compute governance. Not affiliated
        with, and does not represent the views of, any regulator or organization named on
        this site.
      </footer>
    </div>
  );
}
