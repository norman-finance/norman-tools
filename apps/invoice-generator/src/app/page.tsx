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
import Footer from '@/components/ui/Footer';
import InvoiceForm from '@/components/forms/InvoiceForm';
import InvoicePreview from '@/components/preview/InvoicePreview';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorMessage from '@/components/ui/ErrorMessage';
import SuccessMessage from '@/components/ui/SuccessMessage';
import { UILanguageProvider, useUILanguage } from '@/contexts/UILanguageContext';
import { getUrlParam, updateUrlParam } from '@/utils/urlParams';

function ERechnungPageContent() {
  const { t } = useUILanguage();
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState(false);

  // Get initial values with URL parameters
  const getInitialValues = () => {
    const urlInvoiceLang = getUrlParam('invoice_lang') || getUrlParam('invoiceLang');
    const validLang: 'en' | 'de' = (urlInvoiceLang === 'en' || urlInvoiceLang === 'de') ? urlInvoiceLang : 'en';
    
    return {
      ...DEFAULT_INVOICE_DATA,
      language: validLang as 'en' | 'de',
    } as InvoiceFormData;
  };

  const form = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues: getInitialValues(),
    mode: 'onChange',
  });

  const { watch, handleSubmit, formState: { errors, isValid }, setValue } = form;
  const formData = watch();

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

  // Automatically calculate due date when issue date changes (issue_date + 30 days)
  useEffect(() => {
    const issueDate = formData.issue_date;
    const currentDueDate = formData.due_date;
    
    if (issueDate && !currentDueDate) {
      // Only auto-calculate if due date is empty (don't override user's manual input)
      const issueDateObj = new Date(issueDate);
      const dueDateObj = new Date(issueDateObj);
      dueDateObj.setDate(dueDateObj.getDate() + 30); // Add 30 days
      
      const calculatedDueDate = dueDateObj.toISOString().split('T')[0];
      form.setValue('due_date', calculatedDueDate);
    }
  }, [formData.issue_date, formData.due_date, form]);

  const togglePreview = () => {
    setPreviewMode(!previewMode);
  };

  const fillDemoData = () => {
    // Fill form with demo data for quick testing
    const today = new Date().toISOString().split('T')[0];
    const dueDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    form.reset({
      ...DEFAULT_INVOICE_DATA,
      company_name: 'Acme GmbH',
      company_address: 'Musterstraße 123',
      company_zip_code: '10115',
      company_city: 'Berlin',
      company_country: 'DE',
      company_email: 'hello@acme.com',
      company_phone: '+49 30 12345678',
      company_vat_number: 'DE123456789',
      company_tax_number: '12/345/67890',
      
      client_name: 'Max Mustermann',
      client_type: 'business' as const,
      client_address: 'Hamburger Straße 456',
      client_zip_code: '20095',
      client_city: 'Hamburg',
      client_country: 'DE',
      client_email: 'max@mustermann.de',
      client_vat_number: 'DE987654321',
      payment_terms: 'Bitte zahlen Sie innerhalb von 14 Tagen',
      iban: 'DE1234567890',
      bic: 'COBADEHD001',
      bank_name: 'Commerzbank',
      
      // Explicitly set dates in YYYY-MM-DD format
      issue_date: today,
      due_date: dueDate,
      sale_type: 'services' as const,
      delivery_date: '',
      service_start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      service_end_date: today,
      language: 'de',
      
      invoiced_items: [
        {
          description: 'Webentwicklung',
          quantity: 40,
          unit_price: 85,
          vat_rate: 19,
        },
        {
          description: 'Beratung & Strategie',
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
      
      <main className="container">
        {/* Breadcrumb */}
        <div style={{
          paddingTop: '1rem',
          marginBottom: '1rem'
        }}>
          <a
            href="https://norman.finance/de/tools"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: '#6b7280',
              textDecoration: 'none',
              fontSize: '0.875rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#111827';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#6b7280';
            }}
          >
            {t('header.breadcrumb')}
          </a> 
        </div>

        {/* Hero Section */}
        <div className="text-center" 
          style={{ 
            paddingTop: '2rem', 
            paddingBottom: '3rem' 
        }}>
          <h1 className="text-5xl font-semibold leading-tight" style={{ 
            maxWidth: '800px',
            margin: '2rem auto'
          }}>
            {t('tools.erechnung.title')}
          </h1>
          
          <p className="text-xl text-gray-500 leading-tight" style={{ 
            maxWidth: '800px',
            margin: '2rem auto'
          }}>
            {t('tools.erechnung.description')}
          </p>
          <p className="leading-tight" style={{ 
            maxWidth: '800px',
            margin: '2rem auto'
          }}>
            {t('hero.free')}
          </p>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div style={{ 
            marginBottom: '2rem',
            padding: '1.25rem',
            background: 'rgb(255 255 255)',
            border: '1px solid rgb(0, 0, 0, 0.1)',
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
                color: 'rgb(0 0 0)',
                flexShrink: 0
              }}>
                ❌
              </span>
              <div style={{ flex: '1' }}>
                <h3 style={{
                  fontSize: '1rem',
                  fontWeight: '600',
                  color: 'rgb(0 0 0)',
                  margin: '0 0 0.5rem 0'
                }}>
                  {t('message.error')}
                </h3>
                <p style={{
                  fontSize: '0.875rem',
                  color: 'rgb(0 0 0)',
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
            borderRadius: '4px',
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

        {/* Main Content */}
        <div 
          className="main-content-grid" 
          style={{ 
            gap: '1rem', 
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
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                height: 'fit-content'
              }}
            >
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
              padding: '1rem',
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1rem',
                borderBottom: 'var(--border-line)',
                paddingBottom: '0.75rem'
              }}>
                <h2 style={{ 
                  fontSize: '1.25rem', 
                  fontWeight: '600', 
                  margin: '0'
                }}>
                  {t('section.details')}
                </h2>
                {/* Quick Actions */}
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '1rem', 
                  justifyContent: 'center', 
                  alignItems: 'center'
                }}>
                  <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                    <button
                      onClick={fillDemoData}
                      className="btn btn-primary btn-sm"
                      type="button"
                    >
                      {t('button.fillDemo')}
                    </button>
                  </div>
                </div>
                
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
              {/* Generate Invoice Button */}
              <button
                  onClick={handleSubmit(onSubmit)}
                  disabled={isGenerating}
                  style={{
                    background: isGenerating ? '#9ca3af' : '#000000',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '0.75rem 1.5rem',
                    fontSize: '1rem',
                    fontWeight: '600',
                    cursor: isGenerating ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    transition: 'all 0.2s ease',
                    marginTop: '2.5rem'
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
                      <span>📥</span>
                      {t('button.getInvoice')}
                    </>
                  )}
                </button>
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

        {/* Features Section */}
        <div style={{ 
          marginTop: '10rem', 
          marginBottom: '10rem' 
        }}>
          <div style={{ 
            textAlign: 'center',
            marginBottom: '4rem' 
          }}>
            <h2 style={{ 
              fontSize: '2.25rem', 
              fontWeight: '600',
              marginBottom: '1rem',
            }}>
              {t('features.title')}
            </h2>
            <p className="text-gray-500" style={{ 
              fontSize: '1.125rem',
              maxWidth: '600px',
              margin: '0 auto'
            }}>
              {t('features.description')}
            </p>
          </div>

          <div style={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '2rem',
            maxWidth: '1200px',
            margin: '0 auto'
          }}>
            {/* Customize your invoices */}
            <div>
              <div style={{ 
                display: 'flex',
                alignItems: 'center', 
                gap: '0.5rem',
                marginBottom: '1rem'
              }}>
                <span style={{ fontSize: '1.5rem' }}>{t('features.feature1.icon')}</span>
                <h3 style={{ 
                  fontSize: '1.25rem', 
                  fontWeight: '600', 
                  margin: '0',
                }}>
                  {t('features.feature1.title')}
                </h3>
              </div>
              <p className="text-gray-500" style={{
                lineHeight: '1.6',
                margin: '0'
              }}>
                {t('features.feature1.description')}
              </p>
            </div>
            
            {/* Save time */}
            <div>
              <div style={{ 
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '1rem'
              }}>
                <span style={{ fontSize: '1.5rem' }}>{t('features.feature2.icon')}</span>
                <h3 style={{ 
                  fontSize: '1.25rem', 
                  fontWeight: '600',
                  margin: '0',
                }}>
                  {t('features.feature2.title')}
                </h3>
              </div>
              <p className="text-gray-500" style={{ 
                lineHeight: '1.6',
                margin: '0'
              }}>
                {t('features.feature2.description')}
              </p>
            </div>

            {/* Track payments */}
            <div>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem',
                marginBottom: '1rem'
              }}>
                <span style={{ fontSize: '1.5rem' }}>{t('features.feature3.icon')}</span>
                <h3 style={{ 
                  fontSize: '1.25rem', 
                  fontWeight: '600', 
                  margin: '0',
                }}>
                  {t('features.feature3.title')}
                </h3>
              </div>
              <p className="text-gray-500" style={{ 
                lineHeight: '1.6',
                margin: '0'
              }}>
                {t('features.feature3.description')}
              </p>
            </div>
            
            {/* Recurring invoices */}
            <div>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem',
                marginBottom: '1rem'
              }}>
                <span style={{ fontSize: '1.5rem' }}>{t('features.feature4.icon')}</span>
                <h3 style={{ 
                  fontSize: '1.25rem', 
                  fontWeight: '600', 
                  margin: '0',
                }}>
                  {t('features.feature4.title')}
                </h3>
              </div>
              <p className="text-gray-500" style={{ 
                lineHeight: '1.6',
                margin: '0'
              }}>
                {t('features.feature4.description')}
              </p>
            </div>

            {/* Payment links */}
            <div>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem',
                marginBottom: '1rem'
              }}>
                <span style={{ fontSize: '1.5rem' }}>{t('features.feature5.icon')}</span>
                <h3 style={{ 
                  fontSize: '1.25rem', 
                  fontWeight: '600', 
                  margin: '0',
                }}>
                  {t('features.feature5.title')}
                </h3>
              </div>
              <p className="text-gray-500" style={{ 
                lineHeight: '1.6',
                margin: '0'
              }}>
                {t('features.feature5.description')}
              </p>
            </div>

            {/* Auto-follow ups */}
            <div>
              <div style={{ 
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '1rem'
              }}>
                <span style={{ fontSize: '1.5rem' }}>{t('features.feature6.icon')}</span>
                <h3 style={{ 
                  fontSize: '1.25rem', 
                  fontWeight: '600', 
                  margin: '0',
                }}>
                  {t('features.feature6.title')}
                </h3>
              </div>
              <p className="text-gray-500" style={{ 
                lineHeight: '1.6',
                margin: '0'
              }}>
                {t('features.feature6.description')}
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div style={{ 
          marginTop: '10rem', 
          marginBottom: '10rem',
          padding: '4rem 2rem',
          background: 'var(--color-primary)',
          borderRadius: '12px',
          textAlign: 'center',
        }}>
          <h2 className="text-white" style={{ 
            fontSize: '2.5rem', 
            fontWeight: '600', 
          }}>
            {t('cta.title')}
          </h2>
          <p className="text-gray-100 leading-tight" style={{ 
            fontSize: '1.25rem',
            maxWidth: '600px',
            margin: '2rem auto'
          }}>
            {t('cta.description')}
          </p>
          <div style={{ 
            display: 'flex', 
            gap: '1rem', 
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            <a href="https://norman.finance/invoicing?utm_source=freetools&utm_campaign=erechnung&destination=invoice&utm_medium=cta">
            <button className="btn bg-transparent text-white" style={{
              border: '1px solid rgba(255, 255, 255)',
              borderRadius: '4px',
              padding: '0.75rem 1.5rem',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              backdropFilter: 'blur(10px)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.0)';
              e.currentTarget.style.transform = 'translateY(0px)';
            }}>
              {t('cta.buttonLearnMore')}
            </button></a>
            <a href="https://app.norman.finance/sign-up?utm_source=freetools&utm_campaign=erechnung&destination=invoice&utm_medium=cta">
            <button className="btn bg-white text-black" style={{
              border: 'none',
              borderRadius: '4px',
              padding: '0.75rem 2rem',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0px)';
              e.currentTarget.style.boxShadow = 'none';
            }}>
              {t('cta.buttonGetStarted')}
            </button></a>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function ERechnungPage() {
  return (
    <UILanguageProvider>
      <ERechnungPageContent />
    </UILanguageProvider>
  );
} 