// Archivo exclusivo de Dev 5 — Utilidades base geoespaciales (Fase 0)
import type { LatLng, Poi } from "@/types/bq360";

const EARTH_RADIUS_KM = 6371;

function toRadians(deg: number): number {
  return (deg * Math.PI) / 180;
}

export function haversineKm(a: LatLng, b: LatLng): number {
  const dLat = toRadians(b.lat - a.lat);
  const dLng = toRadians(b.lng - a.lng);
  const lat1 = toRadians(a.lat);
  const lat2 = toRadians(b.lat);

  const sinLat = Math.sin(dLat / 2);
  const sinLng = Math.sin(dLng / 2);
  const h = sinLat * sinLat + Math.cos(lat1) * Math.cos(lat2) * sinLng * sinLng;

  return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(h)));
}

export function findNearestPoi(
  origin: LatLng,
  pois: Poi[]
): { poi: Poi; distanceKm: number } | null {
  if (pois.length === 0) return null;

  let nearest = pois[0];
  let minDistance = haversineKm(origin, nearest.coords);

  for (let i = 1; i < pois.length; i += 1) {
    const candidate = pois[i];
    const distance = haversineKm(origin, candidate.coords);
    if (distance < minDistance) {
      nearest = candidate;
      minDistance = distance;
    }
  }

  return { poi: nearest, distanceKm: minDistance };
}
