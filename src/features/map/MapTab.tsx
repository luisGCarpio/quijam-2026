"use client";

import dynamic from "next/dynamic";
import { useCallback, useState } from "react";
import { AlertTriangle, MapPin, Plus } from "lucide-react";
import { useBQ360 } from "@/context/BQ360Context";
import type { RouteResult } from "@/lib/routing";
import LayerFilterChips from "./LayerFilterChips";
import RouteComparisonCard from "./RouteComparisonCard";
import ReportModal from "./ReportModal";

const LeafletCanvas = dynamic(() => import("./LeafletCanvas"), {
  ssr: false,
  loading: () => (
    <div
      className="h-[340px] w-full animate-pulse bg-[var(--surface-muted)]"
      aria-label="Loading map"
    />
  ),
});

export default function MapTab() {
  const { t, simulation, reports, weather } = useBQ360();
  const [reportOpen, setReportOpen] = useState(false);
  const [routeResult, setRouteResult] = useState<RouteResult | null>(null);

  const handleRouteResult = useCallback((result: RouteResult | null) => {
    setRouteResult(result);
  }, []);

  const rainActive =
    simulation.scenarioId === "rain_arroyos" || weather.arroyoRisk === "critico";

  return (
    <section
      className="flex flex-col gap-3 p-3.5"
      aria-label={t("map.stub.title")}
    >
      {/* Mapa real con chips de las 7 capas encima */}
      <div className="bq-surface-card overflow-hidden rounded-[22px]">
        <div className="relative">
          <LayerFilterChips />
          <LeafletCanvas onRouteResult={handleRouteResult} />
        </div>
      </div>

      {/* Alerta crítica de arroyos (regla contraste DESIGN.md: blanco sobre #D9323B) */}
      {rainActive && (
        <div
          role="alert"
          className="flex items-center gap-2.5 rounded-2xl bg-bq-red px-3.5 py-2.5 text-xs font-bold leading-snug text-white"
        >
          <span
            aria-hidden="true"
            className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/20 text-white"
          >
            <AlertTriangle
              className="h-3.5 w-3.5"
              strokeWidth={2.25}
              absoluteStrokeWidth
            />
          </span>
          <span>{t("map.arroyoWarning")}</span>
        </div>
      )}

      {/* Comparador de Ruta Directa vs. Ruta Alternativa */}
      <RouteComparisonCard route={routeResult} />

      {/* Barra de Reportes Ciudadanos en Vivo + CTA Reportar */}
      <div className="bq-surface-card flex items-center justify-between gap-3 rounded-2xl p-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <span
            aria-hidden="true"
            className="bq-icon-circle inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-bq-navy text-white"
          >
            <MapPin
              className="h-4 w-4"
              strokeWidth={2}
              absoluteStrokeWidth
            />
          </span>
          <div className="min-w-0">
            <p className="text-[0.6875rem] font-bold uppercase tracking-wider text-bq-muted">
              {t("map.liveReports")}
            </p>
            <p className="text-sm font-extrabold tabular-nums text-bq-navy">
              {reports.length}
            </p>
          </div>
        </div>

        {/* Optical alignment (better-ui): 2px less on leading icon side */}
        <button
          type="button"
          onClick={() => setReportOpen(true)}
          className="bq-touch-target inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-xl bg-bq-red pe-3.5 ps-3 py-2 text-xs font-bold text-white transition-[background-color,opacity] duration-100 hover:bg-[#be2931] active:opacity-85"
        >
          <Plus
            className="h-4 w-4 shrink-0"
            strokeWidth={2.25}
            absoluteStrokeWidth
            aria-hidden="true"
          />
          <span className="whitespace-nowrap">{t("map.reportButton")}</span>
        </button>
      </div>

      <ReportModal open={reportOpen} onClose={() => setReportOpen(false)} />
    </section>
  );
}
