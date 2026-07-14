import type { Country, Currency, InvoiceFormData } from "./types";

export const CLIENT_TYPES = [
  { value: "person" as const, label: "Person", icon: "👤" },
  { value: "business" as const, label: "Business", icon: "🏢" },
];

export const COMPANY_COUNTRY = { code: "DE", name: "Germany" };

export const CURRENCIES: Currency[] = [
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "GBP", symbol: "£", name: "Pound Sterling" },
  { code: "CHF", symbol: "CHF", name: "Swiss Franc" },
  { code: "SEK", symbol: "kr", name: "Swedish Krona" },
  { code: "NOK", symbol: "kr", name: "Norwegian Krone" },
  { code: "DKK", symbol: "kr", name: "Danish Krone" },
  { code: "PLN", symbol: "zł", name: "Polish Złoty" },
  { code: "CZK", symbol: "Kč", name: "Czech Koruna" },
  { code: "BRL", symbol: "R$", name: "Brazilian Real" },
  { code: "HKD", symbol: "HK$", name: "Hong Kong Dollar" },
  { code: "INR", symbol: "₹", name: "Indian Rupee" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen" },
  { code: "MXN", symbol: "$", name: "Mexican Peso" },
  { code: "ILS", symbol: "₪", name: "New Israeli Sheqel" },
  { code: "NZD", symbol: "NZ$", name: "New Zealand Dollar" },
  { code: "TRY", symbol: "₺", name: "Turkish Lira" },
  { code: "AED", symbol: "د.إ", name: "UAE Dirham" },
];

export const VAT_RATES = [
  { label: "0%", value: 0 },
  { label: "7%", value: 7 },
  { label: "19%", value: 19 },
];

export const LANGUAGES = [
  { code: "en" as const, name: "English", flag: "🇺🇸" },
  { code: "de" as const, name: "Deutsch", flag: "🇩🇪" },
];

export const SALE_TYPES = [
  { value: "services" as const, label: "Services", icon: "🛠️" },
  { value: "goods" as const, label: "Goods", icon: "📦" },
];

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_INVOICE_API_URL || "https://api.norman.finance";

export const API_ENDPOINTS = {
  GENERATE_INVOICE: "/api/v1/invoices/public/generate/",
};

export const DEFAULT_INVOICE_DATA: InvoiceFormData = {
  company_name: "",
  company_address: "",
  company_zip_code: "",
  company_city: "",
  company_country: "DE",
  company_email: "",
  company_phone: "",
  company_tax_number: "",
  company_vat_number: "",

  client_name: "",
  client_type: "person",
  client_address: "",
  client_zip_code: "",
  client_city: "",
  client_country: "DE",
  client_email: "",
  client_vat_number: "",

  invoice_number: `RECH-${new Date().getFullYear()}-001`,
  issue_date: new Date().toISOString().split("T")[0],
  due_date: "",
  sale_type: "services",
  delivery_date: "",
  service_start_date: "",
  service_end_date: "",

  iban: "",
  bic: "",
  bank_name: "",

  currency: "EUR",
  language: "en",
  is_vat_included: false,
  is_kleinunternehmer: false,
  payment_terms: "",
  notes: "",
  color_schema: "#FFFFFF",
  font: "Inter",

  invoiced_items: [
    { description: "", quantity: 1, unit_price: 0, vat_rate: 19 },
  ],
};

