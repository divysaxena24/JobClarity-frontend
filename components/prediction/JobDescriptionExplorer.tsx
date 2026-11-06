"use client";

import { useId, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Check,
  Copy,
  FileText,
  HelpCircle,
  Info,
  Layers,
  Scale,
  Sparkles,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import type { TopReason } from "@/types/prediction";
import { SHAPFeatureDetailCard } from "@/components/prediction/SHAPFeatureDetailCard";
import { cn } from "@/lib/utils";

export interface JobDescriptionExplorerProps {
  jobDescription?: string;
  reasons?: TopReason[];
  selectedFeature?: string | null;
  onSelectFeature?: (feature: string | null) => void;
}

export interface ProcessedReason extends TopReason {
  rank: number;
  absImpact: number;
  totalAbsImpact: number;
  isAggregate: boolean;
  matchCount: number;
}

interface TextInterval {
  start: number;
  end: number;
  reason: ProcessedReason;
}

type TextSegment =
  | { type: "text"; text: string; key: string }
  | {
      type: "highlight";
      text: string;
      reason: ProcessedReason;
      key: string;
    };

/** Keywords indicating aggregate or document-level structural features */
const AGGREGATE_KEYWORDS = [
  "count",
  "score",
  "length",
  "ratio",
  "rate",
  "total",
  "avg_",
  "average",
  "mean_",
  "has_",
  "num_",
  "char_",
  "word_",
  "sentence_",
];

/** Check if a feature is an aggregate signal rather than a localized text phrase */
export function isAggregateFeature(featureName: string): boolean {
  const lower = (featureName || "").toLowerCase().trim();
  return AGGREGATE_KEYWORDS.some((kw) => lower.includes(kw));
}

/** Safely escape special regex characters */
function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Build a phrase regex with boundary checking.
 * Handles alphanumeric words as well as symbols (e.g. currency, punctuation).
 */
function createPhraseRegex(phrase: string): RegExp | null {
  const trimmed = phrase.trim();
  if (!trimmed) return null;

  const escaped = escapeRegExp(trimmed);
  const leadingBoundary = /^\w/.test(trimmed) ? "\\b" : "";
  const trailingBoundary = /\w$/.test(trimmed) ? "\\b" : "";

  try {
    return new RegExp(`${leadingBoundary}${escaped}${trailingBoundary}`, "gi");
  } catch {
    return null;
  }
}

export function JobDescriptionExplorer({
  jobDescription = "",
  reasons = [],
  selectedFeature,
  onSelectFeature,
}: JobDescriptionExplorerProps) {
  const [showHighlights, setShowHighlights] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);
  const [showMLNote, setShowMLNote] = useState<boolean>(false);
  const rawId = useId();
  const baseId = useMemo(() => rawId.replace(/[^a-zA-Z0-9_-]/g, ""), [rawId]);

  // Compute ranks, baseline impacts, and counts
  const processedReasons = useMemo<ProcessedReason[]>(() => {
    if (!reasons || !Array.isArray(reasons) || reasons.length === 0) return [];

    const totalAbsImpact = reasons.reduce(
      (sum, r) => sum + Math.abs(Number.isFinite(r.impact) ? r.impact : 0),
      0
    );

    // Baseline ranking by absolute impact
    const sorted = [...reasons]
      .map((r) => ({
        feature: (r.feature || "unknown").trim(),
        impact: Number.isFinite(r.impact) ? r.impact : 0,
        effect: r.effect || (r.impact > 0 ? "Increases fraud risk" : "Decreases fraud risk"),
        absImpact: Math.abs(Number.isFinite(r.impact) ? r.impact : 0),
      }))
      .sort((a, b) => b.absImpact - a.absImpact);

    return sorted.map((r, idx) => {
      const isAgg = isAggregateFeature(r.feature);
      let matchCount = 0;

      if (!isAgg && jobDescription) {
        const regex = createPhraseRegex(r.feature);
        if (regex) {
          const matches = jobDescription.match(regex);
          matchCount = matches ? matches.length : 0;
        }
      }

      return {
        ...r,
        rank: idx + 1,
        totalAbsImpact,
        isAggregate: isAgg,
        matchCount,
      };
    });
  }, [reasons, jobDescription]);

  // Partition into text-mappable, aggregate, and absent features
  const { textMappableReasons, aggregateReasons, absentReasons } = useMemo(() => {
    const textMappable: ProcessedReason[] = [];
    const aggregate: ProcessedReason[] = [];
    const absent: ProcessedReason[] = [];

    for (const r of processedReasons) {
      if (r.isAggregate) {
        aggregate.push(r);
      } else if (r.matchCount > 0) {
        textMappable.push(r);
      } else {
        absent.push(r);
      }
    }

    return {
      textMappableReasons: textMappable,
      aggregateReasons: aggregate,
      absentReasons: absent,
    };
  }, [processedReasons]);

  // Total text matches found across all text features
  const totalMatchesCount = useMemo(() => {
    return textMappableReasons.reduce((sum, r) => sum + r.matchCount, 0);
  }, [textMappableReasons]);

  // Build non-overlapping intervals for exact character-level text highlighting
  const textSegments = useMemo<TextSegment[]>(() => {
    if (!jobDescription) return [];
    if (!showHighlights || textMappableReasons.length === 0) {
      return [{ type: "text", text: jobDescription, key: `${baseId}-raw-text` }];
    }

    // Collect all match intervals
    const intervals: TextInterval[] = [];

    // Prioritize longer phrases first so n-grams take precedence over single words
    const sortedFeatures = [...textMappableReasons].sort(
      (a, b) => b.feature.length - a.feature.length
    );

    for (const reason of sortedFeatures) {
      const regex = createPhraseRegex(reason.feature);
      if (!regex) continue;

      let match: RegExpExecArray | null;
      while ((match = regex.exec(jobDescription)) !== null) {
        const start = match.index;
        const end = match.index + match[0].length;
        intervals.push({ start, end, reason });
      }
    }

    if (intervals.length === 0) {
      return [{ type: "text", text: jobDescription, key: `${baseId}-unmatched-text` }];
    }

    // Sort intervals by start ascending, then longer interval first
    intervals.sort((a, b) => {
      if (a.start !== b.start) return a.start - b.start;
      return (b.end - b.start) - (a.end - a.start);
    });

    // Filter overlapping intervals (greedy non-overlapping partition)
    const nonOverlapping: TextInterval[] = [];
    let lastEnd = -1;

    for (const inv of intervals) {
      if (inv.start >= lastEnd) {
        nonOverlapping.push(inv);
        lastEnd = inv.end;
      }
    }

    // Build alternating segments: text, highlight, text, highlight...
    const segments: TextSegment[] = [];
    let currentIndex = 0;

    nonOverlapping.forEach((inv, i) => {
      if (inv.start > currentIndex) {
        segments.push({
          type: "text",
          text: jobDescription.slice(currentIndex, inv.start),
          key: `${baseId}-t-${currentIndex}-${inv.start}`,
        });
      }

      segments.push({
        type: "highlight",
        text: jobDescription.slice(inv.start, inv.end),
        reason: inv.reason,
        key: `${baseId}-h-${i}-${inv.start}-${inv.reason.feature}`,
      });

      currentIndex = inv.end;
    });

    if (currentIndex < jobDescription.length) {
      segments.push({
        type: "text",
        text: jobDescription.slice(currentIndex),
        key: `${baseId}-t-${currentIndex}-end`,
      });
    }

    return segments;
  }, [jobDescription, showHighlights, textMappableReasons, baseId]);

  // Selected feature detail object
  const selectedFeatureData = useMemo(() => {
    if (!selectedFeature) return null;
    return processedReasons.find((r) => r.feature === selectedFeature) || null;
  }, [selectedFeature, processedReasons]);

  const handleCopyText = async () => {
    if (!jobDescription) return;
    try {
      await navigator.clipboard.writeText(jobDescription);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback if clipboard API is blocked
    }
  };

  const handleFeatureClick = (feat: string) => {
    if (onSelectFeature) {
      onSelectFeature(selectedFeature === feat ? null : feat);
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.25, ease: "easeOut" }}
      aria-label="Job Description Intelligence Explorer"
      className="flex flex-col rounded-3xl border border-border/80 bg-card/90 p-5 shadow-2xl shadow-primary/[0.05] backdrop-blur-md sm:p-7"
    >
      {/* Header Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between border-b border-border/60 pb-5">
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500/15 via-violet-500/10 to-fuchsia-500/15 text-indigo-600 dark:text-indigo-400">
            <FileText className="size-5" aria-hidden="true" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold tracking-tight text-foreground sm:text-xl">
                Job Description Intelligence Explorer
              </h2>
              <span className="hidden sm:inline-flex items-center gap-1 rounded-md bg-indigo-500/10 px-2 py-0.5 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
                <Sparkles className="size-3" />
                Text Mapping
              </span>
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">
              Contextual view of the original posting with model feature attributions highlighted directly in the text.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          {/* Highlight Toggle */}
          <button
            type="button"
            onClick={() => setShowHighlights((prev) => !prev)}
            aria-pressed={showHighlights}
            className={cn(
              "inline-flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all",
              showHighlights
                ? "border-primary/40 bg-primary/10 text-primary shadow-sm"
                : "border-border/70 bg-background/60 text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            {showHighlights ? (
              <ToggleRight className="size-4 text-primary" />
            ) : (
              <ToggleLeft className="size-4 text-muted-foreground" />
            )}
            <span>Show Feature Highlights</span>
          </button>

          {/* Copy Text */}
          <button
            type="button"
            onClick={handleCopyText}
            disabled={!jobDescription}
            aria-label="Copy job description text"
            className="inline-flex items-center gap-1.5 rounded-xl border border-border/70 bg-background/60 px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
          >
            {copied ? (
              <>
                <Check className="size-3.5 text-emerald-500" />
                <span className="text-emerald-600 dark:text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="size-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>

          {/* ML Interpretation Guide Toggle */}
          <button
            type="button"
            onClick={() => setShowMLNote((prev) => !prev)}
            aria-label="Toggle ML interpretation guide"
            className="inline-flex items-center gap-1 rounded-xl border border-border/70 bg-background/60 px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <HelpCircle className="size-3.5 text-primary" />
            <span className="hidden md:inline">{showMLNote ? "Hide Guide" : "ML Guide"}</span>
          </button>
        </div>
      </div>

      {/* Educational ML Correctness Notice */}
      <AnimatePresence>
        {showMLNote && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden border-b border-border/50"
          >
            <div className="my-4 rounded-2xl border border-indigo-500/25 bg-gradient-to-br from-indigo-500/5 via-violet-500/5 to-transparent p-4 sm:p-5 text-xs leading-relaxed text-muted-foreground">
              <div className="flex items-center gap-2 font-semibold text-foreground text-sm">
                <Scale className="size-4 text-primary" />
                <span>How to Interpret Text-Derived SHAP Highlights</span>
              </div>
              <ul className="mt-2.5 space-y-1.5 list-disc pl-5">
                <li>
                  <strong>Visual Indicators, Not Token-Level Causal Proof:</strong> Highlights locate specific n-gram features evaluated by the trained tree model. They reflect statistical correlation across the training dataset, not definitive proof of employer intent.
                </li>
                <li>
                  <strong>Aggregate Features Are Kept Separate:</strong> Document-wide metrics (such as word count or language density scores) apply to the posting as a whole and are never falsely mapped to isolated words.
                </li>
                <li>
                  <strong>Exact Contextual Preservation:</strong> The original job posting text, casing, line breaks, and punctuation are preserved without synthetic modifications.
                </li>
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Highlight Legend & Stats Sub-Bar */}
      {showHighlights && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/60 bg-background/50 px-3.5 py-2.5 text-xs">
          {/* Color Legend */}
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-semibold text-muted-foreground text-[11px] uppercase tracking-wider">
              Legend:
            </span>
            <div className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-full bg-red-500" />
              <span className="text-red-700 dark:text-red-300 font-medium">
                High Risk Signal (+SHAP)
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-full bg-emerald-500" />
              <span className="text-emerald-700 dark:text-emerald-300 font-medium">
                Legitimacy Signal (-SHAP)
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-full border border-primary bg-primary/20" />
              <span className="text-foreground font-medium">Selected Feature</span>
            </div>
          </div>

          {/* Stats Badge */}
          <div className="text-[11px] text-muted-foreground">
            {totalMatchesCount > 0 ? (
              <span>
                <strong className="font-mono text-foreground">{totalMatchesCount}</strong> highlighted{" "}
                {totalMatchesCount === 1 ? "match" : "matches"} across{" "}
                <strong className="font-mono text-foreground">{textMappableReasons.length}</strong>{" "}
                {textMappableReasons.length === 1 ? "feature" : "features"}
              </span>
            ) : (
              <span className="italic">No text-mappable n-grams detected in this posting</span>
            )}
          </div>
        </div>
      )}

      {/* Selected Feature Detail Panel */}
      <AnimatePresence>
        {selectedFeatureData && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2 px-1">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-primary">
                <Info className="size-3.5" />
                <span>
                  Inspect Selected Feature:{" "}
                  <code className="font-mono">{selectedFeatureData.feature}</code>
                </span>
                {selectedFeatureData.matchCount > 0 && (
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] text-primary">
                    {selectedFeatureData.matchCount} in text
                  </span>
                )}
                {selectedFeatureData.isAggregate && (
                  <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
                    Document-level feature
                  </span>
                )}
              </div>
            </div>
            <SHAPFeatureDetailCard
              featureData={selectedFeatureData}
              onClose={() => onSelectFeature && onSelectFeature(null)}
            />
          </div>
        )}
      </AnimatePresence>

      {/* Main Job Description Display Box */}
      <div className="mt-4">
        {!jobDescription ? (
          <div className="rounded-2xl border border-dashed border-border/80 p-8 text-center">
            <p className="text-sm text-muted-foreground">
              No job description content available for analysis.
            </p>
          </div>
        ) : (
          <div
            tabIndex={0}
            role="region"
            aria-label="Original job description with feature highlights"
            className="max-h-[440px] overflow-y-auto rounded-2xl border border-border/70 bg-background/60 p-4 sm:p-5 font-sans text-sm leading-relaxed text-foreground select-text focus:outline-none focus:ring-1 focus:ring-primary/40 scrollbar-thin"
          >
            <div className="whitespace-pre-wrap break-words">
              {textSegments.map((segment) => {
                if (segment.type === "text") {
                  return <span key={segment.key}>{segment.text}</span>;
                }

                const reason = segment.reason;
                const isPositive = reason.impact > 0;
                const isSelected = selectedFeature === reason.feature;

                return (
                  <button
                    key={segment.key}
                    type="button"
                    onClick={() => handleFeatureClick(reason.feature)}
                    aria-label={`Feature ${reason.feature}, SHAP impact ${reason.impact.toFixed(4)}. Click to view details.`}
                    title={`${reason.feature}: ${isPositive ? "+" : ""}${reason.impact.toFixed(4)} (${reason.effect}) - Click to inspect`}
                    className={cn(
                      "group relative inline rounded px-1.5 py-0.5 text-left font-medium transition-all duration-150 cursor-pointer align-baseline",
                      isPositive
                        ? "bg-red-500/15 text-red-950 dark:text-red-200 border-b-2 border-red-500/60 hover:bg-red-500/25"
                        : "bg-emerald-500/15 text-emerald-950 dark:text-emerald-200 border-b-2 border-emerald-500/60 hover:bg-emerald-500/25",
                      isSelected &&
                        "ring-2 ring-primary ring-offset-1 ring-offset-background font-bold shadow-md shadow-primary/10"
                    )}
                  >
                    <span>{segment.text}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Aggregate & Document-Level Features Section */}
      {aggregateReasons.length > 0 && (
        <div className="mt-5 rounded-2xl border border-border/70 bg-muted/20 p-4 sm:p-5">
          <div className="flex items-center gap-2">
            <Layers className="size-4 text-indigo-500" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground sm:text-sm">
              Document-Level &amp; Aggregate Signals ({aggregateReasons.length})
            </h3>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            The following features assess global characteristics of the job description as a whole
            (such as structural metrics or aggregate language density), rather than specific isolated words.
          </p>

          <div className="mt-3.5 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
            {aggregateReasons.map((agg) => {
              const isPositive = agg.impact > 0;
              const isSelected = selectedFeature === agg.feature;

              return (
                <button
                  key={agg.feature}
                  type="button"
                  onClick={() => handleFeatureClick(agg.feature)}
                  className={cn(
                    "flex flex-col gap-1.5 rounded-xl border p-3 text-left transition-all",
                    isSelected
                      ? "border-primary bg-primary/10 ring-2 ring-primary/30"
                      : "border-border/70 bg-background/70 hover:border-border hover:bg-muted/40"
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <code className="font-mono text-xs font-semibold text-foreground">
                      {agg.feature}
                    </code>
                    <span
                      className={cn(
                        "rounded px-1.5 py-0.5 font-mono text-[11px] font-bold",
                        isPositive
                          ? "bg-red-500/10 text-red-600 dark:text-red-400"
                          : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      )}
                    >
                      {isPositive ? "+" : ""}
                      {agg.impact.toFixed(4)}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-tight">{agg.effect}</p>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Model Absence Signals (Evaluated features not present in text) */}
      {showHighlights && absentReasons.length > 0 && (
        <div className="mt-4 rounded-2xl border border-dashed border-border/70 bg-background/40 p-4 text-xs">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 font-semibold text-muted-foreground">
              <Info className="size-3.5" />
              <span>Model Vocabulary Absence Signals ({absentReasons.length})</span>
            </div>
            <span className="text-[11px] text-muted-foreground/80 hidden sm:inline">
              Absence of expected terms shifts tree baseline
            </span>
          </div>
          <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
            In TreeSHAP explainability, the absence of frequent fraud indicators or standard industry terms
            can meaningfully shift the prediction probability:
          </p>
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {absentReasons.map((abs) => {
              const isPositive = abs.impact > 0;
              const isSelected = selectedFeature === abs.feature;

              return (
                <button
                  key={abs.feature}
                  type="button"
                  onClick={() => handleFeatureClick(abs.feature)}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-lg border px-2 py-1 font-mono text-xs transition-colors",
                    isSelected
                      ? "border-primary bg-primary/10 text-primary font-bold ring-1 ring-primary"
                      : "border-border/60 bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                  title={`${abs.feature}: ${isPositive ? "+" : ""}${abs.impact.toFixed(4)} - Evaluated as absent in text`}
                >
                  <span>{abs.feature}</span>
                  <span
                    className={cn(
                      "font-semibold text-[10px]",
                      isPositive
                        ? "text-red-600 dark:text-red-400"
                        : "text-emerald-600 dark:text-emerald-400"
                    )}
                  >
                    {isPositive ? "+" : ""}
                    {abs.impact.toFixed(3)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </motion.section>
  );
}
