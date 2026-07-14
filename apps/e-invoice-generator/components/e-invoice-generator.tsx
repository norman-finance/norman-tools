"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { invoiceFormSchema } from "@/lib/e-invoice/validation";
import type { InvoiceFormData } from "@/lib/e-invoice/types";
import {
  DEFAULT_INVOICE_DATA,
  CURRENCIES,
  VAT_RATES,
  SALE_TYPES,
  CLIENT_TYPES,
  LANGUAGES,
  COMPANY_COUNTRY,
  DEMO_DATA,
  getCountriesList,
} from "@/lib/e-invoice/constants";
import { calculateInvoiceTotals, formatCurrency } from "@/lib/e-invoice/calculations";
import { calculateVatData, getRecommendedVatRate, validateVatSetup } from "@/lib/e-invoice/vat-calculations";
import { generateInvoice, downloadPDF, formatAPIError } from "@/lib/e-invoice/api";
import { getUITranslation, getInvoiceTranslation } from "@/lib/e-invoice/translations";

import { CtaBanner } from "@/components/cta-banner";
import styles from "./e-invoice-generator.module.css";

type Locale = "de" | "en" | "ru";

function t(locale: Locale, key: Parameters<typeof getUITranslation>[1]) {
  return getUITranslation(locale, key);
}

function it(locale: "en" | "de", key: Parameters<typeof getInvoiceTranslation>[1]) {
  return getInvoiceTranslation(locale, key);
}

/* ─── Main exported component ─────────────────────────────────────────── */

const emptySubscribe = () => () => {};

