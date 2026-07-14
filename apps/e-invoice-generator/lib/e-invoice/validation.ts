import { z } from "zod";

export const EU_COUNTRIES = [
  "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR",
  "DE", "GR", "HU", "IE", "IT", "LV", "LT", "LU", "MT", "NL",
  "PL", "PT", "RO", "SK", "SI", "ES", "SE",
] as const;

export function isEUCountry(countryCode: string): boolean {
  return (EU_COUNTRIES as readonly string[]).includes(countryCode);
}

export const invoiceItemSchema = z.object({
  description: z.string().min(1, "Description is required").max(200, "Description too long"),
  quantity: z.number().min(0.01, "Quantity must be greater than 0").max(999999, "Quantity too large"),
  unit_price: z.number().min(0.01, "Unit price must be greater than 0").max(999999, "Unit price too large"),
  vat_rate: z.number().min(0, "VAT rate cannot be negative").max(100, "VAT rate cannot exceed 100%"),
});

export const invoiceFormSchema = z.object({
  company_name: z.string().min(1, "Company name is required").max(100),
  company_address: z.string().min(1, "Company address is required").max(200),
  company_zip_code: z.string().min(1, "ZIP code is required").max(20),
  company_city: z.string().min(1, "City is required").max(100),
  company_country: z.string().length(2, "Country code must be 2 characters"),
  company_email: z.string().optional(),
  company_phone: z.string().max(50).optional(),
  company_tax_number: z.string().max(50).optional(),
  company_vat_number: z.string().max(50).optional(),

  client_name: z.string().min(1, "Client name is required").max(100),
  client_type: z.enum(["person", "business"]),
  client_address: z.string().min(1, "Client address is required").max(200),
  client_zip_code: z.string().min(1, "ZIP code is required").max(20),
  client_city: z.string().min(1, "City is required").max(100),
  client_country: z.string().length(2, "Country code must be 2 characters"),
  client_email: z.string().email("Invalid email").optional().or(z.literal("")),
  client_vat_number: z.string().max(50).optional(),

  invoice_number: z.string().min(1, "Invoice number is required").max(100),
  issue_date: z.string().min(1, "Issue date is required"),
  due_date: z.string().optional().or(z.literal("")),
  sale_type: z.enum(["services", "goods"]),
  delivery_date: z.string().optional().or(z.literal("")),
  service_start_date: z.string().optional().or(z.literal("")),
  service_end_date: z.string().optional().or(z.literal("")),

  iban: z.string().max(34).optional(),
  bic: z.string().max(11).optional(),
  bank_name: z.string().max(100).optional(),

  currency: z.string().length(3),
  language: z.enum(["en", "de"]),
  is_vat_included: z.boolean(),
  is_kleinunternehmer: z.boolean(),
  payment_terms: z.string().optional(),
  notes: z.string().max(1000).optional(),
  color_schema: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid color format"),
  font: z.string().min(1).max(50),

  invoiced_items: z.array(invoiceItemSchema).min(1, "At least one item is required").max(50),
});

export type InvoiceFormData = z.infer<typeof invoiceFormSchema>;
export type InvoiceItemData = z.infer<typeof invoiceItemSchema>;
