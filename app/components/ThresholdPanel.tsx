"use client";

import { useState } from "react";
import { Threshold } from "@/lib/types";
import { compareToThreshold, DEFAULT_THRESHOLDS } from "@/lib/thresholds";
import { formatFlops, formatScientific } from "@/lib/format";
import ProvenanceBadge from "./ProvenanceBadge";

interface Props {
  trainingFlops: number;
}

let nextCustomId = 1;

const ORIGINAL_FLOPS: Record<string, number> = Object.fromEntries(
  DEFAULT_THRESHOLDS.map((t) => [t.id, t.flops])
);

export default function ThresholdPanel({ trainingFlops }: Props) {
  const [thresholds, setThresholds] = useState<Threshold[]>(DEFAULT_THRESHOLDS);

  function updateFlops(id: string, flopsExponent: number) {
    setThresholds((prev) =>
      prev.map((t) => (t.id === id ? { ...t, flops: Math.pow(10, flopsExponent) } : t))
    );
  }

  function removeThreshold(id: string) {
    setThresholds((prev) => prev.filter((t) => t.id !== id));
  }

  function addCustomThreshold() {
    setThresholds((prev) => [
      ...prev,
      {
        id: `custom-${nextCustomId++}`,
        name: "Custom threshold",
        flops: 1e25,
        source: "User-defined",
      },
    ]);
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-neutral-100">Regulatory thresholds</h2>
        <button
          onClick={addCustomThreshold}
          className="rounded-md border border-neutral-700 px-3 py-1 text-xs text-neutral-300 hover:border-neutral-500 hover:text-neutral-100"
        >
          + Add custom threshold
        </button>
      </div>
      <div className="flex flex-col gap-3">
        {thresholds.map((threshold) => {
          const { ratio, exceeds } = compareToThreshold(trainingFlops, threshold.flops);
          const exponent = Math.log10(threshold.flops);
          const isUnedited = ORIGINAL_FLOPS[threshold.id] === threshold.flops;
          const valueProvenance = isUnedited ? "reported" : "estimated";

          return (
            <div
              key={threshold.id}
              className="flex flex-col gap-2 rounded-lg border border-neutral-800 bg-neutral-950 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex flex-col gap-1">
                <span className="font-medium text-neutral-200">{threshold.name}</span>
                <span className="text-xs text-neutral-500">{threshold.source}</span>
                <div className="mt-1 flex items-center gap-2">
                  <label className="text-xs text-neutral-400">
                    Threshold: 10^
                    <input
                      type="number"
                      step={0.1}
                      value={Number(exponent.toFixed(2))}
                      onChange={(e) => updateFlops(threshold.id, e.target.valueAsNumber)}
                      className="ml-1 w-16 rounded border border-neutral-700 bg-neutral-900 px-1 py-0.5 text-neutral-100"
                    />{" "}
                    FLOPs ({formatFlops(threshold.flops)})
                  </label>
                  <ProvenanceBadge provenance={valueProvenance} />
                  <button
                    onClick={() => removeThreshold(threshold.id)}
                    className="text-xs text-neutral-500 hover:text-red-400"
                  >
                    remove
                  </button>
                </div>
              </div>
              <div
                className={`flex flex-col items-start gap-0.5 rounded-md border px-3 py-2 text-sm sm:items-end ${
                  exceeds
                    ? "border-red-800 bg-red-950 text-red-300"
                    : "border-emerald-800 bg-emerald-950 text-emerald-300"
                }`}
              >
                <span className="font-semibold">
                  {exceeds ? "Exceeds threshold" : "Below threshold"}
                </span>
                <span className="text-xs opacity-80">
                  {formatScientific(trainingFlops)} vs {formatScientific(threshold.flops)} (
                  {ratio.toFixed(2)}x)
                </span>
              </div>
            </div>
          );
        })}
        {thresholds.length === 0 && (
          <p className="text-sm text-neutral-500">No thresholds — add one above.</p>
        )}
      </div>
      <p className="text-xs text-neutral-500">
        Default threshold values are <span className="italic">reported</span> directly from the
        regulation cited above; editing a value (or adding a custom threshold) marks it{" "}
        <span className="italic">estimated</span>, since regulators periodically revise these
        figures and reasonable people can disagree about exactly how a given run&apos;s compute
        should be counted against them.
      </p>
    </div>
  );
}
