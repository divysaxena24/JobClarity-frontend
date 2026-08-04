"use client";

import { cn } from "@/lib/utils";

export interface SampleJob {
  label: string;
  description: string;
}

export const SAMPLE_JOBS: SampleJob[] = [
  {
    label: "Software Engineer (Legitimate)",
    description:
      "We are looking for a passionate Software Engineer to join our product team in Bengaluru. You will build scalable web applications using React and Node.js. 5+ years of experience required. Competitive salary, health insurance, and flexible remote work. Apply at careers@company.com with your resume and portfolio.",
  },
  {
    label: "Python Backend Developer",
    description:
      "Join our data team as a Python Developer. You will design data pipelines, build ML services with FastAPI, and work with PostgreSQL. Strong knowledge of pandas, NumPy, and Docker preferred. Full-time, hybrid work model with a yearly learning budget. Send your GitHub profile to hiring@company.com.",
  },
  {
    label: "Remote Work Scam",
    description:
      "URGENT!! Work from home data entry job. Earn Rs. 50,000 per week with NO experience needed. Just pay a one-time registration fee of Rs. 2,000 to unlock unlimited tasks. Limited slots available, respond immediately to claim your spot before it's gone!",
  },
  {
    label: "Crypto Investment Scam",
    description:
      "Earn 2% daily returns with guaranteed profits! Join our Telegram group and invest in our exclusive crypto trading bot. Minimum investment Rs. 5,000. No risks, no losses, guaranteed payouts within 24 hours. Act fast - promotion ends soon, don't miss this once-in-a-lifetime opportunity!",
  },
  {
    label: "Marketing Executive",
    description:
      "Marketing Manager wanted for a fast-growing SaaS startup. You will own growth campaigns across SEO, paid ads, and social media. 3+ years of marketing experience and an analytical mindset are required. Attractive compensation with performance bonuses. Apply online with your portfolio.",
  },
];

interface SampleJobsProps {
  onSelect: (job: SampleJob) => void;
  disabled?: boolean;
  activeLabel?: string | null;
}

export function SampleJobs({ onSelect, disabled, activeLabel }: SampleJobsProps) {
  return (
    <div
      role="group"
      aria-label="Sample job descriptions"
      className="flex flex-wrap items-center gap-2"
    >
      <span className="text-xs font-medium text-muted-foreground">
        Try a sample:
      </span>
      {SAMPLE_JOBS.map((job) => {
        const active = activeLabel === job.label;
        return (
          <button
            key={job.label}
            type="button"
            onClick={() => onSelect(job)}
            disabled={disabled}
            aria-pressed={active}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs font-medium transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
              active
                ? "border-indigo-500/50 bg-indigo-500/10 text-indigo-700 shadow-sm dark:text-indigo-300"
                : "border-border/80 bg-background/60 text-muted-foreground hover:border-ring/50 hover:text-foreground hover:shadow-sm",
              "disabled:cursor-not-allowed disabled:opacity-50"
            )}
          >
            {job.label}
          </button>
        );
      })}
    </div>
  );
}
