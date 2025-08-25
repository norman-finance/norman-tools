# Norman Tools

A collection of free, professional business tools built with Next.js. From invoice generation to AI-powered document analysis, helping German freelancers and businesses manage their finances and tax obligations efficiently.

## 🚀 Current Tools

### E-Invoice Generator (`/erechnung`)
- 🆓 **Free to use** - No registration required
- 🇩🇪 **German compliance** - VAT validation, ZUGFeRD format
- 📄 **Professional PDFs** - Generated with embedded e-invoice XML
- 🌍 **Multi-language** - English and German support
- 📱 **Mobile responsive** - Works perfectly on all devices
- 🔄 **Real-time preview** - See your invoice as you type
- 🎨 **Clean design** - Professional black and white theme
- 📊 **Smart calculations** - Automatic VAT and total calculations
- 🏦 **Payment information** - IBAN, BIC validation

### Finanzamt Letter Analyzer (`/finanzamt-brief`)
- 🤖 **AI-powered analysis** - Understand German tax office documents instantly
- 📄 **PDF & Image support** - Upload PDFs, JPG, or PNG files
- 🔍 **Text extraction** - Client-side PDF text extraction using PDF.js
- 🛡️ **Privacy protection** - Personal information automatically redacted
- 💬 **Follow-up questions** - Interactive chat for detailed clarification
- 🇩🇪 **German tax expertise** - Specialized in Finanzamt terminology
- 📅 **Deadline detection** - Identifies important dates and urgency levels
- ✅ **Action guidance** - Clear next steps and recommendations
- 🌍 **Bilingual** - Works in English and German

## 🎯 Project Structure

The application is structured as a tools platform:

- **Main Page (`/`)**: Tools listing page showcasing available tools
- **E-Invoice Tool (`/erechnung`)**: Complete invoice generation functionality
- **Finanzamt Brief Tool (`/finanzamt-brief`)**: AI-powered tax document analysis
- **Extensible**: Easy to add new tools in the future


## 🚀 Quick Start

### Development

1. **Install dependencies**
   ```bash
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

### Production

```bash
# Build for production
npm run build

# Start production server
npm start
```

## 🌐 Language Support

The application supports **independent language control**:

- **Interface Language**: Controls form labels, buttons, and UI elements
- **Invoice Language**: Controls the generated invoice content

### URL Parameters

Control languages via URL parameters:

```bash
# German interface with English invoice
/?ui_lang=de&invoice_lang=en

# English interface with German invoice  
/?ui_lang=en&invoice_lang=de

# All German
/?ui_lang=de&invoice_lang=de
```

## 📁 Project Structure

```
src/
├── app/                     # Next.js app router
│   ├── page.tsx            # Main tools listing page
│   ├── layout.tsx          # Root layout
│   ├── erechnung/          # E-invoice tool
│   │   ├── page.tsx        # Invoice generator page
│   │   └── layout.tsx      # Tool-specific layout
│   ├── finanzamt-brief/    # Tax document analyzer
│   │   └── page.tsx        # Document analysis page
│   └── api/
│       └── finanzamt-analysis/
│           └── route.ts    # OpenAI analysis API
├── components/
│   ├── forms/              # Form components
│   │   └── InvoiceForm.tsx # Main invoice form
│   ├── preview/            # Invoice preview components
│   │   └── InvoicePreview.tsx
│   └── ui/                 # UI components
│       ├── Header.tsx      # Navigation header
│       ├── Footer.tsx      # Site footer
│       └── LoadingSpinner.tsx
├── contexts/
│   └── UILanguageContext.tsx # Language management
├── locales/
│   ├── ui/                 # Interface translations
│   │   ├── en.json        # English UI (includes Finanzamt tool)
│   │   └── de.json        # German UI (includes Finanzamt tool)
│   └── invoice/           # Invoice content translations
│       ├── en.json        # English invoices
│       └── de.json        # German invoices
├── lib/                   # Utilities and validation
│   ├── validation.ts      # Form validation schemas
│   ├── constants.ts       # App constants
│   └── api.ts            # API functions
├── utils/                 # Helper functions
└── styles/               # Global styles
```

## 🛠 Adding New Tools

The platform is designed for easy expansion. To add a new tool:

1. **Create tool route**
   ```bash
   mkdir src/app/[tool-name]
   ```

2. **Add tool page**
   ```tsx
   // src/app/[tool-name]/page.tsx
   export default function ToolPage() {
     return <div>Your tool here</div>;
   }
   ```

3. **Update main page**
   ```tsx
   // Add to tools array in src/app/page.tsx
   const tools = [
     // existing tools...
     {
       id: 'new-tool',
       title: t('tools.newTool.title'),
       description: t('tools.newTool.description'),
       href: '/new-tool',
       icon: '🛠️',
       badge: t('hero.freeLabel'),
       features: [
         t('tools.newTool.feature1'),
         t('tools.newTool.feature2'),
         t('tools.newTool.feature3')
       ]
     }
   ];
   ```

4. **Add translations**
   ```json
   // src/locales/ui/en.json
   {
     "tools": {
       "newTool": {
         "title": "New Tool",
         "description": "Description of new tool",
         "feature1": "Feature 1",
         "feature2": "Feature 2", 
         "feature3": "Feature 3"
       }
     }
   }
   ```

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file:

```env
# OpenAI API (required for Finanzamt Brief tool)
OPENAI_API_KEY=your-openai-api-key

