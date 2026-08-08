import { EstimatorOutput } from "@/lib/types";
import { formatDays, formatEnergy, formatFlops, formatScientific, formatUsd } from "@/lib/format";

function ResultCard({
  label,
  value,
  sublabel,
}: {
  label: string;
  value: string;
  sublabel?: string;
}) {
  return (
    <div className="flex flex-col gap-1 rounded-lg border border-neutral-800 bg-neutral-950 p-4">
      <span className="text-xs uppercase tracking-wide text-neutral-500">{label}</span>
      <span className="text-2xl font-semibold text-neutral-100">{value}</span>
      {sublabel && <span className="text-xs text-neutral-500">{sublabel}</span>}
    </div>
  );
}

export default function ResultsPanel({ output }: { output: EstimatorOutput }) {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold text-neutral-100">Estimated results</h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <ResultCard
          label="Training compute"
          value={formatFlops(output.trainingFlops)}
          sublabel={formatScientific(output.trainingFlops)}
        />
        <ResultCard label="Training time" value={formatDays(output.trainingDays)} />
        <ResultCard label="Energy" value={formatEnergy(output.energyKWh)} />
        <ResultCard
          label="Compute (cloud rental) cost"
          value={formatUsd(output.computeCostUsd)}
          sublabel="chips x hours x $/chip-hour"
        />
        <ResultCard
          label="Electricity cost"
          value={formatUsd(output.energyCostUsd)}
          sublabel="raw energy only, not the same as rental cost"
        />
      </div>
    </div>
  );
}
