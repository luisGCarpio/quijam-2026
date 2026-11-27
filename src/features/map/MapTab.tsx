"use client";

// Archivo exclusivo de Dev 2 — Stub inicial Fase 0
import { MapPin, Layers, AlertTriangle, Navigation, X } from "lucide-react";
import { useBQ360 } from "@/context/BQ360Context";
import { SCENARIOS } from "@/data/scenarios";

export default function MapTab() {
  const { simulation, activeLayers, routeRequest, clearRoute, reports, lang, t } =
    useBQ360();

  const activeLayerCount = Object.values(activeLayers).filter(Boolean).length;
  const totalLayers = Object.keys(activeLayers).length;
  const scenarioMeta = SCENARIOS[simulation.scenarioId];

  return (
    <section className="flex flex-col gap-4 p-4" aria-label={t("map.stub.title")}>
      <header className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-2 text-[#0B2545]">
          <MapPin className="h-5 w-5 shrink-0" aria-hidden="true" />
          <h2 className="text-base font-bold">{t("map.stub.title")}</h2>
        </div>
        <p className="mt-1 text-xs text-slate-600">{t("map.stub.subtitle")}</p>
      </header>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-slate-200 bg-white p-3">
          <p className="text-xs font-medium text-slate-500">{t("map.stub.scenario")}</p>
          <p className="mt-1 text-sm font-semibold text-[#0B2545]">
            {scenarioMeta.label[lang]}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-3">
          <p className="text-xs font-medium text-slate-500">{t("map.stub.mode")}</p>
          <p className="mt-1 text-sm font-semibold text-[#0B2545]">
            {t(`shell.mode.${simulation.mode}`)}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-3">
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
            <Layers className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{t("map.stub.layers")}</span>
          </div>
          <p className="mt-1 text-sm font-semibold text-[#15803D]">
            {activeLayerCount} / {totalLayers}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-3">
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
            <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{t("map.stub.reports")}</span>
          </div>
          <p className="mt-1 text-sm font-semibold text-[#DC2626]">{reports.length}</p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <Navigation className="h-4 w-4 text-[#0B2545]" aria-hidden="true" />
            <span>{t("map.stub.route")}</span>
          </div>
          {routeRequest && (
            <button
              type="button"
              onClick={clearRoute}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100"
            >
              <X className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{t("map.stub.clearRoute")}</span>
            </button>
          )}
        </div>
        <p className="mt-2 text-sm font-medium text-slate-900">
          {routeRequest ? routeRequest.destination.label : t("map.stub.noRoute")}
        </p>
      </div>
    </section>
  );
}