export function EInvoiceGenerator({ locale }: { locale: Locale }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  // Hydration gate: false in server HTML and during hydration, true after.
  const isClient = useSyncExternalStore(emptySubscribe, () => true, () => false);

  const form = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues: { ...DEFAULT_INVOICE_DATA, language: locale === "de" ? "de" : "en" },
    mode: "onChange",
  });

  const { control, handleSubmit } = form;
  useWatch({ control });
  const formData = form.getValues();

  const totals = calculateInvoiceTotals(formData.invoiced_items || [], formData.is_vat_included);
  const vatData = calculateVatData(formData, formData.language);

  // Auto-clear messages
  useEffect(() => {
    if (error) { const timer = setTimeout(() => setError(null), 10000); return () => clearTimeout(timer); }
  }, [error]);
  useEffect(() => {
    if (success) { const timer = setTimeout(() => setSuccess(null), 5000); return () => clearTimeout(timer); }
  }, [success]);

  // Auto-adjust VAT rates on business rule changes
  useEffect(() => {
    const recommended = getRecommendedVatRate(formData);
    const items = form.getValues("invoiced_items");
    if (items.some((item) => item.vat_rate !== recommended)) {
      form.setValue("invoiced_items", items.map((item) => ({ ...item, vat_rate: recommended })));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.is_kleinunternehmer, formData.client_country, formData.client_type, formData.sale_type, formData.company_country, formData.client_vat_number]);

  // Auto-calculate due date
  useEffect(() => {
    if (formData.issue_date && !formData.due_date) {
      const d = new Date(formData.issue_date);
      d.setDate(d.getDate() + 30);
      form.setValue("due_date", d.toISOString().split("T")[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.issue_date]);

  const onSubmit = async (data: InvoiceFormData) => {
    setIsGenerating(true);
    setError(null);
    setSuccess(null);
    try {
      const vatErrors = validateVatSetup(data);
      if (vatErrors.length > 0) { setError(vatErrors.join(" • ")); setIsGenerating(false); return; }
      const pdfBlob = await generateInvoice(data);
      const filename = `invoice_${data.invoice_number.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`;
      downloadPDF(pdfBlob, filename);
      setSuccess(t(locale, "successMessage"));
    } catch (err) {
      setError(formatAPIError(err));
    } finally {
      setIsGenerating(false);
    }
  };

  const fillDemo = () => {
    const today = new Date().toISOString().split("T")[0];
    const dueDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    form.reset({
      ...DEFAULT_INVOICE_DATA,
      ...DEMO_DATA,
      issue_date: today,
      due_date: dueDate,
      service_start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      service_end_date: today,
    } as InvoiceFormData);
  };

  return (
    <>
    <section id="generator" className={styles.section}>
      {/* Messages */}
      {error && (
        <div className={styles.errorBanner}>
          <span style={{ fontSize: "1.25rem", flexShrink: 0 }}>&#10060;</span>
          <div style={{ flex: 1 }}>
            <p className={styles.errorBannerTitle}>{t(locale, "errorMessage")}</p>
            <p className={styles.errorBannerText}>{error}</p>
          </div>
          <button className={styles.dismissBtn} onClick={() => setError(null)} type="button">&times;</button>
        </div>
      )}
      {success && (
        <div className={styles.successBanner} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <p className={styles.successText} style={{ flex: 1 }}>{success}</p>
          <button className={styles.dismissBtn} onClick={() => setSuccess(null)} type="button">&times;</button>
        </div>
      )}

      {/* Two-column grid */}
      <div className={styles.grid}>
        {/* Preview — left */}
        <div className={`${styles.previewColumn} ${!previewMode ? styles.mobileHidden : ""}`}>
          <div className={styles.previewSticky}>
            <InvoicePreview formData={formData} totals={totals} vatData={vatData} isClient={isClient} />
          </div>
        </div>

        {/* Form — right */}
        <div className={`${styles.formColumn} ${previewMode ? styles.mobileHidden : ""}`}>
          <div className={styles.formHeader}>
            <h2 className={styles.formTitle}>{t(locale, "sectionDetails")}</h2>
            <button className={styles.demoBtn} onClick={fillDemo} type="button">{t(locale, "fillDemo")}</button>
          </div>

          <form noValidate>
            <InvoiceFormFields form={form} locale={locale} isClient={isClient} />
          </form>

          <button
            className={styles.submitBtn}
            onClick={handleSubmit(onSubmit)}
            disabled={isGenerating}
            type="button"
          >
            {isGenerating ? t(locale, "generating") : t(locale, "getInvoice")}
          </button>
        </div>
      </div>

      {/* Mobile toggle FAB */}
      <div className={styles.mobileFab}>
        <button
          className={styles.mobileFabBtn}
          onClick={() => setPreviewMode(!previewMode)}
          type="button"
          aria-label={previewMode ? "Edit form" : "Preview invoice"}
        >
          {previewMode ? "✏️" : "👁️"}
        </button>
      </div>

    </section>

    {/* Features */}
    <FeaturesSection locale={locale} />

    {/* CTA */}
    <CtaBanner
      id="e-invoice-cta"
      title={t(locale, "ctaTitle")}
      subtitle={t(locale, "ctaDescription")}
      ctaLabel={t(locale, "ctaGetStarted")}
      ctaHref="https://app.norman.finance/sign-up?utm_source=freetools&utm_campaign=erechnung&destination=invoice&utm_medium=cta"
    />
    </>
  );
}

/* ──��� Invoice Form Fields ─────────────────────────────────────────────── */

function InvoiceFormFields({
  form,
  locale,
  isClient,
}: {
  form: ReturnType<typeof useForm<InvoiceFormData>>;
  locale: Locale;
  isClient: boolean;
}) {
  const { register, control, watch, formState: { errors } } = form;
  const { fields, append, remove } = useFieldArray({ control, name: "invoiced_items" });

  const watchedLanguage = watch("language");
  const watchedSaleType = watch("sale_type");

  const countriesList = getCountriesList(watchedLanguage);

  const [notesOpen, setNotesOpen] = useState(false);

  return (
    <div className={styles.formFields}>
      {/* ── Settings ────────────────────────────────── */}
      <div className={styles.formSectionPad}>
        <div className={styles.row2}>
          <div>
            <label className={styles.label}>{t(locale, "currency")} {t(locale, "required")}</label>
            <select {...register("currency")} className={styles.input}>
              {CURRENCIES.map((c) => <option key={c.code} value={c.code}>{c.symbol} {c.name} ({c.code})</option>)}
            </select>
          </div>
          <div>
            <label className={styles.label}>{t(locale, "invoiceLanguage")} {t(locale, "required")}</label>
            <select {...register("language")} className={styles.input}>
              {LANGUAGES.map((l) => <option key={l.code} value={l.code}>{l.flag} {l.name}</option>)}
            </select>
          </div>
        </div>
        <div className={styles.row2}>
          <div>
            <label className={styles.label}>{t(locale, "saleType")} {t(locale, "required")}</label>
            <select {...register("sale_type")} className={styles.input}>
              {SALE_TYPES.map((s) => <option key={s.value} value={s.value}>{s.icon} {locale === "en" ? s.label : t(locale, s.value === "services" ? "services" : "goods")}</option>)}
            </select>
          </div>
          <div />
        </div>
        <div className={styles.vatBox}>
          <p className={styles.vatBoxTitle}>{t(locale, "vatSettings")}</p>
          <div className={styles.checkboxRow}>
            <input {...register("is_kleinunternehmer")} type="checkbox" id="is_kleinunternehmer" className={styles.checkbox} />
            <label htmlFor="is_kleinunternehmer" className={styles.checkboxLabel}>{t(locale, "kleinunternehmer")}</label>
          </div>
          <p className={styles.checkboxHint}>{t(locale, "kleinunternehmerDesc")}</p>
        </div>
      </div>

      {/* ── Company ─────────────────────────────────── */}
      <div className={styles.formSectionPad}>
        <h4 className={styles.sectionTitle}>{t(locale, "companyTitle")}</h4>
        <div className={styles.row2}>
          <div>
            <label className={styles.label}>{t(locale, "companyName")} {t(locale, "required")}</label>
            <input {...register("company_name")} type="text" className={styles.input} placeholder={t(locale, "companyNamePlaceholder")} />
            {errors.company_name && <p className={styles.inputError}>{errors.company_name.message}</p>}
          </div>
          <div>
            <label className={styles.label}>{t(locale, "companyEmail")}</label>
            <input {...register("company_email")} type="email" className={styles.input} placeholder="hello@company.com" />
          </div>
        </div>
        <div className={styles.field}>
          <label className={styles.label}>{t(locale, "companyAddress")} {t(locale, "required")}</label>
          <input {...register("company_address")} type="text" className={styles.input} placeholder="Hauptstraße 18" />
        </div>
        <div className={styles.row3}>
          <div>
            <label className={styles.label}>{t(locale, "companyZip")} {t(locale, "required")}</label>
            <input {...register("company_zip_code")} type="text" className={styles.input} placeholder="10115" />
          </div>
          <div>
            <label className={styles.label}>{t(locale, "companyCity")} {t(locale, "required")}</label>
            <input {...register("company_city")} type="text" className={styles.input} placeholder="Berlin" />
          </div>
          <div>
            <label className={styles.label}>{t(locale, "companyCountry")} {t(locale, "required")}</label>
            <input type="text" value={COMPANY_COUNTRY.name} className={styles.input} disabled />
            <input type="hidden" {...register("company_country")} value="DE" />
          </div>
        </div>
        <div className={styles.field}>
          <label className={styles.label}>{t(locale, "companyPhone")}</label>
          <input {...register("company_phone")} type="tel" className={styles.input} placeholder="+49 30 12345678" />
        </div>
        <div className={styles.row2}>
          <div>
            <label className={styles.label}>{t(locale, "companyTaxNumber")}</label>
            <input {...register("company_tax_number")} type="text" className={styles.input} placeholder="12/345/67890" />
          </div>
          <div>
            <label className={styles.label}>{t(locale, "companyVatNumber")}</label>
            <input {...register("company_vat_number")} type="text" className={styles.input} placeholder="DE123456789" />
          </div>
        </div>
      </div>

      {/* ── Client ──────────────────────────────────── */}
      <div className={styles.formSectionPad}>
        <h4 className={styles.sectionTitle}>{t(locale, "clientTitle")}</h4>
        <div className={styles.field}>
          <label className={styles.label}>{t(locale, "clientType")} {t(locale, "required")}</label>
          <select {...register("client_type")} className={styles.input}>
            {CLIENT_TYPES.map((ct) => <option key={ct.value} value={ct.value}>{ct.icon} {locale === "en" ? ct.label : t(locale, ct.value === "person" ? "person" : "business")}</option>)}
          </select>
        </div>
        <div className={styles.field}>
          <label className={styles.label}>{t(locale, "clientName")} {t(locale, "required")}</label>
          <input {...register("client_name")} type="text" className={styles.input} placeholder={t(locale, "companyNamePlaceholder")} />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>{t(locale, "clientAddress")} {t(locale, "required")}</label>
          <input {...register("client_address")} type="text" className={styles.input} placeholder="Hauptstraße 18" />
        </div>
        <div className={styles.row3}>
          <div>
            <label className={styles.label}>{t(locale, "companyZip")} {t(locale, "required")}</label>
            <input {...register("client_zip_code")} type="text" className={styles.input} placeholder="20095" />
          </div>
          <div>
            <label className={styles.label}>{t(locale, "companyCity")} {t(locale, "required")}</label>
            <input {...register("client_city")} type="text" className={styles.input} placeholder="Hamburg" />
          </div>
          <div>
            <label className={styles.label}>{t(locale, "companyCountry")} {t(locale, "required")}</label>
            <select {...register("client_country")} className={styles.input}>
              {countriesList.map((c) => <option key={c.code} value={c.code}>{c.name}</option>)}
            </select>
          </div>
        </div>
        <div className={styles.row2}>
          <div>
            <label className={styles.label}>{t(locale, "clientEmail")}</label>
            <input {...register("client_email")} type="email" className={styles.input} placeholder="contact@client.com" />
          </div>
          <div>
            <label className={styles.label}>{t(locale, "clientVatNumber")}</label>
            <input {...register("client_vat_number")} type="text" className={styles.input} placeholder="DE987654321" />
          </div>
        </div>
      </div>

      {/* ── Invoice details ─────────────────────────── */}
      <div className={styles.formSectionPad}>
        <div className={styles.row2}>
          <div>
            <label className={styles.label}>{t(locale, "invoiceNumber")}</label>
            <input {...register("invoice_number")} type="text" className={styles.input} placeholder="INV-2025-001" />
          </div>
          <div>
            <label className={styles.label}>{t(locale, "issued")}</label>
            <input {...register("issue_date")} type="date" className={styles.input} />
          </div>
        </div>
        <div className={styles.field}>
          <label className={styles.label}>{t(locale, "dueDate")}</label>
          <input {...register("due_date")} type="date" className={styles.input} />
        </div>
        {isClient && watchedSaleType === "services" && (
          <div className={styles.row2}>
            <div>
              <label className={styles.label}>{t(locale, "serviceFrom")}</label>
              <input {...register("service_start_date")} type="date" className={styles.input} />
            </div>
            <div>
              <label className={styles.label}>{t(locale, "serviceTo")}</label>
              <input {...register("service_end_date")} type="date" className={styles.input} />
            </div>
          </div>
        )}
        {isClient && watchedSaleType === "goods" && (
          <div className={styles.field}>
            <label className={styles.label}>{t(locale, "deliveryDate")}</label>
            <input {...register("delivery_date")} type="date" className={styles.input} />
          </div>
        )}
      </div>

      {/* ── Items ───────────────────────────────────── */}
      <div className={styles.formSectionPad}>
        <div className={styles.itemsHeader}>
          <span>{t(locale, "itemDescription")}</span>
          <span>{t(locale, "itemQty")}</span>
          <span>{t(locale, "itemVat")}</span>
          <span>{t(locale, "itemRate")}</span>
          <span>{t(locale, "itemTotal")}</span>
        </div>
        {fields.map((field, index) => (
          <div key={field.id} className={styles.itemRow}>
            <input {...register(`invoiced_items.${index}.description`)} type="text" className={styles.input} placeholder={t(locale, "itemPlaceholder")} />
            <input {...register(`invoiced_items.${index}.quantity`, { valueAsNumber: true })} type="number" className={styles.input} placeholder="1" step="0.01" />
            <select {...register(`invoiced_items.${index}.vat_rate`, { valueAsNumber: true })} className={styles.input}>
              {VAT_RATES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
            <input {...register(`invoiced_items.${index}.unit_price`, { valueAsNumber: true })} type="number" className={styles.input} placeholder="0.00" step="0.01" />
            <div className={styles.itemTotal}>
              <span>€{((watch(`invoiced_items.${index}.quantity`) || 0) * (watch(`invoiced_items.${index}.unit_price`) || 0)).toFixed(2)}</span>
              {fields.length > 1 && (
                <button type="button" className={styles.removeItemBtn} onClick={() => remove(index)} title={t(locale, "removeItem")}>&times;</button>
              )}
            </div>
          </div>
        ))}
        <button type="button" className={styles.addItemBtn} onClick={() => append({ description: "", quantity: 1, unit_price: 0, vat_rate: 19 })}>
          {t(locale, "addItem")}
        </button>
        <div className={styles.checkboxRow} style={{ justifyContent: "flex-end", marginTop: "8px" }}>
          <input {...register("is_vat_included")} type="checkbox" id="is_vat_included" className={styles.checkbox} />
          <label htmlFor="is_vat_included" className={styles.checkboxLabel}>{t(locale, "unitPriceVat")}</label>
        </div>
      </div>

      {/* ── Payment ─────────────────────────────────── */}
      <div className={styles.formSectionPad}>
        <div className={styles.row2}>
          <div>
            <label className={styles.label}>{t(locale, "iban")}</label>
            <input {...register("iban")} type="text" className={styles.input} placeholder="DE89 3704 0044 0532 0130 00" />
          </div>
          <div>
            <label className={styles.label}>{t(locale, "bic")}</label>
            <input {...register("bic")} type="text" className={styles.input} placeholder="COBADEFFXXX" />
          </div>
        </div>
        <div className={styles.field}>
          <label className={styles.label}>{t(locale, "bankName")}</label>
          <input {...register("bank_name")} type="text" className={styles.input} placeholder="Commerzbank AG" />
        </div>
      </div>

      {/* ── Notes (collapsible) ─────────────────────── */}
      <div>
        <button type="button" className={styles.collapseToggle} onClick={() => setNotesOpen(!notesOpen)}>
          <span>{t(locale, "sectionNotes")}</span>
          <span className={`${styles.collapseArrow} ${notesOpen ? styles.collapseArrowOpen : ""}`}>↓</span>
        </button>
        {notesOpen && (
          <div style={{ padding: "0 12px" }}>
            <div className={styles.field}>
              <label className={styles.label}>{t(locale, "termsTitle")}</label>
              <textarea {...register("payment_terms")} className={styles.input} placeholder={t(locale, "termsPlaceholder")} rows={3} style={{ resize: "vertical", minHeight: "60px" }} />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>{t(locale, "notesTitle")}</label>
              <textarea {...register("notes")} className={styles.input} placeholder={t(locale, "notesPlaceholder")} rows={4} style={{ resize: "vertical", minHeight: "80px" }} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Invoice Preview ─────────────────────────────────────────────────── */

function InvoicePreview({
  formData,
  totals,
  vatData,
  isClient,
}: {
  formData: InvoiceFormData;
  totals: ReturnType<typeof calculateInvoiceTotals>;
  vatData: ReturnType<typeof calculateVatData>;
  isClient: boolean;
}) {
  const lang = formData.language;

  const countriesList = getCountriesList(lang);

  const fmtDate = (dateStr: string) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    const loc = lang === "de" ? "de-DE" : "en-US";
    return d.toLocaleDateString(loc, { year: "numeric", month: "short", day: "2-digit" });
  };

  const fmtCurrency = (amount: number) => {
    const loc = lang === "de" ? "de-DE" : "en-US";
    return formatCurrency(amount, formData.currency, loc);
  };

  const countryName = (code: string) => countriesList.find((c) => c.code === code)?.name ?? code;

  return (
    <div className={styles.previewDocument}>
      {/* Header */}
      <div className={styles.previewHeader}>
        <div>
          <p className={styles.previewInvoiceTitle}>{it(lang, "invoice")}</p>
          <p className={styles.previewSmall}>{formData.invoice_number}</p>
        </div>
        <div style={{ textAlign: "right" }}>
          <p className={styles.previewCompanyName}>{formData.company_name}</p>
          <div className={styles.previewSmall}>
            <p>{formData.company_address}</p>
            <p>{formData.company_zip_code} {formData.company_city}</p>
            <p>{countryName(formData.company_country)}</p>
            {formData.company_email && <p>{formData.company_email}</p>}
            {formData.company_phone && <p>{formData.company_phone}</p>}
          </div>
        </div>
      </div>

      {/* Client */}
      <div className={styles.previewSmall}>
        <p style={{ fontWeight: 400, marginBottom: "2px" }}>{formData.client_name}</p>
        <p>{formData.client_address}</p>
        <p>{formData.client_zip_code} {formData.client_city}</p>
        <p>{countryName(formData.client_country)}</p>
        {formData.client_email && <p>Email: {formData.client_email}</p>}
      </div>

      {/* Dates */}
      <div className={styles.previewDates}>
        <div>
          <p className={styles.previewDateLabel}>{it(lang, "invoiceDate")}</p>
          <p className={styles.previewDateValue}>{fmtDate(formData.issue_date)}</p>
        </div>
        {formData.due_date && (
          <div>
            <p className={styles.previewDateLabel}>{it(lang, "dueDate")}</p>
            <p className={styles.previewDateValue}>{fmtDate(formData.due_date)}</p>
          </div>
        )}
        {isClient && formData.sale_type === "goods" && formData.delivery_date && (
          <div>
            <p className={styles.previewDateLabel}>{it(lang, "deliveryDate")}</p>
            <p className={styles.previewDateValue}>{fmtDate(formData.delivery_date)}</p>
          </div>
        )}
        {isClient && formData.sale_type === "services" && formData.service_start_date && (
          <div>
            <p className={styles.previewDateLabel}>{it(lang, "serviceFrom")}</p>
            <p className={styles.previewDateValue}>
              {fmtDate(formData.service_start_date)}
              {formData.service_end_date && `–${fmtDate(formData.service_end_date)}`}
            </p>
          </div>
        )}
      </div>

      {/* Items table */}
      <table className={styles.previewTable}>
        <thead>
          <tr>
            <th>{it(lang, "description")}</th>
            <th>{it(lang, "qty")}</th>
            <th>{it(lang, "unitPrice")}</th>
            <th>{it(lang, "vat")}</th>
            <th>{it(lang, "total")}</th>
          </tr>
        </thead>
        <tbody>
          {formData.invoiced_items.map((item, i) => (
            <tr key={i}>
              <td>{item.description || "Service description"}</td>
              <td>{item.quantity}</td>
              <td>{fmtCurrency(item.unit_price)}</td>
              <td>{item.vat_rate}%</td>
              <td style={{ fontWeight: 600 }}>{fmtCurrency(item.quantity * item.unit_price)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div className={styles.previewTotals}>
        <div className={styles.previewTotalsInner}>
          <div className={styles.previewTotalRow}>
            <span>{it(lang, "subtotal")}</span>
            <span>{fmtCurrency(totals.subtotal)}</span>
          </div>
          {totals.vatBreakdown.map((b) => (
            <div key={b.rate} className={styles.previewTotalRow}>
              <span>{it(lang, "vatAmount")} {b.rate}%:</span>
              <span>{fmtCurrency(b.amount)}</span>
            </div>
          ))}
          <div className={styles.previewGrandTotal}>
            <span>{it(lang, "totalAmount")}</span>
            <span>{fmtCurrency(totals.total)}</span>
          </div>
        </div>
      </div>

      {/* VAT note */}
      {vatData.note && (
        <div className={styles.previewVatNote}>
          <p className={styles.previewVatNoteTitle}>{it(lang, "taxNotice")}</p>
          <p className={styles.previewVatNoteText}>{vatData.note}</p>
          {vatData.isReverseCharge && (
            <p className={styles.previewVatNoteText} style={{ fontStyle: "italic", marginTop: "4px" }}>
              {it(lang, "reverseCharge")}
            </p>
          )}
        </div>
      )}

      {/* Terms */}
      {formData.payment_terms && (
        <div className={styles.previewTerms}>
          <p className={styles.previewTermsTitle}>{it(lang, "terms")}</p>
          <p className={styles.previewTermsText}>{formData.payment_terms}</p>
        </div>
      )}

      {/* Notes */}
      {formData.notes && (
        <div className={styles.previewTerms}>
          <p className={styles.previewTermsTitle}>{it(lang, "notes")}</p>
          <p className={styles.previewTermsText}>{formData.notes}</p>
        </div>
      )}

      {/* Payment / Tax footer */}
      {(formData.iban || formData.bic || formData.bank_name || formData.company_tax_number || formData.company_vat_number) && (
        <div className={styles.previewPaymentFooter}>
          {(formData.iban || formData.bic || formData.bank_name) && (
            <div>
              {formData.bank_name && <div><span style={{ fontWeight: 400 }}>{it(lang, "bank")}</span>: {formData.bank_name}</div>}
              {formData.iban && <div><span style={{ fontWeight: 400 }}>IBAN</span>: {formData.iban}</div>}
              {formData.bic && <div><span style={{ fontWeight: 400 }}>BIC/SWIFT</span>: {formData.bic}</div>}
            </div>
          )}
          {(formData.company_tax_number || formData.company_vat_number) && (
            <div style={{ textAlign: "right" }}>
              {formData.company_tax_number && <div><span style={{ fontWeight: 400 }}>{it(lang, "taxNumber")}</span>: {formData.company_tax_number}</div>}
              {formData.company_vat_number && <div><span style={{ fontWeight: 400 }}>{it(lang, "vatNumber")}</span>: {formData.company_vat_number}</div>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── Features section ────────────────────────────────────���───────────── */

const FEATURE_KEYS = [
  { title: "feature1Title" as const, desc: "feature1Desc" as const, icon: "🎨" },
  { title: "feature2Title" as const, desc: "feature2Desc" as const, icon: "⏱️" },
  { title: "feature3Title" as const, desc: "feature3Desc" as const, icon: "💰" },
  { title: "feature4Title" as const, desc: "feature4Desc" as const, icon: "🔄" },
  { title: "feature5Title" as const, desc: "feature5Desc" as const, icon: "🤖" },
  { title: "feature6Title" as const, desc: "feature6Desc" as const, icon: "🔗" },
];

function FeaturesSection({ locale }: { locale: Locale }) {
  return (
    <div className={styles.features}>
      <div className={styles.featuresHeading}>
        <h2 className={styles.featuresTitle}>{t(locale, "featuresTitle")}</h2>
        <p className={styles.featuresSubtitle}>{t(locale, "featuresDescription")}</p>
      </div>
      <div className={styles.featuresGrid}>
        {FEATURE_KEYS.map((f) => (
          <div key={f.title} className={styles.featureCard}>
            <div className={styles.featureCardHeader}>
              <span className={styles.featureIcon}>{f.icon}</span>
              <h3 className={styles.featureTitle}>{t(locale, f.title)}</h3>
            </div>
            <p className={styles.featureDesc}>{t(locale, f.desc)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
