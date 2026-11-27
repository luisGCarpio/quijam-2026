"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { useBQ360 } from "@/context/BQ360Context";
import type { ExploreCategory, ExplorePoi } from "@/data/explore-pois";
import type { LatLng } from "@/types/bq360";

interface ExploreMapProps {
  pois: ExplorePoi[];
  height?: number;
  compact?: boolean;
}

interface MapView {
  lat: number;
  lng: number;
  zoom: number;
}

const TILE_SIZE = 256;
const MIN_ZOOM = 11;
const MAX_ZOOM = 16;
const DEFAULT_VIEW: MapView = { lat: 10.992, lng: -74.797, zoom: 13 };

const CATEGORY_COLORS: Record<ExploreCategory, string> = {
  turismo: "bg-sky-500",
  cultura: "bg-fuchsia-500",
  comercio: "bg-amber-400",
  ambiente: "bg-emerald-600",
};

const CATEGORY_RINGS: Record<ExploreCategory, string> = {
  turismo: "ring-sky-300",
  cultura: "ring-fuchsia-300",
  comercio: "ring-amber-300",
  ambiente: "ring-emerald-300",
};

const CATEGORY_ACCENTS: Record<ExploreCategory, string> = {
  turismo: "border-t-sky-500",
  cultura: "border-t-fuchsia-500",
  comercio: "border-t-amber-400",
  ambiente: "border-t-emerald-600",
};

function project(lat: number, lng: number) {
  const sin = Math.sin((lat * Math.PI) / 180);
  return {
    x: (lng + 180) / 360,
    y: 0.5 - Math.log((1 + sin) / (1 - sin)) / (4 * Math.PI),
  };
}

function unproject(x: number, y: number): LatLng {
  const lng = x * 360 - 180;
  const n = Math.PI - 2 * Math.PI * y;
  const lat = (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));
  return { lat: Math.max(-85, Math.min(85, lat)), lng };
}

function clampZoom(zoom: number) {
  return Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoom));
}

