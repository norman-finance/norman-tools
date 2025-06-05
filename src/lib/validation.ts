import { z } from 'zod';

export const invoiceItemSchema = z.object({
  description: z.string().min(1, 'Description is required').max(200, 'Description too long'),
  quantity: z.number().min(0.01, 'Quantity must be greater than 0').max(999999, 'Quantity too large'),
  unit_price: z.number().min(0.01, 'Unit price must be greater than 0').max(999999, 'Unit price too large'),
  vat_rate: z.number().min(0, 'VAT rate cannot be negative').max(100, 'VAT rate cannot exceed 100%'),
});

export const companyDataSchema = z.object({
  company_name: z.string().min(1, 'Company name is required').max(100, 'Company name too long'),
  company_address: z.string().min(1, 'Company address is required').max(200, 'Address too long'),
  company_zip_code: z.string().min(1, 'ZIP code is required').max(20, 'ZIP code too long'),
  company_city: z.string().min(1, 'City is required').max(100, 'City name too long'),
  company_country: z.string().length(2, 'Country code must be 2 characters'),
  company_email: z.string().email('Invalid email address'),
  company_phone: z.string().max(50, 'Phone number too long').optional(),
  company_tax_number: z.string().max(50, 'Tax number too long').optional(),
  company_vat_number: z.string().max(50, 'VAT number too long').optional(),
});

export const clientDataSchema = z.object({
  client_name: z.string().min(1, 'Client name is required').max(100, 'Client name too long'),
  client_type: z.enum(['person', 'business'], { errorMap: () => ({ message: 'Please select Person or Business' }) }),
  client_address: z.string().min(1, 'Client address is required').max(200, 'Address too long'),
  client_zip_code: z.string().min(1, 'ZIP code is required').max(20, 'ZIP code too long'),
  client_city: z.string().min(1, 'City is required').max(100, 'City name too long'),
  client_country: z.string().length(2, 'Country code must be 2 characters'),
  client_email: z.string().email('Invalid email address').optional().or(z.literal('')),
  client_vat_number: z.string().max(50, 'VAT number too long').optional(),
});

export const invoiceDetailsSchema = z.object({
  invoice_number: z.string().min(1, 'Invoice number is required').max(100, 'Invoice number too long'),
  issue_date: z.string().min(1, 'Issue date is required'),
  due_date: z.string().optional().or(z.literal('')),
  sale_type: z.enum(['services', 'goods'], { errorMap: () => ({ message: 'Please select either Services or Goods' }) }),
  delivery_date: z.string().optional().or(z.literal('')),
  service_start_date: z.string().optional().or(z.literal('')),
  service_end_date: z.string().optional().or(z.literal('')),
});

export const paymentInfoSchema = z.object({
  iban: z.string().max(34, 'IBAN too long').optional(),
  bic: z.string().max(11, 'BIC too long').optional(),
  bank_name: z.string().max(100, 'Bank name too long').optional(),
});

export const invoiceSettingsSchema = z.object({
  currency: z.string().length(3, 'Currency code must be 3 characters'),
  language: z.enum(['en', 'de'], { errorMap: () => ({ message: 'Language must be English or German' }) }),
  is_vat_included: z.boolean(),
  is_kleinunternehmer: z.boolean(),
  payment_terms: z.number().min(1, 'Payment terms must be at least 1 day').max(365, 'Payment terms too long'),
  notes: z.string().max(1000, 'Notes too long').optional(),
  color_schema: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color format'),
  font: z.string().min(1, 'Font is required').max(50, 'Font name too long'),
});

export const invoiceFormSchema = z.object({
  ...companyDataSchema.shape,
  ...clientDataSchema.shape,
  ...invoiceDetailsSchema.shape,
  ...paymentInfoSchema.shape,
  ...invoiceSettingsSchema.shape,
  invoiced_items: z.array(invoiceItemSchema).min(1, 'At least one item is required').max(50, 'Too many items'),
});

export type InvoiceFormData = z.infer<typeof invoiceFormSchema>;
export type InvoiceItem = z.infer<typeof invoiceItemSchema>;

// Validation for German-specific requirements
export const germanInvoiceValidation = (data: InvoiceFormData) => {
  const errors: string[] = [];
  
  if (data.company_country === 'DE') {
    // German companies should have tax number or VAT number
    if (!data.company_tax_number && !data.company_vat_number) {
      errors.push('German companies must provide either a tax number or VAT number');
    }
    
    // VAT number format check for Germany
    if (data.company_vat_number && !data.company_vat_number.match(/^DE\d{9}$/)) {
      errors.push('German VAT number must be in format DE123456789');
    }
  }
  
  // Check for reverse charge scenarios (B2B EU)
  if (data.company_country === 'DE' && 
      data.client_country !== 'DE' && 
      isEUCountry(data.client_country) &&
      data.client_vat_number) {
    // This might be a reverse charge scenario
    const hasZeroVatItems = data.invoiced_items.some((item: InvoiceItem) => item.vat_rate === 0);
    if (!hasZeroVatItems) {
      errors.push('For EU B2B transactions, consider using 0% VAT (reverse charge)');
    }
  }
  
  return errors;
};

// Helper function to check if country is in EU
const isEUCountry = (countryCode: string): boolean => {
  const euCountries = [
    'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR',
    'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL',
    'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE'
  ];
  return euCountries.includes(countryCode);
}; 