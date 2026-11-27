"use client";

import { useMemo } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowDownWideNarrow,
  CalendarClock,
  CloudSun,
  Info,
  Landmark,
  Sparkles,
  Trophy,
} from "lucide-react";
import { type EventInfo, type EventsLang } from "@/data/events";
import { FEATURED_EVENT_IDS, getScenario } from "@/data/scenarios";
import { getEventsCopy } from "@/i18n/events";
import { useBQ360 } from "@/context/BQ360Context";
import type {
  BQ360ContextValue,
  SimulationState,
  WeatherState,
} from "@/types/bq360";
import { EventCard } from "./EventCard";

export type EventsSimulation = SimulationState;
export type EventWeather = WeatherState;

export type EventsTabProps = {
  simulation?: SimulationState;
  weather?: WeatherState;
  lang?: EventsLang;
  accessibleRoute?: boolean;
  events?: EventInfo[];
  onNavigate?: BQ360ContextValue["navigateToRoute"];
};

function getWeatherLabel(
  weather: EventWeather,
  copy: ReturnType<typeof getEventsCopy>
) {
  if (weather.condition === "heat_alert") return copy.weatherHeat;
  if (weather.condition === "rain_arroyo") {
    const risk = weather.arroyoRisk ?? "critico";
    const riskLabel =
      risk === "critico"
        ? copy.arroyoCritical
        : risk === "moderado"
          ? copy.arroyoModerate
          : copy.arroyoLow;
    return `${copy.weatherRain} · ${riskLabel}`;
  }
  return weather.condition === "cloudy" ? copy.weatherCloudy : copy.weatherSunny;
}

function estimateAttendance(event: EventInfo, simulation: EventsSimulation) {
  const projected = Math.round(
    event.baseAttendance * simulation.crowdMultiplier
  );
  return Math.max(0, Math.min(projected, Math.round(event.capacity * 1.1)));
}

function getLocale(lang: EventsLang): string {
  switch (lang) {
    case "es":
      return "es-CO";
    case "pt":
      return "pt-BR";
    case "fr":
      return "fr-FR";
    default:
      return "en-US";
  }
}

