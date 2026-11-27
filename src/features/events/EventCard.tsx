"use client";

import type { ComponentType } from "react";
import {
  Accessibility,
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  CloudSun,
  Flame,
  Landmark,
  MapPin,
  Navigation,
  Sparkles,
  Trophy,
  Users,
} from "lucide-react";
import type { EventInfo, EventsLang } from "@/data/events";
import type { EventsCopy } from "@/i18n/events";

type EventCardProps = {
  event: EventInfo;
  lang: EventsLang;
  copy: EventsCopy;
  attendance: number;
  weatherLabel: string;
  accessibleRoute: boolean;
  onNavigate?: (destination: { lat: number; lng: number; label: string }) => void;
};

type IconComp = ComponentType<{
  className?: string;
  strokeWidth?: number;
  absoluteStrokeWidth?: boolean;
}>;

const CATEGORY_VISUALS: Record<
  EventInfo["category"],
  { Icon: IconComp; circleClass: string }
> = {
  deporte: { Icon: Trophy, circleClass: "bg-bq-navy text-white" },
  cultura: { Icon: Sparkles, circleClass: "bg-bq-yellow text-bq-navy" },
  fanfest: { Icon: Flame, circleClass: "bg-bq-red text-white" },
  ciudad: { Icon: Landmark, circleClass: "bg-bq-sky text-bq-navy" },
};

const LEVEL_STYLES = {
  normal: {
    accentBorder: "border-t-[3px] border-t-bq-green",
    badge: "bg-bq-green text-white",
    percentText: "text-bq-green",
    bar: "bg-bq-green",
    Icon: CheckCircle2,
  },
  high: {
    accentBorder: "border-t-[3px] border-t-bq-yellow",
    badge: "bg-bq-yellow text-bq-navy",
    percentText: "text-bq-navy",
    bar: "bg-bq-yellow",
    Icon: AlertTriangle,
  },
  critical: {
    accentBorder: "border-t-[3px] border-t-bq-red",
    badge: "bg-bq-red text-white",
    percentText: "text-bq-red",
    bar: "bg-bq-red",
    Icon: Flame,
  },
} as const;

function getLocale(lang: EventsLang): string {
  switch (lang) {
    case "es":
      return "es-CO";
    case "pt":
      return "pt-BR";
    case "fr":
      return "fr-FR";
    default:
      return "en-US";
  }
}

