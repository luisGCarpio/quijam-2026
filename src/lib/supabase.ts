import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type {
  AppMode,
  CitizenReport,
  ReportCategory,
  ScenarioId,
  Severity,
  SimulationState,
} from "@/types/bq360";

const VALID_MODES: readonly AppMode[] = ["mundial_2034", "legado"];
const VALID_SCENARIOS: readonly ScenarioId[] = [
  "normal",
  "metropolitano_exit",
  "rain_arroyos",
  "malecon_full",
  "via40_parade",
];
const VALID_WEATHER_OVERRIDES: readonly ("heat_alert" | "rain_arroyo")[] = [
  "heat_alert",
  "rain_arroyo",
];
const VALID_REPORT_CATEGORIES: readonly ReportCategory[] = [
  "aglomeracion",
  "arroyo",
  "seguridad",
  "accesibilidad",
  "salud",
];
const VALID_SEVERITIES: readonly Severity[] = ["baja", "media", "alta"];

const MIN_LAT = 10.8;
const MAX_LAT = 11.2;
const MIN_LNG = -75.0;
const MAX_LNG = -74.6;
const MIN_TITLE_LENGTH = 2;
const MAX_TITLE_LENGTH = 120;
const MAX_DESCRIPTION_LENGTH = 500;
const MIN_CROWD_MULTIPLIER = 0;
const MAX_CROWD_MULTIPLIER = 3;

let browserClient: SupabaseClient | null = null;

function getSupabaseEnv(): { url: string; key: string } | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
  const key =
    (
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )?.trim() ?? "";

  if (!url || !key) {
    return null;
  }

  return { url, key };
}

export function isSupabaseConfigured(): boolean {
  return getSupabaseEnv() !== null;
}

