"use client";

// Archivo exclusivo de Dev 4 — Stub inicial Fase 0 (alineado a DESIGN.md)
import { Compass } from "lucide-react";
import { useBQ360 } from "@/context/BQ360Context";
import { EXPLORE_POIS } from "@/data/explore-pois";

export default function ExploreTab() {
  const { formatPrice, lang, t } = useBQ360();

  return (
    <section
      className="flex flex-col gap-4 p-4"
      aria-label={t("explore.stub.title")}
    >
      <header className="flex items-start gap-3 pb-1">
        <span
          aria-hidden="true"
          className="bq-icon-circle mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-bq-green text-white"
        >
          <Compass className="h-5 w-5" strokeWidth={2} absoluteStrokeWidth />
        </span>
        <div className="min-w-0">
          <p className="text-[0.6875rem] font-bold uppercase tracking-wider text-bq-green">
            Barranquilla 360°
          </p>
          <h2 className="mt-0.5 text-lg font-extrabold leading-tight tracking-tight text-bq-navy">
            {t("explore.stub.title")}
          </h2>
          <p className="mt-1 text-xs leading-relaxed text-bq-text">
            {t("explore.stub.subtitle")}
          </p>
        </div>
      </header>

      <ul role="list" className="flex flex-col gap-3">
        {EXPLORE_POIS.map((poi) => (
          <li
            key={poi.id}
            className="bq-surface-card bq-surface-card-interactive rounded-2xl p-4"
          >
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-sm font-bold leading-snug text-bq-navy">
                {poi.name[lang]}
              </h3>
              <span className="shrink-0 whitespace-nowrap rounded-full bg-bq-green px-2.5 py-0.5 text-xs font-bold text-white tabular-nums">
                {poi.priceCop && poi.priceCop > 0
                  ? formatPrice(poi.priceCop)
                  : t("explore.stub.free")}
              </span>
            </div>
            <p className="mt-1.5 text-xs leading-relaxed text-bq-text">
              {poi.description[lang]}
            </p>
            <p className="mt-2 text-[0.6875rem] font-medium text-bq-muted">
              {poi.address}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
