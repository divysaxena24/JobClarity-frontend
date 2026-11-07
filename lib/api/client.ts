import axios from "axios";
import type {
  PredictionRequest,
  PredictionResponse,
} from "@/types/prediction";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 60000, // allow for Render cold starts
  headers: {
    "Content-Type": "application/json",
  },
});

export class ApiError extends Error {
  statusCode?: number;
  retryAfter?: number;

  constructor(message: string, statusCode?: number, retryAfter?: number) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.retryAfter = retryAfter;
  }
}

interface ApiErrorBody {
  detail?: unknown;
  message?: unknown;
}

function cleanValidationMessage(msg: string): string {
  if (msg.includes("String should have at least 20 characters") || msg.includes("at least 20 characters")) {
    return "Job description is too short (minimum 20 characters required).";
  }
  if (msg.includes("String should have at most 50000 characters") || msg.includes("at most 50000 characters")) {
    return "Job description exceeds maximum allowed length (50,000 characters).";
  }
  if (msg.startsWith("Value error, ")) {
    return msg.replace(/^Value error,\s*/, "");
  }
  return msg;
}

export function extractFastApiValidationMessages(data: unknown): string | null {
  if (!data) return null;

  const detail = (data as ApiErrorBody).detail;
  if (Array.isArray(detail)) {
    const msgs = detail
      .map((item: unknown): string | null => {
        if (!item) return null;
        if (typeof item === "string") return cleanValidationMessage(item);
        if (typeof item === "object") {
          const record = item as { msg?: unknown; message?: unknown };
          if (typeof record.msg === "string") return cleanValidationMessage(record.msg);
          if (typeof record.message === "string") return cleanValidationMessage(record.message);
        }
        return null;
      })
      .filter((msg): msg is string => msg !== null);

    if (msgs.length > 0) return msgs.join("; ");
  }

  return null;
}

export function extractServerMessage(data: unknown): string | null {
  if (!data) return null;

  // Preferred: FastAPI validation details array
  const validationMsg = extractFastApiValidationMessages(data);
  if (validationMsg) return validationMsg;

  const body = data as ApiErrorBody;

  // Generic message field
  if (typeof body.message === "string" && body.message.trim() !== "") return body.message;

  // detail field as string
  if (typeof body.detail === "string" && body.detail.trim() !== "") {
    return cleanValidationMessage(body.detail);
  }

  // Response might be a plain string (guard against HTML error pages)
  if (typeof data === "string" && data.trim() !== "" && !data.trim().startsWith("<")) {
    return data;
  }

  return null;
}

export function parseApiError(err: unknown): ApiError {
  if (err instanceof ApiError) return err;

  const anyErr = err as {
    code?: string;
    message?: string;
    response?: {
      status?: number;
      statusText?: string;
      data?: unknown;
      headers?: Record<string, string | undefined>;
    };
    request?: unknown;
  };

  // Render / Cloud cold start or network timeout
  if (anyErr?.code === "ECONNABORTED" || anyErr?.message?.includes("timeout")) {
    return new ApiError(
      "The server is waking up. Please wait 30–60 seconds and try again.",
      504
    );
  }

  if (axios.isAxiosError(err)) {
    const status = anyErr.response?.status;
    const responseData = anyErr.response?.data;
    const headers = anyErr.response?.headers;
    const serverMsg = extractServerMessage(responseData);

    const retryAfterHeader = headers?.["retry-after"];
    const retryAfter = retryAfterHeader ? parseInt(retryAfterHeader, 10) : undefined;

    if (status === 429) {
      return new ApiError(
        serverMsg || "Rate limit reached (10 requests per minute). Please wait a moment before trying again.",
        429,
        retryAfter
      );
    }

    if (status === 503) {
      return new ApiError(
        serverMsg || "Model inference service is currently initializing. Please try again shortly.",
        503
      );
    }

    if (status === 422) {
      return new ApiError(
        serverMsg || "Job description must be between 20 and 50,000 characters.",
        422
      );
    }

    if (status && status >= 500) {
      return new ApiError(
        "Server error encountered during analysis. The backend service may be waking up, please retry shortly.",
        status
      );
    }

    if (serverMsg) {
      return new ApiError(serverMsg, status);
    }

    if (anyErr.response?.statusText) {
      return new ApiError(anyErr.response.statusText, status);
    }

    if (anyErr.request && !anyErr.response) {
      return new ApiError(
        "Unable to connect to JobClarity API. Please check your network connection or verify that the backend is running.",
        0
      );
    }

    return new ApiError(anyErr.message ?? "Something went wrong. Please try again.", status);
  }

  if (err instanceof Error) {
    return new ApiError(err.message);
  }

  return new ApiError("An unexpected error occurred while analyzing the job posting.");
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
    throw parseApiError(err);
  }
}

export default apiClient;
