"use client";

import type { ExploreCategory, ExplorePoi } from "@/data/explore-pois";
import { useBQ360 } from "@/context/BQ360Context";

interface ExploreCardProps {
  poi: ExplorePoi;
}

const CATEGORY_STYLES: Record<
  ExploreCategory,
  { gradient: string; badge: string; icon: string }
> = {
  turismo: {
    gradient: "from-sky-500 via-cyan-500 to-blue-600",
    badge: "bg-white/95 text-sky-700",
    icon: "bg-sky-100 text-sky-700",
  },
  cultura: {
    gradient: "from-fuchsia-500 via-purple-500 to-indigo-600",
    badge: "bg-white/95 text-fuchsia-700",
    icon: "bg-fuchsia-100 text-fuchsia-700",
  },
  comercio: {
    gradient: "from-amber-400 via-orange-400 to-rose-500",
    badge: "bg-[#0B2545] text-amber-300",
    icon: "bg-amber-100 text-amber-700",
  },
  ambiente: {
    gradient: "from-emerald-500 via-green-500 to-teal-600",
    badge: "bg-white/95 text-emerald-700",
    icon: "bg-emerald-100 text-emerald-700",
  },
};

function CategoryIcon({ category }: { category: ExploreCategory }) {
  const common = "h-7 w-7";
  if (category === "turismo") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={common} aria-hidden="true">
        <path d="M12 21s6-5.1 6-10a6 6 0 1 0-12 0c0 4.9 6 10 6 10Z" stroke="currentColor" strokeWidth="1.8" />
        <circle cx="12" cy="11" r="2.2" stroke="currentColor" strokeWidth="1.8" />
      </svg>
    );
  }
  if (category === "cultura") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={common} aria-hidden="true">
        <path d="M4 19V9l8-5 8 5v10" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M8 19v-5h8v5M4 19h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    );
  }
  if (category === "comercio") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={common} aria-hidden="true">
        <path d="M5 8h14l-1 12H6L5 8Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M9 8a3 3 0 0 1 6 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" className={common} aria-hidden="true">
      <path d="M20 4C13 4 6 7 6 14c0 3 2 5 5 5 7 0 9-7 9-15Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M4 21c2-5 5-8 10-11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function AccessibilityBadge({
  accessible,
  t,
}: {
  accessible: boolean | undefined;
  t: (key: string) => string;
}) {
  if (accessible === true) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700 ring-1 ring-emerald-200">
        <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5" aria-hidden="true">
          <path d="m5 13 4 4L19 7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {t("explore.card.accessible")}
      </span>
    );
  }
  if (accessible === false) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-500 ring-1 ring-slate-200">
        <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5" aria-hidden="true">
          <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
        </svg>
        {t("explore.card.notAccessible")}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-bold text-amber-700 ring-1 ring-amber-200">
      <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5" aria-hidden="true">
        <path d="M12 8v5M12 17h.01" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
      </svg>
      {t("explore.card.accessibleUnknown")}
    </span>
  );
}

