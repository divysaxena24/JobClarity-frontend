export interface ModerationAction {
  label: string;
  color: string;
}

export function getVerdictTitle(riskScore: number, isFake: boolean): string {
  if (riskScore >= 50 || isFake) {
    return "High Risk — Verify Before Applying";
  }
  if (riskScore >= 25) {
    return "Elevated Risk — Caution Advised";
  }
  return "Likely Legitimate";
}

export function getVerdictDescription(riskScore: number, isFake: boolean): string {
  if (riskScore >= 50 || isFake) {
    return "Significant deceptive signals, vocabulary anomalies, or scam patterns detected.";
  }
  if (riskScore >= 25) {
    return "Moderate anomalous language patterns detected. Further independent employer verification is recommended.";
  }
  return "Standard professional terminology, typical responsibilities, and standard corporate patterns.";
}

export function getModerationAction(riskScore: number, isFake: boolean): ModerationAction {
  if (isFake) {
    if (riskScore >= 75) {
      return {
        label: "IMMEDIATE BLOCK",
        color: "text-red-600 bg-red-500/10 border-red-500/30 dark:text-red-400",
      };
    }
    return {
      label: "FLAG FOR REVIEW",
      color: "text-amber-600 bg-amber-500/10 border-amber-500/30 dark:text-amber-400",
    };
  }
  return {
    label: "SAFE TO PASS",
    color: "text-emerald-600 bg-emerald-500/10 border-emerald-500/30 dark:text-emerald-400",
  };
}

