"use client";

// Archivo exclusivo de Dev 4 — Stub inicial Fase 0
import { Compass } from "lucide-react";
import { useBQ360 } from "@/context/BQ360Context";
import { EXPLORE_POIS } from "@/data/explore-pois";

export default function ExploreTab() {
  const { formatPrice, lang, t } = useBQ360();

  return (
    <section className="flex flex-col gap-4 p-4" aria-label={t("explore.stub.title")}>
      <header className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-2 text-[#0B2545]">
          <Compass className="h-5 w-5 shrink-0" aria-hidden="true" />
          <h2 className="text-base font-bold">{t("explore.stub.title")}</h2>
        </div>
        <p className="mt-1 text-xs text-slate-600">{t("explore.stub.subtitle")}</p>
      </header>

      <ul className="flex flex-col gap-3">
        {EXPLORE_POIS.map((poi) => (
          <li
            key={poi.id}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-sm font-bold text-[#0B2545]">{poi.name[lang]}</h3>
              <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-[#15803D]">
                {poi.priceCop && poi.priceCop > 0
                  ? formatPrice(poi.priceCop)
                  : t("explore.stub.free")}
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-600">{poi.description[lang]}</p>
            <p className="mt-2 text-[11px] text-slate-500">{poi.address}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
