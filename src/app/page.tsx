"use client";

import { useMemo, useState } from "react";
import { BQ360Provider, useBQ360 } from "@/context/BQ360Context";
import { EXPLORE_POIS, type ExploreCategory } from "@/data/explore-pois";
import CategoryPills, { type ExploreFilter } from "@/features/explore/CategoryPills";
import ExploreMap from "@/features/explore/ExploreMap";
import ExploreTab from "@/features/explore/ExploreTab";
import type { CityEvent, Currency, Lang, TabId, WeatherState } from "@/types/bq360";

const LANGS: Lang[] = ["es", "en", "pt", "fr"];
const CURRENCIES: Currency[] = ["COP", "USD", "EUR", "BRL"];
const TABS: TabId[] = ["map", "events", "explore", "assistance"];
const CATEGORIES: ExploreCategory[] = ["turismo", "cultura", "comercio", "ambiente"];

const CATEGORY_DOTS: Record<ExploreCategory, string> = {
  turismo: "bg-sky-500",
  cultura: "bg-fuchsia-500",
  comercio: "bg-amber-400",
  ambiente: "bg-emerald-600",
};

const NUMBER_LOCALES: Record<Lang, string> = {
  es: "es-CO",
  en: "en-US",
  pt: "pt-BR",
  fr: "fr-FR",
};

const DEMO_EVENTS: CityEvent[] = [
  {
    id: "metropolitano",
    mode: "mundial_2034",
    name: {
      es: "Estadio Metropolitano",
      en: "Metropolitano Stadium",
      pt: "Estádio Metropolitano",
      fr: "Stade Metropolitano",
    },
    venue: "Roberto Meléndez",
    coords: { lat: 10.9269548, lng: -74.8005111 },
    capacity: 46692,
    baseAttendance: 0.72,
    radiusMeters: 900,
    category: "deporte",
    schedule: "Mundial 2034 · 18:00",
    accessibleEntry: true,
  },
  {
    id: "malecon",
    mode: "mundial_2034",
    name: {
      es: "Fan Fest Gran Malecón",
      en: "Gran Malecón Fan Fest",
      pt: "Fan Fest Gran Malecón",
      fr: "Fan Fest Gran Malecón",
    },
    venue: "Gran Malecón del Río",
    coords: { lat: 11.0167433, lng: -74.7895621 },
    capacity: 30000,
    baseAttendance: 0.84,
    radiusMeters: 700,
    category: "fanfest",
    schedule: "Fan Fest · 15:00",
    accessibleEntry: true,
  },
  {
    id: "via40",
    mode: "mundial_2034",
    name: {
      es: "Desfile Vía 40",
      en: "Vía 40 Parade",
      pt: "Desfile da Vía 40",
      fr: "Défilé Vía 40",
    },
    venue: "Vía 40 / Barrio Abajo",
    coords: { lat: 10.9947332, lng: -74.7813389 },
    capacity: 18000,
    baseAttendance: 0.61,
    radiusMeters: 600,
    category: "cultura",
    schedule: "Desfile · 14:00",
    accessibleEntry: false,
  },
  {
    id: "romelio",
    mode: "mundial_2034",
    name: {
      es: "Fan Zone Romelio",
      en: "Romelio Fan Zone",
      pt: "Fan Zone Romelio",
      fr: "Fan Zone Romelio",
    },
    venue: "Estadio Romelio Martínez",
    coords: { lat: 10.9938074, lng: -74.807086 },
    capacity: 12000,
    baseAttendance: 0.52,
    radiusMeters: 500,
    category: "deporte",
    schedule: "Fan Zone · 16:00",
    accessibleEntry: true,
  },
];

