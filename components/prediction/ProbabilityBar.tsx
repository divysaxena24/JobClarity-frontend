"use client";

import { motion } from "framer-motion";
import { Percent } from "lucide-react";
import { cn } from "@/lib/utils";

function probabilityGradient(value: number): string {
  if (value < 35) return "from-emerald-500 to-lime-400";
  if (value < 65) return "from-amber-500 to-orange-400";
  return "from-orange-500 to-red-500";
}

interface ProbabilityBarProps {
  value: number; // 0–100
  label?: string;
}

export function ProbabilityBar({ value, label = "Fraud Probability" }: ProbabilityBarProps) {
  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <Percent className="size-3.5" aria-hidden="true" />
          {label}
        </span>
        <span className="text-lg font-semibold tabular-nums text-foreground">
          {Math.round(value)}%
        </span>
      </div>
      <div
        className="mt-2.5 h-2 overflow-hidden rounded-full bg-border/60"
        role="progressbar"
        aria-label={label}
        aria-valuenow={Math.round(value)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <motion.div
          className={cn(
            "h-full rounded-full bg-gradient-to-r",
            probabilityGradient(value)
          )}
          initial={{ width: 0 }}
          animate={{ width: `${Math.max(value, 3)}%` }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
        />
      </div>
    </div>
  );
}
