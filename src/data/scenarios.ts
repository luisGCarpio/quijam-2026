import type { ScenarioId, ScenarioMeta } from "@/types/bq360";

export const SCENARIOS: Record<ScenarioId, ScenarioMeta> = {
  normal: {
    id: "normal",
    label: { es: "Operación normal", en: "Normal operations", pt: "Operação normal", fr: "Fonctionnement normal" },
    summary: { es: "Flujo estable; sin alertas meteorológicas simuladas.", en: "Steady flow; no simulated weather alerts.", pt: "Fluxo estável; sem alertas meteorológicos simulados.", fr: "Flux régulier ; aucune alerte météo simulée." },
    crowdMultiplier: 0.8,
    weatherOverride: null,
    severity: "baja",
  },
  metropolitano_exit: {
    id: "metropolitano_exit",
    label: { es: "Salida del Metropolitano (45k)", en: "Metropolitano stadium exit (45k)", pt: "Saída do Metropolitano (45 mil)", fr: "Sortie du Metropolitano (45k)" },
    summary: { es: "Pico de salida con cerca de 45.000 asistentes y presión en los accesos.", en: "Post-match peak with about 45,000 attendees and pressure on nearby exits.", pt: "Pico de saída com cerca de 45.000 pessoas e pressão nos acessos.", fr: "Pic de sortie avec environ 45 000 personnes et pression sur les accès." },
    crowdMultiplier: 1.85,
    weatherOverride: "heat_alert",
    severity: "alta",
  },
  rain_arroyos: {
    id: "rain_arroyos",
    label: { es: "Lluvia fuerte + alerta de arroyos", en: "Heavy rain + arroyo alert", pt: "Chuva forte + alerta de arroyos", fr: "Forte pluie + alerte aux arroyos" },
    summary: { es: "Riesgo simulado en corredores expuestos; revisar las rutas con fuentes oficiales.", en: "Simulated risk on exposed corridors; check routes against official sources.", pt: "Risco simulado em corredores expostos; confira as rotas em fontes oficiais.", fr: "Risque simulé sur les axes exposés ; vérifiez les itinéraires auprès des sources officielles." },
    crowdMultiplier: 1.3,
    weatherOverride: "rain_arroyo",
    severity: "alta",
  },
  malecon_full: {
    id: "malecon_full",
    label: { es: "Fan Fest Gran Malecón saturado", en: "Gran Malecón Fan Fest at capacity", pt: "Fan Fest Gran Malecón lotado", fr: "Fan Fest Gran Malecón saturé" },
    summary: { es: "La simulación supera el 92% de ocupación para destacar accesos alternos.", en: "The simulation exceeds 92% occupancy to highlight alternate entrances.", pt: "A simulação supera 92% de ocupação para destacar acessos alternativos.", fr: "La simulation dépasse 92 % d'occupation pour signaler des accès alternatifs." },
    crowdMultiplier: 1.65,
    weatherOverride: "heat_alert",
    severity: "alta",
  },
  via40_parade: {
    id: "via40_parade",
    label: { es: "Desfile cultural · Vía 40", en: "Cultural parade · Vía 40", pt: "Desfile cultural · Vía 40", fr: "Défilé culturel · Vía 40" },
    summary: { es: "Concentración y cierre vial simulados en el corredor de Vía 40.", en: "Simulated crowd and road closure along the Vía 40 corridor.", pt: "Concentração e fechamento viário simulados no corredor da Vía 40.", fr: "Rassemblement et fermeture simulés sur le corridor de la Vía 40." },
    crowdMultiplier: 1.45,
    weatherOverride: null,
    severity: "media",
  },
};

export const EVENT_SCENARIOS = Object.values(SCENARIOS);

export const FEATURED_EVENT_IDS: Partial<Record<ScenarioId, string>> = {
  metropolitano_exit: "evt-metropolitano-2034",
  rain_arroyos: "evt-metropolitano-2034",
  malecon_full: "evt-malecon-fanfest-2034",
  via40_parade: "evt-via40-cultural-2034",
};

export function getScenario(id: ScenarioId): ScenarioMeta {
  return SCENARIOS[id] ?? SCENARIOS.normal;
}
