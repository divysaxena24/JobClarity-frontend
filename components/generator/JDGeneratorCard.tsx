"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { AlertCircle, Bot, CheckCircle2, LoaderCircle, Sparkles, Wand2 } from "lucide-react";
import { generateJobDescription } from "@/lib/api/client";
import { cn } from "@/lib/utils";

interface JDGeneratorCardProps {
  onGenerated: (description: string, disclaimer: string) => void;
  disabled?: boolean;
}

export function JDGeneratorCard({ onGenerated, disabled }: JDGeneratorCardProps) {
  const [jobRole, setJobRole] = useState("");
  const [skills, setSkills] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("Mid-level (3-5 years)");
  const [location, setLocation] = useState("Remote");
  const [companyName, setCompanyName] = useState("");
  const [salaryRange, setSalaryRange] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobRole.trim() || !skills.trim() || !experienceLevel.trim() || !location.trim()) {
      setError("Please fill in all required fields (Job Role, Skills, Experience, Location).");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await generateJobDescription({
        job_role: jobRole.trim(),
        skills: skills.trim(),
        experience_level: experienceLevel.trim(),
        location: location.trim(),
        company_name: companyName.trim() || undefined,
        salary_range: salaryRange.trim() || undefined,
      });

      onGenerated(response.generated_job_description, response.disclaimer);
    } catch (err: unknown) {
      const anyErr = err as { message?: string };
      setError(anyErr?.message || "Failed to generate synthetic job description.");
    } finally {
      setLoading(false);
    }
  };

  const handlePreloadExample = () => {
    setJobRole("Senior Full-Stack Engineer");
    setSkills("React, TypeScript, Node.js, PostgreSQL, Docker");
    setExperienceLevel("Senior (5+ years)");
    setLocation("Remote (US/Canada)");
    setCompanyName("TechSphere Solutions");
    setSalaryRange("$130,000 - $160,000 / year");
    setError(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="w-full"
    >
      <form
        onSubmit={handleGenerate}
        className="relative rounded-3xl border border-border/70 bg-card/80 p-5 shadow-xl shadow-primary/[0.06] ring-1 ring-foreground/[0.03] backdrop-blur-sm sm:p-6"
      >
        {/* Accent highlight bar */}
        <div
          aria-hidden="true"
          className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-violet-500/50 to-transparent"
        />

        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-400">
              <Bot className="size-4" />
            </span>
            <div>
              <h2 className="text-base font-semibold text-foreground">
                Synthetic Job Description Generator
              </h2>
              <p className="text-xs text-muted-foreground">
                Configure job parameters to synthesize an editable posting for fraud risk testing.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handlePreloadExample}
            disabled={loading || disabled}
            className="mt-2 inline-flex items-center gap-1.5 self-start text-xs font-medium text-violet-600 hover:text-violet-500 disabled:opacity-50 dark:text-violet-400 sm:mt-0 sm:self-auto"
          >
            <Sparkles className="size-3.5" />
            Fill Example
          </button>
        </div>

        {error && (
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-red-500/25 bg-red-500/10 p-3 text-xs text-red-600 dark:text-red-400">
            <AlertCircle className="size-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Job Role */}
          <div>
            <label className="block text-xs font-medium text-foreground">
              Job Role / Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={jobRole}
              onChange={(e) => setJobRole(e.target.value)}
              placeholder="e.g. Senior Backend Engineer"
              disabled={loading || disabled}
              className="mt-1.5 w-full rounded-xl border border-border/80 bg-background/70 px-3.5 py-2.5 text-sm text-foreground shadow-inner placeholder:text-muted-foreground/60 focus:border-violet-500/60 focus:outline-none focus:ring-2 focus:ring-violet-500/20 disabled:opacity-50"
            />
          </div>

          {/* Experience Level */}
          <div>
            <label className="block text-xs font-medium text-foreground">
              Experience Level <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={experienceLevel}
              onChange={(e) => setExperienceLevel(e.target.value)}
              placeholder="e.g. 4+ years, Senior, Mid-level"
              disabled={loading || disabled}
              className="mt-1.5 w-full rounded-xl border border-border/80 bg-background/70 px-3.5 py-2.5 text-sm text-foreground shadow-inner placeholder:text-muted-foreground/60 focus:border-violet-500/60 focus:outline-none focus:ring-2 focus:ring-violet-500/20 disabled:opacity-50"
            />
          </div>

          {/* Skills */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-foreground">
              Key Skills & Competencies <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              placeholder="e.g. Python, FastAPI, Docker, PostgreSQL, Kubernetes"
              disabled={loading || disabled}
              className="mt-1.5 w-full rounded-xl border border-border/80 bg-background/70 px-3.5 py-2.5 text-sm text-foreground shadow-inner placeholder:text-muted-foreground/60 focus:border-violet-500/60 focus:outline-none focus:ring-2 focus:ring-violet-500/20 disabled:opacity-50"
            />
          </div>

          {/* Location */}
          <div>
            <label className="block text-xs font-medium text-foreground">
              Location / Mode <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Remote, Hybrid, San Francisco, CA"
              disabled={loading || disabled}
              className="mt-1.5 w-full rounded-xl border border-border/80 bg-background/70 px-3.5 py-2.5 text-sm text-foreground shadow-inner placeholder:text-muted-foreground/60 focus:border-violet-500/60 focus:outline-none focus:ring-2 focus:ring-violet-500/20 disabled:opacity-50"
            />
          </div>

          {/* Company Name (optional) */}
          <div>
            <label className="block text-xs font-medium text-foreground">
              Company Name <span className="text-xs text-muted-foreground">(Optional)</span>
            </label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="e.g. Acme Tech Labs"
              disabled={loading || disabled}
              className="mt-1.5 w-full rounded-xl border border-border/80 bg-background/70 px-3.5 py-2.5 text-sm text-foreground shadow-inner placeholder:text-muted-foreground/60 focus:border-violet-500/60 focus:outline-none focus:ring-2 focus:ring-violet-500/20 disabled:opacity-50"
            />
          </div>

          {/* Salary Range (optional) */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-foreground">
              Compensation / Salary Range <span className="text-xs text-muted-foreground">(Optional)</span>
            </label>
            <input
              type="text"
              value={salaryRange}
              onChange={(e) => setSalaryRange(e.target.value)}
              placeholder="e.g. $120,000 - $145,000 + equity"
              disabled={loading || disabled}
              className="mt-1.5 w-full rounded-xl border border-border/80 bg-background/70 px-3.5 py-2.5 text-sm text-foreground shadow-inner placeholder:text-muted-foreground/60 focus:border-violet-500/60 focus:outline-none focus:ring-2 focus:ring-violet-500/20 disabled:opacity-50"
            />
          </div>
        </div>

        {/* Safety Disclaimer Banner */}
        <div className="mt-4 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-xs leading-5 text-amber-800 dark:text-amber-300">
          <p className="font-medium">Model Safety & Governance Notice:</p>
          <p className="mt-0.5 opacity-90">
            Predictions generated by JobClarity are statistical risk estimates based on text patterns, not proof of fraud or employer verification.
          </p>
        </div>

        {/* Action Button */}
        <div className="mt-5 flex justify-end">
          <button
            type="submit"
            disabled={loading || disabled}
            className="group relative inline-flex h-12 w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-violet-600 bg-[length:200%_100%] bg-left px-7 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition-all duration-300 hover:bg-right hover:shadow-xl hover:shadow-violet-500/35 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            {loading ? (
              <LoaderCircle className="size-5 animate-spin" aria-hidden="true" />
            ) : (
              <Wand2 className="size-5 transition-transform duration-300 group-hover:scale-110" aria-hidden="true" />
            )}
            {loading ? "Generating Description…" : "Generate Job Description"}
          </button>
        </div>
      </form>
    </motion.div>
  );
}
