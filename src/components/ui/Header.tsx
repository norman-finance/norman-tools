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
      padding: '0.5rem 0'
    }}>
      <div className="container">
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: '1fr auto 1fr',
          alignItems: 'center',
          gap: '1rem',
          width: '100%'
        }}>
          {/* Left Section - Logo */}
          <div style={{ 
            display: 'flex', 
            /*alignItems: 'center', 
            justifyContent: 'center'*/
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
          
          {/* Center Section - Perfectly centered */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '1rem',
            justifyContent: 'flex-start'
          }}>
            <h1
            className="text-xl font-semibold">
              {t('header.title')}
            </h1>
            {/*<span
            className="text-gray-500 bg-gray-100"
            style={{ 
              fontSize: '0.875rem', 
              padding: '0.25rem 0.5rem', 
              borderRadius: '4px'
            }}>
              {t('hero.freeLabel')}
            </span>*/}
          </div>
          
          {/* Right Section - Language and Sign Up */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '1rem', 
            fontSize: '0.875rem', 
            justifyContent: 'flex-end'
          }}>
            <select
              className="text-gray-500 hover:bg-gray-100"
              value={uiLanguage}
              onChange={(e) => setUILanguage(e.target.value as 'en' | 'de')}
              style={{
                borderRadius: '4px',
                padding: '0.5rem',
                fontSize: '0.875rem',
                cursor: 'pointer'
              }}
            >
              <option value="de">🇩🇪 Deutsch</option>
              <option value="en">🇺🇸 English</option>
            </select>
            <a href="https://app.norman.finance/sign-up?utm_source=freetools&utm_campaign=erechnung&destination=invoice&utm_medium=header">
              <button
                className="btn btn-primary btn-sm"
                type="button"
              >
                {t('button.signUp')}
              </button>
            </a>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; 