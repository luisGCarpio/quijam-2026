// Archivo exclusivo de Dev 5 — Dataset inicial Fase 0 (Salud y Seguridad en Barranquilla)
import type { Poi } from "@/types/bq360";

export const ASSISTANCE_POIS: Poi[] = [
  {
    id: "poi-camino-adelita-char",
    layer: "salud",
    name: {
      es: "Camino Universitario Adelita de Char",
      en: "Adelita de Char University Medical Center",
      pt: "Centro Médico Universitário Adelita de Char",
      fr: "Centre Médical Universitaire Adelita de Char",
    },
    description: {
      es: "Centro asistencial distrital con urgencias 24 horas, atención primaria y acceso universal.",
      en: "District medical center offering 24/7 emergency care, primary care, and universal accessibility.",
      pt: "Centro médico distrital com pronto-socorro 24 horas, atenção primária e acesso universal.",
      fr: "Centre médical de district offrant des urgences 24h/24, soins primaires et accès universel.",
    },
    address: "Calle 50 #21-40, Barranquilla",
    coords: { lat: 10.9712, lng: -74.8124 },
    accessible: true,
    phone: "+57 605 3399999",
    tags: ["salud", "urgencias", "24h", "accesible"],
  },
  {
    id: "poi-cai-plaza-paz",
    layer: "seguridad",
    name: {
      es: "CAI Plaza de la Paz",
      en: "Plaza de la Paz Police Station (CAI)",
      pt: "Posto Policial (CAI) Plaza de la Paz",
      fr: "Poste de Police (CAI) Plaza de la Paz",
    },
    description: {
      es: "Punto de atención inmediata de la Policía Metropolitana y orientación al visitante en el centro de Barranquilla.",
      en: "Immediate response post of the Metropolitan Police and visitor assistance in central Barranquilla.",
      pt: "Ponto de atendimento imediato da Polícia Metropolitana e orientação ao visitante no centro.",
      fr: "Poste d'intervention immédiate de la Police Métropolitaine et accueil des visiteurs au centre-ville.",
    },
    address: "Cra. 45 con Calle 53, Plaza de la Paz, Barranquilla",
    coords: { lat: 10.9878, lng: -74.7889 },
    accessible: true,
    phone: "123",
    tags: ["seguridad", "policia", "turismo", "emergencias"],
  },
];
