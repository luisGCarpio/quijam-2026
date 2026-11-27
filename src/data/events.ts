export type AppMode = "mundial_2034" | "legado";
export type EventCategory = "deporte" | "cultura" | "fanfest" | "ciudad";
export type EventsLang = "es" | "en" | "pt" | "fr";

export interface LocalizedText {
  es: string;
  en: string;
  pt: string;
  fr: string;
}

export interface EventInfo {
  id: string;
  mode: AppMode;
  name: LocalizedText;
  venue: string;
  coords: { lat: number; lng: number };
  capacity: number;
  baseAttendance: number;
  radiusMeters: number;
  category: EventCategory;
  schedule: string;
  accessibleEntry: boolean;
}

const text = (es: string, en: string, pt: string, fr: string): LocalizedText => ({ es, en, pt, fr });

/** Illustrative 2034 / legacy event scenarios for the prototype, not live attendance data. */
export const CITY_EVENTS: EventInfo[] = [
  {
    id: "metropolitano",
    mode: "mundial_2034",
    name: text("Partido internacional", "International match", "Partida internacional", "Match international"),
    venue: "Estadio Metropolitano Roberto Meléndez",
    coords: { lat: 10.9206, lng: -74.8017 },
    capacity: 46000,
    baseAttendance: 24000,
    radiusMeters: 1200,
    category: "deporte",
    schedule: "20:00",
    accessibleEntry: true,
  },
  {
    id: "malecon-fanfest",
    mode: "mundial_2034",
    name: text("FIFA Fan Fest · Gran Malecón", "FIFA Fan Fest · Gran Malecón", "FIFA Fan Fest · Gran Malecón", "FIFA Fan Fest · Gran Malecón"),
    venue: "Gran Malecón del Río",
    coords: { lat: 11.0042, lng: -74.7958 },
    capacity: 30000,
    baseAttendance: 18000,
    radiusMeters: 850,
    category: "fanfest",
    schedule: "16:00",
    accessibleEntry: true,
  },
  {
    id: "via40-cultural",
    mode: "mundial_2034",
    name: text("Festival cultural Vía 40", "Vía 40 cultural festival", "Festival cultural Vía 40", "Festival culturel Vía 40"),
    venue: "Vía 40 · Barrio Abajo",
    coords: { lat: 10.9975, lng: -74.7840 },
    capacity: 18000,
    baseAttendance: 9000,
    radiusMeters: 900,
    category: "cultura",
    schedule: "14:00",
    accessibleEntry: false,
  },
  {
    id: "romelio-fanzone",
    mode: "mundial_2034",
    name: text("Fan zone Romelio Martínez", "Romelio Martínez fan zone", "Fan zone Romelio Martínez", "Fan zone Romelio Martínez"),
    venue: "Estadio Romelio Martínez",
    coords: { lat: 10.9934, lng: -74.8072 },
    capacity: 12000,
    baseAttendance: 7000,
    radiusMeters: 700,
    category: "fanfest",
    schedule: "17:30",
    accessibleEntry: true,
  },
  {
    id: "puerta-de-oro",
    mode: "mundial_2034",
    name: text("Centro de bienvenida", "Welcome hub", "Centro de boas-vindas", "Centre d'accueil"),
    venue: "Puerta de Oro · Centro de Eventos",
    coords: { lat: 11.0209, lng: -74.8193 },
    capacity: 15000,
    baseAttendance: 5000,
    radiusMeters: 650,
    category: "ciudad",
    schedule: "Todo el día",
    accessibleEntry: true,
  },
  {
    id: "batalla-flores",
    mode: "legado",
    name: text("Batalla de Flores", "Battle of the Flowers parade", "Batalha de Flores", "Bataille de fleurs"),
    venue: "Vía 40 · Carnaval de Barranquilla",
    coords: { lat: 11.0004, lng: -74.7892 },
    capacity: 18000,
    baseAttendance: 9000,
    radiusMeters: 1100,
    category: "cultura",
    schedule: "11:00",
    accessibleEntry: false,
  },
  {
    id: "junior-partido",
    mode: "legado",
    name: text("Partido del Junior FC", "Junior FC match", "Partida do Junior FC", "Match du Junior FC"),
    venue: "Estadio Metropolitano Roberto Meléndez",
    coords: { lat: 10.9206, lng: -74.8017 },
    capacity: 46000,
    baseAttendance: 18000,
    radiusMeters: 1200,
    category: "deporte",
    schedule: "18:00",
    accessibleEntry: true,
  },
  {
    id: "festival-gastronomico",
    mode: "legado",
    name: text("Festival gastronómico", "Food festival", "Festival gastronômico", "Festival gastronomique"),
    venue: "Gran Malecón del Río",
    coords: { lat: 11.0042, lng: -74.7958 },
    capacity: 30000,
    baseAttendance: 12000,
    radiusMeters: 850,
    category: "cultura",
    schedule: "12:00",
    accessibleEntry: true,
  },
  {
    id: "hora-pico-murillo",
    mode: "legado",
    name: text("Hora pico · corredor Murillo", "Rush hour · Murillo corridor", "Horário de pico · corredor Murillo", "Heure de pointe · corridor Murillo"),
    venue: "Corredor Murillo · Transmetro",
    coords: { lat: 10.9398, lng: -74.8027 },
    capacity: 10000,
    baseAttendance: 4500,
    radiusMeters: 900,
    category: "ciudad",
    schedule: "07:30",
    accessibleEntry: true,
  },
];
