"use client";

import { useMemo } from "react";
import { CITY_EVENTS, type EventInfo, type EventsLang } from "@/data/events";
import { FEATURED_EVENT_IDS, getScenario } from "@/data/scenarios";
import { getEventsCopy } from "@/i18n/events";
import { useBQ360 } from "@/context/BQ360Context";
import type { BQ360ContextValue, SimulationState, WeatherState } from "@/types/bq360";
import { EventCard } from "./EventCard";
import styles from "./events.module.css";

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

function getWeatherLabel(weather: EventWeather, copy: ReturnType<typeof getEventsCopy>) {
  if (weather.condition === "heat_alert") return copy.weatherHeat;
  if (weather.condition === "rain_arroyo") {
    const risk = weather.arroyoRisk ?? "critico";
    const riskLabel = risk === "critico" ? copy.arroyoCritical : risk === "moderado" ? copy.arroyoModerate : copy.arroyoLow;
    return `${copy.weatherRain} · ${riskLabel}`;
  }
  return weather.condition === "cloudy" ? copy.weatherCloudy : copy.weatherSunny;
}

function estimateAttendance(event: EventInfo, simulation: EventsSimulation) {
  const projected = Math.round(event.baseAttendance * simulation.crowdMultiplier);
  return Math.max(0, Math.min(projected, Math.round(event.capacity * 1.1)));
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
  const eventData = events ?? CITY_EVENTS;
  const navigate = onNavigate ?? context.navigateToRoute;
  const copy = getEventsCopy(activeLang);
  const scenario = getScenario(activeSimulation.scenarioId);
  const currentEvents = useMemo(
    () => eventData.filter((event) => event.mode === activeSimulation.mode).map((event) => ({
      event,
      attendance: estimateAttendance(event, activeSimulation),
    })).sort((a, b) => b.attendance / b.event.capacity - a.attendance / a.event.capacity),
    [eventData, activeSimulation],
  );

  const totalAttendance = currentEvents.reduce((sum, item) => sum + item.attendance, 0);
  const totalCapacity = currentEvents.reduce((sum, item) => sum + item.event.capacity, 0);
  const occupancy = totalCapacity ? Math.round((totalAttendance / totalCapacity) * 100) : 0;
  const modeLabel = activeSimulation.mode === "mundial_2034" ? copy.world : copy.legacy;
  const weatherLabel = getWeatherLabel({
    ...currentWeather,
    condition: activeSimulation.weatherOverride ?? currentWeather.condition,
    arroyoRisk: activeSimulation.weatherOverride === "rain_arroyo" ? "critico" : currentWeather.arroyoRisk,
  }, copy);
  const featuredEventId = FEATURED_EVENT_IDS[scenario.id];
  const featuredEvent = currentEvents.find(({ event }) => event.id === featuredEventId)?.event;

  return (
    <section className={styles.page} aria-labelledby="events-title">
      <div className={styles.container}>
        <header className={styles.header}>
          <div>
            <div className={styles.eyebrow}><span aria-hidden="true">◉</span>{copy.eyebrow}</div>
            <h1 id="events-title" className={styles.title}>{copy.title}</h1>
            <p className={styles.intro}>{copy.intro}</p>
          </div>
          <div className={`${styles.modeBadge} ${activeSimulation.mode === "legado" ? styles.modeBadgeLegacy : ""}`}>
            <span className={styles.modeDot} />{modeLabel}
          </div>
        </header>

        <section className={styles.summary} aria-label={copy.cityStatus} aria-live="polite">
          <div className={styles.summaryMain}>
            <div className={styles.summaryIcon} aria-hidden="true">◉</div>
            <div>
              <p>{copy.cityStatus}</p>
              <strong>{occupancy}<small>%</small></strong>
            </div>
            <div className={styles.summaryMeta}>
              <span>{totalAttendance.toLocaleString(activeLang === "es" ? "es-CO" : activeLang === "pt" ? "pt-BR" : activeLang === "fr" ? "fr-FR" : "en-US")} {copy.people}</span>
              <span>{currentEvents.length} {copy.activeEvents}</span>
            </div>
          </div>
          <div className={styles.summarySide}>
            <span className={styles.simulatedTag}><span aria-hidden="true">◷</span>{copy.simulated}</span>
            <span className={styles.scenarioNow}>{scenario.label[activeLang] || scenario.label.es}</span>
          </div>
        </section>

        {featuredEvent && activeSimulation.scenarioId !== "normal" && (
          <div className={styles.scenarioBanner}>
            <span className={styles.bannerIcon} aria-hidden="true">⚑</span>
            <div><strong>{scenario.label[activeLang] || scenario.label.es}</strong><span>{scenario.summary[activeLang] || scenario.summary.es}</span></div>
            <span className={styles.bannerArrow} aria-hidden="true">→</span>
          </div>
        )}

        <div className={styles.listHeading}>
          <div><h2>{modeLabel}</h2><p>{currentEvents.length} {currentEvents.length === 1 ? copy.eventLabel : copy.eventLabelPlural}</p></div>
          <span className={styles.sortHint}>{copy.occupancy} ↓</span>
        </div>

        {currentEvents.length ? (
          <div className={styles.eventGrid}>
            {currentEvents.map(({ event, attendance }) => (
              <EventCard
                key={event.id}
                event={event}
                lang={activeLang}
                copy={copy}
                attendance={attendance}
                weatherLabel={weatherLabel}
                accessibleRoute={routeAccess}
                onNavigate={navigate}
              />
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>{copy.noEvents}</div>
        )}

        <p className={styles.disclaimer}><span aria-hidden="true">i</span>{copy.sourceNote}</p>
      </div>
    </section>
  );
}
