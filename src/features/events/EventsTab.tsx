"use client";

// Archivo exclusivo de Dev 3 — Stub inicial Fase 0
import { CalendarDays, Navigation } from "lucide-react";
import { useBQ360 } from "@/context/BQ360Context";
import { CITY_EVENTS } from "@/data/events";

export default function EventsTab() {
  const { simulation, navigateToRoute, lang, t } = useBQ360();

  const visibleEvents = CITY_EVENTS.filter((evt) => evt.mode === simulation.mode);
  const sampleEvent = visibleEvents[0] ?? CITY_EVENTS[0];

  return (
    <section className="flex flex-col gap-4 p-4" aria-label={t("events.stub.title")}>
      <header className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-2 text-[#0B2545]">
          <CalendarDays className="h-5 w-5 shrink-0" aria-hidden="true" />
          <h2 className="text-base font-bold">{t("events.stub.title")}</h2>
        </div>
        <p className="mt-1 text-xs text-slate-600">{t("events.stub.subtitle")}</p>
      </header>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-slate-200 bg-white p-3">
          <p className="text-xs font-medium text-slate-500">{t("events.stub.mode")}</p>
          <p className="mt-1 text-sm font-semibold text-[#0B2545]">
            {t(`shell.mode.${simulation.mode}`)}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-3">
          <p className="text-xs font-medium text-slate-500">{t("events.stub.count")}</p>
          <p className="mt-1 text-sm font-semibold text-[#15803D]">
            {visibleEvents.length} / {CITY_EVENTS.length}
          </p>
        </div>
      </div>

      {sampleEvent && (
        <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="text-sm font-bold text-[#0B2545]">{sampleEvent.name[lang]}</h3>
          <p className="mt-1 text-xs text-slate-600">
            {sampleEvent.venue} · {sampleEvent.schedule}
          </p>
          <button
            type="button"
            onClick={() =>
              navigateToRoute({
                lat: sampleEvent.coords.lat,
                lng: sampleEvent.coords.lng,
                label: sampleEvent.name[lang],
              })
            }
            className="mt-3 inline-flex items-center gap-2 rounded-xl bg-[#0B2545] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#133866]"
          >
            <Navigation className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{t("events.stub.routeCta")}</span>
          </button>
        </article>
      )}
    </section>
  );
}
