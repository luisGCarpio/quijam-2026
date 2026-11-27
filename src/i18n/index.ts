// Agregador i18n congelado — Fase 0 (BQ360)
// Fusiona automáticamente los 5 diccionarios independientes sin conflictos de merge.
import type { Lang, LocalizedText, TranslationDict } from "@/types/bq360";
import { shellDict } from "@/i18n/shell";
import { mapDict } from "@/i18n/map";
import { eventsDict } from "@/i18n/events";
import { exploreDict } from "@/i18n/explore";
import { assistanceDict } from "@/i18n/assistance";

const LANGS: readonly Lang[] = ["es", "en", "pt", "fr"];

function toTranslationDict(
  localized: Record<string, LocalizedText>
): TranslationDict {
  const result: TranslationDict = { es: {}, en: {}, pt: {}, fr: {} };
  for (const [key, text] of Object.entries(localized)) {
    for (const lang of LANGS) {
      result[lang][key] = text[lang];
    }
  }
  return result;
}

function mergeDicts(...dicts: TranslationDict[]): TranslationDict {
  const merged = {} as TranslationDict;
  for (const lang of LANGS) {
    merged[lang] = Object.assign({}, ...dicts.map((d) => d[lang]));
  }
  return merged;
}

export const ALL_TRANSLATIONS: TranslationDict = mergeDicts(
  shellDict,
  mapDict,
  eventsDict,
  toTranslationDict(exploreDict),
  assistanceDict
);

export function getTranslation(lang: Lang, key: string): string {
  return ALL_TRANSLATIONS[lang]?.[key] ?? ALL_TRANSLATIONS.es[key] ?? key;
}
