import React, { useState } from 'react';
import { useUILanguage } from '@/contexts/UILanguageContext';
import { getCurrentUrl, copyToClipboard } from '@/utils/urlParams';

const Header: React.FC = () => {
  const { uiLanguage, setUILanguage, t } = useUILanguage();
  const [copySuccess, setCopySuccess] = useState(false);

  const handleCopyUrl = async () => {
    const currentUrl = getCurrentUrl();
    const success = await copyToClipboard(currentUrl);
    
    if (success) {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  return (
    <header style={{ 
      borderBottom: '1px solid #e5e7eb', 
      background: '#ffffff',
      padding: '1rem 0'
    }}>
      <div className="container">
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: '1fr auto 1fr',
          alignItems: 'center',
          gap: '1rem',
          width: '100%'
        }}>
          {/* Left Section */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '1rem',
            justifyContent: 'flex-start'
          }}>
            <h1 style={{ 
              fontSize: '1.25rem', 
              fontWeight: '600', 
              color: '#000000',
              margin: 0
            }}>
              {t('header.title')}
            </h1>
            <span style={{ 
              fontSize: '0.875rem', 
              color: '#6b7280', 
              background: '#f3f4f6', 
              padding: '0.25rem 0.5rem', 
              borderRadius: '4px'
            }}>
              {t('hero.freeLabel')}
            </span>
          </div>
          
          {/* Center Logo - Perfectly centered */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center'
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
          
          {/* Right Section */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '1rem', 
            fontSize: '0.875rem', 
            color: '#6b7280',
            justifyContent: 'flex-end'
          }}>
            <select
              value={uiLanguage}
              onChange={(e) => setUILanguage(e.target.value as 'en' | 'de')}
              style={{
                background: 'transparent',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                padding: '0.25rem 0.5rem',
                fontSize: '0.875rem',
                color: '#6b7280',
                cursor: 'pointer'
              }}
            >
              <option value="en">🇺🇸 English</option>
              <option value="de">🇩🇪 Deutsch</option>
            </select>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; 