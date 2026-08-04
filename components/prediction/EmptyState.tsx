"use client";

import { motion } from "framer-motion";
import { ScanSearch } from "lucide-react";

export function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="mx-auto mt-8 w-full max-w-2xl rounded-3xl border border-dashed border-border/80 bg-card/40 px-6 py-12 text-center"
    >
      <div className="relative mx-auto flex size-20 items-center justify-center">
        <div
          aria-hidden="true"
          className="absolute inset-0 rounded-3xl bg-gradient-to-br from-indigo-500/15 via-violet-500/10 to-cyan-500/15 blur-md"
        />
        <div className="relative flex size-16 items-center justify-center rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-indigo-500/10 to-violet-500/10 text-indigo-500 dark:text-indigo-300">
          <ScanSearch className="size-8" aria-hidden="true" />
        </div>
      </div>

      <h2 className="mt-5 text-lg font-semibold tracking-tight text-foreground">
        No Analysis Yet
      </h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
        Paste a job description above and let our AI analyze potential fraud
        indicators, calculate a risk score, and explain every prediction.
      </p>

      <div className="mx-auto mt-6 flex max-w-md flex-wrap items-center justify-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
        <span className="rounded-full border border-border/70 bg-background/60 px-2.5 py-1">
          Fraud probability
        </span>
        <span className="rounded-full border border-border/70 bg-background/60 px-2.5 py-1">
          Risk score
        </span>
        <span className="rounded-full border border-border/70 bg-background/60 px-2.5 py-1">
          Top contributing features
        </span>
      </div>
    </motion.div>
  );
}
