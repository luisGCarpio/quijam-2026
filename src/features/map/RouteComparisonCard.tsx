"use client";

import {
  Accessibility,
  Clock,
  Navigation,
  Thermometer,
  X,
} from "lucide-react";
import { useBQ360 } from "@/context/BQ360Context";
import type { RouteResult } from "@/lib/routing";

export default function RouteComparisonCard({
  route,
}: {
  route: RouteResult | null;
}) {
  const { routeRequest, clearRoute, weather, accessibility, t } = useBQ360();
  if (!routeRequest) return null;

  return (
    <article className="bq-surface-card rounded-2xl p-3.5">
      <div className="flex items-start justify-between gap-2.5">
        <div className="flex min-w-0 items-start gap-2.5">
          <span
            aria-hidden="true"
            className="bq-icon-circle mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-bq-green text-white"
          >
            <Navigation
              className="h-4 w-4"
              strokeWidth={2.25}
              absoluteStrokeWidth
            />
          </span>
          <div className="min-w-0">
            <p className="truncate text-[0.6875rem] font-bold uppercase tracking-wider text-bq-muted">
              {routeRequest.destination.label}
            </p>
            <p className="mt-0.5 text-sm font-extrabold leading-snug text-bq-green tabular-nums">
              {route
                ? `${route.alternativeMinutes} min · ${route.avoidedCrowdPercent}% ${t("map.avoided")}`
                : t("map.calculating")}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={clearRoute}
          aria-label={t("map.stub.clearRoute")}
          className="bq-touch-target inline-flex min-h-9 min-w-9 shrink-0 items-center justify-center rounded-full border border-[var(--border-subtle)] bg-white text-bq-navy transition-colors duration-100 hover:bg-[var(--surface-muted)] active:opacity-80"
        >
          <X
            className="h-4 w-4"
            strokeWidth={2}
            absoluteStrokeWidth
            aria-hidden="true"
          />
        </button>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-1.5 text-[0.6875rem] font-bold">
        {route && (
          <span className="inline-flex items-center gap-1 rounded-full bg-bq-red px-2.5 py-1 leading-none text-white tabular-nums">
            <Clock
              className="h-3 w-3 shrink-0"
              strokeWidth={2}
              absoluteStrokeWidth
              aria-hidden="true"
            />
            <span>
              {t("map.direct")} {route.directMinutes} min
            </span>
          </span>
        )}
        {route && (
          <span className="inline-flex items-center gap-1 rounded-full bg-bq-green px-2.5 py-1 leading-none text-white tabular-nums">
            <Navigation
              className="h-3 w-3 shrink-0"
              strokeWidth={2}
              absoluteStrokeWidth
              aria-hidden="true"
            />
            <span>
              {t("map.alternative")} {route.alternativeMinutes} min
            </span>
          </span>
        )}
        {accessibility.accessibleRoute && (
          <span className="inline-flex items-center gap-1 rounded-full bg-bq-sky px-2.5 py-1 leading-none text-bq-navy">
            <Accessibility
              className="h-3 w-3 shrink-0"
              strokeWidth={2.25}
              absoluteStrokeWidth
              aria-hidden="true"
            />
            <span>{t("map.accessible")}</span>
          </span>
        )}
        <span className="inline-flex items-center gap-1 rounded-full bg-bq-yellow px-2.5 py-1 leading-none text-bq-navy tabular-nums">
          <Thermometer
            className="h-3 w-3 shrink-0"
            strokeWidth={2.25}
            absoluteStrokeWidth
            aria-hidden="true"
          />
          <span>{Math.round(weather.tempC)}°C</span>
        </span>
      </div>
    </article>
  );
}
