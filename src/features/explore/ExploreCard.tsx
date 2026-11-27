"use client";

import type { ExplorePoi } from "@/data/explore-pois";
import { useBQ360 } from "@/context/BQ360Context";

interface ExploreCardProps {
  poi: ExplorePoi;
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
      <span className="inline-flex items-center gap-1 rounded-full bg-[var(--surface-muted)] px-2.5 py-1 text-[10px] font-bold text-bq-green ring-1 ring-[var(--border-subtle)]">
        <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5" aria-hidden="true">
          <path d="m5 13 4 4L19 7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {t("explore.card.accessible")}
      </span>
    );
  }
  if (accessible === false) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-[var(--surface-muted)] px-2.5 py-1 text-[10px] font-bold text-bq-text ring-1 ring-[var(--border-subtle)]">
        <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5" aria-hidden="true">
          <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
        </svg>
        {t("explore.card.notAccessible")}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-[var(--surface-muted)] px-2.5 py-1 text-[10px] font-bold text-bq-text ring-1 ring-[var(--border-subtle)]">
      <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5" aria-hidden="true">
        <path d="M12 8v5M12 17h.01" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
      </svg>
      {t("explore.card.accessibleUnknown")}
    </span>
  );
}

export default function ExploreCard({ poi }: ExploreCardProps) {
  const { formatPrice, lang, t, navigateToRoute } = useBQ360();
  const name = poi.name[lang] || poi.name.es;
  const description = poi.description[lang] || poi.description.es;
  const priceLabel = poi.priceCop === 0
    ? t("explore.card.free")
    : typeof poi.priceCop === "number"
      ? `${t("explore.card.from")} ${formatPrice(poi.priceCop)}`
      : t("explore.card.consult");
  const tags = [
    ...(poi.isPopularEconomy ? [t("explore.card.popularEconomy")] : []),
    ...poi.accessibilityTags.map((tag) => t(`explore.tags.${tag}`)),
    ...poi.sustainabilityTags.map((tag) => t(`explore.tags.${tag}`)),
  ];

  return (
    <article className="overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4 shadow-sm">
      {poi.image ? <div className="mb-3 h-28 rounded-xl bg-cover bg-center" style={{ backgroundImage: `url(${poi.image})` }} role="img" aria-label={name} /> : null}
      <p className="text-xs font-bold text-bq-muted">{t(`explore.category.${poi.category}`)}</p>
      <div className="mt-1 flex flex-wrap items-start justify-between gap-2">
        <h3 className="min-w-0 text-base font-extrabold leading-tight text-bq-navy">{name}</h3>
        <AccessibilityBadge accessible={poi.accessible} t={t} />
      </div>
      <p className="mt-2 text-sm leading-relaxed text-bq-text">{description}</p>
      <p className="mt-2 text-xs text-bq-muted">{poi.address}</p>
      <p className={`mt-1 text-xs font-bold ${poi.coordAccuracy === "verified" ? "text-bq-green" : "text-bq-text"}`}>
        {t(poi.coordAccuracy === "verified" ? "explore.card.verifiedLocation" : "explore.card.approxLocation")}
      </p>
      {poi.locationNote ? <p className="mt-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-muted)] px-3 py-2 text-xs leading-relaxed text-bq-text">{poi.locationNote[lang] || poi.locationNote.es}</p> : null}
      {tags.length > 0 ? <div className="mt-2 flex flex-wrap gap-1.5">{tags.slice(0, 2).map((tag, index) => <span key={`${tag}-${index}`} className="rounded-full bg-[var(--surface-muted)] px-2.5 py-1 text-xs font-semibold text-bq-text">{tag}</span>)}</div> : null}
      {tags.length > 2 ? <details className="mt-2 text-xs text-bq-text"><summary className="cursor-pointer font-bold text-bq-green">{t("explore.card.details")}</summary><div className="mt-2 flex flex-wrap gap-1.5">{tags.slice(2).map((tag, index) => <span key={`${tag}-${index}`} className="rounded-full bg-[var(--surface-muted)] px-2.5 py-1">{tag}</span>)}</div></details> : null}
      {poi.priceCop && poi.priceCop > 0 ? <p className="mt-2 text-xs text-bq-muted">{poi.priceNote?.[lang] || poi.priceNote?.es || t("explore.card.priceNote")}</p> : null}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border-subtle)] pt-3">
        <p className="text-sm font-extrabold text-bq-navy"><span className="font-medium text-bq-muted">{t("explore.card.price")}: </span>{priceLabel}</p>
        <button type="button" onClick={() => navigateToRoute({ ...poi.coords, label: name })} className="min-h-11 rounded-xl bg-bq-green px-4 py-2 text-xs font-extrabold text-white hover:bg-bq-green/90">{t("explore.card.viewMap")}</button>
      </div>
    </article>
  );
}
