import { Provenance } from "@/lib/types";

const STYLES: Record<Provenance, string> = {
  reported: "bg-emerald-950 text-emerald-400 border-emerald-800",
  calculated: "bg-sky-950 text-sky-400 border-sky-800",
  estimated: "bg-amber-950 text-amber-400 border-amber-800",
};

const LABELS: Record<Provenance, string> = {
  reported: "Reported",
  calculated: "Calculated",
  estimated: "Estimated",
};

export default function ProvenanceBadge({ provenance }: { provenance: Provenance }) {
  return (
    <span
      className={`inline-block rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${STYLES[provenance]}`}
    >
      {LABELS[provenance]}
    </span>
  );
}
