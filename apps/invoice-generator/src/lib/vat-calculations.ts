import { euMember } from 'is-european';
import { InvoiceFormData, InvoiceItem } from './validation';

interface VatData {
  isVatZero: boolean;
  isVatNumberRequired: boolean;
  isReverseCharge: boolean;
  note?: string;
}

interface VatNotes {
  en: {
    noVat19: string;
    reverseCharge196: string;
    taxable3a: string;
    taxFree: string;
    taxFree4: string;
    reverseCharge138: string;
    ustg4: string;
  };
  de: {
    noVat19: string;
    reverseCharge196: string;
    taxable3a: string;
    taxFree: string;
    taxFree4: string;
    reverseCharge138: string;
    ustg4: string;
  };
}

const VAT_NOTES: VatNotes = {
  en: {
    noVat19: "According to § 19 UStG no VAT is charged.",
    reverseCharge196: "Reverse Charge - art. 196 VAT Directive 2006/112/CE.",
    taxable3a: "According to §3a Abs. 2 UStG taxable at the recipient location.",
    taxFree: "Tax free export delivery.",
    taxFree4: "Value added tax free service according to § 4 UStG.",
    reverseCharge138: "Reverse Charge - art. 138 par. 1 VAT Directive 2006/112/CE.",
    ustg4: "Value added tax-free service according to § 4 UStG."
  },
  de: {
    noVat19: "Gemäß § 19 UStG wird keine USt berechnet.",
    reverseCharge196: "Reverse-Charge - Art. 196 MwSt-Richtlinie 2006/112/EG.",
    taxable3a: "Gemäß §3a Abs. 2 UStG steuerpflichtig am Empfängerort.",
    taxFree: "Steuerfreie Ausfuhrlieferung.",
    taxFree4: "Umsatzsteuerfreie Leistung gemäß § 4 UStG.",
    reverseCharge138: "Reverse-Charge - Art. 138 Abs. 1 MwSt-Richtlinie 2006/112/EG.",
    ustg4: "Umsatzsteuerfreie Leistung gemäß § 4 UStG."
  }
};

const isGermany = (country: string) => country === 'DE' || country === 'Germany';

interface CalculateVatDataProps {
  formData: InvoiceFormData;
  language: 'en' | 'de';
}

export const calculateVatData = ({
  formData,
  language,
}: CalculateVatDataProps): VatData => {
  const returnData: VatData = {
    isVatZero: false,
    isVatNumberRequired: false,
    isReverseCharge: false,
    note: undefined,
  };

  const notes = VAT_NOTES[language];

  // If kleinunternehmer (small business regulation)
  if (formData.is_kleinunternehmer) {
    returnData.isVatZero = true;
    returnData.note = notes.noVat19;

    // Special rules for kleinunternehmer with foreign B2B clients
    if (formData.client_type === 'business' && !isGermany(formData.client_country)) {
      if (euMember(formData.client_country) && formData.sale_type === 'services') {
        returnData.isVatNumberRequired = true;
        returnData.isReverseCharge = true;
        returnData.note = notes.reverseCharge196;
      } else if (!euMember(formData.client_country)) {
        if (formData.sale_type === 'services') {
          returnData.note = notes.taxable3a;
        } else if (formData.sale_type === 'goods') {
          returnData.note = notes.taxFree;
        }
      }
    }
  } else {
    // Regular VAT handling (not kleinunternehmer)
    
    // EU B2B reverse charge scenarios
    if (formData.client_type === 'business' && euMember(formData.client_country)) {
      if (!isGermany(formData.client_country)) {
        returnData.isVatZero = true;
        returnData.isVatNumberRequired = true;
        returnData.isReverseCharge = true;

        if (formData.sale_type === 'services') {
          returnData.note = notes.reverseCharge196;
        } else if (formData.sale_type === 'goods') {
          returnData.note = notes.reverseCharge138;
        }
      }
    } 
    // Non-EU scenarios
    else if (!euMember(formData.client_country)) {
      returnData.isVatZero = true;

      if (formData.sale_type === 'services') {
        returnData.note = notes.taxable3a;
      } else if (formData.sale_type === 'goods') {
        returnData.note = notes.taxFree;
      }
    }
  }

  // Special note for domestic transactions with 0% VAT items (when not kleinunternehmer)
  if (
    !formData.is_kleinunternehmer &&
    isGermany(formData.client_country) &&
    formData.invoiced_items.some((item: InvoiceItem) => item.vat_rate === 0)
  ) {
    returnData.note = notes.ustg4;
  }

  return returnData;
};

// Helper function to get appropriate VAT rate based on business rules
export const getRecommendedVatRate = (formData: InvoiceFormData): number => {
  const vatData = calculateVatData({ formData, language: formData.language });
  
  if (vatData.isVatZero) {
    return 0;
  }
  
  // Default German VAT rates
  return 19; // Most common rate for services/goods
};

// Helper function to validate VAT setup
export const validateVatSetup = (formData: InvoiceFormData): string[] => {
  const errors: string[] = [];
  const vatData = calculateVatData({ formData, language: formData.language });
  
//   // Check if VAT number is required but missing
//   if (vatData.isVatNumberRequired && !formData.client_vat_number) {
//     errors.push(formData.language === 'en' 
//       ? 'Client VAT number is required for this type of transaction'
//       : 'Kunden-USt-ID ist für diese Art von Transaktion erforderlich'
//     );
//   }
  
  // Check if VAT rates are correct for kleinunternehmer
  if (formData.is_kleinunternehmer) {
    const hasNonZeroVat = formData.invoiced_items.some((item: InvoiceItem) => item.vat_rate > 0);
    if (hasNonZeroVat) {
      errors.push(formData.language === 'en'
        ? 'VAT rate should be 0% for Kleinunternehmer'
        : 'USt-Satz sollte 0% für Kleinunternehmer sein'
      );
    }
  }
  
  return errors;
}; 