# Analytics (optional)
NEXT_PUBLIC_GA_ID=your-ga-id
NEXT_PUBLIC_PLAUSIBLE_DOMAIN=yourdomain.com

# API Configuration (if using backend)
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

## 🌍 Internationalization

### Supported Languages
- **English** (en)
- **German** (de)

### Adding New Languages

1. **Create translation files**
   ```bash
   src/locales/ui/[lang].json
   src/locales/invoice/[lang].json
   ```

2. **Update language context**
   ```tsx
   // Add to UILanguageContext.tsx
   type Language = 'en' | 'de' | 'fr'; // Add new language
   ```

3. **Add language option**
   ```tsx
   // Add to Header.tsx language selector
   <option value="fr">🇫🇷 Français</option>
   ```

## 🛡️ Security & Compliance

### German Tax Compliance
- ZUGFeRD e-invoice format
- German VAT number validation
- Kleinunternehmer (§19 UStG) support
- Professional German invoice terminology
- AI-powered Finanzamt document analysis

### Privacy & Data Protection
- **E-Invoice Tool**: No data persistence (invoices are generated client-side)
- **Finanzamt Tool**: Personal information automatically redacted before AI analysis
- **PDF Processing**: Text extraction happens client-side (browser only)
- No tracking without consent
- GDPR compliant
- OpenAI API calls use sanitized content only

## 📈 Performance

- **Next.js 14** with App Router for optimal performance
- **Static generation** where possible
- **Optimized images** and fonts
- **Minimal JavaScript** bundle size
- **Client-side PDF processing** for privacy and speed

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🏢 About Norman Finance

This tool is part of the Norman Finance ecosystem, providing professional financial tools for freelancers and small businesses.

**Resources:**
- [Norman Finance](https://norman.finance) - Main website
- [Norman App](https://app.norman.finance) - Full business platform

---

**Made with ❤️ for the global freelancer community**

## 🎯 Roadmap

### Upcoming Tools
- 📊 **Tax Calculator** - Calculate German taxes for freelancers
- 📋 **Expense Tracker** - Track business expenses
- 📈 **VAT Calculator** - Complex VAT scenarios
- 🏦 **IBAN Validator** - Validate international bank accounts
- 📑 **Contract Generator** - Professional service contracts

### Platform Improvements
- 🌙 Dark mode support
- 🔍 Tool search functionality
- 📱 Progressive Web App (PWA)
- 🔗 Tool integrations
- 📊 Usage analytics dashboard

## 🆘 Support

- **Issues**: [GitHub Issues](https://github.com/norman-finance/norman-tools/issues)
- **Documentation**: This README and inline code comments
- **Community**: Join our Discord for discussions

---

## 📋 Dependencies

### Core Technologies
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety and developer experience
- **Tailwind CSS** - Utility-first CSS framework
- **React Hook Form** - Form handling and validation

### AI & Document Processing
- **OpenAI API** - GPT-4 and Vision for document analysis
- **PDF.js (pdfjs-dist)** - Client-side PDF text extraction
- **Canvas** - Required for PDF.js in Node.js environments

### Development
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **TypeScript** - Static type checking

---

**Current Version**: 2.1.0  
**Last Updated**: January 2025  
**New in 2.1.0**: Finanzamt Brief AI-powered document analyzer 
