"use client";

// Archivo exclusivo de Dev 3 — Stub inicial Fase 0 (alineado a DESIGN.md)
import { CalendarDays, Navigation } from "lucide-react";
import { useBQ360 } from "@/context/BQ360Context";
import { CITY_EVENTS } from "@/data/events";

export default function EventsTab() {
  const { simulation, navigateToRoute, lang, t } = useBQ360();

  const visibleEvents = CITY_EVENTS.filter((evt) => evt.mode === simulation.mode);
  const sampleEvent = visibleEvents[0] ?? CITY_EVENTS[0];

  return (
    <section
      className="flex flex-col gap-4 p-4"
      aria-label={t("events.stub.title")}
    >
      <header className="flex items-start gap-3 pb-1">
        <span
          aria-hidden="true"
          className="bq-icon-circle mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-bq-red text-white"
        >
          <CalendarDays className="h-5 w-5" strokeWidth={2} absoluteStrokeWidth />
        </span>
        <div className="min-w-0">
          <p className="text-[0.6875rem] font-bold uppercase tracking-wider text-bq-red">
            {t(`shell.mode.${simulation.mode}`)}
          </p>
          <h2 className="mt-0.5 text-lg font-extrabold leading-tight tracking-tight text-bq-navy">
            {t("events.stub.title")}
          </h2>
          <p className="mt-1 text-xs leading-relaxed text-bq-text">
            {t("events.stub.subtitle")}
          </p>
        </div>
      </header>

      <div className="grid grid-cols-2 gap-3">
        <div className="bq-surface-card rounded-2xl p-3.5">
          <p className="text-[0.6875rem] font-bold uppercase tracking-wider text-bq-muted">
            {t("events.stub.mode")}
          </p>
          <p className="mt-1.5 text-sm font-bold text-bq-navy">
            {t(`shell.mode.${simulation.mode}`)}
          </p>
        </div>

        <div className="bq-surface-card rounded-2xl p-3.5">
          <p className="text-[0.6875rem] font-bold uppercase tracking-wider text-bq-muted">
            {t("events.stub.count")}
          </p>
          <p className="mt-1.5 text-base font-extrabold tabular-nums text-bq-green">
            {visibleEvents.length} / {CITY_EVENTS.length}
          </p>
        </div>
      </div>

      {sampleEvent && (
        <article className="bq-surface-card rounded-2xl p-4">
          <h3 className="text-sm font-bold leading-snug text-bq-navy">
            {sampleEvent.name[lang]}
          </h3>
          <p className="mt-1 text-xs leading-relaxed text-bq-text">
            {sampleEvent.venue} · {sampleEvent.schedule}
          </p>
          {/* Optical alignment (better-ui): 2px less padding on leading icon side */}
          <button
            type="button"
            onClick={() =>
              navigateToRoute({
                lat: sampleEvent.coords.lat,
                lng: sampleEvent.coords.lng,
                label: sampleEvent.name[lang],
              })
            }
            className="bq-touch-target mt-3 inline-flex min-h-10 items-center gap-2 rounded-xl bg-bq-navy pe-4 ps-3.5 py-2 text-xs font-bold text-white transition-[background-color,opacity] duration-100 hover:bg-bq-navy-deep active:opacity-85"
          >
            <Navigation
              className="h-3.5 w-3.5 shrink-0"
              strokeWidth={2.25}
              absoluteStrokeWidth
              aria-hidden="true"
            />
            <span>{t("events.stub.routeCta")}</span>
          </button>
        </article>
      )}
    </section>
  );
}
