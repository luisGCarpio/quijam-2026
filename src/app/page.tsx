"use client";

import { BQ360Provider, useBQ360 } from "@/context/BQ360Context";
import { EXPLORE_POIS, type ExploreCategory } from "@/data/explore-pois";
import ExploreMap from "@/features/explore/ExploreMap";
import ExploreTab from "@/features/explore/ExploreTab";
import type { Currency, Lang, TabId, WeatherState } from "@/types/bq360";

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
  const { t } = useBQ360();
  const counts = CATEGORIES.map((category) => ({
    category,
    count: EXPLORE_POIS.filter((poi) => poi.category === category).length,
  }));

  return (
    <div className="px-4 pb-6 pt-4">
      <header>
        <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#15803D]">
          {t("app.city")} · {t("app.year")}
        </p>
        <h1 className="mt-1 text-2xl font-black leading-tight text-[#0B2545]">
          {t("map.title")}
        </h1>
        <p className="mt-1 text-xs leading-relaxed text-slate-500">
          {t("map.subtitle")}
        </p>
      </header>

      <div className="mt-3">
        <ExploreMap pois={EXPLORE_POIS} height={500} />
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        {counts.map(({ category, count }) => (
          <div
            key={category}
            className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-sm"
          >
            <span className="flex items-center gap-2 text-[11px] font-bold text-slate-600">
              <span className={`h-2.5 w-2.5 rounded-full ${CATEGORY_DOTS[category]}`} />
              {t(`explore.category.${category}`)}
            </span>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-extrabold text-slate-500">
              {count}
            </span>
          </div>
        ))}
      </div>

      <p className="mt-4 text-center text-[10px] leading-relaxed text-slate-400">
        {t("footer.note")}
      </p>
    </div>
  );
}

function PlaceholderTab({ tab }: { tab: "events" | "assistance" }) {
  const { t } = useBQ360();
  return (
    <div className="flex min-h-[62dvh] flex-col items-center justify-center px-8 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-white text-[#0B2545] shadow-sm ring-1 ring-slate-200">
        <TabIcon tab={tab} />
      </div>
      <h1 className="mt-4 text-xl font-black text-[#0B2545]">{t(`nav.${tab}`)}</h1>
      <p className="mt-1 text-xs font-extrabold uppercase tracking-wide text-[#15803D]">
        {t("common.comingSoon")}
      </p>
      <p className="mt-2 max-w-xs text-xs leading-relaxed text-slate-500">
        {t("common.modulePending")}
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
          {activeTab === "events" ? <PlaceholderTab tab="events" /> : null}
          {activeTab === "assistance" ? <PlaceholderTab tab="assistance" /> : null}
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
