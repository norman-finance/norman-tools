'use client';

import React from 'react';
import Header from '@/components/ui/Header';
import Footer from '@/components/ui/Footer';
import { UILanguageProvider, useUILanguage } from '@/contexts/UILanguageContext';

function ToolsPageContent() {
  const { t } = useUILanguage();

  const tools = [
    {
      id: 'erechnung',
      title: t('tools.erechnung.title'),
      description: t('tools.erechnung.description'),
      href: '/erechnung',
      icon: '📄',
      badge: t('hero.freeLabel'),
      features: [
        t('tools.erechnung.feature1'),
        t('tools.erechnung.feature2'),
        t('tools.erechnung.feature3')
      ]
    },
    {
      id: 'finanzamt-brief',
      title: t('tools.finanzamtBrief.title'),
      description: t('tools.finanzamtBrief.description'),
      href: '/finanzamt-brief',
      icon: '✉️',
      badge: t('hero.freeLabel'),
      features: [
        t('tools.finanzamtBrief.feature1'),
        t('tools.finanzamtBrief.feature2'),
        t('tools.finanzamtBrief.feature3')
      ]
    }
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#ffffff' }}>
      <Header />
      
      <main className="container">
        {/* Hero Section */}
        <div className="text-center" 
          style={{ 
            paddingTop: '3rem', 
            paddingBottom: '3rem' 
        }}>
          <h1 className="text-5xl font-semibold leading-tight" style={{ 
            maxWidth: '800px',
            margin: '2rem auto'
          }}>
            {t('hero.title')}
          </h1>
          
          <p className="text-xl text-gray-500 leading-tight" style={{ 
            maxWidth: '800px',
            margin: '2rem auto'
          }}>
            {t('hero.description')}
          </p>
          <p className="leading-tight" style={{ 
            maxWidth: '800px',
            margin: '2rem auto'
          }}>
            {t('hero.free')}
          </p>
        </div>

              {/* Tools Section */}
        <div style={{ 
          marginTop: '2rem',
          marginBottom: '4rem'
        }}>
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.5rem',
            maxWidth: '800px',
            margin: '0 auto'
          }}>
            {tools.map((tool) => (
              <a
                key={tool.id}
                href={tool.href}
                style={{ 
                  textDecoration: 'none',
                  color: 'inherit'
                }}
              >
                <div style={{ 
                  background: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '1.5rem',
                  textAlign: 'center',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 6px -1px rgb(0 0 0 / 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 1px 3px 0 rgb(0 0 0 / 0.1)';
                }}
              >
                <div style={{ 
                  fontSize: '2.5rem',
                  marginBottom: '1rem'
                }}>
                  {tool.icon}
                </div>
                
                <div style={{ 
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  marginBottom: '0.75rem'
                }}>
                  <h3 style={{ 
                    fontSize: '1.25rem',
                    fontWeight: '600',
                    color: '#1f2937',
                    margin: '0'
                  }}>
                    {tool.title}
                  </h3>
                  <span style={{ 
                    background: '#000000',
                    color: 'white',
                    padding: '0.05rem 0.3rem',
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    fontWeight: '500'
                  }}>
                    {tool.badge}
                  </span>
                </div>
                
                <p style={{ 
                  color: '#6b7280',
                  marginBottom: '1rem',
                  fontSize: '0.875rem',
                  lineHeight: '1.5'
                }}>
                  {tool.description}
                </p>
                
                <ul style={{ 
                  listStyle: 'none',
                  padding: '0',
                  margin: 'auto',
                  flex: '1',
                  paddingBottom: '2rem',
                  paddingTop: '1rem',
                }}>
                  {tool.features.map((feature, index) => (
                    <li key={index} style={{ 
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      marginBottom: '0.5rem',
                      fontSize: '0.8rem',
                      color: '#4b5563'
                    }}>
                      <span style={{ color: '#10b981' }}>✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
                
                <button style={{ 
                  background: '#000000',
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '4px',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  width: '50%',
                  margin: 'auto'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#1f2937';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 4px 6px -1px rgb(0 0 0 / 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#000000';
                  e.currentTarget.style.transform = 'translateY(0px)';
                  e.currentTarget.style.boxShadow = '0 1px 2px 0 rgb(0 0 0 / 0.05)';
                }}
                >
                  {t('button.getStarted')}
                </button>
              </div>
              </a>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function ToolsPage() {
  return (
    <UILanguageProvider>
      <ToolsPageContent />
    </UILanguageProvider>
  );
} 