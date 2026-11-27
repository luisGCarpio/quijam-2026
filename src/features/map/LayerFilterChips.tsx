"use client";

import type { ComponentType } from "react";
import {
  Bus,
  HeartPulse,
  Landmark,
  Leaf,
  MapPin,
  Shield,
  Store,
} from "lucide-react";
import { useBQ360 } from "@/context/BQ360Context";
import type { LayerCategory, Lang } from "@/types/bq360";

interface LayerConfig {
  id: LayerCategory;
  dotClass: string;
  Icon: ComponentType<{
    className?: string;
    strokeWidth?: number;
    absoluteStrokeWidth?: boolean;
  }>;
  labels: Record<Lang, string>;
}

const LAYERS: readonly LayerConfig[] = [
  {
    id: "turismo",
    dotClass: "bg-bq-sky text-bq-navy",
    Icon: MapPin,
    labels: { es: "Turismo", en: "Tourism", pt: "Turismo", fr: "Tourisme" },
  },
  {
    id: "salud",
    dotClass: "bg-bq-red text-white",
    Icon: HeartPulse,
    labels: { es: "Salud", en: "Health", pt: "Saúde", fr: "Santé" },
  },
  {
    id: "movilidad",
    dotClass: "bg-bq-navy text-white",
    Icon: Bus,
    labels: { es: "Movilidad", en: "Mobility", pt: "Mobilidade", fr: "Mobilité" },
  },
  {
    id: "cultura",
    dotClass: "bg-bq-yellow text-bq-navy",
    Icon: Landmark,
    labels: { es: "Cultura", en: "Culture", pt: "Cultura", fr: "Culture" },
  },
  {
    id: "ambiente",
    dotClass: "bg-bq-green text-white",
    Icon: Leaf,
    labels: { es: "Ambiente", en: "Environment", pt: "Ambiente", fr: "Environnement" },
  },
  {
    id: "comercio",
    dotClass: "bg-bq-yellow text-bq-navy",
    Icon: Store,
    labels: { es: "Comercio", en: "Commerce", pt: "Comércio", fr: "Commerce" },
  },
  {
    id: "seguridad",
    dotClass: "bg-bq-navy text-white",
    Icon: Shield,
    labels: { es: "Seguridad", en: "Safety", pt: "Segurança", fr: "Sécurité" },
  },
];

export default function LayerFilterChips() {
  const { activeLayers, toggleLayer, lang, t } = useBQ360();

  return (
    <div
      role="group"
      aria-label={t("map.layers")}
      className="bq-no-scrollbar absolute left-2.5 right-2.5 top-2.5 z-[500] flex gap-1.5 overflow-x-auto pb-0.5"
    >
      {LAYERS.map(({ id, dotClass, Icon, labels }) => {
        const active = activeLayers[id];
        return (
          <button
            key={id}
            type="button"
            aria-pressed={active}
            onClick={() => toggleLayer(id)}
            className={`bq-touch-target inline-flex min-h-9 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border pe-3 ps-2 py-1 text-xs font-bold shadow-sm backdrop-blur-sm transition-colors duration-100 active:opacity-85 ${
              active
                ? "border-bq-navy bg-bq-navy text-white"
                : "border-[var(--border-subtle)] bg-white/95 text-bq-navy hover:bg-white"
            }`}
          >
            <span
              aria-hidden="true"
              className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                active ? "bg-white/20 text-white" : dotClass
              }`}
            >
              <Icon
                className="h-3 w-3"
                strokeWidth={2}
                absoluteStrokeWidth
              />
            </span>
            <span>{labels[lang]}</span>
          </button>
        );
      })}
    </div>
  );
}
