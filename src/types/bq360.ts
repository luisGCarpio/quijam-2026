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
  accessibleRoute: boolean;
  highContrast: boolean;
  largeText: boolean;
  voiceAlerts: boolean;
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
  priceCop?: number;
  isPopularEconomy?: boolean;
  accessible?: boolean;
  phone?: string;
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
  crowdMultiplier: number;
  weatherOverride: "heat_alert" | "rain_arroyo" | null;
  updatedAt: string;
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
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;

  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: string) => string;

  currency: Currency;
  setCurrency: (currency: Currency) => void;
  formatPrice: (copAmount: number) => string;

  weather: WeatherState;
  accessibility: AccessibilityPrefs;
  updateAccessibility: (patch: Partial<AccessibilityPrefs>) => void;

  userLocation: LatLng;
  setUserLocation: (coords: LatLng) => void;

  simulation: SimulationState;
  syncEnabled: boolean;
  setSyncEnabled: (sync: boolean) => void;
  updateSimulation: (patch: Partial<SimulationState>) => Promise<void>;
  simulatorOpen: boolean;
  setSimulatorOpen: (open: boolean) => void;

  activeLayers: Record<LayerCategory, boolean>;
  toggleLayer: (layer: LayerCategory) => void;
  routeRequest: RouteRequest | null;
  navigateToRoute: (destination: LatLng & { label: string }) => void;
  clearRoute: () => void;

  reports: CitizenReport[];
  submitReport: (
    report: Omit<CitizenReport, "id" | "created_at">
  ) => Promise<{ ok: boolean; error?: string }>;
  notifications: NotificationItem[];
  pushNotification: (
    item: Omit<NotificationItem, "id" | "timestamp" | "read">
  ) => void;
  markAllNotificationsRead: () => void;
}
