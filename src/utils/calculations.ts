import { InvoiceItem } from '@/types/invoice';

export interface CalculatedTotals {
  subtotal: number;
  vatAmount: number;
  total: number;
  vatBreakdown: Array<{
    rate: number;
    amount: number;
    base: number;
  }>;
}

export const calculateInvoiceTotals = (
  items: InvoiceItem[],
  isVatIncluded: boolean = false
): CalculatedTotals => {
  let subtotal = 0;
  let vatAmount = 0;
  let total = 0;
  const vatBreakdown: { [key: number]: { amount: number; base: number } } = {};

  items.forEach((item) => {
    const quantity = Number(item.quantity);
    const unitPrice = Number(item.unit_price);
    const vatRate = Number(item.vat_rate);

    if (isVatIncluded) {
      // Price includes VAT
      const grossAmount = quantity * unitPrice;
      const netAmount = grossAmount / (1 + vatRate / 100);
      const itemVatAmount = grossAmount - netAmount;

      subtotal += netAmount;
      vatAmount += itemVatAmount;
      total += grossAmount;

      // Track VAT breakdown
      if (!vatBreakdown[vatRate]) {
        vatBreakdown[vatRate] = { amount: 0, base: 0 };
      }
      vatBreakdown[vatRate].amount += itemVatAmount;
      vatBreakdown[vatRate].base += netAmount;
    } else {
      // Price excludes VAT
      const netAmount = quantity * unitPrice;
      const itemVatAmount = netAmount * (vatRate / 100);
      const grossAmount = netAmount + itemVatAmount;

      subtotal += netAmount;
      vatAmount += itemVatAmount;
      total += grossAmount;

      // Track VAT breakdown
      if (!vatBreakdown[vatRate]) {
        vatBreakdown[vatRate] = { amount: 0, base: 0 };
      }
      vatBreakdown[vatRate].amount += itemVatAmount;
      vatBreakdown[vatRate].base += netAmount;
    }
  });

  // Convert VAT breakdown to array format
  const vatBreakdownArray = Object.entries(vatBreakdown).map(([rate, data]) => ({
    rate: Number(rate),
    amount: Number(data.amount.toFixed(2)),
    base: Number(data.base.toFixed(2)),
  }));

  return {
    subtotal: Number(subtotal.toFixed(2)),
    vatAmount: Number(vatAmount.toFixed(2)),
    total: Number(total.toFixed(2)),
    vatBreakdown: vatBreakdownArray,
  };
};

export const calculateItemTotal = (
  quantity: number,
  unitPrice: number,
  vatRate: number,
  isVatIncluded: boolean = false
): { net: number; vat: number; gross: number } => {
  const qty = Number(quantity);
  const price = Number(unitPrice);
  const rate = Number(vatRate);

  if (isVatIncluded) {
    const gross = qty * price;
    const net = gross / (1 + rate / 100);
    const vat = gross - net;
    
    return {
      net: Number(net.toFixed(2)),
      vat: Number(vat.toFixed(2)),
      gross: Number(gross.toFixed(2)),
    };
  } else {
    const net = qty * price;
    const vat = net * (rate / 100);
    const gross = net + vat;
    
    return {
      net: Number(net.toFixed(2)),
      vat: Number(vat.toFixed(2)),
      gross: Number(gross.toFixed(2)),
    };
  }
};

export const formatCurrency = (
  amount: number,
  currency: string = 'EUR',
  locale: string = 'de-DE'
): string => {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch (error) {
    // Fallback formatting
    const symbol = getCurrencySymbol(currency);
    return `${symbol}${amount.toFixed(2)}`;
  }
};

export const formatNumber = (
  value: number,
  decimals: number = 2,
  locale: string = 'de-DE'
): string => {
  try {
    return new Intl.NumberFormat(locale, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value);
  } catch (error) {
    return value.toFixed(decimals);
  }
};

export const getCurrencySymbol = (currency: string): string => {
  const symbols: { [key: string]: string } = {
    EUR: '€',
    USD: '$',
    GBP: '£',
    CHF: 'CHF',
    SEK: 'kr',
    NOK: 'kr',
    DKK: 'kr',
    PLN: 'zł',
    CZK: 'Kč',
    HUF: 'Ft',
  };
  return symbols[currency] || currency;
};

export const generateInvoiceNumber = (prefix: string = 'INV'): string => {
  const year = new Date().getFullYear();
  const month = String(new Date().getMonth() + 1).padStart(2, '0');
  const day = String(new Date().getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  
  return `${prefix}-${year}${month}${day}-${random}`;
};

export const calculateDueDate = (issueDate: string, paymentTerms: number): string => {
  const issue = new Date(issueDate);
  const due = new Date(issue);
  due.setDate(due.getDate() + paymentTerms);
  return due.toISOString().split('T')[0];
};

export const validateIBAN = (iban: string): boolean => {
  // Remove spaces and convert to uppercase
  const cleanIban = iban.replace(/\s/g, '').toUpperCase();
  
  // Check length (15-34 characters)
  if (cleanIban.length < 15 || cleanIban.length > 34) {
    return false;
  }
  
  // Check format (2 letters + 2 digits + alphanumeric)
  if (!/^[A-Z]{2}[0-9]{2}[A-Z0-9]+$/.test(cleanIban)) {
    return false;
  }
  
  // Basic IBAN checksum validation (simplified)
  try {
    const rearranged = cleanIban.slice(4) + cleanIban.slice(0, 4);
    const numericString = rearranged.replace(/[A-Z]/g, (char) => 
      (char.charCodeAt(0) - 55).toString()
    );
    
    // For large numbers, we need to use a different approach
    let remainder = 0;
    for (let i = 0; i < numericString.length; i++) {
      remainder = (remainder * 10 + parseInt(numericString[i])) % 97;
    }
    
    return remainder === 1;
  } catch {
    return false;
  }
};

export const validateBIC = (bic: string): boolean => {
  // Remove spaces and convert to uppercase
  const cleanBic = bic.replace(/\s/g, '').toUpperCase();
  
  // BIC format: 4 letters (bank) + 2 letters (country) + 2 alphanumeric (location) + optional 3 alphanumeric (branch)
  return /^[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}([A-Z0-9]{3})?$/.test(cleanBic);
};

export const isValidVATNumber = (vatNumber: string, countryCode: string): boolean => {
  const cleanVat = vatNumber.replace(/\s/g, '').toUpperCase();
  
  // Basic validation patterns for common countries
  const patterns: { [key: string]: RegExp } = {
    DE: /^DE\d{9}$/,
    FR: /^FR[A-Z0-9]{2}\d{9}$/,
    GB: /^GB\d{9}$|^GB\d{12}$|^GBGD\d{3}$|^GBHA\d{3}$/,
    IT: /^IT\d{11}$/,
    ES: /^ES[A-Z0-9]\d{7}[A-Z0-9]$/,
    NL: /^NL\d{9}B\d{2}$/,
    AT: /^ATU\d{8}$/,
    BE: /^BE0\d{9}$/,
    DK: /^DK\d{8}$/,
    FI: /^FI\d{8}$/,
    IE: /^IE\d[A-Z0-9]\d{5}[A-Z]$/,
    LU: /^LU\d{8}$/,
    PT: /^PT\d{9}$/,
    SE: /^SE\d{12}$/,
  };
  
  const pattern = patterns[countryCode];
  return pattern ? pattern.test(cleanVat) : cleanVat.length > 0;
}; 