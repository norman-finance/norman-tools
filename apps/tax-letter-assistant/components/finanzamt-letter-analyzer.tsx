"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { EnvelopeOpen } from "@phosphor-icons/react";
import type { AnalysisResult, FollowUpEntry, SupportedLocale } from "@/lib/finanzamt-letter/types";
import { MAX_FILE_SIZE, ALLOWED_FILE_TYPES } from "@/lib/finanzamt-letter/constants";
import { analyzeDocument, askFollowUp as askFollowUpApi, formatAPIError } from "@/lib/finanzamt-letter/api";
import { t } from "@/lib/finanzamt-letter/translations";
import { CtaBanner } from "@/components/cta-banner";
import { FaqSection } from "@/components/faq-section";
import styles from "./finanzamt-letter-analyzer.module.css";

interface Props {
  locale: SupportedLocale;
}

async function extractTextFromPdf(file: File): Promise<string> {
  const pdfjsLib = await import("pdfjs-dist");
  pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  let fullText = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const strings = content.items.map((item: any) => item.str).join(" ");
    fullText += strings + "\n";
  }

  return fullText.trim();
}

export function FinanzamtLetterAnalyzer({ locale }: Props) {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [followUpQuestion, setFollowUpQuestion] = useState("");
  const [followUpHistory, setFollowUpHistory] = useState<FollowUpEntry[]>([]);
  const [isAsking, setIsAsking] = useState(false);
  const [hasAiConsent, setHasAiConsent] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      setError(t(locale, "errors.invalidType"));
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setError(t(locale, "errors.fileSize"));
      return;
    }

    setUploadedFile(file);
    setHasAiConsent(false);
    setError(null);

    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => setFilePreview(e.target?.result as string);
      reader.readAsDataURL(file);
    } else if (file.type === "application/pdf") {
      setFilePreview(null);
      try {
        setIsAnalyzing(true);
        const extractedText = await extractTextFromPdf(file);
        if (!extractedText || extractedText.trim().length === 0) {
          setError(t(locale, "errors.pdfEmpty"));
          setUploadedFile(null);
          setIsAnalyzing(false);
          return;
        }
        // Store extracted text for later use
        (file as File & { extractedText?: string }).extractedText = extractedText;
        setIsAnalyzing(false);
      } catch {
        setError(t(locale, "errors.pdfExtractFailed"));
        setUploadedFile(null);
        setIsAnalyzing(false);
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) handleFileSelect(files[0]);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) handleFileSelect(files[0]);
  };

  const handleAnalyze = async () => {
    if (!uploadedFile) return;
    if (!hasAiConsent) {
      setError(t(locale, "consent.required"));
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const formData = new FormData();
      const fileWithText = uploadedFile as File & { extractedText?: string };

      if (uploadedFile.type === "application/pdf" && fileWithText.extractedText) {
        formData.append("type", "analyze-text");
        formData.append("extractedText", fileWithText.extractedText);
        formData.append("uiLang", locale);
        formData.append("aiConsent", "true");
      } else {
        formData.append("file", uploadedFile);
        formData.append("type", "analyze");
        formData.append("uiLang", locale);
        formData.append("aiConsent", "true");
      }

      const result = await analyzeDocument(formData);
      setAnalysis(result);
    } catch (err) {
      setError(formatAPIError(err) || t(locale, "errors.analysisFailed"));
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAskFollowUp = async () => {
    if (!followUpQuestion.trim() || !analysis) return;
    if (!hasAiConsent) {
      setError(t(locale, "consent.required"));
      return;
    }

    setIsAsking(true);
    setError(null);

    try {
      const result = await askFollowUpApi({
        question: followUpQuestion,
        previousAnalysis: analysis,
        uiLang: locale,
        aiConsent: hasAiConsent,
      });
      setFollowUpHistory((prev) => [...prev, { question: followUpQuestion, answer: result.answer }]);
      setFollowUpQuestion("");
    } catch (err) {
      setError(formatAPIError(err) || t(locale, "errors.followUpFailed"));
    } finally {
      setIsAsking(false);
    }
  };

  const resetAnalysis = () => {
    setUploadedFile(null);
    setFilePreview(null);
    setAnalysis(null);
    setFollowUpQuestion("");
    setFollowUpHistory([]);
    setHasAiConsent(false);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const faqData = Array.from({ length: 5 }, (_, i) => ({
    question: t(locale, `faq.q${i + 1}.question`),
    answer: t(locale, `faq.q${i + 1}.answer`),
  }));

  const urgencyClassMap = {
    high: styles.urgencyHigh,
    medium: styles.urgencyMedium,
    low: styles.urgencyLow,
  } as const;

  const formatDeadline = (iso: string): { display: string; daysLeft: number | null } => {
    // Expect YYYY-MM-DD from the API
    const match = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!match) return { display: iso, daysLeft: null };
    const [, y, m, d] = match;
    const deadline = new Date(`${y}-${m}-${d}T00:00:00Z`);
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const daysLeft = Math.round((deadline.getTime() - today.getTime()) / 86400000);
    const display =
      locale === "de" || locale === "ru"
        ? `${d}.${m}.${y}`
        : deadline.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" });
    return { display, daysLeft };
  };

  const daysLeftLabel = (days: number) => {
    if (locale === "de") {
      if (days < 0) return `vor ${Math.abs(days)} Tagen abgelaufen`;
      if (days === 0) return "heute";
      if (days === 1) return "morgen";
      return `in ${days} Tagen`;
    }
    if (locale === "ru") {
      if (days < 0) return `просрочено на ${Math.abs(days)} дн.`;
      if (days === 0) return "сегодня";
      if (days === 1) return "завтра";
      return `через ${days} дн.`;
    }
    if (days < 0) return `${Math.abs(days)} days overdue`;
    if (days === 0) return "today";
    if (days === 1) return "tomorrow";
    return `in ${days} days`;
  };

  return (
    <>
      <section id="analyzer" className={styles.container}>
        {!analysis ? (
          /* ---- Upload Section ---- */
          <div
            className={styles.uploadZone}
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onDrop={handleDrop}
          >
            <div className={styles.uploadIcon}>
              <EnvelopeOpen size={48} weight="thin" />
            </div>

            <h3 className={styles.uploadTitle}>
              {uploadedFile ? uploadedFile.name : t(locale, "upload.title")}
            </h3>

            <p className={styles.uploadSubtitle}>
              {uploadedFile ? t(locale, "upload.fileReady") : t(locale, "upload.subtitle")}
            </p>

            {!uploadedFile && (
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileInput}
                  className={styles.fileInput}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className={styles.btnPrimary}
                >
                  {t(locale, "upload.selectFile")}
                </button>{" "}
                <span className={styles.dragDropLabel}>{t(locale, "upload.dragDrop")}</span>
              </>
            )}

            {uploadedFile && (
              <div>
                {/* File preview */}
                <div className={styles.filePreview}>
                  {filePreview ? (
                    <Image
                      src={filePreview}
                      alt={t(locale, "upload.documentPreview")}
                      width={640}
                      height={300}
                      unoptimized
                      className={styles.filePreviewImage}
                    />
                  ) : (
                    <div className={styles.filePreviewPdf}>
                      <div className={styles.filePreviewPdfIcon}>&#128196;</div>
                      <div className={styles.filePreviewPdfName}>{uploadedFile.name}</div>
                      <div className={styles.filePreviewPdfMeta}>
                        PDF Document &bull; {Math.round(uploadedFile.size / 1024)} KB
                      </div>
                    </div>
                  )}
                </div>

                <label className={styles.consentRow}>
                  <input
                    type="checkbox"
                    checked={hasAiConsent}
                    onChange={(e) => {
                      setHasAiConsent(e.target.checked);
                      if (e.target.checked && error === t(locale, "consent.required")) {
                        setError(null);
                      }
                    }}
                    className={styles.consentCheckbox}
                  />
                  <span>{t(locale, "consent.aiLabel")}</span>
                </label>

                <div className={styles.btnRow}>
                  <button
                    type="button"
                    onClick={handleAnalyze}
                    disabled={isAnalyzing || !hasAiConsent}
                    className={styles.btnPrimary}
                  >
                    {isAnalyzing && <span className={styles.spinner} />}
                    {isAnalyzing ? t(locale, "analysis.analyzing") : t(locale, "analysis.analyzeDocument")}
                  </button>

                  <button type="button" onClick={resetAnalysis} className={styles.btnSecondary}>
                    {t(locale, "analysis.reset")}
                  </button>
                </div>
              </div>
            )}

            {error && <div className={styles.errorBanner}>{error}</div>}
          </div>
        ) : (
          /* ---- Analysis Results ---- */
          <div>
            {/* Summary */}
            <div className={styles.card}>
              <h2 className={styles.summaryTitle}>{t(locale, "analysis.summary")}</h2>

              <div className={styles.metaGrid}>
                <div>
                  <span className={styles.metaLabel}>
                    {locale === "de" ? "Dringlichkeit" : locale === "ru" ? "Срочность" : "Urgency"}
                  </span>
                  <span className={urgencyClassMap[analysis.urgency]}>
                    {analysis.urgency === "low" ? (
                      <span className={styles.urgencyDash}>—</span>
                    ) : (
                      <span className={styles.urgencyDot} aria-hidden />
                    )}
                    {t(locale, `urgency.${analysis.urgency}`)}
                  </span>
                </div>
                <div>
                  <span className={styles.metaLabel}>
                    {locale === "de" ? "Frist" : locale === "ru" ? "Срок" : "Deadline"}
                  </span>
                  {analysis.deadline ? (
                    (() => {
                      const { display, daysLeft } = formatDeadline(analysis.deadline);
                      return (
                        <span className={styles.metaValue}>
                          {display}
                          {daysLeft !== null && (
                            <span className={styles.metaDays}>({daysLeftLabel(daysLeft)})</span>
                          )}
                        </span>
                      );
                    })()
                  ) : (
                    <span className={styles.metaMuted}>
                      {locale === "de" ? "Keine Frist genannt" : locale === "ru" ? "Срок не указан" : "No deadline stated"}
                    </span>
                  )}
                </div>
              </div>

              <div className={styles.summaryText}>
                {analysis.summary.split("\n").map((paragraph, index) =>
                  paragraph.trim() ? <p key={index}>{paragraph.trim()}</p> : null,
                )}
              </div>
            </div>

            {/* Key Points */}
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>{t(locale, "analysis.keyPoints")}</h3>
              <ul className={styles.bulletList}>
                {analysis.keyPoints.map((point, i) => (
                  <li key={i} className={styles.bulletItem}>
                    <span className={styles.bulletMarker}>&bull;</span>
                    {point}
                  </li>
                ))}
              </ul>
            </div>

            {/* Action Required */}
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>{t(locale, "analysis.actionRequired")}</h3>
              <ul className={styles.bulletList}>
                {analysis.actionRequired.map((action, i) => (
                  <li key={i} className={styles.bulletItem}>
                    <span className={styles.bulletMarker}>&rarr;</span>
                    {action}
                  </li>
                ))}
              </ul>
            </div>

            {/* Follow-up Chat */}
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>{t(locale, "analysis.followUp")}</h3>

              {followUpHistory.length > 0 && (
                <div className={styles.chatHistory}>
                  {followUpHistory.map((chat, index) => (
                    <div key={index} className={styles.chatEntry}>
                      <div className={styles.chatUserRow}>
                        <div className={styles.chatUserBubble}>{chat.question}</div>
                      </div>
                      <div className={styles.chatAiRow}>
                        <div className={styles.chatAiBubble}>
                          <div className={styles.chatAiHeader}>
                            <div className={styles.chatAiAvatar}>AI</div>
                            <span className={styles.chatAiLabel}>{t(locale, "analysis.taxAssistant")}</span>
                          </div>
                          <div>
                            {chat.answer.split("\n").map((paragraph, idx) =>
                              paragraph.trim() ? <p key={idx}>{paragraph.replace(/\*\*/g, "").trim()}</p> : null,
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className={styles.chatInputRow}>
                <input
                  type="text"
                  value={followUpQuestion}
                  onChange={(e) => setFollowUpQuestion(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !isAsking && followUpQuestion.trim() && hasAiConsent) handleAskFollowUp();
                  }}
                  placeholder={t(locale, "analysis.followUpPlaceholder")}
                  className={styles.chatInput}
                />
                <button
                  type="button"
                  onClick={handleAskFollowUp}
                  disabled={isAsking || !followUpQuestion.trim() || !hasAiConsent}
                  className={styles.btnPrimary}
                  style={{ minWidth: 80 }}
                >
                  {isAsking && <span className={styles.spinner} />}
                  {isAsking ? "..." : t(locale, "analysis.ask")}
                </button>
              </div>
            </div>

            {/* Analyze New */}
            <div className={styles.btnRow}>
              <button type="button" onClick={resetAnalysis} className={styles.btnPrimary}>
                {t(locale, "analysis.analyzeNew")}
              </button>
            </div>
          </div>
        )}

        {/* FAQ */}
        <FaqSection
          id="finanzamt-letter-faq"
          heading={t(locale, "faq.title")}
          items={faqData}
        />

        {/* Privacy Notice */}
        <div className={styles.privacyNotice}>
          <div className={styles.privacyHeader}>
            <span style={{ fontSize: "1.25rem" }}>&#128274;</span>
            <strong className={styles.privacyTitle}>{t(locale, "privacy.title")}</strong>
          </div>
          <ul className={styles.privacyList}>
            <li>{t(locale, "privacy.point1")}</li>
            <li>{t(locale, "privacy.point2")}</li>
            <li>{t(locale, "privacy.point3")}</li>
            <li>{t(locale, "privacy.point4")}</li>
          </ul>
        </div>

        {/* Disclaimer */}
        <div className={styles.disclaimer}>
          <span className={styles.disclaimerTitle}>{t(locale, "disclaimer.title")}</span>
          <br />
          {t(locale, "disclaimer.text")}
        </div>
      </section>

      {/* CTA */}
      <CtaBanner
        id="finanzamt-letter-cta"
        title={t(locale, "cta.title")}
        subtitle={t(locale, "cta.description")}
        ctaLabel={t(locale, "cta.button")}
        ctaHref="https://app.norman.finance/sign-up?utm_source=freetools&utm_campaign=finanzamt-brief&utm_medium=cta"
      />
    </>
  );
}
