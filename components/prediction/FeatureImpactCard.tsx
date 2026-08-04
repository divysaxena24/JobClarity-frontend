"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import type { TopReason } from "@/types/prediction";
import { cn } from "@/lib/utils";

interface FeatureImpactCardProps {
  reason: TopReason;
  index: number;
  /** Largest absolute impact in the list, used to normalize the direction bar. */
  maxAbsImpact?: number;
}

export const FeatureImpactCard = memo(function FeatureImpactCard({
  reason,
  index,
  maxAbsImpact,
}: FeatureImpactCardProps) {
  const increases = reason.impact > 0;
  const formatted = reason.impact.toFixed(4);
  const absImpact = Math.abs(reason.impact);
  const barWidth =
    maxAbsImpact && maxAbsImpact > 0
      ? Math.max((absImpact / maxAbsImpact) * 100, 4)
      : Math.min(absImpact * 250, 100);

  return (
    <motion.li
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35, delay: 0.15 + index * 0.07, ease: "easeOut" }}
      className="group relative flex h-full min-w-0 flex-col gap-2.5 rounded-2xl border border-border/70 bg-background/60 p-3.5 transition-all duration-200 hover:-translate-y-0.5 hover:border-ring/40 hover:bg-muted/40 hover:shadow-md hover:shadow-primary/[0.05]"
    >
      <div className="flex items-center justify-between gap-3">
        <code className="min-w-0 truncate rounded-md border border-border/70 bg-muted/60 px-2 py-1 font-mono text-xs text-foreground transition-colors group-hover:border-ring/40">
          {reason.feature}
        </code>
        <span
          className={cn(
            "flex size-7 shrink-0 items-center justify-center rounded-full transition-transform duration-200 group-hover:scale-110",
            increases
              ? "bg-red-500/10 text-red-600 dark:text-red-400"
              : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
          )}
        >
          {increases ? (
            <ArrowUpRight className="size-4" aria-hidden="true" />
          ) : (
            <ArrowDownRight className="size-4" aria-hidden="true" />
          )}
        </span>
      </div>

      <div className="flex min-w-0 items-center justify-between gap-2 text-sm">
        <span
          className={cn(
            "min-w-0 truncate font-medium",
            increases
              ? "text-red-600 dark:text-red-400"
              : "text-emerald-600 dark:text-emerald-400"
          )}
        >
          {increases ? "High Risk Signal" : "Legitimacy Signal"}
        </span>
        <span className="shrink-0 tabular-nums text-xs text-muted-foreground">
          {increases ? "+" : ""}
          {formatted}
        </span>
      </div>

      {/* Subtle direction bar, normalized to the strongest signal */}
      <div className="mt-auto h-1 overflow-hidden rounded-full bg-border/50">
        <div
          className={cn(
            "h-full rounded-full",
            increases
              ? "ml-auto bg-gradient-to-l from-red-500 to-red-400/60"
              : "bg-gradient-to-r from-emerald-500 to-emerald-400/60"
          )}
          style={{ width: `${barWidth}%` }}
          aria-hidden="true"
        />
      </div>
    </motion.li>
  );
});
