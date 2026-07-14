import type { InvoiceFormData } from "./types";
import { isEUCountry } from "./validation";

interface VatData {
  isVatZero: boolean;
  isVatNumberRequired: boolean;
  isReverseCharge: boolean;
  note?: string;
}

const VAT_NOTES = {
  en: {
    noVat19: "According to § 19 UStG no VAT is charged.",
    reverseCharge196: "Reverse Charge - art. 196 VAT Directive 2006/112/CE.",
    taxable3a: "According to §3a Abs. 2 UStG taxable at the recipient location.",
    taxFree: "Tax free export delivery.",
    reverseCharge138: "Reverse Charge - art. 138 par. 1 VAT Directive 2006/112/CE.",
    ustg4: "Value added tax-free service according to § 4 UStG.",
  },
  de: {
    noVat19: "Gemäß § 19 UStG wird keine USt berechnet.",
    reverseCharge196: "Reverse-Charge - Art. 196 MwSt-Richtlinie 2006/112/EG.",
    taxable3a: "Gemäß §3a Abs. 2 UStG steuerpflichtig am Empfängerort.",
    taxFree: "Steuerfreie Ausfuhrlieferung.",
    reverseCharge138: "Reverse-Charge - Art. 138 Abs. 1 MwSt-Richtlinie 2006/112/EG.",
    ustg4: "Umsatzsteuerfreie Leistung gemäß § 4 UStG.",
  },
} as const;

function isGermany(country: string) {
  return country === "DE" || country === "Germany";
}

export function calculateVatData(formData: InvoiceFormData, language: "en" | "de"): VatData {
  const result: VatData = {
    isVatZero: false,
    isVatNumberRequired: false,
    isReverseCharge: false,
    note: undefined,
  };

  const notes = VAT_NOTES[language];

  if (formData.is_kleinunternehmer) {
    result.isVatZero = true;
    result.note = notes.noVat19;

    if (formData.client_type === "business" && !isGermany(formData.client_country)) {
      if (isEUCountry(formData.client_country) && formData.sale_type === "services") {
        result.isVatNumberRequired = true;
        result.isReverseCharge = true;
        result.note = notes.reverseCharge196;
      } else if (!isEUCountry(formData.client_country)) {
        result.note = formData.sale_type === "services" ? notes.taxable3a : notes.taxFree;
      }
    }
  } else {
    if (formData.client_type === "business" && isEUCountry(formData.client_country)) {
      if (!isGermany(formData.client_country)) {
        result.isVatZero = true;
        result.isVatNumberRequired = true;
        result.isReverseCharge = true;
        result.note = formData.sale_type === "services" ? notes.reverseCharge196 : notes.reverseCharge138;
      }
    } else if (!isEUCountry(formData.client_country)) {
      result.isVatZero = true;
      result.note = formData.sale_type === "services" ? notes.taxable3a : notes.taxFree;
    }
  }

  if (
    !formData.is_kleinunternehmer &&
    isGermany(formData.client_country) &&
    formData.invoiced_items.some((item) => item.vat_rate === 0)
  ) {
    result.note = notes.ustg4;
  }

  return result;
}

export function getRecommendedVatRate(formData: InvoiceFormData): number {
  const vatData = calculateVatData(formData, formData.language);
  return vatData.isVatZero ? 0 : 19;
}

export function validateVatSetup(formData: InvoiceFormData): string[] {
  const errors: string[] = [];

  if (formData.is_kleinunternehmer) {
    const hasNonZeroVat = formData.invoiced_items.some((item) => item.vat_rate > 0);
    if (hasNonZeroVat) {
      errors.push(
        formData.language === "en"
          ? "VAT rate should be 0% for Kleinunternehmer"
          : "USt-Satz sollte 0% für Kleinunternehmer sein",
      );
    }
  }

  return errors;
}
