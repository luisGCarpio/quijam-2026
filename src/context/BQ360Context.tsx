"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { ALL_POIS } from "@/data/all-pois";
import { ARROYO_ZONES } from "@/data/arroyos";
import { CITY_EVENTS } from "@/data/events";
import { SCENARIOS } from "@/data/scenarios";
import { getTranslation } from "@/i18n";
import { formatCop } from "@/lib/currency";
import { speakAlert, stopSpeech } from "@/lib/speech";
import {
  fetchArroyoZones,
  fetchCityEvents,
  fetchCityPois,
  fetchGlobalSimulation,
  fetchRecentReports,
  insertCitizenReport,
  isSupabaseConfigured,
  subscribeToCitizenReports,
  subscribeToCityEvents,
  subscribeToSimulation,
  updateGlobalSimulation,
  validateCitizenReportInput,
} from "@/lib/supabase";
import {
  DEFAULT_BARRANQUILLA_WEATHER,
  deriveEffectiveWeather,
  fetchLiveBarranquillaWeather,
} from "@/lib/weather";
import type {
  AccessibilityPrefs,
  ArroyoZone,
  BQ360ContextValue,
  CitizenReport,
  CityEvent,
  Currency,
  Lang,
  LatLng,
  LayerCategory,
  NotificationItem,
  Poi,
  RouteRequest,
  SimulationState,
  TabId,
  WeatherState,
} from "@/types/bq360";

const STORAGE_KEYS = {
  lang: "bq360:lang",
  currency: "bq360:currency",
  accessibility: "bq360:accessibility",
} as const;

const VALID_LANGS: readonly Lang[] = ["es", "en", "pt", "fr"];
const VALID_CURRENCIES: readonly Currency[] = ["COP", "USD", "EUR", "BRL"];

const DEFAULT_USER_LOCATION: LatLng = {
  lat: 10.9878,
  lng: -74.7889,
};

const CURRENT_LOCATION_LABEL: Record<Lang, string> = {
  es: "Tu ubicación",
  en: "Your location",
  pt: "Sua localização",
  fr: "Votre position",
};

const DEFAULT_ACCESSIBILITY: AccessibilityPrefs = {
  accessibleRoute: false,
  highContrast: false,
  largeText: false,
  voiceAlerts: false,
};

const INITIAL_SIMULATION: SimulationState = {
  mode: "mundial_2034",
  scenarioId: "normal",
  crowdMultiplier: 0.8,
  weatherOverride: null,
  updatedAt: "",
};

const DEFAULT_LAYERS: Record<LayerCategory, boolean> = {
  turismo: true,
  salud: true,
  movilidad: true,
  cultura: true,
  ambiente: true,
  comercio: true,
  seguridad: true,
};

const WEATHER_REFRESH_MS = 10 * 60 * 1000;
const MAX_NOTIFICATIONS = 30;
const MAX_ACTIVE_TOASTS = 3;
const MAX_REPORTS = 50;
const CRITICAL_CROWD_THRESHOLD = 0.8 * 3;
const WELCOME_NOTIFICATION_ID = "bq360-welcome-initial";

const BQ360Context = createContext<BQ360ContextValue | null>(null);

function createClientId(prefix: string): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function isValidLang(value: unknown): value is Lang {
  return typeof value === "string" && (VALID_LANGS as readonly string[]).includes(value);
}

function isValidCurrency(value: unknown): value is Currency {
  return (
    typeof value === "string" && (VALID_CURRENCIES as readonly string[]).includes(value)
  );
}

function parseStoredAccessibility(raw: string | null): AccessibilityPrefs | null {
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
      return null;
    }
    const obj = parsed as Record<string, unknown>;
    return {
      accessibleRoute:
        typeof obj.accessibleRoute === "boolean"
          ? obj.accessibleRoute
          : DEFAULT_ACCESSIBILITY.accessibleRoute,
      highContrast:
        typeof obj.highContrast === "boolean"
          ? obj.highContrast
          : DEFAULT_ACCESSIBILITY.highContrast,
      largeText:
        typeof obj.largeText === "boolean"
          ? obj.largeText
          : DEFAULT_ACCESSIBILITY.largeText,
      voiceAlerts:
        typeof obj.voiceAlerts === "boolean"
          ? obj.voiceAlerts
          : DEFAULT_ACCESSIBILITY.voiceAlerts,
    };
  } catch {
    return null;
  }
}

