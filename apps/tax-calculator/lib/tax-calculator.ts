export const PersonalSituation = {
  SINGLE: 1,
  MARRIED: 2,
} as const;

export type PersonalSituationValue = (typeof PersonalSituation)[keyof typeof PersonalSituation];

export interface TaxCalculatorInputs {
  selfEmployedIncome: number;
  selfEmployedExpenses: number;
  personalSituation: PersonalSituationValue;
  childCount: number;
}

export interface HealthInsuranceCalculation {
  monthlyContribution: number;
  annualContribution: number;
  healthInsuranceRate: number;
  pflegeversicherungRate: number;
  totalRate: number;
}

export class IncomeTaxCalculationResult {
  taxableProfit: number;
  incomeTax: number;
  solidarityTax: number;
  healthInsurance: HealthInsuranceCalculation;
  totalTaxToPay: number;
  amountLeft: number;

  constructor(
    incomeTax: number,
    solidarityTax: number,
    healthInsurance: HealthInsuranceCalculation,
    totalTaxToPay: number,
    amountLeft: number,
    taxableProfit: number,
  ) {
    this.taxableProfit = taxableProfit;
    this.incomeTax = incomeTax;
    this.solidarityTax = solidarityTax;
    this.healthInsurance = healthInsurance;
    this.totalTaxToPay = Math.round(totalTaxToPay);
    this.amountLeft = Math.round(amountLeft);
  }
}

export class IncomeTaxCalculator {
  calculate(
    taxableProfit: number,
    personalSituation: PersonalSituationValue,
    childCount: number,
  ): IncomeTaxCalculationResult {
    const healthInsurance = this.calculateHealthInsuranceForSelfEmployed(taxableProfit, childCount);
    const incomeTax = this.calculateIncomeTax(
      taxableProfit - healthInsurance.annualContribution,
      personalSituation,
    );
    const solidarityTax = this.calculateSolidarityTax(incomeTax, personalSituation);
    const totalTaxToPay = healthInsurance.annualContribution + incomeTax + solidarityTax;
    const amountLeft = taxableProfit - totalTaxToPay;

    return new IncomeTaxCalculationResult(
      incomeTax,
      solidarityTax,
      healthInsurance,
      totalTaxToPay,
      amountLeft,
      taxableProfit,
    );
  }

  calculateIncomeTax(taxableProfit: number, personalSituation: PersonalSituationValue): number {
    let incomeTax = 0.0;
    let adjustedTaxableProfit = taxableProfit;

    if (personalSituation === PersonalSituation.MARRIED) {
      adjustedTaxableProfit = adjustedTaxableProfit / 2;
    }

    if (adjustedTaxableProfit >= 11605 && adjustedTaxableProfit <= 17005) {
      const y = (adjustedTaxableProfit - 11604) / 10000;
      incomeTax = (922.98 * y + 1400) * y;
    } else if (adjustedTaxableProfit >= 17006 && adjustedTaxableProfit <= 66760) {
      const z = (adjustedTaxableProfit - 17005) / 10000;
      incomeTax = (181.19 * z + 2397) * z + 1025.38;
    } else if (adjustedTaxableProfit >= 66761 && adjustedTaxableProfit <= 277825) {
      incomeTax = 0.42 * adjustedTaxableProfit - 10602.13;
    } else if (adjustedTaxableProfit >= 277826) {
      incomeTax = 0.45 * adjustedTaxableProfit - 18936.88;
    }

    incomeTax = Math.floor(incomeTax);

    if (personalSituation === PersonalSituation.MARRIED) {
      incomeTax = Math.floor(incomeTax * 2);
    }

    return incomeTax;
  }

