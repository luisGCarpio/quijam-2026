import type { AppMode, CityEvent, Lang, LocalizedText } from "@/types/bq360";

export type EventsLang = Lang;
export type EventInfo = CityEvent;

const text = (es: string, en: string, pt: string, fr: string): LocalizedText => ({ es, en, pt, fr });

const event = (
  id: string,
  mode: AppMode,
  name: LocalizedText,
  venue: string,
  coords: { lat: number; lng: number },
  capacity: number,
  baseAttendance: number,
  radiusMeters: number,
  category: CityEvent["category"],
  schedule: string,
  accessibleEntry: boolean,
): CityEvent => ({ id, mode, name, venue, coords, capacity, baseAttendance, radiusMeters, category, schedule, accessibleEntry });

/** Escenarios de eventos ilustrativos; las cifras no son datos oficiales ni en vivo. */
export const CITY_EVENTS: CityEvent[] = [
  event("evt-metropolitano-2034", "mundial_2034", text("Partido internacional", "International match", "Partida internacional", "Match international"), "Estadio Metropolitano Roberto Meléndez", { lat: 10.9206, lng: -74.8017 }, 46000, 24000, 1200, "deporte", "20:00", true),
  event("evt-malecon-fanfest-2034", "mundial_2034", text("FIFA Fan Fest · Gran Malecón", "FIFA Fan Fest · Gran Malecón", "FIFA Fan Fest · Gran Malecón", "FIFA Fan Fest · Gran Malecón"), "Gran Malecón del Río", { lat: 11.0042, lng: -74.7958 }, 30000, 18000, 850, "fanfest", "16:00", true),
  event("evt-via40-cultural-2034", "mundial_2034", text("Festival cultural Vía 40", "Vía 40 cultural festival", "Festival cultural Vía 40", "Festival culturel Vía 40"), "Vía 40 · Barrio Abajo", { lat: 10.9975, lng: -74.7840 }, 18000, 9000, 900, "cultura", "14:00", false),
  event("evt-romelio-fanzone-2034", "mundial_2034", text("Fan zone Romelio Martínez", "Romelio Martínez fan zone", "Fan zone Romelio Martínez", "Fan zone Romelio Martínez"), "Estadio Romelio Martínez", { lat: 10.9934, lng: -74.8072 }, 12000, 7000, 700, "fanfest", "17:30", true),
  event("evt-puerta-oro-2034", "mundial_2034", text("Centro de bienvenida", "Welcome hub", "Centro de boas-vindas", "Centre d'accueil"), "Puerta de Oro · Centro de Eventos", { lat: 11.0209, lng: -74.8193 }, 15000, 5000, 650, "ciudad", "08:00–20:00", true),
  event("evt-batalla-flores-legado", "legado", text("Batalla de Flores", "Battle of the Flowers parade", "Batalha de Flores", "Bataille de fleurs"), "Vía 40 · Carnaval de Barranquilla", { lat: 11.0004, lng: -74.7892 }, 35000, 24000, 1100, "cultura", "11:00", false),
  event("evt-junior-legado", "legado", text("Partido del Junior FC", "Junior FC match", "Partida do Junior FC", "Match du Junior FC"), "Estadio Metropolitano Roberto Meléndez", { lat: 10.9206, lng: -74.8017 }, 46000, 18000, 1200, "deporte", "18:00", true),
  event("evt-festival-gastronomico-legado", "legado", text("Festival gastronómico", "Food festival", "Festival gastronômico", "Festival gastronomique"), "Gran Malecón del Río", { lat: 11.0042, lng: -74.7958 }, 30000, 12000, 850, "cultura", "12:00", true),
  event("evt-murillo-legado", "legado", text("Hora pico · corredor Murillo", "Rush hour · Murillo corridor", "Horário de pico · corredor Murillo", "Heure de pointe · corridor Murillo"), "Corredor Murillo · Transmetro", { lat: 10.9398, lng: -74.8027 }, 10000, 4500, 900, "ciudad", "07:30", true),
];
