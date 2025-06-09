import React from 'react';
import { useUILanguage } from '@/contexts/UILanguageContext';

const Footer: React.FC = () => {
  const { t } = useUILanguage();

  return (
    <footer style={{ 
      marginTop: '10rem',
      borderTop: 'var(--border-line)'
    }}>
      <div style={{ 
        margin: '0 auto',
        padding: '2rem 4rem'
      }}>
        {/* Main Footer Content */}
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '2rem',
          marginBottom: '2rem'
        }}>
          {/* Logo and Company Info */}
          <div style={{ gridColumn: 'span 1' }}>
            <div style={{ 
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              marginBottom: '1rem'
            }}>
              <a href="https://norman.finance" target="_blank" rel="noopener noreferrer">
                <img 
                  src="/images/norman-logo.svg" 
                  alt="NORMAN" 
                  style={{ 
                    height: '18px',
                    maxWidth: '100px'
                  }}
                />
              </a>
            </div>
            <p className='text-gray-500' style={{
              marginBottom: '1.5rem',
              fontSize: '0.9rem'
            }}>
              {t('footer.tagline')}
            </p>

            {/* Location and Compliance */}
            <div style={{ 
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
              fontSize: '0.875rem',
            }}>
              <div style={{ 
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <span className='text-2xl'>🇩🇪</span>
                <span>{t('footer.madeInGermany')}</span>
              </div>
              <div style={{ 
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <span className='text-2xl'>🇪🇺</span>
                <span>{t('footer.gdprCompliant')}</span>
              </div>
            </div>
          </div>

          {/* Products */}
          <div>
            <h3 style={{ 
              fontSize: '0.875rem',
              fontWeight: '600',
              marginBottom: '0.5rem'
            }}>
              {t('footer.products')}
            </h3>
            <ul style={{ 
              listStyle: 'none',
              padding: '0',
              margin: '0'
            }}>
              <li style={{ marginBottom: '0.5rem' }}>
                <a href="https://norman.finance/become-self-employed" style={{ 
                  textDecoration: 'none',
                  fontSize: '0.875rem'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#111827'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#080809'}>
                  {t('links.becomeSelEmployed')}
                </a>
              </li>
              <li style={{ marginBottom: '0.5rem' }}>
                <a href="https://norman.finance/invoicing" style={{ 
                  textDecoration: 'none',
                  fontSize: '0.875rem'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#111827'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#080809'}>
                  {t('links.eInvoicing')}
                </a>
              </li>
              <li style={{ marginBottom: '0.5rem' }}>
                <a href="https://norman.finance/" style={{ 
                  textDecoration: 'none',
                  fontSize: '0.875rem'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#111827'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#080809'}>
                  {t('links.fileTaxes')}
                </a>
              </li>
              <li style={{ marginBottom: '0.5rem' }}>
                <a href="https://norman.finance/beratung" style={{ 
                  textDecoration: 'none',
                  fontSize: '0.875rem'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#111827'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#080809'}>
                  {t('links.getTaxAdvice')}
                </a>
              </li>
            </ul>
          </div>

          {/* Tools */}
          <div>
            <h3 style={{ 
              fontSize: '0.875rem',
              fontWeight: '600',
              marginBottom: '0.5rem'
            }}>
              {t('footer.tools')}
            </h3>
            <ul style={{ 
              listStyle: 'none',
              padding: '0',
              margin: '0'
            }}>
        
              <li style={{ marginBottom: '0.5rem' }}>
                <a href="https://norman.finance/blueprint" style={{ 
                  textDecoration: 'none',
                  fontSize: '0.875rem'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#111827'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#080809'}>
                  {t('links.book')}
                </a>
              </li>
              <li style={{ marginBottom: '0.5rem' }}>
                <a href="https://norman.finance/deductibles" style={{ 
                  textDecoration: 'none',
                  fontSize: '0.875rem'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#111827'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#080809'}>
                  {t('links.deductibles')}
                </a>
              </li>
              <li style={{ marginBottom: '0.5rem' }}>
                <a href="https://norman.finance/tax-calculator" style={{ 
                  textDecoration: 'none',
                  fontSize: '0.875rem'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#111827'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#080809'}>
                  {t('links.taxCalculator')}
                </a>
              </li>
              <li style={{ marginBottom: '0.5rem' }}>
                <a href="https://github.com/norman-finance/norman-mcp-server" style={{ 
                  textDecoration: 'none',
                  fontSize: '0.875rem'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#111827'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#080809'}>
                  {t('links.mcpServer')}
                </a>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 style={{ 
              fontSize: '0.875rem',
              fontWeight: '600',
              marginBottom: '0.5rem'
            }}>
              {t('footer.company')}
            </h3>
            <ul style={{ 
              listStyle: 'none',
              padding: '0',
              margin: '0'
            }}>
              <li style={{ marginBottom: '0.5rem' }}>
                <a href="https://norman.finance/about" style={{ 
                  textDecoration: 'none',
                  fontSize: '0.875rem'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#111827'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#080809'}>
                  {t('links.aboutUs')}
                </a>
              </li>
              <li style={{ marginBottom: '0.5rem' }}>
                <a href="https://norman.finance/blog" style={{ 
                  textDecoration: 'none',
                  fontSize: '0.875rem'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#111827'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#080809'}>
                  {t('links.blog')}
                </a>
              </li>
              <li style={{ marginBottom: '0.5rem' }}>
                <a href="https://norman.finance/careers" style={{ 
                  textDecoration: 'none',
                  fontSize: '0.875rem'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#111827'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#080809'}>
                  {t('links.careers')}
                </a>
              </li>
              <li style={{ marginBottom: '0.5rem' }}>
                <a href="https://norman.finance/impressum" style={{ 
                  textDecoration: 'none',
                  fontSize: '0.875rem'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#111827'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#080809'}>
                  {t('links.impressum')}
                </a>
              </li>
            </ul>
          </div>

          {/* Help */}
          <div>
            <h3 style={{ 
              fontSize: '0.875rem',
              fontWeight: '600',
              marginBottom: '0.5rem'
            }}>
              {t('footer.help')}
            </h3>
            <ul style={{ 
              listStyle: 'none',
              padding: '0',
              margin: '0'
            }}>
              <li style={{ marginBottom: '0.5rem' }}>
                <a href="https://help.norman.finance/de/" style={{ 
                  textDecoration: 'none',
                  fontSize: '0.875rem'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#111827'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#080809'}>
                  {t('links.support')}
                </a>
              </li>
              <li style={{ marginBottom: '0.5rem' }}>
                <a href="https://norman.finance/privacy-policy" style={{ 
                  textDecoration: 'none',
                  fontSize: '0.875rem'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#111827'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#080809'}>
                  {t('links.privacyPolicy')}
                </a>
              </li>
              <li style={{ marginBottom: '0.5rem' }}>
                <a href="https://norman.finance/terms-and-conditions" style={{ 
                  textDecoration: 'none',
                  fontSize: '0.875rem'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#111827'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#080809'}>
                  {t('links.termsAndConditions')}
                </a>
              </li>
              <li style={{ marginBottom: '0.5rem' }}>
                <a href="https://norman.finance/rewards-rules" style={{ 
                  textDecoration: 'none',
                  fontSize: '0.875rem'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#111827'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#080809'}>
                  {t('links.rewardsRules')}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Footer */}
        <div style={{ 
          borderTop: 'var(--border-line)',
          paddingTop: '1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <p className='text-gray-500' style={{ 
            fontSize: '0.875rem',
            margin: '0'
          }}>
            {t('footer.copyright')}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 