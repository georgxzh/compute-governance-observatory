import { HARDWARE } from "@/lib/hardware";
import { formatUsd } from "@/lib/format";
import ProvenanceBadge from "./ProvenanceBadge";

function ColumnHeader({ label, provenance }: { label: string; provenance: "reported" | "estimated" }) {
  return (
    <th className="px-3 py-2 font-medium">
      <div className="flex flex-col gap-1">
        <span>{label}</span>
        <ProvenanceBadge provenance={provenance} />
      </div>
    </th>
  );
}

export default function HardwareTable({ selectedChipId }: { selectedChipId?: string }) {
  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold text-neutral-100">Hardware comparison</h2>
      <div className="overflow-x-auto rounded-lg border border-neutral-800">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-neutral-900 text-neutral-400">
            <tr>
              <th className="px-3 py-2 font-medium align-bottom">Chip</th>
              <ColumnHeader label="Peak BF16/FP16 TFLOP/s" provenance="reported" />
              <ColumnHeader label="TDP (W)" provenance="reported" />
              <ColumnHeader label="Memory (GB)" provenance="reported" />
              <ColumnHeader label="Cloud $/hr" provenance="estimated" />
              <th className="px-3 py-2 font-medium align-bottom">Released</th>
            </tr>
          </thead>
          <tbody>
            {HARDWARE.map((chip) => (
              <tr
                key={chip.id}
                className={
                  chip.id === selectedChipId
                    ? "bg-neutral-800/60 text-neutral-100"
                    : "text-neutral-300"
                }
              >
                <td className="px-3 py-2">{chip.name}</td>
                <td className="px-3 py-2">{(chip.peakFlopsPerSecond / 1e12).toFixed(0)}</td>
                <td className="px-3 py-2">{chip.tdpWatts}</td>
                <td className="px-3 py-2">{chip.memoryGB}</td>
                <td className="px-3 py-2">{formatUsd(chip.cloudUsdPerHour)}</td>
                <td className="px-3 py-2">{chip.releaseYear}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-neutral-500">
        Peak FLOPs, TDP, and memory are <span className="italic">reported</span> manufacturer
        datasheet specs. Cloud $/hr is an <span className="italic">estimated</span>,
        representative on-demand list price — it varies widely by provider, region, and
        contract terms.
      </p>
    </div>
  );
}
