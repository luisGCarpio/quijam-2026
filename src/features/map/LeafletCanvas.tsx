"use client";

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useBQ360 } from "@/context/BQ360Context";
import { calculateRoutes, type RouteResult } from "@/lib/routing";
import type { LatLng, Poi } from "@/types/bq360";

interface LeafletCanvasProps {
  onRouteResult: (result: RouteResult | null) => void;
}

/* Paleta oficial DESIGN.md para capas de mapa */
const LAYER_COLORS: Record<Poi["layer"], string> = {
  turismo: "#6AB4E2",
  salud: "#D9323B",
  movilidad: "#10284B",
  cultura: "#F3C922",
  ambiente: "#268C44",
  comercio: "#F3C922",
  seguridad: "#10284B",
};

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export default function LeafletCanvas({ onRouteResult }: LeafletCanvasProps) {
  const {
    simulation,
    weather,
    events,
    arroyos,
    pois,
    activeLayers,
    routeRequest,
    reports,
    lang,
    formatPrice,
    navigateToRoute,
  } = useBQ360();
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const overlaysRef = useRef<L.Layer[]>([]);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = L.map(containerRef.current, {
      zoomControl: false,
      attributionControl: true,
    }).setView([10.9878, -74.7889], 12);
    L.control.zoom({ position: "bottomright" }).addTo(map);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "&copy; OpenStreetMap",
    }).addTo(map);
    mapRef.current = map;
    setMapReady(true);
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mapReady) return;
    const map = mapRef.current;
    if (!map) return;

    for (const layer of overlaysRef.current) {
      map.removeLayer(layer);
    }
    overlaysRef.current = [];

    const activeEvents = events.filter(
      (event) => event.mode === simulation.mode
    );
    for (const event of activeEvents) {
      const attendanceRatio = Math.min(
        1,
        (event.baseAttendance / event.capacity) * simulation.crowdMultiplier
      );
      const fillColor =
        attendanceRatio >= 0.85
          ? "#D9323B"
          : attendanceRatio >= 0.6
            ? "#F3C922"
            : "#268C44";
      const radius =
        event.radiusMeters * Math.max(0.85, simulation.crowdMultiplier);
      const circle = L.circle([event.coords.lat, event.coords.lng], {
        radius,
        color: fillColor,
        weight: 3,
        fillColor,
        fillOpacity: attendanceRatio >= 0.85 ? 0.38 : 0.24,
        className: attendanceRatio >= 0.85 ? "bq360-pulse" : "",
      }).addTo(map);
      circle.bindPopup(
        `<strong>${escapeHtml(event.name[lang])}</strong><br>${escapeHtml(event.venue)}<br>${Math.round(attendanceRatio * 100)}%`
      );
      overlaysRef.current.push(circle);
    }

    const arroyosActive =
      simulation.scenarioId === "rain_arroyos" ||
      weather.arroyoRisk === "critico";
    for (const arroyo of arroyos) {
      const polygon = L.polygon(
        arroyo.coords.map((point) => [point.lat, point.lng] as [number, number]),
        {
          color: arroyosActive ? "#D9323B" : "#F3C922",
          weight: arroyosActive ? 5 : 2,
          dashArray: arroyosActive ? "10 7" : "5 8",
          fillColor: arroyosActive ? "#D9323B" : "#F3C922",
          fillOpacity: arroyosActive ? 0.3 : 0.14,
        }
      ).addTo(map);
      polygon.bindPopup(
        `<strong>${escapeHtml(arroyo.name)}</strong><br>${arroyosActive ? "Riesgo activo" : "Vigilancia"}`
      );
      overlaysRef.current.push(polygon);
    }

    for (const poi of pois) {
      if (!activeLayers[poi.layer]) continue;
      const marker = L.circleMarker([poi.coords.lat, poi.coords.lng], {
        radius: 7,
        color: "#FFFFFF",
        weight: 2,
        fillColor: LAYER_COLORS[poi.layer],
        fillOpacity: 1,
      }).addTo(map);
      const price = poi.priceCop
        ? `<br><strong>${escapeHtml(formatPrice(poi.priceCop))}</strong>`
        : "";
      const routeCta =
        lang === "en"
          ? "Route here"
          : lang === "pt"
            ? "Ir aqui"
            : lang === "fr"
              ? "Y aller"
              : "Ir aquí";
      marker.bindPopup(
        `<strong>${escapeHtml(poi.name[lang])}</strong><br>${escapeHtml(poi.description[lang])}${price}<br>` +
          `<button id="route-${escapeHtml(poi.id)}" style="margin-top:8px;border:0;border-radius:10px;background:#10284B;color:#FFFFFF;font-weight:700;padding:7px 12px;cursor:pointer">${routeCta}</button>`
      );
      marker.on("popupopen", () => {
        document.getElementById(`route-${poi.id}`)?.addEventListener(
          "click",
          () => navigateToRoute({ ...poi.coords, label: poi.name[lang] }),
          { once: true }
        );
      });
      overlaysRef.current.push(marker);
    }

    for (const report of reports) {
      const marker = L.circleMarker([report.lat, report.lng], {
        radius: report.severity === "alta" ? 9 : 7,
        color: "#FFFFFF",
        weight: 2,
        fillColor: report.severity === "alta" ? "#D9323B" : "#F3C922",
        fillOpacity: 0.95,
      }).addTo(map);
      marker.bindPopup(
        `<strong>${escapeHtml(report.title)}</strong>${report.description ? `<br>${escapeHtml(report.description)}` : ""}`
      );
      overlaysRef.current.push(marker);
    }
  }, [
    activeLayers,
    arroyos,
    events,
    formatPrice,
    lang,
    mapReady,
    navigateToRoute,
    pois,
    reports,
    simulation,
    weather.arroyoRisk,
  ]);

  useEffect(() => {
    if (!mapReady || !mapRef.current) return;
    const map = mapRef.current;
    const routeLayers: L.Layer[] = [];
    let cancelled = false;

    if (!routeRequest) {
      onRouteResult(null);
      return;
    }

    const drawRoutes = (origin: LatLng, destination: LatLng) => {
      void calculateRoutes(origin, destination).then((result) => {
        if (cancelled) return;
        const direct = L.polyline(
          result.directPath.map(
            (point) => [point.lat, point.lng] as [number, number]
          ),
          { color: "#D9323B", weight: 6, opacity: 0.85, dashArray: "10 8" }
        ).addTo(map);
        const alternative = L.polyline(
          result.alternativePath.map(
            (point) => [point.lat, point.lng] as [number, number]
          ),
          { color: "#268C44", weight: 7, opacity: 1 }
        ).addTo(map);
        routeLayers.push(direct, alternative);
        overlaysRef.current.push(direct, alternative);
        map.fitBounds(alternative.getBounds(), { padding: [32, 32] });
        onRouteResult(result);
      });
    };

    drawRoutes(routeRequest.origin, routeRequest.destination);
    return () => {
      cancelled = true;
      for (const layer of routeLayers) {
        map.removeLayer(layer);
        const index = overlaysRef.current.indexOf(layer);
        if (index >= 0) overlaysRef.current.splice(index, 1);
      }
    };
  }, [mapReady, onRouteResult, routeRequest]);

  return (
    <div
      ref={containerRef}
      className="h-[340px] w-full bg-[var(--surface-muted)]"
      aria-label="Interactive Barranquilla map"
    />
  );
}