function WeatherIcon({ condition }: { condition: WeatherState["condition"] }) {
  if (condition === "rain_arroyo") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-sky-300" aria-hidden="true">
        <path d="M7 15a4 4 0 0 1-.5-7.97A5.5 5.5 0 0 1 17 8a3.5 3.5 0 0 1 1.5 6.7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <path d="m9 18-1 3M13 18l-1 3M17 18l-1 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    );
  }
  if (condition === "cloudy") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-slate-200" aria-hidden="true">
        <path d="M7 17a4 4 0 0 1-.5-7.97A5.5 5.5 0 0 1 17 10a3.5 3.5 0 0 1 0 7H7Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      </svg>
    );
  }
  if (condition === "heat_alert") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-amber-300" aria-hidden="true">
        <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.8" />
        <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M19.1 4.9l-1.4 1.4M6.3 17.7l-1.4 1.4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-[#FACC15]" aria-hidden="true">
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M19.1 4.9l-1.4 1.4M6.3 17.7l-1.4 1.4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function TabIcon({ tab }: { tab: TabId }) {
  if (tab === "map") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
        <path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3V6Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
        <path d="M9 3v15M15 6v15" stroke="currentColor" strokeWidth="1.7" />
      </svg>
    );
  }
  if (tab === "events") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
        <rect x="3" y="5" width="18" height="16" rx="3" stroke="currentColor" strokeWidth="1.7" />
        <path d="M8 3v4M16 3v4M3 10h18" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        <path d="M8 14h3M8 17h6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      </svg>
    );
  }
  if (tab === "explore") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.7" />
        <path d="m15.5 8.5-2 5-5 2 2-5 5-2Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.7" />
      <path d="m5.6 5.6 3.2 3.2M15.2 15.2l3.2 3.2M18.4 5.6l-3.2 3.2M8.8 15.2l-3.2 3.2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

function TopBar() {
  const {
    lang,
    setLang,
    currency,
    setCurrency,
    accessibility,
    updateAccessibility,
    weather,
    t,
  } = useBQ360();

  const riskDot =
    weather.arroyoRisk === "critico"
      ? "bg-red-400"
      : weather.arroyoRisk === "moderado"
        ? "bg-amber-300"
        : "bg-emerald-300";

  return (
    <header className="sticky top-0 z-40 bg-gradient-to-br from-[#0B2545] via-[#0B2545] to-[#123A6B] text-white shadow-lg">
      <div className="px-4 pb-3 pt-[calc(env(safe-area-inset-top)+0.75rem)]">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-[#FACC15] text-xs font-black text-[#0B2545] shadow-sm">
              BQ
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-black tracking-tight">{t("app.name")}</p>
              <p className="truncate text-[9px] font-semibold uppercase tracking-[0.16em] text-sky-200">
                {t("app.tagline")}
              </p>
            </div>
          </div>

          <div
            className="flex shrink-0 items-center gap-2 rounded-2xl bg-white/10 px-2.5 py-1.5 ring-1 ring-white/15"
            title={`${t(`weather.${weather.condition}`)} · ${t(`weather.arroyo${weather.arroyoRisk === "bajo" ? "Low" : weather.arroyoRisk === "moderado" ? "Moderate" : "Critical"}`)}`}
          >
            <WeatherIcon condition={weather.condition} />
            <div className="leading-none">
              <p className="text-xs font-black">
                {weather.tempC ? `${Math.round(weather.tempC)}°C` : "—"}
              </p>
              <p className="mt-0.5 flex items-center gap-1 text-[8px] font-semibold text-sky-100">
                <span className={`h-1.5 w-1.5 rounded-full ${riskDot}`} />
                {t(`weather.${weather.condition}`)}
              </p>
            </div>
          </div>
        </div>

        <div className="-mx-1 mt-3 flex items-center gap-2 overflow-x-auto px-1 pb-0.5">
          <div className="flex shrink-0 items-center gap-0.5 rounded-full bg-white/10 p-0.5 ring-1 ring-white/10">
            {LANGS.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setLang(option)}
                aria-pressed={lang === option}
                className={`rounded-full px-2 py-1 text-[10px] font-extrabold uppercase transition ${
                  lang === option
                    ? "bg-white text-[#0B2545]"
                    : "text-sky-100 hover:bg-white/10"
                }`}
              >
                {option}
              </button>
            ))}
          </div>

          <div className="flex shrink-0 items-center gap-0.5 rounded-full bg-white/10 p-0.5 ring-1 ring-white/10">
            {CURRENCIES.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setCurrency(option)}
                aria-pressed={currency === option}
                className={`rounded-full px-2 py-1 text-[10px] font-extrabold transition ${
                  currency === option
                    ? "bg-[#FACC15] text-[#0B2545]"
                    : "text-sky-100 hover:bg-white/10"
                }`}
              >
                {option}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() =>
              updateAccessibility({
                accessibleRoute: !accessibility.accessibleRoute,
              })
            }
            aria-pressed={accessibility.accessibleRoute}
            aria-label={
              accessibility.accessibleRoute
                ? t("accessibility.active")
                : t("accessibility.inactive")
            }
            className={`flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[10px] font-extrabold transition ${
              accessibility.accessibleRoute
                ? "bg-[#15803D] text-white"
                : "bg-white/10 text-sky-100 ring-1 ring-white/10"
            }`}
          >
            <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5" aria-hidden="true">
              <circle cx="12" cy="4.5" r="1.8" stroke="currentColor" strokeWidth="1.8" />
              <path d="M6 8.5h12M12 8.5v6M12 14.5l-3 5M12 14.5l3 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {t("accessibility.label")}
          </button>
        </div>
      </div>
    </header>
  );
}

