"use client";

import { useState } from "react";
import { AlertTriangle, X } from "lucide-react";
import { useBQ360 } from "@/context/BQ360Context";
import type { ReportCategory, Severity } from "@/types/bq360";

export default function ReportModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { submitReport, userLocation, t } = useBQ360();
  const [category, setCategory] = useState<ReportCategory>("aglomeracion");
  const [severity, setSeverity] = useState<Severity>("media");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  if (!open) return null;

  const closeModal = () => {
    setError("");
    onClose();
  };

  const submit = async () => {
    if (!title.trim()) {
      setError(t("map.report.titleRequired"));
      return;
    }
    setSaving(true);
    const result = await submitReport({
      category,
      title: title.trim(),
      description: description.trim() || null,
      lat: userLocation.lat,
      lng: userLocation.lng,
      severity,
    });
    setSaving(false);
    if (result.ok) closeModal();
    else setError(result.error ?? t("map.report.error"));
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-end justify-center bg-slate-950/40 p-3" role="dialog" aria-modal="true">
      <div className="w-full max-w-[440px] rounded-2xl bg-white p-4 shadow-2xl">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-bold text-[#0B2545]">
            <AlertTriangle className="h-5 w-5 text-[#DC2626]" />
            {t("map.report.title")}
          </h2>
          <button type="button" onClick={closeModal} className="rounded-lg p-2" aria-label={t("map.close")}>
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="mt-4 grid gap-3">
          <label className="text-xs font-bold text-slate-600">
            {t("map.report.category")}
            <select value={category} onChange={(event) => setCategory(event.target.value as ReportCategory)} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm">
              {(["aglomeracion", "arroyo", "seguridad", "accesibilidad", "salud"] as ReportCategory[]).map((value) => (
                <option key={value} value={value}>{t(`map.category.${value}`)}</option>
              ))}
            </select>
          </label>
          <label className="text-xs font-bold text-slate-600">
            {t("map.report.severity")}
            <select value={severity} onChange={(event) => setSeverity(event.target.value as Severity)} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm">
              {(["baja", "media", "alta"] as Severity[]).map((value) => (
                <option key={value} value={value}>{t(`map.severity.${value}`)}</option>
              ))}
            </select>
          </label>
          <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder={t("map.report.name")} className="rounded-xl border border-slate-300 px-3 py-3 text-sm" />
          <textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder={t("map.report.description")} className="min-h-20 rounded-xl border border-slate-300 px-3 py-3 text-sm" />
          {error && <p className="text-xs font-semibold text-red-700">{error}</p>}
          <button type="button" disabled={saving} onClick={() => void submit()} className="rounded-xl bg-[#DC2626] px-4 py-3 text-sm font-bold text-white disabled:opacity-60">
            {saving ? t("map.report.saving") : t("map.report.send")}
          </button>
        </div>
      </div>
    </div>
  );
}
