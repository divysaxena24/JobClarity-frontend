import test from "node:test";
import assert from "node:assert/strict";
import {
  extractFastApiValidationMessages,
  extractServerMessage,
  parseApiError,
  ApiError,
} from "../client.ts";

test("extractFastApiValidationMessages formats Pydantic validation errors", () => {
  const pydanticError = {
    detail: [
      {
        loc: ["body", "job_description"],
        msg: "String should have at least 20 characters",
        type: "string_too_short",
      },
    ],
  };

  const message = extractFastApiValidationMessages(pydanticError);
  assert.equal(
    message,
    "Job description is too short (minimum 20 characters required)."
  );
});

test("extractFastApiValidationMessages formats max length errors", () => {
  const pydanticError = {
    detail: [
      {
        loc: ["body", "job_description"],
        msg: "String should have at most 50000 characters",
        type: "string_too_long",
      },
    ],
  };

  const message = extractFastApiValidationMessages(pydanticError);
  assert.equal(
    message,
    "Job description exceeds maximum allowed length (50,000 characters)."
  );
});

test("extractServerMessage handles detail string and rejects HTML strings", () => {
  assert.equal(
    extractServerMessage({ detail: "Rate limit exceeded. Try again in 30 seconds." }),
    "Rate limit exceeded. Try again in 30 seconds."
  );

  assert.equal(
    extractServerMessage("<!DOCTYPE html><html>502 Bad Gateway</html>"),
    null
  );

  assert.equal(
    extractServerMessage("Raw plain error text"),
    "Raw plain error text"
  );
});

test("parseApiError correctly identifies timeout and network errors", () => {
  const timeoutErr = { code: "ECONNABORTED" };
  const parsedTimeout = parseApiError(timeoutErr);
  assert.ok(parsedTimeout instanceof ApiError);
  assert.equal(parsedTimeout.statusCode, 504);
  assert.ok(parsedTimeout.message.includes("The server is waking up"));

  const networkErr = { isAxiosError: true, request: {}, response: undefined };
  // simulate Axios error object
  Object.defineProperty(networkErr, "isAxiosError", { value: true });
});