  calculateSolidarityTax(incomeTax: number, personalSituation: PersonalSituationValue): number {
    const SOLIDARITY_TAX_THRESHOLD_SINGLE = 18130;
    const SOLIDARITY_TAX_THRESHOLD_MARRIED = 36260;

    if (
      (personalSituation === PersonalSituation.SINGLE &&
        incomeTax <= SOLIDARITY_TAX_THRESHOLD_SINGLE) ||
      (personalSituation === PersonalSituation.MARRIED &&
        incomeTax <= SOLIDARITY_TAX_THRESHOLD_SINGLE * 2)
    ) {
      return 0.0;
    }

    let solidarityTax;
    const solidarityTaxRate = 5.5 / 100;

    if (
      (personalSituation === PersonalSituation.SINGLE &&
        incomeTax > SOLIDARITY_TAX_THRESHOLD_SINGLE) ||
      (personalSituation === PersonalSituation.MARRIED &&
        incomeTax > SOLIDARITY_TAX_THRESHOLD_MARRIED)
    ) {
      solidarityTax = incomeTax * solidarityTaxRate;
    } else {
      const excessAmount =
        personalSituation === PersonalSituation.SINGLE
          ? incomeTax - SOLIDARITY_TAX_THRESHOLD_SINGLE
          : incomeTax - SOLIDARITY_TAX_THRESHOLD_SINGLE * 2;

      solidarityTax = excessAmount * 0.2;
    }

    solidarityTax = Math.round(solidarityTax * 100) / 100;

    return solidarityTax;
  }

  calculateHealthInsuranceForSelfEmployed(
    taxableProfit: number,
    childrenCount: number,
  ): HealthInsuranceCalculation {
    const age = 25;
    const healthInsurance = {
      selfEmployedTarif: 14.0 / 100,
      avgZusatzbeitrag: 1.2 / 100,
      minFreiwilligMonthlyIncome: 1131.67,
      maxMonthlyIncome: 5175.0,
    };

    const pflegeversicherung = {
      defaultTarif: 3.4 / 100,
      surchargeTarif: 4.0 / 100,
      discountPerChild: 0.25 / 100,
      minimumChildCountForDiscount: 2,
      maximumChildCountForDiscount: 5,
      defaultTarifMaxAge: 23,
    };

    const monthlyIncome = Math.max(
      taxableProfit / 12,
      healthInsurance.minFreiwilligMonthlyIncome,
    );
    const adjustedIncome = Math.min(
      Math.max(monthlyIncome, healthInsurance.minFreiwilligMonthlyIncome),
      healthInsurance.maxMonthlyIncome,
    );

    let pflegeversicherungRate;
    if (age > pflegeversicherung.defaultTarifMaxAge && childrenCount === 0) {
      pflegeversicherungRate = pflegeversicherung.surchargeTarif;
    } else if (childrenCount < pflegeversicherung.minimumChildCountForDiscount) {
      pflegeversicherungRate = pflegeversicherung.defaultTarif;
    } else {
      const discountedChildCount = Math.min(
        childrenCount,
        pflegeversicherung.maximumChildCountForDiscount,
      );
      pflegeversicherungRate =
        pflegeversicherung.defaultTarif -
        pflegeversicherung.discountPerChild * (discountedChildCount - 1);
    }

    const healthInsuranceRate =
      healthInsurance.selfEmployedTarif + healthInsurance.avgZusatzbeitrag;
    const totalRate = healthInsuranceRate + pflegeversicherungRate;
    const monthlyContribution = adjustedIncome * totalRate;

    return {
      monthlyContribution: Math.round(monthlyContribution * 100) / 100,
      annualContribution: Math.round(monthlyContribution * 12 * 100) / 100,
      healthInsuranceRate,
      pflegeversicherungRate,
      totalRate,
    };
  }
}

const calculator = new IncomeTaxCalculator();

export function calculateTaxFromInputs(
  inputs: TaxCalculatorInputs,
): IncomeTaxCalculationResult {
  const taxableProfit = inputs.selfEmployedIncome - inputs.selfEmployedExpenses;

  return calculator.calculate(
    taxableProfit,
    inputs.personalSituation,
    inputs.childCount,
  );
}
