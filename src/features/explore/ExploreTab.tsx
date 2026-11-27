"use client";

import { useEffect, useMemo, useState } from "react";
import { useBQ360 } from "@/context/BQ360Context";
import { EXPLORE_POIS, type ExploreCategory } from "@/data/explore-pois";
import CategoryPills, { type ExploreFilter } from "./CategoryPills";
import ExploreCard from "./ExploreCard";
import ExploreMap from "./ExploreMap";

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white">
      <div className="h-28 animate-pulse bg-slate-200" />
      <div className="space-y-3 p-4">
        <div className="h-4 w-2/3 animate-pulse rounded-full bg-slate-200" />
        <div className="h-3 w-full animate-pulse rounded-full bg-slate-100" />
        <div className="h-3 w-5/6 animate-pulse rounded-full bg-slate-100" />
        <div className="h-9 w-full animate-pulse rounded-2xl bg-slate-100" />
      </div>
    </div>
  );
}

export default function ExploreTab() {
  const { weather, accessibility, setActiveTab, t, exploreSession, setExploreSession } = useBQ360();
  const { query, onlyAccessible, localEconomy, view } = exploreSession;
  const category = exploreSession.category as ExploreFilter;
  const setQuery = (value: string) => setExploreSession((previous) => ({ ...previous, query: value }));
  const setCategory = (value: ExploreFilter) => setExploreSession((previous) => ({ ...previous, category: value }));
  const setOnlyAccessible = (value: boolean) => setExploreSession((previous) => ({ ...previous, onlyAccessible: value }));
  const setLocalEconomy = (value: boolean) => setExploreSession((previous) => ({ ...previous, localEconomy: value }));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 280);
    return () => window.clearTimeout(timer);
  }, []);

  const effectiveAccessible =
    onlyAccessible || accessibility.accessibleRoute;

  const baseFiltered = useMemo(() => {
    const normalizedQuery = normalize(query);
    return EXPLORE_POIS.filter((poi) => {
      if (effectiveAccessible && poi.accessible !== true) return false;
      if (localEconomy && !poi.isPopularEconomy) return false;
      if (!normalizedQuery) return true;

      const haystack = [
        ...Object.values(poi.name),
        ...Object.values(poi.description),
        poi.address,
        poi.category,
        t(`explore.category.${poi.category}`),
        ...(poi.tags ?? []).map((tag) => t(`explore.tags.${tag}`)),
        ...poi.accessibilityTags.map((tag) => t(`explore.tags.${tag}`)),
        ...poi.sustainabilityTags.map((tag) => t(`explore.tags.${tag}`)),
      ].join(" ");

      return normalize(haystack).includes(normalizedQuery);
    });
  }, [query, effectiveAccessible, localEconomy, t]);

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
    setQuery("");
    setCategory("todos");
    setOnlyAccessible(false);
    setLocalEconomy(false);
  };

  const showHeat = weather.condition === "heat_alert";
  const showRain = weather.condition === "rain_arroyo";
  const resultLabel =
    filtered.length === 1 ? t("explore.resultsOne") : t("explore.results");

  return (
    <div className="space-y-4 px-4 pb-6 pt-4">
      <header>
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-bq-green">
              {t("nav.explore")}
            </p>
            <h1 className="mt-1 text-2xl font-black leading-tight text-bq-navy">
              {t("explore.title")}
            </h1>
            <p className="mt-1 text-xs leading-relaxed text-slate-500">
              {t("explore.subtitle")}
            </p>
          </div>
          <span className="shrink-0 rounded-2xl bg-bq-navy px-3 py-2 text-center text-[10px] font-bold text-white shadow-sm">
            <span className="block text-base font-black text-bq-yellow">
              {EXPLORE_POIS.length}
            </span>
            {t("map.pois")}
          </span>
        </div>
      </header>

      {showHeat || showRain ? (
        <section className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-3 text-bq-text" aria-label={t(showHeat ? "explore.weather.heatTitle" : "explore.weather.rainTitle")}>
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <h2 className="text-sm font-extrabold text-bq-navy">{t(showHeat ? "explore.weather.heatTitle" : "explore.weather.rainTitle")}</h2>
            {showHeat && weather.tempC != null ? <span className="text-sm font-bold">{Math.round(weather.tempC)}°C</span> : null}
            {showRain && weather.arroyoRisk ? <span className="text-xs font-bold">{t(weather.arroyoRisk === "critico" ? "weather.arroyoCritical" : weather.arroyoRisk === "moderado" ? "weather.arroyoModerate" : "weather.arroyoLow")}</span> : null}
            {weather.isOverridden ? <span className="text-xs font-bold">Demo</span> : null}
          </div>
          <p className="mt-1 text-xs leading-snug">{t(showHeat ? "explore.weather.heatBody" : "explore.weather.rainBody")}</p>
          <button type="button" onClick={() => {
            setCategory("ambiente");
            setQuery("");
            setOnlyAccessible(false);
            setLocalEconomy(false);
          }} className="min-h-11 text-left text-xs font-extrabold text-bq-green underline underline-offset-2">
            {t(showHeat ? "explore.weather.heatCta" : "explore.weather.rainCta")}
          </button>
        </section>
      ) : null}

      <label className="relative block">
        <span className="sr-only">{t("explore.searchLabel")}</span>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="6" stroke="currentColor" strokeWidth="1.8" />
          <path d="m16 16 4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t("explore.searchPlaceholder")}
          className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-10 text-sm font-medium text-bq-navy shadow-sm outline-none ring-bq-green/30 placeholder:text-slate-400 focus:border-bq-green focus:ring-4"
        />
        {query ? (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="absolute right-3 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-500"
            aria-label={t("common.clear")}
          >
            ×
          </button>
        ) : null}
      </label>

      <CategoryPills value={category} onChange={setCategory} counts={counts} />

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setOnlyAccessible(!onlyAccessible)}
          aria-pressed={effectiveAccessible}
          className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-[11px] font-extrabold transition active:scale-95 ${
            effectiveAccessible
              ? "border-bq-green bg-bq-green text-white"
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
        <button
          type="button"
          onClick={() => setLocalEconomy(!localEconomy)}
          aria-pressed={localEconomy}
          className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-[11px] font-extrabold transition active:scale-95 ${
            localEconomy
              ? "border-amber-500 bg-amber-400 text-bq-navy"
              : "border-slate-200 bg-white text-slate-600"
          }`}
        >
          <span
            className={`flex h-4 w-4 items-center justify-center rounded-full ${
              localEconomy ? "bg-bq-navy/15" : "bg-slate-100"
            }`}
          >
            <svg viewBox="0 0 24 24" fill="none" className="h-3 w-3" aria-hidden="true">
              <path d="M12 3v18M17 7.5c0-1.4-2.2-2.5-5-2.5S7 6.1 7 7.5 9.2 10 12 10s5 1.1 5 2.5S14.8 15 12 15s-5 1.1-5 2.5S9.2 20 12 20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </span>
          {t("explore.localEconomy")}
        </button>
      </div>

      {accessibility.accessibleRoute ? (
        <p className="rounded-xl bg-emerald-50 px-3 py-2 text-[10px] font-semibold text-emerald-800 ring-1 ring-emerald-100">
          {t("explore.accessibleActive")}
        </p>
      ) : null}

      <div role="group" aria-label={t("explore.viewLabel")} className="flex rounded-xl bg-[var(--surface-muted)] p-1">
        {(["list", "map"] as const).map((option) => <button key={option} type="button" aria-pressed={view === option} onClick={() => setExploreSession((previous) => ({ ...previous, view: option }))} className={`min-h-11 flex-1 rounded-lg px-3 text-sm font-bold ${view === option ? "bg-[var(--surface-card)] text-bq-navy shadow-sm" : "text-bq-muted"}`}>{t(option === "list" ? "explore.viewList" : "explore.viewMap")}</button>)}
      </div>

      {view === "map" ? (
      <section>
        <div className="flex items-end justify-between gap-3">
          <div>
            <h2 className="text-xs font-extrabold uppercase tracking-wide text-slate-500">
              {t("explore.mapTitle")}
            </h2>
            <p className="mt-0.5 text-[10px] text-slate-400">{t("explore.mapHint")}</p>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2">
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-500">{filtered.length} {t("explore.mapCount")}</span>
            {(query || category !== "todos" || onlyAccessible || localEconomy) ? <button type="button" onClick={resetFilters} className="min-h-11 text-xs font-bold text-bq-green underline">{t("explore.reset")}</button> : null}
          </div>
        </div>
        <div className="mt-2">
          <ExploreMap pois={filtered} height={230} compact />
        </div>
        <button
          type="button"
          onClick={() => setActiveTab("map")}
          className="mt-2 w-full rounded-xl bg-bq-navy px-3 py-2.5 text-[11px] font-extrabold text-white shadow-sm transition hover:bg-bq-navy/90 active:scale-[0.99]"
        >
          {t("map.openFullMap")}
        </button>
      </section>

      ) : (
      <section aria-busy={loading}>
        <div className="flex items-end justify-between gap-3" aria-live="polite">
          <div>
            <h2 className="text-sm font-extrabold text-bq-navy">
              {category === "todos"
                ? t("explore.all")
                : t(`explore.category.${category as ExploreCategory}`)}
            </h2>
            <p className="text-[11px] text-slate-500">
              {filtered.length} {resultLabel}
            </p>
          </div>
          {(query || category !== "todos" || onlyAccessible || localEconomy) ? (
            <button
              type="button"
              onClick={resetFilters}
              className="text-[10px] font-extrabold text-bq-green underline-offset-2 hover:underline"
            >
              {t("explore.reset")}
            </button>
          ) : null}
        </div>

        {loading ? (
          <div className="mt-3 space-y-3">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : filtered.length === 0 ? (
          <div className="mt-3 rounded-3xl border border-dashed border-slate-300 bg-white px-5 py-8 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden="true">
                <circle cx="11" cy="11" r="6" stroke="currentColor" strokeWidth="1.8" />
                <path d="m16 16 4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </div>
            <h3 className="mt-3 text-sm font-extrabold text-bq-navy">
              {t("explore.noResults")}
            </h3>
            <p className="mt-1 text-xs text-slate-500">{t("explore.noResultsHint")}</p>
            <button
              type="button"
              onClick={resetFilters}
              className="mt-4 rounded-xl bg-bq-navy px-4 py-2 text-xs font-extrabold text-white active:scale-95"
            >
              {t("explore.reset")}
            </button>
          </div>
        ) : (
          <div className="mt-3 space-y-3">
            {filtered.map((poi) => (
              <ExploreCard key={poi.id} poi={poi} />
            ))}
          </div>
        )}
      </section>

      )}

      <p className="pt-1 text-center text-[10px] leading-relaxed text-slate-400">
        {t("footer.note")}
      </p>
    </div>
  );
}
