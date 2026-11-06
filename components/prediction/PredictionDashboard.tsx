"use client";

import { useState } from "react";
import type { PredictionResponse } from "@/types/prediction";
import { PredictionSummary } from "@/components/prediction/PredictionSummary";
import { ReasonList } from "@/components/prediction/ReasonList";
import { RiskGuide } from "@/components/prediction/RiskGuide";
import { JobDescriptionExplorer } from "@/components/prediction/JobDescriptionExplorer";

interface PredictionDashboardProps {
  prediction: PredictionResponse;
  jobDescription?: string;
}

/**
 * Responsive results layout:
 * 1. Prediction Summary (with animated risk gauge)
 * 2. Risk Tier Guide
 * 3. SHAP Explainability Dashboard (Chart / Cards)
 * 4. Job Description Intelligence Explorer (Text highlights & contextual mapping)
 */
export function PredictionDashboard({
  prediction,
  jobDescription = "",
}: PredictionDashboardProps) {
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null);

  return (
    <div className="mt-8 w-full space-y-6">
      <PredictionSummary prediction={prediction} />
      <div className="w-full">
        <RiskGuide />
      </div>
      <div className="w-full">
        <ReasonList
          reasons={prediction.top_reasons}
          selectedFeature={selectedFeature}
          onSelectFeature={setSelectedFeature}
        />
      </div>
      <div className="w-full">
        <JobDescriptionExplorer
          jobDescription={jobDescription}
          reasons={prediction.top_reasons}
          selectedFeature={selectedFeature}
          onSelectFeature={setSelectedFeature}
        />
      </div>
    </div>
  );
}
