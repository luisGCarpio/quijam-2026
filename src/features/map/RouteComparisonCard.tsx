"use client";

import { Navigation, ShieldCheck, X } from "lucide-react";
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
    <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
            {routeRequest.destination.label}
          </p>
          <p className="mt-1 flex items-center gap-1 text-sm font-bold text-[#15803D]">
            <Navigation className="h-4 w-4" />
            {route ? `${route.alternativeMinutes} min · ${route.avoidedCrowdPercent}% ${t("map.avoided")}` : t("map.calculating")}
          </p>
        </div>
        <button
          type="button"
          onClick={clearRoute}
          className="rounded-lg border border-slate-200 p-2 text-slate-600"
          aria-label={t("map.stub.clearRoute")}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="mt-2 flex flex-wrap gap-2 text-xs">
        {route && <span className="rounded-full bg-red-50 px-2 py-1 text-red-700">{t("map.direct")} {route.directMinutes} min</span>}
        {route && <span className="rounded-full bg-green-50 px-2 py-1 text-green-700">{t("map.alternative")} {route.alternativeMinutes} min</span>}
        {accessibility.accessibleRoute && (
          <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-2 py-1 font-bold text-sky-800">
            <ShieldCheck className="h-3 w-3" /> {t("map.accessible")}
          </span>
        )}
        <span className="rounded-full bg-amber-50 px-2 py-1 text-amber-800">{weather.tempC}°C</span>
      </div>
    </div>
  );
}
