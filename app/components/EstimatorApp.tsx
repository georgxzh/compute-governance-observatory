"use client";

import { useMemo, useState } from "react";
import EstimatorForm, { FormState } from "./EstimatorForm";
import ResultsPanel from "./ResultsPanel";
import HardwareTable from "./HardwareTable";
import ValidationTable from "./ValidationTable";
import ThresholdPanel from "./ThresholdPanel";
import AlgorithmicEfficiencyPanel from "./AlgorithmicEfficiencyPanel";
import CompanyCountryChart from "./CompanyCountryChart";
import PolicyScenarioTable from "./PolicyScenarioTable";
import { DEFAULT_ELECTRICITY_USD_PER_KWH, DEFAULT_MFU_BY_VENDOR, DEFAULT_PUE, estimate } from "@/lib/estimator";
import { getChip } from "@/lib/hardware";

const INITIAL_CHIP_ID = "h100-sxm";

const INITIAL_STATE: FormState = {
  parametersBillions: 70,
  tokensBillions: 2000,
  chipId: INITIAL_CHIP_ID,
  chipCount: 2048,
  mfu: DEFAULT_MFU_BY_VENDOR[getChip(INITIAL_CHIP_ID).vendor],
  pue: DEFAULT_PUE,
  electricityUsdPerKwh: DEFAULT_ELECTRICITY_USD_PER_KWH,
  cloudUsdPerHourOverride: undefined,
};

export default function EstimatorApp() {
  const [form, setForm] = useState<FormState>(INITIAL_STATE);

  const output = useMemo(
    () =>
      estimate({
        parameters: form.parametersBillions * 1e9,
        tokens: form.tokensBillions * 1e9,
        chipId: form.chipId,
        chipCount: form.chipCount,
        mfu: form.mfu,
        pue: form.pue,
        electricityUsdPerKwh: form.electricityUsdPerKwh,
        cloudUsdPerHourOverride: form.cloudUsdPerHourOverride,
      }),
    [form]
  );

  function handleFormChange(next: FormState) {
    // Re-seed MFU with the new chip's default only when the chip changes.
    if (next.chipId !== form.chipId) {
      const vendor = getChip(next.chipId).vendor;
      next.mfu = DEFAULT_MFU_BY_VENDOR[vendor] ?? next.mfu;
      next.cloudUsdPerHourOverride = undefined;
    }
    setForm(next);
  }

  return (
    <div className="flex flex-col gap-10">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,380px)_1fr]">
        <EstimatorForm value={form} onChange={handleFormChange} />
        <div className="flex flex-col gap-8">
          <ResultsPanel output={output} />
          <ThresholdPanel trainingFlops={output.trainingFlops} />
          <AlgorithmicEfficiencyPanel trainingFlops={output.trainingFlops} />
        </div>
      </div>
      <HardwareTable selectedChipId={form.chipId} />
      <ValidationTable />
      <CompanyCountryChart />
      <PolicyScenarioTable />
    </div>
  );
}
