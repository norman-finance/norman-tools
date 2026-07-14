import type { AnalysisResult } from "./types";
import { API_ENDPOINT } from "./constants";

export async function analyzeDocument(formData: FormData): Promise<AnalysisResult> {
  const response = await fetch(API_ENDPOINT, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to analyze document");
  }

  return response.json();
}

export async function askFollowUp(params: {
  question: string;
  previousAnalysis: AnalysisResult;
  uiLang: string;
  aiConsent: boolean;
}): Promise<{ answer: string }> {
  const formData = new FormData();
  formData.append("type", "followup");
  formData.append("question", params.question);
  formData.append("previousAnalysis", JSON.stringify(params.previousAnalysis));
  formData.append("uiLang", params.uiLang);
  formData.append("aiConsent", params.aiConsent ? "true" : "false");

  const response = await fetch(API_ENDPOINT, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to get answer");
  }

  return response.json();
}

export function formatAPIError(error: unknown): string {
  if (error instanceof Error) return error.message;
  return "An unexpected error occurred";
}