// Static country list — avoids i18n-iso-countries dependency.
// Top countries with DE translations; rest in EN only.
const COUNTRIES_EN: Country[] = [
  { code: "AF", name: "Afghanistan" }, { code: "AL", name: "Albania" },
  { code: "DZ", name: "Algeria" }, { code: "AR", name: "Argentina" },
  { code: "AU", name: "Australia" }, { code: "AT", name: "Austria" },
  { code: "BE", name: "Belgium" }, { code: "BA", name: "Bosnia and Herzegovina" },
  { code: "BR", name: "Brazil" }, { code: "BG", name: "Bulgaria" },
  { code: "CA", name: "Canada" }, { code: "CL", name: "Chile" },
  { code: "CN", name: "China" }, { code: "CO", name: "Colombia" },
  { code: "HR", name: "Croatia" }, { code: "CY", name: "Cyprus" },
  { code: "CZ", name: "Czech Republic" }, { code: "DK", name: "Denmark" },
  { code: "EG", name: "Egypt" }, { code: "EE", name: "Estonia" },
  { code: "FI", name: "Finland" }, { code: "FR", name: "France" },
  { code: "DE", name: "Germany" }, { code: "GR", name: "Greece" },
  { code: "HK", name: "Hong Kong" }, { code: "HU", name: "Hungary" },
  { code: "IS", name: "Iceland" }, { code: "IN", name: "India" },
  { code: "ID", name: "Indonesia" }, { code: "IE", name: "Ireland" },
  { code: "IL", name: "Israel" }, { code: "IT", name: "Italy" },
  { code: "JP", name: "Japan" }, { code: "KR", name: "South Korea" },
  { code: "LV", name: "Latvia" }, { code: "LT", name: "Lithuania" },
  { code: "LU", name: "Luxembourg" }, { code: "MY", name: "Malaysia" },
  { code: "MT", name: "Malta" }, { code: "MX", name: "Mexico" },
  { code: "NL", name: "Netherlands" }, { code: "NZ", name: "New Zealand" },
  { code: "NG", name: "Nigeria" }, { code: "NO", name: "Norway" },
  { code: "PK", name: "Pakistan" }, { code: "PE", name: "Peru" },
  { code: "PH", name: "Philippines" }, { code: "PL", name: "Poland" },
  { code: "PT", name: "Portugal" }, { code: "RO", name: "Romania" },
  { code: "RU", name: "Russia" }, { code: "SA", name: "Saudi Arabia" },
  { code: "RS", name: "Serbia" }, { code: "SG", name: "Singapore" },
  { code: "SK", name: "Slovakia" }, { code: "SI", name: "Slovenia" },
  { code: "ZA", name: "South Africa" }, { code: "ES", name: "Spain" },
  { code: "SE", name: "Sweden" }, { code: "CH", name: "Switzerland" },
  { code: "TW", name: "Taiwan" }, { code: "TH", name: "Thailand" },
  { code: "TR", name: "Turkey" }, { code: "UA", name: "Ukraine" },
  { code: "AE", name: "United Arab Emirates" }, { code: "GB", name: "United Kingdom" },
  { code: "US", name: "United States" }, { code: "VN", name: "Vietnam" },
];

const COUNTRIES_DE_OVERRIDE: Record<string, string> = {
  AT: "Österreich", BE: "Belgien", BR: "Brasilien", BG: "Bulgarien",
  CN: "China", DK: "Dänemark", DE: "Deutschland", EE: "Estland",
  FI: "Finnland", FR: "Frankreich", GR: "Griechenland", GB: "Großbritannien",
  IE: "Irland", IT: "Italien", JP: "Japan", CA: "Kanada",
  HR: "Kroatien", LV: "Lettland", LT: "Litauen", LU: "Luxemburg",
  NL: "Niederlande", NO: "Norwegen", PL: "Polen", PT: "Portugal",
  RO: "Rumänien", RU: "Russland", SE: "Schweden", CH: "Schweiz",
  SK: "Slowakei", SI: "Slowenien", ES: "Spanien", ZA: "Südafrika",
  KR: "Südkorea", CZ: "Tschechien", TR: "Türkei", HU: "Ungarn",
  US: "Vereinigte Staaten", AE: "Vereinigte Arabische Emirate", CY: "Zypern",
};

export function getCountriesList(language: "en" | "de" = "en"): Country[] {
  if (language === "de") {
    return COUNTRIES_EN.map((c) => ({
      code: c.code,
      name: COUNTRIES_DE_OVERRIDE[c.code] || c.name,
    })).sort((a, b) => a.name.localeCompare(b.name, "de"));
  }
  return [...COUNTRIES_EN].sort((a, b) => a.name.localeCompare(b.name, "en"));
}

export const DEMO_DATA: Partial<InvoiceFormData> = {
  company_name: "Acme GmbH",
  company_address: "Musterstraße 123",
  company_zip_code: "10115",
  company_city: "Berlin",
  company_country: "DE",
  company_email: "hello@acme.com",
  company_phone: "+49 30 12345678",
  company_vat_number: "DE123456789",
  company_tax_number: "12/345/67890",

  client_name: "Max Mustermann",
  client_type: "business",
  client_address: "Hamburger Straße 456",
  client_zip_code: "20095",
  client_city: "Hamburg",
  client_country: "DE",
  client_email: "max@mustermann.de",
  client_vat_number: "DE987654321",
  payment_terms: "Bitte zahlen Sie innerhalb von 14 Tagen",
  iban: "DE1234567890",
  bic: "COBADEHD001",
  bank_name: "Commerzbank",

  sale_type: "services",
  language: "de",

  invoiced_items: [
    { description: "Webentwicklung", quantity: 40, unit_price: 85, vat_rate: 19 },
    { description: "Beratung & Strategie", quantity: 8, unit_price: 120, vat_rate: 19 },
  ],
};
