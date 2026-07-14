import type { Locale } from "./locale";

/**
 * Props contract of the TaxCalculatorSection widget.
 * Lifted from norman-website `lib/types/sections.ts`.
 */
export interface TaxCalculatorSectionProps {
  id?: string;
  locale: Locale;
  eyebrow?: string;
  heading: string;
  description: string;
  mountId: string;
  formTitle: string;
  resultTitle: string;
  incomeInput: {
    label: string;
    min: number;
    max: number;
    step: number;
    defaultValue: number;
  };
  expensesInput: {
    label: string;
    min: number;
    max: number;
    step: number;
    defaultValue: number;
  };
  personalSituationLabel: string;
  personalSituationOptions: Array<{
    label: string;
    value: number;
  }>;
  childrenLabel: string;
  childrenOptions: Array<{
    label: string;
    value: number;
  }>;
  disclaimerTitle: string;
  disclaimerBody: string;
  errorText: string;
  resultLabels: {
    taxableIncome: string;
    annualIncome: string;
    expenses: string;
    toPay: string;
    publicHealthInsurance: string;
    incomeTax: string;
    solidarityTax: string;
    takeHomePay: string;
  };
}

export interface PageContent {
  hero: {
    title: string;
    subtitle: string;
    ctaLabel: string;
    ctaHref: string;
  };
  calculator: TaxCalculatorSectionProps;
}

const CTA_HREF =
  "https://app.norman.finance/sign-up?utm_source=freetools&utm_campaign=tax-calculator";

