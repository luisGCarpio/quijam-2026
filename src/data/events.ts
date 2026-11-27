// Archivo exclusivo de Dev 3 — Dataset inicial Fase 0 (Eventos Mundial 2034 y Legado)
import type { CityEvent } from "@/types/bq360";

export const CITY_EVENTS: CityEvent[] = [
  {
    id: "evt-metropolitano-2034",
    mode: "mundial_2034",
    name: {
      es: "Partido Mundial 2034 · Estadio Metropolitano",
      en: "World Cup 2034 Match · Metropolitano Stadium",
      pt: "Jogo Copa 2034 · Estádio Metropolitano",
      fr: "Match Mondial 2034 · Stade Metropolitano",
    },
    venue: "Estadio Metropolitano Roberto Meléndez",
    coords: { lat: 10.9269, lng: -74.8005 },
    capacity: 46000,
    baseAttendance: 34500,
    radiusMeters: 950,
    category: "deporte",
    schedule: "16:00 – 19:00",
    accessibleEntry: true,
  },
  {
    id: "evt-via40-legado",
    mode: "legado",
    name: {
      es: "Batalla de Flores · Cumbiódromo Vía 40",
      en: "Battle of Flowers · Vía 40 Parade",
      pt: "Batalha de Flores · Cumbiódromo Vía 40",
      fr: "Bataille de Fleurs · Défilé Vía 40",
    },
    venue: "Cumbiódromo Vía 40",
    coords: { lat: 11.0124, lng: -74.7912 },
    capacity: 35000,
    baseAttendance: 24000,
    radiusMeters: 1100,
    category: "cultura",
    schedule: "11:00 – 18:00",
    accessibleEntry: true,
  },
];
