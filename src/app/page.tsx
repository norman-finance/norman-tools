'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { InvoiceFormData, invoiceFormSchema } from '@/lib/validation';
import { DEFAULT_INVOICE_DATA } from '@/lib/constants';
import { generateInvoice, downloadPDF, trackInvoiceGeneration, formatAPIError } from '@/lib/api';
import { calculateInvoiceTotals } from '@/utils/calculations';
import { calculateVatData, getRecommendedVatRate, validateVatSetup } from '@/lib/vat-calculations';

import Header from '@/components/ui/Header';
import InvoiceForm from '@/components/forms/InvoiceForm';
import InvoicePreview from '@/components/preview/InvoicePreview';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorMessage from '@/components/ui/ErrorMessage';
import SuccessMessage from '@/components/ui/SuccessMessage';
import { UILanguageProvider, useUILanguage } from '@/contexts/UILanguageContext';
import { getUrlParam, updateUrlParam } from '@/utils/urlParams';

function HomePageContent() {
  const { t } = useUILanguage();
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState(false);

  const form = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues: DEFAULT_INVOICE_DATA,
    mode: 'onChange',
  });

  const { watch, handleSubmit, formState: { errors, isValid }, setValue } = form;
  const formData = watch();

  // Initialize invoice language from URL parameter
  useEffect(() => {
    const urlInvoiceLang = getUrlParam('invoice_lang') || getUrlParam('invoiceLang');
    if (urlInvoiceLang === 'en' || urlInvoiceLang === 'de') {
      setValue('language', urlInvoiceLang);
    }
  }, [setValue]);

  // Update URL when invoice language changes
  useEffect(() => {
    updateUrlParam('invoice_lang', formData.language);
  }, [formData.language]);

  // Calculate totals for preview
  const totals = calculateInvoiceTotals(formData.invoiced_items || [], formData.is_vat_included);
  
  // Calculate VAT data for business rules
  const vatData = calculateVatData({ formData, language: formData.language });
  const vatValidationErrors = validateVatSetup(formData);

  // Clear messages after a delay
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 10000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  // Enhanced validation function
  const validateFormData = (data: InvoiceFormData) => {
    const validationErrors: string[] = [];
    
    // Check business details
    if (!data.company_name?.trim()) validationErrors.push(t('validation.companyNameRequired'));
    if (!data.company_address?.trim()) validationErrors.push(t('validation.companyAddressRequired'));
    if (!data.company_city?.trim()) validationErrors.push(t('validation.companyCityRequired'));
    if (!data.company_zip_code?.trim()) validationErrors.push(t('validation.companyZipRequired'));
    
    // Check client details
    if (!data.client_name?.trim()) validationErrors.push(t('validation.clientNameRequired'));
    if (!data.client_address?.trim()) validationErrors.push(t('validation.clientAddressRequired'));
    if (!data.client_city?.trim()) validationErrors.push(t('validation.clientCityRequired'));
    if (!data.client_zip_code?.trim()) validationErrors.push(t('validation.clientZipRequired'));
    
    // Check items
    if (!data.invoiced_items || data.invoiced_items.length === 0) {
      validationErrors.push(t('validation.itemsRequired'));
    } else {
      data.invoiced_items.forEach((item, index) => {
        if (!item.description?.trim()) {
          validationErrors.push(`Item ${index + 1}: ${t('validation.itemDescriptionRequired')}`);
        }
        if (!item.quantity || item.quantity <= 0) {
          validationErrors.push(`Item ${index + 1}: ${t('validation.itemQuantityRequired')}`);
        }
        if (!item.unit_price || item.unit_price <= 0) {
          validationErrors.push(`Item ${index + 1}: ${t('validation.itemPriceRequired')}`);
        }
      });
    }
    
    return validationErrors;
  };

  const onSubmit = async (data: InvoiceFormData) => {
    setIsGenerating(true);
    setError(null);
    setSuccess(null);

    try {
      // Enhanced validation
      const formValidationErrors = validateFormData(data);
      const vatErrors = validateVatSetup(data);
      const allErrors = [...formValidationErrors, ...vatErrors];
      
      if (allErrors.length > 0) {
        setError(allErrors.join(' • '));
        setIsGenerating(false);
        return;
      }

      // Generate the invoice PDF
      const pdfBlob = await generateInvoice(data);
      
      // Download the PDF
      const filename = `invoice_${data.invoice_number.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
      downloadPDF(pdfBlob, filename);
      
      // Track the generation
      trackInvoiceGeneration(data);
      
      setSuccess(t('message.success'));
    } catch (err) {
      const errorMessage = formatAPIError(err);
      setError(errorMessage);
      console.error('Invoice generation failed:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  // Automatically adjust VAT rates when business rules change
  useEffect(() => {
    const recommendedRate = getRecommendedVatRate(formData);
    const currentItems = form.getValues('invoiced_items');
    
    // Check if any items have different VAT rates than recommended
    const needsAdjustment = currentItems.some(item => item.vat_rate !== recommendedRate);
    
    if (needsAdjustment) {
      const updatedItems = currentItems.map(item => ({
        ...item,
        vat_rate: recommendedRate
      }));
      
      form.setValue('invoiced_items', updatedItems);
    }
  }, [
    formData.is_kleinunternehmer,
    formData.client_country,
    formData.client_type,
    formData.sale_type,
    formData.company_country,
    formData.client_vat_number,
    form
  ]);



  const togglePreview = () => {
    setPreviewMode(!previewMode);
  };

  const fillDemoData = () => {
    // Fill form with demo data for quick testing
    const today = new Date().toISOString().split('T')[0];
    const dueDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    form.reset({
      ...DEFAULT_INVOICE_DATA,
      company_name: 'Demo Company GmbH',
      company_address: 'Musterstraße 123',
      company_zip_code: '10115',
      company_city: 'Berlin',
      company_country: 'DE',
      company_email: 'hello@democompany.com',
      company_phone: '+49 30 12345678',
      company_vat_number: 'DE123456789',
      
      client_name: 'Client Company Ltd.',
      client_type: 'business' as const,
      client_address: 'Customer Street 456',
      client_zip_code: '20095',
      client_city: 'Hamburg',
      client_country: 'DE',
      client_email: 'contact@client.com',
      client_vat_number: 'DE987654321',
      
      // Explicitly set dates in YYYY-MM-DD format
      issue_date: today,
      due_date: dueDate,
      sale_type: 'services' as const,
      delivery_date: '',
      service_start_date: today,
      service_end_date: today,
      
      invoiced_items: [
        {
          description: 'Web Development Services',
          quantity: 40,
          unit_price: 85,
          vat_rate: 19,
        },
        {
          description: 'Consulting & Strategy',
          quantity: 8,
          unit_price: 120,
          vat_rate: 19,
        },
      ],
    });
  };

  return (
    <div style={{ minHeight: '100vh', background: '#ffffff' }}>
      <Header />
      
      <main className="container" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
        {/* Hero Section */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1 style={{ 
            fontSize: '2.5rem', 
            fontWeight: 'bold', 
            color: '#000000', 
            marginBottom: '1rem',
            lineHeight: '1.2'
          }}>
{t('hero.title')}<br />
            <span style={{ color: '#666666' }}>{t('hero.subtitle')}</span>
          </h1>
          <p style={{ 
            fontSize: '1.125rem', 
            color: '#666666', 
            marginBottom: '2rem',
            maxWidth: '600px',
            margin: '0 auto 2rem auto'
          }}>
{t('hero.description')}
          </p>
          <p style={{ 
            fontSize: '0.875rem', 
            color: '#9ca3af', 
            marginBottom: '2rem'
          }}>
            Free, no registration needed.
          </p>
          
          {/* Quick Actions */}
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '1rem', 
            justifyContent: 'center', 
            marginBottom: '2rem',
            alignItems: 'center'
          }}>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
              <button
                onClick={fillDemoData}
                className="btn btn-outline btn-sm"
                type="button"
              >
{t('button.fillDemo')}
              </button>
            </div>
          </div>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div style={{ 
            marginBottom: '2rem',
            padding: '1.25rem',
            background: '#fef2f2',
            border: '1px solid rgb(0, 0, 0)',
            borderRadius: '12px',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.75rem'
            }}>
              <span style={{ 
                fontSize: '1.25rem',
                color: '#dc2626',
                flexShrink: 0
              }}>
                ❌
              </span>
              <div style={{ flex: '1' }}>
                <h3 style={{
                  fontSize: '1rem',
                  fontWeight: '600',
                  color: '#dc2626',
                  margin: '0 0 0.5rem 0'
                }}>
                  Please fix the following issues:
                </h3>
                <p style={{
                  fontSize: '0.875rem',
                  color: '#b91c1c',
                  margin: '0',
                  lineHeight: '1.6'
                }}>
                  {error}
                </p>
              </div>
              <button
                onClick={() => setError(null)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  fontSize: '1.25rem',
                  color: '#9ca3af',
                  cursor: 'pointer',
                  padding: '0',
                  flexShrink: 0
                }}
              >
                ×
              </button>
            </div>
          </div>
        )}
        
        {success && (
          <div style={{ 
            marginBottom: '2rem',
            padding: '1.25rem',
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: '12px',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem'
            }}>
              <div style={{ flex: '1' }}>
                <p style={{
                  fontSize: '1rem',
                  fontWeight: '500',
                  color: '#16a34a',
                  margin: '0',
                  lineHeight: '1.5'
                }}>
                  {success}
                </p>
              </div>
              <button
                onClick={() => setSuccess(null)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  fontSize: '1.25rem',
                  color: '#9ca3af',
                  cursor: 'pointer',
                  padding: '0',
                  flexShrink: 0
                }}
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* VAT Validation Warnings */}
        {/* {vatValidationErrors.length > 0 && (
          <div style={{ 
            marginBottom: '1.5rem',
            padding: '1rem',
            background: '#fef3c7',
            border: '1px solid #f59e0b',
            borderRadius: '8px'
          }}>
            <div style={{ 
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.5rem'
            }}>
              <span style={{ 
                fontSize: '1rem',
                color: '#d97706'
              }}>
                ⚠️
              </span>
              <div>
                <h3 style={{ 
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: '#92400e',
                  margin: '0 0 0.5rem 0'
                }}>
{t('message.vatIssues')}
                </h3>
                <ul style={{ 
                  fontSize: '0.875rem',
                  color: '#92400e',
                  margin: '0',
                  paddingLeft: '1rem'
                }}>
                  {vatValidationErrors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )} */}

        {/* Main Content */}
        <div 
          className="main-content-grid" 
          style={{ 
            gap: '1.5rem', 
            alignItems: 'start',
            minHeight: '80vh'
          }}
        >
          {/* Preview Section - Left Side */}
          <div className={`preview-section preview-container ${!previewMode ? 'mobile-hidden' : 'mobile-section'}`}>
            <div 
              className="preview-sticky"
              style={{ 
                background: '#ffffff',
                borderRadius: '12px',
                padding: '1.5rem',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
                border: '1px solid #f3f4f6',
                display: 'flex',
                flexDirection: 'column',
                height: 'fit-content'
              }}
            >
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '1.5rem',
                borderBottom: '1px solid #e5e7eb',
                paddingBottom: '1rem',
                flexShrink: 0
              }}>
                <h2 style={{ 
                  fontSize: '1.5rem', 
                  fontWeight: '600', 
                  color: '#111827', 
                  margin: '0'
                }}>
                  Preview
                </h2>
                
                {/* Generate Invoice Button */}
                <button
                  onClick={handleSubmit(onSubmit)}
                  disabled={isGenerating}
                  style={{
                    background: isGenerating ? '#9ca3af' : '#000000',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '0.75rem 1.5rem',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    cursor: isGenerating ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)'
                  }}
                  onMouseEnter={(e) => {
                    if (!isGenerating) {
                      e.currentTarget.style.background = '#1f2937';
                      e.currentTarget.style.transform = 'translateY(-1px)';
                      e.currentTarget.style.boxShadow = '0 4px 6px -1px rgb(0 0 0 / 0.1)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isGenerating) {
                      e.currentTarget.style.background = '#000000';
                      e.currentTarget.style.transform = 'translateY(0px)';
                      e.currentTarget.style.boxShadow = '0 1px 2px 0 rgb(0 0 0 / 0.05)';
                    }
                  }}
                >
                  {isGenerating ? (
                    <>
                      <LoadingSpinner />
                      {t('button.generating')}
                    </>
                  ) : (
                    <>
                      <span>📄</span>
                      {t('button.getInvoice')}
                    </>
                  )}
                </button>
              </div>
              
              <div style={{ 
                flex: 1, 
                overflowY: 'auto', 
                paddingRight: '0.5rem',
                minHeight: '200px'
              }}>
                <InvoicePreview 
                  data={formData} 
                  totals={totals}
                />
              </div>
            </div>
          </div>

          {/* Form Section - Right Side */}
          <div className={`form-section ${previewMode ? 'mobile-hidden' : 'mobile-section'}`}>
            <div style={{ 
              background: '#ffffff',
              borderRadius: '12px',
              padding: '1rem',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
              border: '1px solid #f3f4f6'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1rem',
                borderBottom: '1px solid #e5e7eb',
                paddingBottom: '0.75rem'
              }}>
                <h2 style={{ 
                  fontSize: '1.25rem', 
                  fontWeight: '600', 
                  color: '#111827',
                  margin: '0'
                }}>
                  Details
                </h2>
                
                {/* Mobile Preview Button */}
                <button
                  onClick={togglePreview}
                  className="btn btn-outline btn-sm"
                  style={{ 
                    display: 'none',
                    padding: '0.5rem 1rem',
                    fontSize: '0.75rem'
                  }}
                  type="button"
                  data-mobile-only="true"
                >
                  👁️ Preview
                </button>
              </div>
              
              <form noValidate>
                <InvoiceForm form={form} />
              </form>
            </div>
          </div>
        </div>

        {/* Mobile Toggle Button */}
        <div className="mobile-toggle-btn">
          <button
            onClick={togglePreview}
            style={{ 
              background: '#000000',
              color: '#ffffff',
              border: 'none',
              borderRadius: '50%', 
              width: '3.5rem', 
              height: '3.5rem',
              boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.25rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            type="button"
            aria-label={previewMode ? 'Edit form' : 'Preview invoice'}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#1f2937';
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#000000';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            {previewMode ? '✏️' : '👁️'}
          </button>
        </div>

        {/* Footer Info */}
        <div style={{ 
          marginTop: '4rem', 
          textAlign: 'center', 
          fontSize: '0.875rem', 
          color: '#9ca3af' 
        }}>
          <p style={{ marginBottom: '0.5rem' }}>
            {t('footer.compliance')}
          </p>
        </div>
      </main>
    </div>
  );
}

export default function HomePage() {
  return (
    <UILanguageProvider>
      <HomePageContent />
    </UILanguageProvider>
  );
} 