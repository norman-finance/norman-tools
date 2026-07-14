import { type NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { ALLOWED_FILE_TYPES, MAX_FILE_SIZE } from "@/lib/finanzamt-letter/constants";
import { checkAnalysisRateLimit } from "@/lib/finanzamt-letter/rate-limit";
import { sanitizePersonalInfo } from "@/lib/finanzamt-letter/sanitizer";

const ALLOWED_IMAGE_TYPES = ALLOWED_FILE_TYPES.filter((type) => type.startsWith("image/"));
const MAX_REQUEST_SIZE_BYTES = MAX_FILE_SIZE + 1024 * 1024;
const MAX_EXTRACTED_TEXT_CHARS = 30_000;
const MAX_QUESTION_CHARS = 1_000;
const MAX_PREVIOUS_ANALYSIS_CHARS = 12_000;

const getOpenAIClient = () => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OpenAI API key not configured");
  }
  return new OpenAI({ apiKey });
};

const SYSTEM_PROMPT_ANALYZE = `You are Norman Finance's AI tax assistant specializing in analyzing Finanzamt (German tax office) letters and documents.

IMPORTANT: The document may contain personal information. Some text inputs may use [REDACTED] in place of names, addresses, tax numbers, and other personal details. This is normal and expected. Never reproduce personal information from the document in your answer.

Your task is to analyze the document and provide:
1. A clear, well-formatted summary of what the document is about - make it professional and easy to understand
2. Specific key points that are actually mentioned in the document (not generic advice)
3. Concrete actions the person needs to take based on this specific document
4. The urgency level (low, medium, high) based on deadlines and consequences
5. Any important deadlines found in the document

Be thorough but accessible. Focus on what the person needs to know and do based on THIS SPECIFIC document. Refer to people generically as "the taxpayer" or "your information" as appropriate, especially when you see [REDACTED].

For keyPoints: Extract specific information from the document, not generic advice.
For actionRequired: Provide concrete steps based on what the document requires, not general recommendations.

IMPORTANT: Respond ONLY with valid JSON. Do not include any markdown formatting, code blocks, or explanatory text. Just the JSON object.

Respond in this exact JSON format:
{
  "summary": "Well-formatted overview of what this specific document is about",
  "keyPoints": ["Specific point 1 from document", "Specific point 2 from document", "Specific point 3 from document"],
  "actionRequired": ["Concrete action 1 required by this document", "Concrete action 2 required by this document"],
  "urgency": "low|medium|high",
  "deadline": "YYYY-MM-DD or null if no deadline"
}`;

function parseAnalysisResponse(content: string) {
  let jsonContent = content;
  const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (jsonMatch) {
    jsonContent = jsonMatch[1];
  }

  const analysis = JSON.parse(jsonContent);

  if (!analysis.summary || !analysis.keyPoints || !analysis.actionRequired) {
    throw new Error("Invalid response structure - missing required fields");
  }

  if (!Array.isArray(analysis.keyPoints)) {
    analysis.keyPoints = [analysis.keyPoints];
  }
  if (!Array.isArray(analysis.actionRequired)) {
    analysis.actionRequired = [analysis.actionRequired];
  }

  return analysis;
}

function buildFallbackAnalysis(content: string) {
  return {
    summary: content.replace(/```(?:json)?\s*/g, "").replace(/\s*```/g, ""),
    keyPoints: ["Analysis completed - see summary for details"],
    actionRequired: ["Review the document carefully", "Consider consulting a tax professional if needed"],
    urgency: "medium",
    deadline: null,
  };
}

function jsonError(error: string, status = 400, headers?: HeadersInit) {
  return NextResponse.json({ error }, { status, headers });
}

function consentRequiredError(uiLang: string) {
  if (uiLang === "de") {
    return "Bitte willige ein, bevor wir Daten an den Anbieter des KI-Modells senden.";
  }
  if (uiLang === "ru") {
    return "Пожалуйста, дайте согласие перед отправкой данных поставщику модели ИИ.";
  }
  return "Please consent before we send data to the AI model provider.";
}

