"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Brain,
  CheckCircle2,
  Clock,
  Cpu,
  FileText,
  LoaderCircle,
  Radar,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
  { label: "Extracting Linguistic & Metadata Features", icon: Radar },
  { label: "Tokenizing & Normalizing Text Representation", icon: FileText },
  { label: "Evaluating Model Margin via XGBoost Classifier", icon: Cpu },
  { label: "Computing Native TreeSHAP Attributions", icon: Brain },
  { label: "Synthesizing Risk Report & Calibrated Probabilities", icon: Sparkles },
];

const STEP_INTERVAL_MS = 1200;

export function LoadingState() {
  const [activeStep, setActiveStep] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    const stepTimer = setInterval(() => {
      setActiveStep((step) => Math.min(step + 1, STEPS.length - 1));
    }, STEP_INTERVAL_MS);

    const clockTimer = setInterval(() => {
      setElapsedSeconds((sec) => sec + 1);
    }, 1000);

    return () => {
      clearInterval(stepTimer);
      clearInterval(clockTimer);
    };
  }, []);

  const progress = Math.min(
    95,
    Math.round(((activeStep + 1) / STEPS.length) * 85 + (elapsedSeconds > 5 ? 10 : 0))
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      role="status"
      aria-live="polite"
      aria-label="Analyzing job description"
      className="mx-auto mt-8 w-full max-w-3xl space-y-6"
    >
      {/* Primary analysis stepper card */}
      <div className="rounded-3xl border border-border/70 bg-card/80 p-6 shadow-xl shadow-primary/[0.06] backdrop-blur-sm sm:p-8">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <LoaderCircle className="size-5 animate-spin text-indigo-600 dark:text-indigo-400" />
            <p className="text-sm font-semibold tracking-tight text-foreground">
              Analyzing job description…
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-xs tabular-nums text-muted-foreground">
              <Clock className="size-3" />
              {elapsedSeconds}s
            </span>
            <span className="rounded-full bg-indigo-500/10 px-2.5 py-1 text-xs font-medium tabular-nums text-indigo-600 dark:text-indigo-300">
              {progress}%
            </span>
          </div>
        </div>

        {/* Overall progress bar */}
        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-border/60">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500"
            initial={{ width: "12%" }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>

        {/* Extended cold start guidance */}
        {elapsedSeconds >= 6 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mt-4 rounded-xl border border-amber-500/20 bg-amber-500/5 px-3.5 py-2.5 text-xs text-amber-700 dark:text-amber-300"
          >
            Backend instance is waking up from idle cloud state. This initial cold start may take up to 30–45 seconds.
          </motion.div>
        )}

        <ul className="mt-6 flex flex-col gap-3">
          {STEPS.map((step, index) => {
            const state =
              index < activeStep ? "done" : index === activeStep ? "active" : "pending";
            const Icon = step.icon;

            return (
              <li key={step.label} className="flex items-center gap-3">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={state}
                    initial={{ opacity: 0, scale: 0.6 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.6 }}
                    transition={{ duration: 0.2 }}
                    className={cn(
                      "flex size-7 shrink-0 items-center justify-center rounded-full",
                      state === "done" &&
                        "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
                      state === "active" &&
                        "bg-indigo-500/10 text-indigo-600 dark:text-indigo-300",
                      state === "pending" && "bg-muted text-muted-foreground"
                    )}
                  >
                    {state === "done" ? (
                      <CheckCircle2 className="size-4" aria-hidden="true" />
                    ) : state === "active" ? (
                      <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
                    ) : (
                      <Icon className="size-4 opacity-60" aria-hidden="true" />
                    )}
                  </motion.span>
                </AnimatePresence>

                <span
                  className={cn(
                    "text-sm transition-colors duration-300",
                    state === "done" && "text-muted-foreground line-through decoration-muted-foreground/40",
                    state === "active" && "font-medium text-foreground",
                    state === "pending" && "text-muted-foreground/70"
                  )}
                >
                  {step.label}
                </span>

                {state === "active" && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: 1.4, repeat: Infinity }}
                    className="ml-auto text-xs text-muted-foreground"
                  >
                    processing…
                  </motion.span>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      {/* Skeleton preview cards to reinforce visual expectation */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="h-28 animate-pulse rounded-2xl border border-border/50 bg-card/40 p-4">
          <div className="h-4 w-24 rounded bg-muted" />
          <div className="mt-3 h-8 w-16 rounded bg-muted" />
        </div>
        <div className="h-28 animate-pulse rounded-2xl border border-border/50 bg-card/40 p-4">
          <div className="h-4 w-28 rounded bg-muted" />
          <div className="mt-3 h-8 w-20 rounded bg-muted" />
        </div>
        <div className="h-28 animate-pulse rounded-2xl border border-border/50 bg-card/40 p-4">
          <div className="h-4 w-32 rounded bg-muted" />
          <div className="mt-3 h-8 w-24 rounded bg-muted" />
        </div>
      </div>
    </motion.div>
  );
}