export function getSupabaseClient(): SupabaseClient | null {
  const env = getSupabaseEnv();
  if (!env) {
    return null;
  }

  const clientOptions = {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  };

  if (typeof window === "undefined") {
    try {
      return createClient(env.url, env.key, clientOptions);
    } catch {
      return null;
    }
  }

  if (!browserClient) {
    try {
      browserClient = createClient(env.url, env.key, clientOptions);
    } catch {
      return null;
    }
  }

  return browserClient;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function toFiniteNumber(value: unknown): number | null {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }
  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function isAppMode(value: unknown): value is AppMode {
  return typeof value === "string" && (VALID_MODES as readonly string[]).includes(value);
}

function isScenarioId(value: unknown): value is ScenarioId {
  return typeof value === "string" && (VALID_SCENARIOS as readonly string[]).includes(value);
}

function isWeatherOverride(value: unknown): value is "heat_alert" | "rain_arroyo" {
  return (
    typeof value === "string" &&
    (VALID_WEATHER_OVERRIDES as readonly string[]).includes(value)
  );
}

function isReportCategory(value: unknown): value is ReportCategory {
  return (
    typeof value === "string" &&
    (VALID_REPORT_CATEGORIES as readonly string[]).includes(value)
  );
}

function isSeverity(value: unknown): value is Severity {
  return typeof value === "string" && (VALID_SEVERITIES as readonly string[]).includes(value);
}

function parseSimulationRow(row: unknown): SimulationState | null {
  if (!isRecord(row)) return null;

  const mode = row.mode;
  const scenarioId = row.scenario_id;
  const crowdMultiplier = toFiniteNumber(row.crowd_multiplier);
  const rawWeather = row.weather_override;
  const updatedAt = typeof row.updated_at === "string" ? row.updated_at : "";

  if (!isAppMode(mode) || !isScenarioId(scenarioId) || crowdMultiplier === null) {
    return null;
  }

  if (crowdMultiplier < MIN_CROWD_MULTIPLIER || crowdMultiplier > MAX_CROWD_MULTIPLIER) {
    return null;
  }

  let weatherOverride: SimulationState["weatherOverride"] = null;
  if (rawWeather !== null && rawWeather !== undefined) {
    if (!isWeatherOverride(rawWeather)) {
      return null;
    }
    weatherOverride = rawWeather;
  }

  return {
    mode,
    scenarioId,
    crowdMultiplier,
    weatherOverride,
    updatedAt,
  };
}

function parseCitizenReportRow(row: unknown): CitizenReport | null {
  if (!isRecord(row)) return null;

  const id = typeof row.id === "string" ? row.id : "";
  const category = row.category;
  const title = typeof row.title === "string" ? row.title : "";
  const description = typeof row.description === "string" ? row.description : null;
  const lat = toFiniteNumber(row.lat);
  const lng = toFiniteNumber(row.lng);
  const severity = row.severity;
  const createdAt = typeof row.created_at === "string" ? row.created_at : "";

  if (
    !id ||
    !isReportCategory(category) ||
    !title.trim() ||
    lat === null ||
    lng === null ||
    !isSeverity(severity)
  ) {
    return null;
  }

  return {
    id,
    category,
    title,
    description,
    lat,
    lng,
    severity,
    created_at: createdAt,
  };
}

export type CitizenReportInput = Omit<CitizenReport, "id" | "created_at">;

export function validateCitizenReportInput(
  report: CitizenReportInput
): { ok: true; sanitized: CitizenReportInput } | { ok: false; error: string } {
  if (!isReportCategory(report.category)) {
    return { ok: false, error: "Invalid report category." };
  }

  if (!isSeverity(report.severity)) {
    return { ok: false, error: "Invalid report severity." };
  }

  const trimmedTitle = typeof report.title === "string" ? report.title.trim() : "";
  if (trimmedTitle.length < MIN_TITLE_LENGTH || trimmedTitle.length > MAX_TITLE_LENGTH) {
    return {
      ok: false,
      error: `Title must be between ${MIN_TITLE_LENGTH} and ${MAX_TITLE_LENGTH} characters.`,
    };
  }

  let sanitizedDescription: string | null = null;
  if (report.description !== null && report.description !== undefined) {
    if (typeof report.description !== "string") {
      return { ok: false, error: "Description must be text." };
    }
    const trimmedDescription = report.description.trim();
    if (trimmedDescription.length > MAX_DESCRIPTION_LENGTH) {
      return {
        ok: false,
        error: `Description must be at most ${MAX_DESCRIPTION_LENGTH} characters.`,
      };
    }
    sanitizedDescription = trimmedDescription.length > 0 ? trimmedDescription : null;
  }

  if (!Number.isFinite(report.lat) || report.lat < MIN_LAT || report.lat > MAX_LAT) {
    return {
      ok: false,
      error: `Latitude must be within Barranquilla bounds (${MIN_LAT} to ${MAX_LAT}).`,
    };
  }

  if (!Number.isFinite(report.lng) || report.lng < MIN_LNG || report.lng > MAX_LNG) {
    return {
      ok: false,
      error: `Longitude must be within Barranquilla bounds (${MIN_LNG} to ${MAX_LNG}).`,
    };
  }

  return {
    ok: true,
    sanitized: {
      category: report.category,
      title: trimmedTitle,
      description: sanitizedDescription,
      lat: report.lat,
      lng: report.lng,
      severity: report.severity,
    },
  };
}

export async function fetchGlobalSimulation(): Promise<SimulationState | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const { data, error } = await client
      .from("simulation_state")
      .select("id, mode, scenario_id, crowd_multiplier, weather_override, updated_at")
      .eq("id", "global")
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    return parseSimulationRow(data);
  } catch {
    return null;
  }
}

