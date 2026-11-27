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
    <div className="h-[360px] animate-pulse bg-slate-200" aria-label="Loading map" />
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
    <section className="flex flex-col gap-3 p-3" aria-label={t("map.stub.title")}>
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="relative">
          <LayerFilterChips />
          <LeafletCanvas onRouteResult={handleRouteResult} />
        </div>
      </div>

      {rainActive && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-800">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          {t("map.arroyoWarning")}
        </div>
      )}

      <RouteComparisonCard route={routeResult} />

      <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600">
        <span className="flex items-center gap-1.5">
          <MapPin className="h-4 w-4 text-[#0B2545]" />
          {t("map.liveReports")}: <strong className="text-[#DC2626]">{reports.length}</strong>
        </span>
        <button
          type="button"
          onClick={() => setReportOpen(true)}
          className="inline-flex items-center gap-1 rounded-xl bg-[#DC2626] px-3 py-2 font-bold text-white shadow-md"
        >
          <Plus className="h-4 w-4" />
          {t("map.reportButton")}
        </button>
      </div>

      <ReportModal open={reportOpen} onClose={() => setReportOpen(false)} />
    </section>
  );
}
