import { describe, expect, it } from "vitest";
import {
  algorithmicEfficiencyMultiplier,
  computeEquivalentAtBaseline,
} from "../lib/algorithmicEfficiency";

describe("algorithmicEfficiencyMultiplier", () => {
  it("is 1x when model year equals baseline year", () => {
    expect(algorithmicEfficiencyMultiplier(2024, 2024, 8.5)).toBeCloseTo(1, 6);
  });

  it("doubles after exactly one doubling period has elapsed", () => {
    const multiplier = algorithmicEfficiencyMultiplier(2024, 2023, 12);
    expect(multiplier).toBeCloseTo(2, 6);
  });

  it("is less than 1 when the baseline year is after the model year", () => {
    const multiplier = algorithmicEfficiencyMultiplier(2012, 2024, 8.5);
    expect(multiplier).toBeLessThan(1);
  });
});

describe("computeEquivalentAtBaseline", () => {
  it("scales raw compute up when comparing a recent model to an earlier baseline", () => {
    const rawFlops = 1e24;
    const equivalent = computeEquivalentAtBaseline(rawFlops, 2024, 2012, 8.5);
    expect(equivalent).toBeGreaterThan(rawFlops);
  });

  it("returns the raw compute unchanged when model year equals baseline year", () => {
    const rawFlops = 1e24;
    const equivalent = computeEquivalentAtBaseline(rawFlops, 2020, 2020, 8.5);
    expect(equivalent / rawFlops).toBeCloseTo(1, 6);
  });
});
