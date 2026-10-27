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

export interface JDGenerationRequest {
  job_role: string;
  skills: string;
  experience_level: string;
  location: string;
  company_name?: string;
  salary_range?: string;
}

export interface JDGenerationResponse {
  generated_job_description: string;
  is_ai_generated: boolean;
  provider: string;
  disclaimer: string;
  input_parameters: {
    job_role: string;
    skills: string;
    experience_level: string;
    location: string;
    company_name?: string;
    salary_range?: string;
  };
}
