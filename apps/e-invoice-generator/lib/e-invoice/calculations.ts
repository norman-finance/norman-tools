import type { InvoiceItem } from "./types";

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

export function calculateInvoiceTotals(
  items: InvoiceItem[],
  isVatIncluded = false,
): CalculatedTotals {
  let subtotal = 0;
  let vatAmount = 0;
  let total = 0;
  const vatBreakdown: Record<number, { amount: number; base: number }> = {};

  for (const item of items) {
    const quantity = Number(item.quantity);
    const unitPrice = Number(item.unit_price);
    const vatRate = Number(item.vat_rate);

    if (isVatIncluded) {
      const grossAmount = quantity * unitPrice;
      const netAmount = grossAmount / (1 + vatRate / 100);
      const itemVat = grossAmount - netAmount;

      subtotal += netAmount;
      vatAmount += itemVat;
      total += grossAmount;

      if (!vatBreakdown[vatRate]) vatBreakdown[vatRate] = { amount: 0, base: 0 };
      vatBreakdown[vatRate].amount += itemVat;
      vatBreakdown[vatRate].base += netAmount;
    } else {
      const netAmount = quantity * unitPrice;
      const itemVat = netAmount * (vatRate / 100);
      const grossAmount = netAmount + itemVat;

      subtotal += netAmount;
      vatAmount += itemVat;
      total += grossAmount;

      if (!vatBreakdown[vatRate]) vatBreakdown[vatRate] = { amount: 0, base: 0 };
      vatBreakdown[vatRate].amount += itemVat;
      vatBreakdown[vatRate].base += netAmount;
    }
  }

  return {
    subtotal: Number(subtotal.toFixed(2)),
    vatAmount: Number(vatAmount.toFixed(2)),
    total: Number(total.toFixed(2)),
    vatBreakdown: Object.entries(vatBreakdown).map(([rate, data]) => ({
      rate: Number(rate),
      amount: Number(data.amount.toFixed(2)),
      base: Number(data.base.toFixed(2)),
    })),
  };
}

export function formatCurrency(
  amount: number,
  currency = "EUR",
  locale = "de-DE",
): string {
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `€${amount.toFixed(2)}`;
  }
}

export function formatNumber(value: number, decimals = 2, locale = "de-DE"): string {
  try {
    return new Intl.NumberFormat(locale, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value);
  } catch {
    return value.toFixed(decimals);
  }
}
