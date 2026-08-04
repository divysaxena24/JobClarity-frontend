export interface TopReason {
  feature: string;
  impact: number;
  effect: string;
}

export interface PredictionResponse {
  prediction: string; // e.g. "Real" or "Fake"
  fraud_probability: number;
  fraud_risk_score: number;
  risk_level: string;
  top_reasons: TopReason[];
  model_version: string;
}

export interface PredictionRequest {
  job_description: string;
}