export async function updateGlobalSimulation(
  next: SimulationState
): Promise<{ ok: boolean; error?: string }> {
  if (!isAppMode(next.mode)) {
    return { ok: false, error: "Invalid simulation mode." };
  }
  if (!isScenarioId(next.scenarioId)) {
    return { ok: false, error: "Invalid scenario identifier." };
  }
  if (!Number.isFinite(next.crowdMultiplier)) {
    return { ok: false, error: "Invalid crowd multiplier." };
  }
  if (next.weatherOverride !== null && !isWeatherOverride(next.weatherOverride)) {
    return { ok: false, error: "Invalid weather override." };
  }

  const client = getSupabaseClient();
  if (!client) {
    return { ok: false, error: "Supabase is not configured." };
  }

  const clampedMultiplier = Math.min(
    MAX_CROWD_MULTIPLIER,
    Math.max(MIN_CROWD_MULTIPLIER, Number(next.crowdMultiplier.toFixed(2)))
  );

  const payload = {
    mode: next.mode,
    scenario_id: next.scenarioId,
    crowd_multiplier: clampedMultiplier,
    weather_override: next.weatherOverride,
    updated_at: next.updatedAt || new Date().toISOString(),
  };

  try {
    const { error } = await client
      .from("simulation_state")
      .update(payload)
      .eq("id", "global");

    if (error) {
      return { ok: false, error: error.message };
    }

    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Failed to update simulation state.",
    };
  }
}

export async function fetchRecentReports(limit = 30): Promise<CitizenReport[]> {
  const client = getSupabaseClient();
  if (!client) return [];

  const safeLimit = Math.min(100, Math.max(1, Math.floor(limit)));

  try {
    const { data, error } = await client
      .from("citizen_reports")
      .select("id, category, title, description, lat, lng, severity, created_at")
      .order("created_at", { ascending: false })
      .limit(safeLimit);

    if (error || !Array.isArray(data)) {
      return [];
    }

    const parsed: CitizenReport[] = [];
    for (const row of data) {
      const report = parseCitizenReportRow(row);
      if (report) {
        parsed.push(report);
      }
    }
    return parsed;
  } catch {
    return [];
  }
}

export async function insertCitizenReport(
  report: CitizenReportInput
): Promise<{ ok: boolean; data?: CitizenReport; error?: string }> {
  const validation = validateCitizenReportInput(report);
  if (!validation.ok) {
    return { ok: false, error: validation.error };
  }

  const client = getSupabaseClient();
  if (!client) {
    return { ok: false, error: "Supabase is not configured." };
  }

  const { sanitized } = validation;

  try {
    const { data, error } = await client
      .from("citizen_reports")
      .insert({
        category: sanitized.category,
        title: sanitized.title,
        description: sanitized.description ?? null,
        lat: sanitized.lat,
        lng: sanitized.lng,
        severity: sanitized.severity,
      })
      .select("id, category, title, description, lat, lng, severity, created_at")
      .single();

    if (error) {
      return { ok: false, error: error.message };
    }

    const parsed = parseCitizenReportRow(data);
    if (!parsed) {
      return { ok: false, error: "Unexpected response while creating report." };
    }

    return { ok: true, data: parsed };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Failed to submit citizen report.",
    };
  }
}

export function subscribeToSimulation(
  onChange: (state: SimulationState) => void,
  onStatus?: (connected: boolean) => void
): () => void {
  const client = getSupabaseClient();
  if (!client) {
    onStatus?.(false);
    return () => {};
  }

  const channelName = `bq360-simulation-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const channel = client
    .channel(channelName)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "simulation_state",
        filter: "id=eq.global",
      },
      (payload) => {
        const parsed = parseSimulationRow(payload.new);
        if (parsed) {
          onChange(parsed);
        }
      }
    )
    .subscribe((status) => {
      if (status === "SUBSCRIBED") {
        onStatus?.(true);
      } else if (
        status === "CLOSED" ||
        status === "CHANNEL_ERROR" ||
        status === "TIMED_OUT"
      ) {
        onStatus?.(false);
      }
    });

  let disposed = false;
  return () => {
    if (disposed) return;
    disposed = true;
    void client.removeChannel(channel);
  };
}

export function subscribeToCitizenReports(
  onInsert: (report: CitizenReport) => void
): () => void {
  const client = getSupabaseClient();
  if (!client) {
    return () => {};
  }

  const channelName = `bq360-reports-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const channel = client
    .channel(channelName)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "citizen_reports",
      },
      (payload) => {
        const parsed = parseCitizenReportRow(payload.new);
        if (parsed) {
          onInsert(parsed);
        }
      }
    )
    .subscribe();

  let disposed = false;
  return () => {
    if (disposed) return;
    disposed = true;
    void client.removeChannel(channel);
  };
}
