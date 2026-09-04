"use client";

import { TrainingCluster } from "@/lib/types";
import { getChip } from "@/lib/hardware";
import { TRAINING_CLUSTERS } from "@/lib/trainingClusters";
import {
  basketballCourts,
  chipsPerRack,
  floorAreaM2,
  getTopology,
  rackAcceleratorKW,
  rackCount,
  racksPerGlyph,
  serverCount,
  SQM_PER_RACK,
} from "@/lib/rackTopology";
import { formatCount } from "@/lib/format";
import ProvenanceBadge from "./ProvenanceBadge";

const RACKS_PER_GLYPH = racksPerGlyph(TRAINING_CLUSTERS);

/** One rack, drawn: servers stacked vertically, accelerators inside each. */
function SingleRack({ cluster }: { cluster: TrainingCluster }) {
  const topology = getTopology(cluster);
  return (
    <div className="flex w-fit flex-col gap-1 rounded-md border-2 border-neutral-700 bg-neutral-900 p-2">
      {Array.from({ length: topology.serversPerRack }).map((_, serverIndex) => (
        <div
          key={serverIndex}
          className="flex items-center gap-[3px] rounded-sm border border-neutral-700 bg-neutral-950 px-1.5 py-1"
        >
          {Array.from({ length: topology.chipsPerServer }).map((_, chipIndex) => (
            <span key={chipIndex} className="h-2.5 w-1.5 rounded-[1px] bg-accent" />
          ))}
        </div>
      ))}
    </div>
  );
}

export default function RackVisualization({ cluster }: { cluster: TrainingCluster }) {
  const chip = getChip(cluster.chipId);
  const topology = getTopology(cluster);
  const racks = rackCount(cluster);
  const glyphs = Math.max(1, Math.ceil(racks / RACKS_PER_GLYPH));
  const courts = basketballCourts(cluster);

  return (
    <div className="flex flex-col gap-5">
      {/* one rack, exploded */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-6">
        <div className="flex flex-col gap-2">
          <span className="text-[10px] uppercase tracking-wide text-neutral-500">
            One rack
          </span>
          <SingleRack cluster={cluster} />
        </div>

        <div className="flex flex-col gap-1 text-xs text-neutral-400">
          <p>
            <span className="text-neutral-100">{topology.chipsPerServer}</span> ×{" "}
            {chip.name.replace("NVIDIA ", "").replace("Google ", "").replace("AMD ", "")} per
            server
          </p>
          <p>
            <span className="text-neutral-100">{topology.serversPerRack}</span> servers per rack
          </p>
          <p>
            = <span className="text-neutral-100">{chipsPerRack(cluster)}</span> accelerators per
            rack, drawing{" "}
            <span className="text-neutral-100">
              {rackAcceleratorKW(cluster).toFixed(1)} kW
            </span>{" "}
            <span className="text-neutral-600">(accelerators only)</span>
          </p>
          <p className="mt-1 flex items-center gap-2">
            Rack layout <ProvenanceBadge provenance={topology.provenance} />
          </p>
          <p className="text-[10px] leading-relaxed text-neutral-600">{topology.source}</p>
        </div>
      </div>

      {/* the whole data hall */}
      <div className="flex flex-col gap-2">
        <span className="text-[10px] uppercase tracking-wide text-neutral-500">
          The whole cluster —{" "}
          {RACKS_PER_GLYPH === 1
            ? "one mark per rack"
            : `one mark per ${RACKS_PER_GLYPH} racks`}
        </span>
        <div className="flex flex-wrap content-start gap-[2px] rounded-md border border-neutral-800 bg-neutral-900/40 p-3">
          {Array.from({ length: glyphs }).map((_, i) => (
            <span key={i} className="h-3 w-1 rounded-[1px] bg-accent/80" />
          ))}
        </div>
        <p className="text-xs text-neutral-400">
          <span className="text-neutral-100">{formatCount(racks)}</span> racks holding{" "}
          <span className="text-neutral-100">{formatCount(serverCount(cluster))}</span> servers
          and <span className="text-neutral-100">{formatCount(cluster.chipCount)}</span>{" "}
          accelerators.
        </p>
        <p className="text-[10px] leading-relaxed text-neutral-600">
          At roughly {SQM_PER_RACK} m² per rack including aisle space, that&apos;s about{" "}
          {formatCount(floorAreaM2(cluster))} m² of floor —{" "}
          {courts >= 1
            ? `roughly ${courts.toFixed(courts < 10 ? 1 : 0)} basketball courts`
            : `about ${Math.round(courts * 100)}% of a basketball court`}
          . Floor area is <span className="italic">estimated</span>: real halls also carry
          cooling, power, and networking equipment this doesn&apos;t count.
        </p>
      </div>
    </div>
  );
}
