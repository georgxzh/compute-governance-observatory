import { KNOWN_RUNS } from "@/lib/knownRuns";
import { getChip } from "@/lib/hardware";
import {
  DEFAULT_ELECTRICITY_USD_PER_KWH,
  DEFAULT_MFU_BY_VENDOR,
  DEFAULT_PUE,
  estimate,
} from "@/lib/estimator";
import { formatCount, formatDays, formatFlops, formatPercent } from "@/lib/format";
import ProvenanceBadge from "./ProvenanceBadge";

export default function ValidationTable() {
  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold text-neutral-100">
        Validation against 3 public training runs
      </h2>
      <div className="overflow-x-auto rounded-lg border border-neutral-800">
        <table className="w-full min-w-[840px] text-left text-sm">
          <thead className="bg-neutral-900 text-neutral-400">
            <tr>
              <th className="px-3 py-2 font-medium">Run</th>
              <th className="px-3 py-2 font-medium">Chips</th>
              <th className="px-3 py-2 font-medium">Reported compute</th>
              <th className="px-3 py-2 font-medium">Estimator (6ND)</th>
              <th className="px-3 py-2 font-medium">Delta</th>
              <th className="px-3 py-2 font-medium">Duration</th>
              <th className="px-3 py-2 font-medium">Estimator duration*</th>
            </tr>
          </thead>
          <tbody>
            {KNOWN_RUNS.map((run) => {
              const chip = getChip(run.chipId);
              const mfu = DEFAULT_MFU_BY_VENDOR[chip.vendor] ?? 0.4;
              const output = estimate({
                parameters: run.parameters,
                tokens: run.tokens,
                chipId: run.chipId,
                chipCount: run.chipCount,
                mfu,
                pue: DEFAULT_PUE,
                electricityUsdPerKwh: DEFAULT_ELECTRICITY_USD_PER_KWH,
              });
              const delta = run.reportedFlops
                ? (output.trainingFlops - run.reportedFlops) / run.reportedFlops
                : undefined;

              return (
                <tr key={run.id} className="text-neutral-300 align-top">
                  <td className="px-3 py-2 text-neutral-100">{run.name}</td>
                  <td className="px-3 py-2">
                    <div className="flex flex-col gap-1">
                      <span>{formatCount(run.chipCount)}</span>
                      <ProvenanceBadge provenance={run.chipCountProvenance} />
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    {run.reportedFlops ? (
                      <div className="flex flex-col gap-1">
                        <span>{formatFlops(run.reportedFlops)}</span>
                        <ProvenanceBadge provenance="reported" />
                      </div>
                    ) : (
                      <span className="text-neutral-500">not published</span>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex flex-col gap-1">
                      <span>{formatFlops(output.trainingFlops)}</span>
                      <ProvenanceBadge provenance="calculated" />
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    {delta !== undefined ? formatPercent(delta) : "—"}
                  </td>
                  <td className="px-3 py-2">
                    {run.reportedTrainingDays ? (
                      <div className="flex flex-col gap-1">
                        <span>{formatDays(run.reportedTrainingDays)}</span>
                        {run.trainingDaysProvenance && (
                          <ProvenanceBadge provenance={run.trainingDaysProvenance} />
                        )}
                      </div>
                    ) : (
                      <span className="text-neutral-500">not published</span>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex flex-col gap-1">
                      <span>
                        {formatDays(output.trainingDays)} (at {formatPercent(mfu)} MFU)
                      </span>
                      <ProvenanceBadge provenance="estimated" />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="flex flex-col gap-1 text-xs text-neutral-500">
        <p>
          * Estimator duration uses a default MFU per chip vendor since none of these sources
          publish an MFU directly — hence its <span className="italic">Estimated</span> label
          even where the underlying compute figure is <span className="italic">Reported</span>.
        </p>
        {KNOWN_RUNS.map((run) => (
          <p key={run.id}>
            <span className="text-neutral-400">{run.name}:</span> {run.notes} (
            <span className="italic">{run.source}</span>)
          </p>
        ))}
      </div>
    </div>
  );
}
