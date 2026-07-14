"use client";

import { useId, useState } from "react";
import { cn } from "@/lib/utils";
import {
  PersonalSituation,
  type PersonalSituationValue,
  calculateTaxFromInputs,
} from "@/lib/tax-calculator";
import type { TaxCalculatorSectionProps as TaxCalculatorSectionContract } from "@/lib/content";
import styles from "./tax-calculator.module.css";

function formatEuro(value: number, locale: TaxCalculatorSectionContract["locale"]) {
  const localeTag = locale === "de" ? "de-DE" : locale === "ru" ? "ru-RU" : "en-US";

  return `€${new Intl.NumberFormat(localeTag, { maximumFractionDigits: 2 }).format(value)}`;
}

export function TaxCalculatorSection({
  id,
  locale,
  eyebrow,
  heading,
  description,
  mountId,
  formTitle,
  resultTitle,
  incomeInput,
  expensesInput,
  personalSituationLabel,
  personalSituationOptions,
  childrenLabel,
  childrenOptions,
  disclaimerTitle,
  disclaimerBody,
  errorText,
  resultLabels,
}: Omit<TaxCalculatorSectionContract, "type">) {
  const [selfEmployedIncome, setSelfEmployedIncome] = useState(incomeInput.defaultValue);
  const [selfEmployedExpenses, setSelfEmployedExpenses] = useState(expensesInput.defaultValue);
  const [personalSituation, setPersonalSituation] = useState<PersonalSituationValue>(
    PersonalSituation.SINGLE,
  );
  const [childCount, setChildCount] = useState(childrenOptions[0]?.value ?? 0);
  const childrenGroupName = useId();

  let calculationError: string | null = null;
  let result = null;

  try {
    result = calculateTaxFromInputs({
      selfEmployedIncome,
      selfEmployedExpenses,
      personalSituation,
      childCount,
    });
  } catch {
    calculationError = errorText;
  }

  return (
    <section id={id} className={styles.section}>
      <div className={styles.inner}>
        <div className={styles.header}>
          {eyebrow ? <p className={styles.eyebrow}>{eyebrow}</p> : null}
          <h2 className={styles.heading}>{heading}</h2>
          <p className={styles.description}>{description}</p>
        </div>

        <div id={mountId} className={styles.calculatorShell}>
          <div className={cn(styles.panel, styles.formPanel)}>
            <h3 className={styles.panelTitle}>{formTitle}</h3>

            <div className={styles.inputGroup}>
              <div className={styles.inputHeader}>
                <label className={styles.inputLabel} htmlFor={`${mountId}-income`}>
                  {incomeInput.label}
                </label>
                <output className={styles.inputValue} htmlFor={`${mountId}-income`}>
                  {formatEuro(selfEmployedIncome, locale)}
                </output>
              </div>
              <input
                id={`${mountId}-income`}
                className={styles.range}
                type="range"
                min={incomeInput.min}
                max={incomeInput.max}
                step={incomeInput.step}
                value={selfEmployedIncome}
                onInput={(event) => setSelfEmployedIncome(Number(event.currentTarget.value))}
              />
            </div>

            <div className={styles.inputGroup}>
              <div className={styles.inputHeader}>
                <label className={styles.inputLabel} htmlFor={`${mountId}-expenses`}>
                  {expensesInput.label}
                </label>
                <output className={styles.inputValue} htmlFor={`${mountId}-expenses`}>
                  {formatEuro(selfEmployedExpenses, locale)}
                </output>
              </div>
              <input
                id={`${mountId}-expenses`}
                className={styles.range}
                type="range"
                min={expensesInput.min}
                max={expensesInput.max}
                step={expensesInput.step}
                value={selfEmployedExpenses}
                onInput={(event) => setSelfEmployedExpenses(Number(event.currentTarget.value))}
              />
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.inputLabel} htmlFor={`${mountId}-personal-situation`}>
                {personalSituationLabel}
              </label>
              <select
                id={`${mountId}-personal-situation`}
                className={styles.select}
                value={personalSituation}
                onInput={(event) =>
                  setPersonalSituation(Number(event.currentTarget.value) as PersonalSituationValue)
                }
              >
                {personalSituationOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <fieldset className={styles.radioFieldset}>
              <legend className={styles.radioLegend}>{childrenLabel}</legend>
              <div className={styles.radioGrid}>
                {childrenOptions.map((option) => {
                  const optionId = `${mountId}-children-${option.value}`;
                  const selected = childCount === option.value;

                  return (
                    <label
                      key={option.value}
                      htmlFor={optionId}
                      className={styles.radioOption}
                      data-selected={selected}
                    >
                      <input
                        id={optionId}
                        className={styles.radioInput}
                        type="radio"
                        name={childrenGroupName}
                        value={option.value}
                        checked={selected}
                        onChange={() => setChildCount(option.value)}
                      />
                      <span className={styles.radioLabel}>{option.label}</span>
                    </label>
                  );
                })}
              </div>
            </fieldset>

            <div className={styles.disclaimer}>
              <strong>{disclaimerTitle}</strong> {disclaimerBody}
            </div>
          </div>

          <div className={styles.panel}>
            <h3 className={styles.panelTitle}>{resultTitle}</h3>

            {calculationError || !result ? (
              <div className={styles.resultError}>{calculationError ?? errorText}</div>
            ) : (
              <div className={styles.resultStack}>
                <section className={styles.resultCard}>
                  <h4 className={styles.resultHeading}>{resultLabels.taxableIncome}</h4>
                  <ul className={styles.resultList}>
                    <li className={styles.resultListItem}>
                      <span>{resultLabels.annualIncome}</span>
                      <span>{formatEuro(selfEmployedIncome, locale)}</span>
                    </li>
                    <li className={styles.resultListItem}>
                      <span>{resultLabels.expenses}</span>
                      <span>{formatEuro(selfEmployedExpenses, locale)}</span>
                    </li>
                  </ul>
                  <div className={styles.resultTotal}>
                    {formatEuro(result.taxableProfit, locale)}
                  </div>
                </section>

                <section className={styles.resultCard}>
                  <h4 className={styles.resultHeading}>{resultLabels.toPay}</h4>
                  <ul className={styles.resultList}>
                    <li className={styles.resultListItem}>
                      <span>
                        {resultLabels.publicHealthInsurance} ({(result.healthInsurance.totalRate * 100).toFixed(2)}%)
                      </span>
                      <span>{formatEuro(result.healthInsurance.annualContribution, locale)}</span>
                    </li>
                    <li className={styles.resultListItem}>
                      <span>
                        {resultLabels.incomeTax} ({((result.incomeTax / result.taxableProfit) * 100).toFixed(2)}%)
                      </span>
                      <span>{formatEuro(result.incomeTax, locale)}</span>
                    </li>
                    <li className={styles.resultListItem}>
                      <span>
                        {resultLabels.solidarityTax} ({((result.solidarityTax / result.incomeTax) * 100).toFixed(2)}%)
                      </span>
                      <span>{formatEuro(result.solidarityTax, locale)}</span>
                    </li>
                  </ul>
                  <div className={styles.resultTotal}>
                    {formatEuro(result.totalTaxToPay, locale)}
                  </div>
                </section>

                <section className={styles.resultCard}>
                  <h4 className={styles.resultHeading}>{resultLabels.takeHomePay}</h4>
                  <div className={styles.resultTotal}>
                    {formatEuro(result.amountLeft, locale)}
                  </div>
                </section>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
