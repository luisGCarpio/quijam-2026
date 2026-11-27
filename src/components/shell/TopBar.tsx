"use client";

import { useId } from "react";
import {
  Accessibility,
  AlertTriangle,
  Bell,
  Cloud,
  CloudRain,
  Contrast,
  Database,
  Flame,
  Landmark,
  Radio,
  Route,
  SlidersHorizontal,
  Sparkles,
  Sun,
  Trophy,
  Type,
  Volume2,
  WifiOff,
} from "lucide-react";
import { useBQ360 } from "@/context/BQ360Context";
import type { Currency, Lang, WeatherState } from "@/types/bq360";

const LANGUAGES: ReadonlyArray<{ code: Lang; label: string }> = [
  { code: "es", label: "ES" },
  { code: "en", label: "EN" },
  { code: "pt", label: "PT" },
  { code: "fr", label: "FR" },
];

const CURRENCIES: readonly Currency[] = ["COP", "USD", "EUR", "BRL"];

function WeatherConditionIcon({
  condition,
  className,
}: {
  condition: WeatherState["condition"];
  className?: string;
}) {
  switch (condition) {
    case "rain_arroyo":
      return (
        <CloudRain
          className={className}
          strokeWidth={2}
          absoluteStrokeWidth
          aria-hidden="true"
        />
      );
    case "heat_alert":
      return (
        <Flame
          className={className}
          strokeWidth={2}
          absoluteStrokeWidth
          aria-hidden="true"
        />
      );
    case "cloudy":
      return (
        <Cloud
          className={className}
          strokeWidth={2}
          absoluteStrokeWidth
          aria-hidden="true"
        />
      );
    case "sunny":
    default:
      return (
        <Sun
          className={className}
          strokeWidth={2}
          absoluteStrokeWidth
          aria-hidden="true"
        />
      );
  }
}

