"use client";

import type { ExploreCategory } from "@/data/explore-pois";
import { useBQ360 } from "@/context/BQ360Context";

export type ExploreFilter = "todos" | ExploreCategory;

interface CategoryPillsProps {
  value: ExploreFilter;
  onChange: (value: ExploreFilter) => void;
  counts: Record<ExploreFilter, number>;
}

const ITEMS: ExploreFilter[] = [
  "todos",
  "turismo",
  "cultura",
  "comercio",
  "ambiente",
];

const ACTIVE_STYLES: Record<ExploreFilter, string> = {
  todos: "border-[#0B2545] bg-[#0B2545] text-white",
  turismo: "border-sky-500 bg-sky-500 text-white",
  cultura: "border-fuchsia-500 bg-fuchsia-500 text-white",
  comercio: "border-amber-500 bg-amber-400 text-[#0B2545]",
  ambiente: "border-emerald-600 bg-emerald-600 text-white",
};

function CategoryIcon({ category }: { category: ExploreFilter }) {
  const common = "h-4 w-4";
  if (category === "todos") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={common} aria-hidden="true">
        <rect x="4" y="4" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
        <rect x="14" y="4" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
        <rect x="4" y="14" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
        <rect x="14" y="14" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
      </svg>
    );
  }
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

function labelFor(category: ExploreFilter, t: (key: string) => string) {
  return category === "todos"
    ? t("explore.all")
    : t(`explore.category.${category}`);
}

export default function CategoryPills({
  value,
  onChange,
  counts,
}: CategoryPillsProps) {
  const { t } = useBQ360();

  return (
    <div
      className="-mx-4 overflow-x-auto px-4 pb-1"
      aria-label={t("explore.filters")}
    >
      <div className="flex w-max gap-2">
        {ITEMS.map((category) => {
          const active = value === category;
          return (
            <button
              key={category}
              type="button"
              onClick={() => onChange(category)}
              aria-pressed={active}
              className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-2 text-xs font-bold transition active:scale-95 ${
                active
                  ? ACTIVE_STYLES[category]
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
              }`}
            >
              <CategoryIcon category={category} />
              <span>{labelFor(category, t)}</span>
              <span
                className={`rounded-full px-1.5 py-0.5 text-[10px] font-extrabold ${
                  active ? "bg-white/25" : "bg-slate-100 text-slate-500"
                }`}
              >
                {counts[category]}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
