// Contratos TypeScript congelados — Fase 0 (BQ360)
// No modificar sin coordinación en main (docs/PLAN_DESARROLLO.md §4.3)

export type Lang = "es" | "en" | "pt" | "fr";
export type Currency = "COP" | "USD" | "EUR" | "BRL";
export type TabId = "map" | "events" | "explore" | "assistance";
export type AppMode = "mundial_2034" | "legado";
export type ScenarioId =
  | "normal"
  | "metropolitano_exit"
  | "rain_arroyos"
  | "malecon_full"
  | "via40_parade";

export type LayerCategory =
  | "turismo"
  | "salud"
  | "movilidad"
  | "cultura"
  | "ambiente"
  | "comercio"
  | "seguridad";

export type ReportCategory =
  | "aglomeracion"
  | "arroyo"
  | "seguridad"
  | "accesibilidad"
  | "salud";

export type Severity = "baja" | "media" | "alta";

export type TranslationDict = Record<Lang, Record<string, string>>;

export interface LatLng {
  lat: number;
  lng: number;
}

export interface LocalizedText {
  es: string;
  en: string;
  pt: string;
  fr: string;
}

export interface WeatherState {
  tempC: number;
  feelsLikeC: number;
  uvIndex: number;
  condition: "sunny" | "cloudy" | "heat_alert" | "rain_arroyo";
  arroyoRisk: "bajo" | "moderado" | "critico";
  isOverridden: boolean;
}

export interface AccessibilityPrefs {
  accessibleRoute: boolean; // Evita barreras/escaleras + prioriza sombra y Transmetro accesible
  highContrast: boolean;    // Tema WCAG AAA
  largeText: boolean;       // Escala tipográfica global
  voiceAlerts: boolean;     // Lectura por voz (Web Speech API)
}

export interface CityEvent {
  id: string;
  mode: AppMode;
  name: LocalizedText;
  venue: string;
  coords: LatLng;
  capacity: number;
  baseAttendance: number;
  radiusMeters: number;
  category: "deporte" | "cultura" | "fanfest" | "ciudad";
  schedule: string;
  accessibleEntry: boolean;
}

export interface Poi {
  id: string;
  layer: LayerCategory;
  name: LocalizedText;
  description: LocalizedText;
  address: string;
  coords: LatLng;
  priceCop?: number;          // Comercio / Turismo / Movilidad
  isPopularEconomy?: boolean; // Comercio local / economía popular
  accessible?: boolean;       // Rampa / acceso universal
  phone?: string;             // Salud / Seguridad
  tags?: string[];
}

export interface CitizenReport {
  id: string;
  category: ReportCategory;
  title: string;
  description?: string | null;
  lat: number;
  lng: number;
  severity: Severity;
  created_at: string;
}

export interface SimulationState {
  mode: AppMode;
  scenarioId: ScenarioId;
  crowdMultiplier: number; // 0.0 – 3.0 (o derivado del slider 0–100%)
  weatherOverride: "heat_alert" | "rain_arroyo" | null;
  updatedAt: string;
}

export interface ScenarioMeta {
  id: ScenarioId;
  label: LocalizedText;
  summary: LocalizedText;
  crowdMultiplier: number;
  weatherOverride: "heat_alert" | "rain_arroyo" | null;
  severity: Severity;
}

export interface ArroyoZone {
  id: string;
  name: string;
  riskLevel: "moderado" | "critico";
  coords: LatLng[];
}

export interface RouteFallback {
  id: string;
  fromLabel: string;
  toLabel: string;
  directPath: LatLng[];
  alternativePath: LatLng[];
  directMinutes: number;
  alternativeMinutes: number;
  accessibleFriendly: boolean;
}

export interface RouteRequest {
  origin: LatLng & { label: string };
  destination: LatLng & { label: string };
}

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  severity: Severity;
  timestamp: string;
  read: boolean;
}

export interface BQ360ContextValue {
  // Navegación
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;

  // Transversales
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: string) => string;

  currency: Currency;
  setCurrency: (currency: Currency) => void;
  formatPrice: (copAmount: number) => string;

  weather: WeatherState;
  accessibility: AccessibilityPrefs;
  updateAccessibility: (patch: Partial<AccessibilityPrefs>) => void;

  // Ubicación de usuario (default: Plaza de la Paz / centro Barranquilla)
  userLocation: LatLng;
  setUserLocation: (coords: LatLng) => void;

  // Core: Simulación & Realtime
  simulation: SimulationState;
  syncEnabled: boolean; // true = En Vivo (Supabase Realtime), false = Modo Local
  setSyncEnabled: (sync: boolean) => void;
  updateSimulation: (patch: Partial<SimulationState>) => Promise<void>;
  simulatorOpen: boolean;
  setSimulatorOpen: (open: boolean) => void;
  supabaseConnected: boolean;

  // Catálogos sincronizados con Supabase (respaldo local instantáneo)
  events: CityEvent[];
  arroyos: ArroyoZone[];
  pois: Poi[];

  // Core: Rutas y Capas
  activeLayers: Record<LayerCategory, boolean>;
  toggleLayer: (layer: LayerCategory) => void;
  routeRequest: RouteRequest | null;
  navigateToRoute: (destination: LatLng & { label: string }) => void;
  clearRoute: () => void;

  // Reportes ciudadanos & Notificaciones
  reports: CitizenReport[];
  submitReport: (
    report: Omit<CitizenReport, "id" | "created_at">
  ) => Promise<{ ok: boolean; error?: string }>;
  notifications: NotificationItem[];
  activeToasts: NotificationItem[];
  pushNotification: (item: Omit<NotificationItem, "id" | "timestamp" | "read">) => void;
  dismissToast: (id: string) => void;
  markAllNotificationsRead: () => void;

  // Control de modales/drawers (para suprimir toasts durante diálogos abiertos)
  isNotificationDrawerOpen: boolean;
  setNotificationDrawerOpen: (open: boolean) => void;
  isAnyModalOpen: boolean;
}
