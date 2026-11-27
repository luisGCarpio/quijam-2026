"use client";

import { useMemo } from "react";
import { CITY_EVENTS, type AppMode, type EventInfo, type EventsLang } from "@/data/events";
import { getScenario, type ScenarioId } from "@/data/scenarios";
import { getEventsCopy } from "@/i18n/events";
import { EventCard } from "./EventCard";
import styles from "./events.module.css";

export type EventsSimulation = {
  mode: AppMode;
  scenarioId: ScenarioId;
  crowdMultiplier: number;
  weatherOverride: "heat_alert" | "rain_arroyo" | null;
};

export type EventWeather = {
  condition: "sunny" | "cloudy" | "heat_alert" | "rain_arroyo";
  tempC?: number;
  arroyoRisk?: "bajo" | "moderado" | "critico";
};

export type EventsTabProps = {
  simulation?: EventsSimulation;
  weather?: EventWeather;
  lang?: EventsLang;
  accessibleRoute?: boolean;
  events?: EventInfo[];
  onNavigate?: (destination: { lat: number; lng: number; label: string }) => void;
};

const defaultSimulation: EventsSimulation = {
  mode: "mundial_2034",
  scenarioId: "normal",
  crowdMultiplier: 0.8,
  weatherOverride: null,
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
  simulation = defaultSimulation,
  weather = { condition: "sunny", arroyoRisk: "bajo" },
  lang = "es",
  accessibleRoute = false,
  events = CITY_EVENTS,
  onNavigate,
}: EventsTabProps) {
  const copy = getEventsCopy(lang);
  const scenario = getScenario(simulation.scenarioId);
  const currentEvents = useMemo(
    () => events.filter((event) => event.mode === simulation.mode).map((event) => ({
      event,
      attendance: estimateAttendance(event, simulation),
    })).sort((a, b) => b.attendance / b.event.capacity - a.attendance / a.event.capacity),
    [events, simulation],
  );

  const totalAttendance = currentEvents.reduce((sum, item) => sum + item.attendance, 0);
  const totalCapacity = currentEvents.reduce((sum, item) => sum + item.event.capacity, 0);
  const occupancy = totalCapacity ? Math.round((totalAttendance / totalCapacity) * 100) : 0;
  const modeLabel = simulation.mode === "mundial_2034" ? copy.world : copy.legacy;
  const weatherLabel = getWeatherLabel({
    ...weather,
    condition: simulation.weatherOverride ?? weather.condition,
    arroyoRisk: simulation.weatherOverride === "rain_arroyo" ? "critico" : weather.arroyoRisk,
  }, copy);
  const featuredEvent = currentEvents.find(({ event }) => event.id === scenario.featuredEventId)?.event;

  return (
    <section className={styles.page} aria-labelledby="events-title">
      <div className={styles.container}>
        <header className={styles.header}>
          <div>
            <div className={styles.eyebrow}><span aria-hidden="true">◉</span>{copy.eyebrow}</div>
            <h1 id="events-title" className={styles.title}>{copy.title}</h1>
            <p className={styles.intro}>{copy.intro}</p>
          </div>
          <div className={`${styles.modeBadge} ${simulation.mode === "legado" ? styles.modeBadgeLegacy : ""}`}>
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
              <span>{totalAttendance.toLocaleString(lang === "es" ? "es-CO" : lang === "pt" ? "pt-BR" : lang === "fr" ? "fr-FR" : "en-US")} {copy.people}</span>
              <span>{currentEvents.length} {copy.activeEvents}</span>
            </div>
          </div>
          <div className={styles.summarySide}>
            <span className={styles.simulatedTag}><span aria-hidden="true">◷</span>{copy.simulated}</span>
            <span className={styles.scenarioNow}>{scenario.name[lang] || scenario.name.es}</span>
          </div>
        </section>

        {featuredEvent && simulation.scenarioId !== "normal" && (
          <div className={styles.scenarioBanner}>
            <span className={styles.bannerIcon} aria-hidden="true">⚑</span>
            <div><strong>{scenario.name[lang] || scenario.name.es}</strong><span>{scenario.description[lang] || scenario.description.es}</span></div>
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
                lang={lang}
                copy={copy}
                attendance={attendance}
                weatherLabel={weatherLabel}
                accessibleRoute={accessibleRoute}
                onNavigate={onNavigate}
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
