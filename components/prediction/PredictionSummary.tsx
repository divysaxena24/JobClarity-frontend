"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  CheckCircle2,
  Clock,
  Cpu,
  Download,
  Loader2,
  Percent,
  ShieldAlert,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import type { PredictionResponse } from "@/types/prediction";
import { RiskBadge } from "@/components/prediction/RiskBadge";
import { AnimatedRiskGauge } from "@/components/prediction/AnimatedRiskGauge";
import { InfoTooltip } from "@/components/prediction/InfoTooltip";
import { exportPredictionReportPDF } from "@/lib/pdf/reportGenerator";
import {
  getVerdictTitle,
  getVerdictDescription,
  getModerationAction,
} from "@/components/prediction/summaryUtils";
import { cn } from "@/lib/utils";

interface PredictionSummaryProps {
  prediction: PredictionResponse;
  timestamp?: string;
  jobDescription?: string;
}

export function PredictionSummary({
  prediction,
  timestamp,
  jobDescription = "",
}: PredictionSummaryProps) {
  const [analyzedTimestamp] = useState<string>(() => {
    if (timestamp) return timestamp;
    const now = new Date();
    return now.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  });

  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  const handleExportPDF = () => {
    try {
      setIsExporting(true);
      exportPredictionReportPDF({
        prediction,
        jobDescription,
      });
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 2500);
    } catch (err) {
      console.error("Failed to export PDF report:", err);
    } finally {
      setIsExporting(false);
    }
  };

  const isFake = prediction?.prediction === "Fake";
  const rawProb = Number.isFinite(prediction?.fraud_probability)
    ? prediction.fraud_probability
    : 0;
  const probabilityPct = Math.min(Math.max(rawProb * 100, 0), 100);
  const probabilityFormatted = `${probabilityPct.toFixed(1)}%`;

  const riskScore = Number.isFinite(prediction?.fraud_risk_score)
    ? Math.min(Math.max(Math.round(prediction.fraud_risk_score), 0), 100)
    : 0;

  const riskLevel =
    prediction?.risk_level ||
    (riskScore <= 25 ? "Low" : riskScore <= 50 ? "Medium" : riskScore <= 75 ? "High" : "Critical");

  const modelVersion = prediction?.model_version || "1.0.0";

  // Calibrated verdict language (non-absolute, trust-centered)
  const verdictTitle = getVerdictTitle(riskScore, isFake);
  const verdictDescription = getVerdictDescription(riskScore, isFake);
  const moderationAction = getModerationAction(riskScore, isFake);

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      aria-label="Interactive Risk Overview"
      className="relative flex flex-col overflow-hidden rounded-3xl border border-border/80 bg-card/90 p-5 shadow-2xl shadow-primary/[0.05] backdrop-blur-md sm:p-7"
    >
      {/* Background ambient lighting */}
      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute -top-32 left-1/2 h-64 w-96 -translate-x-1/2 rounded-full blur-3xl transition-colors duration-700",
          isFake ? "bg-red-500/15" : "bg-emerald-500/15"
        )}
      />

      {/* Top Header: Title + Timestamp + Risk Badge */}
      <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border/60 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold tracking-tight text-foreground sm:text-xl">
              JobClarity Risk Overview
            </h2>
            <span className="hidden sm:inline-block rounded-md bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
              Live AI Analysis
            </span>
          </div>
          <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="size-3.5 text-muted-foreground/70" />
            <span>
              {analyzedTimestamp ? `Analyzed at ${analyzedTimestamp}` : "Analysis completed in real time"}
            </span>
            <span aria-hidden="true">·</span>
            <span>XGBoost + TreeSHAP</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
          <RiskBadge level={riskLevel} />
          <span
            className={cn(
              "inline-flex items-center rounded-lg border px-2.5 py-1 text-[11px] font-bold tracking-wider uppercase",
              moderationAction.color
            )}
          >
            {moderationAction.label}
          </span>
          <button
            type="button"
            onClick={handleExportPDF}
            disabled={isExporting}
            aria-label="Export risk assessment report as PDF"
            className="inline-flex items-center gap-1.5 rounded-lg border border-border/80 bg-background/80 px-3 py-1.5 text-xs font-semibold text-foreground shadow-sm transition-all hover:bg-accent hover:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/40 active:scale-95 disabled:pointer-events-none disabled:opacity-60 cursor-pointer"
          >
            {isExporting ? (
              <>
                <Loader2 className="size-3.5 animate-spin text-primary" aria-hidden="true" />
                <span>Exporting...</span>
              </>
            ) : exportSuccess ? (
              <>
                <CheckCircle2 className="size-3.5 text-emerald-500" aria-hidden="true" />
                <span>Downloaded</span>
              </>
            ) : (
              <>
                <Download className="size-3.5 text-primary" aria-hidden="true" />
                <span>Export Report</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Primary Verdict Banner */}
      <div className="relative mt-5 rounded-2xl border border-border/70 bg-background/60 p-4 sm:p-5 backdrop-blur-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <span
              className={cn(
                "relative flex size-14 shrink-0 items-center justify-center rounded-2xl border shadow-inner sm:size-16",
                isFake
                  ? "border-red-500/30 bg-gradient-to-br from-red-500/20 to-rose-500/5 text-red-600 dark:text-red-400"
                  : "border-emerald-500/30 bg-gradient-to-br from-emerald-500/20 to-teal-500/5 text-emerald-600 dark:text-emerald-400"
              )}
            >
              <span
                aria-hidden="true"
                className={cn(
                  "absolute inset-0 rounded-2xl blur-sm",
                  isFake ? "bg-red-500/20" : "bg-emerald-500/20"
                )}
              />
              {isFake ? (
                <ShieldAlert className="relative size-8" aria-hidden="true" />
              ) : (
                <ShieldCheck className="relative size-8" aria-hidden="true" />
              )}
            </span>

            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Classification Verdict
              </span>
              <h3
                className={cn(
                  "text-2xl font-extrabold tracking-tight sm:text-3xl",
                  riskScore >= 50 || isFake
                    ? "text-red-600 dark:text-red-400"
                    : riskScore >= 25
                    ? "text-amber-600 dark:text-amber-400"
                    : "text-emerald-600 dark:text-emerald-400"
                )}
              >
                {verdictTitle}
              </h3>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {verdictDescription}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2 self-start rounded-xl border border-border/60 bg-card/60 px-3.5 py-2 sm:self-center">
            {riskScore >= 50 || isFake ? (
              <ShieldAlert className="size-4 text-red-500" />
            ) : (
              <CheckCircle2 className="size-4 text-emerald-500" />
            )}
            <div className="text-left text-xs">
              <span className="block font-semibold text-foreground">
                {riskScore >= 50 || isFake ? "High Risk Alert" : riskScore >= 25 ? "Caution Notice" : "Passed Security Audit"}
              </span>
              <span className="block text-[11px] text-muted-foreground">
                Score: {riskScore}/100
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Row: 3 Responsive Cards */}
      <div className="relative mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Card 1: Animated Circular Fraud Risk Score Gauge */}
        <div className="flex flex-col justify-between rounded-2xl border border-border/70 bg-background/50 p-5 backdrop-blur-sm transition-shadow hover:shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <Activity className="size-3.5 text-primary" aria-hidden="true" />
              <span>Fraud Risk Score</span>
            </div>
            <InfoTooltip
              title="Fraud Risk Score (0–100)"
              description="An operational risk score calibrated across decision thresholds to guide moderation workflows (Low, Medium, High, and Critical)."
            />
          </div>

          <div className="my-3 flex justify-center py-2">
            <AnimatedRiskGauge score={riskScore} riskLevel={riskLevel} size={144} />
          </div>

          <div className="flex items-center justify-between border-t border-border/50 pt-3 text-xs text-muted-foreground">
            <span>Threshold Tier</span>
            <span className="font-semibold text-foreground">{riskLevel} Severity</span>
          </div>
        </div>

        {/* Card 2: Fraud Probability Metric Card */}
        <div className="flex flex-col justify-between rounded-2xl border border-border/70 bg-background/50 p-5 backdrop-blur-sm transition-shadow hover:shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <Percent className="size-3.5 text-indigo-500" aria-hidden="true" />
              <span>Fraud Probability</span>
            </div>
            <InfoTooltip
              title="Raw Model Probability"
              description="The direct statistical likelihood (0.0%–100.0%) of fraud estimated by the XGBoost classifier based on TF-IDF textual features."
            />
          </div>

          <div className="my-auto py-4">
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-extrabold tracking-tight tabular-nums text-foreground sm:text-4xl">
                {probabilityFormatted}
              </span>
              <span className="text-xs font-medium text-muted-foreground">
                Statistical Likelihood
              </span>
            </div>

            {/* Gradient Progress Bar */}
            <div
              className="mt-4 h-3 w-full overflow-hidden rounded-full bg-border/60 p-0.5"
              role="progressbar"
              aria-label="Fraud probability percentage"
              aria-valuenow={Math.round(probabilityPct)}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <motion.div
                className={cn(
                  "h-full rounded-full bg-gradient-to-r",
                  probabilityPct < 30
                    ? "from-emerald-500 to-teal-400"
                    : probabilityPct < 60
                    ? "from-amber-500 to-yellow-400"
                    : "from-orange-500 to-rose-600"
                )}
                initial={{ width: 0 }}
                animate={{ width: `${Math.max(probabilityPct, 4)}%` }}
                transition={{ duration: 1.0, ease: [0.22, 1, 0.36, 1], delay: 0.25 }}
              />
            </div>

            <div className="mt-2.5 flex items-center justify-between text-[11px] text-muted-foreground">
              <span>0% Legitimate</span>
              <span>50% Review</span>
              <span>100% Scam</span>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-border/50 pt-3 text-xs text-muted-foreground">
            <span>Authenticity Likelihood</span>
            <span className="font-semibold text-foreground">
              {isFake ? probabilityFormatted : `${(100 - probabilityPct).toFixed(1)}%`}
            </span>
          </div>
        </div>

        {/* Card 3: Model Version & Audit Details */}
        <div className="flex flex-col justify-between rounded-2xl border border-border/70 bg-background/50 p-5 backdrop-blur-sm sm:col-span-2 lg:col-span-1 transition-shadow hover:shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <Cpu className="size-3.5 text-violet-500" aria-hidden="true" />
              <span>Model &amp; Inference Details</span>
            </div>
            <TrendingUp className="size-3.5 text-muted-foreground/60" />
          </div>

          <div className="my-auto space-y-3 py-3">
            <div className="flex items-center justify-between rounded-xl bg-background/70 px-3.5 py-2.5 border border-border/50">
              <span className="text-xs text-muted-foreground">Model Architecture</span>
              <span className="font-semibold text-xs text-foreground">XGBoost Ensemble</span>
            </div>

            <div className="flex items-center justify-between rounded-xl bg-background/70 px-3.5 py-2.5 border border-border/50">
              <span className="text-xs text-muted-foreground">Model Version</span>
              <span className="font-semibold text-xs tabular-nums text-foreground">
                {modelVersion}
              </span>
            </div>

            <div className="flex items-center justify-between rounded-xl bg-background/70 px-3.5 py-2.5 border border-border/50">
              <span className="text-xs text-muted-foreground">Explainability Engine</span>
              <span className="font-semibold text-xs text-foreground">TreeSHAP Local</span>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-border/50 pt-3 text-xs text-muted-foreground">
            <span>Tracking Store</span>
            <span className="font-semibold text-foreground">MLflow Registry</span>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
