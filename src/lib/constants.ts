import { Country, Currency, Font, ColorScheme } from '@/types/invoice';
import countries from 'i18n-iso-countries';
import enLocale from 'i18n-iso-countries/langs/en.json';
import deLocale from 'i18n-iso-countries/langs/de.json';

// Register country locales
countries.registerLocale(enLocale);
countries.registerLocale(deLocale);

export const CLIENT_TYPES = [
  { value: 'person', label: 'Person', icon: '👤' },
  { value: 'business', label: 'Business', icon: '🏢' },
];

// Company is always Germany
export const COMPANY_COUNTRY = { code: 'DE', name: 'Germany' };

// Function to get all countries with proper language support
export const getCountriesList = (language: 'en' | 'de' = 'en'): Country[] => {
  const countryNames = countries.getNames(language, { select: 'official' });
  return Object.entries(countryNames)
    .map(([code, name]) => ({ code, name }))
    .sort((a, b) => a.name.localeCompare(b.name));
};

export const CURRENCIES: Currency[] = [
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'BRL', symbol: 'R$', name: 'Brazilian Real' },
  { code: 'CZK', symbol: 'Kč', name: 'Czech Koruna' },
  { code: 'DKK', symbol: 'kr', name: 'Danish Krone' },
  { code: 'HKD', symbol: 'HK$', name: 'Hong Kong Dollar' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'MXN', symbol: '$', name: 'Mexican Peso' },
  { code: 'ILS', symbol: '₪', name: 'New Israeli Sheqel' },
  { code: 'NZD', symbol: 'NZ$', name: 'New Zealand Dollar' },
  { code: 'NOK', symbol: 'kr', name: 'Norwegian Krone' },
  { code: 'PLN', symbol: 'zł', name: 'Polish Złoty' },
  { code: 'GBP', symbol: '£', name: 'Pound Sterling' },
  { code: 'SEK', symbol: 'kr', name: 'Swedish Krona' },
  { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc' },
  { code: 'TRY', symbol: '₺', name: 'Turkish Lira' },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham' },
];

export const FONTS: Font[] = [
  { name: 'Inter', family: 'Inter, sans-serif' },
  { name: 'Plus Jakarta Sans', family: 'Plus Jakarta Sans, sans-serif' },
  { name: 'EB Garamond', family: 'EB Garamond, serif' },
  { name: 'Montserrat', family: 'Montserrat, sans-serif' },
  { name: 'Lato', family: 'Lato, sans-serif' },
  { name: 'Playfair Display', family: 'Playfair Display, serif' },
  { name: 'Hind', family: 'Hind, sans-serif' },
  { name: 'Teko', family: 'Teko, sans-serif' },
];

export const COLOR_SCHEMES: ColorScheme[] = [
  { name: 'White', value: '#FFFFFF', preview: 'bg-white border-2 border-gray-200' },
  { name: 'Black', value: '#000000', preview: 'bg-black' },
  { name: 'Blue', value: '#3B82F6', preview: 'bg-blue-500' },
  { name: 'Green', value: '#10B981', preview: 'bg-emerald-500' },
  { name: 'Purple', value: '#8B5CF6', preview: 'bg-violet-500' },
  { name: 'Red', value: '#EF4444', preview: 'bg-red-500' },
  { name: 'Orange', value: '#F97316', preview: 'bg-orange-500' },
  { name: 'Pink', value: '#EC4899', preview: 'bg-pink-500' },
];

export const VAT_RATES = [
  { label: '0%', value: 0 },
  { label: '7%', value: 7 },
  { label: '19%', value: 19 },
];

export const PAYMENT_TERMS = [
  { label: '7 days', value: 7 },
  { label: '14 days', value: 14 },
  { label: '30 days', value: 30 },
  { label: '60 days', value: 60 },
  { label: '90 days', value: 90 },
];

export const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
];

export const SALE_TYPES = [
  { value: 'services', label: 'Services', icon: '🛠️' },
  { value: 'goods', label: 'Goods', icon: '📦' },
];

export const DEFAULT_INVOICE_DATA = {
  // Company defaults
  company_name: '',
  company_address: '',
  company_zip_code: '',
  company_city: '',
  company_country: 'DE',
  company_email: '',
  company_phone: '',
  company_tax_number: '',
  company_vat_number: '',
  
  // Client defaults
  client_name: '',
  client_type: 'person' as const,
  client_address: '',
  client_zip_code: '',
  client_city: '',
  client_country: 'DE',
  client_email: '',
  client_vat_number: '',
  
  // Invoice details
  invoice_number: `INV-${new Date().getFullYear()}-001`,
  issue_date: new Date().toISOString().split('T')[0],
  due_date: '',
  sale_type: 'services' as const,
  delivery_date: '',
  service_start_date: '',
  service_end_date: '',
  
  // Payment info
  iban: '',
  bic: '',
  bank_name: '',
  
  // Settings
  currency: 'EUR',
  language: 'en' as const,
  is_vat_included: false,
  is_kleinunternehmer: false,
  payment_terms: 14,
  notes: '',
  color_schema: '#FFFFFF',
  font: 'Inter',
  
  // Items
  invoiced_items: [
    {
      description: 'Consulting Services',
      quantity: 1,
      unit_price: 100,
      vat_rate: 19,
    },
  ],
};

export const API_ENDPOINTS = {
  GENERATE_INVOICE: '/api/v1/invoices/public/generate/',
  GET_STATS: '/api/v1/invoices/public/stats/',
};

export const DEMO_DATA = {
  company: {
    company_name: 'Your Company Name',
    company_address: 'Musterstraße 123',
    company_zip_code: '10115',
    company_city: 'Berlin',
    company_country: 'DE',
    company_email: 'hello@yourcompany.com',
    company_phone: '+49 30 12345678',
    company_tax_number: '12/345/67890',
    company_vat_number: 'DE123456789',
  },
  client: {
    client_name: 'Client Company GmbH',
    client_address: 'Kundenstraße 456',
    client_zip_code: '20095',
    client_city: 'Hamburg',
    client_country: 'DE',
    client_email: 'contact@client.com',
    client_vat_number: 'DE987654321',
  },
}; 