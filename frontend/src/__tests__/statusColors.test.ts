import { describe, it, expect } from "vitest";
import { statusColors } from "../types/reservation";

describe("statusColors map", () => {
  it("contains Requested key", () => {
    expect(statusColors.Requested).toBeDefined();
  });
  it("has distinct colors for different statuses", () => {
    const vals = Object.values(statusColors);
    const unique = new Set(vals);
    expect(unique.size).toBe(vals.length);
  });
});
