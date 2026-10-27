"use client";

import { useCallback, useRef, useState } from "react";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import { ArrowLeft, Bot, CircleAlert, FileText, Sparkles } from "lucide-react";
import { predictJob } from "@/lib/api/client";
import { HeroBackground } from "@/components/layout/HeroBackground";
import { AnalyzerCard } from "@/components/analyzer/AnalyzerCard";
import { JDGeneratorCard } from "@/components/generator/JDGeneratorCard";
import { SAMPLE_JOBS } from "@/components/analyzer/SampleJobs";
import { EmptyState } from "@/components/prediction/EmptyState";
import { LoadingState } from "@/components/prediction/LoadingState";
import { PredictionDashboard } from "@/components/prediction/PredictionDashboard";
import type { PredictionResponse } from "@/types/prediction";
import { cn } from "@/lib/utils";

const container: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
};

const item: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  },
};

export default function Hero() {
  const [mode, setMode] = useState<"manual" | "generate">("manual");
  const [jobDescription, setJobDescription] = useState("");
  const [isAiGenerated, setIsAiGenerated] = useState(false);
  const [generatorDisclaimer, setGeneratorDisclaimer] = useState<string | null>(null);
  const [generatorStep, setGeneratorStep] = useState<"form" | "preview">("form");

  const [prediction, setPrediction] = useState<PredictionResponse | null>(null);
  const [predictionKey, setPredictionKey] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeSample, setActiveSample] = useState<string | null>(null);
  const sampleIndex = useRef(0);

  const handleAnalyze = useCallback(async () => {
    if (loading || jobDescription.trim().length === 0) return;
    setLoading(true);
    setError(null);
    try {
      const resp = await predictJob(jobDescription);
      setPrediction(resp);
      setPredictionKey((k) => k + 1);
    } catch (err: unknown) {
      const anyErr = err as { message?: string; response?: { data?: { message?: string } } };
      const msg =
        anyErr?.response?.data?.message || anyErr?.message || "An unknown error occurred";
      setError(String(msg));
    } finally {
      setLoading(false);
    }
  }, [jobDescription, loading]);

  const handleTrySample = useCallback(() => {
    const job = SAMPLE_JOBS[sampleIndex.current % SAMPLE_JOBS.length];
    sampleIndex.current += 1;
    setJobDescription(job.description);
    setActiveSample(job.label);
    setIsAiGenerated(false);
    setGeneratorDisclaimer(null);
    setError(null);
  }, []);

  const handleGeneratedJD = useCallback((description: string, disclaimer: string) => {
    setJobDescription(description);
    setIsAiGenerated(true);
    setGeneratorDisclaimer(disclaimer);
    setGeneratorStep("preview");
    setError(null);
  }, []);

  return (
    <section className="relative isolate overflow-hidden" id="analyzer">
      <HeroBackground />

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="mx-auto flex w-full max-w-5xl flex-col items-center px-4 py-16 sm:px-6 sm:py-20 lg:py-24"
      >
        {/* Eyebrow badge */}
        <motion.div
          variants={item}
          className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/70 px-3.5 py-1.5 text-xs font-medium text-muted-foreground shadow-sm backdrop-blur"
        >
          <span className="relative flex size-2" aria-hidden="true">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-60" />
            <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
          </span>
          AI-powered fraud detection & synthetic JD evaluation
          <Sparkles className="size-3.5 text-indigo-500" aria-hidden="true" />
        </motion.div>

        {/* Headline */}
        <motion.h1
          variants={item}
          className="mt-6 max-w-3xl text-balance text-center text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl lg:text-[3.4rem]"
        >
          Detect Fake Job Postings{" "}
          <span className="bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 bg-clip-text text-transparent">
            with AI
          </span>
        </motion.h1>

        <motion.p
          variants={item}
          className="mt-5 max-w-2xl text-balance text-center text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8"
        >
          Analyze any job posting in seconds using Machine Learning and Explainable AI.
          Paste an existing listing or synthesize an editable job description to test model resilience.
        </motion.p>

        {/* Workflow Mode Tabs */}
        <motion.div variants={item} className="mt-8 flex rounded-2xl border border-border/80 bg-background/80 p-1 shadow-sm backdrop-blur">
          <button
            type="button"
            onClick={() => {
              setMode("manual");
              setError(null);
            }}
            className={cn(
              "flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-medium transition-all sm:text-sm",
              mode === "manual"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <FileText className="size-3.5" />
            Manual Paste
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("generate");
              setError(null);
            }}
            className={cn(
              "flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-medium transition-all sm:text-sm",
              mode === "generate"
                ? "bg-violet-600 text-white shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Bot className="size-3.5" />
            Generate &amp; Analyze (AI)
          </button>
        </motion.div>

        {/* Analyzer / Generator Cards */}
        <div className="mt-6 w-full max-w-2xl">
          {mode === "generate" && generatorStep === "form" ? (
            <JDGeneratorCard onGenerated={handleGeneratedJD} disabled={loading} />
          ) : (
            <div>
              {mode === "generate" && generatorStep === "preview" && (
                <div className="mb-4 flex flex-col gap-2 rounded-2xl border border-violet-500/30 bg-violet-500/10 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-500/40 bg-violet-500/20 px-2.5 py-0.5 text-xs font-semibold text-violet-700 dark:text-violet-300">
                      <Sparkles className="size-3" />
                      AI-Generated Synthetic Content
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Editable before analysis
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setGeneratorStep("form")}
                    className="inline-flex items-center gap-1 text-xs font-medium text-violet-700 underline-offset-4 hover:underline dark:text-violet-300"
                  >
                    <ArrowLeft className="size-3" />
                    Back to Generator Form
                  </button>
                </div>
              )}

              {/* Model Risk Disclaimer Banner */}
              {isAiGenerated && (
                <div className="mb-4 rounded-xl border border-amber-500/25 bg-amber-500/10 px-4 py-2.5 text-xs leading-5 text-amber-800 dark:text-amber-300">
                  <p className="font-semibold">Trust &amp; Safety Disclaimer:</p>
                  <p className="mt-0.5 opacity-90">
                    {generatorDisclaimer ||
                      "Model predictions are statistical risk estimates based on text patterns, not conclusive proof of fraud or employer verification."}
                  </p>
                </div>
              )}

              <AnalyzerCard
                value={jobDescription}
                onChange={(value) => {
                  setJobDescription(value);
                  setError(null);
                }}
                onAnalyze={handleAnalyze}
                onTrySample={handleTrySample}
                loading={loading}
                activeSample={activeSample}
              />
            </div>
          )}
        </div>

        {/* Error alert */}
        <AnimatePresence>
          {error ? (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              role="alert"
              className="mt-6 w-full max-w-2xl"
            >
              <div className="flex items-start gap-3 rounded-2xl border border-red-500/30 bg-red-500/5 px-4 py-3.5 text-sm">
                <CircleAlert
                  className="mt-0.5 size-4.5 shrink-0 text-red-600 dark:text-red-400"
                  aria-hidden="true"
                />
                <div>
                  <p className="font-medium text-red-700 dark:text-red-300">
                    Could not analyze this posting
                  </p>
                  <p className="mt-0.5 text-red-600/90 dark:text-red-400/90">{error}</p>
                </div>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>

        {/* Results */}
        <div className="w-full" aria-live="polite">
          <AnimatePresence mode="wait">
            {loading ? (
              <LoadingState key="loading" />
            ) : prediction ? (
              <PredictionDashboard key={`prediction-${predictionKey}`} prediction={prediction} />
            ) : (
              <EmptyState key="empty" />
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </section>
  );
}
