import type { LatLng } from "@/types/bq360";

export interface RouteResult {
  directPath: LatLng[];
  directMinutes: number;
  alternativePath: LatLng[] | null;
  alternativeMinutes: number | null;
}

export async function calculateRoutes(origin: LatLng, destination: LatLng): Promise<RouteResult> {
  const url = `https://router.project-osrm.org/route/v1/driving/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?overview=full&geometries=geojson&alternatives=true`;
  const response = await fetch(url, { signal: AbortSignal.timeout(5000) });
  if (!response.ok) throw new Error("Route unavailable");
  const data = await response.json() as { code?: string; routes?: Array<{ geometry: { coordinates: number[][] }; duration: number }> };
  if (data.code !== "Ok" || !data.routes?.length) throw new Error("Route unavailable");
  const routes = [...data.routes].sort((a, b) => a.duration - b.duration);
  const path = (route: typeof routes[number]) => route.geometry.coordinates.map(([lng, lat]) => ({ lat, lng }));
  return { directPath: path(routes[0]), directMinutes: Math.round(routes[0].duration / 60), alternativePath: routes[1] ? path(routes[1]) : null, alternativeMinutes: routes[1] ? Math.round(routes[1].duration / 60) : null };
}
