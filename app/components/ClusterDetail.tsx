import { TrainingCluster } from "@/lib/types";
import { getChip } from "@/lib/hardware";
import { clusterPeakFlopsPerSecond } from "@/lib/trainingClusters";
import {
  clusterEnergyPerDayMWh,
  clusterMfu,
  clusterPowerMW,
  timeToTrainDays,
} from "@/lib/clusterInsights";
import RackVisualization from "./RackVisualization";
import { chipsPerRack, rackCount } from "@/lib/rackTopology";
import { KNOWN_RUNS } from "@/lib/knownRuns";
import { trainingFlops } from "@/lib/estimator";
import { formatCount, formatDays, formatFlopsPerSecond, formatPercent } from "@/lib/format";
import ProvenanceBadge from "./ProvenanceBadge";

function Stat({ label, value, sublabel }: { label: string; value: string; sublabel?: string }) {
  return (
    <div className="flex flex-col gap-0.5 rounded-lg border border-neutral-800 bg-neutral-900/50 p-3">
      <span className="text-[10px] uppercase tracking-wide text-neutral-500">{label}</span>
      <span className="text-lg font-semibold text-neutral-100">{value}</span>
      {sublabel && <span className="text-[10px] text-neutral-500">{sublabel}</span>}
    </div>
  );
}

export default function ClusterDetail({ cluster }: { cluster: TrainingCluster }) {
  const chip = getChip(cluster.chipId);
  const mfu = clusterMfu(cluster);
  const powerMW = clusterPowerMW(cluster);

  return (
    <div className="flex flex-col gap-5 rounded-lg border border-accent/40 bg-neutral-950 p-5">
      <div>
        <h2 className="font-display text-2xl text-neutral-50">{cluster.name}</h2>
        <p className="mt-1 text-sm text-neutral-500">
          {cluster.organization}, {cluster.country} ({cluster.year}) —{" "}
          {formatCount(cluster.chipCount)} x {chip.name}
        </p>
      </div>

      <RackVisualization cluster={cluster} />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat
          label="Peak capacity"
          value={formatFlopsPerSecond(clusterPeakFlopsPerSecond(cluster))}
          sublabel="dense BF16/FP16"
        />
        <Stat
          label="Accelerator power"
          value={`${powerMW.toFixed(1)} MW`}
          sublabel="TDP x chips x PUE 1.1"
        />
        <Stat
          label="Energy / day"
          value={`${formatCount(clusterEnergyPerDayMWh(cluster))} MWh`}
          sublabel="at continuous full load"
        />
        <Stat
          label="Racks"
          value={formatCount(rackCount(cluster))}
          sublabel={`${formatCount(chipsPerRack(cluster))} accelerators each`}
        />
        <Stat
          label="Assumed MFU"
          value={formatPercent(mfu)}
          sublabel={`${chip.vendor} default`}
        />
      </div>

      {/* what it could train */}
      <div className="flex flex-col gap-2">
        <h4 className="text-sm font-medium text-neutral-200">
          If fully dedicated, this cluster could train...
        </h4>
        <div className="overflow-x-auto rounded-md border border-neutral-800">
          <table className="w-full min-w-[420px] text-left text-sm">
            <thead className="bg-neutral-900 text-neutral-400">
              <tr>
                <th className="px-3 py-2 font-medium">Known training run</th>
                <th className="px-3 py-2 font-medium">Time on this cluster</th>
                <th className="px-3 py-2 font-medium">Originally took</th>
              </tr>
            </thead>
            <tbody>
              {KNOWN_RUNS.map((run) => {
                const flops = run.reportedFlops ?? trainingFlops(run.parameters, run.tokens);
                return (
                  <tr key={run.id} className="text-neutral-300">
                    <td className="px-3 py-2">{run.name}</td>
                    <td className="px-3 py-2 text-neutral-100">
                      {formatDays(timeToTrainDays(cluster, flops, mfu))}
                    </td>
                    <td className="px-3 py-2 text-xs text-neutral-500">
                      {run.reportedTrainingDays
                        ? `${formatDays(run.reportedTrainingDays)} on ${formatCount(
                            run.chipCount
                          )} x ${getChip(run.chipId).name.replace("NVIDIA ", "").replace("Google ", "")}`
                        : "duration not published"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="text-[10px] text-neutral-500">
          Hypothetical: assumes the whole cluster runs one job at the vendor-default MFU, with
          no downtime, restarts, or contention — <ProvenanceBadge provenance="estimated" />.
          &quot;Originally took&quot; is the run&apos;s own reported hardware and duration where
          published, for contrast.
        </p>
      </div>

      <p className="text-[10px] text-neutral-500">
        <span className="text-neutral-400">Source:</span> {cluster.source}
        {cluster.notes ? ` ${cluster.notes}` : ""}
      </p>
    </div>
  );
}
