'use client';

import React, { useState } from 'react';
import Header from '@/components/ui/Header';
import Footer from '@/components/ui/Footer';
import { UILanguageProvider, useUILanguage } from '@/contexts/UILanguageContext';

const GPT_URL = 'https://chatgpt.com/g/g-6998d2ae06888191a30edafdc1aa94a4-steuer-spar-scout';

function SteuerCheckPageContent() {
  const { t } = useUILanguage();
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const steps = [
    {
      number: '1',
      title: t('steuerCheck.howItWorks.step1.title'),
      description: t('steuerCheck.howItWorks.step1.description'),
    },
    {
      number: '2',
      title: t('steuerCheck.howItWorks.step2.title'),
      description: t('steuerCheck.howItWorks.step2.description'),
    },
    {
      number: '3',
      title: t('steuerCheck.howItWorks.step3.title'),
      description: t('steuerCheck.howItWorks.step3.description'),
    },
  ];

  const categories = [
    { icon: '🏠', label: t('steuerCheck.categories.homeOffice') },
    { icon: '💻', label: t('steuerCheck.categories.techSoftware') },
    { icon: '📱', label: t('steuerCheck.categories.phoneInternet') },
    { icon: '🚄', label: t('steuerCheck.categories.travel') },
    { icon: '📚', label: t('steuerCheck.categories.education') },
    { icon: '🛡️', label: t('steuerCheck.categories.insurance') },
    { icon: '🏦', label: t('steuerCheck.categories.bankFees') },
    { icon: '📣', label: t('steuerCheck.categories.marketing') },
    { icon: '🌐', label: t('steuerCheck.categories.hosting') },
    { icon: '🎁', label: t('steuerCheck.categories.clientGifts') },
    { icon: '📝', label: t('steuerCheck.categories.taxCosts') },
    { icon: '🪑', label: t('steuerCheck.categories.furniture') },
  ];

  const faqData = [
    {
      question: t('steuerCheck.faq.q1.question'),
      answer: t('steuerCheck.faq.q1.answer'),
    },
    {
      question: t('steuerCheck.faq.q2.question'),
      answer: t('steuerCheck.faq.q2.answer'),
    },
    {
      question: t('steuerCheck.faq.q3.question'),
      answer: t('steuerCheck.faq.q3.answer'),
    },
    {
      question: t('steuerCheck.faq.q4.question'),
      answer: t('steuerCheck.faq.q4.answer'),
    },
    {
      question: t('steuerCheck.faq.q5.question'),
      answer: t('steuerCheck.faq.q5.answer'),
    },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#ffffff' }}>
      <Header />

      <main className="container">
        {/* Breadcrumb */}
        <div style={{ marginTop: '2rem', marginBottom: '1rem' }}>
          <a
            href="https://norman.finance/de/tools"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: '#6b7280',
              textDecoration: 'none',
              fontSize: '0.875rem',
            }}
          >
            {t('steuerCheck.breadcrumb')}
          </a>
        </div>

        {/* Hero Section */}
        <div
          className="text-center"
          style={{ paddingTop: '2rem', paddingBottom: '3rem' }}
        >
          <h1
            className="text-4xl font-bold leading-tight"
            style={{
              maxWidth: '700px',
              margin: '1.5rem auto 1rem',
              color: '#1f2937',
            }}
          >
            {t('steuerCheck.title')}
          </h1>

          <p
            className="text-lg text-gray-500 leading-relaxed"
            style={{
              maxWidth: '600px',
              margin: '0 auto',
            }}
          >
            {t('steuerCheck.description')}
          </p>

          <div style={{ marginTop: '2rem' }}>
            <ul
              style={{
                listStyle: 'none',
                padding: '0',
                margin: '0',
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'center',
                gap: '1rem',
                fontSize: '0.875rem',
                color: '#6b7280',
              }}
            >
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ color: '#10b981' }}>✓</span>
                {t('steuerCheck.features.feature1')}
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ color: '#10b981' }}>✓</span>
                {t('steuerCheck.features.feature2')}
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ color: '#10b981' }}>✓</span>
                {t('steuerCheck.features.feature3')}
              </li>
            </ul>
          </div>

          {/* Main CTA */}
          <div style={{ marginTop: '2.5rem' }}>
            <a
              href={GPT_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              <button
                style={{
                  background: '#000000',
                  color: 'white',
                  border: 'none',
                  padding: '1rem 2.5rem',
                  borderRadius: '4px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#1f2937';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgb(0 0 0 / 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#000000';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {t('steuerCheck.cta.startNow')}
              </button>
            </a>
            <p style={{
              marginTop: '0.75rem',
              fontSize: '0.8rem',
              color: '#9ca3af',
            }}>
              {t('steuerCheck.cta.poweredBy')}
            </p>
          </div>
        </div>

        {/* Content Area */}
        <div style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '4rem' }}>

          {/* How It Works */}
          <div style={{
            background: '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            padding: '2rem',
            marginBottom: '2rem',
          }}>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: '600',
              color: '#1f2937',
              marginBottom: '1.5rem',
              textAlign: 'center',
            }}>
              {t('steuerCheck.howItWorks.title')}
            </h2>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1.5rem',
            }}>
              {steps.map((step) => (
                <div key={step.number} style={{ textAlign: 'center' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: '#000000',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1rem',
                    fontWeight: '600',
                    margin: '0 auto 0.75rem',
                  }}>
                    {step.number}
                  </div>
                  <h3 style={{
                    fontSize: '1rem',
                    fontWeight: '600',
                    color: '#1f2937',
                    marginBottom: '0.5rem',
                  }}>
                    {step.title}
                  </h3>
                  <p style={{
                    fontSize: '0.875rem',
                    color: '#6b7280',
                    lineHeight: '1.5',
                  }}>
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Deduction Categories */}
          <div style={{
            background: '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            padding: '2rem',
            marginBottom: '2rem',
          }}>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: '600',
              color: '#1f2937',
              marginBottom: '0.5rem',
              textAlign: 'center',
            }}>
              {t('steuerCheck.categories.title')}
            </h2>
            <p style={{
              fontSize: '0.875rem',
              color: '#6b7280',
              textAlign: 'center',
              marginBottom: '1.5rem',
            }}>
              {t('steuerCheck.categories.subtitle')}
            </p>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: '0.75rem',
            }}>
              {categories.map((cat, index) => (
                <div key={index} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem',
                  background: '#f9fafb',
                  borderRadius: '6px',
                  fontSize: '0.85rem',
                  color: '#374151',
                }}>
                  <span style={{ fontSize: '1.1rem' }}>{cat.icon}</span>
                  {cat.label}
                </div>
              ))}
            </div>
          </div>

          {/* Second CTA */}
          <div style={{
            background: 'var(--color-primary)',
            borderRadius: '8px',
            padding: '3rem 2rem',
            textAlign: 'center',
            marginBottom: '2rem',
          }}>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: '600',
              color: '#ffffff',
              marginBottom: '0.75rem',
            }}>
              {t('steuerCheck.cta.midTitle')}
            </h2>
            <p style={{
              fontSize: '0.95rem',
              color: 'rgba(255,255,255,0.7)',
              marginBottom: '1.5rem',
              maxWidth: '500px',
              margin: '0 auto 1.5rem',
              lineHeight: '1.5',
            }}>
              {t('steuerCheck.cta.midDescription')}
            </p>
            <a
              href={GPT_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              <button
                style={{
                  background: '#ffffff',
                  color: '#000000',
                  border: 'none',
                  padding: '0.85rem 2rem',
                  borderRadius: '4px',
                  fontSize: '0.95rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgb(0 0 0 / 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {t('steuerCheck.cta.startNow')}
              </button>
            </a>
          </div>

          {/* FAQ Section */}
          <div style={{
            background: '#ffffff',
            border: '1px solid #ebedf1',
            borderRadius: '4px',
            padding: '2rem',
            marginBottom: '2rem',
          }}>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: '600',
              color: '#1f2937',
              marginBottom: '1.5rem',
            }}>
              {t('steuerCheck.faq.title')}
            </h2>

            <div>
              {faqData.map((faq, index) => (
                <div key={index} style={{
                  border: '1px solid #ebedf1',
                  borderRadius: '4px',
                  marginBottom: '0.5rem',
                  overflow: 'hidden',
                }}>
                  <button
                    onClick={() => toggleFaq(index)}
                    style={{
                      width: '100%',
                      padding: '1rem 1.5rem',
                      background: openFaqIndex === index ? '#f5f5f5' : '#ffffff',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '1rem',
                      fontWeight: '600',
                      color: '#1f2937',
                    }}
                  >
                    <span>{faq.question}</span>
                    <span style={{
                      transform: openFaqIndex === index ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.2s ease',
                      fontSize: '1.25rem',
                      color: '#6b7280',
                    }}>
                      ▼
                    </span>
                  </button>
                  {openFaqIndex === index && (
                    <div style={{
                      padding: '1rem 1.5rem',
                      background: '#f5f5f5',
                      borderTop: '1px solid #ebedf1',
                      color: '#6b7280',
                      lineHeight: '1.6',
                    }}>
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Disclaimer */}
          <div style={{
            background: '#f9fafb',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            padding: '1.5rem',
            fontSize: '0.875rem',
            color: '#6b7280',
            lineHeight: '1.5',
          }}>
            <strong style={{ color: '#1f2937' }}>{t('steuerCheck.disclaimer.title')}</strong><br />
            {t('steuerCheck.disclaimer.text')}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function SteuerCheckPage() {
  return (
    <UILanguageProvider>
      <SteuerCheckPageContent />
    </UILanguageProvider>
  );
}
