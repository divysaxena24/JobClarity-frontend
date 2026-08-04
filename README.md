<div align="center">

# JobClarity Frontend

**Modern AI-powered frontend for JobClarity, an Explainable AI platform that detects fraudulent job postings using Machine Learning.**

![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=flat&logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-06B6D4?style=flat&logo=tailwindcss&logoColor=white)
![Framer Motion](https://img.shields.io/badge/Framer%20Motion-0055FF?style=flat&logo=framer&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat&logo=fastapi&logoColor=white)
![XGBoost](https://img.shields.io/badge/XGBoost-orange?style=flat&logo=xgboost&logoColor=white)
![SHAP](https://img.shields.io/badge/SHAP-Explainable%20AI-512BD4?style=flat&logo=python&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=flat&logo=vercel&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-yellow?style=flat&logo=open-source-initiative&logoColor=white)

**Live Application:** [`https://jobclarity.vercel.app`](https://jobclarity.vercel.app)

</div>

---

## 🔗 Project Links

| Resource | Link |
|----------|------|
| 🌐 Live Application | [https://jobclarity.vercel.app/](https://jobclarity.vercel.app/) |
| 🎨 Frontend Repository | [https://github.com/divysaxena24/JobClarity-frontend](https://github.com/divysaxena24/JobClarity-frontend) |
| ⚙️ Backend Repository | [https://github.com/divysaxena24/JobClarity](https://github.com/divysaxena24/JobClarity) |
| 🚀 Backend API | [https://jobclarity-0tz8.onrender.com](https://jobclarity-0tz8.onrender.com) |
| 📖 Swagger API Docs | [https://jobclarity-0tz8.onrender.com/docs](https://jobclarity-0tz8.onrender.com/docs) |

---

## Table of Contents

- [Project Links](#-project-links)
- [Project Overview](#project-overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Backend](#-backend)
- [Folder Structure](#folder-structure)
- [Local Setup](#local-setup)
- [Deployment](#deployment)
- [Future Improvements](#future-improvements)
- [License](#license)

---

## Project Overview

This repository contains the complete frontend of **JobClarity** — a production-grade SaaS interface for AI-powered fake job detection.

Users can:

- **Paste any job description** and analyze it in seconds
- **Get instant AI fraud analysis** powered by an XGBoost model
- **View fraud probability** with an animated progress indicator
- **View fraud risk score** (0–100) with color-coded severity tiers
- **Understand model decisions** using transparent SHAP explanations
- **Access a fully responsive SaaS-style interface** — from mobile to 4K desktops

The frontend is built with the Next.js App Router, TypeScript, and Tailwind CSS, and talks to the JobClarity FastAPI backend over REST to deliver real-time, explainable predictions.

---

## Features

- **Modern SaaS UI** — premium, Linear/Vercel-grade design language
- **Responsive Design** — mobile-first, fluid grids from 375px to ultra-wide
- **Next.js App Router** — server components, layouts, and modern React 19 patterns
- **TypeScript** — fully typed, zero-`any` codebase
- **Tailwind CSS** — utility-first styling with a custom design-system theme
- **Framer Motion Animations** — tasteful, accessibility-aware motion throughout
- **Axios API Integration** — typed client with friendly error handling
- **Real-time Fraud Analysis** — instant predictions against the live API
- **Fraud Probability** — animated probability bar
- **Fraud Risk Score** — 0–100 risk score with a segmented risk meter
- **SHAP Feature Explanations** — per-feature impact cards with direction & signal labels
- **Interactive Risk Guide** — color-coded Low → Critical reference card
- **Sample Job Descriptions** — one-click demo chips (legitimate & scam examples)
- **Loading & Empty States** — animated ML-pipeline progress & helpful empty state
- **Professional UX** — micro-interactions, hover states, focus rings, and glassmorphism
- **Vercel Deployment** — continuously deployed to production

---

## Tech Stack

| Category | Technology | Purpose |
|---|---|---|
| **Frontend** | [Next.js 16](https://nextjs.org) | React framework (App Router) & SSR |
| | [React](https://react.dev) | UI library |
| | [TypeScript](https://www.typescriptlang.org) | Typed JavaScript |
| | [Tailwind CSS](https://tailwindcss.com) | Utility-first styling |
| | [Framer Motion](https://www.framer.com/motion/) | UI animations |
| | [Axios](https://axios-http.com) | HTTP client for API calls |
| | [Lucide React](https://lucide.dev) | Icon library |
| **Backend** | [FastAPI](https://fastapi.tiangolo.com) | REST API (separate repository) |
| **Machine Learning** | [XGBoost](https://xgboost.readthedocs.io) | Fraud classification model |
| | [SHAP](https://shap.readthedocs.io) | Model explainability |
| **Deployment** | [Vercel](https://vercel.com) | Frontend hosting |

---

## Architecture

```
User
        │
        ▼
Next.js Frontend (Vercel)
        │
Axios REST API
        ▼
FastAPI Backend (Render)
        │
        ▼
XGBoost Model
        │
        ▼
SHAP Explainability
```

The **backend is maintained in a separate repository** ([divysaxena24/JobClarity](https://github.com/divysaxena24/JobClarity)) and deployed independently on Render. This frontend consumes its REST API for predictions and SHAP explanations.

---

## ⚙️ Backend

This frontend communicates with the **JobClarity Backend** through REST APIs.

**Backend Repository**

[https://github.com/divysaxena24/JobClarity](https://github.com/divysaxena24/JobClarity)

**Backend Features**

- **FastAPI** — high-performance async Python REST framework
- **XGBoost Prediction** — tuned classifier over TF-IDF vectorized text
- **SHAP Explainability** — per-prediction feature attributions
- **Docker** — containerized, health-checked deployment
- **Render Deployment** — live at `https://jobclarity-0tz8.onrender.com`

---

## Folder Structure

```
jobclarity-frontend/
├── app/
│   ├── page.tsx            # Landing page (hero + analyzer + report)
│   ├── layout.tsx          # Root layout & metadata
│   └── globals.css         # Global styles / Tailwind theme
├── components/
│   ├── layout/             # Navbar, Hero, HeroBackground, Features, Footer
│   ├── analyzer/           # AnalyzerCard, SampleJobs
│   ├── prediction/         # PredictionDashboard, PredictionSummary, ReasonList,
│   │                       # ProbabilityBar, RiskMeter, ConfidenceRing, RiskBadge,
│   │                       # RiskGuide, FeatureImpactCard, LoadingState, EmptyState
│   └── ui/                 # shadcn/ui primitives (button, card, badge, alert, ...)
├── lib/
│   ├── api/
│   │   └── client.ts       # Typed Axios client with friendly error handling
│   └── utils.ts            # `cn()` class merge helper
├── types/
│   └── prediction.ts       # Prediction request/response types
├── components.json         # shadcn/ui configuration
├── next.config.ts          # Next.js configuration
├── package.json
└── tsconfig.json
```

---

## Local Setup

```bash
# 1. Clone the repository
git clone https://github.com/divysaxena24/JobClarity-frontend.git
cd jobclarity-frontend

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev
```

The frontend is now live at **http://localhost:3000**.

### Environment Variable

The frontend reads the backend URL from `NEXT_PUBLIC_API_BASE_URL`. It defaults to the live Render deployment, so you can point it at a local backend:

```bash
NEXT_PUBLIC_API_BASE_URL=https://jobclarity-0tz8.onrender.com npm run dev
```

For local backend development, use:

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000 npm run dev
```

---

## Deployment

| Layer | Platform | URL |
|---|---|---|
| **Frontend** | [Vercel](https://vercel.com) | [https://jobclarity.vercel.app/](https://jobclarity.vercel.app/) |
| **Backend** | [Render](https://render.com) | [https://jobclarity-0tz8.onrender.com](https://jobclarity-0tz8.onrender.com) |

The frontend and backend are **deployed independently** — the Next.js app runs on Vercel and consumes the FastAPI service on Render over HTTPS.

---

## Future Improvements

- **User Authentication** — accounts, saved analyses, and history
- **Saved Analysis History** — revisit past job descriptions and results
- **PDF Export** — downloadable fraud-analysis reports
- **Dark Mode** — full theme support
- **Transformer-based Models** — BERT/LLM-backed analysis in the UI
- **Batch Analysis** — analyze multiple postings at once
- **Analytics Dashboard** — fraud trends and statistics over time

---

## License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**JobClarity Frontend** — *Detect fake jobs. Restore trust in job hunting.*

</div>
