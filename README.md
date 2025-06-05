# Norman Invoicing Tool

A free, professional invoicing tool built with Next.js and Django. Generate beautiful invoices with embedded e-invoice XML, optimized for German freelancers and businesses.

## Features

- 🆓 **Free to use** - No registration required
- 🇩🇪 **German compliance** - VAT validation, reverse charge scenarios
- 📄 **Professional PDFs** - Generated with embedded e-invoice XML
- 🌍 **Multi-language** - English and German support
- 📱 **Mobile responsive** - Works perfectly on all devices
- 🔄 **Real-time preview** - See your invoice as you type
- 🎨 **Customizable** - Multiple fonts and color schemes
- 📊 **Smart calculations** - Automatic VAT and total calculations
- 🏦 **Payment information** - IBAN, BIC validation
- 📎 **Iframe embeddable** - Perfect for integration in websites

## Quick Start

### Frontend (Next.js)

1. **Install dependencies**
   ```bash
   cd norman-invoicing-tool
   npm install
   ```

2. **Start development server**
   ```bash
   npm run dev
   ```

3. **Open in browser**
   ```
   http://localhost:3000
   ```

### Backend (Django)

1. **Set up virtual environment**
   ```bash
   cd norman-finance-api
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Run migrations**
   ```bash
   python manage.py migrate
   ```

4. **Start development server**
   ```bash
   python manage.py runserver 8000
   ```

5. **API available at**
   ```
   http://localhost:8000/api/v1/invoices/public/
   ```

## API Endpoints

### Generate Invoice
```
POST /api/v1/invoices/public/generate/
```

Generate a professional PDF invoice with embedded e-invoice XML.

**Request Body:**
```json
{
  "company_name": "Your Company Ltd.",
  "company_address": "123 Business Street",
  "company_zip_code": "10115",
  "company_city": "Berlin",
  "company_country": "DE",
  "company_email": "hello@company.com",
  "company_vat_number": "DE123456789",
  
  "client_name": "Client Company GmbH",
  "client_address": "456 Client Street",
  "client_zip_code": "20095",
  "client_city": "Hamburg",
  "client_country": "DE",
  "client_vat_number": "DE987654321",
  
  "invoice_number": "INV-2024-001",
  "issue_date": "2024-01-15",
  "due_date": "2024-02-14",
  
  "invoiced_items": [
    {
      "description": "Web Development Services",
      "quantity": 40,
      "unit_price": 85.00,
      "vat_rate": 19
    }
  ],
  
  "currency": "EUR",
  "language": "en",
  "is_vat_included": false,
  "payment_terms": 30,
  "iban": "DE89 3704 0044 0532 0130 00",
  "bic": "COBADEFFXXX"
}
```

**Response:**
```
Content-Type: application/pdf
Content-Disposition: attachment; filename="invoice_INV-2024-001.pdf"

[PDF Binary Data]
```

### Get Statistics
```
GET /api/v1/invoices/public/stats/
```

Get usage statistics for the invoicing tool.

**Response:**
```json
{
  "total_invoices": 1250,
  "invoices_today": 45,
  "invoices_this_month": 892,
  "popular_currencies": ["EUR", "USD", "GBP"],
  "popular_countries": ["DE", "US", "GB"]
}
```

## Architecture

### Frontend (Next.js 14)
- **Framework:** Next.js 14 with App Router
- **Language:** TypeScript
- **Styling:** Tailwind CSS with custom design system
- **Forms:** React Hook Form with Zod validation
- **State:** React hooks for local state management

### Backend (Django)
- **Framework:** Django REST Framework
- **Database:** SQLite (development) / PostgreSQL (production)
- **PDF Generation:** WeasyPrint with HTML templates
- **E-Invoice:** Custom XML generation for German compliance

### Key Components

#### Frontend
- `InvoiceForm` - Main form for invoice data entry
- `InvoicePreview` - Real-time preview of the invoice
- `Header` - Application header with branding
- `LoadingSpinner` - Loading states
- `ErrorMessage` / `SuccessMessage` - User feedback

#### Backend
- `PublicInvoiceViewSet` - API endpoints for invoice generation
- `PublicInvoiceCreator` - Service for creating invoices without database
- `InvoicePDFRenderer` - PDF generation from HTML templates
- `EInvoiceService` - XML generation for e-invoices

## Validation & Compliance

### German Tax Compliance
- VAT number validation (DE123456789 format)
- Reverse charge scenarios for EU B2B transactions
- Proper tax information on invoices
- E-invoice XML embedding

### Form Validation
- Real-time field validation
- German-specific VAT number formats
- IBAN/BIC validation
- Currency and date formatting

### Security
- No data persistence on backend
- CORS configuration for iframe embedding
- Input sanitization and validation
- Rate limiting on API endpoints

## Deployment

### Frontend (Vercel/Netlify)
```bash
npm run build
npm start
```

### Backend (Railway/Heroku)
```bash
# Set environment variables
DJANGO_SECRET_KEY=your-secret-key
DEBUG=False
ALLOWED_HOSTS=your-domain.com

