'use client';

import React from 'react';
import { UseFormReturn, useFieldArray } from 'react-hook-form';
import { InvoiceFormData } from '../../types/invoice';
import { VAT_RATES, CURRENCIES, LANGUAGES, SALE_TYPES, CLIENT_TYPES, COMPANY_COUNTRY, getCountriesList } from '../../lib/constants';
import { useUILanguage } from '@/contexts/UILanguageContext';

interface InvoiceFormProps {
  form: UseFormReturn<InvoiceFormData>;
}

function UILanguageSelectorComponent() {
  const { uiLanguage, setUILanguage, t } = useUILanguage();
  
  return (
    <div>
      <label style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem', display: 'block' }}>
        {t('settings.uiLanguage')}
      </label>
      <select
        value={uiLanguage}
        onChange={(e) => setUILanguage(e.target.value as 'en' | 'de')}
        className="input"
      >
        <option value="en">🇺🇸 English</option>
        <option value="de">🇩🇪 Deutsch</option>
      </select>
    </div>
  );
}

export default function InvoiceForm({ form }: InvoiceFormProps) {
  const { t } = useUILanguage();
  const { register, control, formState: { errors }, watch, setValue } = form;
  
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'invoiced_items'
  });

  const watchedLanguage = watch('language');
  const watchedCountry = watch('company_country');
  const watchedClientCountry = watch('client_country');
  const watchedCurrency = watch('currency');
  const watchedSaleType = watch('sale_type');
  
  // Get countries list based on language
  const countriesList = React.useMemo(() => getCountriesList(watchedLanguage), [watchedLanguage]);

  // State for collapsible sections
  const [expandedSections, setExpandedSections] = React.useState({
    createFor: true,
    details: true,
    items: true,
    payment: false,
    settings: false,
    notes: false
  });

  // State to handle hydration
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const addItem = () => {
    append({
      description: '',
      quantity: 1,
      unit_price: 0,
      vat_rate: 19,
    });
  };

  const removeItem = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
  {/* Settings Section */}
  <section>
        <button
          type="button"
          onClick={() => toggleSection('settings')}
          style={{
            width: '100%',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '1rem',
            background: '#f9fafb',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            fontSize: '1rem',
            fontWeight: '500',
            color: '#111827',
            cursor: 'pointer',
            marginBottom: '1rem'
          }}
        >
          <span>{t('section.settings')}</span>
          <span style={{ transform: expandedSections.settings ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
            ↓
          </span>
        </button>
        
        {expandedSections.settings && (
          <div style={{ padding: '0 1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem', display: 'block' }}>
                  {t('settings.currency')} {t('required')}
                </label>
                <select
                  {...register('currency')}
                  className="input input-compact"
                >
                  {CURRENCIES.map((currency) => (
                    <option key={currency.code} value={currency.code}>
                      {currency.symbol} {t(`currency.${currency.code}`)} ({currency.code})
                    </option>
                  ))}
                </select>
                {errors.currency && (
                  <p style={{ fontSize: '0.75rem', color: '#dc2626', marginTop: '0.25rem' }}>
                    {errors.currency.message}
                  </p>
                )}
              </div>
              <div>
                <label style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem', display: 'block' }}>
                  {t('settings.invoiceLanguage')} {t('required')}
                </label>
                <select
                  {...register('language')}
                  className="input input-compact"
                >
                  {LANGUAGES.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.flag} {lang.name}
                    </option>
                  ))}
                </select>
                {errors.language && (
                  <p style={{ fontSize: '0.75rem', color: '#dc2626', marginTop: '0.25rem' }}>
                    {errors.language.message}
                  </p>
                )}
              </div>
        
            </div>
        
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem', display: 'block' }}>
{t('settings.saleType')} {t('required')}
                </label>
                <select
                  {...register('sale_type')}
                  className="input input-compact"
                >
                  {SALE_TYPES.map((saleType) => (
                    <option key={saleType.value} value={saleType.value}>
                      {saleType.icon} {t(`option.${saleType.value}`)}
                    </option>
                  ))}
                </select>
                {errors.sale_type && (
                  <p style={{ fontSize: '0.75rem', color: '#dc2626', marginTop: '0.25rem' }}>
                    {errors.sale_type.message}
                  </p>
                )}
              </div>

            </div>
            
            {/* VAT Settings */}
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column',
              marginBottom: '1rem',
              padding: '1rem',
              background: '#f9fafb',
              border: '1px solid #e2e8f0',
              borderRadius: '6px'
            }}>
              <h4 style={{ 
                fontSize: '0.875rem', 
                fontWeight: '500', 
                color: '#374151',
                margin: '0 0 0.5rem 0'
              }}>
{t('settings.vatSettings')}
              </h4>
              
              <div style={{ 
                display: 'flex', 
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <input
                  {...register('is_kleinunternehmer')}
                  type="checkbox"
                  id="is_kleinunternehmer"
                  style={{ 
                    width: '16px', 
                    height: '16px',
                    accentColor: '#3b82f6'
                  }}
                />
                <label htmlFor="is_kleinunternehmer" style={{ 
                  fontSize: '0.875rem', 
                  color: '#374151',
                  cursor: 'pointer'
                }}>
{t('settings.kleinunternehmer')}
                </label>
              </div>
              
              <p style={{ 
                fontSize: '0.75rem', 
                color: '#6b7280',
                margin: '0',
                fontStyle: 'italic'
              }}>
{t('settings.kleinunternehmerDesc')}
              </p>
            </div>
          </div>
        )}
      </section>


      {/* Create for Section */}
      <section>
        <button
          type="button"
          onClick={() => toggleSection('createFor')}
          style={{
            width: '100%',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '1rem',
            background: '#f9fafb',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            fontSize: '1rem',
            fontWeight: '500',
            color: '#111827',
            cursor: 'pointer',
            marginBottom: '1rem'
          }}
        >
          <span>{t('section.createFor')}</span>
          <span style={{ transform: expandedSections.createFor ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
            ↓
          </span>
        </button>
        
        {expandedSections.createFor && (
          <div style={{ padding: '0 1rem', marginBottom: '1rem' }}>
            {/* Company Details */}
            <div style={{ marginBottom: '2rem' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem', color: '#111827' }}>
{t('company.title')}
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem', display: 'block' }}>
{t('company.name')} {t('required')}
                  </label>
                  <input
                    {...register('company_name')}
                    type="text"
                    className="input input-compact"
                    placeholder={t('company.namePlaceholder')}
                  />
                  {errors.company_name && (
                    <p style={{ fontSize: '0.75rem', color: '#dc2626', marginTop: '0.25rem' }}>
                      {errors.company_name.message}
                    </p>
                  )}
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem', display: 'block' }}>
{t('company.email')}
                  </label>
                  <input
                    {...register('company_email')}
                    type="email"
                    className="input input-compact"
                    placeholder="hello@company.com"
                  />
                  {errors.company_email && (
                    <p style={{ fontSize: '0.75rem', color: '#dc2626', marginTop: '0.25rem' }}>
                      {errors.company_email.message}
                    </p>
                  )}
                </div>
              </div>
              
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem', display: 'block' }}>
{t('company.address')} {t('required')}
                </label>
                <input
                  {...register('company_address')}
                  type="text"
                  className="input input-compact"
                  placeholder="Hauptstraße 18"
                />
                {errors.company_address && (
                  <p style={{ fontSize: '0.75rem', color: '#dc2626', marginTop: '0.25rem' }}>
                    {errors.company_address.message}
                  </p>
                )}
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem', display: 'block' }}>
                    {t('company.zipCode')} {t('required')}
                  </label>
                  <input
                    {...register('company_zip_code')}
                    type="text"
                    className="input input-compact"
                    placeholder="10115"
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem', display: 'block' }}>
                    {t('company.city')} {t('required')}
                  </label>
                  <input
                    {...register('company_city')}
                    type="text"
                    className="input input-compact"
                    placeholder="Berlin"
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem', display: 'block' }}>
                    {t('company.country')} {t('required')}
                  </label>
                  <input
                    type="text"
                    value={COMPANY_COUNTRY.name}
                    className="input input-compact"
                    disabled
                    style={{ backgroundColor: '#f9fafb', color: '#6b7280' }}
                  />
                  <input type="hidden" {...register('company_country')} value="DE" />
                </div>
              </div>
              
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem', display: 'block' }}>
                  {t('company.phone')}
                </label>
                <input
                  {...register('company_phone')}
                  type="tel"
                  className="input input-compact"
                  placeholder="+49 30 12345678"
                />
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem', display: 'block' }}>
                    {t('company.taxNumber')}
                  </label>
                  <input
                    {...register('company_tax_number')}
                    type="text"
                    className="input input-compact"
                    placeholder="12/345/67890"
                  />
                  {errors.company_tax_number && (
                    <p style={{ fontSize: '0.75rem', color: '#dc2626', marginTop: '0.25rem' }}>
                      {errors.company_tax_number.message}
                    </p>
                  )}
                </div>
                <div>
                  <label style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem', display: 'block' }}>
                    {t('company.vatNumber')}
                  </label>
                  <input
                    {...register('company_vat_number')}
                    type="text"
                    className="input input-compact"
                    placeholder="DE123456789"
                  />
                  {errors.company_vat_number && (
                    <p style={{ fontSize: '0.75rem', color: '#dc2626', marginTop: '0.25rem' }}>
                      {errors.company_vat_number.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Client Details */}
            <div>
              <h4 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem', color: '#111827' }}>
              {t('client.title')}
              </h4>
              <div style={{ marginBottom: '1rem' }}>
              <label style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem', display: 'block' }}>
                  {t('client.name')} {t('required')}
                </label>
                <input
                  {...register('client_name')}
                  type="text"
                  className="input input-compact"
                  placeholder="Acme GmbH"
                  style={{ flex: 1 }}
                />
              </div>
              
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem', display: 'block' }}>
                  Client Address *
                </label>
                <input
                  {...register('client_address')}
                  type="text"
                  className="input input-compact"
                  placeholder="Hauptstraße 18"
                />
                {errors.client_address && (
                  <p style={{ fontSize: '0.75rem', color: '#dc2626', marginTop: '0.25rem' }}>
                    {errors.client_address.message}
                  </p>
                )}
                              </div>
                
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem', display: 'block' }}>
                    {t('client.type')} {t('required')}
                  </label>
                  <select
                    {...register('client_type')}
                    className="input input-compact"
                  >
                    {CLIENT_TYPES.map((type) => (
                      <option key={type.value} value={type.value} selected={type.value === 'business'}>
                        {type.icon} {t(`option.${type.value}`)}
                      </option>
                    ))}
                  </select>
                  {errors.client_type && (
                    <p style={{ fontSize: '0.75rem', color: '#dc2626', marginTop: '0.25rem' }}>
                      {errors.client_type.message}
                    </p>
                  )}
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <label style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem', display: 'block' }}>
                      {t('company.zipCode')} {t('required')}
                    </label>
                    <input
                      {...register('client_zip_code')}
                      type="text"
                      className="input input-compact"
                      placeholder="20095"
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem', display: 'block' }}>
                      {t('company.city')} {t('required')}
                    </label>
                    <input
                      {...register('client_city')}
                      type="text"
                      className="input input-compact"
                      placeholder="Hamburg"
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem', display: 'block' }}>
                      {t('company.country')} {t('required')}
                    </label>
                    <select
                      {...register('client_country')}
                      className="input input-compact"
                    >
                      {countriesList.map((country) => (
                        <option key={country.code} value={country.code}>
                          {country.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem', display: 'block' }}>
                    {t('client.email')}
                  </label>
                  <input
                    {...register('client_email')}
                    type="email"
                    className="input input-compact"
                    placeholder="contact@client.com"
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem', display: 'block' }}>
                    {t('client.vatNumber')}
                  </label>
                  <input
                    {...register('client_vat_number')}
                    type="text"
                    className="input input-compact"
                    placeholder="DE987654321"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Details Section */}
      <section>
        <button
          type="button"
          onClick={() => toggleSection('details')}
          style={{
            width: '100%',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '1rem',
            background: '#f9fafb',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            fontSize: '1rem',
            fontWeight: '500',
            color: '#111827',
            cursor: 'pointer',
            marginBottom: '1rem'
          }}
        >
          <span>{t('section.details')}</span>
          <span style={{ transform: expandedSections.details ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
            ↓
          </span>
        </button>
        
        {expandedSections.details && (
          <div style={{ padding: '0 1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem', display: 'block' }}>
                  {t('details.invoiceNumber')}
                </label>
                <input
                  {...register('invoice_number')}
                  type="text"
                  className="input input-compact"
                  placeholder="INV-2025-001"
                />
                {errors.invoice_number && (
                  <p style={{ fontSize: '0.75rem', color: '#dc2626', marginTop: '0.25rem' }}>
                    {errors.invoice_number.message}
                  </p>
                )}
              </div>
              <div>
                <label style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem', display: 'block' }}>
                  {t('details.issued')}
                </label>
                <input
                  {...register('issue_date')}
                  type="date"
                  className="input input-compact"
                />
                {errors.issue_date && (
                  <p style={{ fontSize: '0.75rem', color: '#dc2626', marginTop: '0.25rem' }}>
                    {errors.issue_date.message}
                  </p>
                )}
              </div>
            </div>
            
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem', display: 'block' }}>
                {t('details.dueDate')}
              </label>
              <input
                {...register('due_date')}
                type="date"
                className="input input-compact"
              />
              {errors.due_date && (
                <p style={{ fontSize: '0.75rem', color: '#dc2626', marginTop: '0.25rem' }}>
                  {errors.due_date.message}
                </p>
              )}
            </div>
            
            {/* Conditional Date Fields Based on Sale Type */}
            {isClient && watchedSaleType === 'services' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem', display: 'block' }}>
                    {t('details.serviceFrom')}
                  </label>
                  <input
                    {...register('service_start_date')}
                    type="date"
                    className="input input-compact"
                  />
                  {errors.service_start_date && (
                    <p style={{ fontSize: '0.75rem', color: '#dc2626', marginTop: '0.25rem' }}>
                      {errors.service_start_date.message}
                    </p>
                  )}
                </div>
                <div>
                  <label style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem', display: 'block' }}>
                    {t('details.serviceTo')}
                  </label>
                  <input
                    {...register('service_end_date')}
                    type="date"
                    className="input input-compact"
                  />
                  {errors.service_end_date && (
                    <p style={{ fontSize: '0.75rem', color: '#dc2626', marginTop: '0.25rem' }}>
                      {errors.service_end_date.message}
                    </p>
                  )}
                </div>
              </div>
            )}
            
            {isClient && watchedSaleType === 'goods' && (
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem', display: 'block' }}>
                  {t('details.deliveryDate')}
                </label>
                <input
                  {...register('delivery_date')}
                  type="date"
                  className="input input-compact"
                />
                {errors.delivery_date && (
                  <p style={{ fontSize: '0.75rem', color: '#dc2626', marginTop: '0.25rem' }}>
                    {errors.delivery_date.message}
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </section>

      {/* Invoice Items Section */}
      <section>
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', 
            gap: '0.5rem',
            padding: '0.75rem',
            background: '#f9fafb',
            borderRadius: '6px',
            fontSize: '0.875rem',
            fontWeight: '500',
            color: '#6b7280'
          }}>
            <span>{t('items.description')}</span>
            <span>{t('items.qty')}</span>
            <span>{t('items.vat')}</span>
            <span>{t('items.rate')}</span>
            <span>{t('items.total')}</span>
          </div>

          {fields.map((field, index) => (
            <div key={field.id} style={{ 
              display: 'grid', 
              gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', 
              gap: '0.5rem',
              padding: '0.75rem',
              alignItems: 'center',
              borderBottom: '1px solid #f3f4f6'
            }}>
              <input
                {...register(`invoiced_items.${index}.description`)}
                type="text"
                className="input input-compact"
                placeholder={t('items.descriptionPlaceholder')}
                style={{ fontSize: '0.875rem', padding: '0.5rem' }}
              />
              <input
                {...register(`invoiced_items.${index}.quantity`, { valueAsNumber: true })}
                type="number"
                className="input input-compact"
                placeholder="1.00"
                step="0.01"
                style={{ fontSize: '0.875rem', padding: '0.5rem' }}
              />
              <select
                {...register(`invoiced_items.${index}.vat_rate`, { valueAsNumber: true })}
                className="input input-compact"
                style={{ fontSize: '0.875rem', padding: '0.5rem' }}
              >
                {VAT_RATES.map((rate) => (
                  <option key={rate.value} value={rate.value}>
                    {rate.label}
                  </option>
                ))}
              </select>
              <input
                {...register(`invoiced_items.${index}.unit_price`, { valueAsNumber: true })}
                type="number"
                className="input input-compact"
                placeholder="0.00"
                step="0.01"
                style={{ fontSize: '0.875rem', padding: '0.5rem' }}
              />
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                  €{((watch(`invoiced_items.${index}.quantity`) || 0) * (watch(`invoiced_items.${index}.unit_price`) || 0)).toFixed(2)}
                </span>
                {fields.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '24px',
                      height: '24px',
                      padding: '0',
                      background: 'transparent',
                      border: 'none',
                      color: '#ef4444',
                      cursor: 'pointer',
                      fontSize: '16px',
                      borderRadius: '4px',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#fef2f2';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                    title={t('items.removeItem')}
                  >
                    ×
                  </button>
                )}
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={addItem}
            style={{
              width: '100%',
              padding: '0.75rem',
              background: 'transparent',
              border: '1px dashed #d1d5db',
              borderRadius: '6px',
              color: '#6b7280',
              fontSize: '0.875rem',
              cursor: 'pointer',
              marginTop: '0.5rem'
            }}
          >
            {t('items.addNew')}
          </button>

          <div style={{ 
            display: 'flex', 
            justifyContent: 'flex-end', 
            alignItems: 'center',
            marginTop: '0.5rem',
            fontSize: '0.875rem',
            color: '#6b7280',
            gap: '0.5rem'
          }}>
            <input
              {...register('is_vat_included')}
              type="checkbox"
              id="is_vat_included"
              style={{ 
                width: '16px', 
                height: '16px',
                accentColor: '#3b82f6'
              }}
            />
            <label htmlFor="is_vat_included">
              {t('items.unitPriceVat')}
            </label>
          </div>
        </div>
      </section>

      {/* Payment Section */}
      <section>
        <button
          type="button"
          onClick={() => toggleSection('payment')}
          style={{
            width: '100%',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '1rem',
            background: '#f9fafb',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            fontSize: '1rem',
            fontWeight: '500',
            color: '#111827',
            cursor: 'pointer',
            marginBottom: '1rem'
          }}
        >
          <span>{t('section.payment')}</span>
          <span style={{ transform: expandedSections.payment ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
            ↓
          </span>
        </button>
        
        {expandedSections.payment && (
          <div style={{ padding: '0 1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem', display: 'block' }}>
                  {t('payment.iban')}
                </label>
                <input
                  {...register('iban')}
                  type="text"
                  className="input input-compact"
                  placeholder="DE89 3704 0044 0532 0130 00"
                />
                {errors.iban && (
                  <p style={{ fontSize: '0.75rem', color: '#dc2626', marginTop: '0.25rem' }}>
                    {errors.iban.message}
                  </p>
                )}
              </div>
              <div>
                <label style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem', display: 'block' }}>
                  {t('payment.bic')}
                </label>
                <input
                  {...register('bic')}
                  type="text"
                  className="input input-compact"
                  placeholder="COBADEFFXXX"
                />
                {errors.bic && (
                  <p style={{ fontSize: '0.75rem', color: '#dc2626', marginTop: '0.25rem' }}>
                    {errors.bic.message}
                  </p>
                )}
              </div>
            </div>
            
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem', display: 'block' }}>
                {t('payment.bankName')}
              </label>
              <input
                {...register('bank_name')}
                type="text"
                className="input input-compact"
                placeholder="Commerzbank AG"
              />
              {errors.bank_name && (
                <p style={{ fontSize: '0.75rem', color: '#dc2626', marginTop: '0.25rem' }}>
                  {errors.bank_name.message}
                </p>
              )}
            </div>
          </div>
        )}
      </section>


      {/* Notes Section */}
      <section>
        <button
          type="button"
          onClick={() => toggleSection('notes')}
          style={{
            width: '100%',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '1rem',
            background: '#f9fafb',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            fontSize: '1rem',
            fontWeight: '500',
            color: '#111827',
            cursor: 'pointer',
            marginBottom: '1rem'
          }}
        >
          <span>{t('section.notes')}</span>
          <span style={{ transform: expandedSections.notes ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
            ↓
          </span>
        </button>
        
        {expandedSections.notes && (
          <div style={{ padding: '0 1rem' }}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem', display: 'block' }}>
                {t('notes.termsConditions')}
              </label>
              <textarea
                {...register('payment_terms')}
                className="form-textarea"
                placeholder={t('notes.termsConditionsPlaceholder')}
                rows={3}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '0.875rem',
                  resize: 'vertical',
                  fontFamily: 'inherit'
                }}
              />
              {errors.payment_terms && (
                <p style={{ fontSize: '0.75rem', color: '#dc2626', marginTop: '0.25rem' }}>
                  {errors.payment_terms.message}
                </p>
              )}
            </div>
            <div>
              <label style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem', display: 'block' }}>
                {t('notes.title')}
              </label>
              <textarea
                {...register('notes')}
                className="form-textarea"
                placeholder={t('notes.placeholder')}
                rows={4}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '0.875rem',
                  resize: 'vertical',
                  fontFamily: 'inherit'
                }}
              />
            </div>
          </div>
        )}
      </section>
    </div>
  );
} 