import test from "node:test";
import assert from "node:assert/strict";
import { SAMPLE_JOBS } from "../sampleJobsData.ts";

test("SAMPLE_JOBS contains diverse set of test instances", () => {
  assert.ok(Array.isArray(SAMPLE_JOBS));
  assert.ok(SAMPLE_JOBS.length >= 4);

  for (const job of SAMPLE_JOBS) {
    assert.ok(job.label && typeof job.label === "string");
    assert.ok(job.description && typeof job.description === "string");
    assert.ok(
      job.description.length >= 20,
      `Job "${job.label}" description is shorter than API minimum length of 20`
    );
  }
});
