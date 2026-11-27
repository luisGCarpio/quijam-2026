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
  "events.subtitle": {
    es: "Sedes reales de Barranquilla con aforo simulado para planear tu salida.",
    en: "Real Barranquilla venues with simulated occupancy to plan your outing.",
    pt: "Locais reais de Barranquilla com lotação simulada para planejar sua saída.",
    fr: "Des lieux réels de Barranquilla avec affluence simulée pour planifier votre sortie.",
  },
  "events.simulated": { es: "Simulación", en: "Simulation", pt: "Simulação", fr: "Simulation" },
  "events.intensity": { es: "Intensidad de la simulación", en: "Simulation intensity", pt: "Intensidade da simulação", fr: "Intensité de la simulation" },
  "events.occupancy": { es: "Aforo estimado", en: "Estimated occupancy", pt: "Lotação estimada", fr: "Affluence estimée" },
  "events.people": { es: "personas", en: "people", pt: "pessoas", fr: "personnes" },
  "events.go": { es: "Ir sin aglomeración", en: "Go with less crowding", pt: "Ir sem aglomeração", fr: "Partir sans foule" },
  "events.accessible": { es: "Entrada accesible", en: "Accessible entry", pt: "Entrada acessível", fr: "Entrée accessible" },
  "events.demoNote": {
    es: "Aforo simulado para la demo. Las sedes y coordenadas son reales; confirma horarios antes de salir.",
    en: "Simulated occupancy for the demo. Venues and coordinates are real; confirm schedules before you go.",
    pt: "Lotação simulada para a demo. Os locais e coordenadas são reais; confirme os horários antes de sair.",
    fr: "Affluence simulée pour la démo. Les lieux et coordonnées sont réels ; confirmez les horaires avant de partir.",
  },
  "events.category.deporte": { es: "Deporte", en: "Sports", pt: "Esporte", fr: "Sport" },
  "events.category.cultura": { es: "Cultura", en: "Culture", pt: "Cultura", fr: "Culture" },
  "events.category.fanfest": { es: "Fan Fest", en: "Fan Fest", pt: "Fan Fest", fr: "Fan Fest" },
  "events.category.ciudad": { es: "Ciudad", en: "City", pt: "Cidade", fr: "Ville" },
  "events.level.low": { es: "Fluido", en: "Light", pt: "Tranquilo", fr: "Fluide" },
  "events.level.medium": { es: "Moderado", en: "Moderate", pt: "Moderado", fr: "Modéré" },
  "events.level.high": { es: "Alto", en: "High", pt: "Alto", fr: "Élevé" },
  "assistance.subtitle": {
    es: "Emergencias, moneda y accesibilidad en un solo lugar.",
    en: "Emergencies, currency and accessibility in one place.",
    pt: "Emergências, moeda e acessibilidade em um só lugar.",
    fr: "Urgences, devise et accessibilité au même endroit.",
  },
  "assistance.emergency": { es: "Emergencias", en: "Emergency", pt: "Emergências", fr: "Urgences" },
  "assistance.emergencyHint": { es: "Policía y atención ciudadana", en: "Police and citizen support", pt: "Polícia e apoio ao cidadão", fr: "Police et assistance citoyenne" },
  "assistance.health": { es: "Salud", en: "Health", pt: "Saúde", fr: "Santé" },
  "assistance.healthHint": { es: "Ambulancia y urgencias médicas", en: "Ambulance and medical emergencies", pt: "Ambulância e emergências médicas", fr: "Ambulance et urgences médicales" },
  "assistance.fire": { es: "Bomberos", en: "Firefighters", pt: "Bombeiros", fr: "Pompiers" },
  "assistance.fireHint": { es: "Incendios y rescate", en: "Fire and rescue", pt: "Incêndios e resgate", fr: "Incendies et secours" },
  "assistance.call": { es: "Llamar", en: "Call", pt: "Ligar", fr: "Appeler" },
  "assistance.currencyTitle": { es: "Conversor de moneda", en: "Currency converter", pt: "Conversor de moeda", fr: "Convertisseur de devise" },
  "assistance.currencyHint": { es: "Convierte pesos colombianos a la moneda activa.", en: "Convert Colombian pesos to the active currency.", pt: "Converta pesos colombianos para a moeda ativa.", fr: "Convertissez les pesos colombiens dans la devise active." },
  "assistance.amountCop": { es: "Monto en COP", en: "Amount in COP", pt: "Valor em COP", fr: "Montant en COP" },
  "assistance.convertedTo": { es: "Equivale en", en: "Equals in", pt: "Equivale em", fr: "Équivaut en" },
  "assistance.accessibilityTitle": { es: "Accesibilidad", en: "Accessibility", pt: "Acessibilidade", fr: "Accessibilité" },
  "assistance.accessibilityHint": {
    es: "Activa la ruta accesible para filtrar puntos y priorizar trayectos sin barreras.",
    en: "Turn on accessible route to filter spots and prioritize step-free trips.",
    pt: "Ative a rota acessível para filtrar pontos e priorizar trajetos sem barreiras.",
    fr: "Activez l’itinéraire accessible pour filtrer les lieux et privilégier les trajets sans obstacles.",
  },
  "assistance.emergencyNote": {
    es: "Líneas de emergencia de Colombia. Úsalas solo para urgencias reales.",
    en: "Colombian emergency lines. Use them only for real emergencies.",
    pt: "Linhas de emergência da Colômbia. Use apenas para emergências reais.",
    fr: "Lignes d’urgence colombiennes. À utiliser uniquement en cas d’urgence réelle.",
  },
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