export function TopBar() {
  const {
    lang,
    setLang,
    currency,
    setCurrency,
    weather,
    accessibility,
    updateAccessibility,
    simulation,
    syncEnabled,
    supabaseConnected,
    notifications,
    setNotificationDrawerOpen,
    setSimulatorOpen,
    t,
  } = useBQ360();

  const langId = useId();
  const currencyId = useId();

  const unreadCount = notifications.reduce(
    (acc, item) => (item.read ? acc : acc + 1),
    0
  );

  const anyInclusionActive =
    accessibility.accessibleRoute ||
    accessibility.highContrast ||
    accessibility.largeText ||
    accessibility.voiceAlerts;

  const isCriticalArroyo =
    weather.arroyoRisk === "critico" || weather.condition === "rain_arroyo";
  const isHeatAlert = !isCriticalArroyo && weather.condition === "heat_alert";

  const syncStatus =
    syncEnabled && supabaseConnected
      ? {
          label: t("shell.sync.live"),
          dotClass: "bg-bq-green",
          icon: (
            <Radio
              className="h-3 w-3 shrink-0 text-bq-sky"
              strokeWidth={2}
              absoluteStrokeWidth
              aria-hidden="true"
            />
          ),
        }
      : syncEnabled && !supabaseConnected
        ? {
            label: t("shell.sync.offline"),
            dotClass: "bg-bq-yellow",
            icon: (
              <WifiOff
                className="h-3 w-3 shrink-0 text-bq-yellow"
                strokeWidth={2}
                absoluteStrokeWidth
                aria-hidden="true"
              />
            ),
          }
        : {
            label: t("shell.sync.local"),
            dotClass: "bg-bq-sky",
            icon: (
              <Database
                className="h-3 w-3 shrink-0 text-white/80"
                strokeWidth={2}
                absoluteStrokeWidth
                aria-hidden="true"
              />
            ),
          };

  const notificationsAriaLabel =
    unreadCount > 0
      ? `${t("shell.notifications.open")} (${unreadCount} ${t("shell.notifications.unreadSuffix")})`
      : t("shell.notifications.open");

  return (
    <header
      data-surface="dark"
      className="relative shrink-0 overflow-hidden bg-bq-navy text-white"
    >
      {/* Motivo gráfico geométrico sutil QUIJAM (DESIGN.md §3 — decorativo) */}
      <svg
        aria-hidden="true"
        viewBox="0 0 120 84"
        fill="none"
        className="pointer-events-none absolute -right-4 -top-2 h-24 w-32 opacity-20"
      >
        <circle cx="96" cy="18" r="24" fill="#6AB4E2" />
        <path
          d="M64 84C64 56 86 38 114 38"
          stroke="#F3C922"
          strokeWidth="12"
          strokeLinecap="round"
        />
        <circle cx="52" cy="20" r="8" fill="#D9323B" />
        <circle cx="34" cy="48" r="6" fill="#268C44" />
      </svg>

      {/* Franja superior identidad Barranquilla / QUIJAM (DESIGN.md §1) */}
      <div className="relative z-10 grid h-1 w-full grid-cols-4" aria-hidden="true">
        <span className="bg-bq-green" />
        <span className="bg-bq-yellow" />
        <span className="bg-bq-red" />
        <span className="bg-bq-sky" />
      </div>

      <div className="relative z-10 flex flex-col gap-2 px-4 py-3">
        {/* Fila 1: Identidad BQ360 + Contexto compacto + Acciones rápidas */}
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span
                aria-hidden="true"
                className="bq-icon-circle inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-bq-yellow text-bq-navy"
              >
                {simulation.mode === "mundial_2034" ? (
                  <Trophy
                    className="h-3.5 w-3.5"
                    strokeWidth={2.25}
                    absoluteStrokeWidth
                  />
                ) : (
                  <Landmark
                    className="h-3.5 w-3.5"
                    strokeWidth={2.25}
                    absoluteStrokeWidth
                  />
                )}
              </span>

              <div className="min-w-0">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-base font-extrabold leading-none tracking-tight text-white">
                    {t("shell.brand")}
                  </span>
                  <span className="sr-only"> — {t("shell.tagline")}</span>
                  <span className="truncate text-[0.6875rem] font-bold uppercase tracking-wider text-bq-yellow">
                    {t(`shell.mode.${simulation.mode}`)}
                  </span>
                </div>

                <div className="mt-1 flex items-center gap-1.5 text-[0.6875rem] font-medium leading-none text-white/85">
                  {syncStatus.icon}
                  <span className="truncate">{syncStatus.label}</span>
                </div>
              </div>
            </div>
          </div>

          <div
            role="group"
            aria-label={t("shell.header.controls")}
            className="flex shrink-0 items-center gap-1.5"
          >
            <button
              type="button"
              aria-pressed={accessibility.highContrast}
              aria-label={t("shell.inclusion.toggleContrast")}
              onClick={() =>
                updateAccessibility({
                  highContrast: !accessibility.highContrast,
                })
              }
              className={`bq-touch-target relative inline-flex min-h-9 min-w-9 items-center justify-center rounded-xl border transition-[background-color,border-color,opacity] duration-100 active:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bq-yellow ${
                accessibility.highContrast
                  ? "border-bq-yellow bg-white/15 text-bq-yellow"
                  : "border-white/20 bg-white/10 text-white hover:bg-white/20"
              }`}
            >
              <Contrast
                className="h-4 w-4 shrink-0"
                strokeWidth={2}
                absoluteStrokeWidth
                aria-hidden="true"
              />
              {accessibility.highContrast && (
                <span
                  aria-hidden="true"
                  className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-bq-navy bg-bq-yellow"
                />
              )}
            </button>

            <button
              type="button"
              aria-label={notificationsAriaLabel}
              onClick={() => setNotificationDrawerOpen(true)}
              className="bq-touch-target relative inline-flex min-h-9 min-w-9 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-white transition-[background-color,opacity] duration-100 hover:bg-white/20 active:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bq-yellow"
            >
              <Bell
                className="h-4 w-4 shrink-0"
                strokeWidth={2}
                absoluteStrokeWidth
                aria-hidden="true"
              />
              {unreadCount > 0 && (
                <span
                  aria-hidden="true"
                  className="bq-counter-badge absolute -right-1 -top-1 inline-flex min-h-4 min-w-4 items-center justify-center rounded-full bg-bq-red px-1 text-[0.6875rem] font-extrabold leading-none text-white ring-2 ring-bq-navy"
                >
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {/* Optical alignment (better-ui): centered when icon-only (<380px), 2px less on icon side when text is shown */}
            <button
              type="button"
              onClick={() => setSimulatorOpen(true)}
              className="bq-touch-target inline-flex min-h-9 min-w-9 items-center justify-center gap-1.5 rounded-xl bg-bq-yellow px-2.5 text-xs font-extrabold text-bq-navy transition-[background-color,opacity] duration-100 hover:bg-[#f7d44b] active:opacity-85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white min-[380px]:pe-3 min-[380px]:ps-2.5"
            >
              <SlidersHorizontal
                className="h-4 w-4 shrink-0"
                strokeWidth={2.25}
                absoluteStrokeWidth
                aria-hidden="true"
              />
              <span className="sr-only whitespace-nowrap min-[380px]:not-sr-only">
                {t("shell.simulator.open")}
              </span>
            </button>
          </div>
        </div>

        {/* Fila 2: Franja transversal limpia (Clima + Idioma + Moneda) */}
        <div className="flex items-center justify-between gap-2 border-t border-white/15 pt-2">
          <div
            className={`inline-flex min-w-0 flex-1 items-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-xs ${
              isCriticalArroyo
                ? "border-bq-red bg-bq-red text-white"
                : isHeatAlert
                  ? "border-bq-yellow bg-bq-yellow text-bq-navy"
                  : "border-white/15 bg-white/10 text-white"
            }`}
          >
            <span className="sr-only">{t("shell.weather.label")}: </span>
            <WeatherConditionIcon
              condition={weather.condition}
              className={`h-3.5 w-3.5 shrink-0 ${
                isCriticalArroyo
                  ? "text-white"
                  : isHeatAlert
                    ? "text-bq-navy"
                    : "text-bq-yellow"
              }`}
            />
            <span className="shrink-0 font-bold tabular-nums">
              {Math.round(weather.tempC)}°C
            </span>

            <span
              className={`inline-flex min-w-0 items-center gap-1 truncate text-[0.6875rem] font-bold leading-none ${
                isHeatAlert ? "text-bq-navy" : "text-white"
              }`}
            >
              {(weather.arroyoRisk !== "bajo" || isHeatAlert) && (
                <AlertTriangle
                  className="h-3 w-3 shrink-0"
                  strokeWidth={2.25}
                  absoluteStrokeWidth
                  aria-hidden="true"
                />
              )}
              <span className="truncate">
                {weather.arroyoRisk !== "bajo"
                  ? t(`shell.weather.arroyo.${weather.arroyoRisk}`)
                  : t(`shell.weather.condition.${weather.condition}`)}
              </span>
            </span>

            {weather.isOverridden ? (
              <span
                className={`bq-weather-sim-badge ml-auto inline-flex shrink-0 items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[0.6875rem] font-bold leading-none ${
                  isHeatAlert
                    ? "bg-bq-navy text-white"
                    : "bg-bq-navy/35 text-white"
                }`}
              >
                <Sparkles
                  className="h-3 w-3 shrink-0"
                  strokeWidth={2}
                  absoluteStrokeWidth
                  aria-hidden="true"
                />
                <span className="sr-only whitespace-nowrap min-[410px]:not-sr-only">
                  {t("shell.weather.simulated")}
                </span>
              </span>
            ) : (
              <span className="ml-auto hidden shrink-0 whitespace-nowrap text-[0.6875rem] font-medium text-white/80 min-[400px]:inline">
                {t("shell.weather.uv")} {weather.uvIndex}
              </span>
            )}
            <span className="sr-only">
              {t("shell.weather.feelsLike")} {Math.round(weather.feelsLikeC)}°C
            </span>
          </div>

          <div className="flex shrink-0 items-center gap-1.5">
            <div className="relative">
              <label htmlFor={langId} className="visually-hidden">
                {t("shell.lang.label")}
              </label>
              <select
                id={langId}
                value={lang}
                onChange={(event) => setLang(event.target.value as Lang)}
                className="bq-touch-target min-h-8 rounded-lg border border-white/25 bg-white/10 px-2.5 py-1 text-xs font-bold text-white transition-colors hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bq-yellow"
              >
                {LANGUAGES.map((item) => (
                  <option
                    key={item.code}
                    value={item.code}
                    className="bg-white text-bq-text"
                  >
                    {item.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="relative">
              <label htmlFor={currencyId} className="visually-hidden">
                {t("shell.currency.label")}
              </label>
              <select
                id={currencyId}
                value={currency}
                onChange={(event) =>
                  setCurrency(event.target.value as Currency)
                }
                className="bq-touch-target min-h-8 rounded-lg border border-white/25 bg-white/10 px-2.5 py-1 text-xs font-bold text-white transition-colors hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bq-yellow"
              >
                {CURRENCIES.map((code) => (
                  <option
                    key={code}
                    value={code}
                    className="bg-white text-bq-text"
                  >
                    {code}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Franja condicional de accesibilidad activa */}
        {anyInclusionActive && (
          <div className="flex flex-wrap items-center gap-1.5 border-t border-white/15 pt-2">
            <span className="inline-flex items-center gap-1 text-[0.6875rem] font-bold uppercase tracking-wider text-bq-yellow">
              <Accessibility
                className="h-3 w-3 shrink-0"
                strokeWidth={2.25}
                absoluteStrokeWidth
                aria-hidden="true"
              />
              <span>{t("shell.inclusion.active")}:</span>
            </span>

            <ul role="list" className="flex flex-wrap items-center gap-1">
              {accessibility.accessibleRoute && (
                <li className="inline-flex items-center gap-1 rounded-full border border-bq-sky/60 bg-white/10 px-2 py-0.5 text-[0.6875rem] font-semibold leading-tight text-white">
                  <Route
                    className="h-3 w-3 shrink-0 text-bq-sky"
                    strokeWidth={2}
                    absoluteStrokeWidth
                    aria-hidden="true"
                  />
                  <span>{t("shell.inclusion.routeOn")}</span>
                </li>
              )}
              {accessibility.highContrast && (
                <li className="inline-flex items-center gap-1 rounded-full border border-bq-yellow/70 bg-white/10 px-2 py-0.5 text-[0.6875rem] font-semibold leading-tight text-white">
                  <Contrast
                    className="h-3 w-3 shrink-0 text-bq-yellow"
                    strokeWidth={2}
                    absoluteStrokeWidth
                    aria-hidden="true"
                  />
                  <span>{t("shell.inclusion.contrastOn")}</span>
                </li>
              )}
              {accessibility.largeText && (
                <li className="inline-flex items-center gap-1 rounded-full border border-bq-yellow/70 bg-white/10 px-2 py-0.5 text-[0.6875rem] font-semibold leading-tight text-white">
                  <Type
                    className="h-3 w-3 shrink-0 text-bq-yellow"
                    strokeWidth={2}
                    absoluteStrokeWidth
                    aria-hidden="true"
                  />
                  <span>{t("shell.inclusion.largeTextOn")}</span>
                </li>
              )}
              {accessibility.voiceAlerts && (
                <li className="inline-flex items-center gap-1 rounded-full border border-bq-sky/60 bg-white/10 px-2 py-0.5 text-[0.6875rem] font-semibold leading-tight text-white">
                  <Volume2
                    className="h-3 w-3 shrink-0 text-bq-sky"
                    strokeWidth={2}
                    absoluteStrokeWidth
                    aria-hidden="true"
                  />
                  <span>{t("shell.inclusion.voiceOn")}</span>
                </li>
              )}
            </ul>
          </div>
        )}
      </div>
    </header>
  );
}

export default TopBar;