function BottomNav() {
  const { activeTab, setActiveTab, t } = useBQ360();

  return (
    <nav className="fixed bottom-0 left-1/2 z-40 w-full max-w-[480px] -translate-x-1/2 border-t border-slate-200 bg-white/95 px-2 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] pt-2 shadow-[0_-8px_30px_rgba(15,23,42,0.08)] backdrop-blur">
      <div className="grid grid-cols-4 gap-1">
        {TABS.map((tab) => {
          const active = activeTab === tab;
          return (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              aria-current={active ? "page" : undefined}
              className={`flex flex-col items-center gap-1 rounded-2xl px-1 py-1.5 text-[10px] font-extrabold transition ${
                active
                  ? "bg-[#0B2545] text-white shadow-sm"
                  : "text-slate-500 hover:bg-slate-100"
              }`}
            >
              <TabIcon tab={tab} />
              <span>{t(`nav.${tab}`)}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

function MapTab() {
  const { t, accessibility } = useBQ360();
  const [category, setCategory] = useState<ExploreFilter>("todos");
  const [onlyAccessible, setOnlyAccessible] = useState(false);
  const effectiveAccessible =
    onlyAccessible || accessibility.accessibleRoute;

  const baseFiltered = useMemo(
    () =>
      EXPLORE_POIS.filter(
        (poi) => !effectiveAccessible || poi.accessible === true
      ),
    [effectiveAccessible]
  );

  const counts = useMemo<Record<ExploreFilter, number>>(() => {
    const result: Record<ExploreFilter, number> = {
      todos: baseFiltered.length,
      turismo: 0,
      cultura: 0,
      comercio: 0,
      ambiente: 0,
    };
    for (const poi of baseFiltered) {
      result[poi.category] += 1;
    }
    return result;
  }, [baseFiltered]);

  const filtered = useMemo(
    () =>
      category === "todos"
        ? baseFiltered
        : baseFiltered.filter((poi) => poi.category === category),
    [baseFiltered, category]
  );

  const resetFilters = () => {
    setCategory("todos");
    setOnlyAccessible(false);
  };

  return (
    <div className="px-4 pb-6 pt-4">
      <header>
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#15803D]">
              {t("app.city")} · {t("app.year")}
            </p>
            <h1 className="mt-1 text-2xl font-black leading-tight text-[#0B2545]">
              {t("map.title")}
            </h1>
            <p className="mt-1 text-xs leading-relaxed text-slate-500">
              {t("map.subtitle")}
            </p>
          </div>
          <span className="shrink-0 rounded-2xl bg-[#0B2545] px-3 py-2 text-center text-[10px] font-bold text-white shadow-sm">
            <span className="block text-base font-black text-[#FACC15]">
              {filtered.length}
            </span>
            {t("map.pois")}
          </span>
        </div>
      </header>

      <div className="mt-4">
        <p className="mb-2 text-[10px] font-extrabold uppercase tracking-wide text-slate-500">
          {t("explore.filters")}
        </p>
        <CategoryPills value={category} onChange={setCategory} counts={counts} />
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setOnlyAccessible((previous) => !previous)}
          aria-pressed={effectiveAccessible}
          className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-[11px] font-extrabold transition active:scale-95 ${
            effectiveAccessible
              ? "border-[#15803D] bg-[#15803D] text-white"
              : "border-slate-200 bg-white text-slate-600"
          }`}
        >
          <span
            className={`flex h-4 w-4 items-center justify-center rounded-full ${
              effectiveAccessible ? "bg-white/20" : "bg-slate-100"
            }`}
          >
            <svg viewBox="0 0 24 24" fill="none" className="h-3 w-3" aria-hidden="true">
              <path d="m5 13 4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          {t("explore.onlyAccessible")}
        </button>
        {category !== "todos" || onlyAccessible ? (
          <button
            type="button"
            onClick={resetFilters}
            className="text-[10px] font-extrabold text-[#15803D] underline-offset-2 hover:underline"
          >
            {t("explore.reset")}
          </button>
        ) : null}
      </div>

      {accessibility.accessibleRoute ? (
        <p className="mt-2 rounded-xl bg-emerald-50 px-3 py-2 text-[10px] font-semibold text-emerald-800 ring-1 ring-emerald-100">
          {t("explore.accessibleActive")}
        </p>
      ) : null}

      <div className="mt-3">
        <ExploreMap pois={filtered} height={500} />
      </div>

      {filtered.length === 0 ? (
        <p className="mt-3 rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-3 text-center text-[11px] font-semibold text-slate-500">
          {t("map.noPoints")}
        </p>
      ) : null}

      <div className="mt-3 rounded-2xl border border-slate-200 bg-white px-3 py-2.5 shadow-sm">
        <p className="text-[10px] font-extrabold uppercase tracking-wide text-slate-500">
          {t("map.legend")}
        </p>
        <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1.5">
          {CATEGORIES.map((item) => (
            <span
              key={item}
              className="inline-flex items-center gap-1.5 text-[10px] font-bold text-slate-600"
            >
              <span className={`h-2.5 w-2.5 rounded-full ${CATEGORY_DOTS[item]}`} />
              {t(`explore.category.${item}`)}
            </span>
          ))}
        </div>
        <p className="mt-2 text-[10px] leading-relaxed text-slate-400">
          {t("explore.mapHint")}
        </p>
      </div>

      <p className="mt-4 text-center text-[10px] leading-relaxed text-slate-400">
        {t("footer.note")}
      </p>
    </div>
  );
}

function EventsTab() {
  const { t, lang, navigateToRoute } = useBQ360();
  const [intensity, setIntensity] = useState(35);

  return (
    <div className="px-4 pb-6 pt-4">
      <header>
        <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#15803D]">
          {t("nav.events")}
        </p>
        <div className="mt-1 flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-black leading-tight text-[#0B2545]">
              {t("events.title")}
            </h1>
            <p className="mt-1 text-xs leading-relaxed text-slate-500">
              {t("events.subtitle")}
            </p>
          </div>
          <span className="shrink-0 rounded-full bg-amber-100 px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-wide text-amber-800">
            {t("events.simulated")}
          </span>
        </div>
      </header>

      <section className="mt-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-extrabold text-[#0B2545]">
            {t("events.intensity")}
          </p>
          <span className="rounded-full bg-[#0B2545] px-2.5 py-1 text-[10px] font-extrabold text-[#FACC15]">
            {intensity}%
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          value={intensity}
          onChange={(event) => setIntensity(Number(event.target.value))}
          aria-label={t("events.intensity")}
          className="mt-3 w-full accent-[#15803D]"
        />
        <p className="mt-2 text-[10px] leading-relaxed text-slate-400">
          {t("events.demoNote")}
        </p>
      </section>

      <div className="mt-4 space-y-3">
        {DEMO_EVENTS.map((event) => {
          const occupancy = Math.min(
            0.99,
            event.baseAttendance + (intensity / 100) * 0.35
          );
          const percent = Math.round(occupancy * 100);
          const level =
            percent >= 85 ? "high" : percent >= 65 ? "medium" : "low";
          const tone =
            level === "high"
              ? {
                  text: "text-red-600",
                  badge: "bg-red-50 text-red-700 ring-1 ring-red-100",
                  bar: "bg-red-500",
                }
              : level === "medium"
                ? {
                    text: "text-amber-600",
                    badge: "bg-amber-50 text-amber-800 ring-1 ring-amber-100",
                    bar: "bg-amber-400",
                  }
                : {
                    text: "text-emerald-700",
                    badge: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100",
                    bar: "bg-emerald-500",
                  };

          return (
            <article
              key={event.id}
              className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className={`text-[10px] font-extrabold uppercase tracking-wide ${tone.text}`}>
                    {t(`events.category.${event.category}`)}
                  </p>
                  <h2 className="mt-0.5 text-sm font-black leading-tight text-[#0B2545]">
                    {event.name[lang] || event.name.es}
                  </h2>
                  <p className="mt-0.5 text-[11px] text-slate-500">
                    {event.venue} · {event.schedule}
                  </p>
                </div>
                <span className={`shrink-0 rounded-full px-2.5 py-1 text-[9px] font-extrabold uppercase ${tone.badge}`}>
                  {t(`events.level.${level}`)}
                </span>
              </div>

              <div className="mt-3">
                <div className="flex items-center justify-between text-[10px] font-bold text-slate-500">
                  <span>{t("events.occupancy")}</span>
                  <span>{percent}%</span>
                </div>
                <div className="mt-1 h-2.5 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${tone.bar}`}
                    style={{ width: `${percent}%` }}
                  />
                </div>
                <div className="mt-1 flex flex-wrap items-center justify-between gap-1 text-[10px] text-slate-400">
                  <span>
                    {Math.round(event.capacity * occupancy).toLocaleString(
                      NUMBER_LOCALES[lang]
                    )}{" "}
                    / {event.capacity.toLocaleString(NUMBER_LOCALES[lang])}{" "}
                    {t("events.people")}
                  </span>
                  {event.accessibleEntry ? (
                    <span className="font-bold text-emerald-700">
                      {t("events.accessible")}
                    </span>
                  ) : null}
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  navigateToRoute({
                    ...event.coords,
                    label: event.name[lang] || event.name.es,
                  })
                }
                className="mt-3 w-full rounded-xl bg-[#0B2545] px-3 py-2.5 text-[11px] font-extrabold text-white shadow-sm transition hover:bg-[#123A6B] active:scale-[0.99]"
              >
                {t("events.go")}
              </button>
            </article>
          );
        })}
      </div>

      <p className="mt-4 text-center text-[10px] leading-relaxed text-slate-400">
        {t("footer.note")}
      </p>
    </div>
  );
}

