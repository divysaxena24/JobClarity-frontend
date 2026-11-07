import { jsPDF } from "jspdf";
import type { PredictionResponse, TopReason } from "@/types/prediction";

export interface PDFReportOptions {
  prediction: PredictionResponse;
  jobDescription: string;
}

/**
 * Format a number as a signed 4-decimal string.
 */
export function formatImpact(val: number): string {
  const formatted = Math.abs(val).toFixed(4);
  return val > 0 ? `+${formatted}` : `-${formatted}`;
}

/**
 * Get calibrated, trust-centered verdict metadata.
 * Strictly adheres to non-absolute, non-causal terminology.
 */
export function getVerdictMetadata(prediction: PredictionResponse) {
  const riskScore = prediction.fraud_risk_score;
  const isFake = prediction.prediction === "Fake";

  if (isFake || riskScore >= 50) {
    return {
      title: "High Risk — Verify Before Applying",
      subtitle:
        "Strong anomalous linguistic and structural signals detected that correlate with deceptive job postings.",
      badgeText: "High Risk Alert",
      themeColor: [220, 38, 38] as [number, number, number], // Red 600
      bgFill: [254, 242, 242] as [number, number, number], // Red 50
      borderColor: [248, 113, 113] as [number, number, number], // Red 400
    };
  }

  if (riskScore >= 25) {
    return {
      title: "Elevated Risk — Caution Advised",
      subtitle:
        "Moderate anomalous language patterns detected. Further independent employer verification is recommended.",
      badgeText: "Elevated Risk Notice",
      themeColor: [217, 119, 6] as [number, number, number], // Amber 600
      bgFill: [255, 251, 235] as [number, number, number], // Amber 50
      borderColor: [252, 211, 77] as [number, number, number], // Amber 300
    };
  }

  return {
    title: "Likely Legitimate",
    subtitle:
      "Vocabulary and structural patterns consistent with standard authentic employment postings.",
    badgeText: "Low Risk Pattern",
    themeColor: [16, 185, 129] as [number, number, number], // Emerald 500
    bgFill: [236, 253, 245] as [number, number, number], // Emerald 50
    borderColor: [110, 231, 183] as [number, number, number], // Emerald 300
  };
}

/**
 * Generate a professional, multi-page PDF risk assessment report.
 * Executed 100% client-side without external network calls.
 */
