import type { Lang, LocalizedText } from "@/types/bq360";
import { exploreDict } from "./explore";

const coreDict = {
  "app.city": { es: "Barranquilla", en: "Barranquilla", pt: "Barranquilla", fr: "Barranquilla" },
  "app.year": { es: "2034", en: "2034", pt: "2034", fr: "2034" },
  "common.loading": { es: "Cargando…", en: "Loading…", pt: "Carregando…", fr: "Chargement…" },
  "common.retry": { es: "Reintentar", en: "Retry", pt: "Tentar novamente", fr: "Réessayer" },
  "common.error": { es: "Algo salió mal", en: "Something went wrong", pt: "Algo deu errado", fr: "Une erreur est survenue" },
  "map.legend": { es: "Leyenda de capas", en: "Layer legend", pt: "Legenda de camadas", fr: "Légende des couches" },
  "map.tapMarker": { es: "Toca un pin para ver el lugar", en: "Tap a pin to see the place", pt: "Toque em um pino para ver o local", fr: "Touchez un repère pour voir le lieu" },
  "map.noPoints": { es: "No hay puntos para mostrar con estos filtros.", en: "No spots to show with these filters.", pt: "Não há pontos para mostrar com estes filtros.", fr: "Aucun lieu à afficher avec ces filtres." },
  "footer.note": {
    es: "Datos de referencia ciudadana. Confirma horarios y precios en cada lugar.",
    en: "Citizen reference data. Confirm opening hours and prices at each venue.",
    pt: "Dados de referência cidadã. Confirme horários e preços em cada local.",
    fr: "Données citoyennes indicatives. Confirmez horaires et prix sur place.",
  },
} satisfies Record<string, LocalizedText>;

export const dictionaries: Record<string, LocalizedText> = {
  ...coreDict,
  ...exploreDict,
};

export function getTranslation(lang: Lang, key: string): string {
  const entry = dictionaries[key];
  if (!entry) return key;
  return entry[lang] || entry.es || key;
}

export function getLocalizedText(text: LocalizedText, lang: Lang): string {
  return text[lang] || text.es;
}

export { exploreDict };