function AssistanceTab() {
  const {
    t,
    accessibility,
    updateAccessibility,
    formatPrice,
    currency,
  } = useBQ360();
  const [copAmount, setCopAmount] = useState("10000");
  const parsedAmount = copAmount.trim() === "" ? Number.NaN : Number(copAmount);
  const validAmount =
    Number.isFinite(parsedAmount) && parsedAmount >= 0;

  const emergencyLines = [
    {
      number: "123",
      title: t("assistance.emergency"),
      hint: t("assistance.emergencyHint"),
      tone: "bg-red-50 text-red-700 ring-red-100",
    },
    {
      number: "125",
      title: t("assistance.health"),
      hint: t("assistance.healthHint"),
      tone: "bg-sky-50 text-sky-700 ring-sky-100",
    },
    {
      number: "119",
      title: t("assistance.fire"),
      hint: t("assistance.fireHint"),
      tone: "bg-amber-50 text-amber-800 ring-amber-100",
    },
  ];

  return (
    <div className="px-4 pb-6 pt-4">
      <header>
        <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#15803D]">
          {t("nav.assistance")}
        </p>
        <h1 className="mt-1 text-2xl font-black leading-tight text-[#0B2545]">
          {t("assistance.title")}
        </h1>
        <p className="mt-1 text-xs leading-relaxed text-slate-500">
          {t("assistance.subtitle")}
        </p>
      </header>

      <section className="mt-4 space-y-2">
        {emergencyLines.map((line) => (
          <a
            key={line.number}
            href={`tel:${line.number}`}
            className={`flex items-center gap-3 rounded-2xl px-3 py-3 ring-1 transition active:scale-[0.99] ${line.tone}`}
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/70 text-sm font-black">
              {line.number}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-xs font-extrabold">{line.title}</span>
              <span className="block text-[10px] font-medium opacity-80">
                {line.hint}
              </span>
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase">
              <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5" aria-hidden="true">
                <path d="M7 4h3l1.5 4.5-2 1.5a12 12 0 0 0 4.5 4.5l1.5-2L20 14v3a3 3 0 0 1-3 3A14 14 0 0 1 4 7a3 3 0 0 1 3-3Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
              </svg>
              {t("assistance.call")}
            </span>
          </a>
        ))}
        <p className="px-1 text-[10px] leading-relaxed text-slate-400">
          {t("assistance.emergencyNote")}
        </p>
      </section>

      <section className="mt-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-black text-[#0B2545]">
          {t("assistance.currencyTitle")}
        </h2>
        <p className="mt-1 text-[11px] leading-relaxed text-slate-500">
          {t("assistance.currencyHint")}
        </p>
        <label className="mt-3 block">
          <span className="text-[10px] font-extrabold uppercase tracking-wide text-slate-500">
            {t("assistance.amountCop")}
          </span>
          <input
            type="number"
            min="0"
            step="500"
            inputMode="decimal"
            value={copAmount}
            onChange={(event) => setCopAmount(event.target.value)}
            className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-bold text-[#0B2545] outline-none ring-[#15803D]/30 focus:border-[#15803D] focus:ring-4"
          />
        </label>
        <div className="mt-2 flex flex-wrap gap-2">
          {[5000, 10000, 20000, 50000].map((amount) => (
            <button
              key={amount}
              type="button"
              onClick={() => setCopAmount(String(amount))}
              className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[10px] font-extrabold text-slate-600 transition hover:border-[#15803D] hover:text-[#15803D] active:scale-95"
            >
              {formatPrice(amount)}
            </button>
          ))}
        </div>
        <div className="mt-3 rounded-2xl bg-[#0B2545] px-3 py-3 text-white">
          <p className="text-[9px] font-extrabold uppercase tracking-wide text-sky-200">
            {t("assistance.convertedTo")} {currency}
          </p>
          <p className="mt-0.5 text-xl font-black text-[#FACC15]" aria-live="polite">
            {validAmount ? formatPrice(parsedAmount) : "—"}
          </p>
        </div>
      </section>

      <section className="mt-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-black text-[#0B2545]">
          {t("assistance.accessibilityTitle")}
        </h2>
        <p className="mt-1 text-[11px] leading-relaxed text-slate-500">
          {t("assistance.accessibilityHint")}
        </p>
        <button
          type="button"
          onClick={() =>
            updateAccessibility({
              accessibleRoute: !accessibility.accessibleRoute,
            })
          }
          aria-pressed={accessibility.accessibleRoute}
          className={`mt-3 flex w-full items-center justify-between gap-3 rounded-2xl px-3 py-3 text-left transition active:scale-[0.99] ${
            accessibility.accessibleRoute
              ? "bg-[#15803D] text-white"
              : "bg-slate-100 text-slate-700"
          }`}
        >
          <span>
            <span className="block text-xs font-extrabold">
              {t("accessibility.label")}
            </span>
            <span className="block text-[10px] opacity-80">
              {accessibility.accessibleRoute
                ? t("accessibility.active")
                : t("accessibility.inactive")}
            </span>
          </span>
          <span
            className={`flex h-6 w-6 items-center justify-center rounded-full ${
              accessibility.accessibleRoute ? "bg-white/20" : "bg-white"
            }`}
          >
            <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
              <path d="m5 13 4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </button>
      </section>

      <p className="mt-4 text-center text-[10px] leading-relaxed text-slate-400">
        {t("footer.note")}
      </p>
    </div>
  );
}

function AppShell() {
  const { activeTab } = useBQ360();

  return (
    <div className="min-h-dvh bg-slate-200">
      <div className="relative mx-auto min-h-dvh w-full max-w-[480px] bg-[#F5F7FB] shadow-2xl">
        <TopBar />
        <main className="pb-28">
          {activeTab === "explore" ? <ExploreTab /> : null}
          {activeTab === "map" ? <MapTab /> : null}
          {activeTab === "events" ? <EventsTab /> : null}
          {activeTab === "assistance" ? <AssistanceTab /> : null}
        </main>
        <BottomNav />
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <BQ360Provider>
      <AppShell />
    </BQ360Provider>
  );
}