export default function EventsTab({
  simulation,
  weather,
  lang,
  accessibleRoute,
  events,
  onNavigate,
}: EventsTabProps) {
  const context = useBQ360();
  const activeSimulation = simulation ?? context.simulation;
  const currentWeather = weather ?? context.weather;
  const activeLang = lang ?? context.lang;
  const routeAccess = accessibleRoute ?? context.accessibility.accessibleRoute;
  const eventData = events ?? context.events;
  const navigate = onNavigate ?? context.navigateToRoute;
  const copy = getEventsCopy(activeLang);
  const scenario = getScenario(activeSimulation.scenarioId);

  const currentEvents = useMemo(
    () =>
      eventData
        .filter((event) => event.mode === activeSimulation.mode)
        .map((event) => ({
          event,
          attendance: estimateAttendance(event, activeSimulation),
        }))
        .sort(
          (a, b) =>
            b.attendance / b.event.capacity - a.attendance / a.event.capacity
        ),
    [eventData, activeSimulation]
  );

  const totalAttendance = currentEvents.reduce(
    (sum, item) => sum + item.attendance,
    0
  );
  const totalCapacity = currentEvents.reduce(
    (sum, item) => sum + item.event.capacity,
    0
  );
  const occupancy = totalCapacity
    ? Math.round((totalAttendance / totalCapacity) * 100)
    : 0;
  const modeLabel =
    activeSimulation.mode === "mundial_2034" ? copy.world : copy.legacy;
  const weatherLabel = getWeatherLabel(
    {
      ...currentWeather,
      condition: activeSimulation.weatherOverride ?? currentWeather.condition,
      arroyoRisk:
        activeSimulation.weatherOverride === "rain_arroyo"
          ? "critico"
          : currentWeather.arroyoRisk,
    },
    copy
  );
  const featuredEventId = FEATURED_EVENT_IDS[scenario.id];
  const featuredEvent = currentEvents.find(
    ({ event }) => event.id === featuredEventId
  )?.event;
  const locale = getLocale(activeLang);

  return (
    <section className="flex flex-col gap-4 p-4" aria-labelledby="events-title">
      {/* Encabezado estilo DESIGN.md (ícono circular sólido + kicker + h2) */}
      <header className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <span
            aria-hidden="true"
            className="bq-icon-circle mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-bq-red text-white"
          >
            <CalendarClock
              className="h-5 w-5"
              strokeWidth={2}
              absoluteStrokeWidth
            />
          </span>
          <div className="min-w-0">
            <p className="text-[0.6875rem] font-bold uppercase tracking-wider text-bq-red">
              {copy.eyebrow}
            </p>
            <h2
              id="events-title"
              className="mt-0.5 text-lg font-extrabold leading-tight tracking-tight text-bq-navy"
            >
              {copy.title}
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-bq-text">
              {copy.intro}
            </p>
          </div>
        </div>
      </header>

      {/* Tarjeta resumen de aforo estimado */}
      <section
        aria-label={copy.cityStatus}
        aria-live="polite"
        className="bq-surface-card rounded-2xl p-4"
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span
              aria-hidden="true"
              className="bq-icon-circle inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-bq-navy text-white"
            >
              <Activity
                className="h-5 w-5"
                strokeWidth={2}
                absoluteStrokeWidth
              />
            </span>
            <div>
              <p className="text-[0.6875rem] font-bold uppercase tracking-wider text-bq-muted">
                {copy.cityStatus}
              </p>
              <p className="mt-0.5 text-2xl font-extrabold leading-none tracking-tight text-bq-navy tabular-nums">
                {occupancy}
                <span className="ml-0.5 text-sm font-bold text-bq-muted">%</span>
              </p>
            </div>
          </div>

          <span
            className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[0.6875rem] font-extrabold leading-none ${
              activeSimulation.mode === "legado"
                ? "bg-bq-green text-white"
                : "bg-bq-yellow text-bq-navy"
            }`}
          >
            {activeSimulation.mode === "legado" ? (
              <Landmark
                className="h-3 w-3 shrink-0"
                strokeWidth={2.25}
                absoluteStrokeWidth
                aria-hidden="true"
              />
            ) : (
              <Trophy
                className="h-3 w-3 shrink-0"
                strokeWidth={2.25}
                absoluteStrokeWidth
                aria-hidden="true"
              />
            )}
            <span>{modeLabel}</span>
          </span>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-[var(--border-subtle)] pt-2.5 text-xs">
          <span className="font-bold text-bq-navy tabular-nums">
            {totalAttendance.toLocaleString(locale)} {copy.people} ·{" "}
            <span className="font-medium text-bq-muted">
              {currentEvents.length} {copy.activeEvents}
            </span>
          </span>
          <span className="inline-flex items-center gap-1 text-[0.6875rem] font-bold text-bq-green">
            <Sparkles
              className="h-3 w-3 shrink-0"
              strokeWidth={2}
              absoluteStrokeWidth
              aria-hidden="true"
            />
            <span>{copy.simulated}</span>
          </span>
        </div>
      </section>

      <p className="flex items-center gap-2 text-xs font-semibold text-bq-text"><CloudSun className="h-4 w-4" aria-hidden="true" />{weatherLabel}</p>

      {/* Banner de escenario activo cuando no es Operación Normal */}
      {featuredEvent && activeSimulation.scenarioId !== "normal" && (
        <div
          role="status"
          className="flex items-start gap-2.5 rounded-2xl bg-bq-yellow p-3.5 text-bq-navy"
        >
          <span
            aria-hidden="true"
            className="bq-icon-circle mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-bq-navy text-white"
          >
            <AlertTriangle
              className="h-3.5 w-3.5"
              strokeWidth={2.25}
              absoluteStrokeWidth
            />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-extrabold leading-snug">
              {scenario.label[activeLang] || scenario.label.es}
            </p>
            <p className="mt-0.5 text-xs leading-snug text-bq-navy/90">
              {scenario.summary[activeLang] || scenario.summary.es}
            </p>
          </div>
        </div>
      )}

      {/* Subtítulo de lista + indicador de orden */}
      <div className="flex items-center justify-between gap-2 pt-1">
        <div>
          <h3 className="text-sm font-extrabold tracking-tight text-bq-navy">
            {modeLabel}
          </h3>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-[var(--surface-muted)] px-2.5 py-1 text-[0.6875rem] font-bold text-bq-navy">
          <ArrowDownWideNarrow
            className="h-3 w-3 shrink-0"
            strokeWidth={2}
            absoluteStrokeWidth
            aria-hidden="true"
          />
          <span>{copy.occupancy}</span>
        </span>
      </div>

      {/* Lista de tarjetas de eventos */}
      {currentEvents.length ? (
        <div className="flex flex-col gap-3">
          {currentEvents.map(({ event, attendance }) => (
            <EventCard
              key={event.id}
              event={event}
              lang={activeLang}
              copy={copy}
              attendance={attendance}
              accessibleRoute={routeAccess}
              onNavigate={navigate}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-[var(--border-subtle)] bg-[var(--surface-muted)] px-4 py-10 text-center text-xs font-semibold text-bq-muted">
          {copy.noEvents}
        </div>
      )}

      {/* Nota metodológica */}
      <p className="flex items-start gap-2 px-1 text-[0.6875rem] leading-relaxed text-bq-muted">
        <Info
          className="mt-0.5 h-3.5 w-3.5 shrink-0 text-bq-navy"
          strokeWidth={2}
          absoluteStrokeWidth
          aria-hidden="true"
        />
        <span>{copy.sourceNote}</span>
      </p>
    </section>
  );
}