export function EventCard({
  event,
  lang,
  copy,
  attendance,
  weatherLabel,
  accessibleRoute,
  onNavigate,
}: EventCardProps) {
  const occupancy = Math.round((attendance / event.capacity) * 100);
  const clampedPercent = Math.min(occupancy, 100);
  const level =
    occupancy >= 85 ? "critical" : occupancy >= 65 ? "high" : "normal";
  const levelLabel =
    level === "critical"
      ? copy.critical
      : level === "high"
        ? copy.high
        : copy.normal;
  const levelStyle = LEVEL_STYLES[level];
  const LevelIcon = levelStyle.Icon;

  const categoryStyle = CATEGORY_VISUALS[event.category];
  const CategoryIcon = categoryStyle.Icon;

  const title = event.name[lang] || event.name.es;
  const locale = getLocale(lang);
  const destination = `https://www.google.com/maps/dir/?api=1&destination=${event.coords.lat},${event.coords.lng}`;
  const accessLabel = event.accessibleEntry
    ? copy.accessible
    : copy.accessUnknown;

  return (
    <article
      className={`bq-surface-card bq-surface-card-interactive flex flex-col rounded-2xl p-4 ${levelStyle.accentBorder}`}
    >
      {/* Cabecera: ícono circular sólido QUIJAM + badge de nivel */}
      <div className="flex items-start justify-between gap-2.5">
        <div className="flex min-w-0 items-start gap-2.5">
          <span
            aria-hidden="true"
            className={`bq-icon-circle mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${categoryStyle.circleClass}`}
          >
            <CategoryIcon
              className="h-4 w-4"
              strokeWidth={2}
              absoluteStrokeWidth
            />
          </span>
          <div className="min-w-0">
            <h3 className="text-sm font-extrabold leading-snug text-bq-navy">
              {title}
            </h3>
            <p className="mt-0.5 flex items-center gap-1 text-xs leading-snug text-bq-muted">
              <MapPin
                className="h-3 w-3 shrink-0"
                strokeWidth={2}
                absoluteStrokeWidth
                aria-hidden="true"
              />
              <span className="truncate">{event.venue}</span>
            </p>
          </div>
        </div>

        <span
          className={`inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-1 text-[0.6875rem] font-extrabold leading-none ${levelStyle.badge}`}
        >
          <LevelIcon
            className="h-3 w-3 shrink-0"
            strokeWidth={2.25}
            absoluteStrokeWidth
            aria-hidden="true"
          />
          <span>{levelLabel}</span>
        </span>
      </div>

      {/* Bloque de aforo y barra de progreso */}
      <div className="mt-3.5">
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-[0.6875rem] font-bold uppercase tracking-wider text-bq-muted">
            {copy.occupancy}
          </span>
          <strong
            className={`text-base font-extrabold tabular-nums ${levelStyle.percentText}`}
          >
            {occupancy}%
          </strong>
        </div>

        <div
          className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-[var(--border-subtle)]"
          role="progressbar"
          aria-label={`${copy.occupancy}: ${title}`}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={clampedPercent}
          aria-valuetext={`${occupancy}% ${copy.occupancy}`}
        >
          <span
            className={`block h-full rounded-full transition-[width] duration-300 motion-reduce:transition-none ${levelStyle.bar}`}
            style={{ width: `${clampedPercent}%` }}
          />
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-1 text-xs text-bq-muted tabular-nums">
          <Users
            className="h-3.5 w-3.5 shrink-0 text-bq-navy"
            strokeWidth={2}
            absoluteStrokeWidth
            aria-hidden="true"
          />
          <strong className="font-bold text-bq-navy">
            {attendance.toLocaleString(locale)}
          </strong>
          <span>{copy.people}</span>
          <span aria-hidden="true">/</span>
          <span>
            {event.capacity.toLocaleString(locale)} {copy.capacity}
          </span>
        </div>
      </div>

      {/* Meta pills limpias */}
      <div className="mt-3 flex flex-wrap gap-1.5 text-[0.6875rem] font-semibold">
        <span className="inline-flex items-center gap-1 rounded-full bg-[var(--surface-muted)] px-2.5 py-1 leading-none text-bq-text">
          <Clock
            className="h-3 w-3 shrink-0 text-bq-navy"
            strokeWidth={2}
            absoluteStrokeWidth
            aria-hidden="true"
          />
          <span>
            {copy.schedule} · {event.schedule}
          </span>
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-[var(--surface-muted)] px-2.5 py-1 leading-none text-bq-text">
          <CloudSun
            className="h-3 w-3 shrink-0 text-bq-navy"
            strokeWidth={2}
            absoluteStrokeWidth
            aria-hidden="true"
          />
          <span>{weatherLabel}</span>
        </span>
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 leading-none ${
            event.accessibleEntry && accessibleRoute
              ? "bg-bq-sky font-bold text-bq-navy"
              : "bg-[var(--surface-muted)] text-bq-text"
          }`}
        >
          <Accessibility
            className="h-3 w-3 shrink-0 text-bq-navy"
            strokeWidth={2}
            absoluteStrokeWidth
            aria-hidden="true"
          />
          <span>{accessLabel}</span>
        </span>
      </div>

      {/* CTA principal: Ir sin aglomeración */}
      {onNavigate ? (
        <button
          type="button"
          onClick={() => onNavigate({ ...event.coords, label: title })}
          aria-label={`${copy.goThere}: ${title}`}
          className="bq-touch-target mt-3.5 inline-flex min-h-10 w-full items-center justify-between gap-2 rounded-xl bg-bq-navy pe-3 ps-3.5 py-2 text-xs font-bold text-white transition-[background-color,opacity] duration-100 hover:bg-bq-navy-deep active:opacity-85"
        >
          <span className="inline-flex items-center gap-1.5">
            <Navigation
              className="h-3.5 w-3.5 shrink-0"
              strokeWidth={2.25}
              absoluteStrokeWidth
              aria-hidden="true"
            />
            <span>{copy.goThere}</span>
          </span>
          <ArrowUpRight
            className="h-4 w-4 shrink-0"
            strokeWidth={2.25}
            absoluteStrokeWidth
            aria-hidden="true"
          />
        </button>
      ) : (
        <a
          href={destination}
          target="_blank"
          rel="noreferrer"
          aria-label={`${copy.directions}: ${title}`}
          className="bq-touch-target mt-3.5 inline-flex min-h-10 w-full items-center justify-between gap-2 rounded-xl bg-bq-navy pe-3 ps-3.5 py-2 text-xs font-bold text-white transition-[background-color,opacity] duration-100 hover:bg-bq-navy-deep active:opacity-85"
        >
          <span className="inline-flex items-center gap-1.5">
            <Navigation
              className="h-3.5 w-3.5 shrink-0"
              strokeWidth={2.25}
              absoluteStrokeWidth
              aria-hidden="true"
            />
            <span>{copy.directions}</span>
          </span>
          <ArrowUpRight
            className="h-4 w-4 shrink-0"
            strokeWidth={2.25}
            absoluteStrokeWidth
            aria-hidden="true"
          />
        </a>
      )}
    </article>
  );
}
