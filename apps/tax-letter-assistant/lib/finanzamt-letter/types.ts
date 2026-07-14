export interface AnalysisResult {
  summary: string;
  keyPoints: string[];
  actionRequired: string[];
  urgency: "low" | "medium" | "high";
  deadline?: string;
}

export interface FollowUpEntry {
  question: string;
  answer: string;
}

export type SupportedLocale = "de" | "en" | "ru";
