"use client";

import { motion } from "framer-motion";
import { Cpu, ShieldAlert, ShieldCheck } from "lucide-react";
import type { PredictionResponse } from "@/types/prediction";
import { RiskBadge } from "@/components/prediction/RiskBadge";
import { ProbabilityBar } from "@/components/prediction/ProbabilityBar";
import { RiskMeter } from "@/components/prediction/RiskMeter";
import { ConfidenceRing } from "@/components/prediction/ConfidenceRing";
import { cn } from "@/lib/utils";

interface PredictionSummaryProps {
  prediction: PredictionResponse;
}

export function PredictionSummary({ prediction }: PredictionSummaryProps) {
  const isFake = prediction.prediction === "Fake";
  const probabilityPct = Math.round(prediction.fraud_probability * 100);
  const riskScore = Math.round(prediction.fraud_risk_score);
  // The API does not return confidence; derive it from the verdict probability.
  const confidencePct = isFake ? probabilityPct : 100 - probabilityPct;

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      aria-label="Prediction summary"
      className="relative flex h-full flex-col overflow-hidden rounded-3xl border border-border/70 bg-card/80 p-5 shadow-xl shadow-primary/[0.06] backdrop-blur-sm sm:p-6"
    >
      {/* Verdict accent glow */}
      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute -top-24 left-1/2 h-48 w-72 -translate-x-1/2 rounded-full blur-3xl",
          isFake ? "bg-red-500/10" : "bg-emerald-500/10"
        )}
      />

      <div className="relative">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold tracking-tight text-foreground">
              AI Fraud Detection Report
            </h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Machine Learning prediction with Explainable AI insights.
            </p>
          </div>
          <RiskBadge level={prediction.risk_level} />
        </div>

        {/* Verdict block */}
        <div className="mt-5 flex items-center gap-4 rounded-2xl border border-border/60 bg-background/50 p-4">
          <span
            className={cn(
              "relative flex size-16 shrink-0 items-center justify-center rounded-2xl border shadow-sm",
              isFake
                ? "border-red-500/25 bg-gradient-to-br from-red-500/15 to-rose-500/5 text-red-600 dark:text-red-400"
                : "border-emerald-500/25 bg-gradient-to-br from-emerald-500/15 to-teal-500/5 text-emerald-600 dark:text-emerald-400"
            )}
          >
            <span
              aria-hidden="true"
              className={cn(
                "absolute inset-0 rounded-2xl blur-md",
                isFake ? "bg-red-500/10" : "bg-emerald-500/10"
              )}
            />
            {isFake ? (
              <ShieldAlert className="relative size-8" aria-hidden="true" />
            ) : (
              <ShieldCheck className="relative size-8" aria-hidden="true" />
            )}
          </span>
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              Verdict
            </p>
            <p
              className={cn(
                "text-2xl font-bold tracking-tight sm:text-3xl",
                isFake
                  ? "text-red-600 dark:text-red-400"
                  : "text-emerald-600 dark:text-emerald-400"
              )}
            >
              {isFake ? "Likely Fraudulent Job" : "Likely Legitimate Job"}
            </p>
          </div>
        </div>

        {/* Metrics: 4 columns desktop, 2 tablet, 1 mobile */}
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4 xl:gap-6">
          <div className="flex flex-col justify-center rounded-2xl border border-border/60 bg-background/50 p-4">
            <ProbabilityBar value={probabilityPct} />
          </div>
          <div className="flex flex-col justify-center rounded-2xl border border-border/60 bg-background/50 p-4">
            <RiskMeter value={riskScore} level={prediction.risk_level} />
          </div>
          <div className="flex items-center justify-center rounded-2xl border border-border/60 bg-background/50 p-4">
            <ConfidenceRing value={confidencePct} />
          </div>
          <div className="flex flex-col justify-center rounded-2xl border border-border/60 bg-background/50 p-4">
            <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <Cpu className="size-3.5 text-primary" aria-hidden="true" />
              Model Version
            </span>
            <span className="mt-2 text-lg font-semibold tabular-nums text-foreground">
              {prediction.model_version}
            </span>
            <span className="mt-1 text-xs text-muted-foreground">
              XGBoost + SHAP explainability
            </span>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
