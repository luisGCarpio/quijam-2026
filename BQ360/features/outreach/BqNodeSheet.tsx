'use client';

import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import {
  Accessibility,
  AlertTriangle,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  Droplets,
  HeartPulse,
  Leaf,
  MapPin,
  Printer,
  QrCode,
  ShieldAlert,
  Store,
} from 'lucide-react';
import { applyPhysicalAck } from './engine.mjs';
import { useOptionalOutreach } from './store';
import type {
  BqNodeStation,
  CommandResult,
  Merchant,
  OutreachState,
  PhysicalAckPayload,
  RouteOption,
  VolunteerRole,
} from './types';

export interface BqNodeSheetProps {
  externalState?: OutreachState;
  onPhysicalAck?: (payload: PhysicalAckPayload) => CommandResult | void;
}

const VOLUNTEER_ROLES: readonly VolunteerRole[] = [
  'Voluntario de campo',
  'Enlace comunitario',
  'Coordinador de nodo',
];

const QR_SIZE = 21;

/**
 * Pure deterministic hash that maps an offline BQ Node payload string
 * into a 21x21 QR-like matrix (3 corner finder squares, timing bands, and bit grid).
 */
export function buildDeterministicQrMatrix(payload: string): boolean[][] {
  const text = String(payload || 'BQ360');
  let seed = 0x811c9dc5;
  for (let i = 0; i < text.length; i += 1) {
    seed ^= text.charCodeAt(i);
    seed = Math.imul(seed, 0x01000193) >>> 0;
  }

  const isFinderCell = (r: number, c: number): boolean | null => {
    const inTopLeft = r < 7 && c < 7;
    const inTopRight = r < 7 && c >= QR_SIZE - 7;
    const inBottomLeft = r >= QR_SIZE - 7 && c < 7;

    if (!inTopLeft && !inTopRight && !inBottomLeft) {
      return null;
    }

    const lr = r >= QR_SIZE - 7 ? r - (QR_SIZE - 7) : r;
    const lc = c >= QR_SIZE - 7 ? c - (QR_SIZE - 7) : c;

    if (lr === 0 || lr === 6 || lc === 0 || lc === 6) return true;
    if (lr >= 2 && lr <= 4 && lc >= 2 && lc <= 4) return true;
    return false;
  };

  const isSeparatorCell = (r: number, c: number): boolean => {
    if ((r === 7 && c <= 7) || (c === 7 && r <= 7)) return true;
    if ((r === 7 && c >= QR_SIZE - 8) || (c === QR_SIZE - 8 && r <= 7)) {
      return true;
    }
    if ((r === QR_SIZE - 8 && c <= 7) || (c === 7 && r >= QR_SIZE - 8)) {
      return true;
    }
    return false;
  };

  const matrix: boolean[][] = [];
  for (let r = 0; r < QR_SIZE; r += 1) {
    const row: boolean[] = [];
    for (let c = 0; c < QR_SIZE; c += 1) {
      const finder = isFinderCell(r, c);
      if (finder !== null) {
        row.push(finder);
        continue;
      }
      if (isSeparatorCell(r, c)) {
        row.push(false);
        continue;
      }
      if (r === 6 && c >= 8 && c <= QR_SIZE - 9) {
        row.push(c % 2 === 0);
        continue;
      }
      if (c === 6 && r >= 8 && r <= QR_SIZE - 9) {
        row.push(r % 2 === 0);
        continue;
      }
      if (r === 13 && c === 8) {
        row.push(true);
        continue;
      }

      const idx = r * QR_SIZE + c;
      const charCode = text.charCodeAt(idx % text.length);
      let mixed = (seed ^ Math.imul(idx + 1, 0x9e3779b1) ^ Math.imul(charCode, 0x85ebca6b)) >>> 0;
      mixed ^= mixed >>> 16;
      mixed = Math.imul(mixed, 0x7feb352d) >>> 0;
      mixed ^= mixed >>> 15;
      row.push((mixed & 1) === 1);
    }
    matrix.push(row);
  }

  return matrix;
}

function buildQrSvgPath(matrix: boolean[][]): string {
  const segments: string[] = [];
  for (let r = 0; r < matrix.length; r += 1) {
    const row = matrix[r];
    for (let c = 0; c < row.length; c += 1) {
      if (row[c]) {
        segments.push(`M${c + 2},${r + 2}h1v1h-1z`);
      }
    }
  }
  return segments.join('');
}

function getRouteStatusLabel(status: RouteOption['status']): string {
  switch (status) {
    case 'active':
      return 'Activa';
    case 'degraded':
      return 'Comercio limitado (paso abierto)';
    case 'paused':
      return 'Pausa preventiva';
    case 'closed':
      return 'Cierre verificado';
  }
}

function getRouteStatusBadgeClass(status: RouteOption['status']): string {
  switch (status) {
    case 'active':
      return 'bq-badge bq-badge-ok';
    case 'degraded':
      return 'bq-badge bq-badge-warn';
    case 'paused':
    case 'closed':
      return 'bq-badge bq-badge-alert';
  }
}

