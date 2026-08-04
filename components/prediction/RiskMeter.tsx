"use client";

import { motion } from "framer-motion";
import { Gauge } from "lucide-react";
import { cn } from "@/lib/utils";

const LEVEL_COLORS: Record<string, string> = {
  Low: "from-emerald-500 to-lime-400",
  Medium: "from-amber-500 to-yellow-400",
  High: "from-orange-500 to-red-400",
  Critical: "from-red-600 to-rose-500",
};

const LEVEL_TEXT: Record<string, string> = {
  Low: "text-emerald-600 dark:text-emerald-400",
  Medium: "text-amber-600 dark:text-amber-400",
  High: "text-orange-600 dark:text-orange-400",
  Critical: "text-red-600 dark:text-red-400",
};

const SEGMENTS = [25, 50, 75];

interface RiskMeterProps {
  value: number; // 0–100
  level: string;
}

export function RiskMeter({ value, level }: RiskMeterProps) {
  const safeLevel = LEVEL_COLORS[level] ? level : "Low";
  const clamped = Math.min(Math.max(value, 0), 100);

  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <Gauge className="size-3.5" aria-hidden="true" />
          Fraud Risk Score
        </span>
        <span className="text-lg font-semibold tabular-nums text-foreground">
          {Math.round(clamped)}
          <span className="text-sm font-normal text-muted-foreground">/100</span>
        </span>
      </div>
      <div
        className="relative mt-2.5 h-2.5 overflow-visible rounded-full bg-border/60"
        role="progressbar"
        aria-label="Fraud risk score"
        aria-valuenow={Math.round(clamped)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <motion.div
          className={cn("h-full rounded-full bg-gradient-to-r", LEVEL_COLORS[safeLevel])}
          initial={{ width: 0 }}
          animate={{ width: `${Math.max(clamped, 3)}%` }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
        />
        {/* Segment ticks */}
        {SEGMENTS.map((segment) => (
          <span
            key={segment}
            aria-hidden="true"
            className="absolute top-1/2 h-3.5 w-px -translate-y-1/2 bg-foreground/25"
            style={{ left: `${segment}%` }}
          />
        ))}
      </div>
      <div className="mt-2 flex items-center justify-between text-[11px] font-medium text-muted-foreground">
        <span>Low</span>
        <span className={cn("rounded-full px-2 py-0.5 text-xs font-semibold", LEVEL_TEXT[safeLevel], "bg-foreground/[0.04]")}>
          {level || safeLevel}
        </span>
        <span>Critical</span>
      </div>
    </div>
  );
}