export function generatePredictionReportPDF({
  prediction,
  jobDescription,
}: PDFReportOptions): jsPDF {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 15;
  const contentWidth = pageWidth - margin * 2; // 180mm
  const bottomLimit = pageHeight - 20; // Leave 20mm for footer

  let y = 18;

  const checkPageBreak = (neededHeight: number): boolean => {
    if (y + neededHeight > bottomLimit) {
      doc.addPage();
      y = 22; // Top margin on subsequent pages
      return true;
    }
    return false;
  };

  // ---------------------------------------------------------------------------
  // 1. Header & Brand Block
  // ---------------------------------------------------------------------------
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(15, 23, 42); // Slate 900
  doc.text("JobClarity", margin, y);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(79, 70, 229); // Indigo 600
  doc.text("AI-POWERED EMPLOYMENT TRUST & RISK AUDIT", margin + 35, y - 0.5);

  const reportDate = new Date();
  const formattedDate = reportDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  });

  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139); // Slate 500
  doc.text(`Generated: ${formattedDate}`, pageWidth - margin, y - 1, { align: "right" });
  doc.text("Report ID: JC-" + Math.abs(prediction.fraud_risk_score * 31 + reportDate.getTime() % 100000), pageWidth - margin, y + 3, { align: "right" });

  y += 7;
  doc.setDrawColor(226, 232, 240); // Slate 200
  doc.setLineWidth(0.6);
  doc.line(margin, y, margin + contentWidth, y);

  // Decorative accent line
  doc.setDrawColor(79, 70, 229); // Indigo
  doc.setLineWidth(1.2);
  doc.line(margin, y, margin + 45, y);

  y += 6;

  // ---------------------------------------------------------------------------
  // 2. Executive Assessment Verdict Card
  // ---------------------------------------------------------------------------
  const verdict = getVerdictMetadata(prediction);
  const verdictCardHeight = 26;

  checkPageBreak(verdictCardHeight);

  // Background banner
  doc.setFillColor(...verdict.bgFill);
  doc.setDrawColor(...verdict.borderColor);
  doc.setLineWidth(0.6);
  doc.roundedRect(margin, y, contentWidth, verdictCardHeight, 3, 3, "FD");

  // Status Badge Indicator
  doc.setFillColor(...verdict.themeColor);
  doc.roundedRect(margin + 4, y + 4, 3, verdictCardHeight - 8, 1, 1, "F");

  // Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(...verdict.themeColor);
  doc.text(verdict.title, margin + 11, y + 9);

  // Subtitle / Description
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105); // Slate 600
  const splitSub = doc.splitTextToSize(verdict.subtitle, contentWidth - 18);
  doc.text(splitSub, margin + 11, y + 16);

  y += verdictCardHeight + 5;

  // ---------------------------------------------------------------------------
  // 3. Quantitative Risk & Model Metrics (4 Columns)
  // ---------------------------------------------------------------------------
  const metricsBoxHeight = 18;
  const colWidth = (contentWidth - 9) / 4; // 4 columns with 3mm gap

  checkPageBreak(metricsBoxHeight);

  const metrics = [
    {
      label: "FRAUD RISK SCORE",
      value: `${prediction.fraud_risk_score} / 100`,
      hint: "Normalized Risk Index",
      color: verdict.themeColor,
    },
    {
      label: "FRAUD PROBABILITY",
      value: `${(prediction.fraud_probability * 100).toFixed(2)}%`,
      hint: "Model Output Margin",
      color: [15, 23, 42] as [number, number, number],
    },
    {
      label: "RISK LEVEL TIER",
      value: prediction.risk_level || "Standard",
      hint: "Decision Boundary",
      color: [15, 23, 42] as [number, number, number],
    },
    {
      label: "MODEL VERSION",
      value: `v${prediction.model_version || "1.0.0"}`,
      hint: "XGBoost + TF-IDF",
      color: [79, 70, 229] as [number, number, number],
    },
  ];

  metrics.forEach((m, idx) => {
    const colX = margin + idx * (colWidth + 3);

    doc.setFillColor(248, 250, 252); // Slate 50
    doc.setDrawColor(226, 232, 240); // Slate 200
    doc.setLineWidth(0.4);
    doc.roundedRect(colX, y, colWidth, metricsBoxHeight, 2, 2, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139);
    doc.text(m.label, colX + 3.5, y + 5);

    doc.setFontSize(10.5);
    doc.setTextColor(...m.color);
    doc.text(m.value, colX + 3.5, y + 11);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(148, 163, 184);
    doc.text(m.hint, colX + 3.5, y + 15);
  });

  y += metricsBoxHeight + 7;

  // ---------------------------------------------------------------------------
  // 4. Feature Attributions Section (TreeSHAP)
  // ---------------------------------------------------------------------------
  checkPageBreak(40);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text("1. Model Feature Attributions (TreeSHAP)", margin, y);

  y += 4.5;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(
    "Additive log-odds marginal contributions calculated by the trained XGBoost decision tree ensemble.",
    margin,
    y
  );

  y += 5;

  // Explanation Legend Callout
  const legendHeight = 11;
  doc.setFillColor(241, 245, 249); // Slate 100
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, y, contentWidth, legendHeight, 1.5, 1.5, "FD");

  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(220, 38, 38);
  doc.text("Positive Impact (+):", margin + 3, y + 4.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(71, 85, 105);
  doc.text("Increases predicted fraud risk", margin + 28, y + 4.5);

  doc.setFont("helvetica", "bold");
  doc.setTextColor(16, 185, 129);
  doc.text("Negative Impact (-):", margin + 75, y + 4.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(71, 85, 105);
  doc.text("Pulls prediction toward legitimacy", margin + 101, y + 4.5);

  doc.setTextColor(148, 163, 184);
  doc.text(
    "* Features reflect statistical correlations across training corpus, not causal proof of employer intent.",
    margin + 3,
    y + 8.5
  );

  y += legendHeight + 4;

  // Features Table Header
  const tableHeaderHeight = 6.5;
  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(203, 213, 225);
  doc.rect(margin, y, contentWidth, tableHeaderHeight, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(71, 85, 105);
  doc.text("RANK", margin + 3, y + 4.2);
  doc.text("FEATURE / VOCABULARY PHRASE", margin + 18, y + 4.2);
  doc.text("SHAP VALUE", margin + 105, y + 4.2);
  doc.text("EFFECT ON PREDICTION", margin + 135, y + 4.2);

  y += tableHeaderHeight;

  const reasons: TopReason[] = prediction.top_reasons || [];

  if (reasons.length === 0) {
    checkPageBreak(10);
    doc.rect(margin, y, contentWidth, 8, "D");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text(
      "No significant localized feature attributions were extracted for this posting.",
      margin + 4,
      y + 5
    );
    y += 10;
  } else {
    reasons.forEach((r, idx) => {
      const rowHeight = 6.5;
      checkPageBreak(rowHeight);

      // Alternating row background
      if (idx % 2 === 1) {
        doc.setFillColor(248, 250, 252);
        doc.rect(margin, y, contentWidth, rowHeight, "F");
      }
      doc.setDrawColor(226, 232, 240);
      doc.line(margin, y + rowHeight, margin + contentWidth, y + rowHeight);

      const isPositive = r.impact > 0;

      // Rank
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      doc.text(`#${idx + 1}`, margin + 3, y + 4.3);

      // Feature Name
      doc.setFont("courier", "bold");
      doc.setFontSize(8);
      doc.setTextColor(15, 23, 42);
      const featText = doc.splitTextToSize(r.feature, 82)[0];
      doc.text(featText, margin + 18, y + 4.3);

      // Impact
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.5);
      if (isPositive) {
        doc.setTextColor(220, 38, 38);
      } else {
        doc.setTextColor(16, 185, 129);
      }
      doc.text(formatImpact(r.impact), margin + 105, y + 4.3);

      // Direction Effect
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.text(
        isPositive ? "Increases fraud risk (+)" : "Decreases fraud risk (-)",
        margin + 135,
        y + 4.3
      );

      y += rowHeight;
    });
  }

  y += 8;

  // ---------------------------------------------------------------------------
  // 5. Original Analyzed Job Description (Preserved & Paginated)
  // ---------------------------------------------------------------------------
  checkPageBreak(35);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text("2. Analyzed Job Description Text", margin, y);

  y += 4.5;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(
    "Unmodified text provided for automated analysis. Formatting and spacing preserved.",
    margin,
    y
  );

  y += 5;

  const rawDescription = jobDescription || "No job description content recorded.";
  const paragraphs = rawDescription.split(/\r?\n/);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85); // Slate 700
  const lineHeight = 4.1;

  paragraphs.forEach((para) => {
    // If paragraph is empty line (line break)
    if (para.trim().length === 0) {
      checkPageBreak(lineHeight);
      y += lineHeight * 0.75;
      return;
    }

    const splitLines = doc.splitTextToSize(para, contentWidth - 8);
    splitLines.forEach((line: string) => {
      checkPageBreak(lineHeight);
      // Small decorative left border indicating quote
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.4);
      doc.line(margin + 2, y - 2.5, margin + 2, y + 1.5);

      doc.text(line, margin + 6, y);
      y += lineHeight;
    });
  });

  y += 8;

  // ---------------------------------------------------------------------------
  // 6. Methodology & Limitations Notice
  // ---------------------------------------------------------------------------
  const noticeHeight = 28;
  checkPageBreak(noticeHeight + 4);

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, y, contentWidth, noticeHeight, 2, 2, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.text("IMPORTANT NOTICE & METHODOLOGY DISCLAIMER", margin + 4, y + 4.5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.setTextColor(71, 85, 105);

  const noticeLines = [
    "• Statistical, Not Causal: TreeSHAP attributions represent mathematical correlations within the trained model dataset and do not constitute legal proof of employer intent.",
    "• Model Vocabulary Absence: Features listed that are not visible in the text reflect baseline tree evaluations (e.g., absence of expected legitimate terms).",
    "• Automated Screening: This assessment is an automated AI decision-support aid. Job seekers must conduct independent due diligence and verify employer credentials.",
    "• Security Best Practice: Never wire funds, cash unverified checks, purchase equipment upfront, or disclose sensitive banking passwords during job applications.",
  ];

  noticeLines.forEach((nLine, idx) => {
    doc.text(nLine, margin + 4, y + 9 + idx * 4.2);
  });

  // ---------------------------------------------------------------------------
  // 7. Running Headers & Footers (Rendered on Every Page)
  // ---------------------------------------------------------------------------
  const totalPages = doc.getNumberOfPages();

  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);

    // Running Header on pages > 1
    if (i > 1) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184);
      doc.text("JobClarity AI — Employment Risk Assessment Report", margin, 12);
      doc.text(`ID: JC-${prediction.fraud_risk_score}`, pageWidth - margin, 12, {
        align: "right",
      });

      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.4);
      doc.line(margin, 14, margin + contentWidth, 14);
    }

    // Running Footer on every page
    const footerY = 287;
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.4);
    doc.line(margin, footerY - 3, margin + contentWidth, footerY - 3);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text("JobClarity AI Security & Compliance Report — Confidential", margin, footerY);

    doc.setFont("helvetica", "bold");
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin, footerY, {
      align: "right",
    });
  }

  return doc;
}

/**
 * Convenience helper to generate and trigger instant browser download.
 */
export function exportPredictionReportPDF(options: PDFReportOptions): void {
  const doc = generatePredictionReportPDF(options);
  const verdictLabel = options.prediction.prediction === "Fake" ? "HighRisk" : "LikelyLegitimate";
  const dateStr = new Date().toISOString().slice(0, 10);
  const filename = `JobClarity_Risk_Report_${verdictLabel}_${dateStr}.pdf`;
  doc.save(filename);
}
