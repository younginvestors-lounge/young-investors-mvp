import { describe, expect, it } from "vitest";
import {
  calculateConsensus,
  calculateWeightedConsensus,
  canApproveContribution,
  computeChefSay,
  dynamicQuorum,
  sayMultiplier,
} from "./domain";
import type { VoteTally } from "@/lib/types";

describe("dynamicQuorum", () => {
  it("scales as ceil(60% x members)", () => {
    expect(dynamicQuorum(2)).toBe(2);
    expect(dynamicQuorum(3)).toBe(2);
    expect(dynamicQuorum(4)).toBe(3);
    expect(dynamicQuorum(5)).toBe(3);
    expect(dynamicQuorum(6)).toBe(4);
    expect(dynamicQuorum(8)).toBe(5);
    expect(dynamicQuorum(10)).toBe(6);
  });

  it("never requires zero votes, even for an empty table", () => {
    expect(dynamicQuorum(0)).toBe(1);
  });
});

function tally(overrides: Partial<VoteTally>): VoteTally {
  return { yes: 0, no: 0, abstain: 0, quorumRequired: 0, totalMembers: 0, ...overrides };
}

describe("calculateConsensus", () => {
  it("passes once YES votes reach the 60% threshold, regardless of absentees", () => {
    const result = calculateConsensus(tally({ yes: 3, no: 0, abstain: 0, totalMembers: 5 }));
    expect(result.approved).toBe(true);
    expect(result.quorumMet).toBe(true);
    expect(result.yesPercent).toBe(60);
  });

  it("does not pass below the threshold even with no dissent", () => {
    const result = calculateConsensus(tally({ yes: 2, no: 0, abstain: 0, totalMembers: 5 }));
    expect(result.approved).toBe(false);
  });

  it("a two-chef Kitchen requires both to commit", () => {
    const oneYes = calculateConsensus(tally({ yes: 1, no: 0, abstain: 0, totalMembers: 2 }));
    const bothYes = calculateConsensus(tally({ yes: 2, no: 0, abstain: 0, totalMembers: 2 }));
    expect(oneYes.approved).toBe(false);
    expect(bothYes.approved).toBe(true);
  });
});

describe("sayMultiplier / computeChefSay", () => {
  it("orders the rank ladder from Commis to Master Chef", () => {
    expect(sayMultiplier("Commis")).toBe(1.0);
    expect(sayMultiplier("Demi Chef")).toBe(1.15);
    expect(sayMultiplier("Chef de Partie")).toBe(1.3);
    expect(sayMultiplier("Sous Chef")).toBe(1.5);
    expect(sayMultiplier("Master Chef")).toBe(1.75);
  });

  it("falls back to 1 for an unrecognised rank", () => {
    expect(sayMultiplier("not-a-real-rank")).toBe(1);
  });

  it("lets kitchen_score add at most +0.25, never overtaking rank", () => {
    const idleMasterChef = computeChefSay("Master Chef", 0);
    const activeCommis = computeChefSay("Commis", 100);
    expect(idleMasterChef).toBeCloseTo(1.75, 5);
    expect(activeCommis).toBeCloseTo(1.25, 5);
    expect(activeCommis).toBeLessThan(idleMasterChef);
  });

  it("clamps kitchen_score to 0-100 defensively", () => {
    expect(computeChefSay("Commis", -50)).toBeCloseTo(1.0, 5);
    expect(computeChefSay("Commis", 500)).toBeCloseTo(1.25, 5);
  });
});

describe("calculateWeightedConsensus", () => {
  it("collapses to plain headcount math when every chef's Say is 1 (Mutual Kitchens)", () => {
    // Mutual Kitchens never call this function in production, but if every Say
    // were 1 (the Mutual default), the two governance paths must agree exactly.
    const scenarios: Array<{ yes: number; totalMembers: number }> = [
      { yes: 3, totalMembers: 5 },
      { yes: 2, totalMembers: 5 },
      { yes: 2, totalMembers: 2 },
      { yes: 1, totalMembers: 2 },
    ];
    for (const { yes, totalMembers } of scenarios) {
      const headcount = calculateConsensus(tally({ yes, totalMembers }));
      const weighted = calculateWeightedConsensus({ yesSay: yes, totalSay: totalMembers });
      expect(weighted.approved).toBe(headcount.approved);
      expect(weighted.yesPercent).toBe(headcount.yesPercent);
    }
  });

  it("a Master Chef + a Commis can pass a Hedge Kitchen recipe that headcount would reject", () => {
    const masterChefSay = computeChefSay("Master Chef", 0);
    const commisSay = computeChefSay("Commis", 0);
    const totalSay = masterChefSay + commisSay;

    // Headcount: 2 members, only 1 voted FOR — fails the 60% Rule (needs both).
    const headcount = calculateConsensus(tally({ yes: 1, totalMembers: 2 }));
    expect(headcount.approved).toBe(false);

    // Say-weighted: the Master Chef alone already clears 60% of the table's total Say.
    const weighted = calculateWeightedConsensus({ yesSay: masterChefSay, totalSay });
    expect(weighted.approved).toBe(true);
  });
});

describe("canApproveContribution", () => {
  it("allows a different member to co-sign a requested contribution", () => {
    expect(canApproveContribution("chef-a", "chef-b", "requested")).toBe(true);
  });

  it("blocks the requester from approving their own contribution", () => {
    expect(canApproveContribution("chef-a", "chef-a", "requested")).toBe(false);
  });

  it("blocks approval once the contribution has already moved", () => {
    expect(canApproveContribution("chef-a", "chef-b", "approved")).toBe(false);
    expect(canApproveContribution("chef-a", "chef-b", "rejected")).toBe(false);
  });
});