/** Tri-locale page copy, lifted from norman-website `lib/content/page-sections.ts`. */
export const CONTENT: Record<Locale, PageContent> = {
  de: {
    hero: {
      title: "Steuerrechner für Selbstständige in Deutschland",
      subtitle:
        "Plane deine voraussichtliche Einkommensteuer als Freiberufler oder Solo-Selbstständige in Deutschland. Die Seite hilft dir, Gewinn, Ausgaben und wichtige Einflussfaktoren strukturiert vorzubereiten.",
      ctaLabel: "Kostenlos starten",
      ctaHref: CTA_HREF,
    },
    calculator: {
      id: "calculator",
      locale: "de",
      eyebrow: "Steuerschätzung vorbereiten",
      heading: "Steuerrechner für Selbstständige",
      description:
        "Nutze den nativen Rechner direkt auf dieser Seite, um Einkommen, Ausgaben und Familienstatus für eine grobe Einkommensteuer-Schätzung in Deutschland durchzuspielen.",
      mountId: "tax-calculator-root",
      formTitle: "Deine Situation",
      resultTitle: "Geschätzte Steuer und verbleibender Gewinn",
      incomeInput: {
        label: "Jährliches Einkommen aus Selbstständigkeit",
        min: 5000,
        max: 150000,
        step: 5000,
        defaultValue: 50000,
      },
      expensesInput: {
        label: "Selbstständige Ausgaben",
        min: 0,
        max: 50000,
        step: 1000,
        defaultValue: 5000,
      },
      personalSituationLabel: "Persönliche Situation",
      personalSituationOptions: [
        { value: 1, label: "Ledig" },
        { value: 2, label: "Verheiratet" },
      ],
      childrenLabel: "Wie viele Kinder hast du insgesamt?",
      childrenOptions: [
        { value: 0, label: "0" },
        { value: 1, label: "1" },
        { value: 2, label: "2" },
        { value: 3, label: "3" },
      ],
      disclaimerTitle: "Hinweis:",
      disclaimerBody:
        "Diese Berechnung basiert auf einer Reihe von Annahmen und nutzt Durchschnittswerte. Die Ergebnisse sind als Schätzung zu verstehen und nicht als verbindliche Zahl.",
      errorText:
        "Bei der Steuerberechnung ist ein Fehler aufgetreten. Bitte versuche es erneut.",
      resultLabels: {
        taxableIncome: "💼 Zu versteuernder Gesamtgewinn",
        annualIncome: "Jährliches Einkommen",
        expenses: "Ausgaben",
        toPay: "💸 Zu zahlen",
        publicHealthInsurance: "Gesetzliche Krankenversicherung",
        incomeTax: "Einkommensteuer",
        solidarityTax: "Solidaritätszuschlag",
        takeHomePay: "💰 Dein verbleibender Gewinn",
      },
    },
  },
  en: {
    hero: {
      title: "Tax calculator for freelancers in Germany",
      subtitle:
        "Plan your expected income tax as a freelancer or solo self-employed operator in Germany. This page helps you structure profit, expenses, and the inputs that most affect the estimate.",
      ctaLabel: "Get started for free",
      ctaHref: CTA_HREF,
    },
    calculator: {
      id: "calculator",
      locale: "en",
      eyebrow: "Prepare your estimate",
      heading: "Tax calculator for self-employed users",
      description:
        "Use the native calculator directly on this page to model income, expenses, and family status for a rough income-tax estimate in Germany.",
      mountId: "tax-calculator-root",
      formTitle: "Your Situation",
      resultTitle: "Estimated Tax and Profit",
      incomeInput: {
        label: "Annual self-employed income",
        min: 5000,
        max: 150000,
        step: 5000,
        defaultValue: 50000,
      },
      expensesInput: {
        label: "Self-employed expenses",
        min: 0,
        max: 50000,
        step: 1000,
        defaultValue: 5000,
      },
      personalSituationLabel: "Personal Situation",
      personalSituationOptions: [
        { value: 1, label: "Single" },
        { value: 2, label: "Married" },
      ],
      childrenLabel: "How many children do you have in total?",
      childrenOptions: [
        { value: 0, label: "0" },
        { value: 1, label: "1" },
        { value: 2, label: "2" },
        { value: 3, label: "3" },
      ],
      disclaimerTitle: "Disclaimer:",
      disclaimerBody:
        "This calculation is based on a series of assumptions and uses average rates. The results should be considered as estimates and not as definitive figures.",
      errorText: "An error occurred while calculating taxes. Please try again.",
      resultLabels: {
        taxableIncome: "💼 Total taxable income",
        annualIncome: "Annual Income",
        expenses: "Expenses",
        toPay: "💸 To pay",
        publicHealthInsurance: "Public Health Insurance",
        incomeTax: "Income tax",
        solidarityTax: "Solidarity tax",
        takeHomePay: "💰 Your take-home pay",
      },
    },
  },
  ru: {
    hero: {
      title: "Налоговый калькулятор для самозанятых в Германии",
      subtitle:
        "Планируйте ожидаемый income tax как фрилансер или самозанятый в Германии. Эта страница помогает структурировать прибыль, расходы и факторы, влияющие на оценку.",
      ctaLabel: "Начать бесплатно",
      ctaHref: CTA_HREF,
    },
    calculator: {
      id: "calculator",
      locale: "ru",
      eyebrow: "Подготовьте оценку",
      heading: "Налоговый калькулятор для самозанятых",
      description:
        "Используйте встроенный калькулятор прямо на этой странице, чтобы смоделировать доход, расходы и семейный статус для примерной оценки income tax в Германии.",
      mountId: "tax-calculator-root",
      formTitle: "Ваша ситуация",
      resultTitle: "Оценка налога и оставшейся прибыли",
      incomeInput: {
        label: "Годовой доход от самозанятости",
        min: 5000,
        max: 150000,
        step: 5000,
        defaultValue: 50000,
      },
      expensesInput: {
        label: "Расходы по самозанятости",
        min: 0,
        max: 50000,
        step: 1000,
        defaultValue: 5000,
      },
      personalSituationLabel: "Личная ситуация",
      personalSituationOptions: [
        { value: 1, label: "Не в браке" },
        { value: 2, label: "В браке" },
      ],
      childrenLabel: "Сколько у вас детей?",
      childrenOptions: [
        { value: 0, label: "0" },
        { value: 1, label: "1" },
        { value: 2, label: "2" },
        { value: 3, label: "3" },
      ],
      disclaimerTitle: "Disclaimer:",
      disclaimerBody:
        "This calculation is based on a series of assumptions and uses average rates. The results should be considered as estimates and not as definitive figures.",
      errorText: "An error occurred while calculating taxes. Please try again.",
      resultLabels: {
        taxableIncome: "💼 Total taxable income",
        annualIncome: "Annual Income",
        expenses: "Expenses",
        toPay: "💸 To pay",
        publicHealthInsurance: "Public Health Insurance",
        incomeTax: "Income tax",
        solidarityTax: "Solidarity tax",
        takeHomePay: "💰 Your take-home pay",
      },
    },
  },
};
