'use client';

import React, { useState, useEffect } from 'react';
import { InvoiceFormData } from '@/lib/validation';
import { InvoiceItem } from '@/types/invoice';
import { CURRENCIES, FONTS, getCountriesList } from '@/lib/constants';
import { formatCurrency, CalculatedTotals } from '@/utils/calculations';
import { calculateVatData } from '@/lib/vat-calculations';
import { getInvoiceTranslationFunction } from '@/utils/invoiceTranslations';

interface InvoicePreviewProps {
  data: InvoiceFormData;
  totals: CalculatedTotals;
  className?: string;
}

export default function InvoicePreview({ data, totals, className = '' }: InvoicePreviewProps) {
  const { 
    company_name, company_address, company_zip_code, company_city, company_country,
    client_name, client_address, client_zip_code, client_city, client_country,
    invoice_number, issue_date, due_date, currency, language, invoiced_items, notes,
    payment_terms, company_email, company_phone, company_tax_number, company_vat_number,
    client_email, client_vat_number, color_schema, iban, bic, bank_name, sale_type,
    delivery_date, service_start_date, service_end_date
  } = data;

  const [isClient, setIsClient] = React.useState(false);
  const [it, setIt] = React.useState<((key: string) => string) | null>(null);
  
  const currencyObj = CURRENCIES.find(c => c.code === currency);
  const selectedFont = FONTS.find(f => f.name === data.font);
  
  // Load invoice translations when language changes
  React.useEffect(() => {
    const loadTranslations = async () => {
      const translationFunction = await getInvoiceTranslationFunction(language as 'en' | 'de');
      setIt(() => translationFunction);
    };
    
    loadTranslations();
  }, [language]);
  
  // Hydration-safe countries list
  const [countriesList, setCountriesList] = useState(() => getCountriesList('en'));
  
  // Update countries list when language changes (client-side only)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCountriesList(getCountriesList(language));
    }
  }, [language]);
  
  // Calculate VAT data for notes
  const vatData = React.useMemo(() => {
    return calculateVatData({ formData: data, language: language });
  }, [data]);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  // If translations haven't loaded yet, return loading state
  if (!it) {
    return (
      <div className={className} style={{ 
        background: '#ffffff',
        border: 'var(--border-line)',
        borderRadius: '12px',
        padding: '2rem',
        textAlign: 'center',
        color: '#6b7280'
      }}>
        Loading preview...
      </div>
    );
  }

  const formatDateDisplay = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    
    // Use format like "Jun 01, 2025" for both languages
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: '2-digit'
    };
    
    const locale = language === 'de' ? 'de-DE' : 'en-US';
    return date.toLocaleDateString(locale, options);
  };

  const formatCurrencyDisplay = (amount: number) => {
    const locale = language === 'de' ? 'de-DE' : 'en-US';
    return formatCurrency(amount, currency, locale);
  };

  return (
    <div 
      className={className}
      style={{ 
        fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
        color: color_schema === '#FFFFFF' ? '#000000' : color_schema,
        background: '#ffffff',
        border: 'var(--border-line)',
        borderRadius: '4px',
        overflow: 'hidden'
      }}
    >
      <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* Header */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'flex-start',
          paddingBottom: '1.5rem',
          borderBottom: 'var(--border-line)'
        }}>
          <div>
            <h1 style={{ 
              fontSize: '1.5rem', 
              fontWeight: '600', 
              marginBottom: '0.5rem',
            }}>
              {it('headers.invoice')}
            </h1>
            <p style={{ 
              fontSize: '0.875rem',
              fontWeight: '400'
            }}>
              {invoice_number}
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <h2 style={{ 
              fontSize: '1rem', 
              fontWeight: '600',
              marginBottom: '0.5rem'
            }}>
              {company_name}
            </h2>
            <div style={{ 
              fontSize: '0.75rem', 
              lineHeight: '1.4'
            }}>
              <p>{company_address}</p>
              <p>{company_zip_code} {company_city}</p>
              <p>{countriesList.find(c => c.code === company_country)?.name}</p>
              {company_email && <p>{company_email}</p>}
              {company_phone && <p>{company_phone}</p>}
            </div>
          </div>
        </div>

        {/* Company Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* To */}
          <div>
            <div style={{ fontSize: '0.75rem', lineHeight: '1.4' }}>
              <p style={{ fontWeight: '400', marginBottom: '0.25rem' }}>{client_name}</p>
              <p>{client_address}</p>
              <p>{client_zip_code} {client_city}</p>
              <p>{countriesList.find(c => c.code === client_country)?.name}</p>
              {client_email && <p>Email: {client_email}</p>}
              {/*{client_vat_number && (
                <p>{it('tax.vatNumber')} {client_vat_number}</p>
              )}*/}
            </div>
          </div>
        </div>

        {/* Invoice Details */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4" style={{ fontSize: '0.75rem' }}>
          <div>
            <p style={{ fontWeight: '600', color: '#111827', marginBottom: '0.25rem' }}>
              {it('dates.invoiceDate')}
            </p>
            <p>{formatDateDisplay(issue_date)}</p>
          </div>
          {due_date && (
            <div>
              <p style={{ fontWeight: '600', color: '#111827', marginBottom: '0.25rem' }}>
                {it('dates.dueDate')}
              </p>
              <p>{formatDateDisplay(due_date)}</p>
            </div>
          )}
          {isClient && sale_type === 'goods' && delivery_date && (
            <div>
              <p style={{ fontWeight: '600', color: '#111827', marginBottom: '0.25rem' }}>
                {it('dates.deliveryDate')}
              </p>
              <p>{formatDateDisplay(delivery_date)}</p>
            </div>
          )}
          {isClient && sale_type === 'services' && service_start_date && (
            <div>
              <p style={{ fontWeight: '600', color: '#111827', marginBottom: '0.25rem' }}>
                {it('dates.serviceFrom')}
              </p>
              <p>
                {formatDateDisplay(service_start_date)}
                {service_end_date && ` - ${formatDateDisplay(service_end_date)}`}
              </p>
            </div>
          )}
        </div>

        {/* Items Table */}
        <div style={{ 
          overflowX: 'auto',
        }}>
          <table style={{ 
            width: '100%', 
            fontSize: '0.75rem',
            borderCollapse: 'collapse'
          }}>
            <thead>
              <tr style={{ 
                borderBottom: 'var(--border-line)'
              }}>
                <th style={{ 
                  textAlign: 'left', 
                  padding: '0.75rem', 
                  fontWeight: '600',
                }}>
{it('table.description')}
                </th>
                <th style={{ 
                  textAlign: 'center', 
                  padding: '0.75rem', 
                  fontWeight: '600'
                }}>
{it('table.qty')}
                </th>
                <th style={{ 
                  textAlign: 'right', 
                  padding: '0.75rem', 
                  fontWeight: '600',
                }}>
{it('table.unitPrice')}
                </th>
                <th style={{ 
                  textAlign: 'center', 
                  padding: '0.75rem', 
                  fontWeight: '600',
                }}>
                  {it('table.vat')}
                </th>
                <th style={{ 
                  textAlign: 'right', 
                  padding: '0.75rem', 
                  fontWeight: '600',
                }}>
                  {it('table.total')}
                </th>
              </tr>
            </thead>
            <tbody>
              {invoiced_items.map((item: InvoiceItem, index: number) => {
                const lineTotal = item.quantity * item.unit_price;
                return (
                  <tr key={index} style={{ 
                    borderBottom: index < invoiced_items.length - 1 ? '1px solid #f3f4f6' : 'none',
                    background: index % 2 === 0 ? '#ffffff' : '#fafafa'
                  }}>
                    <td style={{ 
                      padding: '0.75rem',
                    }}>
                      {item.description || 'Service description'}
                    </td>
                    <td style={{ 
                      textAlign: 'center', 
                      padding: '0.75rem',
                      fontWeight: '400'
                    }}>
                      {item.quantity}
                    </td>
                    <td style={{ 
                      textAlign: 'right', 
                      padding: '0.75rem',
                      fontFamily: 'monospace'
                    }}>
                      {formatCurrencyDisplay(item.unit_price)}
                    </td>
                    <td style={{ 
                      textAlign: 'center', 
                      padding: '0.75rem',
                    }}>
                      {item.vat_rate}%
                    </td>
                    <td style={{ 
                      textAlign: 'right', 
                      padding: '0.75rem',
                      fontWeight: '600',
                      fontFamily: 'monospace'
                    }}>
                      {formatCurrencyDisplay(lineTotal)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{ 
            width: '20rem',
            borderTop: 'var(--border-line)',
            borderRadius: '4px',
            padding: '1.5rem'
          }}>
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '0.75rem',
              fontSize: '0.875rem'
            }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
              }}>
                <span>{it('totals.subtotal')}</span>
                <span style={{ fontFamily: 'monospace' }}>
                  {formatCurrencyDisplay(totals.subtotal)}
                </span>
              </div>
              
              {totals.vatBreakdown.map((breakdown) => (
                <div key={breakdown.rate} style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                }}>
                  <span>
                    {it('totals.vatAmount')} {breakdown.rate}%:
                  </span>
                  <span style={{ fontFamily: 'monospace' }}>
                    {formatCurrencyDisplay(breakdown.amount)}
                  </span>
                </div>
              ))}
              
              <div>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  fontWeight: '700',
                  fontSize: '1.125rem',
                }}>
                  <span>{it('totals.totalAmount')}</span>
                  <span style={{ fontFamily: 'monospace' }}>
                    {formatCurrencyDisplay(totals.total)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* VAT Note */}
        {vatData.note && (
          <div style={{ 
            padding: '1rem',
            background: '#f9fafb',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            marginTop: '1rem'
          }}>
            <div>
              <h3 style={{ 
                fontSize: '0.875rem',
                fontWeight: '600',
                color: '#374151',
                margin: '0 0 0.5rem 0'
              }}>
                {it('tax.taxNotice')}
              </h3>
              <p style={{ 
                fontSize: '0.875rem',
                color: '#6b7280',
                margin: '0',
                lineHeight: '1.5'
              }}>
                {vatData.note}
              </p>
              {vatData.isReverseCharge && (
                <p style={{ 
                  fontSize: '0.8rem',
                  color: '#9ca3af',
                  margin: '0.5rem 0 0 0',
                  fontStyle: 'italic'
                }}>
                  {it('tax.reverseCharge')}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Terms & Conditions */}
        {payment_terms && (
          <div style={{ 
            padding: '1rem',
            border: 'var(--border-line)',
            borderRadius: '4px',
            marginTop: '1rem'
          }}>
            <h3 style={{ 
              fontSize: '0.875rem',
              fontWeight: '600',
              margin: '0 0 0.5rem 0'
            }}>
              {it('termsConditions.title')}
            </h3>
            <p style={{ 
              fontSize: '0.875rem',
              margin: '0',
              lineHeight: '1.5',
              whiteSpace: 'pre-wrap'
            }}>
              {payment_terms}
            </p>
          </div>
        )}

        {/* Notes */}
        {notes && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">
              {it('notes.title')}
            </h3>
            <p className="text-sm whitespace-pre-wrap">{notes}</p>
          </div>
        )}

        {/* Footer with Payment and Tax Details */}
        {(iban || bic || bank_name || company_tax_number || company_vat_number) && (
          <div style={{ 
            marginTop: '2rem',
            paddingTop: '1rem',
            borderTop: 'var(--border-line)'
          }}>
            <div style={{ 
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '0.75rem',
              lineHeight: '1.5'
            }}>
              {/* Payment Information */}
              {(iban || bic || bank_name) && (
                <div>
                  {bank_name && (
                    <div>
                      <span style={{ fontWeight: '400' }}>
                        {it('payment.bank')}
                      </span>
                      {': '}{bank_name}
                    </div>
                  )}
                  {iban && (
                    <div>
                      <span style={{ fontWeight: '400' }}>IBAN</span>
                      {': '}{iban}
                    </div>
                  )}
                  {bic && (
                    <div>
                      <span style={{ fontWeight: '400' }}>BIC/SWIFT</span>
                      {': '}{bic}
                    </div>
                  )}
                </div>
              )}
              
              {/* Tax Information */}
              {(company_tax_number || company_vat_number) && (
                <div style={{ textAlign: 'right' }}>
                  {company_tax_number && (
                    <div>
                      <span style={{ fontWeight: '400' }}>
                        {it('tax.taxNumber')}
                      </span>
                      {': '}{company_tax_number}
                    </div>
                  )}
                  {company_vat_number && (
                    <div>
                        <span style={{ fontWeight: '400' }}>
                        {it('tax.vatNumber')}
                      </span>
                      {': '}{company_vat_number}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 