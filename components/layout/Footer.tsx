import Link from "next/link";
import { Shield } from "lucide-react";

const STACK = ["FastAPI", "Next.js", "Docker", "XGBoost", "SHAP"];

const GITHUB_URL = "https://github.com/divysaxena24/JobClarity";

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56 0-.28-.01-1.02-.02-2-3.2.7-3.88-1.54-3.88-1.54-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.03 1.76 2.7 1.25 3.35.96.1-.75.4-1.25.72-1.54-2.55-.29-5.23-1.28-5.23-5.68 0-1.26.45-2.28 1.18-3.09-.12-.29-.51-1.46.11-3.05 0 0 .96-.31 3.15 1.18a10.9 10.9 0 0 1 5.74 0c2.19-1.49 3.15-1.18 3.15-1.18.62 1.59.23 2.76.11 3.05.73.81 1.18 1.83 1.18 3.09 0 4.41-2.69 5.38-5.25 5.67.41.35.78 1.05.78 2.12 0 1.53-.01 2.76-.01 3.14 0 .31.2.67.8.56A11.51 11.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
    </svg>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-border/60 bg-background">
      <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <div className="flex flex-col items-center gap-2 md:items-start">
            <Link href="/" className="group flex items-center gap-2.5" aria-label="JobClarity home">
              <span className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 text-white shadow-sm transition-transform duration-200 group-hover:scale-105">
                <Shield className="size-4" aria-hidden="true" />
              </span>
              <span className="text-sm font-semibold tracking-tight text-foreground">
                JobClarity
              </span>
            </Link>
            <p className="text-xs text-muted-foreground">
              Powered by Machine Learning &amp; Explainable AI.
            </p>
          </div>

          <ul
            aria-label="Technology stack"
            className="flex flex-wrap items-center justify-center gap-2"
          >
            {STACK.map((tech) => (
              <li
                key={tech}
                className="rounded-full border border-border/70 bg-muted/40 px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:border-ring/40 hover:text-foreground"
              >
                {tech}
              </li>
            ))}
          </ul>

          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-muted/40 px-3.5 py-1.5 text-xs font-medium text-muted-foreground transition-all duration-200 hover:border-ring/40 hover:text-foreground hover:shadow-sm"
          >
            <GithubIcon className="size-3.5" />
            Source on GitHub
          </a>
        </div>

        <div className="mt-8 border-t border-border/50 pt-6 text-center text-xs text-muted-foreground">
          <p>
            © {new Date().getFullYear()} JobClarity. Built with Machine Learning
            &amp; Explainable AI.
          </p>
        </div>
      </div>
    </footer>
  );
}
