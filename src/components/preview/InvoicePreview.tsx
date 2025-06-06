import React from 'react';
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
  const [isClient, setIsClient] = React.useState(false);
  const [it, setIt] = React.useState<((key: string) => string) | null>(null);
  
  const currency = CURRENCIES.find(c => c.code === data.currency);
  const selectedFont = FONTS.find(f => f.name === data.font);
  
  // Load invoice translations when language changes
  React.useEffect(() => {
    const loadTranslations = async () => {
      const translationFunction = await getInvoiceTranslationFunction(data.language as 'en' | 'de');
      setIt(() => translationFunction);
    };
    
    loadTranslations();
  }, [data.language]);
  
  // Get countries list and find specific countries
  const countriesList = React.useMemo(() => getCountriesList(data.language), [data.language]);
  const companyCountry = countriesList.find(c => c.code === data.company_country);
  const clientCountry = countriesList.find(c => c.code === data.client_country);
  
  // Calculate VAT data for notes
  const vatData = React.useMemo(() => {
    return calculateVatData({ formData: data, language: data.language });
  }, [data]);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  // If translations haven't loaded yet, return loading state
  if (!it) {
    return (
      <div className={className} style={{ 
        background: '#ffffff',
        border: '1px solid #e5e7eb',
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
    
    const locale = data.language === 'de' ? 'de-DE' : 'en-US';
    return date.toLocaleDateString(locale, options);
  };

  const formatCurrencyDisplay = (amount: number) => {
    const locale = data.language === 'de' ? 'de-DE' : 'en-US';
    return formatCurrency(amount, data.currency, locale);
  };

  return (
    <div 
      className={className}
      style={{ 
        fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
        color: data.color_schema === '#FFFFFF' ? '#000000' : data.color_schema,
        background: '#ffffff',
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
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
          borderBottom: '2px solid #f3f4f6'
        }}>
          <div>
            <h1 style={{ 
              fontSize: '1.5rem', 
              fontWeight: 'bold', 
              marginBottom: '0.5rem',
              color: '#000000'
            }}>
              {it('headers.invoice')}
            </h1>
            <p style={{ 
              color: '#6b7280', 
              fontSize: '0.875rem',
              fontWeight: '500'
            }}>
              {data.invoice_number}
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <h2 style={{ 
              fontSize: '1rem', 
              fontWeight: '600',
              color: '#000000',
              marginBottom: '0.5rem'
            }}>
              {data.company_name}
            </h2>
            <div style={{ 
              fontSize: '0.75rem', 
              color: '#6b7280', 
              lineHeight: '1.4'
            }}>
              <p>{data.company_address}</p>
              <p>{data.company_zip_code} {data.company_city}</p>
              <p>{companyCountry?.name}</p>
              {data.company_email && <p>{data.company_email}</p>}
              {data.company_phone && <p>{data.company_phone}</p>}
            </div>
          </div>
        </div>

        {/* Company Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* To */}
          <div>
            <div style={{ fontSize: '0.75rem', lineHeight: '1.4' }}>
              <p style={{ fontWeight: '500', marginBottom: '0.25rem' }}>{data.client_name}</p>
              <p>{data.client_address}</p>
              <p>{data.client_zip_code} {data.client_city}</p>
              <p>{clientCountry?.name}</p>
              {data.client_email && <p>Email: {data.client_email}</p>}
              {data.client_vat_number && (
                <p>{it('tax.vatNumber')} {data.client_vat_number}</p>
              )}
            </div>
          </div>
        </div>

        {/* Invoice Details */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4" style={{ fontSize: '0.75rem' }}>
          <div>
            <p style={{ fontWeight: '600', color: '#111827', marginBottom: '0.25rem' }}>
              {it('dates.invoiceDate')}
            </p>
            <p>{formatDateDisplay(data.issue_date)}</p>
          </div>
          {data.due_date && (
            <div>
              <p style={{ fontWeight: '600', color: '#111827', marginBottom: '0.25rem' }}>
                {it('dates.dueDate')}
              </p>
              <p>{formatDateDisplay(data.due_date)}</p>
            </div>
          )}
          {isClient && data.sale_type === 'goods' && data.delivery_date && (
            <div>
              <p style={{ fontWeight: '600', color: '#111827', marginBottom: '0.25rem' }}>
                {it('dates.deliveryDate')}
              </p>
              <p>{formatDateDisplay(data.delivery_date)}</p>
            </div>
          )}
          {isClient && data.sale_type === 'services' && data.service_start_date && (
            <div>
              <p style={{ fontWeight: '600', color: '#111827', marginBottom: '0.25rem' }}>
                {it('dates.serviceFrom')}
              </p>
              <p>
                {formatDateDisplay(data.service_start_date)}
                {data.service_end_date && ` - ${formatDateDisplay(data.service_end_date)}`}
              </p>
            </div>
          )}
        </div>

        {/* Items Table */}
        <div style={{ 
          overflowX: 'auto',
          border: '1px solid #e5e7eb',
          borderRadius: '8px'
        }}>
          <table style={{ 
            width: '100%', 
            fontSize: '0.75rem',
            borderCollapse: 'collapse'
          }}>
            <thead>
              <tr style={{ 
                background: '#f9fafb',
                borderBottom: '2px solid #e5e7eb'
              }}>
                <th style={{ 
                  textAlign: 'left', 
                  padding: '0.75rem', 
                  fontWeight: '600',
                  color: '#374151'
                }}>
{it('table.description')}
                </th>
                <th style={{ 
                  textAlign: 'center', 
                  padding: '0.75rem', 
                  fontWeight: '600',
                  color: '#374151'
                }}>
{it('table.qty')}
                </th>
                <th style={{ 
                  textAlign: 'right', 
                  padding: '0.75rem', 
                  fontWeight: '600',
                  color: '#374151'
                }}>
{it('table.unitPrice')}
                </th>
                <th style={{ 
                  textAlign: 'center', 
                  padding: '0.75rem', 
                  fontWeight: '600',
                  color: '#374151'
                }}>
                  {it('table.vat')}
                </th>
                <th style={{ 
                  textAlign: 'right', 
                  padding: '0.75rem', 
                  fontWeight: '600',
                  color: '#374151'
                }}>
                  {it('table.total')}
                </th>
              </tr>
            </thead>
            <tbody>
              {data.invoiced_items.map((item: InvoiceItem, index: number) => {
                const lineTotal = item.quantity * item.unit_price;
                return (
                  <tr key={index} style={{ 
                    borderBottom: index < data.invoiced_items.length - 1 ? '1px solid #f3f4f6' : 'none',
                    background: index % 2 === 0 ? '#ffffff' : '#fafafa'
                  }}>
                    <td style={{ 
                      padding: '0.75rem',
                      color: '#111827'
                    }}>
                      {item.description || 'Service description'}
                    </td>
                    <td style={{ 
                      textAlign: 'center', 
                      padding: '0.75rem',
                      color: '#111827',
                      fontWeight: '500'
                    }}>
                      {item.quantity}
                    </td>
                    <td style={{ 
                      textAlign: 'right', 
                      padding: '0.75rem',
                      color: '#111827',
                      fontFamily: 'monospace'
                    }}>
                      {formatCurrencyDisplay(item.unit_price)}
                    </td>
                    <td style={{ 
                      textAlign: 'center', 
                      padding: '0.75rem',
                      color: '#6b7280',
                      fontSize: '0.7rem'
                    }}>
                      {item.vat_rate}%
                    </td>
                    <td style={{ 
                      textAlign: 'right', 
                      padding: '0.75rem',
                      color: '#111827',
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
            background: '#f9fafb',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
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
                color: '#6b7280'
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
                  color: '#6b7280'
                }}>
                  <span>
                    {it('totals.vatAmount')} {breakdown.rate}%:
                  </span>
                  <span style={{ fontFamily: 'monospace' }}>
                    {formatCurrencyDisplay(breakdown.amount)}
                  </span>
                </div>
              ))}
              
              <div style={{ 
                borderTop: '2px solid #d1d5db', 
                paddingTop: '0.75rem',
                marginTop: '0.5rem'
              }}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  fontWeight: '700',
                  fontSize: '1.125rem',
                  color: '#000000'
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
        {data.payment_terms && (
          <div style={{ 
            padding: '1rem',
            background: '#f9fafb',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            marginTop: '1rem'
          }}>
            <h3 style={{ 
              fontSize: '0.875rem',
              fontWeight: '600',
              color: '#111827',
              margin: '0 0 0.5rem 0'
            }}>
              {it('termsConditions.title')}
            </h3>
            <p style={{ 
              fontSize: '0.875rem',
              color: '#374151',
              margin: '0',
              lineHeight: '1.5',
              whiteSpace: 'pre-wrap'
            }}>
              {data.payment_terms}
            </p>
          </div>
        )}

        {/* Notes */}
        {data.notes && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">
              {it('notes.title')}
            </h3>
            <p className="text-sm whitespace-pre-wrap">{data.notes}</p>
          </div>
        )}

        {/* Footer with Payment and Tax Details */}
        {(data.iban || data.bic || data.bank_name || data.company_tax_number || data.company_vat_number) && (
          <div style={{ 
            marginTop: '2rem',
            paddingTop: '1rem',
            borderTop: '1px solid #e5e7eb'
          }}>
            <div style={{ 
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '0.75rem',
              color: '#6b7280',
              lineHeight: '1.5'
            }}>
              {/* Payment Information */}
              {(data.iban || data.bic || data.bank_name) && (
                <div>
                  {data.bank_name && (
                    <div>
                      <span style={{ fontWeight: '500' }}>
                        {it('payment.bank')}
                      </span>
                      {': '}{data.bank_name}
                    </div>
                  )}
                  {data.iban && (
                    <div>
                      <span style={{ fontWeight: '500' }}>IBAN</span>
                      {': '}{data.iban}
                    </div>
                  )}
                  {data.bic && (
                    <div>
                      <span style={{ fontWeight: '500' }}>BIC/SWIFT</span>
                      {': '}{data.bic}
                    </div>
                  )}
                </div>
              )}
              
              {/* Tax Information */}
              {(data.company_tax_number || data.company_vat_number) && (
                <div style={{ textAlign: 'right' }}>
                  {data.company_tax_number && (
                    <div>
                      <span style={{ fontWeight: '500' }}>
                        {it('tax.taxNumber')}
                      </span>
                      {': '}{data.company_tax_number}
                    </div>
                  )}
                  {data.company_vat_number && (
                    <div>
                      <span style={{ fontWeight: '500' }}>
                        {it('tax.vatNumber')}
                      </span>
                      {': '}{data.company_vat_number}
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