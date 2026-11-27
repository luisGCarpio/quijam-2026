"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type {
  AccessibilityPrefs,
  BQ360ContextValue,
  CitizenReport,
  Currency,
  Lang,
  LayerCategory,
  LatLng,
  NotificationItem,
  RouteRequest,
  SimulationState,
  TabId,
  WeatherState,
} from "@/types/bq360";
import { getTranslation } from "@/i18n";

const BQ360Context = createContext<BQ360ContextValue | null>(null);

const DEFAULT_LOCATION: LatLng = { lat: 10.9880922, lng: -74.7894142 };

const CURRENCY_RATES: Record<Currency, number> = {
  COP: 1,
  USD: 4000,
  EUR: 4300,
  BRL: 750,
};

const LOCALES: Record<Lang, string> = {
  es: "es-CO",
  en: "en-US",
  pt: "pt-BR",
  fr: "fr-FR",
};

const INITIAL_WEATHER: WeatherState = {
  tempC: 0,
  feelsLikeC: 0,
  uvIndex: 0,
  condition: "sunny",
  arroyoRisk: "bajo",
  isOverridden: false,
};

const INITIAL_SIMULATION: SimulationState = {
  mode: "mundial_2034",
  scenarioId: "normal",
  crowdMultiplier: 1,
  weatherOverride: null,
  updatedAt: new Date(0).toISOString(),
};

const INITIAL_ACCESSIBILITY: AccessibilityPrefs = {
  accessibleRoute: false,
  highContrast: false,
  largeText: false,
  voiceAlerts: false,
};

const ALL_LAYERS: Record<LayerCategory, boolean> = {
  turismo: true,
  salud: true,
  movilidad: true,
  cultura: true,
  ambiente: true,
  comercio: true,
  seguridad: true,
};

type ForcedWeather = "heat_alert" | "rain_arroyo" | "sunny";

function buildForcedWeather(condition: ForcedWeather): WeatherState {
  if (condition === "heat_alert") {
    return {
      tempC: 38,
      feelsLikeC: 44,
      uvIndex: 12,
      condition,
      arroyoRisk: "moderado",
      isOverridden: true,
    };
  }
  if (condition === "rain_arroyo") {
    return {
      tempC: 27,
      feelsLikeC: 31,
      uvIndex: 4,
      condition,
      arroyoRisk: "critico",
      isOverridden: true,
    };
  }
  return {
    tempC: 31,
    feelsLikeC: 35,
    uvIndex: 9,
    condition,
    arroyoRisk: "bajo",
    isOverridden: true,
  };
}

function buildWeatherState(
  tempC: number,
  feelsLikeC: number,
  uvIndex: number,
  weatherCode: number,
  precipitation: number
): WeatherState {
  let condition: WeatherState["condition"] = "sunny";
  if (weatherCode >= 51 || precipitation > 0.1) {
    condition = "rain_arroyo";
  } else if (tempC >= 33 || uvIndex >= 8) {
    condition = "heat_alert";
  } else if (weatherCode >= 1) {
    condition = "cloudy";
  }

  return {
    tempC,
    feelsLikeC,
    uvIndex,
    condition,
    arroyoRisk:
      condition === "rain_arroyo"
        ? "critico"
        : condition === "heat_alert"
          ? "moderado"
          : "bajo",
    isOverridden: false,
  };
}

interface OpenMeteoResponse {
  current?: {
    temperature_2m?: number;
    apparent_temperature?: number;
    uv_index?: number;
    weather_code?: number;
    precipitation?: number;
  };
}

