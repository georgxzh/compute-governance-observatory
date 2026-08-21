import { describe, expect, it } from "vitest";
import { NOTABLE_MODELS } from "../lib/notableModels";

describe("NOTABLE_MODELS", () => {
  it("spans at least three countries", () => {
    const countries = new Set(NOTABLE_MODELS.map((m) => m.country));
    expect(countries.size).toBeGreaterThanOrEqual(3);
  });

  it("spans at least five organizations", () => {
    const orgs = new Set(NOTABLE_MODELS.map((m) => m.organization));
    expect(orgs.size).toBeGreaterThanOrEqual(5);
  });

  it("every model has a positive compute figure and a source", () => {
    for (const model of NOTABLE_MODELS) {
      expect(model.computeFlops).toBeGreaterThan(0);
      expect(model.source.length).toBeGreaterThan(0);
    }
  });
});
