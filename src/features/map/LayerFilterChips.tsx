"use client";

import { useBQ360 } from "@/context/BQ360Context";
import type { LayerCategory } from "@/types/bq360";

const LAYERS: LayerCategory[] = [
  "turismo",
  "salud",
  "movilidad",
  "cultura",
  "ambiente",
  "comercio",
  "seguridad",
];

export default function LayerFilterChips() {
  const { activeLayers, toggleLayer, lang, t } = useBQ360();
  const names: Record<LayerCategory, Record<typeof lang, string>> = {
    turismo: { es: "Turismo", en: "Tourism", pt: "Turismo", fr: "Tourisme" },
    salud: { es: "Salud", en: "Health", pt: "Saúde", fr: "Santé" },
    movilidad: { es: "Movilidad", en: "Mobility", pt: "Mobilidade", fr: "Mobilité" },
    cultura: { es: "Cultura", en: "Culture", pt: "Cultura", fr: "Culture" },
    ambiente: { es: "Ambiente", en: "Environment", pt: "Ambiente", fr: "Environnement" },
    comercio: { es: "Comercio", en: "Commerce", pt: "Comércio", fr: "Commerce" },
    seguridad: { es: "Seguridad", en: "Safety", pt: "Segurança", fr: "Sécurité" },
  };

  return (
    <div className="absolute left-3 right-3 top-3 z-[500] flex gap-2 overflow-x-auto pb-1">
      {LAYERS.map((layer) => (
        <button
          key={layer}
          type="button"
          aria-pressed={activeLayers[layer]}
          onClick={() => toggleLayer(layer)}
          className={`whitespace-nowrap rounded-full border px-3 py-2 text-xs font-bold shadow-md backdrop-blur ${
            activeLayers[layer]
              ? "border-[#0B2545] bg-[#0B2545] text-white"
              : "border-slate-200 bg-white/95 text-slate-700"
          }`}
        >
          {names[layer][lang]}
        </button>
      ))}
      <span className="sr-only">{t("map.layers")}</span>
    </div>
  );
}
