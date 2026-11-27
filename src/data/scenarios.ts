import type { LocalizedText } from "./events";

export type ScenarioId = "normal" | "metropolitano_exit" | "rain_arroyos" | "malecon_full" | "via40_parade";
export type WeatherOverride = "heat_alert" | "rain_arroyo" | null;

export interface ScenarioDefinition {
  id: ScenarioId;
  name: LocalizedText;
  description: LocalizedText;
  crowdMultiplier: number;
  weatherOverride: WeatherOverride;
  featuredEventId: string;
  severity: "baja" | "media" | "alta";
}

const text = (es: string, en: string, pt: string, fr: string): LocalizedText => ({ es, en, pt, fr });

/** Presets are demo inputs; they do not represent official forecasts or live crowd counts. */
export const EVENT_SCENARIOS: ScenarioDefinition[] = [
  {
    id: "normal",
    name: text("Operación normal", "Normal operations", "Operação normal", "Fonctionnement normal"),
    description: text("Flujo estable y clima sin alertas simuladas.", "Steady flow and no simulated weather alerts.", "Fluxo estável e sem alertas meteorológicos simulados.", "Flux régulier et aucune alerte météo simulée."),
    crowdMultiplier: 0.8,
    weatherOverride: null,
    featuredEventId: "metropolitano",
    severity: "baja",
  },
  {
    id: "metropolitano_exit",
    name: text("Salida del Metropolitano", "Metropolitano stadium exit", "Saída do Metropolitano", "Sortie du Metropolitano"),
    description: text("Pico de salida: cerca de 45.000 asistentes y presión en los accesos.", "Post-match peak: about 45,000 attendees and pressure on nearby exits.", "Pico de saída: cerca de 45.000 pessoas e pressão nos acessos.", "Pic de sortie : environ 45 000 personnes et pression sur les accès."),
    crowdMultiplier: 1.875,
    weatherOverride: null,
    featuredEventId: "metropolitano",
    severity: "alta",
  },
  {
    id: "rain_arroyos",
    name: text("Lluvia y alerta de arroyos", "Heavy rain and arroyo alert", "Chuva forte e alerta de arroyos", "Forte pluie et alerte aux arroyos"),
    description: text("Activa el aviso de lluvia/riesgo y eleva la atención sobre corredores expuestos.", "Activates a simulated rain-risk alert and highlights exposed corridors.", "Ativa um alerta simulado de chuva e destaca corredores expostos.", "Active une alerte de pluie simulée et signale les axes exposés."),
    crowdMultiplier: 1.15,
    weatherOverride: "rain_arroyo",
    featuredEventId: "metropolitano",
    severity: "alta",
  },
  {
    id: "malecon_full",
    name: text("Fan Fest Gran Malecón saturado", "Gran Malecón Fan Fest at capacity", "Fan Fest Gran Malecón lotado", "Fan Fest Gran Malecón saturé"),
    description: text("El escenario supera el 92% de ocupación para destacar accesos alternos.", "Crowd simulation exceeds 92% to highlight alternate entrances.", "A simulação supera 92% de ocupação para destacar acessos alternativos.", "La simulation dépasse 92 % d'occupation pour signaler des accès alternatifs."),
    crowdMultiplier: 1.65,
    weatherOverride: null,
    featuredEventId: "malecon-fanfest",
    severity: "alta",
  },
  {
    id: "via40_parade",
    name: text("Desfile cultural · Vía 40", "Cultural parade · Vía 40", "Desfile cultural · Vía 40", "Défilé culturel · Vía 40"),
    description: text("Concentración y cierre vial simulado en el corredor de Vía 40.", "Simulated crowd and road closure along the Vía 40 corridor.", "Concentração e fechamento viário simulados no corredor da Vía 40.", "Rassemblement et fermeture simulés sur le corridor de la Vía 40."),
    crowdMultiplier: 1.55,
    weatherOverride: null,
    featuredEventId: "via40-cultural",
    severity: "media",
  },
];

export const DEFAULT_SCENARIO_ID: ScenarioId = "normal";

export function getScenario(id: string): ScenarioDefinition {
  return EVENT_SCENARIOS.find((scenario) => scenario.id === id) ?? EVENT_SCENARIOS[0];
}
