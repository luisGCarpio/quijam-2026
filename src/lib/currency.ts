// Archivo exclusivo de Dev 5 — Utilidades base de conversión monetaria (Fase 0)
import type { Currency } from "@/types/bq360";
import { CURRENCY_RATES } from "@/data/currency-rates";

export function convertFromCop(amountCop: number, currency: Currency): number {
  const { rateFromCop } = CURRENCY_RATES[currency];
  return amountCop * rateFromCop;
}

export function formatCop(amountCop: number, currency: Currency): string {
  const { locale } = CURRENCY_RATES[currency];
  const converted = convertFromCop(amountCop, currency);
  const fractionDigits = currency === "COP" ? 0 : 2;

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(converted);
}
