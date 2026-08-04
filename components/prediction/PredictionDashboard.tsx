"use client";

import type { PredictionResponse } from "@/types/prediction";
import { PredictionSummary } from "@/components/prediction/PredictionSummary";
import { ReasonList } from "@/components/prediction/ReasonList";
import { RiskGuide } from "@/components/prediction/RiskGuide";

interface PredictionDashboardProps {
  prediction: PredictionResponse;
}

/**
 * Responsive results layout:
 * Prediction Result spans the full available width,
 * with the SHAP explanation grid stacked below it.
 * Both sections share the same outer width.
 */
export function PredictionDashboard({ prediction }: PredictionDashboardProps) {
  return (
    <div className="mt-8 w-full">
      <PredictionSummary prediction={prediction} />
      <div className="mt-6 w-full">
        <RiskGuide />
      </div>
      <div className="mt-6 w-full">
        <ReasonList reasons={prediction.top_reasons} />
      </div>
    </div>
  );
}