export default function ExploreCard({ poi }: ExploreCardProps) {
  const { formatPrice, currency, lang, t, navigateToRoute } = useBQ360();
  const style = CATEGORY_STYLES[poi.category];
  const name = poi.name[lang] || poi.name.es;
  const description = poi.description[lang] || poi.description.es;

  const priceLabel =
    poi.priceCop === 0
      ? t("explore.card.free")
      : typeof poi.priceCop === "number"
        ? `${t("explore.card.from")} ${formatPrice(poi.priceCop)}`
        : t("explore.card.consult");

  return (
    <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className={`relative h-28 bg-gradient-to-br ${style.gradient}`}>
        {poi.image ? (
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${poi.image})` }}
            role="img"
            aria-label={name}
          />
        ) : (
          <>
            <div className="absolute -right-6 -top-8 h-28 w-28 rounded-full bg-white/15" />
            <div className="absolute -bottom-10 left-10 h-24 w-24 rounded-full bg-white/10" />
            <div className="absolute right-16 top-4 h-2 w-2 rounded-full bg-white/40" />
            <div className="absolute bottom-5 right-6 h-3 w-3 rounded-full bg-white/30" />
            <div className="absolute bottom-4 left-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 text-white ring-1 ring-white/30 backdrop-blur">
              <CategoryIcon category={poi.category} />
            </div>
          </>
        )}
        <span className={`absolute left-4 top-4 rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide ${style.badge}`}>
          {t(`explore.category.${poi.category}`)}
        </span>
        <span
          className="absolute right-4 top-4 rounded-full bg-black/25 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur"
          title={currency}
          aria-label={`${priceLabel} (${currency})`}
        >
          {priceLabel}
        </span>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-base font-extrabold leading-tight text-[#0B2545]">
            {name}
          </h3>
          <AccessibilityBadge accessible={poi.accessible} t={t} />
        </div>

        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          {description}
        </p>

        <div className="mt-3 flex items-start gap-2 text-xs text-slate-500">
          <svg viewBox="0 0 24 24" fill="none" className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" aria-hidden="true">
            <path d="M12 21s6-5.1 6-10a6 6 0 1 0-12 0c0 4.9 6 10 6 10Z" stroke="currentColor" strokeWidth="1.8" />
            <circle cx="12" cy="11" r="2.2" stroke="currentColor" strokeWidth="1.8" />
          </svg>
          <div className="min-w-0">
            <p>{poi.address}</p>
            <p className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold ${
              poi.coordAccuracy === "verified"
                ? "bg-emerald-50 text-emerald-700"
                : "bg-amber-50 text-amber-700"
            }`}>
              {poi.coordAccuracy === "verified"
                ? t("explore.card.verifiedLocation")
                : t("explore.card.approxLocation")}
            </p>
          </div>
        </div>

        {poi.locationNote ? (
          <p className="mt-2 rounded-xl bg-amber-50 px-3 py-2 text-[11px] leading-relaxed text-amber-800 ring-1 ring-amber-100">
            {poi.locationNote[lang] || poi.locationNote.es}
          </p>
        ) : null}

        <div className="mt-3 flex flex-wrap gap-1.5">
          {poi.isPopularEconomy ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-[#FACC15] px-2.5 py-1 text-[10px] font-extrabold text-[#0B2545]">
              <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5" aria-hidden="true">
                <path d="M12 3v18M17 7.5c0-1.4-2.2-2.5-5-2.5S7 6.1 7 7.5 9.2 10 12 10s5 1.1 5 2.5S14.8 15 12 15s-5 1.1-5 2.5S9.2 20 12 20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
              {t("explore.card.popularEconomy")}
            </span>
          ) : null}
          {poi.sustainabilityTags.slice(0, 3).map((tag) => (
            <span key={tag} className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${style.icon}`}>
              {t(`explore.tags.${tag}`)}
            </span>
          ))}
          {poi.accessibilityTags.slice(0, 2).map((tag) => (
            <span key={tag} className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold text-slate-600">
              {t(`explore.tags.${tag}`)}
            </span>
          ))}
        </div>

        {poi.priceCop && poi.priceCop > 0 ? (
          <p className="mt-2 text-[10px] text-slate-400">
            {poi.priceNote?.[lang] || poi.priceNote?.es || t("explore.card.priceNote")}
          </p>
        ) : null}

        <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-100 pt-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
              {t("explore.card.location")}
            </p>
            <p className="text-sm font-extrabold text-[#0B2545]">{priceLabel}</p>
          </div>
          <button
            type="button"
            onClick={() =>
              navigateToRoute({
                lat: poi.coords.lat,
                lng: poi.coords.lng,
                label: name,
              })
            }
            className="inline-flex items-center gap-2 rounded-2xl bg-[#15803D] px-4 py-2.5 text-xs font-extrabold text-white shadow-sm transition hover:bg-[#166534] active:scale-95"
          >
            <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
              <path d="m4 11 16-7-7 16-2.5-6.5L4 11Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
            </svg>
            {t("explore.card.viewMap")}
          </button>
        </div>
      </div>
    </article>
  );
}
