"use client";

import { useEffect, useId, useRef } from "react";
import { AlertTriangle, Send, X } from "lucide-react";
import { useBQ360 } from "@/context/BQ360Context";
import { REFERENCE_PLACES } from "./locations";
import type { LatLng, ReportCategory, Severity } from "@/types/bq360";

const CATEGORIES: readonly ReportCategory[] = [
  "aglomeracion",
  "arroyo",
  "seguridad",
  "accesibilidad",
  "salud",
];

const SEVERITIES: readonly Severity[] = ["baja", "media", "alta"];

export default function ReportModal({
  open,
  onClose,
  selectedPoint, onPointChange, onChooseMap,
}: {
  open: boolean;
  onClose: () => void;
  selectedPoint: LatLng | null;
  onPointChange: (point: LatLng | null) => void;
  onChooseMap: () => void;
}) {
  const { submitReport, reportDraft, setReportDraft, t } = useBQ360();
  const { category, severity, title, description, error, saving, pointConfirmed, published } = reportDraft;
  const setCategory = (value: ReportCategory) => setReportDraft(prev => ({ ...prev, category: value }));
  const setSeverity = (value: Severity) => setReportDraft(prev => ({ ...prev, severity: value }));
  const setTitle = (value: string) => setReportDraft(prev => ({ ...prev, title: value, published: false }));
  const setDescription = (value: string) => setReportDraft(prev => ({ ...prev, description: value, published: false }));
  const setError = (value: string) => setReportDraft(prev => ({ ...prev, error: value }));
  const setPointConfirmed = (value: boolean) => setReportDraft(prev => ({ ...prev, pointConfirmed: value }));
  const setPublished = (value: boolean) => setReportDraft(prev => ({ ...prev, published: value }));

  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const categoryId = useId();
  const severityId = useId();
  const nameId = useId();
  const descId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
      closeBtnRef.current?.focus();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  const handleClose = () => {
    const dialog = dialogRef.current;
    if (dialog) {
      dialog.returnValue = "";
    }
    setError("");
    setPublished(false);
    if (open) {
      onClose();
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (saving) return;
    setPublished(false);
    if (!pointConfirmed || !selectedPoint) { setError(t("map.report.confirmPointFirst")); return; }
    const trimmedTitle = title.trim();
    if (trimmedTitle.length < 2) {
      setError(t("map.report.titleRequired"));
      return;
    }

    await submitReport({
      category,
      title: trimmedTitle,
      description: description.trim() || null,
      lat: selectedPoint.lat,
      lng: selectedPoint.lng,
      severity,
    });
  };

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      onClose={handleClose}
      onCancel={(event) => { if (saving) event.preventDefault(); }}
      {...({ closedby: "closerequest" } as Record<string, string>)}
      className="bq-overlay-surface m-auto mb-0 max-h-[85dvh] w-full max-w-[440px] overflow-y-auto overscroll-contain rounded-t-[24px] bg-white p-0 text-bq-text open:flex open:flex-col sm:mb-auto sm:rounded-[24px] backdrop:overflow-hidden backdrop:overscroll-contain backdrop:bg-bq-navy-deep/65 backdrop:backdrop-blur-[2px]"
    >
      <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-[var(--border-subtle)] bg-white px-4 py-3.5">
        <div className="flex min-w-0 items-center gap-2.5">
          <span
            aria-hidden="true"
            className="bq-icon-circle inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-bq-red text-white"
          >
            <AlertTriangle
              className="h-4 w-4"
              strokeWidth={2.25}
              absoluteStrokeWidth
            />
          </span>
          <h1
            id={titleId}
            className="truncate text-base font-extrabold leading-tight tracking-tight text-bq-navy"
          >
            {t("map.report.title")}
          </h1>
        </div>

        <form method="dialog">
          <button
            ref={closeBtnRef}
            type="submit"
            value="close"
            autoFocus
            disabled={saving}
            aria-label={t("map.close")}
            className="bq-touch-target inline-flex min-h-9 min-w-9 items-center justify-center rounded-full border border-[var(--border-subtle)] bg-white text-bq-navy transition-colors duration-100 hover:bg-[var(--surface-muted)] active:opacity-80"
          >
            <X
              className="h-4 w-4"
              strokeWidth={2}
              absoluteStrokeWidth
              aria-hidden="true"
            />
          </button>
        </form>
      </div>

      <form onSubmit={(e) => void handleSubmit(e)} className="p-4">
        <fieldset disabled={saving} className="flex flex-col gap-3.5">
        {published && <p role="status" className="font-bold text-bq-green">{t("map.report.published")}</p>}
        <fieldset className="space-y-2"><legend className="font-bold text-sm">{t("map.report.point")}</legend>
          <label className="block text-sm">{t("map.choosePlace")}<select className="block w-full rounded border p-2" value={selectedPoint ? String(REFERENCE_PLACES.findIndex(p => p.lat === selectedPoint.lat && p.lng === selectedPoint.lng)) : ""} onChange={e => { const place = REFERENCE_PLACES[Number(e.target.value)]; onPointChange(place); setPointConfirmed(false); setPublished(false); }}><option value="" disabled>{t("map.choosePlace")}</option>{selectedPoint && !REFERENCE_PLACES.some(p => p.lat === selectedPoint.lat && p.lng === selectedPoint.lng) && <option value="-1">{t("map.selectedOnMap")}</option>}{REFERENCE_PLACES.map((p, i) => <option key={p.name} value={i}>{p.name}</option>)}</select></label>
          <button type="button" className="block underline" onClick={() => { setPointConfirmed(false); onChooseMap(); }}>{t("map.chooseOnMap")}</button>
          {selectedPoint && <p className="text-sm">{selectedPoint.lat.toFixed(5)}, {selectedPoint.lng.toFixed(5)}</p>}
          <label className="flex gap-2 text-sm"><input type="checkbox" checked={pointConfirmed} onChange={e => setPointConfirmed(e.target.checked)} disabled={!selectedPoint} />{t("map.report.confirmPoint")}</label>
        </fieldset>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label
              htmlFor={categoryId}
              className="block text-[0.6875rem] font-bold uppercase tracking-wider text-bq-navy"
            >
              {t("map.report.category")}
            </label>
            <select
              id={categoryId}
              value={category}
              onChange={(event) =>
                setCategory(event.target.value as ReportCategory)
              }
              className="mt-1.5 min-h-10 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-bq-text"
            >
              {CATEGORIES.map((value) => (
                <option key={value} value={value}>
                  {t(`map.category.${value}`)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor={severityId}
              className="block text-[0.6875rem] font-bold uppercase tracking-wider text-bq-navy"
            >
              {t("map.report.severity")}
            </label>
            <select
              id={severityId}
              value={severity}
              onChange={(event) => setSeverity(event.target.value as Severity)}
              className="mt-1.5 min-h-10 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-bq-text"
            >
              {SEVERITIES.map((value) => (
                <option key={value} value={value}>
                  {t(`map.severity.${value}`)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label
            htmlFor={nameId}
            className="block text-[0.6875rem] font-bold uppercase tracking-wider text-bq-navy"
          >
            {t("map.report.name")}
          </label>
          <input
            id={nameId}
            type="text"
            required
            minLength={2}
            maxLength={120}
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder={t("map.report.name")}
            className="mt-1.5 min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-bq-text placeholder:text-bq-muted/70"
          />
        </div>

        <div>
          <label
            htmlFor={descId}
            className="block text-[0.6875rem] font-bold uppercase tracking-wider text-bq-navy"
          >
            {t("map.report.description")}
          </label>
          <textarea
            id={descId}
            maxLength={500}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder={t("map.report.description")}
            className="mt-1.5 min-h-20 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-bq-text placeholder:text-bq-muted/70"
          />
        </div>

        {error && (
          <p role="alert" className="text-xs font-bold text-bq-red">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={saving}
          className="bq-touch-target inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-bq-red pe-4 ps-3.5 py-2.5 text-sm font-bold text-white transition-[background-color,opacity] duration-100 hover:bg-[#be2931] active:opacity-85 disabled:opacity-60"
        >
          <Send
            className="h-4 w-4 shrink-0"
            strokeWidth={2.25}
            absoluteStrokeWidth
            aria-hidden="true"
          />
          <span>{saving ? t("map.report.saving") : t("map.report.send")}</span>
        </button>
        </fieldset>
      </form>
    </dialog>
  );
}
