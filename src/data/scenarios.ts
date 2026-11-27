// Archivo exclusivo de Dev 3 — Escenarios de simulación Fase 0
import type { ScenarioId, ScenarioMeta } from "@/types/bq360";

export const SCENARIOS: Record<ScenarioId, ScenarioMeta> = {
  normal: {
    id: "normal",
    label: {
      es: "Operación Normal",
      en: "Normal Operation",
      pt: "Operação Normal",
      fr: "Fonctionnement Normal",
    },
    summary: {
      es: "Flujo estable en corredores principales y clima soleado típico de Barranquilla.",
      en: "Steady traffic across main corridors with typical sunny Barranquilla weather.",
      pt: "Fluxo estável nos principais corredores e clima ensolarado típico de Barranquilla.",
      fr: "Flux stable sur les axes principaux et météo ensoleillée typique de Barranquilla.",
    },
    crowdMultiplier: 1.0,
    weatherOverride: null,
    severity: "baja",
  },
  metropolitano_exit: {
    id: "metropolitano_exit",
    label: {
      es: "Salida del Metropolitano (45k)",
      en: "Metropolitano Stadium Exit (45k)",
      pt: "Saída do Metropolitano (45 mil)",
      fr: "Sortie du Metropolitano (45k)",
    },
    summary: {
      es: "Aforo crítico en Murillo y Circunvalar; saturación de Transmetro y desvíos activos.",
      en: "Critical crowd surge on Murillo & Circunvalar; Transmetro saturation and active detours.",
      pt: "Lotação crítica em Murillo e Circunvalar; saturação do Transmetro e desvios ativos.",
      fr: "Affluence critique sur Murillo et Circunvalar ; saturation Transmetro et déviations actives.",
    },
    crowdMultiplier: 1.85,
    weatherOverride: "heat_alert",
    severity: "alta",
  },
  rain_arroyos: {
    id: "rain_arroyos",
    label: {
      es: "Lluvia Fuerte + Alerta de Arroyos",
      en: "Heavy Rain + Flash-Flood Arroyos",
      pt: "Chuva Forte + Alerta de Enxurradas",
      fr: "Pluie Forte + Alerte Arroyos",
    },
    summary: {
      es: "Bloqueo preventivo en corredores de arroyos críticos (Cra. 21, Cll. 76/84) con rutas seguras elevadas.",
      en: "Preventive closure of critical flash-flood corridors (Cra. 21, Cll. 76/84) with elevated safe routes.",
      pt: "Bloqueio preventivo em corredores críticos de enxurrada (Cra. 21, Cll. 76/84) com rotas seguras.",
      fr: "Fermeture préventive des axes d'arroyos critiques (Cra. 21, Cll. 76/84) et itinéraires sûrs.",
    },
    crowdMultiplier: 1.3,
    weatherOverride: "rain_arroyo",
    severity: "alta",
  },
  malecon_full: {
    id: "malecon_full",
    label: {
      es: "Fan Fest Gran Malecón Saturado",
      en: "Gran Malecón Fan Fest Saturated",
      pt: "Fan Fest Gran Malecón Lotado",
      fr: "Fan Fest Gran Malecón Saturé",
    },
    summary: {
      es: "Ocupación superior al 92% en el Malecón del Río; redirección hacia Barrio Abajo y Plaza de la Paz.",
      en: "Over 92% occupancy at Malecón del Río; redirecting visitors toward Barrio Abajo & Plaza de la Paz.",
      pt: "Ocupação acima de 92% no Malecón del Río; redirecionamento para Barrio Abajo e Plaza de la Paz.",
      fr: "Occupation supérieure à 92 % au Malecón del Río ; redirection vers Barrio Abajo et Plaza de la Paz.",
    },
    crowdMultiplier: 1.65,
    weatherOverride: "heat_alert",
    severity: "alta",
  },
  via40_parade: {
    id: "via40_parade",
    label: {
      es: "Desfile Cultural Vía 40",
      en: "Vía 40 Cultural Parade",
      pt: "Desfile Cultural Vía 40",
      fr: "Défilé Culturel Vía 40",
    },
    summary: {
      es: "Cierre vial programado en Vía 40 con desvíos inteligentes y puntos de hidratación destacados.",
      en: "Scheduled road closure along Vía 40 with smart detours and highlighted hydration stations.",
      pt: "Bloqueio viário na Vía 40 com desvios inteligentes e pontos de hidratação em destaque.",
      fr: "Fermeture routière sur Vía 40 avec déviations intelligentes et points d'hydratation mis en avant.",
    },
    crowdMultiplier: 1.45,
    weatherOverride: null,
    severity: "media",
  },
};
