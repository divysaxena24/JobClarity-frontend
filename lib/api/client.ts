import axios from "axios";
import type { PredictionRequest, PredictionResponse } from "@/types/prediction";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://jobclarity-0tz8.onrender.com";

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 60000, // allow for Render cold starts
  headers: {
    "Content-Type": "application/json",
  },
});

interface ApiErrorBody {
  detail?: unknown;
  message?: unknown;
}

function extractFastApiValidationMessages(data: unknown): string | null {
  // FastAPI Pydantic validation errors often appear as { detail: [ { msg: "..." }, ... ] }
  if (!data) return null;

  const detail = (data as ApiErrorBody).detail;
  if (Array.isArray(detail)) {
    const msgs = detail
      .map((item: unknown): string | null => {
        if (!item) return null;
        if (typeof item === "string") return item;
        if (typeof item === "object") {
          // item can be { msg: string } or { msg: string, loc: ..., type: ... }
          const record = item as { msg?: unknown; message?: unknown };
          if (typeof record.msg === "string") return record.msg;
          if (typeof record.message === "string") return record.message;
        }
        return null;
      })
      .filter((msg): msg is string => msg !== null);

    if (msgs.length > 0) return msgs.join("; ");
  }

  return null;
}

function extractServerMessage(data: unknown): string | null {
  if (!data) return null;

  // Preferred: FastAPI style
  const validationMsg = extractFastApiValidationMessages(data);
  if (validationMsg) return validationMsg;

  const body = data as ApiErrorBody;

  // Generic message field
  if (typeof body.message === "string" && body.message.trim() !== "") return body.message;

  // Some backends return { detail: "..." }
  if (typeof body.detail === "string" && body.detail.trim() !== "") return body.detail;

  // Response might be a plain string
  if (typeof data === "string" && data.trim() !== "") return data;

  return null;
}

/**
 * Predict job posting fraud.
 * Produces friendlier, typed errors for UI consumption.
 */
export async function predictJob(job_description: string): Promise<PredictionResponse> {
  const body: PredictionRequest = { job_description };

  try {
    const res = await apiClient.post<PredictionResponse>("/predict", body);
    return res.data;
  } catch (err: unknown) {
    // Axios timeout code
    const anyErr = err as {
      code?: string;
      message?: string;
      response?: { statusText?: string; data?: unknown };
      request?: unknown;
    };
    if (anyErr?.code === "ECONNABORTED") {
      // Render free instances can cold-start; give a clear instruction
      throw new Error("The server is waking up. Please wait 30–60 seconds and try again.");
    }

    // If Axios error with response, try to extract structured messages
    if (axios.isAxiosError(err)) {
      const responseData = anyErr.response?.data;
      const serverMsg = extractServerMessage(responseData);
      if (serverMsg) {
        throw new Error(serverMsg);
      }

      // Fallback to status text if available
      if (anyErr.response?.statusText) {
        throw new Error(anyErr.response.statusText);
      }

      // Network error with no response
      if (anyErr.request && !anyErr.response) {
        throw new Error("Network error. Please check your connection and try again.");
      }

      // Otherwise, rethrow the axios error message
      throw new Error(anyErr.message ?? "Something went wrong. Please try again.");
    }

    // Non-Axios unknown error
    const unknownMsg = (anyErr && (anyErr.message ?? String(anyErr))) || "Something went wrong. Please try again.";
    throw new Error(unknownMsg);
  }
}

export default apiClient;
