import { NOTABLE_MODELS } from "@/lib/notableModels";
import { DEFAULT_THRESHOLDS } from "@/lib/thresholds";
import { runScenario } from "@/lib/policyScenario";
import { formatScientific } from "@/lib/format";

export default function PolicyScenarioTable() {
  const cells = runScenario(NOTABLE_MODELS, DEFAULT_THRESHOLDS);

  function cellFor(modelId: string, thresholdId: string) {
    return cells.find((c) => c.modelId === modelId && c.thresholdId === thresholdId);
  }

  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold text-neutral-100">Policy scenario (illustrative)</h2>
      <p className="text-xs text-neutral-500">
        Which notable models&apos; known compute would cross each default regulatory threshold,
        as currently set. This is <span className="italic">illustrative only</span>: it shows
        which already-trained models a threshold would flag today, not a prediction of whether
        a lab would actually cross a future threshold, change its training approach in response,
        or how &quot;training compute&quot; would be defined or audited in practice. Edit
        threshold values in the panel above — this table always uses the thresholds&apos;
        original default values.
      </p>
      <div className="overflow-x-auto rounded-lg border border-neutral-800">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="bg-neutral-900 text-neutral-400">
            <tr>
              <th className="px-3 py-2 font-medium">Model</th>
              {DEFAULT_THRESHOLDS.map((threshold) => (
                <th key={threshold.id} className="px-3 py-2 font-medium">
                  {threshold.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {NOTABLE_MODELS.map((model) => (
              <tr key={model.id} className="text-neutral-300">
                <td className="px-3 py-2 text-neutral-100">
                  {model.name}
                  <span className="ml-1 text-xs text-neutral-500">({model.year})</span>
                </td>
                {DEFAULT_THRESHOLDS.map((threshold) => {
                  const cell = cellFor(model.id, threshold.id);
                  if (!cell) return <td key={threshold.id} className="px-3 py-2">—</td>;
                  return (
                    <td key={threshold.id} className="px-3 py-2">
                      <span
                        className={
                          cell.exceeds
                            ? "text-red-400"
                            : "text-emerald-400"
                        }
                      >
                        {cell.exceeds ? "Exceeds" : "Below"}
                      </span>{" "}
                      <span className="text-xs text-neutral-500">({cell.ratio.toFixed(2)}x)</span>
                      <div className="text-xs text-neutral-600">
                        {formatScientific(model.computeFlops)}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
