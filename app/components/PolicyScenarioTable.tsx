"use client";

import { useState } from "react";
import { NOTABLE_MODELS } from "@/lib/notableModels";
import { TRAINING_CLUSTERS } from "@/lib/trainingClusters";
import { DEFAULT_THRESHOLDS } from "@/lib/thresholds";
import { DEFAULT_MFU_BY_VENDOR } from "@/lib/estimator";
import { getChip } from "@/lib/hardware";
import { runClusterScenario, runScenario } from "@/lib/policyScenario";
import { formatFlops, formatScientific } from "@/lib/format";
import ProvenanceBadge from "./ProvenanceBadge";

export default function PolicyScenarioTable() {
  const [durationDays, setDurationDays] = useState(90);

  const modelCells = runScenario(NOTABLE_MODELS, DEFAULT_THRESHOLDS);
  const clusterMfuByCluster = new Map(
    TRAINING_CLUSTERS.map((cluster) => [
      cluster.id,
      DEFAULT_MFU_BY_VENDOR[getChip(cluster.chipId).vendor] ?? 0.4,
    ])
  );

  function modelCellFor(modelId: string, thresholdId: string) {
    return modelCells.find((c) => c.modelId === modelId && c.thresholdId === thresholdId);
  }

  return (
    <div className="flex flex-col gap-8">
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
                    const cell = modelCellFor(model.id, threshold.id);
                    if (!cell) return <td key={threshold.id} className="px-3 py-2">—</td>;
                    return (
                      <td key={threshold.id} className="px-3 py-2">
                        <span className={cell.exceeds ? "text-red-400" : "text-emerald-400"}>
                          {cell.exceeds ? "Exceeds" : "Below"}
                        </span>{" "}
                        <span className="text-xs text-neutral-500">
                          ({cell.ratio.toFixed(2)}x)
                        </span>
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

      <div className="flex flex-col gap-3">
        <h3 className="text-base font-semibold text-neutral-100">
          If a cluster trained one model flat-out (hypothetical)
        </h3>
        <p className="text-xs text-neutral-500">
          Training clusters (above) measure peak <span className="italic">capacity</span>{" "}
          (FLOP/s), which isn&apos;t directly comparable to a compute threshold (FLOPs). This
          bridges the two the same way the live estimator does: assuming a cluster ran a
          single training job flat-out for the duration below, at a typical MFU for its chip
          vendor, what compute would that produce? This is a hypothetical dedicated-use
          scenario, not compute any model actually consumed on these clusters —{" "}
          <ProvenanceBadge provenance="estimated" /> throughout.
        </p>
        <label className="flex w-fit items-center gap-2 text-sm text-neutral-300">
          Assumed dedicated training duration:
          <input
            type="number"
            min={1}
            value={durationDays}
            onChange={(e) => setDurationDays(e.target.valueAsNumber)}
            className="w-20 rounded-md border border-neutral-700 bg-neutral-900 px-2 py-1 text-neutral-100"
          />
          days
        </label>
        <div className="overflow-x-auto rounded-lg border border-neutral-800">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-neutral-900 text-neutral-400">
              <tr>
                <th className="px-3 py-2 font-medium">Cluster</th>
                <th className="px-3 py-2 font-medium">Assumed MFU</th>
                <th className="px-3 py-2 font-medium">Implied compute</th>
                {DEFAULT_THRESHOLDS.map((threshold) => (
                  <th key={threshold.id} className="px-3 py-2 font-medium">
                    {threshold.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TRAINING_CLUSTERS.map((cluster) => {
                const mfu = clusterMfuByCluster.get(cluster.id) ?? 0.4;
                const cells = runClusterScenario(
                  [cluster],
                  DEFAULT_THRESHOLDS,
                  durationDays,
                  mfu
                );
                return (
                  <tr key={cluster.id} className="text-neutral-300">
                    <td className="px-3 py-2 text-neutral-100">{cluster.name}</td>
                    <td className="px-3 py-2">{(mfu * 100).toFixed(0)}%</td>
                    <td className="px-3 py-2">
                      {formatFlops(cells[0]?.impliedFlops ?? 0)}
                    </td>
                    {DEFAULT_THRESHOLDS.map((threshold) => {
                      const cell = cells.find((c) => c.thresholdId === threshold.id);
                      if (!cell) return <td key={threshold.id} className="px-3 py-2">—</td>;
                      return (
                        <td key={threshold.id} className="px-3 py-2">
                          <span className={cell.exceeds ? "text-red-400" : "text-emerald-400"}>
                            {cell.exceeds ? "Exceeds" : "Below"}
                          </span>{" "}
                          <span className="text-xs text-neutral-500">
                            ({cell.ratio.toFixed(2)}x)
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