# Deploy
python manage.py collectstatic
gunicorn wsgi:application
```

## Environment Variables

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:8001
NEXT_PUBLIC_GA_ID=GA_MEASUREMENT_ID
NEXT_PUBLIC_PLAUSIBLE_DOMAIN=yourdomain.com
```

### Backend (.env)
```
DJANGO_SECRET_KEY=your-very-secret-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:3000
```

## Development

### Adding New Features
1. Update validation schemas in `src/lib/validation.ts`
2. Add form fields in `InvoiceForm.tsx`
3. Update preview in `InvoicePreview.tsx`
4. Modify backend serializer and PDF template
5. Test with various invoice scenarios

### Testing
```bash
# Frontend
npm run test

# Backend
python manage.py test
```

## License

MIT License - See LICENSE file for details.

## Support

For issues and feature requests, please create an issue in the GitHub repository.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

---

Built with ❤️ for the freelancer community 

## ✨ Features

- **Dual Language System**: Separate control for interface language and invoice content language
- **URL Parameter Support**: Share specific language configurations via URL
- **German Tax Compliance**: Professional German business terminology and tax compliance features
- **Professional Design**: Clean, modern interface with beautiful invoice previews
- **Real-time Preview**: See your invoice update in real-time as you type
- **Multiple Currency Support**: Support for EUR, USD, GBP and more
- **VAT Handling**: Automatic VAT calculations with German Kleinunternehmer support
- **No Registration Required**: Generate invoices immediately without signup

## 🌐 Language Control

### Interface vs Invoice Language

The application supports **independent language control**:

- **Interface Language**: Controls form labels, buttons, and UI elements
- **Invoice Language**: Controls the generated invoice content (headers, table labels, etc.)

This allows users to have a German interface while generating English invoices for international clients, or vice versa.

### URL Parameters

You can control languages via URL parameters for easy sharing:

#### UI Language
- `?ui_lang=en` - English interface
- `?ui_lang=de` - German interface
- `?uiLang=en` - Alternative parameter name

#### Invoice Language
- `?invoice_lang=en` - English invoice content
- `?invoice_lang=de` - German invoice content  
- `?invoiceLang=en` - Alternative parameter name

#### Examples

```
# German interface with English invoice
https://yoursite.com/?ui_lang=de&invoice_lang=en

# English interface with German invoice
https://yoursite.com/?ui_lang=en&invoice_lang=de

# All German
https://yoursite.com/?ui_lang=de&invoice_lang=de
```

### Language Priority

The system follows this priority order:

1. **URL Parameters** (highest priority)
2. **localStorage** (saved user preference)
3. **Default** (English)

When you change language via the interface, the URL is automatically updated to reflect your choice.

## 🚀 Getting Started

### Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:3000` (or next available port).

### Production

```bash
# Build for production
npm run build

# Start production server
npm start
```

## 📁 Project Structure

```
src/
├── app/                     # Next.js app router
├── components/
│   ├── forms/              # Form components
│   ├── preview/            # Invoice preview components
│   └── ui/                 # UI components
├── contexts/
│   └── UILanguageContext.tsx # UI language management
├── locales/
│   ├── ui/                 # Interface translations
│   │   ├── en.json        # English UI translations
│   │   └── de.json        # German UI translations
│   └── invoice/           # Invoice content translations
│       ├── en.json        # English invoice translations
│       └── de.json        # German invoice translations
├── lib/                   # Utilities and constants
├── types/                 # TypeScript type definitions
└── utils/                 # Helper functions
```

## 🛠 Translation System

### Adding New UI Translations

Edit the JSON files in `src/locales/ui/`:

```json
// en.json
{
  "header": {
    "title": "Free Invoice Generator"
  },
  "button": {
    "save": "Save"
  }
}
```

### Adding New Invoice Translations

Edit the JSON files in `src/locales/invoice/`:

```json
// en.json
{
  "headers": {
    "invoice": "Invoice"
  },
  "dates": {
    "invoiceDate": "Invoice Date"
  }
}
```

### Using Translations

#### UI Translations
```tsx
import { useUILanguage } from '@/contexts/UILanguageContext';

function MyComponent() {
  const { t } = useUILanguage();
  
  return <h1>{t('header.title')}</h1>;
}
```

#### Invoice Translations
```tsx
import { getInvoiceTranslationFunction } from '@/utils/invoiceTranslations';

const it = await getInvoiceTranslationFunction('en');
const title = it('headers.invoice'); // "Invoice"
```

## 💼 Business Features

### German Tax Compliance
- Kleinunternehmer (§19 UStG) support
- Proper German tax terminology
- VAT number validation
- Professional German invoice format

### International Support
- Multiple currencies
- Country-specific formatting
- Reverse charge mechanism for EU B2B transactions

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file:

```env
# Add any environment variables here
```

### Customization

The application is highly customizable through:

- **Constants**: Edit `src/lib/constants.ts` for currencies, countries, etc.
- **Styling**: Modify Tailwind classes and global CSS
- **Translations**: Add new languages by creating new JSON files

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Add your changes
4. Update translations if needed
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🏢 About Norman Finance

This tool is part of the Norman Finance ecosystem, providing professional financial tools for freelancers and small businesses.

---

**Made with ❤️ for the global freelancer community** 