function getStringField(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function rejectLargeRequest(request: NextRequest) {
  const contentLength = request.headers.get("content-length");
  if (!contentLength) return null;

  const parsedLength = Number(contentLength);
  if (!Number.isFinite(parsedLength)) return null;

  if (parsedLength > MAX_REQUEST_SIZE_BYTES) {
    return jsonError("Request is too large. Please upload a file smaller than 10MB.", 413);
  }
  return null;
}

function asBoundedString(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function asBoundedStringArray(value: unknown, maxItems: number, maxLength: number) {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is string => typeof item === "string" && item.trim().length > 0)
    .slice(0, maxItems)
    .map((item) => item.trim().slice(0, maxLength));
}

function normalizePreviousAnalysis(raw: string) {
  if (raw.length > MAX_PREVIOUS_ANALYSIS_CHARS) return null;

  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const normalized = {
      summary: asBoundedString(parsed.summary, 2_000),
      keyPoints: asBoundedStringArray(parsed.keyPoints, 8, 500),
      actionRequired: asBoundedStringArray(parsed.actionRequired, 8, 500),
      urgency: asBoundedString(parsed.urgency, 20),
      deadline: asBoundedString(parsed.deadline, 40) || null,
    };

    if (!normalized.summary) return null;
    return JSON.stringify(normalized);
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const largeRequestError = rejectLargeRequest(request);
    if (largeRequestError) return largeRequestError;

    const rl = await checkAnalysisRateLimit(request.headers);
    if (!rl.allowed) {
      return jsonError(
        rl.reason === "daily_budget"
          ? "The analyzer has reached today's capacity. Please try again tomorrow."
          : "Too many requests. Please try again in a minute.",
        429,
        { "Retry-After": String(rl.retryAfterSeconds) },
      );
    }

    const formData = await request.formData();
    const fileEntry = formData.get("file");
    const file = fileEntry instanceof File ? fileEntry : null;
    const type = getStringField(formData, "type");
    const extractedText = getStringField(formData, "extractedText").trim();
    const question = getStringField(formData, "question").trim();
    const previousAnalysis = getStringField(formData, "previousAnalysis").trim();
    const uiLang = getStringField(formData, "uiLang") || "en";
    const hasAiConsent = formData.get("aiConsent") === "true";

    if (!hasAiConsent) {
      return jsonError(consentRequiredError(uiLang));
    }

    if (!["analyze", "analyze-text", "followup"].includes(type)) {
      return jsonError("Unsupported request type.");
    }

    const languageInstruction =
      uiLang === "de"
        ? "Antworte auf Deutsch und erkläre deutsche Steuerbegriffe verständlich."
        : uiLang === "ru"
          ? "Отвечай на русском языке и объясняй немецкие налоговые термины простыми словами."
          : "Respond in English and explain German tax terms in plain English.";

    // --- Follow-up questions ---
    if (type === "followup") {
      if (!question || !previousAnalysis) {
        return jsonError("Question and previous analysis required for follow-up");
      }

      if (question.length > MAX_QUESTION_CHARS) {
        return jsonError("Question is too long. Please keep it under 1,000 characters.");
      }

      const normalizedPreviousAnalysis = normalizePreviousAnalysis(previousAnalysis);
      if (!normalizedPreviousAnalysis) {
        return jsonError("Previous analysis is invalid or too large.");
      }

      const openai = getOpenAIClient();
      const completion = await openai.chat.completions.create({
        model: "gpt-4.1",
        messages: [
          {
            role: "system",
            content: `You are Norman Finance's AI tax assistant. You help people understand German tax office (Finanzamt) letters and documents.

Previously, you analyzed a document with this summary:
${normalizedPreviousAnalysis}

Now the user has a follow-up question. ${languageInstruction}

IMPORTANT: Keep your response concise and well-structured. Use short paragraphs (1-2 sentences each). If listing steps or points, use numbered lists. Be direct and helpful without being verbose.

When suggesting professional help, recommend Norman Finance's services for tax related matters. Provide a clear, helpful answer that addresses their specific question. Be professional but accessible, and explain any German tax terms they might not understand.`,
          },
          { role: "user", content: question },
        ],
        max_tokens: 500,
        temperature: 0.3,
      });

      const answer = completion.choices[0]?.message?.content || "I couldn't generate an answer to your question.";
      return NextResponse.json({ answer });
    }

    // --- Extracted text analysis (from PDF) ---
    if (type === "analyze-text") {
      if (!extractedText) {
        return jsonError("No extracted text provided");
      }

      if (extractedText.length > MAX_EXTRACTED_TEXT_CHARS) {
        return jsonError("Extracted text is too long. Please upload a shorter document or image.", 413);
      }

      const sanitizedText = sanitizePersonalInfo(extractedText);
      const openai = getOpenAIClient();
      const completion = await openai.chat.completions.create({
        model: "gpt-4.1",
        messages: [
          {
            role: "system",
            content: `${SYSTEM_PROMPT_ANALYZE}\n\n${languageInstruction}`,
          },
          {
            role: "user",
            content: `Please analyze this German tax office document and provide a summary in the requested JSON format. For privacy protection, personal information has been redacted and will appear as [REDACTED]. Focus on specific content from this document, not generic advice. IMPORTANT: Return ONLY the JSON object, no markdown formatting or code blocks.\n\nDocument text:\n${sanitizedText}`,
          },
        ],
        max_tokens: 1000,
        temperature: 0.2,
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) throw new Error("No response from OpenAI");

      try {
        return NextResponse.json(parseAnalysisResponse(content));
      } catch {
        return NextResponse.json(buildFallbackAnalysis(content));
      }
    }

    // --- Image analysis (via Vision API) ---
    if (!file) {
      return jsonError("No file provided for analysis");
    }

    if (file.size <= 0) {
      return jsonError("Uploaded file is empty.");
    }

    if (file.size > MAX_FILE_SIZE) {
      return jsonError("File size must be less than 10MB.", 413);
    }

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return jsonError("Unsupported file type. Please upload a JPG or PNG image.");
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString("base64");

    const openai = getOpenAIClient();
    const completion = await openai.chat.completions.create({
      model: "gpt-4.1",
      messages: [
        {
          role: "system",
          content: `${SYSTEM_PROMPT_ANALYZE}\n\n${languageInstruction}`,
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Please analyze this German tax office document and provide a summary in the requested JSON format. For privacy protection, do not include any personal information (names, addresses, tax IDs, etc.) in your analysis - refer to them generically as 'the taxpayer' or 'your information'. Focus on specific content from this document, not generic advice. IMPORTANT: Return ONLY the JSON object, no markdown formatting or code blocks.",
            },
            {
              type: "image_url",
              image_url: { url: `data:${file.type};base64,${base64}` },
            },
          ],
        },
      ],
      max_tokens: 1000,
      temperature: 0.2,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) throw new Error("No response from OpenAI");

    try {
      return NextResponse.json(parseAnalysisResponse(content));
    } catch {
      return NextResponse.json(buildFallbackAnalysis(content));
    }
  } catch (error) {
    console.error("Error analyzing document:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";

    if (errorMessage.includes("rate limit")) {
      return NextResponse.json(
        { error: "Service temporarily unavailable due to high demand. Please try again in a few minutes." },
        { status: 429 },
      );
    }

    if (errorMessage.includes("API key")) {
      return NextResponse.json({ error: "Service configuration error. Please contact support." }, { status: 500 });
    }

    return NextResponse.json({ error: "Failed to analyze document. Please try again." }, { status: 500 });
  }
}
