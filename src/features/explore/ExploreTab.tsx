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
  const { weather, accessibility, setActiveTab, t } = useBQ360();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<ExploreFilter>("todos");
  const [onlyAccessible, setOnlyAccessible] = useState(false);
  const [localEconomy, setLocalEconomy] = useState(false);
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
            <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#15803D]">
              {t("nav.explore")}
            </p>
            <h1 className="mt-1 text-2xl font-black leading-tight text-[#0B2545]">
              {t("explore.title")}
            </h1>
            <p className="mt-1 text-xs leading-relaxed text-slate-500">
              {t("explore.subtitle")}
            </p>
          </div>
          <span className="shrink-0 rounded-2xl bg-[#0B2545] px-3 py-2 text-center text-[10px] font-bold text-white shadow-sm">
            <span className="block text-base font-black text-[#FACC15]">
              {EXPLORE_POIS.length}
            </span>
            {t("map.pois")}
          </span>
        </div>
      </header>

      {showHeat ? (
        <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-amber-400 to-orange-500 p-4 text-[#0B2545] shadow-sm">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/30">
              <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
                <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.8" />
                <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M19.1 4.9l-1.4 1.4M6.3 17.7l-1.4 1.4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-sm font-extrabold">{t("explore.weather.heatTitle")}</h2>
                {weather.isOverridden ? (
                  <span className="rounded-full bg-[#0B2545]/15 px-2 py-0.5 text-[9px] font-extrabold uppercase">
                    Demo
                  </span>
                ) : null}
                {weather.tempC ? (
                  <span className="rounded-full bg-white/40 px-2 py-0.5 text-[10px] font-extrabold">
                    {Math.round(weather.tempC)}°C
                  </span>
                ) : null}
              </div>
              <p className="mt-1 text-[11px] font-medium leading-relaxed">
                {t("explore.weather.heatBody")}
              </p>
              <button
                type="button"
                onClick={() => {
                  setCategory("ambiente");
                  setQuery("");
                  setOnlyAccessible(false);
                  setLocalEconomy(false);
                }}
                className="mt-3 rounded-xl bg-[#0B2545] px-3 py-2 text-[11px] font-extrabold text-white active:scale-95"
              >
                {t("explore.weather.heatCta")}
              </button>
            </div>
          </div>
        </section>
      ) : null}

      {showRain ? (
        <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-sky-700 to-blue-900 p-4 text-white shadow-sm">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/15">
              <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
                <path d="M7 15a4 4 0 0 1-.5-7.97A5.5 5.5 0 0 1 17 8a3.5 3.5 0 0 1 1.5 6.7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                <path d="m9 18-1 3M13 18l-1 3M17 18l-1 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-sm font-extrabold">{t("explore.weather.rainTitle")}</h2>
                {weather.isOverridden ? (
                  <span className="rounded-full bg-white/20 px-2 py-0.5 text-[9px] font-extrabold uppercase">
                    Demo
                  </span>
                ) : null}
              </div>
              <p className="mt-1 text-[11px] font-medium leading-relaxed text-sky-100">
                {t("explore.weather.rainBody")}
              </p>
              <button
                type="button"
                onClick={() => {
                  setCategory("ambiente");
                  setQuery("");
                  setOnlyAccessible(false);
                  setLocalEconomy(false);
                }}
                className="mt-3 rounded-xl bg-white px-3 py-2 text-[11px] font-extrabold text-sky-900 active:scale-95"
              >
                {t("explore.weather.rainCta")}
              </button>
            </div>
          </div>
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
          className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-10 text-sm font-medium text-[#0B2545] shadow-sm outline-none ring-[#15803D]/30 placeholder:text-slate-400 focus:border-[#15803D] focus:ring-4"
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
        <button
          type="button"
          onClick={() => setLocalEconomy((previous) => !previous)}
          aria-pressed={localEconomy}
          className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-[11px] font-extrabold transition active:scale-95 ${
            localEconomy
              ? "border-amber-500 bg-amber-400 text-[#0B2545]"
              : "border-slate-200 bg-white text-slate-600"
          }`}
        >
          <span
            className={`flex h-4 w-4 items-center justify-center rounded-full ${
              localEconomy ? "bg-[#0B2545]/15" : "bg-slate-100"
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

      <section>
        <div className="flex items-end justify-between gap-3">
          <div>
            <h2 className="text-xs font-extrabold uppercase tracking-wide text-slate-500">
              {t("explore.mapTitle")}
            </h2>
            <p className="mt-0.5 text-[10px] text-slate-400">{t("explore.mapHint")}</p>
          </div>
          <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-500">
            {filtered.length} {t("explore.mapCount")}
          </span>
        </div>
        <div className="mt-2">
          <ExploreMap pois={filtered} height={230} compact />
        </div>
        <button
          type="button"
          onClick={() => setActiveTab("map")}
          className="mt-2 w-full rounded-xl bg-[#0B2545] px-3 py-2.5 text-[11px] font-extrabold text-white shadow-sm transition hover:bg-[#123A6B] active:scale-[0.99]"
        >
          {t("map.openFullMap")}
        </button>
      </section>

      <section aria-busy={loading}>
        <div className="flex items-end justify-between gap-3" aria-live="polite">
          <div>
            <h2 className="text-sm font-extrabold text-[#0B2545]">
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
              className="text-[10px] font-extrabold text-[#15803D] underline-offset-2 hover:underline"
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
            <h3 className="mt-3 text-sm font-extrabold text-[#0B2545]">
              {t("explore.noResults")}
            </h3>
            <p className="mt-1 text-xs text-slate-500">{t("explore.noResultsHint")}</p>
            <button
              type="button"
              onClick={resetFilters}
              className="mt-4 rounded-xl bg-[#0B2545] px-4 py-2 text-xs font-extrabold text-white active:scale-95"
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

      <p className="pt-1 text-center text-[10px] leading-relaxed text-slate-400">
        {t("footer.note")}
      </p>
    </div>
  );
}
