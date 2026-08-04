"use client";

import { motion } from "framer-motion";
import { BadgeCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConfidenceRingProps {
  value: number; // 0–100
  label?: string;
  className?: string;
}

const RADIUS = 34;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function ConfidenceRing({
  value,
  label = "Confidence",
  className,
}: ConfidenceRingProps) {
  const clamped = Math.min(Math.max(value, 0), 100);
  const targetOffset = CIRCUMFERENCE * (1 - clamped / 100);

  return (
    <div className={cn("flex flex-col items-center", className)}>
      <div className="relative size-[104px]">
        <svg
          className="size-full -rotate-90"
          viewBox="0 0 80 80"
          role="progressbar"
          aria-label={label}
          aria-valuenow={Math.round(clamped)}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <defs>
            <linearGradient id="confidence-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="55%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#22d3ee" />
            </linearGradient>
          </defs>
          <circle
            cx="40"
            cy="40"
            r={RADIUS}
            fill="none"
            strokeWidth="7"
            className="stroke-border/70"
          />
          <motion.circle
            cx="40"
            cy="40"
            r={RADIUS}
            fill="none"
            strokeWidth="7"
            strokeLinecap="round"
            stroke="url(#confidence-gradient)"
            strokeDasharray={CIRCUMFERENCE}
            initial={{ strokeDashoffset: CIRCUMFERENCE }}
            animate={{ strokeDashoffset: targetOffset }}
            transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1], delay: 0.35 }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-bold tabular-nums text-foreground">
            {Math.round(clamped)}%
          </span>
        </div>
      </div>
      <span className="mt-1.5 flex items-center gap-1 text-xs font-medium text-muted-foreground">
        <BadgeCheck className="size-3.5 text-indigo-500" aria-hidden="true" />
        {label}
      </span>
    </div>
  );
}