function readStorageItem(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorageItem(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Ignore storage quota or private mode restrictions.
  }
}

function isNearDefaultPlazaDeLaPaz(coords: LatLng): boolean {
  return (
    Math.abs(coords.lat - DEFAULT_USER_LOCATION.lat) < 0.0005 &&
    Math.abs(coords.lng - DEFAULT_USER_LOCATION.lng) < 0.0005
  );
}

function isEchoOfLocalSimulation(
  incoming: SimulationState,
  lastLocal: SimulationState | null
): boolean {
  if (!lastLocal) return false;

  const sameFields =
    incoming.mode === lastLocal.mode &&
    incoming.scenarioId === lastLocal.scenarioId &&
    incoming.weatherOverride === lastLocal.weatherOverride &&
    Math.abs(incoming.crowdMultiplier - lastLocal.crowdMultiplier) < 0.01;

  if (!sameFields) return false;

  if (incoming.updatedAt === lastLocal.updatedAt) {
    return true;
  }

  const incomingMs = Date.parse(incoming.updatedAt);
  const localMs = Date.parse(lastLocal.updatedAt);
  if (Number.isFinite(incomingMs) && Number.isFinite(localMs)) {
    return Math.abs(incomingMs - localMs) < 5000;
  }

  return false;
}

function mergeReportsById(
  incoming: CitizenReport[],
  existing: CitizenReport[]
): CitizenReport[] {
  const byId = new Map<string, CitizenReport>();
  for (const item of incoming) {
    byId.set(item.id, item);
  }
  for (const item of existing) {
    if (!byId.has(item.id)) {
      byId.set(item.id, item);
    }
  }
  return Array.from(byId.values())
    .sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at))
    .slice(0, MAX_REPORTS);
}

