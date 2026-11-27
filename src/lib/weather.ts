import type { SimulationState, WeatherState } from "@/types/bq360";

const OPEN_METEO_BARRANQUILLA_URL =
  "https://api.open-meteo.com/v1/forecast?latitude=10.9685&longitude=-74.7813&current=temperature_2m,apparent_temperature,weather_code,precipitation&daily=uv_index_max&timezone=America%2FBogota&forecast_days=1";

const WEATHER_TIMEOUT_MS = 6000;

export const DEFAULT_BARRANQUILLA_WEATHER: WeatherState = {
  tempC: 32,
  feelsLikeC: 36,
  uvIndex: 9,
  condition: "sunny",
  arroyoRisk: "bajo",
  isOverridden: false,
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readFiniteNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function classifyWeather(
  weatherCode: number,
  precipitationMm: number,
  tempC: number,
  feelsLikeC: number
): Pick<WeatherState, "condition" | "arroyoRisk"> {
  const isSevereStormCode =
    weatherCode === 65 ||
    weatherCode === 82 ||
    weatherCode === 95 ||
    weatherCode === 96 ||
    weatherCode === 99;
  const isModerateRainCode =
    weatherCode === 61 ||
    weatherCode === 63 ||
    weatherCode === 66 ||
    weatherCode === 67 ||
    weatherCode === 80 ||
    weatherCode === 81;
  const isDrizzleCode =
    weatherCode === 51 ||
    weatherCode === 53 ||
    weatherCode === 55 ||
    weatherCode === 56 ||
    weatherCode === 57;

  if (precipitationMm >= 8 || isSevereStormCode) {
    return { condition: "rain_arroyo", arroyoRisk: "critico" };
  }

  if (precipitationMm >= 1.5 || isModerateRainCode) {
    return { condition: "rain_arroyo", arroyoRisk: "moderado" };
  }

  if (precipitationMm > 0 || isDrizzleCode) {
    return { condition: "cloudy", arroyoRisk: "moderado" };
  }

  if (feelsLikeC >= 40 || tempC >= 36) {
    return { condition: "heat_alert", arroyoRisk: "bajo" };
  }

  if (weatherCode === 2 || weatherCode === 3 || weatherCode === 45 || weatherCode === 48) {
    return { condition: "cloudy", arroyoRisk: "bajo" };
  }

  return { condition: "sunny", arroyoRisk: "bajo" };
}

function parseOpenMeteoResponse(payload: unknown): WeatherState | null {
  if (!isRecord(payload) || !isRecord(payload.current)) {
    return null;
  }

  const current = payload.current;
  const rawTemp = readFiniteNumber(current.temperature_2m);
  const rawFeelsLike = readFiniteNumber(current.apparent_temperature);
  const rawWeatherCode = readFiniteNumber(current.weather_code);
  const rawPrecipitation = readFiniteNumber(current.precipitation) ?? 0;

  if (rawTemp === null || rawFeelsLike === null || rawWeatherCode === null) {
    return null;
  }

  let uvIndex = DEFAULT_BARRANQUILLA_WEATHER.uvIndex;
  if (isRecord(payload.daily) && Array.isArray(payload.daily.uv_index_max)) {
    const firstUv = readFiniteNumber(payload.daily.uv_index_max[0]);
    if (firstUv !== null) {
      uvIndex = Math.max(0, Math.round(firstUv));
    }
  }

  const tempC = Math.round(rawTemp);
  const feelsLikeC = Math.round(rawFeelsLike);
  const { condition, arroyoRisk } = classifyWeather(
    rawWeatherCode,
    Math.max(0, rawPrecipitation),
    tempC,
    feelsLikeC
  );

  return {
    tempC,
    feelsLikeC,
    uvIndex,
    condition,
    arroyoRisk,
    isOverridden: false,
  };
}

export async function fetchLiveBarranquillaWeather(
  signal?: AbortSignal
): Promise<WeatherState> {
  if (signal?.aborted) {
    return { ...DEFAULT_BARRANQUILLA_WEATHER };
  }

  const controller = new AbortController();
  const handleExternalAbort = () => controller.abort();

  if (signal) {
    signal.addEventListener("abort", handleExternalAbort, { once: true });
  }

  const timeoutId = setTimeout(() => {
    controller.abort();
  }, WEATHER_TIMEOUT_MS);

  try {
    const response = await fetch(OPEN_METEO_BARRANQUILLA_URL, {
      signal: controller.signal,
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return { ...DEFAULT_BARRANQUILLA_WEATHER };
    }

    const json: unknown = await response.json();
    return parseOpenMeteoResponse(json) ?? { ...DEFAULT_BARRANQUILLA_WEATHER };
  } catch {
    return { ...DEFAULT_BARRANQUILLA_WEATHER };
  } finally {
    clearTimeout(timeoutId);
    if (signal) {
      signal.removeEventListener("abort", handleExternalAbort);
    }
  }
}

export function deriveEffectiveWeather(
  base: WeatherState,
  override: SimulationState["weatherOverride"]
): WeatherState {
  if (override === "rain_arroyo") {
    return {
      ...base,
      tempC: 27,
      feelsLikeC: 30,
      uvIndex: 2,
      condition: "rain_arroyo",
      arroyoRisk: "critico",
      isOverridden: true,
    };
  }

  if (override === "heat_alert") {
    return {
      ...base,
      tempC: Math.max(base.tempC, 37),
      feelsLikeC: Math.max(base.feelsLikeC, 43),
      uvIndex: Math.max(base.uvIndex, 11),
      condition: "heat_alert",
      arroyoRisk: "bajo",
      isOverridden: true,
    };
  }

  return {
    ...base,
    isOverridden: false,
  };
}
