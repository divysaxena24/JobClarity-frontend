"use client";

import { motion } from "framer-motion";
import { LoaderCircle, ScanSearch, Sparkles } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { SampleJobs } from "@/components/analyzer/SampleJobs";
import { cn } from "@/lib/utils";

interface AnalyzerCardProps {
  value: string;
  onChange: (value: string) => void;
  onAnalyze: () => void;
  onTrySample: () => void;
  loading: boolean;
  activeSample?: string | null;
}

const MAX_CHARS = 4000;

export function AnalyzerCard({
  value,
  onChange,
  onAnalyze,
  onTrySample,
  loading,
  activeSample,
}: AnalyzerCardProps) {
  const empty = value.trim().length === 0;
  const overLimit = value.length > MAX_CHARS;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.25, ease: "easeOut" }}
      className="w-full"
    >
      <div className="relative rounded-3xl border border-border/70 bg-card/80 p-5 shadow-xl shadow-primary/[0.06] ring-1 ring-foreground/[0.03] backdrop-blur-sm transition-shadow duration-300 focus-within:shadow-2xl focus-within:shadow-indigo-500/10 sm:p-6">
        {/* Top accent line */}
        <div
          aria-hidden="true"
          className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent"
        />

        <SampleJobs
          onSelect={(job) => onChange(job.description)}
          disabled={loading}
          activeLabel={activeSample}
        />

        <div className="mt-4">
          <Textarea
            aria-label="Job description"
            aria-describedby="analyzer-char-count"
            placeholder="Paste a job description here…"
            maxLength={MAX_CHARS}
            className={cn(
              "min-h-48 resize-y rounded-2xl border-border/80 bg-background/70 px-4 py-3.5 text-[15px] leading-7 shadow-inner shadow-primary/[0.02] transition-all duration-200 placeholder:opacity-70 placeholder:transition-opacity placeholder:duration-300 focus:placeholder:opacity-30 focus-visible:border-indigo-400/60 focus-visible:bg-background focus-visible:shadow-[0_0_0_4px] focus-visible:shadow-indigo-500/10 dark:focus-visible:border-indigo-400/40 sm:min-h-56",
              overLimit && "border-red-400/60 focus-visible:border-red-400/60"
            )}
            value={value}
            onChange={(e) => onChange((e.target as HTMLTextAreaElement).value)}
          />
          <div
            id="analyzer-char-count"
            className={cn(
              "mt-2 flex items-center justify-between text-xs",
              overLimit
                ? "text-destructive"
                : "text-muted-foreground"
            )}
          >
            <span>{value.length.toLocaleString()} characters</span>
            {overLimit && (
              <span className="font-medium">
                Reduce to {MAX_CHARS.toLocaleString()} characters
              </span>
            )}
          </div>
        </div>

        <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={onTrySample}
            disabled={loading}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-border bg-background px-5 text-sm font-medium text-foreground transition-all duration-200 hover:border-ring/50 hover:bg-muted hover:shadow-sm active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Sparkles className="size-4 text-indigo-500" aria-hidden="true" />
            Try Sample Job
          </button>

          <button
            type="button"
            onClick={onAnalyze}
            disabled={empty || loading}
            aria-label="Analyze job posting for fraud risk"
            className="group relative inline-flex h-12 items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-500 bg-[length:200%_100%] bg-left px-8 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition-all duration-300 hover:bg-right hover:shadow-xl hover:shadow-indigo-500/40 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-left disabled:active:scale-100"
          >
            {loading ? (
              <LoaderCircle
                className="size-5 animate-spin"
                aria-hidden="true"
              />
            ) : (
              <ScanSearch
                className="size-5 transition-transform duration-300 group-hover:scale-110"
                aria-hidden="true"
              />
            )}
            {loading ? "Analyzing…" : "Analyze Job Posting"}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
