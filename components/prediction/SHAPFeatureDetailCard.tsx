"use client";

import { motion } from "framer-motion";
import { ArrowDownRight, ArrowUpRight, Scale, X } from "lucide-react";
import type { TopReason } from "@/types/prediction";
import { cn } from "@/lib/utils";

interface SHAPFeatureDetailCardProps {
  featureData: TopReason & { rank: number; absImpact: number; totalAbsImpact: number };
  onClose: () => void;
}

export function SHAPFeatureDetailCard({
  featureData,
  onClose,
}: SHAPFeatureDetailCardProps) {
  const isPositive = featureData.impact > 0;
  const contributionPct =
    featureData.totalAbsImpact > 0
      ? (featureData.absImpact / featureData.totalAbsImpact) * 100
      : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.98 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="relative rounded-2xl border border-primary/30 bg-card p-5 shadow-lg shadow-primary/[0.05] ring-1 ring-primary/20 backdrop-blur-md"
    >
      {/* Top Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "flex size-9 shrink-0 items-center justify-center rounded-xl",
              isPositive
                ? "bg-red-500/10 text-red-600 dark:text-red-400"
                : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
            )}
          >
            {isPositive ? (
              <ArrowUpRight className="size-5" />
            ) : (
              <ArrowDownRight className="size-5" />
            )}
          </span>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-muted-foreground">
                Feature Detail (Rank #{featureData.rank})
              </span>
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-[11px] font-bold uppercase",
                  isPositive
                    ? "bg-red-500/10 text-red-600 dark:text-red-400"
                    : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                )}
              >
                {isPositive ? "Increases Fraud Risk" : "Decreases Fraud Risk"}
              </span>
            </div>
            <code className="mt-1 inline-block rounded-md border border-border/80 bg-muted/60 px-2 py-0.5 font-mono text-sm font-bold text-foreground">
              {featureData.feature}
            </code>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Close detail panel"
          className="rounded-lg p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <X className="size-4" />
        </button>
      </div>

      {/* Metric Breakdown Grid */}
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-border/60 bg-background/50 p-3">
          <span className="text-[11px] font-medium text-muted-foreground">Exact SHAP Value</span>
          <p
            className={cn(
              "mt-1 font-mono text-lg font-bold tabular-nums",
              isPositive
                ? "text-red-600 dark:text-red-400"
                : "text-emerald-600 dark:text-emerald-400"
            )}
          >
            {isPositive ? "+" : ""}
            {featureData.impact.toFixed(4)}
          </p>
        </div>

        <div className="rounded-xl border border-border/60 bg-background/50 p-3">
          <span className="text-[11px] font-medium text-muted-foreground">Relative Weight</span>
          <p className="mt-1 font-mono text-lg font-bold tabular-nums text-foreground">
            {contributionPct.toFixed(1)}%
            <span className="text-xs font-normal text-muted-foreground"> of explanations</span>
          </p>
        </div>

        <div className="rounded-xl border border-border/60 bg-background/50 p-3">
          <span className="text-[11px] font-medium text-muted-foreground">Feature Rank</span>
          <p className="mt-1 text-lg font-bold tabular-nums text-foreground">
            #{featureData.rank}
            <span className="text-xs font-normal text-muted-foreground"> overall impact</span>
          </p>
        </div>
      </div>

      {/* Statistical Interpretation Note */}
      <div className="mt-3.5 flex items-start gap-2 rounded-xl border border-border/50 bg-muted/30 p-3 text-xs leading-relaxed text-muted-foreground">
        <Scale className="mt-0.5 size-4 shrink-0 text-primary" />
        <p>
          <strong>TreeSHAP Interpretation:</strong> This score represents the additive marginal
          contribution of the n-gram token{" "}
          <code className="font-mono text-foreground font-semibold">&ldquo;{featureData.feature}&rdquo;</code>{" "}
          to the XGBoost decision log-odds relative to the average training baseline. Individual
          words reflect statistical correlation within training job postings and should be reviewed in full context rather than taken as standalone proof of fraud.
        </p>
      </div>
    </motion.div>
  );
}
