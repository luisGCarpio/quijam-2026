"use client";

import { useState } from "react";
import { AssistanceContent } from "../../AssistanceTab";

type Currency = "COP" | "USD" | "EUR" | "BRL";
type Preferences = { accessibleRoute: boolean; highContrast: boolean; largeText: boolean; voiceAlerts: boolean };

export default function Preview() {
  const [currency, setCurrency] = useState<Currency>("COP");
  const [preferences, setPreferences] = useState<Preferences>({ accessibleRoute: false, highContrast: false, largeText: false, voiceAlerts: false });
  const [destination, setDestination] = useState<{lat: number; lng: number; label: string} | null>(null);
  const [notice, setNotice] = useState("");
  return <div style={{ fontSize: preferences.largeText ? "1.25rem" : "1rem", filter: preferences.highContrast ? "contrast(1.5)" : undefined }}>
    <div className="mx-auto max-w-[440px] bg-slate-100 p-4">
      <label>Moneda <select value={currency} onChange={event => setCurrency(event.target.value as Currency)} className="rounded border p-2">{["COP", "USD", "EUR", "BRL"].map(item => <option key={item}>{item}</option>)}</select></label>
      {destination && <p role="status" className="mt-2">Destino: {destination.label} ({destination.lat.toFixed(5)}, {destination.lng.toFixed(5)}) {preferences.accessibleRoute && "· Ruta accesible solicitada"}</p>}
      {notice && <p role="status">{notice}</p>}
    </div>
    <AssistanceContent lang="es" userLocation={{lat: 10.9878, lng: -74.7889}} locationLabel="Plaza de la Paz" currency={currency} accessibility={preferences} navigateToRoute={setDestination} updateAccessibility={patch => setPreferences(current => ({...current, ...patch}))} testVoice={() => { const message = "Esta es una alerta de prueba"; setNotice(message); if (preferences.voiceAlerts && "speechSynthesis" in window) { const utterance = new SpeechSynthesisUtterance(message); utterance.lang = "es-CO"; window.speechSynthesis.speak(utterance); } }} />
  </div>;
}
