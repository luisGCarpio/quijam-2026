"use client";

import { useState } from "react";
import { useBQ360 } from "@/context/BQ360Context";
import { REFERENCE_PLACES } from "./locations";
import type { LatLng } from "@/types/bq360";
import type { RouteResult } from "@/lib/routing";

export default function RouteComparisonCard({ route, error, onRetry, selectedPoint, onChooseMap }: { route: RouteResult | null; error: boolean; onRetry: () => void; selectedPoint: LatLng | null; onChooseMap: () => void }) {
  const { routeRequest, clearRoute, userLocation, setUserLocation, locationConfirmed, t } = useBQ360();
  const [editing, setEditing] = useState(false);
  const [placeIndex, setPlaceIndex] = useState(0);
  const [usingMap, setUsingMap] = useState(false);
  if (!routeRequest) return null;
  const point = usingMap && selectedPoint ? selectedPoint : REFERENCE_PLACES[placeIndex];
  return <article className="bq-surface-card rounded-2xl p-4 space-y-3">
    <div className="flex justify-between gap-2"><div><h2 className="font-bold">{routeRequest.destination.label}</h2><p className="text-sm">{t("map.origin")}: {locationConfirmed ? (REFERENCE_PLACES.find(p => p.lat === userLocation.lat && p.lng === userLocation.lng)?.name ?? `${t("map.selectedOnMap")} (${userLocation.lat.toFixed(5)}, ${userLocation.lng.toFixed(5)})`) : "Plaza de la Paz"}</p></div><button type="button" onClick={clearRoute} className="underline">{t("map.stub.clearRoute")}</button></div>
    {(!locationConfirmed || editing) && <fieldset className="space-y-2"><legend className="font-bold text-sm">{t("map.originPrompt")}</legend><label className="block text-sm">{t("map.choosePlace")}<select className="block w-full rounded border p-2" value={usingMap ? "map" : String(placeIndex)} onChange={e => { setUsingMap(false); setPlaceIndex(Number(e.target.value)); }}>{usingMap && <option value="map">{t("map.selectedOnMap")}</option>}{REFERENCE_PLACES.map((p, i) => <option key={p.name} value={i}>{p.name}</option>)}</select></label><button type="button" className="block underline" onClick={() => { setUsingMap(true); onChooseMap(); }}>{t("map.chooseOnMap")}</button>{usingMap && selectedPoint && <p className="text-sm">{t("map.selectedOnMap")}: {selectedPoint.lat.toFixed(5)}, {selectedPoint.lng.toFixed(5)}</p>}<button type="button" disabled={usingMap && !selectedPoint} onClick={() => { setUserLocation(point); setEditing(false); }} className="rounded bg-bq-navy px-3 py-2 text-white disabled:opacity-50">{t("map.confirmOrigin")}</button></fieldset>}
    {locationConfirmed && !editing && <button type="button" className="text-sm underline" onClick={() => { setUsingMap(false); setEditing(true); }}>{t("map.changeOrigin")}</button>}
    {locationConfirmed && !editing && <div role="status" className="text-sm">{error ? <><p>{t("map.routeError")}</p><button type="button" onClick={onRetry} className="underline">{t("map.retry")}</button></> : route ? <><p>{t("map.direct")}: {route.directMinutes} min</p><p>{route.alternativeMinutes === null ? t("map.noAlternative") : `${t("map.alternative")}: ${route.alternativeMinutes} min`}</p><p>{t("map.drivingNotice")}</p></> : t("map.calculating")}</div>}
  </article>;
}
