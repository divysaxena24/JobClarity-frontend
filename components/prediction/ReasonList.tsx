"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowDownUp,
  BarChart3,
  HelpCircle,
  LayoutGrid,
  Lightbulb,
  Sparkles,
} from "lucide-react";
import type { TopReason } from "@/types/prediction";
import { SHAPChart } from "@/components/prediction/SHAPChart";
import { SHAPFeatureDetailCard } from "@/components/prediction/SHAPFeatureDetailCard";
import { FeatureImpactCard } from "@/components/prediction/FeatureImpactCard";
import { cn } from "@/lib/utils";

interface ReasonListProps {
  reasons: TopReason[];
  selectedFeature?: string | null;
  onSelectFeature?: (feature: string | null) => void;
}

type SortOption = "abs" | "positive" | "negative";
type CountOption = "top5" | "all";
type ViewMode = "chart" | "cards";

export function ReasonList({
  reasons,
  selectedFeature: externalSelectedFeature,
  onSelectFeature: externalOnSelectFeature,
}: ReasonListProps) {
  const [internalSelectedFeature, setInternalSelectedFeature] = useState<string | null>(null);

  const selectedFeature =
    externalSelectedFeature !== undefined ? externalSelectedFeature : internalSelectedFeature;
  const setSelectedFeature = (feat: string | null) => {
    if (externalOnSelectFeature) {
      externalOnSelectFeature(feat);
    } else {
      setInternalSelectedFeature(feat);
    }
  };
  const [sortBy, setSortBy] = useState<SortOption>("abs");
  const [countFilter, setCountFilter] = useState<CountOption>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("chart");
  const [showExplanation, setShowExplanation] = useState<boolean>(false);

  // Compute ranks and absolute impacts from verified reasons
  const processedData = useMemo(() => {
    if (!reasons || !Array.isArray(reasons) || reasons.length === 0) return [];

    const totalAbsImpact = reasons.reduce(
      (sum, r) => sum + Math.abs(Number.isFinite(r.impact) ? r.impact : 0),
      0
    );

    // Initial pass: sort by absolute impact to establish baseline importance ranks #1..#N
    const ranked = [...reasons]
      .map((r) => ({
        feature: r.feature || "unknown",
        impact: Number.isFinite(r.impact) ? r.impact : 0,
        effect: r.effect || (r.impact > 0 ? "Increases fraud risk" : "Decreases fraud risk"),
        absImpact: Math.abs(Number.isFinite(r.impact) ? r.impact : 0),
      }))
      .sort((a, b) => b.absImpact - a.absImpact)
      .map((r, idx) => ({
        ...r,
        rank: idx + 1,
        totalAbsImpact,
      }));

    return ranked;
  }, [reasons]);

  // Apply user-selected sorting
  const sortedData = useMemo(() => {
    const list = [...processedData];
    if (sortBy === "abs") {
      return list.sort((a, b) => b.absImpact - a.absImpact);
    }
    if (sortBy === "positive") {
      return list.sort((a, b) => b.impact - a.impact);
    }
    if (sortBy === "negative") {
      return list.sort((a, b) => a.impact - b.impact);
    }
    return list;
  }, [processedData, sortBy]);

  // Apply Top 5 vs All slice
  const displayedData = useMemo(() => {
    if (countFilter === "top5") {
      return sortedData.slice(0, 5);
    }
    return sortedData;
  }, [sortedData, countFilter]);

  // Selected feature detail object
  const selectedFeatureData = useMemo(() => {
    if (!selectedFeature) return null;
    return processedData.find((item) => item.feature === selectedFeature) || null;
  }, [selectedFeature, processedData]);

  const maxAbsImpact = useMemo(() => {
    if (!displayedData.length) return 1;
    return Math.max(...displayedData.map((d) => d.absImpact));
  }, [displayedData]);

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
      aria-label="SHAP Explainability Dashboard"
      className="flex flex-col rounded-3xl border border-border/80 bg-card/90 p-5 shadow-2xl shadow-primary/[0.05] backdrop-blur-md sm:p-7"
    >
      {/* Dashboard Section Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between border-b border-border/60 pb-5">
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500/15 via-violet-500/10 to-fuchsia-500/15 text-indigo-600 dark:text-indigo-400">
            <Lightbulb className="size-5" aria-hidden="true" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold tracking-tight text-foreground sm:text-xl">
                Key Factors Behind the Prediction
              </h2>
              <span className="hidden sm:inline-flex items-center gap-1 rounded-md bg-indigo-500/10 px-2 py-0.5 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
                <Sparkles className="size-3" />
                TreeSHAP
              </span>
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">
              Additive feature attributions showing exactly how words shift the model toward fraud or legitimacy.
            </p>
          </div>
        </div>

        {/* Educational Toggle Button */}
        <button
          type="button"
          onClick={() => setShowExplanation((prev) => !prev)}
          className="inline-flex items-center gap-1.5 self-start rounded-xl border border-border/70 bg-background/60 px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:self-auto"
        >
          <HelpCircle className="size-3.5 text-primary" />
          <span>{showExplanation ? "Hide SHAP Guide" : "What is SHAP?"}</span>
        </button>
      </div>

      {/* Collapsible SHAP Educational Card */}
      <AnimatePresence>
        {showExplanation && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden border-b border-border/50"
          >
            <div className="my-4 rounded-2xl border border-indigo-500/25 bg-gradient-to-br from-indigo-500/5 via-violet-500/5 to-transparent p-4 sm:p-5 text-xs leading-relaxed text-muted-foreground">
              <div className="flex items-center gap-2 font-semibold text-foreground text-sm">
                <span>Understanding TreeSHAP Feature Attributions</span>
              </div>
              <p className="mt-2">
                <strong>TreeSHAP (SHapley Additive exPlanations)</strong> calculates the exact mathematical contribution of each n-gram phrase toward the final classification:
              </p>
              <ul className="mt-2.5 space-y-1.5 list-disc pl-5">
                <li>
                  <strong className="text-red-600 dark:text-red-400">Positive values (&gt; 0, Red):</strong> Push the model towards classifying the job posting as fraudulent.
                </li>
                <li>
                  <strong className="text-emerald-600 dark:text-emerald-400">Negative values (&lt; 0, Green):</strong> Pull the model towards classifying the job posting as legitimate.
                </li>
                <li>
                  <strong>Central Zero Baseline:</strong> Represents the model’s expected default prediction across the entire training corpus. Features extending outward show deviations from neutral expectation.
                </li>
              </ul>
              <p className="mt-2.5 text-[11px] text-muted-foreground/90 border-t border-border/40 pt-2 italic">
                Notice: Words like &ldquo;experience&rdquo; or &ldquo;wire transfer&rdquo; are evaluated in aggregate frequency and co-occurrence. They represent statistical signals within the trained model, not standalone proof of employer intent.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Control Bar: View Mode, Filter, and Sort Options */}
      {processedData.length > 0 && (
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/60 bg-background/50 p-2.5 sm:p-3">
          {/* Left: View Mode Toggle + Top 5 / All Toggle */}
          <div className="flex flex-wrap items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex rounded-xl border border-border/70 bg-card p-0.5">
              <button
                type="button"
                onClick={() => setViewMode("chart")}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all",
                  viewMode === "chart"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <BarChart3 className="size-3.5" />
                Diverging Chart
              </button>
              <button
                type="button"
                onClick={() => setViewMode("cards")}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all",
                  viewMode === "cards"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <LayoutGrid className="size-3.5" />
                Cards Grid
              </button>
            </div>

            {/* Top 5 / All Toggle */}
            <div className="flex rounded-xl border border-border/70 bg-card p-0.5">
              <button
                type="button"
                onClick={() => setCountFilter("top5")}
                className={cn(
                  "rounded-lg px-2.5 py-1 text-xs font-semibold transition-all",
                  countFilter === "top5"
                    ? "bg-muted text-foreground font-bold shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Top 5
              </button>
              <button
                type="button"
                onClick={() => setCountFilter("all")}
                className={cn(
                  "rounded-lg px-2.5 py-1 text-xs font-semibold transition-all",
                  countFilter === "all"
                    ? "bg-muted text-foreground font-bold shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                All ({processedData.length})
              </button>
            </div>
          </div>

          {/* Right: Sort Options */}
          <div className="flex items-center gap-1.5">
            <span className="flex items-center gap-1 text-[11px] font-semibold text-muted-foreground">
              <ArrowDownUp className="size-3" />
              Sort:
            </span>
            <div className="flex rounded-xl border border-border/70 bg-card p-0.5 text-xs">
              <button
                type="button"
                onClick={() => setSortBy("abs")}
                className={cn(
                  "rounded-lg px-2 py-1 text-[11px] font-medium transition-all",
                  sortBy === "abs"
                    ? "bg-primary/10 text-primary font-bold"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Absolute
              </button>
              <button
                type="button"
                onClick={() => setSortBy("positive")}
                className={cn(
                  "rounded-lg px-2 py-1 text-[11px] font-medium transition-all",
                  sortBy === "positive"
                    ? "bg-red-500/10 text-red-600 dark:text-red-400 font-bold"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Highest Risk
              </button>
              <button
                type="button"
                onClick={() => setSortBy("negative")}
                className={cn(
                  "rounded-lg px-2 py-1 text-[11px] font-medium transition-all",
                  sortBy === "negative"
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Legitimacy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Selected Feature Detail Panel */}
      <AnimatePresence>
        {selectedFeatureData && (
          <div className="mt-4">
            <SHAPFeatureDetailCard
              featureData={selectedFeatureData}
              onClose={() => setSelectedFeature(null)}
            />
          </div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="mt-5 flex-1">
        {processedData.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/80 p-8 text-center">
            <p className="text-sm text-muted-foreground">
              No significant feature attributions were extracted for this posting.
            </p>
          </div>
        ) : viewMode === "chart" ? (
          <SHAPChart
            data={displayedData}
            selectedFeature={selectedFeature}
            onSelectFeature={(feat) => {
              setSelectedFeature(selectedFeature === feat ? null : feat);
            }}
          />
        ) : (
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-5 xl:gap-6">
            {displayedData.map((item, idx) => (
              <FeatureImpactCard
                key={`${item.feature}-${idx}`}
                reason={item}
                index={idx}
                maxAbsImpact={maxAbsImpact}
                isSelected={selectedFeature === item.feature}
                onClick={() => {
                  setSelectedFeature(selectedFeature === item.feature ? null : item.feature);
                }}
              />
            ))}
          </ul>
        )}
      </div>
    </motion.section>
  );
}
