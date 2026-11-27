// Archivo exclusivo de Dev 5 — Tasas referenciales de conversión desde COP (Fase 0)
import type { Currency } from "@/types/bq360";

export const CURRENCY_RATES: Record<
  Currency,
  { rateFromCop: number; symbol: string; locale: string }
> = {
  COP: { rateFromCop: 1, symbol: "$", locale: "es-CO" },
  USD: { rateFromCop: 1 / 4200, symbol: "US$", locale: "en-US" },
  EUR: { rateFromCop: 1 / 4550, symbol: "€", locale: "fr-FR" },
  BRL: { rateFromCop: 1 / 750, symbol: "R$", locale: "pt-BR" },
};