interface BqNodeSheetViewProps {
  state: OutreachState;
  onSubmitAck: (payload: PhysicalAckPayload) => CommandResult;
}

function BqNodeSheetView({ state, onSubmitAck }: BqNodeSheetViewProps) {
  const instanceId = useId();
  const nodesHeadingId = `${instanceId}-bq-nodes-heading`;
  const routesTitleId = `${instanceId}-sheet-routes-title`;
  const accessTitleId = `${instanceId}-sheet-access-title`;
  const merchantsTitleId = `${instanceId}-sheet-merchants-title`;
  const servicesTitleId = `${instanceId}-sheet-services-title`;
  const emergencyTitleId = `${instanceId}-sheet-emergency-title`;
  const ackLogHeadingId = `${instanceId}-bq-ack-log-heading`;
  const ackDialogTitleId = `${instanceId}-bq-ack-dialog-title`;
  const volunteerNameId = `${instanceId}-ack-volunteer-name`;
  const volunteerNameErrorId = `${instanceId}-ack-volunteer-name-error`;
  const volunteerRoleId = `${instanceId}-ack-volunteer-role`;
  const ackNoteId = `${instanceId}-ack-note`;
  const confirmWithdrawalId = `${instanceId}-ack-confirm-withdrawal`;
  const confirmWithdrawalErrorId = `${instanceId}-ack-confirm-withdrawal-error`;

  const [selectedNodeId, setSelectedNodeId] = useState<string>(
    () => state.nodes[0]?.id ?? ''
  );

  // Modal & form state
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const cancelButtonRef = useRef<HTMLButtonElement | null>(null);
  const ackSeqRef = useRef<number>(1);
  const isSubmittingRef = useRef<boolean>(false);

  const [volunteerName, setVolunteerName] = useState<string>('');
  const [volunteerRole, setVolunteerRole] = useState<VolunteerRole>(
    'Voluntario de campo'
  );
  const [note, setNote] = useState<string>('');
  const [confirmedWithdrawal, setConfirmedWithdrawal] = useState<boolean>(false);
  const [nameError, setNameError] = useState<string>('');
  const [confirmError, setConfirmError] = useState<string>('');
  const [submitError, setSubmitError] = useState<string>('');
  const [lastFeedback, setLastFeedback] = useState<string>('');

  useEffect(() => {
    setLastFeedback('');
  }, [state.scenarioId]);

  const selectedNode: BqNodeStation | null = useMemo(
    () => state.nodes.find((n) => n.id === selectedNodeId) ?? state.nodes[0] ?? null,
    [state.nodes, selectedNodeId]
  );

  const pendingNodesCount = useMemo(
    () =>
      state.nodes.filter((n) => n.status === 'pending_physical_withdrawal')
        .length,
    [state.nodes]
  );

  const nodeNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const node of state.nodes) {
      map.set(node.id, node.name);
    }
    return map;
  }, [state.nodes]);

  const linkedRoutes = useMemo(() => {
    if (!selectedNode) return [];
    const linked = new Set(selectedNode.linkedRouteIds);
    return state.routes.filter((r) => linked.has(r.id));
  }, [selectedNode, state.routes]);

  const openLinkedMerchants: Merchant[] = useMemo(() => {
    if (!selectedNode) return [];
    const linked = new Set(selectedNode.linkedRouteIds);
    return state.merchants
      .filter(
        (m) =>
          m.status === 'open' &&
          m.capacity > 0 &&
          state.currentTick <= m.validUntilTick &&
          m.routeIds.some((rid) => linked.has(rid))
      )
      .sort((a, b) => a.rotationPriority - b.rotationPriority);
  }, [selectedNode, state.merchants, state.currentTick]);

  const servicePoints = useMemo(() => {
    const hydration: string[] = [];
    const health: string[] = [];
    const green: string[] = [];
    const culture: string[] = [];

    for (const route of linkedRoutes) {
      if (route.services.hydration && !hydration.includes(route.services.hydration)) {
        hydration.push(route.services.hydration);
      }
      if (route.services.health && !health.includes(route.services.health)) {
        health.push(route.services.health);
      }
      if (route.services.green && !green.includes(route.services.green)) {
        green.push(route.services.green);
      }
      if (route.services.culture && !culture.includes(route.services.culture)) {
        culture.push(route.services.culture);
      }
    }

    if (hydration.length === 0) {
      hydration.push('Punto de hidratación BQ — Zona de asistencia en estación');
    }
    if (green.length === 0) {
      green.push('Punto Verde — Separación y retorno de envases en corredor');
    }

    return { hydration, health, green, culture };
  }, [linkedRoutes]);

  const qrMatrix = useMemo(
    () => buildDeterministicQrMatrix(selectedNode?.qrPayload ?? 'BQ360'),
    [selectedNode?.qrPayload]
  );

  const qrSvgPath = useMemo(() => buildQrSvgPath(qrMatrix), [qrMatrix]);

  const accessNotice = state.notices.movilidad_reducida;
  const referenceNotice = state.notices.ciudadano;
  const isAccessPendingAttention =
    accessNotice?.status === 'pending_specific_attention';
  const isPendingWithdrawal =
    selectedNode?.status === 'pending_physical_withdrawal';

  const resetDialogForm = () => {
    setVolunteerName('');
    setVolunteerRole('Voluntario de campo');
    setNote('');
    setConfirmedWithdrawal(false);
    setNameError('');
    setConfirmError('');
    setSubmitError('');
  };

  const openAckDialog = () => {
    if (!selectedNode || selectedNode.status !== 'pending_physical_withdrawal') {
      return;
    }
    resetDialogForm();
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) {
      dialog.showModal();
      cancelButtonRef.current?.focus();
    }
  };

  const handleDialogClose = () => {
    const dialog = dialogRef.current;
    if (dialog) {
      // Read returnValue if needed, then always reset returnValue on close
      const closedReturnValue = dialog.returnValue;
      dialog.returnValue = '';
      void closedReturnValue;
    }
    isSubmittingRef.current = false;
    resetDialogForm();
  };

  const validateVolunteerName = (rawValue: string): string => {
    const trimmed = rawValue.trim();
    if (trimmed.length < 2) {
      return 'Ingrese el nombre del voluntario o enlace (mínimo 2 caracteres).';
    }
    return '';
  };

  const handleVolunteerNameChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const nextValue = event.target.value;
    setVolunteerName(nextValue);
    if (nameError) {
      setNameError('');
    }
    if (submitError) {
      setSubmitError('');
    }
  };

  const handleVolunteerNameBlur = () => {
    const err = validateVolunteerName(volunteerName);
    setNameError(err);
  };

  const handleAckSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedNode || isSubmittingRef.current) {
      return;
    }

    const nextNameError = validateVolunteerName(volunteerName);
    const nextConfirmError = confirmedWithdrawal
      ? ''
      : `Debe confirmar el retiro físico de v${selectedNode.physicalVersion} y la fijación de v${selectedNode.digitalVersion}.`;

    setNameError(nextNameError);
    setConfirmError(nextConfirmError);

    if (nextNameError || nextConfirmError) {
      return;
    }

    // Strict double-ack guard before dispatching to store/callback
    if (selectedNode.status !== 'pending_physical_withdrawal') {
      setSubmitError(
        'Este BQ Node ya está al día; no admite doble acuse físico.'
      );
      return;
    }

    isSubmittingRef.current = true;
    const commandId = `cmd-ack-${selectedNode.id}-v${selectedNode.digitalVersion}-from-v${selectedNode.physicalVersion}-${ackSeqRef.current}`;
    ackSeqRef.current += 1;

    const result = onSubmitAck({
      nodeId: selectedNode.id,
      volunteerName: volunteerName.trim(),
      volunteerRole,
      removedVersion: selectedNode.physicalVersion,
      note: note.trim() || undefined,
      commandId,
    });

    isSubmittingRef.current = false;

    if (!result.ok) {
      setSubmitError(
        result.error || 'No se pudo registrar el acuse físico en este nodo.'
      );
      return;
    }

    setLastFeedback(
      `Acuse físico confirmado en ${selectedNode.name}: retirada v${selectedNode.physicalVersion}, fijada v${selectedNode.digitalVersion} por ${volunteerName.trim()}.`
    );
    dialogRef.current?.close('confirmed');
  };

  const handlePrint = () => {
    if (typeof window !== 'undefined' && typeof window.print === 'function') {
      window.print();
    }
  };

  if (!selectedNode) {
    return (
      <section className="bq-outreach bq-card" aria-label="BQ Nodes">
        <p className="text-sm text-slate-700">
          No hay estaciones BQ Node configuradas para el escenario actual.
        </p>
      </section>
    );
  }

  return (
    <section className="bq-outreach space-y-5" aria-labelledby={nodesHeadingId}>
      {/* Operational Header + Pending Counter */}
      <div className="no-print bq-card flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2
            id={nodesHeadingId}
            className="text-xl font-bold tracking-tight text-slate-900"
          >
            BQ Nodes — Puntos Presenciales sin Teléfono
          </h2>
          <p className="mt-1 text-sm text-slate-700">
            Fichas impresas con QR determinista offline, vigencia por versión y
            acuse físico independiente del voluntario en campo.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span
            className={
              pendingNodesCount > 0
                ? 'bq-badge bq-badge-alert'
                : 'bq-badge bq-badge-ok'
            }
            aria-live="polite"
          >
            {pendingNodesCount > 0 ? (
              <AlertTriangle className="h-4 w-4" aria-hidden="true" />
            ) : (
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
            )}
            <span>
              Pendientes de retiro físico: {pendingNodesCount} de{' '}
              {state.nodes.length}
            </span>
          </span>
        </div>
      </div>

      {lastFeedback ? (
        <div
          role="status"
          className="no-print rounded-xl border border-emerald-700 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-950"
        >
          {lastFeedback}
        </div>
      ) : null}

      {/* Station Selector */}
      <div
        className="no-print bq-card space-y-3"
        role="region"
        aria-label="Selector de estaciones BQ Node"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-base font-bold text-slate-900">
            Estaciones BQ Node ({state.nodes.length})
          </h3>
          <span className="text-xs font-medium text-slate-600">
            Escenario: {state.scenarioLabel}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {state.nodes.map((node) => {
            const isSelected = node.id === selectedNode.id;
            const nodePending = node.status === 'pending_physical_withdrawal';
            return (
              <button
                key={node.id}
                type="button"
                aria-pressed={isSelected}
                onClick={() => setSelectedNodeId(node.id)}
                className={`flex min-h-[48px] flex-col items-start justify-between gap-2 rounded-xl border-2 p-3 text-left transition-colors ${
                  isSelected
                    ? 'border-[#123f78] bg-[#e8f0fb] text-slate-900'
                    : 'border-slate-300 bg-white text-slate-900 hover:border-slate-500'
                }`}
              >
                <div className="w-full space-y-1">
                  <span className="block font-mono text-xs font-bold text-[#123f78]">
                    {node.id}
                  </span>
                  <span className="block text-sm font-bold leading-snug text-slate-900">
                    {node.name}
                  </span>
                  <span className="block text-xs text-slate-700">
                    {node.zone}
                  </span>
                </div>

                <div className="flex w-full flex-wrap items-center justify-between gap-1 pt-1">
                  <span
                    className={
                      nodePending
                        ? 'bq-badge bq-badge-alert'
                        : 'bq-badge bq-badge-ok'
                    }
                  >
                    {nodePending
                      ? 'Pendiente de retiro físico'
                      : 'Vigente en campo'}
                  </span>
                  <span className="font-mono text-xs font-semibold text-slate-700">
                    D:v{node.digitalVersion} / F:v{node.physicalVersion}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Side-by-Side Digital vs Physical Version Status */}
      <div
        className="no-print bq-card space-y-4"
        role="region"
        aria-label="Comparativa de versión digital y física"
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-[#123f78] bg-[#e8f0fb] p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-[#123f78]">
              Estado digital del sistema
            </p>
            <p className="mt-1 text-lg font-extrabold text-slate-900">
              Versión digital vigente: v{selectedNode.digitalVersion}
            </p>
            <p className="mt-1 text-sm text-slate-800">
              Corredores enlazados:{' '}
              {linkedRoutes.map((r) => `Ruta ${r.code}`).join(', ') || 'Sin rutas'}
              {' · '}Tick {state.currentTick}
            </p>
          </div>

          <div
            className={`rounded-xl border p-4 ${
              isPendingWithdrawal
                ? 'border-red-700 bg-red-50'
                : 'border-emerald-700 bg-emerald-50'
            }`}
          >
            <p
              className={`text-xs font-bold uppercase tracking-wide ${
                isPendingWithdrawal ? 'text-red-900' : 'text-emerald-900'
              }`}
            >
              Estado físico en tótem presencial
            </p>
            <p className="mt-1 text-lg font-extrabold text-slate-900">
              Versión física fijada en tótem: v{selectedNode.physicalVersion}
            </p>
            <p className="mt-1 text-sm text-slate-800">
              {selectedNode.lastAck
                ? `Último acuse: ${selectedNode.lastAck.volunteerName} (${selectedNode.lastAck.volunteerRole}) · ${selectedNode.lastAck.timestamp}`
                : 'Sin acuse de reemplazo posterior a la fijación inicial v1.'}
            </p>
          </div>
        </div>

        {isPendingWithdrawal ? (
          <div
            role="alert"
            className="rounded-xl border-2 border-red-800 bg-red-100 p-4 text-red-950"
          >
            <div className="flex items-start gap-3">
              <ShieldAlert
                className="mt-0.5 h-6 w-6 shrink-0 text-red-900"
                aria-hidden="true"
              />
              <div className="space-y-1">
                <h4 className="text-base font-extrabold text-red-950">
                  Alerta de retiro físico requerido: ficha anterior v
                  {selectedNode.physicalVersion} invalidada
                </h4>
                <p className="text-sm font-medium text-red-950">
                  Motivo de invalidación:{' '}
                  {selectedNode.invalidationReason ||
                    state.lastRecalculationReason}
                </p>
                <p className="text-xs font-semibold text-red-900">
                  Invalidada el:{' '}
                  {selectedNode.invalidatedAt || referenceNotice?.issuedAt || 'Tick actual'}
                  . Debe retirar físicamente la hoja v{selectedNode.physicalVersion}
                  , fijar la ficha v{selectedNode.digitalVersion} y registrar el
                  acuse físico de campo.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-emerald-700 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-950">
            El cartel físico en tótem (v{selectedNode.physicalVersion}) coincide
            con la versión digital vigente (v{selectedNode.digitalVersion}). No se
            requiere retiro físico en esta estación.
          </div>
        )}

        {/* Sheet Actions (.no-print) */}
        <div className="flex flex-wrap items-center gap-3 pt-1">
          <button
            type="button"
            onClick={handlePrint}
            className="bq-btn bq-btn-primary"
          >
            <Printer className="h-4 w-4" aria-hidden="true" />
            <span>Imprimir ficha</span>
          </button>

          <button
            type="button"
            onClick={openAckDialog}
            disabled={!isPendingWithdrawal}
            aria-disabled={!isPendingWithdrawal}
            className={
              isPendingWithdrawal ? 'bq-btn bq-btn-danger' : 'bq-btn'
            }
          >
            <ClipboardCheck className="h-4 w-4" aria-hidden="true" />
            <span>
              {isPendingWithdrawal
                ? 'Registrar acuse físico'
                : `Registrar acuse físico (al día en v${selectedNode.physicalVersion})`}
            </span>
          </button>
        </div>
      </div>

      {/* Printable Physical Sheet */}
      <article
        className="bq-printable-sheet space-y-5"
        aria-label={`Ficha imprimible ${selectedNode.name}`}
      >
        {/* Sheet Header */}
        <header className="flex flex-col gap-3 border-b-2 border-slate-900 pb-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <p className="text-xs font-extrabold uppercase tracking-wider text-[#123f78]">
              BQ360 · BQ Node — Orientación Presencial sin Teléfono
            </p>
            <h3 className="text-2xl font-black text-slate-900">
              {selectedNode.name}
            </h3>
            <p className="flex flex-wrap items-center gap-2 text-sm font-semibold text-slate-800">
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-4 w-4" aria-hidden="true" />
                Zona: {selectedNode.zone}
              </span>
              <span aria-hidden="true">·</span>
              <span className="font-mono text-xs">{selectedNode.id}</span>
            </p>
          </div>

          <div className="flex flex-col items-start gap-2 sm:items-end">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center rounded-md border-2 border-slate-900 bg-slate-900 px-3 py-1 text-base font-black text-white">
                v{selectedNode.digitalVersion}
              </span>
              <span className="inline-flex items-center gap-1 rounded-md border border-slate-900 bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-900">
                <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                Tick {state.currentTick}
              </span>
            </div>
            <p className="text-xs font-semibold text-slate-800">
              Vigencia: hasta Tick{' '}
              {referenceNotice?.validUntilTick ?? state.currentTick + 2} (
              {referenceNotice?.issuedAt ?? 'Horario Colombia -05:00'})
            </p>
            <p className="rounded border border-dashed border-slate-700 bg-slate-50 px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-slate-900">
              Datos simulados — prototipo BQ360
            </p>
          </div>
        </header>

        {/* QR Matrix + Corridor Summary */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-[auto_1fr]">
          <div className="flex flex-col items-center justify-start rounded-xl border border-slate-900 bg-white p-3">
            <div className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-900">
              <QrCode className="h-4 w-4" aria-hidden="true" />
              <span>QR Offline Verificado</span>
            </div>
            <svg
              role="img"
              aria-label={`Código QR offline de ${selectedNode.name}, versión v${selectedNode.digitalVersion}, carga ${selectedNode.qrPayload}`}
              viewBox="0 0 25 25"
              width={156}
              height={156}
              shapeRendering="crispEdges"
              className="border border-slate-300 bg-white"
            >
              <rect x={0} y={0} width={25} height={25} fill="#ffffff" />
              <path d={qrSvgPath} fill="#0f172a" />
            </svg>
            <code className="mt-2 max-w-[14rem] break-all rounded bg-slate-100 px-2 py-1 text-center font-mono text-[11px] font-bold text-slate-900">
              {selectedNode.qrPayload}
            </code>
          </div>

          <div className="space-y-4">
            {/* Linked Routes Summary */}
            <section aria-labelledby={routesTitleId} className="space-y-2">
              <h4
                id={routesTitleId}
                className="text-sm font-extrabold uppercase tracking-wide text-slate-900"
              >
                Resumen de corredores asignados
              </h4>
              <div className="space-y-2">
                {linkedRoutes.map((route) => (
                  <div
                    key={route.id}
                    className="rounded-lg border border-slate-300 bg-slate-50 p-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-bold text-slate-900">
                        {route.name}
                      </p>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className={getRouteStatusBadgeClass(route.status)}>
                          {getRouteStatusLabel(route.status)}
                        </span>
                        <span className="bq-badge bq-badge-info">
                          {route.accessible ? 'Accesible' : 'Estándar'}
                        </span>
                      </div>
                    </div>
                    <p className="mt-1 text-xs font-medium text-slate-700">
                      Corredor: {route.corridor} · Tiempo estimado:{' '}
                      {route.travelMinutes} min · Asignados: {route.assignedTotal}{' '}
                      (Acceso prioritario: {route.assignedAccess})
                    </p>
                    {route.invalidationReason ? (
                      <p className="mt-1 text-xs font-bold text-red-900">
                        Aviso operativo: {route.invalidationReason}
                      </p>
                    ) : null}
                  </div>
                ))}
              </div>
            </section>

            {/* Accessibility Guidance */}
            <section
              aria-labelledby={accessTitleId}
              className={`rounded-lg border p-3 ${
                isAccessPendingAttention
                  ? 'border-2 border-amber-800 bg-amber-50 text-amber-950'
                  : 'border-slate-300 bg-slate-50 text-slate-900'
              }`}
            >
              <div className="flex items-start gap-2">
                <Accessibility
                  className="mt-0.5 h-5 w-5 shrink-0"
                  aria-hidden="true"
                />
                <div className="space-y-1">
                  <h4
                    id={accessTitleId}
                    className="text-sm font-extrabold uppercase tracking-wide"
                  >
                    {isAccessPendingAttention
                      ? 'Advertencia de accesibilidad — Atención específica requerida'
                      : 'Guía de accesibilidad y movilidad reducida'}
                  </h4>
                  <p className="text-sm font-semibold">
                    {accessNotice?.headline}
                  </p>
                  <p className="text-xs leading-relaxed">
                    {accessNotice?.reason}
                  </p>
                  {isAccessPendingAttention ? (
                    <p className="text-xs font-bold text-red-900">
                      Solicite acompañamiento presencial del voluntario en este BQ
                      Node o comuníquese con CRUE 125 / Emergencias 123 antes de
                      iniciar desplazamiento.
                    </p>
                  ) : null}
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* Open Merchants Along Corridor */}
        <section
          aria-labelledby={merchantsTitleId}
          className="space-y-2 border-t border-slate-300 pt-4"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h4
              id={merchantsTitleId}
              className="inline-flex items-center gap-1.5 text-sm font-extrabold uppercase tracking-wide text-slate-900"
            >
              <Store className="h-4 w-4" aria-hidden="true" />
              <span>Comercios abiertos en el corredor</span>
            </h4>
            <span className="rounded-full border border-slate-900 bg-slate-100 px-3 py-0.5 text-xs font-bold text-slate-900">
              Orientación gratuita sin obligación de compra
            </span>
          </div>

          {openLinkedMerchants.length > 0 ? (
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {openLinkedMerchants.map((merchant) => (
                <div
                  key={merchant.id}
                  className="rounded-lg border border-slate-300 bg-white p-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-1">
                    <p className="text-sm font-bold text-slate-900">
                      {merchant.name}
                    </p>
                    <span className="bq-badge bq-badge-ok">Abierto</span>
                  </div>
                  <p className="mt-1 text-xs text-slate-700">
                    Zona: {merchant.zone} · Cupos disponibles:{' '}
                    {Math.max(0, merchant.capacity - merchant.occupied)} de{' '}
                    {merchant.capacity} · Vigente hasta Tick{' '}
                    {merchant.validUntilTick}
                  </p>
                  <p className="mt-1 text-xs font-semibold text-slate-800">
                    {merchant.accessible
                      ? 'Acceso nivelado / rampa verificada'
                      : 'Acceso estándar'}
                    {' · '}
                    {merchant.freeOrientationNoPurchase
                      ? 'Orientación gratuita sin obligación de compra'
                      : 'Punto de apoyo barrial'}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="rounded-lg border border-amber-700 bg-amber-50 p-3 text-xs font-semibold text-amber-950">
              Sin comercios aliados abiertos en este corredor en el tick actual.
              El paso peatonal y la orientación gratuita sin obligación de compra
              continúan activos en el BQ Node.
            </p>
          )}
        </section>

        {/* Hydration, Health, Green Points & Barranquilla Emergency Lines */}
        <div className="grid grid-cols-1 gap-4 border-t border-slate-300 pt-4 md:grid-cols-2">
          <section
            aria-labelledby={servicesTitleId}
            className="space-y-2 rounded-lg border border-slate-300 bg-slate-50 p-3"
          >
            <h4
              id={servicesTitleId}
              className="text-sm font-extrabold uppercase tracking-wide text-slate-900"
            >
              Hidratación, salud y Puntos Verdes
            </h4>
            <ul className="space-y-1.5 text-xs font-medium text-slate-900">
              {servicePoints.hydration.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <Droplets
                    className="mt-0.5 h-4 w-4 shrink-0 text-[#123f78]"
                    aria-hidden="true"
                  />
                  <span>{item}</span>
                </li>
              ))}
              {servicePoints.health.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <HeartPulse
                    className="mt-0.5 h-4 w-4 shrink-0 text-red-700"
                    aria-hidden="true"
                  />
                  <span>{item}</span>
                </li>
              ))}
              {servicePoints.green.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <Leaf
                    className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700"
                    aria-hidden="true"
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section
            aria-labelledby={emergencyTitleId}
            className="space-y-2 rounded-lg border-2 border-slate-900 bg-slate-50 p-3"
          >
            <h4
              id={emergencyTitleId}
              className="text-sm font-extrabold uppercase tracking-wide text-slate-900"
            >
              Líneas oficiales de emergencia — Barranquilla
            </h4>
            <dl className="grid grid-cols-1 gap-1.5 text-xs sm:grid-cols-3">
              <div className="rounded border border-slate-300 bg-white p-2">
                <dt className="font-bold text-slate-700">Policía / Emergencias</dt>
                <dd className="mt-0.5 text-lg font-black text-slate-900">123</dd>
              </div>
              <div className="rounded border border-slate-300 bg-white p-2">
                <dt className="font-bold text-slate-700">Salud / CRUE</dt>
                <dd className="mt-0.5 text-lg font-black text-slate-900">125</dd>
              </div>
              <div className="rounded border border-slate-300 bg-white p-2">
                <dt className="font-bold text-slate-700">Bomberos</dt>
                <dd className="mt-0.5 text-lg font-black text-slate-900">119</dd>
              </div>
            </dl>
            <p className="text-[11px] font-medium text-slate-700">
              Orientación gratuita sin obligación de compra · Recorrido seguro
              Barranquilla.
            </p>
          </section>
        </div>
      </article>

      {/* Immutable Physical Ack Log Table */}
      <section
        className="no-print bq-card space-y-3"
        aria-labelledby={ackLogHeadingId}
      >
        <h3
          id={ackLogHeadingId}
          className="text-base font-bold text-slate-900"
        >
          Registro inmutable de acuses físicos
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <caption className="mb-2 text-left text-xs font-semibold text-slate-700">
              Bitácora de acuses físicos BQ Node
            </caption>
            <thead>
              <tr className="border-b-2 border-slate-300 bg-slate-100 text-xs font-bold uppercase tracking-wide text-slate-800">
                <th scope="col" className="px-3 py-2.5">
                  Nodo
                </th>
                <th scope="col" className="px-3 py-2.5">
                  Retirada
                </th>
                <th scope="col" className="px-3 py-2.5">
                  Fijada
                </th>
                <th scope="col" className="px-3 py-2.5">
                  Voluntario
                </th>
                <th scope="col" className="px-3 py-2.5">
                  Rol
                </th>
                <th scope="col" className="px-3 py-2.5">
                  Fecha/Hora
                </th>
                <th scope="col" className="px-3 py-2.5">
                  Nota
                </th>
              </tr>
            </thead>
            <tbody>
              {state.ackHistory.length === 0 ? (
                <tr className="border-b border-slate-200">
                  <td
                    colSpan={7}
                    className="px-3 py-5 text-center text-sm text-slate-600"
                  >
                    Aún no se han registrado acuses físicos de retiro y fijación
                    en campo.
                  </td>
                </tr>
              ) : (
                state.ackHistory.map((record) => (
                  <tr
                    key={record.id}
                    className="border-b border-slate-200 align-top hover:bg-slate-50"
                  >
                    <td className="px-3 py-2.5 font-semibold text-slate-900">
                      <span className="block font-mono text-xs text-[#123f78]">
                        {record.nodeId}
                      </span>
                      <span className="block text-xs text-slate-700">
                        {nodeNameById.get(record.nodeId) || record.nodeId}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 font-mono text-xs font-bold text-red-900">
                      v{record.removedVersion}
                    </td>
                    <td className="px-3 py-2.5 font-mono text-xs font-bold text-emerald-900">
                      v{record.postedVersion}
                    </td>
                    <td className="px-3 py-2.5 font-medium text-slate-900">
                      {record.volunteerName}
                    </td>
                    <td className="px-3 py-2.5 text-slate-800">
                      {record.volunteerRole}
                    </td>
                    <td className="px-3 py-2.5 font-mono text-xs text-slate-700">
                      {record.timestamp}
                    </td>
                    <td className="px-3 py-2.5 text-slate-700">
                      {record.note || '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Native <dialog className="bq-modal"> for Physical Withdrawal Ack */}
      <dialog
        ref={dialogRef}
        className="bq-modal"
        aria-labelledby={ackDialogTitleId}
        onClose={handleDialogClose}
      >
        <div className="space-y-1">
          <h3
            id={ackDialogTitleId}
            className="text-lg font-extrabold text-slate-900"
          >
            Registrar acuse físico — {selectedNode.id}
          </h3>
          <p className="text-sm text-slate-700">
            Confirme que retiró la ficha invalidada{' '}
            <strong>v{selectedNode.physicalVersion}</strong> y fijó la versión
            vigente <strong>v{selectedNode.digitalVersion}</strong> en{' '}
            {selectedNode.name}.
          </p>
        </div>

        {submitError ? (
          <div
            role="alert"
            className="rounded-lg border border-red-800 bg-red-50 px-3 py-2.5 text-sm font-semibold text-red-950"
          >
            {submitError}
          </div>
        ) : null}

        <form noValidate onSubmit={handleAckSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label
              htmlFor={volunteerNameId}
              className="block text-sm font-bold text-slate-900"
            >
              Nombre del voluntario o enlace
            </label>
            <input
              id={volunteerNameId}
              name="volunteerName"
              type="text"
              required
              minLength={2}
              value={volunteerName}
              onChange={handleVolunteerNameChange}
              onBlur={handleVolunteerNameBlur}
              aria-invalid={nameError ? true : undefined}
              aria-describedby={nameError ? volunteerNameErrorId : undefined}
              placeholder="Ej. Camila Mendoza"
              className="w-full rounded-lg border border-slate-400 bg-white px-3 py-2 text-slate-900"
            />
            {nameError ? (
              <p
                id={volunteerNameErrorId}
                className="text-xs font-semibold text-red-800"
              >
                {nameError}
              </p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor={volunteerRoleId}
              className="block text-sm font-bold text-slate-900"
            >
              Rol operativo
            </label>
            <select
              id={volunteerRoleId}
              name="volunteerRole"
              value={volunteerRole}
              onChange={(event) =>
                setVolunteerRole(event.target.value as VolunteerRole)
              }
              className="w-full rounded-lg border border-slate-400 bg-white px-3 py-2 text-slate-900"
            >
              {VOLUNTEER_ROLES.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor={ackNoteId}
              className="block text-sm font-bold text-slate-900"
            >
              Observación de campo (opcional)
            </label>
            <input
              id={ackNoteId}
              name="note"
              type="text"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Ej. Tótem limpiado y ficha plastificada fijada"
              className="w-full rounded-lg border border-slate-400 bg-white px-3 py-2 text-slate-900"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-start gap-2.5 rounded-lg border border-slate-300 bg-slate-50 p-3">
              <input
                id={confirmWithdrawalId}
                name="confirmWithdrawal"
                type="checkbox"
                required
                checked={confirmedWithdrawal}
                onChange={(event) => {
                  setConfirmedWithdrawal(event.target.checked);
                  if (confirmError) {
                    setConfirmError('');
                  }
                  if (submitError) {
                    setSubmitError('');
                  }
                }}
                aria-invalid={confirmError ? true : undefined}
                aria-describedby={
                  confirmError ? confirmWithdrawalErrorId : undefined
                }
                className="mt-1 h-5 w-5 shrink-0 accent-[#123f78]"
              />
              <label
                htmlFor={confirmWithdrawalId}
                className="text-sm font-semibold leading-snug text-slate-900"
              >
                Confirmo el retiro físico de la ficha v
                {selectedNode.physicalVersion} y la fijación de la ficha v
                {selectedNode.digitalVersion}
              </label>
            </div>
            {confirmError ? (
              <p
                id={confirmWithdrawalErrorId}
                className="text-xs font-semibold text-red-800"
              >
                {confirmError}
              </p>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
            <button
              ref={cancelButtonRef}
              type="button"
              autoFocus
              onClick={() => dialogRef.current?.close('cancel')}
              className="bq-btn"
            >
              Cancelar
            </button>
            <button type="submit" className="bq-btn bq-btn-primary">
              Confirmar acuse físico
            </button>
          </div>
        </form>
      </dialog>
    </section>
  );
}

export function BqNodeSheet({
  externalState,
  onPhysicalAck,
}: BqNodeSheetProps = {}) {
  const ctx = useOptionalOutreach();
  const isExternalMode = externalState !== undefined;
  const [standaloneState, setStandaloneState] = useState<OutreachState | undefined>(
    externalState
  );

  useEffect(() => {
    setStandaloneState(externalState);
  }, [externalState]);

  const state = isExternalMode ? (standaloneState ?? externalState) : ctx?.state;

  if (!state) {
    throw new Error(
      'BqNodeSheet debe usarse dentro de OutreachProvider o recibir externalState.'
    );
  }

  const handleAck = (payload: PhysicalAckPayload): CommandResult => {
    const targetNode = state.nodes.find((n) => n.id === payload.nodeId);
    if (!targetNode || targetNode.status !== 'pending_physical_withdrawal') {
      return {
        ok: false,
        error: 'Este BQ Node ya está al día; no admite doble acuse físico.',
        state,
      };
    }

    if (isExternalMode) {
      const localResult = applyPhysicalAck(state, payload);
      if (!localResult.ok) {
        return localResult;
      }

      if (onPhysicalAck) {
        const externalResult = onPhysicalAck(payload);
        if (
          externalResult &&
          typeof externalResult === 'object' &&
          'state' in externalResult
        ) {
          if (externalResult.ok) {
            setStandaloneState(externalResult.state);
          }
          return externalResult;
        }
      }

      setStandaloneState(localResult.state);
      return localResult;
    }

    if (onPhysicalAck) {
      const externalResult = onPhysicalAck(payload);
      if (
        externalResult &&
        typeof externalResult === 'object' &&
        'state' in externalResult
      ) {
        return externalResult;
      }
    }

    return ctx!.ackNode(payload);
  };

  return <BqNodeSheetView state={state} onSubmitAck={handleAck} />;
}

export default BqNodeSheet;
