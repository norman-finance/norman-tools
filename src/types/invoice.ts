export interface InvoiceItem {
  description: string;
  quantity: number;
  unit_price: number;
  vat_rate: number;
}

export interface CompanyData {
  company_name: string;
  company_address: string;
  company_zip_code: string;
  company_city: string;
  company_country: string;
  company_email: string;
  company_phone?: string;
  company_tax_number?: string;
  company_vat_number?: string;
}

export interface ClientData {
  client_name: string;
  client_type: 'person' | 'business';
  client_address: string;
  client_zip_code: string;
  client_city: string;
  client_country: string;
  client_email?: string;
  client_vat_number?: string;
}

export interface InvoiceDetails {
  invoice_number: string;
  issue_date: string;
  due_date?: string;
  sale_type: 'services' | 'goods';
  delivery_date?: string;
  service_start_date?: string;
  service_end_date?: string;
}

export interface PaymentInfo {
  iban?: string;
  bic?: string;
  bank_name?: string;
}

export interface InvoiceSettings {
  currency: string;
  language: 'en' | 'de';
  is_vat_included: boolean;
  is_kleinunternehmer: boolean;
  payment_terms?: string;
  notes?: string;
  color_schema: string;
  font: string;
}

export interface InvoiceFormData extends 
  CompanyData, 
  ClientData, 
  InvoiceDetails, 
  PaymentInfo, 
  InvoiceSettings {
  invoiced_items: InvoiceItem[];
}

export interface InvoicePreviewData {
  company: CompanyData;
  client: ClientData;
  details: InvoiceDetails;
  items: InvoiceItem[];
  payment: PaymentInfo;
  settings: InvoiceSettings;
  totals: {
    subtotal: number;
    vat: number;
    total: number;
  };
}

export interface Country {
  code: string;
  name: string;
}

export interface Currency {
  code: string;
  symbol: string;
  name: string;
}

export interface Font {
  name: string;
  family: string;
}

export interface ColorScheme {
  name: string;
  value: string;
  preview: string;
}

export interface InvoiceStats {
  total_invoices: number;
  invoices_today: number;
  invoices_this_month: number;
  popular_currencies: string[];
  popular_countries: string[];
} 