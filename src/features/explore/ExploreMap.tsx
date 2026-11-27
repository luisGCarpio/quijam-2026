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

interface MapRoute {
  points: LatLng[];
  distanceMeters: number;
  durationSeconds: number;
  fallback: boolean;
}

interface OsrmResponse {
  routes?: Array<{
    distance?: number;
    duration?: number;
    geometry?: { coordinates?: [number, number][] };
  }>;
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

function haversineMeters(a: LatLng, b: LatLng) {
  const earthRadius = 6371000;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * earthRadius * Math.asin(Math.sqrt(h));
}

function formatDistance(meters?: number) {
  if (typeof meters !== "number" || !Number.isFinite(meters)) return "—";
  return meters >= 1000 ? `${(meters / 1000).toFixed(1)} km` : `${Math.round(meters)} m`;
}

function formatDuration(seconds?: number) {
  if (typeof seconds !== "number" || !Number.isFinite(seconds)) return "—";
  const minutes = Math.max(1, Math.round(seconds / 60));
  if (minutes < 60) return `${minutes} min`;
  return `${Math.floor(minutes / 60)} h ${minutes % 60} min`;
}

export default function ExploreMap({
  pois,
  height,
  compact = false,
}: ExploreMapProps) {
  const {
    lang,
    t,
    routeRequest,
    clearRoute,
    navigateToRoute,
    userLocation,
    formatPrice,
  } = useBQ360();
  const containerRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ x: number; y: number; lat: number; lng: number } | null>(null);
  const didDragRef = useRef(false);
  const [view, setView] = useState<MapView>(DEFAULT_VIEW);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [selected, setSelected] = useState<ExplorePoi | null>(null);
  const [route, setRoute] = useState<MapRoute | null>(null);
  const [routeLoading, setRouteLoading] = useState(false);
  const [routeFallback, setRouteFallback] = useState(false);

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

  useEffect(() => {
    if (!routeRequest) return;

    const controller = new AbortController();
    let cancelled = false;
    const origin = routeRequest.origin;
    const destination = routeRequest.destination;
    const fallbackDistance = haversineMeters(origin, destination);
    const fallbackRoute: MapRoute = {
      points: [origin, destination],
      distanceMeters: fallbackDistance,
      durationSeconds: fallbackDistance / (25 / 3.6),
      fallback: true,
    };

    async function loadRoute() {
      await Promise.resolve();
      if (cancelled) return;
      setRouteLoading(true);
      setRouteFallback(false);
      try {
        const response = await fetch(
          `https://router.project-osrm.org/route/v1/driving/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?overview=full&geometries=geojson`,
          { signal: controller.signal }
        );
        if (!response.ok) throw new Error("OSRM unavailable");
        const data = (await response.json()) as OsrmResponse;
        const best = data.routes?.[0];
        const coordinates = best?.geometry?.coordinates;
        if (!best || !coordinates || coordinates.length < 2) {
          throw new Error("No route");
        }
        if (cancelled) return;
        setRoute({
          points: coordinates.map(([lng, lat]) => ({ lat, lng })),
          distanceMeters: best.distance ?? fallbackDistance,
          durationSeconds: best.duration ?? fallbackRoute.durationSeconds,
          fallback: false,
        });
      } catch {
        if (cancelled) return;
        setRoute(fallbackRoute);
        setRouteFallback(true);
      } finally {
        if (!cancelled) setRouteLoading(false);
      }
    }

    loadRoute();
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [routeRequest]);

  useEffect(() => {
    if (!routeRequest) return;
    const frame = window.requestAnimationFrame(() => {
      setView({
        lat: (routeRequest.origin.lat + routeRequest.destination.lat) / 2,
        lng: (routeRequest.origin.lng + routeRequest.destination.lng) / 2,
        zoom: 13,
      });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [routeRequest]);

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

  const visibleRoute = routeRequest ? route : null;
  const routePoints = visibleRoute
    ? visibleRoute.points
        .map((point) => {
          const screen = toScreen(point);
          return `${screen.left},${screen.top}`;
        })
        .join(" ")
    : "";

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
      className="relative w-full touch-none overflow-hidden rounded-3xl border border-slate-200 bg-[#dbeafe]"
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
            "linear-gradient(#bfdbfe 1px, transparent 1px), linear-gradient(90deg, #bfdbfe 1px, transparent 1px)",
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

      <svg
        className="pointer-events-none absolute inset-0 z-10"
        width={size.width}
        height={size.height}
        aria-hidden="true"
      >
        {routePoints ? (
          <>
            <polyline
              points={routePoints}
              fill="none"
              stroke="#ffffff"
              strokeWidth={9}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={0.9}
            />
            <polyline
              points={routePoints}
              fill="none"
              stroke={routeFallback ? "#DC2626" : "#15803D"}
              strokeWidth={5}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray={routeFallback ? "9 7" : undefined}
            />
          </>
        ) : null}
      </svg>

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
            className={`absolute z-20 flex h-6 w-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white shadow-md transition hover:scale-110 ${
              CATEGORY_COLORS[poi.category]
            } ${active ? `ring-4 ${CATEGORY_RINGS[poi.category]}` : ""}`}
            style={{ left: screen.left, top: screen.top }}
            aria-label={`${poi.name[lang] || poi.name.es} - ${t(`explore.category.${poi.category}`)}`}
            aria-pressed={active}
            title={poi.name[lang] || poi.name.es}
          >
            <span className="h-2 w-2 rounded-full bg-white" />
          </button>
        );
      })}

