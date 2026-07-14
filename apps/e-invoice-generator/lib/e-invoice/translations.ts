// UI translations for form labels, buttons, sections
export const UI_TRANSLATIONS = {
  en: {
    fillDemo: "Try with demo data",
    getInvoice: "Download e-invoice",
    generating: "Generating...",
    sectionDetails: "Details",
    sectionNotes: "Notes & Terms",
    required: "*",

    // Settings
    currency: "Currency",
    invoiceLanguage: "Invoice Language",
    saleType: "Sale type",
    vatSettings: "VAT Settings",
    kleinunternehmer: "Kleinunternehmer (§19 UStG): Small business regulation",
    kleinunternehmerDesc: "Check this if you're a small business under German tax law and don't charge VAT",

    // Company
    companyTitle: "Your business details",
    companyName: "Name",
    companyAddress: "Address",
    companyZip: "ZIP Code",
    companyCity: "City",
    companyCountry: "Country",
    companyEmail: "Email",
    companyPhone: "Phone",
    companyTaxNumber: "Tax number",
    companyVatNumber: "VAT number",
    companyNamePlaceholder: "Acme GmbH / Max Mustermann",

    // Client
    clientTitle: "Client details",
    clientName: "Client name",
    clientType: "Client type",
    clientAddress: "Client address",
    clientEmail: "Email",
    clientVatNumber: "VAT number",

    // Details
    invoiceNumber: "Invoice number",
    issued: "Issued",
    dueDate: "Due date",
    serviceFrom: "Service date from",
    serviceTo: "Service date to",
    deliveryDate: "Delivery date",

    // Items
    itemDescription: "Item description",
    itemQty: "Qty",
    itemVat: "VAT",
    itemRate: "Price",
    itemTotal: "Total",
    addItem: "Add a new item",
    unitPriceVat: "Unit price with VAT",
    removeItem: "Remove item",
    itemPlaceholder: "Product/Service",

    // Payment
    iban: "IBAN",
    bic: "BIC/SWIFT",
    bankName: "Bank Name",

    // Notes
    notesTitle: "Notes",
    notesPlaceholder: "Add any additional information here...",
    termsTitle: "Terms & Conditions",
    termsPlaceholder: "Add payment terms, terms & conditions here...",

    // Options
    person: "Person",
    business: "Business",
    services: "Services",
    goods: "Goods",

    // Messages
    successMessage: "Invoice generated successfully! Your PDF download should start automatically.",
    errorMessage: "There was an error generating the invoice. Please try again.",

    // Features
    featuresTitle: "Need more?",
    featuresDescription: "Customize your invoices, save clients, track payments, and more. Still free.",
    feature1Title: "Customize your invoices",
    feature1Desc: "Personalize your invoices with a logo, colors and fonts. Make your invoices beautiful.",
    feature2Title: "Save time",
    feature2Desc: "Never enter the same data twice. Save your clients, tax number, IBAN, and more for future use.",
    feature3Title: "Track payments",
    feature3Desc: "Instantly see your payment status and history. No more missing payments.",
    feature4Title: "Recurring invoices",
    feature4Desc: "Create recurring invoices for your clients. No more manual work.",
    feature5Title: "Auto-follow ups",
    feature5Desc: "Forget awkward chasing. Send automatic follow up emails for overdue invoices.",
    feature6Title: "Payment links (coming soon)",
    feature6Desc: "Get paid 2x faster with payment links.",

    // CTA
    ctaTitle: "Get more for free",
    ctaDescription: "Join thousands of freelancers and businesses who trust Norman for invoicing. Start creating professional invoices today.",
    ctaGetStarted: "Get started",
  },

  de: {
    fillDemo: "Mit Demo-Daten ausprobieren",
    getInvoice: "E-Rechnung herunterladen",
    generating: "Wird erstellt...",
    sectionDetails: "Details",
    sectionNotes: "Notizen & Bedingungen",
    required: "*",

    currency: "Währung",
    invoiceLanguage: "Rechnungssprache",
    saleType: "Verkaufsart",
    vatSettings: "USt-Einstellungen",
    kleinunternehmer: "Kleinunternehmer (§19 UStG): Kleinunternehmerregelung",
    kleinunternehmerDesc: "Aktivieren, wenn Sie als Kleinunternehmer keine USt berechnen",

    companyTitle: "Ihr Unternehmen",
    companyName: "Firmenname",
    companyAddress: "Adresse",
    companyZip: "PLZ",
    companyCity: "Stadt",
    companyCountry: "Land",
    companyEmail: "E-Mail",
    companyPhone: "Telefon",
    companyTaxNumber: "Steuernummer",
    companyVatNumber: "USt-IdNr.",
    companyNamePlaceholder: "Acme GmbH",

    clientTitle: "Kunde",
    clientName: "Kundenname",
    clientType: "Kundentyp",
    clientAddress: "Kundenadresse",
    clientEmail: "E-Mail",
    clientVatNumber: "USt-IdNr.",

    invoiceNumber: "Rechnungsnummer",
    issued: "Ausgestellt",
    dueDate: "Fälligkeitsdatum",
    serviceFrom: "Leistungszeitraum von",
    serviceTo: "Leistungszeitraum bis",
    deliveryDate: "Lieferdatum",

    itemDescription: "Beschreibung",
    itemQty: "Menge",
    itemVat: "MwSt",
    itemRate: "Preis",
    itemTotal: "Gesamt",
    addItem: "Neue Position hinzufügen",
    unitPriceVat: "Einzelpreis inkl. MwSt",
    removeItem: "Position entfernen",
    itemPlaceholder: "Produkt/Dienstleistung",

    iban: "IBAN",
    bic: "BIC/SWIFT",
    bankName: "Bankname",

    notesTitle: "Notizen",
    notesPlaceholder: "Zusätzliche Informationen hier eingeben...",
    termsTitle: "Geschäftsbedingungen",
    termsPlaceholder: "Zahlungsbedingungen, AGB hier eingeben...",

    person: "Person",
    business: "Unternehmen",
    services: "Dienstleistungen",
    goods: "Waren",

    successMessage: "Rechnung erfolgreich erstellt! Der PDF-Download sollte automatisch starten.",
    errorMessage: "Fehler beim Erstellen der Rechnung. Bitte versuchen Sie es erneut.",

    featuresTitle: "Mehr Funktionen?",
    featuresDescription: "Rechnungen anpassen, Kunden speichern, Zahlungen verfolgen und mehr. Immer noch kostenlos.",
    feature1Title: "Rechnungen anpassen",
    feature1Desc: "Personalisieren Sie Ihre Rechnungen mit Logo, Farben und Schriftarten.",
    feature2Title: "Zeit sparen",
    feature2Desc: "Nie wieder die gleichen Daten eingeben. Speichern Sie Kunden, Steuernummer, IBAN und mehr.",
    feature3Title: "Zahlungen verfolgen",
    feature3Desc: "Sofort den Zahlungsstatus und die Historie sehen. Keine fehlenden Zahlungen mehr.",
    feature4Title: "Wiederkehrende Rechnungen",
    feature4Desc: "Erstellen Sie wiederkehrende Rechnungen für Ihre Kunden. Keine manuelle Arbeit mehr.",
    feature5Title: "Auto-Erinnerungen",
    feature5Desc: "Vergessen Sie das unangenehme Nachfragen. Automatische Erinnerungen für überfällige Rechnungen.",
    feature6Title: "Zahlungslinks (bald verfügbar)",
    feature6Desc: "2x schneller bezahlt werden mit Zahlungslinks.",

    ctaTitle: "Mehr kostenlos erhalten",
    ctaDescription: "Schließen Sie sich Tausenden von Freelancern an, die Norman für die Rechnungsstellung vertrauen.",
    ctaGetStarted: "Jetzt starten",
  },

  ru: {
    fillDemo: "Попробовать с демо-данными",
    getInvoice: "Скачать e-invoice",
    generating: "Создаётся...",
    sectionDetails: "Детали",
    sectionNotes: "Заметки и условия",
    required: "*",

    currency: "Валюта",
    invoiceLanguage: "Язык счёта",
    saleType: "Тип продажи",
    vatSettings: "Настройки НДС",
    kleinunternehmer: "Kleinunternehmer (§19 UStG): правило малого предпринимателя",
    kleinunternehmerDesc: "Отметьте, если вы — Kleinunternehmer по немецкому законодательству и не начисляете НДС",

    companyTitle: "Данные вашей компании",
    companyName: "Название",
    companyAddress: "Адрес",
    companyZip: "Индекс",
    companyCity: "Город",
    companyCountry: "Страна",
    companyEmail: "Email",
    companyPhone: "Телефон",
    companyTaxNumber: "Налоговый номер (Steuernummer)",
    companyVatNumber: "Номер НДС (USt-IdNr.)",
    companyNamePlaceholder: "Acme GmbH / Max Mustermann",

    clientTitle: "Данные клиента",
    clientName: "Имя клиента",
    clientType: "Тип клиента",
    clientAddress: "Адрес клиента",
    clientEmail: "Email",
    clientVatNumber: "Номер НДС",

    invoiceNumber: "Номер счёта",
    issued: "Выставлен",
    dueDate: "Срок оплаты",
    serviceFrom: "Период услуги с",
    serviceTo: "Период услуги по",
    deliveryDate: "Дата поставки",

    itemDescription: "Описание позиции",
    itemQty: "Кол-во",
    itemVat: "НДС",
    itemRate: "Цена",
    itemTotal: "Итого",
    addItem: "Добавить позицию",
    unitPriceVat: "Цена за единицу с НДС",
    removeItem: "Удалить позицию",
    itemPlaceholder: "Товар/услуга",

    iban: "IBAN",
    bic: "BIC/SWIFT",
    bankName: "Название банка",

    notesTitle: "Заметки",
    notesPlaceholder: "Дополнительная информация...",
    termsTitle: "Условия",
    termsPlaceholder: "Условия оплаты, правила и условия...",

    person: "Физ. лицо",
    business: "Компания",
    services: "Услуги",
    goods: "Товары",

    successMessage: "Счёт успешно создан! Скачивание PDF начнётся автоматически.",
    errorMessage: "Не удалось создать счёт. Пожалуйста, попробуйте ещё раз.",

    featuresTitle: "Нужно больше?",
    featuresDescription: "Кастомизируйте счета, сохраняйте клиентов, отслеживайте платежи и многое другое. Всё так же бесплатно.",
    feature1Title: "Кастомизация счетов",
    feature1Desc: "Персонализируйте счета логотипом, цветами и шрифтами. Сделайте их красивыми.",
    feature2Title: "Экономия времени",
    feature2Desc: "Никогда не вводите одни и те же данные дважды. Сохраняйте клиентов, налоговый номер, IBAN и другое.",
    feature3Title: "Отслеживание платежей",
    feature3Desc: "Мгновенно видите статус и историю платежей. Никаких пропущенных поступлений.",
    feature4Title: "Регулярные счета",
    feature4Desc: "Создавайте периодические счета для клиентов. Без ручной работы.",
    feature5Title: "Авто-напоминания",
    feature5Desc: "Забудьте о неловких разговорах. Автоматические письма по просроченным счетам.",
    feature6Title: "Платёжные ссылки (скоро)",
    feature6Desc: "Получайте оплату в 2 раза быстрее с помощью платёжных ссылок.",

    ctaTitle: "Получите больше бесплатно",
    ctaDescription: "Присоединяйтесь к тысячам фрилансеров и компаний, которые используют Norman для выставления счетов.",
    ctaGetStarted: "Начать",
  },
} as const;