export function BQ360Provider({ children }: { children: ReactNode }) {
  const [activeTab, setActiveTab] = useState<TabId>("explore");
  const [lang, setLang] = useState<Lang>("es");
  const [currency, setCurrency] = useState<Currency>("COP");
  const [fetchedWeather, setFetchedWeather] =
    useState<WeatherState>(INITIAL_WEATHER);
  const [accessibility, setAccessibility] =
    useState<AccessibilityPrefs>(INITIAL_ACCESSIBILITY);
  const [userLocation, setUserLocation] = useState<LatLng>(DEFAULT_LOCATION);
  const [simulation, setSimulation] =
    useState<SimulationState>(INITIAL_SIMULATION);
  const [syncEnabled, setSyncEnabled] = useState(true);
  const [simulatorOpen, setSimulatorOpen] = useState(false);
  const [activeLayers, setActiveLayers] =
    useState<Record<LayerCategory, boolean>>(ALL_LAYERS);
  const [routeRequest, setRouteRequest] = useState<RouteRequest | null>(null);
  const [reports, setReports] = useState<CitizenReport[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [urlWeatherOverride, setUrlWeatherOverride] =
    useState<ForcedWeather | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const storedLang = window.localStorage.getItem("bq360:lang");
      if (storedLang === "es" || storedLang === "en" || storedLang === "pt" || storedLang === "fr") {
        setLang(storedLang);
      }
      const storedCurrency = window.localStorage.getItem("bq360:currency");
      if (
        storedCurrency === "COP" ||
        storedCurrency === "USD" ||
        storedCurrency === "EUR" ||
        storedCurrency === "BRL"
      ) {
        setCurrency(storedCurrency);
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    window.localStorage.setItem("bq360:lang", lang);
  }, [lang]);

  useEffect(() => {
    window.localStorage.setItem("bq360:currency", currency);
  }, [currency]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const forced = new URLSearchParams(window.location.search).get("weather");
      if (forced === "heat_alert" || forced === "rain_arroyo" || forced === "sunny") {
        setUrlWeatherOverride(forced);
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const forcedWeather = simulation.weatherOverride ?? urlWeatherOverride;
  const weather = useMemo(
    () => (forcedWeather ? buildForcedWeather(forcedWeather) : fetchedWeather),
    [fetchedWeather, forcedWeather]
  );

  useEffect(() => {
    if (forcedWeather) return;

    const controller = new AbortController();

    async function loadWeather() {
      try {
        const response = await fetch(
          "https://api.open-meteo.com/v1/forecast?latitude=10.9685&longitude=-74.7813&current=temperature_2m,apparent_temperature,weather_code,uv_index,precipitation&timezone=America%2FBogota",
          { signal: controller.signal }
        );
        if (!response.ok) return;
        const data = (await response.json()) as OpenMeteoResponse;
        const current = data.current;
        if (!current) return;
        setFetchedWeather(
          buildWeatherState(
            current.temperature_2m ?? 0,
            current.apparent_temperature ?? 0,
            current.uv_index ?? 0,
            current.weather_code ?? 0,
            current.precipitation ?? 0
          )
        );
      } catch {
        if (!controller.signal.aborted) {
          setFetchedWeather((previous) => ({
            ...previous,
            isOverridden: false,
          }));
        }
      }
    }

    loadWeather();
    return () => controller.abort();
  }, [forcedWeather]);

  const t = useCallback(
    (key: string) => getTranslation(lang, key),
    [lang]
  );

  const formatPrice = useCallback(
    (copAmount: number) => {
      const value = copAmount / CURRENCY_RATES[currency];
      return new Intl.NumberFormat(LOCALES[lang], {
        style: "currency",
        currency,
        maximumFractionDigits: currency === "COP" ? 0 : 2,
      }).format(value);
    },
    [currency, lang]
  );

  const updateAccessibility = useCallback(
    (patch: Partial<AccessibilityPrefs>) => {
      setAccessibility((previous) => ({ ...previous, ...patch }));
    },
    []
  );

  const toggleLayer = useCallback((layer: LayerCategory) => {
    setActiveLayers((previous) => ({
      ...previous,
      [layer]: !previous[layer],
    }));
  }, []);

  const navigateToRoute = useCallback(
    (destination: LatLng & { label: string }) => {
      setRouteRequest({
        origin: { ...userLocation, label: t("map.yourLocation") },
        destination,
      });
      setActiveTab("map");
    },
    [t, userLocation]
  );

  const clearRoute = useCallback(() => {
    setRouteRequest(null);
  }, []);

  const updateSimulation = useCallback(
    async (patch: Partial<SimulationState>) => {
      setSimulation((previous) => ({
        ...previous,
        ...patch,
        updatedAt: new Date().toISOString(),
      }));
    },
    []
  );

  const submitReport = useCallback(
    async (
      report: Omit<CitizenReport, "id" | "created_at">
    ): Promise<{ ok: boolean; error?: string }> => {
      const id =
        typeof globalThis.crypto !== "undefined" &&
        typeof globalThis.crypto.randomUUID === "function"
          ? globalThis.crypto.randomUUID()
          : `report-${Date.now()}`;
      const created: CitizenReport = {
        ...report,
        id,
        created_at: new Date().toISOString(),
      };
      setReports((previous) => [created, ...previous]);
      return { ok: true };
    },
    []
  );

  const pushNotification = useCallback(
    (item: Omit<NotificationItem, "id" | "timestamp" | "read">) => {
      const id =
        typeof globalThis.crypto !== "undefined" &&
        typeof globalThis.crypto.randomUUID === "function"
          ? globalThis.crypto.randomUUID()
          : `notification-${Date.now()}`;
      setNotifications((previous) => [
        {
          ...item,
          id,
          timestamp: new Date().toISOString(),
          read: false,
        },
        ...previous,
      ]);
    },
    []
  );

  const markAllNotificationsRead = useCallback(() => {
    setNotifications((previous) =>
      previous.map((notification) => ({ ...notification, read: true }))
    );
  }, []);

  const value = useMemo<BQ360ContextValue>(
    () => ({
      activeTab,
      setActiveTab,
      lang,
      setLang,
      t,
      currency,
      setCurrency,
      formatPrice,
      weather,
      accessibility,
      updateAccessibility,
      userLocation,
      setUserLocation,
      simulation,
      syncEnabled,
      setSyncEnabled,
      updateSimulation,
      simulatorOpen,
      setSimulatorOpen,
      activeLayers,
      toggleLayer,
      routeRequest,
      navigateToRoute,
      clearRoute,
      reports,
      submitReport,
      notifications,
      pushNotification,
      markAllNotificationsRead,
    }),
    [
      activeTab,
      lang,
      t,
      currency,
      formatPrice,
      weather,
      accessibility,
      updateAccessibility,
      userLocation,
      simulation,
      syncEnabled,
      updateSimulation,
      simulatorOpen,
      activeLayers,
      toggleLayer,
      routeRequest,
      navigateToRoute,
      clearRoute,
      reports,
      submitReport,
      notifications,
      pushNotification,
      markAllNotificationsRead,
    ]
  );

  return <BQ360Context.Provider value={value}>{children}</BQ360Context.Provider>;
}

export function useBQ360(): BQ360ContextValue {
  const context = useContext(BQ360Context);
  if (!context) {
    throw new Error("useBQ360 must be used within BQ360Provider");
  }
  return context;
}
