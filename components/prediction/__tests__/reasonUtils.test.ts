import test from "node:test";
import assert from "node:assert/strict";
import {
  processReasons,
  sortReasons,
  filterReasonsByCount,
} from "../reasonUtils.ts";
import type { TopReason } from "@/types/prediction";

const sampleReasons: TopReason[] = [
  { feature: "fee required", impact: 1.85, effect: "Increases Risk" },
  { feature: "telegram invite", impact: 1.42, effect: "Increases Risk" },
  { feature: "competitive salary", impact: -0.62, effect: "Decreases Risk" },
  { feature: "health insurance", impact: -0.95, effect: "Decreases Risk" },
  { feature: "urgently hiring", impact: 0.35, effect: "Increases Risk" },
  { feature: "remote work", impact: 0.1, effect: "Increases Risk" },
];

test("processReasons assigns absolute ranks sorted descending by magnitude", () => {
  const processed = processReasons(sampleReasons);
  assert.equal(processed.length, 6);

  // Rank 1 should be highest abs impact: fee required (1.85)
  assert.equal(processed[0].feature, "fee required");
  assert.equal(processed[0].rank, 1);
  assert.equal(processed[0].absImpact, 1.85);

  // Rank 2 should be telegram invite (1.42)
  assert.equal(processed[1].feature, "telegram invite");
  assert.equal(processed[1].rank, 2);

  // Rank 3 should be health insurance (abs 0.95)
  assert.equal(processed[2].feature, "health insurance");
  assert.equal(processed[2].rank, 3);
  assert.equal(processed[2].absImpact, 0.95);
});

test("processReasons handles empty or malformed reason arrays safely", () => {
  assert.deepEqual(processReasons([]), []);
  // @ts-expect-error test invalid inputs
  assert.deepEqual(processReasons(null), []);
  // @ts-expect-error test non-array
  assert.deepEqual(processReasons(undefined), []);
});

test("sortReasons respects positive, negative, and absolute sorting", () => {
  const processed = processReasons(sampleReasons);

  const sortedPositive = sortReasons(processed, "positive");
  assert.equal(sortedPositive[0].feature, "fee required");
  assert.ok(sortedPositive[0].impact > sortedPositive[1].impact);

  const sortedNegative = sortReasons(processed, "negative");
  assert.equal(sortedNegative[0].feature, "health insurance");
  assert.equal(sortedNegative[0].impact, -0.95);
  assert.ok(sortedNegative[0].impact < sortedNegative[1].impact);

  const sortedAbs = sortReasons(processed, "abs");
  assert.equal(sortedAbs[0].absImpact, 1.85);
});

test("filterReasonsByCount slices top 5 correctly", () => {
  const processed = processReasons(sampleReasons);
  assert.equal(filterReasonsByCount(processed, "all").length, 6);
  assert.equal(filterReasonsByCount(processed, "top5").length, 5);
});

