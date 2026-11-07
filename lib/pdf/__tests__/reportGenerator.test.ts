import test from "node:test";
import assert from "node:assert/strict";
import { formatImpact, getVerdictMetadata } from "../reportGenerator.ts";
import type { PredictionResponse } from "@/types/prediction";

test("formatImpact formats positive and negative values with 4 decimal places", () => {
  assert.equal(formatImpact(1.23456), "+1.2346");
  assert.equal(formatImpact(-0.98765), "-0.9877");
  assert.equal(formatImpact(0.0), "-0.0000");
  assert.equal(formatImpact(2), "+2.0000");
});

test("getVerdictMetadata generates appropriate visual metadata", () => {
  const highRiskPrediction: PredictionResponse = {
    prediction: "Fake",
    fraud_probability: 0.95,
    fraud_risk_score: 95,
    risk_level: "Critical",
    top_reasons: [],
    model_version: "v1",
  };

  const highMeta = getVerdictMetadata(highRiskPrediction);
  assert.equal(highMeta.badgeText, "High Risk Alert");
  assert.deepEqual(highMeta.themeColor, [220, 38, 38]);

  const legitPrediction: PredictionResponse = {
    prediction: "Real",
    fraud_probability: 0.05,
    fraud_risk_score: 5,
    risk_level: "Low",
    top_reasons: [],
    model_version: "v1",
  };

  const legitMeta = getVerdictMetadata(legitPrediction);
  assert.equal(legitMeta.badgeText, "Low Risk Pattern");
  assert.deepEqual(legitMeta.themeColor, [16, 185, 129]);
});
