import { HARDWARE } from "@/lib/hardware";
import { formatUsd } from "@/lib/format";

export default function HardwareTable({ selectedChipId }: { selectedChipId?: string }) {
  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold text-neutral-100">Hardware comparison</h2>
      <div className="overflow-x-auto rounded-lg border border-neutral-800">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="bg-neutral-900 text-neutral-400">
            <tr>
              <th className="px-3 py-2 font-medium">Chip</th>
              <th className="px-3 py-2 font-medium">Peak BF16/FP16 TFLOP/s</th>
              <th className="px-3 py-2 font-medium">TDP (W)</th>
              <th className="px-3 py-2 font-medium">Memory (GB)</th>
              <th className="px-3 py-2 font-medium">Cloud $/hr</th>
              <th className="px-3 py-2 font-medium">Released</th>
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
        Peak FLOPs are dense (no structured sparsity) matmul throughput at each chip&apos;s
        primary training precision. Cloud $/hr figures are representative on-demand list
        prices — they vary widely by provider, region, and contract terms.
      </p>
    </div>
  );
}
