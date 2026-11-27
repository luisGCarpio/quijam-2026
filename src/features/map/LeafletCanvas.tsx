"use client";

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { ALL_POIS } from "@/data/all-pois";
import { ARROYO_ZONES } from "@/data/arroyos";
import { CITY_EVENTS } from "@/data/events";
import { useBQ360 } from "@/context/BQ360Context";
import { calculateRoutes, type RouteResult } from "@/lib/routing";
import type { LatLng, Poi } from "@/types/bq360";

interface LeafletCanvasProps {
  onRouteResult: (result: RouteResult | null) => void;
}

const LAYER_COLORS: Record<Poi["layer"], string> = {
  turismo: "#38BDF8",
  salud: "#DC2626",
  movilidad: "#0B2545",
  cultura: "#9333EA",
  ambiente: "#15803D",
  comercio: "#F59E0B",
  seguridad: "#2563EB",
};

export default function LeafletCanvas({ onRouteResult }: LeafletCanvasProps) {
  const {
    simulation,
    weather,
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

    const activeEvents = CITY_EVENTS.filter((event) => event.mode === simulation.mode);
    for (const event of activeEvents) {
      const attendanceRatio =
        Math.min(1, (event.baseAttendance / event.capacity) * simulation.crowdMultiplier);
      const fillColor =
        attendanceRatio >= 0.85 ? "#DC2626" : attendanceRatio >= 0.60 ? "#FACC15" : "#15803D";
      const radius = event.radiusMeters * Math.max(0.85, simulation.crowdMultiplier);
      const circle = L.circle([event.coords.lat, event.coords.lng], {
        radius,
        color: fillColor,
        weight: 3,
        fillColor,
        fillOpacity: attendanceRatio >= 0.85 ? 0.42 : 0.28,
        className: attendanceRatio >= 0.85 ? "bq360-pulse" : "",
      }).addTo(map);
      circle.bindPopup(
        `<strong>${event.name[lang]}</strong><br>${event.venue}<br>${Math.round(attendanceRatio * 100)}%`
      );
      overlaysRef.current.push(circle);
    }

    const arroyosActive =
      simulation.scenarioId === "rain_arroyos" || weather.arroyoRisk === "critico";
    for (const arroyo of ARROYO_ZONES) {
      const polygon = L.polygon(
        arroyo.coords.map((point) => [point.lat, point.lng] as [number, number]),
        {
          color: arroyosActive ? "#DC2626" : "#F59E0B",
          weight: arroyosActive ? 5 : 2,
          dashArray: arroyosActive ? "10 7" : "5 8",
          fillColor: arroyosActive ? "#DC2626" : "#FACC15",
          fillOpacity: arroyosActive ? 0.32 : 0.12,
        }
      ).addTo(map);
      polygon.bindPopup(`<strong>${arroyo.name}</strong><br>${arroyosActive ? "Riesgo activo" : "Vigilancia"}`);
      overlaysRef.current.push(polygon);
    }

    for (const poi of ALL_POIS) {
      if (!activeLayers[poi.layer]) continue;
      const marker = L.circleMarker([poi.coords.lat, poi.coords.lng], {
        radius: 7,
        color: "#FFFFFF",
        weight: 2,
        fillColor: LAYER_COLORS[poi.layer],
        fillOpacity: 1,
      }).addTo(map);
      const price = poi.priceCop
        ? `<br><strong>${formatPrice(poi.priceCop)}</strong>`
        : "";
      marker.bindPopup(
        `<strong>${poi.name[lang]}</strong><br>${poi.description[lang]}${price}<br>` +
        `<button id="route-${poi.id}" style="margin-top:8px;border:0;border-radius:8px;background:#0B2545;color:white;padding:7px 10px">Ir aquí</button>`
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
        fillColor: report.severity === "alta" ? "#DC2626" : "#F59E0B",
        fillOpacity: 0.9,
      }).addTo(map);
      marker.bindPopup(`<strong>${report.title}</strong><br>${report.description ?? ""}`);
      overlaysRef.current.push(marker);
    }
  }, [activeLayers, formatPrice, lang, mapReady, navigateToRoute, reports, simulation, weather.arroyoRisk]);

  useEffect(() => {
    if (!mapReady || !mapRef.current) return;
    const map = mapRef.current;
    const routeLayers: L.Layer[] = [];
    let cancelled = false;

    if (!routeRequest) {
      onRouteResult(null);
      return;
    }

    const drawFallback = (origin: LatLng, destination: LatLng) => {
      void calculateRoutes(origin, destination).then((result) => {
        if (cancelled) return;
        const direct = L.polyline(
          result.directPath.map((point) => [point.lat, point.lng] as [number, number]),
          { color: "#DC2626", weight: 6, opacity: 0.85, dashArray: "10 8" }
        ).addTo(map);
        const alternative = L.polyline(
          result.alternativePath.map((point) => [point.lat, point.lng] as [number, number]),
          { color: "#15803D", weight: 7, opacity: 1 }
        ).addTo(map);
        routeLayers.push(direct, alternative);
        overlaysRef.current.push(direct, alternative);
        map.fitBounds(alternative.getBounds(), { padding: [32, 32] });
        onRouteResult(result);
      });
    };

    drawFallback(routeRequest.origin, routeRequest.destination);
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
      className="h-[360px] w-full bg-slate-200"
      aria-label="Interactive Barranquilla map"
    />
  );
}