      {(() => {
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

      {routeRequest ? (
        <div className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-full" style={toScreen(routeRequest.destination)}>
          <span className="block h-3 w-3 rotate-45 border-2 border-white bg-[#15803D] shadow" />
        </div>
      ) : null}

      <div
        className="absolute left-3 top-3 z-30 flex items-center gap-2 rounded-full bg-white/95 px-3 py-1.5 text-[11px] font-extrabold text-[#0B2545] shadow-sm ring-1 ring-black/5"
        onClick={(event) => event.stopPropagation()}
      >
        <span className="h-2 w-2 rounded-full bg-[#FACC15]" />
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
          className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/95 text-lg font-bold text-[#0B2545] shadow-sm ring-1 ring-black/5 transition hover:bg-white active:scale-95"
          aria-label={t("map.zoomIn")}
        >
          +
        </button>
        <button
          type="button"
          onClick={() => zoomBy(-1)}
          className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/95 text-lg font-bold text-[#0B2545] shadow-sm ring-1 ring-black/5 transition hover:bg-white active:scale-95"
          aria-label={t("map.zoomOut")}
        >
          −
        </button>
        <button
          type="button"
          onClick={() =>
            setView({ lat: userLocation.lat, lng: userLocation.lng, zoom: 15 })
          }
          className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/95 text-[#0B2545] shadow-sm ring-1 ring-black/5 transition hover:bg-white active:scale-95"
          aria-label={t("map.center")}
        >
          <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
            <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
            <path d="M12 2v3M12 19v3M2 12h3M19 12h3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {!routeRequest && !activeSelected ? (
        <div className="pointer-events-none absolute inset-x-3 bottom-3 z-20 rounded-2xl bg-[#0B2545]/85 px-3 py-2 text-center text-[11px] font-semibold text-white backdrop-blur">
          {t("map.hint")}
        </div>
      ) : null}

      {activeSelected && !routeRequest ? (
        <div
          className={`absolute inset-x-3 bottom-3 z-30 rounded-2xl border-t-4 bg-white/95 p-3 shadow-xl ring-1 ring-black/5 backdrop-blur ${CATEGORY_ACCENTS[activeSelected.category]}`}
          onClick={(event) => event.stopPropagation()}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-wide text-slate-400">
                {t(`explore.category.${activeSelected.category}`)}
              </p>
              <h3 className="text-sm font-extrabold leading-tight text-[#0B2545]">
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
          <div className="mt-2 flex items-center justify-between gap-3">
            <span className="text-xs font-extrabold text-[#0B2545]">{selectedPrice}</span>
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
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#15803D] px-3 py-2 text-[11px] font-extrabold text-white shadow-sm transition hover:bg-[#166534] active:scale-95"
            >
              <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5" aria-hidden="true">
                <path d="m4 11 16-7-7 16-2.5-6.5L4 11Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
              </svg>
              {t("explore.card.viewMap")}
            </button>
          </div>
        </div>
      ) : null}

      {routeRequest ? (
        <div
          className="absolute inset-x-3 bottom-3 z-30 rounded-2xl bg-white/95 p-3 shadow-xl ring-1 ring-black/5 backdrop-blur"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[10px] font-extrabold uppercase tracking-wide text-slate-400">
                {t("map.destination")}
              </p>
              <h3 className="truncate text-sm font-extrabold leading-tight text-[#0B2545]">
                {routeRequest.destination.label}
              </h3>
            </div>
            <button
              type="button"
              onClick={clearRoute}
              className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-500"
            >
              {t("map.clearRoute")}
            </button>
          </div>
          <div className="mt-2 flex flex-wrap gap-2 text-[11px] font-semibold text-slate-600">
            <span className="rounded-full bg-slate-100 px-2.5 py-1">
              {t("map.distance")}: {formatDistance(visibleRoute?.distanceMeters)}
            </span>
            <span className="rounded-full bg-slate-100 px-2.5 py-1">
              {t("map.duration")}: {formatDuration(visibleRoute?.durationSeconds)}
            </span>
            {routeLoading ? (
              <span className="rounded-full bg-sky-50 px-2.5 py-1 text-sky-700">
                {t("map.calculating")}
              </span>
            ) : null}
          </div>
          {routeFallback ? (
            <p className="mt-2 rounded-xl bg-amber-50 px-3 py-2 text-[10px] leading-relaxed text-amber-800">
              {t("map.routeFallback")}
            </p>
          ) : null}
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