// Invoice preview/PDF content translations
export const INVOICE_TRANSLATIONS = {
  en: {
    invoice: "Invoice",
    invoiceDate: "Invoice Date",
    dueDate: "Due Date",
    deliveryDate: "Delivery Date",
    serviceFrom: "Service Period",
    description: "Description",
    qty: "Qty",
    unitPrice: "Unit Price",
    vat: "VAT",
    total: "Total",
    subtotal: "Subtotal",
    vatAmount: "VAT Amount",
    totalAmount: "Total Amount",
    bank: "Bank",
    taxNotice: "Tax Notice",
    reverseCharge: "Reverse charge - VAT payable by recipient",
    taxNumber: "Tax Number",
    vatNumber: "VAT Number",
    notes: "Notes",
    terms: "Terms",
  },
  de: {
    invoice: "Rechnung",
    invoiceDate: "Rechnungsdatum",
    dueDate: "Fälligkeitsdatum",
    deliveryDate: "Lieferdatum",
    serviceFrom: "Leistungszeitraum",
    description: "Beschreibung",
    qty: "Menge",
    unitPrice: "Einzelpreis",
    vat: "MwSt",
    total: "Gesamt",
    subtotal: "Zwischensumme",
    vatAmount: "MwSt-Betrag",
    totalAmount: "Gesamtbetrag",
    bank: "Bank",
    taxNotice: "Steuerhinweis",
    reverseCharge: "Steuerschuldnerschaft des Leistungsempfängers",
    taxNumber: "Steuernummer",
    vatNumber: "USt-IdNr.",
    notes: "Notizen",
    terms: "Geschäftsbedingungen",
  },
} as const;

type UILocale = keyof typeof UI_TRANSLATIONS;
type UIKey = keyof (typeof UI_TRANSLATIONS)["en"];

export function getUITranslation(locale: UILocale, key: UIKey): string {
  return UI_TRANSLATIONS[locale][key];
}

type InvoiceKey = keyof (typeof INVOICE_TRANSLATIONS)["en"];

export function getInvoiceTranslation(locale: "en" | "de", key: InvoiceKey): string {
  return INVOICE_TRANSLATIONS[locale][key];
}
