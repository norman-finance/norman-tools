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

  const { watch, handleSubmit, formState: { errors, isValid } } = form;
  const formData = watch();

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

  const onSubmit = async (data: InvoiceFormData) => {
    setIsGenerating(true);
    setError(null);
    setSuccess(null);

    try {
      // Validate VAT setup before submission
      const vatErrors = validateVatSetup(data);
      if (vatErrors.length > 0) {
        setError(`VAT validation failed: ${vatErrors.join(', ')}`);
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
          <div style={{ marginBottom: '1.5rem' }}>
            <ErrorMessage message={error} onDismiss={() => setError(null)} />
          </div>
        )}
        
        {success && (
          <div style={{ marginBottom: '1.5rem' }}>
            <SuccessMessage message={success} onDismiss={() => setSuccess(null)} />
          </div>
        )}

        {/* VAT Validation Warnings */}
        {vatValidationErrors.length > 0 && (
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
        )}

        {/* Main Content */}
        <div className="grid grid-cols-2" style={{ gap: '2rem', alignItems: 'flex-start' }}>
          {/* Preview Section - Left Side */}
          <div className={!previewMode ? 'mobile-hidden' : ''}>
            <div style={{ 
              background: '#ffffff',
              borderRadius: '8px',
              padding: '1.5rem',
              position: 'sticky',
              top: '2rem'
            }}>
              <h2 style={{ 
                fontSize: '1.5rem', 
                fontWeight: '600', 
                color: '#000000', 
                marginBottom: '1.5rem',
                borderBottom: '1px solid #e5e7eb',
                paddingBottom: '1rem'
              }}>
{t('button.preview')}
              </h2>
              
              <div style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                <InvoicePreview 
                  data={formData} 
                  totals={totals}
                />
              </div>
            </div>
          </div>

          {/* Form Section - Right Side */}
          <div className={previewMode ? 'mobile-hidden' : ''}>
            <div style={{ 
              background: '#ffffff',
              borderRadius: '8px',
              padding: '1.5rem'
            }}>
              <h2 style={{ 
                fontSize: '1.5rem', 
                fontWeight: '600', 
                color: '#000000', 
                marginBottom: '1.5rem',
                borderBottom: '1px solid #e5e7eb',
                paddingBottom: '1rem'
              }}>
{t('section.details')}
              </h2>
              
              <form onSubmit={handleSubmit(onSubmit)} noValidate>
                <InvoiceForm form={form} />
                
                {/* Submit Button */}
                <div style={{ 
                  marginTop: '2rem', 
                  paddingTop: '1.5rem',
                  display: 'flex',
                  gap: '1rem'
                }}>
                  <button
                    type="submit"
                    disabled={isGenerating || !isValid}
                    className="btn btn-primary"
                    style={{ flex: '2' }}
                  >
                    {isGenerating ? (
                      <>
                        <LoadingSpinner />
{t('button.generating')}
                      </>
                    ) : (
                      t('button.getInvoice')
                    )}
                  </button>
                </div>
                
                {Object.keys(errors).length > 0 && (
                  <p style={{ 
                    fontSize: '0.875rem', 
                    color: '#dc2626', 
                    marginTop: '0.5rem', 
                    textAlign: 'center' 
                  }}>
                    Please fix the errors above before continuing.
                  </p>
                )}
              </form>
            </div>
          </div>
        </div>

        {/* Mobile Toggle Button */}
        <div className="mobile-toggle-btn">
          <button
            onClick={togglePreview}
            className="btn btn-primary"
            style={{ 
              borderRadius: '50%', 
              width: '3.5rem', 
              height: '3.5rem',
              boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
            }}
            type="button"
            aria-label={previewMode ? 'Edit form' : 'Preview invoice'}
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
          <p>
            {t('footer.privacy')}
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