import { ROUTES_FALLBACK } from "@/data/routes-fallback";
import type { LatLng } from "@/types/bq360";

export interface RouteResult {
  directPath: LatLng[];
  alternativePath: LatLng[];
  directMinutes: number;
  alternativeMinutes: number;
  avoidedCrowdPercent: number;
  source: "osrm" | "fallback";
  accessibleFriendly: boolean;
}

function distanceKm(a: LatLng, b: LatLng): number {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

function nearestFallback(origin: LatLng, destination: LatLng) {
  const keyPoints = [
    { lat: 10.9878, lng: -74.7889, label: "Plaza de la Paz" },
    { lat: 10.9269, lng: -74.8005, label: "Estadio Metropolitano" },
    { lat: 11.0156, lng: -74.7875, label: "Gran Malecón" },
    { lat: 10.9866, lng: -74.7867, label: "Barrio Abajo" },
    { lat: 10.9939, lng: -74.7883, label: "Estadio Romelio Martínez" },
    { lat: 10.8896, lng: -74.7808, label: "Aeropuerto" },
  ];
  const nearestOrigin = keyPoints.reduce((best, point) =>
    distanceKm(origin, point) < distanceKm(origin, best) ? point : best
  );
  const nearestDestination = keyPoints.reduce((best, point) =>
    distanceKm(destination, point) < distanceKm(destination, best) ? point : best
  );

  return (
    ROUTES_FALLBACK.find(
      (route) =>
        route.fromLabel === nearestOrigin.label &&
        route.toLabel === nearestDestination.label
    ) ??
    ROUTES_FALLBACK.find(
      (route) =>
        route.fromLabel === nearestDestination.label &&
        route.toLabel === nearestOrigin.label
    ) ??
    null
  );
}

async function fetchOsrm(origin: LatLng, destination: LatLng, alternative: boolean) {
  const url =
    `https://router.project-osrm.org/route/v1/driving/` +
    `${origin.lng},${origin.lat};${destination.lng},${destination.lat}` +
    `?overview=full&geometries=geojson&alternatives=${alternative ? "true" : "false"}`;
  const response = await fetch(url, { signal: AbortSignal.timeout(5000) });
  if (!response.ok) throw new Error("OSRM route request failed");
  const data = (await response.json()) as {
    code?: string;
    routes?: Array<{ geometry: { coordinates: number[][] }; duration: number }>;
  };
  if (data.code !== "Ok" || !data.routes?.length) throw new Error("No OSRM route");

  return data.routes;
}

export function fallbackRoute(origin: LatLng, destination: LatLng): RouteResult {
  const route = nearestFallback(origin, destination);
  const directFallback = route?.directPath ?? [origin, destination];
  const alternativeFallback = route?.alternativePath ?? [origin, destination];
  const estimatedDistance = distanceKm(origin, destination);

  return {
    directPath: directFallback,
    alternativePath: alternativeFallback,
    directMinutes: route?.directMinutes ?? Math.max(5, Math.round(estimatedDistance * 2.8)),
    alternativeMinutes: route?.alternativeMinutes ?? Math.max(7, Math.round(estimatedDistance * 3.4)),
    avoidedCrowdPercent: route ? 38 : 24,
    source: "fallback",
    accessibleFriendly: route?.accessibleFriendly ?? true,
  };
}

export async function calculateRoutes(origin: LatLng, destination: LatLng): Promise<RouteResult> {
  try {
    const routes = await fetchOsrm(origin, destination, true);
    const sorted = [...routes].sort((a, b) => a.duration - b.duration);
    const direct = sorted[0];
    const alternative = sorted[1] ?? direct;
    return {
      directPath: direct.geometry.coordinates.map(([lng, lat]) => ({ lat, lng })),
      alternativePath: alternative.geometry.coordinates.map(([lng, lat]) => ({ lat, lng })),
      directMinutes: Math.round(direct.duration / 60),
      alternativeMinutes: Math.round(alternative.duration / 60),
      avoidedCrowdPercent: alternative === direct ? 18 : 38,
      source: "osrm",
      accessibleFriendly: true,
    };
  } catch {
    return fallbackRoute(origin, destination);
  }
}