export default function ExploreMap({
  pois,
  height,
  compact = false,
}: ExploreMapProps) {
  const {
    lang,
    t,
    navigateToRoute,
    userLocation,
    locationConfirmed,
    formatPrice,
  } = useBQ360();
  const containerRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ x: number; y: number; lat: number; lng: number } | null>(null);
  const didDragRef = useRef(false);
  const [view, setView] = useState<MapView>(DEFAULT_VIEW);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [selected, setSelected] = useState<ExplorePoi | null>(null);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;
    const update = () =>
      setSize({ width: element.clientWidth, height: element.clientHeight });
    update();
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const activeSelected = useMemo(
    () =>
      selected && pois.some((poi) => poi.id === selected.id)
        ? selected
        : null,
    [pois, selected]
  );

  const scale = TILE_SIZE * 2 ** view.zoom;
  const center = project(view.lat, view.lng);
  const offsetX = center.x * scale - size.width / 2;
  const offsetY = center.y * scale - size.height / 2;

  const toScreen = useCallback(
    (point: LatLng) => {
      const projected = project(point.lat, point.lng);
      return {
        left: projected.x * scale - offsetX,
        top: projected.y * scale - offsetY,
      };
    },
    [offsetX, offsetY, scale]
  );

  const tiles = useMemo(() => {
    if (!size.width || !size.height) return [];
    const tileCount = 2 ** view.zoom;
    const startX = Math.floor(offsetX / TILE_SIZE);
    const endX = Math.floor((offsetX + size.width) / TILE_SIZE);
    const startY = Math.floor(offsetY / TILE_SIZE);
    const endY = Math.floor((offsetY + size.height) / TILE_SIZE);
    const result: Array<{ key: string; left: number; top: number; url: string }> = [];

    for (let x = startX; x <= endX; x += 1) {
      for (let y = startY; y <= endY; y += 1) {
        if (y < 0 || y >= tileCount) continue;
        const wrappedX = ((x % tileCount) + tileCount) % tileCount;
        result.push({
          key: `${view.zoom}/${x}/${y}`,
          left: x * TILE_SIZE - offsetX,
          top: y * TILE_SIZE - offsetY,
          url: `https://tile.openstreetmap.org/${view.zoom}/${wrappedX}/${y}.png`,
        });
      }
    }
    return result;
  }, [offsetX, offsetY, size, view.zoom]);

  const zoomBy = (delta: number) => {
    setView((previous) => ({
      ...previous,
      zoom: clampZoom(previous.zoom + delta),
    }));
  };

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    if ((event.target as HTMLElement).closest("button, a, input")) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {
      x: event.clientX,
      y: event.clientY,
      lat: view.lat,
      lng: view.lng,
    };
    didDragRef.current = false;
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag) return;
    const dx = event.clientX - drag.x;
    const dy = event.clientY - drag.y;
    if (Math.abs(dx) + Math.abs(dy) > 3) didDragRef.current = true;
    const dragScale = TILE_SIZE * 2 ** view.zoom;
    const dragCenter = project(drag.lat, drag.lng);
    const next = unproject(
      dragCenter.x - dx / dragScale,
      dragCenter.y - dy / dragScale
    );
    setView((previous) => ({ ...previous, lat: next.lat, lng: next.lng }));
  };

  const handlePointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (
      dragRef.current &&
      event.currentTarget.hasPointerCapture(event.pointerId)
    ) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    dragRef.current = null;
  };

  const selectedPrice =
    activeSelected?.priceCop === 0
      ? t("explore.card.free")
      : typeof activeSelected?.priceCop === "number"
        ? `${t("explore.card.from")} ${formatPrice(activeSelected.priceCop)}`
        : t("explore.card.consult");

  return (
    <div
      ref={containerRef}
      role="region"
      aria-label={t("map.exploreMap")}
      className="relative w-full touch-none overflow-hidden rounded-3xl border border-slate-200 bg-bq-sky"
      style={{ height: height ?? (compact ? 230 : 430) }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onClick={() => {
        if (!didDragRef.current) setSelected(null);
      }}
    >
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(var(--border-subtle) 1px, transparent 1px), linear-gradient(90deg, var(--border-subtle) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      {tiles.map((tile) => (
        <div
          key={tile.key}
          className="pointer-events-none absolute select-none"
          style={{
            left: tile.left,
            top: tile.top,
            width: TILE_SIZE,
            height: TILE_SIZE,
            backgroundImage: `url(${tile.url})`,
            backgroundSize: "256px 256px",
          }}
        />
      ))}

      {pois.map((poi) => {
        const screen = toScreen(poi.coords);
        if (
          screen.left < -24 ||
          screen.top < -24 ||
          screen.left > size.width + 24 ||
          screen.top > size.height + 24
        ) {
          return null;
        }
        const active = activeSelected?.id === poi.id;
        return (
          <button
            key={poi.id}
            type="button"
            onPointerDown={(event) => event.stopPropagation()}
            onClick={(event) => {
              event.stopPropagation();
              setSelected(poi);
            }}
            className="absolute z-20 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bq-navy"
            style={{ left: screen.left, top: screen.top }}
            aria-label={`${poi.name[lang] || poi.name.es} - ${t(`explore.category.${poi.category}`)}`}
            aria-pressed={active}
            title={poi.name[lang] || poi.name.es}
          >
            <span className={`flex h-6 w-6 items-center justify-center rounded-full border-2 border-white shadow-md ${CATEGORY_COLORS[poi.category]} ${active ? `ring-4 ${CATEGORY_RINGS[poi.category]}` : ""}`}><span className="h-2 w-2 rounded-full bg-white" /></span>
          </button>
        );
      })}

      {locationConfirmed && (() => {
        const screen = toScreen(userLocation);
        return (
          <div
            className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-1/2"
            style={{ left: screen.left, top: screen.top }}
            aria-hidden="true"
          >
            <span className="absolute -inset-3 animate-ping rounded-full bg-sky-400/30" />
            <span className="relative block h-4 w-4 rounded-full border-2 border-white bg-sky-500 shadow" />
          </div>
        );
      })()}

      <div
        className="absolute left-3 top-3 z-30 flex items-center gap-2 rounded-full bg-white/95 px-3 py-1.5 text-[11px] font-extrabold text-bq-navy shadow-sm ring-1 ring-black/5"
        onClick={(event) => event.stopPropagation()}
      >
        <span className="h-2 w-2 rounded-full bg-bq-yellow" />
        {t("app.city")}
        <span className="text-slate-400">·</span>
        <span className="font-semibold text-slate-500">
          {pois.length} {t("map.pois")}
        </span>
      </div>

      <div
        className="absolute right-3 top-3 z-30 flex flex-col gap-1.5"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={() => zoomBy(1)}
          className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/95 text-lg font-bold text-bq-navy shadow-sm ring-1 ring-black/5 transition hover:bg-white active:scale-95"
          aria-label={t("map.zoomIn")}
        >
          +
        </button>
        <button
          type="button"
          onClick={() => zoomBy(-1)}
          className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/95 text-lg font-bold text-bq-navy shadow-sm ring-1 ring-black/5 transition hover:bg-white active:scale-95"
          aria-label={t("map.zoomOut")}
        >
          −
        </button>
        {locationConfirmed ? <button
          type="button"
          onClick={() =>
            setView({ lat: userLocation.lat, lng: userLocation.lng, zoom: 15 })
          }
          className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/95 text-bq-navy shadow-sm ring-1 ring-black/5 transition hover:bg-white active:scale-95"
          aria-label={t("map.center")}
        >
          <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
            <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
            <path d="M12 2v3M12 19v3M2 12h3M19 12h3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </button> : null}
      </div>

      {!activeSelected ? (
        <div className="pointer-events-none absolute inset-x-3 bottom-3 z-20 rounded-2xl bg-bq-navy/85 px-3 py-2 text-center text-[11px] font-semibold text-white backdrop-blur">
          {t("map.hint")}
        </div>
      ) : null}

      {activeSelected ? (
        <div
          className={`absolute inset-x-3 bottom-3 z-30 max-h-[calc(100%-1.5rem)] touch-pan-y overflow-y-auto overscroll-contain rounded-2xl border-t-4 bg-[var(--surface-card)] p-3 shadow-xl ring-1 ring-black/5 ${CATEGORY_ACCENTS[activeSelected.category]}`}
          onClick={(event) => event.stopPropagation()}
          onPointerDown={(event) => event.stopPropagation()}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-wide text-slate-400">
                {t(`explore.category.${activeSelected.category}`)}
              </p>
              <h3 className="text-sm font-extrabold leading-tight text-bq-navy">
                {activeSelected.name[lang] || activeSelected.name.es}
              </h3>
              <p className="mt-1 text-[11px] text-slate-500">{activeSelected.address}</p>
            </div>
            <button
              type="button"
              onClick={() => setSelected(null)}
              className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-bold text-slate-500"
              aria-label={t("common.close")}
            >
              ×
            </button>
          </div>
          <p className="mt-2 text-xs font-bold text-bq-text">{t(activeSelected.accessible === true ? "explore.card.accessible" : activeSelected.accessible === false ? "explore.card.notAccessible" : "explore.card.accessibleUnknown")}</p>
          <p className="mt-1 text-xs font-bold text-bq-text">{t(activeSelected.coordAccuracy === "verified" ? "explore.card.verifiedLocation" : "explore.card.approxLocation")}</p>
          {activeSelected.locationNote ? <p className="mt-1 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-muted)] p-2 text-xs text-bq-text">{activeSelected.locationNote[lang] || activeSelected.locationNote.es}</p> : null}
          <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs font-extrabold text-bq-navy">{t("explore.card.price")}: {selectedPrice}</span>
            <button
              type="button"
              onClick={() => {
                navigateToRoute({
                  lat: activeSelected.coords.lat,
                  lng: activeSelected.coords.lng,
                  label: activeSelected.name[lang] || activeSelected.name.es,
                });
                setSelected(null);
              }}
              className="inline-flex items-center gap-1.5 rounded-xl bg-bq-green px-3 py-2 text-[11px] font-extrabold text-white shadow-sm transition hover:bg-bq-green/90 active:scale-95"
            >
              <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5" aria-hidden="true">
                <path d="m4 11 16-7-7 16-2.5-6.5L4 11Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
              </svg>
              {t("explore.card.viewMap")}
            </button>
          </div>
        </div>
      ) : null}

      <a
        href="https://www.openstreetmap.org/copyright"
        target="_blank"
        rel="noreferrer"
        className="absolute bottom-1 right-1 z-30 rounded bg-white/80 px-1 text-[9px] font-semibold text-slate-500"
        onClick={(event) => event.stopPropagation()}
      >
        {t("map.attribution")}
      </a>
    </div>
  );
}
