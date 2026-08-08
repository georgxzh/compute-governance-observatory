"use client";

import { HARDWARE } from "@/lib/hardware";

export interface FormState {
  parametersBillions: number;
  tokensBillions: number;
  chipId: string;
  chipCount: number;
  mfu: number;
  pue: number;
  electricityUsdPerKwh: number;
  cloudUsdPerHourOverride: number | undefined;
}

interface Props {
  value: FormState;
  onChange: (next: FormState) => void;
}

function NumberField({
  label,
  value,
  onChange,
  step,
  min,
  hint,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
  step?: number;
  min?: number;
  hint?: string;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="font-medium text-neutral-200">{label}</span>
      <input
        type="number"
        className="rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-neutral-100 focus:border-neutral-400 focus:outline-none"
        value={Number.isFinite(value) ? value : ""}
        step={step}
        min={min}
        onChange={(e) => onChange(e.target.valueAsNumber)}
      />
      {hint && <span className="text-xs text-neutral-500">{hint}</span>}
    </label>
  );
}

export default function EstimatorForm({ value, onChange }: Props) {
  const selectedChip = HARDWARE.find((c) => c.id === value.chipId) ?? HARDWARE[0];

  function set<K extends keyof FormState>(key: K, v: FormState[K]) {
    onChange({ ...value, [key]: v });
  }

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-neutral-800 bg-neutral-950 p-5">
      <h2 className="text-lg font-semibold text-neutral-100">Training run inputs</h2>

      <div className="grid grid-cols-2 gap-4">
        <NumberField
          label="Parameters (billions)"
          value={value.parametersBillions}
          onChange={(n) => set("parametersBillions", n)}
          step={1}
          min={0}
          hint="Use active params for MoE models"
        />
        <NumberField
          label="Training tokens (billions)"
          value={value.tokensBillions}
          onChange={(n) => set("tokensBillions", n)}
          step={10}
          min={0}
        />
      </div>

      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium text-neutral-200">Chip</span>
        <select
          className="rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-neutral-100 focus:border-neutral-400 focus:outline-none"
          value={value.chipId}
          onChange={(e) => set("chipId", e.target.value)}
        >
          {HARDWARE.map((chip) => (
            <option key={chip.id} value={chip.id}>
              {chip.name}
            </option>
          ))}
        </select>
      </label>

      <div className="grid grid-cols-2 gap-4">
        <NumberField
          label="Chip count"
          value={value.chipCount}
          onChange={(n) => set("chipCount", n)}
          step={1}
          min={1}
        />
        <NumberField
          label="MFU (0-1)"
          value={value.mfu}
          onChange={(n) => set("mfu", n)}
          step={0.01}
          min={0}
          hint="Achieved / peak throughput, typically 0.3-0.55"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <NumberField
          label="Datacenter PUE"
          value={value.pue}
          onChange={(n) => set("pue", n)}
          step={0.01}
          min={1}
          hint="Power overhead multiplier, ~1.1 typical"
        />
        <NumberField
          label="Electricity ($/kWh)"
          value={value.electricityUsdPerKwh}
          onChange={(n) => set("electricityUsdPerKwh", n)}
          step={0.01}
          min={0}
        />
      </div>

      <NumberField
        label={`Cloud $/chip-hour (default: $${selectedChip.cloudUsdPerHour.toFixed(2)})`}
        value={value.cloudUsdPerHourOverride ?? selectedChip.cloudUsdPerHour}
        onChange={(n) => set("cloudUsdPerHourOverride", n)}
        step={0.1}
        min={0}
        hint="Override the chip's default on-demand rate"
      />
    </div>
  );
}