export function BQ360Provider({ children }: { children: ReactNode }) {
  const [activeTab, setActiveTab] = useState<TabId>("map");
  const [lang, setLangState] = useState<Lang>("es");
  const [currency, setCurrencyState] = useState<Currency>("COP");
  const [baseWeather, setBaseWeather] = useState<WeatherState>(
    DEFAULT_BARRANQUILLA_WEATHER
  );
  const [accessibility, setAccessibilityState] = useState<AccessibilityPrefs>(
    DEFAULT_ACCESSIBILITY
  );
  const [userLocation, setUserLocationState] = useState<LatLng>(DEFAULT_USER_LOCATION);
  const [simulation, setSimulation] = useState<SimulationState>(INITIAL_SIMULATION);
  const [syncEnabled, setSyncEnabledState] = useState<boolean>(true);
  const [simulatorOpen, setSimulatorOpen] = useState<boolean>(false);
  const [realtimeConnected, setRealtimeConnected] = useState<boolean>(false);
  const [events, setEvents] = useState<CityEvent[]>(CITY_EVENTS);
  const [arroyos, setArroyos] = useState<ArroyoZone[]>(ARROYO_ZONES);
  const [pois, setPois] = useState<Poi[]>(ALL_POIS);
  const [activeLayers, setActiveLayers] =
    useState<Record<LayerCategory, boolean>>(DEFAULT_LAYERS);
  const [routeRequest, setRouteRequest] = useState<RouteRequest | null>(null);
  const [reports, setReports] = useState<CitizenReport[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [activeToasts, setActiveToasts] = useState<NotificationItem[]>([]);
  const [isNotificationDrawerOpen, setNotificationDrawerOpen] =
    useState<boolean>(false);

  // Refs to read fresh values inside stable callbacks and Realtime listeners
  const langRef = useRef<Lang>("es");
  const accessibilityRef = useRef<AccessibilityPrefs>(DEFAULT_ACCESSIBILITY);
  const userLocationRef = useRef<LatLng>(DEFAULT_USER_LOCATION);
  const simulationRef = useRef<SimulationState>(INITIAL_SIMULATION);
  const syncEnabledRef = useRef<boolean>(true);
  const lastLocalSimWriteRef = useRef<SimulationState | null>(null);
  const localSimWriteSeqRef = useRef<number>(0);
  const seenReportIdsRef = useRef<Set<string>>(new Set());
  const userTouchedPrefsRef = useRef<{
    lang: boolean;
    currency: boolean;
    accessibility: boolean;
  }>({
    lang: false,
    currency: false,
    accessibility: false,
  });

  // 1. Client-only mount hydration from localStorage + initial welcome notification
  useEffect(() => {
    let cancelled = false;

    queueMicrotask(() => {
      if (cancelled) return;

      let resolvedLang: Lang = langRef.current;

      const storedLang = readStorageItem(STORAGE_KEYS.lang);
      if (!userTouchedPrefsRef.current.lang && isValidLang(storedLang)) {
        resolvedLang = storedLang;
        langRef.current = storedLang;
        setLangState(storedLang);
      }

      const storedCurrency = readStorageItem(STORAGE_KEYS.currency);
      if (!userTouchedPrefsRef.current.currency && isValidCurrency(storedCurrency)) {
        setCurrencyState(storedCurrency);
      }

      const storedAccessibility = parseStoredAccessibility(
        readStorageItem(STORAGE_KEYS.accessibility)
      );
      if (!userTouchedPrefsRef.current.accessibility && storedAccessibility) {
        accessibilityRef.current = storedAccessibility;
        setAccessibilityState(storedAccessibility);
      }

      const welcomeItem: NotificationItem = {
        id: WELCOME_NOTIFICATION_ID,
        title: getTranslation(resolvedLang, "shell.notify.welcomeTitle"),
        body: getTranslation(resolvedLang, "shell.notify.welcomeBody"),
        severity: "baja",
        timestamp: new Date().toISOString(),
        read: false,
      };

      setNotifications((prev) => {
        if (prev.some((item) => item.id === WELCOME_NOTIFICATION_ID)) {
          return prev;
        }
        return [welcomeItem, ...prev].slice(0, MAX_NOTIFICATIONS);
      });
    });

    return () => {
      cancelled = true;
    };
  }, []);

  // 2. Sync DOM attributes & document.title
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dataset.contrast = accessibility.highContrast
      ? "high"
      : "default";
    document.documentElement.dataset.textSize = accessibility.largeText
      ? "large"
      : "default";
    document.title = `${getTranslation(lang, `shell.tab.title.${activeTab}`)} | BQ360`;
  }, [lang, accessibility.highContrast, accessibility.largeText, activeTab]);

  // 3. Live weather from Open-Meteo on mount + 10-minute refresh
  useEffect(() => {
    let active = true;
    let currentController: AbortController | null = null;

    const loadWeather = async () => {
      currentController?.abort();
      const controller = new AbortController();
      currentController = controller;
      const liveWeather = await fetchLiveBarranquillaWeather(controller.signal);
      if (active && !controller.signal.aborted) {
        setBaseWeather(liveWeather);
      }
    };

    void loadWeather();
    const intervalId = window.setInterval(() => {
      void loadWeather();
    }, WEATHER_REFRESH_MS);

    return () => {
      active = false;
      currentController?.abort();
      window.clearInterval(intervalId);
    };
  }, []);

  const pushNotification = useCallback(
    (item: Omit<NotificationItem, "id" | "timestamp" | "read">) => {
      const next: NotificationItem = {
        ...item,
        id: createClientId("ntf"),
        timestamp: new Date().toISOString(),
        read: false,
      };

      setNotifications((prev) => [next, ...prev].slice(0, MAX_NOTIFICATIONS));
      setActiveToasts((prev) => [next, ...prev].slice(0, MAX_ACTIVE_TOASTS));

      if (accessibilityRef.current.voiceAlerts) {
        speakAlert(`${item.title}. ${item.body}`, langRef.current);
      }
    },
    []
  );

  // 4a. Supabase simulation sync (gated on syncEnabled && isSupabaseConfigured)
  useEffect(() => {
    if (!syncEnabled || !isSupabaseConfigured()) {
      return;
    }

    let active = true;
    const effectStartWriteSeq = localSimWriteSeqRef.current;

    void fetchGlobalSimulation().then((remoteSim) => {
      if (!active || !remoteSim) return;
      if (localSimWriteSeqRef.current !== effectStartWriteSeq) return;
      simulationRef.current = remoteSim;
      setSimulation(remoteSim);
    });

    const unsubscribeSim = subscribeToSimulation(
      (incoming) => {
        if (!active) return;

        if (isEchoOfLocalSimulation(incoming, lastLocalSimWriteRef.current)) {
          lastLocalSimWriteRef.current = null;
          simulationRef.current = incoming;
          setSimulation(incoming);
          return;
        }

        lastLocalSimWriteRef.current = null;

        const prev = simulationRef.current;
        const scenarioChanged = incoming.scenarioId !== prev.scenarioId;
        const modeChanged = incoming.mode !== prev.mode;
        const crossedCriticalCrowd =
          incoming.crowdMultiplier >= CRITICAL_CROWD_THRESHOLD &&
          prev.crowdMultiplier < CRITICAL_CROWD_THRESHOLD;

        simulationRef.current = incoming;
        setSimulation(incoming);

        if (scenarioChanged || crossedCriticalCrowd || modeChanged) {
          const currentLang = langRef.current;
          const scenarioMeta = SCENARIOS[incoming.scenarioId];

          if (scenarioChanged || crossedCriticalCrowd) {
            pushNotification({
              title: scenarioMeta.label[currentLang],
              body: scenarioMeta.summary[currentLang],
              severity: crossedCriticalCrowd ? "alta" : scenarioMeta.severity,
            });
          } else {
            pushNotification({
              title: getTranslation(currentLang, `shell.mode.${incoming.mode}`),
              body: scenarioMeta.summary[currentLang],
              severity: "baja",
            });
          }
        }
      },
      (connected) => {
        if (active) {
          setRealtimeConnected(connected);
        }
      }
    );

    return () => {
      active = false;
      unsubscribeSim();
    };
  }, [syncEnabled, pushNotification]);

  // 4b. Citizen reports sync (decoupled from simulator Modo Local; gated only on isSupabaseConfigured)
  useEffect(() => {
    if (!isSupabaseConfigured()) {
      return;
    }

    let active = true;

    void fetchRecentReports(30).then((remoteReports) => {
      if (!active || remoteReports.length === 0) return;
      for (const report of remoteReports) {
        seenReportIdsRef.current.add(report.id);
      }
      setReports((prev) => mergeReportsById(remoteReports, prev));
    });

    const unsubscribeReports = subscribeToCitizenReports((incoming) => {
      if (!active) return;

      setReports((prev) => {
        if (prev.some((item) => item.id === incoming.id)) {
          return prev;
        }
        return [incoming, ...prev].slice(0, MAX_REPORTS);
      });

      if (!seenReportIdsRef.current.has(incoming.id)) {
        seenReportIdsRef.current.add(incoming.id);
        pushNotification({
          title: getTranslation(langRef.current, "shell.notify.newReport"),
          body: incoming.title,
          severity: incoming.severity,
        });
      }
    });

    return () => {
      active = false;
      unsubscribeReports();
    };
  }, [pushNotification]);

  // 4c. Hydrate city_events, arroyo_zones, and city_pois from Supabase (with instant local fallback)
  useEffect(() => {
    if (!isSupabaseConfigured()) {
      return;
    }

    let active = true;

    const loadCatalogs = async () => {
      const [remoteEvents, remoteArroyos, remotePois] = await Promise.all([
        fetchCityEvents(),
        fetchArroyoZones(),
        fetchCityPois(),
      ]);
      if (!active) return;
      if (remoteEvents.length > 0) setEvents(remoteEvents);
      if (remoteArroyos.length > 0) setArroyos(remoteArroyos);
      if (remotePois.length > 0) setPois(remotePois);
    };

    void loadCatalogs();

    const unsubscribeEvents = subscribeToCityEvents(() => {
      void fetchCityEvents().then((remoteEvents) => {
        if (active && remoteEvents.length > 0) {
          setEvents(remoteEvents);
        }
      });
    });

    return () => {
      active = false;
      unsubscribeEvents();
    };
  }, []);

  const setLang = useCallback((nextLang: Lang) => {
    userTouchedPrefsRef.current.lang = true;
    langRef.current = nextLang;
    setLangState(nextLang);
    writeStorageItem(STORAGE_KEYS.lang, nextLang);
  }, []);

  const setCurrency = useCallback((nextCurrency: Currency) => {
    userTouchedPrefsRef.current.currency = true;
    setCurrencyState(nextCurrency);
    writeStorageItem(STORAGE_KEYS.currency, nextCurrency);
  }, []);

  const updateAccessibility = useCallback((patch: Partial<AccessibilityPrefs>) => {
    userTouchedPrefsRef.current.accessibility = true;
    const next: AccessibilityPrefs = {
      ...accessibilityRef.current,
      ...patch,
    };
    accessibilityRef.current = next;
    setAccessibilityState(next);
    writeStorageItem(STORAGE_KEYS.accessibility, JSON.stringify(next));

    if (patch.voiceAlerts === false) {
      stopSpeech();
    }
  }, []);

  const setUserLocation = useCallback((coords: LatLng) => {
    userLocationRef.current = coords;
    setUserLocationState(coords);
  }, []);

  const setSyncEnabled = useCallback((nextSync: boolean) => {
    syncEnabledRef.current = nextSync;
    setSyncEnabledState(nextSync);
    if (!nextSync) {
      setRealtimeConnected(false);
    }
  }, []);

  const updateSimulation = useCallback(
    async (patch: Partial<SimulationState>): Promise<void> => {
      const prev = simulationRef.current;
      const nextCrowd =
        typeof patch.crowdMultiplier === "number" &&
        Number.isFinite(patch.crowdMultiplier)
          ? Math.min(3, Math.max(0, patch.crowdMultiplier))
          : prev.crowdMultiplier;

      const merged: SimulationState = {
        mode: patch.mode ?? prev.mode,
        scenarioId: patch.scenarioId ?? prev.scenarioId,
        crowdMultiplier: nextCrowd,
        weatherOverride:
          patch.weatherOverride !== undefined
            ? patch.weatherOverride
            : prev.weatherOverride,
        updatedAt: new Date().toISOString(),
      };

      localSimWriteSeqRef.current += 1;
      lastLocalSimWriteRef.current = merged;
      simulationRef.current = merged;
      setSimulation(merged);

      const scenarioChanged = merged.scenarioId !== prev.scenarioId;
      const crossedCriticalCrowd =
        merged.crowdMultiplier >= CRITICAL_CROWD_THRESHOLD &&
        prev.crowdMultiplier < CRITICAL_CROWD_THRESHOLD;

      if (scenarioChanged || crossedCriticalCrowd) {
        const currentLang = langRef.current;
        const scenarioMeta = SCENARIOS[merged.scenarioId];
        pushNotification({
          title: scenarioMeta.label[currentLang],
          body: scenarioMeta.summary[currentLang],
          severity: crossedCriticalCrowd ? "alta" : scenarioMeta.severity,
        });
      }

      if (syncEnabledRef.current && isSupabaseConfigured()) {
        const result = await updateGlobalSimulation(merged);
        if (!result.ok) {
          lastLocalSimWriteRef.current = null;
          console.warn("[BQ360] Failed to persist simulation_state:", result.error);
          setRealtimeConnected(false);
        }
      }
    },
    [pushNotification]
  );

  const toggleLayer = useCallback((layer: LayerCategory) => {
    setActiveLayers((prev) => ({
      ...prev,
      [layer]: !prev[layer],
    }));
  }, []);

  const navigateToRoute = useCallback(
    (destination: LatLng & { label: string }) => {
      const originCoords = userLocationRef.current;
      const originLabel = isNearDefaultPlazaDeLaPaz(originCoords)
        ? "Plaza de la Paz"
        : CURRENT_LOCATION_LABEL[langRef.current];

      setRouteRequest({
        origin: {
          lat: originCoords.lat,
          lng: originCoords.lng,
          label: originLabel,
        },
        destination,
      });
      setActiveTab("map");
    },
    []
  );

  const clearRoute = useCallback(() => {
    setRouteRequest(null);
  }, []);

  const commitReport = useCallback(
    (created: CitizenReport) => {
      setReports((prev) => {
        if (prev.some((item) => item.id === created.id)) {
          return prev;
        }
        return [created, ...prev].slice(0, MAX_REPORTS);
      });

      if (!seenReportIdsRef.current.has(created.id)) {
        seenReportIdsRef.current.add(created.id);
        pushNotification({
          title: getTranslation(langRef.current, "shell.notify.newReport"),
          body: created.title,
          severity: created.severity,
        });
      }
    },
    [pushNotification]
  );

  const submitReport = useCallback(
    async (
      report: Omit<CitizenReport, "id" | "created_at">
    ): Promise<{ ok: boolean; error?: string }> => {
      const validation = validateCitizenReportInput(report);
      if (!validation.ok) {
        return { ok: false, error: validation.error };
      }

      const { sanitized } = validation;
      const shouldUseSupabase =
        isSupabaseConfigured() &&
        (typeof navigator === "undefined" || navigator.onLine !== false);

      if (shouldUseSupabase) {
        const result = await insertCitizenReport(sanitized);
        if (result.ok && result.data) {
          commitReport(result.data);
          return { ok: true };
        }

        console.warn(
          "[BQ360] Failed to persist citizen_report, using local fallback:",
          result.error
        );
      }

      const localFallbackReport: CitizenReport = {
        id: createClientId("rpt"),
        category: sanitized.category,
        title: sanitized.title,
        description: sanitized.description ?? null,
        lat: sanitized.lat,
        lng: sanitized.lng,
        severity: sanitized.severity,
        created_at: new Date().toISOString(),
      };

      commitReport(localFallbackReport);
      return { ok: true };
    },
    [commitReport]
  );

  const dismissToast = useCallback((id: string) => {
    setActiveToasts((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setNotifications((prev) =>
      prev.map((item) => (item.read ? item : { ...item, read: true }))
    );
  }, []);

  const t = useCallback((key: string) => getTranslation(lang, key), [lang]);

  const formatPrice = useCallback(
    (copAmount: number) => formatCop(copAmount, currency),
    [currency]
  );

  const weather = useMemo(
    () => deriveEffectiveWeather(baseWeather, simulation.weatherOverride),
    [baseWeather, simulation.weatherOverride]
  );

  const supabaseConnected = syncEnabled && realtimeConnected;
  const isAnyModalOpen = simulatorOpen || isNotificationDrawerOpen;

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
      supabaseConnected,
      events,
      arroyos,
      pois,
      activeLayers,
      toggleLayer,
      routeRequest,
      navigateToRoute,
      clearRoute,
      reports,
      submitReport,
      notifications,
      activeToasts,
      pushNotification,
      dismissToast,
      markAllNotificationsRead,
      isNotificationDrawerOpen,
      setNotificationDrawerOpen,
      isAnyModalOpen,
    }),
    [
      activeTab,
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
      supabaseConnected,
      events,
      arroyos,
      pois,
      activeLayers,
      toggleLayer,
      routeRequest,
      navigateToRoute,
      clearRoute,
      reports,
      submitReport,
      notifications,
      activeToasts,
      pushNotification,
      dismissToast,
      markAllNotificationsRead,
      isNotificationDrawerOpen,
      isAnyModalOpen,
    ]
  );

  return <BQ360Context.Provider value={value}>{children}</BQ360Context.Provider>;
}

export function useBQ360(): BQ360ContextValue {
  const context = useContext(BQ360Context);
  if (!context) {
    throw new Error("useBQ360 must be used within a BQ360Provider");
  }
  return context;
}
