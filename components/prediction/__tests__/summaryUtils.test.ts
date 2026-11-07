import test from "node:test";
import assert from "node:assert/strict";
import {
  getVerdictTitle,
  getVerdictDescription,
  getModerationAction,
} from "../summaryUtils.ts";

test("getVerdictTitle returns calibrated titles based on risk and verdict", () => {
  assert.equal(
    getVerdictTitle(80, true),
    "High Risk — Verify Before Applying"
  );
  assert.equal(
    getVerdictTitle(55, false),
    "High Risk — Verify Before Applying"
  );
  assert.equal(
    getVerdictTitle(35, false),
    "Elevated Risk — Caution Advised"
  );
  assert.equal(
    getVerdictTitle(15, false),
    "Likely Legitimate"
  );
});

test("getVerdictDescription returns appropriate trust-centered explanations", () => {
  assert.ok(
    getVerdictDescription(85, true).includes("Significant deceptive signals")
  );
  assert.ok(
    getVerdictDescription(30, false).includes("Moderate anomalous language patterns")
  );
  assert.ok(
    getVerdictDescription(5, false).includes("Standard professional terminology")
  );
});

test("getModerationAction recommends actions without claiming infallible truth", () => {
  const critical = getModerationAction(85, true);
  assert.equal(critical.label, "IMMEDIATE BLOCK");

  const mediumRisk = getModerationAction(60, true);
  assert.equal(mediumRisk.label, "FLAG FOR REVIEW");

  const legitimate = getModerationAction(10, false);
  assert.equal(legitimate.label, "SAFE TO PASS");
});

