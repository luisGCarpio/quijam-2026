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
      return <CloudRain className={className} aria-hidden="true" />;
    case "heat_alert":
      return <Flame className={className} aria-hidden="true" />;
    case "cloudy":
      return <Cloud className={className} aria-hidden="true" />;
    case "sunny":
    default:
      return <Sun className={className} aria-hidden="true" />;
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
          className:
            "border-emerald-300/40 bg-emerald-500/20 text-emerald-100",
          icon: <Radio className="h-3 w-3 shrink-0" aria-hidden="true" />,
        }
      : syncEnabled && !supabaseConnected
        ? {
            label: t("shell.sync.offline"),
            className: "border-amber-300/50 bg-amber-500/20 text-amber-100",
            icon: <WifiOff className="h-3 w-3 shrink-0" aria-hidden="true" />,
          }
        : {
            label: t("shell.sync.local"),
            className: "border-white/20 bg-white/10 text-slate-100",
            icon: <Database className="h-3 w-3 shrink-0" aria-hidden="true" />,
          };

  const notificationsAriaLabel =
    unreadCount > 0
      ? `${t("shell.notifications.open")} (${unreadCount} ${t("shell.notifications.unreadSuffix")})`
      : t("shell.notifications.open");

  return (
    <header
      data-surface="dark"
      className="shrink-0 bg-[#0B2545] text-white shadow-md"
    >
      {/* Franja tricolor Barranquilla / QUIJAM (decorativa) */}
      <div className="grid h-1 w-full grid-cols-3" aria-hidden="true">
        <span className="bg-[#15803D]" />
        <span className="bg-[#FACC15]" />
        <span className="bg-[#DC2626]" />
      </div>

      <div className="flex flex-col gap-2 px-3 py-2.5">
        {/* Fila 1: Marca + Modo + Sync + Acciones rápidas */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-base font-extrabold tracking-tight text-white">
                {t("shell.brand")}
              </span>
              <span className="sr-only"> — {t("shell.tagline")}</span>

              <span
                className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[0.6875rem] font-bold leading-tight ${
                  simulation.mode === "mundial_2034"
                    ? "border-[#FACC15]/60 bg-[#FACC15]/15 text-[#FEF08A]"
                    : "border-emerald-300/50 bg-emerald-500/15 text-emerald-100"
                }`}
              >
                {simulation.mode === "mundial_2034" ? (
                  <Trophy className="h-3 w-3 shrink-0" aria-hidden="true" />
                ) : (
                  <Landmark className="h-3 w-3 shrink-0" aria-hidden="true" />
                )}
                <span>{t(`shell.mode.${simulation.mode}`)}</span>
              </span>
            </div>

            <div className="mt-1 flex items-center gap-1.5">
              <span
                className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[0.6875rem] font-semibold leading-none ${syncStatus.className}`}
              >
                {syncStatus.icon}
                <span>{syncStatus.label}</span>
              </span>
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
              className={`bq-touch-target relative inline-flex min-h-9 min-w-9 items-center justify-center rounded-xl border transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FACC15] ${
                anyInclusionActive
                  ? "border-[#FACC15] bg-white/20 text-[#FACC15] ring-2 ring-[#FACC15]/70"
                  : "border-white/20 bg-white/10 text-white hover:bg-white/20"
              }`}
            >
              <Accessibility className="h-4 w-4 shrink-0" aria-hidden="true" />
              {anyInclusionActive && (
                <span
                  aria-hidden="true"
                  className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#0B2545] bg-[#FACC15]"
                />
              )}
            </button>

            <button
              type="button"
              aria-label={notificationsAriaLabel}
              onClick={() => setNotificationDrawerOpen(true)}
              className="bq-touch-target relative inline-flex min-h-9 min-w-9 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-white transition-colors hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FACC15]"
            >
              <Bell className="h-4 w-4 shrink-0" aria-hidden="true" />
              {unreadCount > 0 && (
                <span
                  aria-hidden="true"
                  className="bq-counter-badge absolute -right-1 -top-1 inline-flex min-h-4 min-w-4 items-center justify-center rounded-full bg-[#DC2626] px-1 text-[0.6875rem] font-extrabold leading-none text-white ring-2 ring-[#0B2545]"
                >
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setSimulatorOpen(true)}
              className="bq-touch-target inline-flex min-h-9 min-w-9 items-center justify-center gap-1.5 rounded-xl bg-[#FACC15] px-2.5 text-xs font-extrabold text-[#0B2545] shadow-sm transition-colors hover:bg-[#fde047] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              <SlidersHorizontal
                className="h-4 w-4 shrink-0"
                aria-hidden="true"
              />
              <span className="sr-only min-[380px]:not-sr-only">
                {t("shell.simulator.open")}
              </span>
            </button>
          </div>
        </div>

        {/* Fila 2: Franja transversal (Clima + Idioma + Moneda) */}
        <div className="flex flex-wrap items-center justify-between gap-1.5 border-t border-white/15 pt-2">
          <div
            className={`inline-flex min-w-0 flex-wrap items-center gap-1.5 rounded-xl border px-2.5 py-1 text-xs ${
              isCriticalArroyo
                ? "border-red-300/70 bg-[#DC2626]/30 text-white"
                : isHeatAlert
                  ? "border-amber-300/70 bg-amber-500/25 text-amber-50"
                  : "border-white/15 bg-white/10 text-slate-100"
            }`}
          >
            <span className="sr-only">{t("shell.weather.label")}: </span>
            <WeatherConditionIcon
              condition={weather.condition}
              className={`h-3.5 w-3.5 shrink-0 ${
                isCriticalArroyo
                  ? "text-red-200"
                  : isHeatAlert
                    ? "text-[#FACC15]"
                    : "text-[#FACC15]"
              }`}
            />
            <span className="font-bold tabular-nums">
              {Math.round(weather.tempC)}°C
            </span>

            {weather.arroyoRisk !== "bajo" ? (
              <span
                className={`inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[0.6875rem] font-extrabold leading-none ${
                  weather.arroyoRisk === "critico"
                    ? "bg-[#DC2626] text-white"
                    : "bg-[#FACC15] text-[#0B2545]"
                }`}
              >
                <AlertTriangle
                  className="h-2.5 w-2.5 shrink-0"
                  aria-hidden="true"
                />
                <span>{t(`shell.weather.arroyo.${weather.arroyoRisk}`)}</span>
              </span>
            ) : (
              <span
                className={`inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[0.6875rem] font-bold leading-none ${
                  isHeatAlert
                    ? "bg-[#FACC15] text-[#0B2545]"
                    : "bg-white/15 text-white"
                }`}
              >
                {isHeatAlert && (
                  <AlertTriangle
                    className="h-2.5 w-2.5 shrink-0"
                    aria-hidden="true"
                  />
                )}
                <span>{t(`shell.weather.condition.${weather.condition}`)}</span>
              </span>
            )}

            <span className="hidden text-[0.6875rem] font-medium text-slate-200 min-[400px]:inline">
              {t("shell.weather.uv")} {weather.uvIndex}
            </span>
            <span className="sr-only">
              {t("shell.weather.feelsLike")} {Math.round(weather.feelsLikeC)}°C
            </span>

            {weather.isOverridden && (
              <span className="inline-flex items-center gap-0.5 rounded-full border border-[#FACC15]/70 bg-[#0B2545]/80 px-1.5 py-0.5 text-[0.6875rem] font-bold leading-none text-[#FACC15]">
                <Sparkles className="h-2.5 w-2.5 shrink-0" aria-hidden="true" />
                <span>{t("shell.weather.simulated")}</span>
              </span>
            )}
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
                className="bq-touch-target min-h-8 rounded-lg border border-white/25 bg-white/10 px-2 py-1 text-xs font-bold text-white transition-colors hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FACC15]"
              >
                {LANGUAGES.map((item) => (
                  <option
                    key={item.code}
                    value={item.code}
                    className="bg-white text-slate-900"
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
                className="bq-touch-target min-h-8 rounded-lg border border-white/25 bg-white/10 px-2 py-1 text-xs font-bold text-white transition-colors hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FACC15]"
              >
                {CURRENCIES.map((code) => (
                  <option
                    key={code}
                    value={code}
                    className="bg-white text-slate-900"
                  >
                    {code}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Franja de banderas de accesibilidad activas */}
        {anyInclusionActive && (
          <div className="flex flex-wrap items-center gap-1.5 border-t border-white/15 pt-1.5">
            <span className="inline-flex items-center gap-1 text-[0.6875rem] font-bold uppercase tracking-wide text-[#FACC15]">
              <Accessibility className="h-3 w-3 shrink-0" aria-hidden="true" />
              <span>{t("shell.inclusion.active")}:</span>
            </span>

            <ul role="list" className="flex flex-wrap items-center gap-1">
              {accessibility.accessibleRoute && (
                <li className="inline-flex items-center gap-1 rounded-full border border-[#FACC15]/60 bg-white/15 px-2 py-0.5 text-[0.6875rem] font-semibold leading-tight text-white">
                  <Route className="h-3 w-3 shrink-0 text-[#FACC15]" aria-hidden="true" />
                  <span>{t("shell.inclusion.routeOn")}</span>
                </li>
              )}
              {accessibility.highContrast && (
                <li className="inline-flex items-center gap-1 rounded-full border border-[#FACC15]/60 bg-white/15 px-2 py-0.5 text-[0.6875rem] font-semibold leading-tight text-white">
                  <Contrast className="h-3 w-3 shrink-0 text-[#FACC15]" aria-hidden="true" />
                  <span>{t("shell.inclusion.contrastOn")}</span>
                </li>
              )}
              {accessibility.largeText && (
                <li className="inline-flex items-center gap-1 rounded-full border border-[#FACC15]/60 bg-white/15 px-2 py-0.5 text-[0.6875rem] font-semibold leading-tight text-white">
                  <Type className="h-3 w-3 shrink-0 text-[#FACC15]" aria-hidden="true" />
                  <span>{t("shell.inclusion.largeTextOn")}</span>
                </li>
              )}
              {accessibility.voiceAlerts && (
                <li className="inline-flex items-center gap-1 rounded-full border border-[#FACC15]/60 bg-white/15 px-2 py-0.5 text-[0.6875rem] font-semibold leading-tight text-white">
                  <Volume2 className="h-3 w-3 shrink-0 text-[#FACC15]" aria-hidden="true" />
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
