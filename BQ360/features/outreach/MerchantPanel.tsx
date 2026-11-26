'use client';

import React, { useEffect, useId, useMemo, useState } from 'react';
import {
  Accessibility,
  CircleAlert,
  CircleCheck,
  CirclePause,
  Clock,
  HandHeart,
  Info,
  Lock,
  LockOpen,
  MapPin,
  RefreshCw,
  RotateCcw,
  Search,
  ShieldCheck,
  Store,
  TriangleAlert,
  Users,
} from 'lucide-react';
import { applyMarketUpdate } from './engine.mjs';
import { useOptionalOutreach } from './store';
import type {
  CommandResult,
  MarketUpdatePayload,
  Merchant,
  MerchantCategory,
  MerchantStatus,
  OutreachState,
  RouteOption,
} from './types';

export interface MerchantPanelProps {
  externalState?: OutreachState;
  onMarketUpdate?: (payload: MarketUpdatePayload) => CommandResult | void;
}

type CategoryFilter = 'all' | MerchantCategory;

const CATEGORY_LABELS: Record<MerchantCategory, string> = {
  gastronomia: 'Gastronomía',
  artesania: 'Artesanía',
  hidratacion: 'Hidratación',
  servicios: 'Servicios',
};

const CATEGORY_OPTIONS: Array<{ value: CategoryFilter; label: string }> = [
  { value: 'all', label: 'Todos' },
  { value: 'gastronomia', label: 'Gastronomía' },
  { value: 'artesania', label: 'Artesanía' },
  { value: 'hidratacion', label: 'Hidratación' },
  { value: 'servicios', label: 'Servicios' },
];

function normalizeSearchText(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

type EffectiveDisplayStatus = MerchantStatus | 'full';

function getEffectiveMerchantStatus(
  merchant: Merchant,
  currentTick: number
): EffectiveDisplayStatus {
  if (merchant.status === 'expired' || currentTick > merchant.validUntilTick) {
    return 'expired';
  }
  if (merchant.status === 'closed' || merchant.capacity <= 0) {
    return 'closed';
  }
  if (merchant.capacity <= merchant.occupied) {
    return 'full';
  }
  return 'open';
}

function validateCapacityDraft(rawValue: string): string | null {
  const trimmed = rawValue.trim();
  if (trimmed === '') {
    return 'Ingresa un cupo numérico entre 0 y 500 antes de guardar.';
  }
  const parsed = Number(trimmed);
  if (!Number.isFinite(parsed) || !Number.isInteger(parsed)) {
    return 'El cupo debe ser un número entero sin decimales.';
  }
  if (parsed < 0 || parsed > 500) {
    return 'El cupo debe estar entre 0 y 500 personas.';
  }
  return null;
}

interface MarketFeedback {
  ok: boolean;
  message: string;
}

interface MerchantCardProps {
  merchant: Merchant;
  currentTick: number;
  scenarioId: string;
  linkedRoutes: RouteOption[];
  hasRotationFallbackActive: boolean;
  idPrefix: string;
  onToggleReception: (
    merchant: Merchant,
    effectiveStatus: EffectiveDisplayStatus
  ) => void;
  onSaveCapacity: (merchant: Merchant, nextCapacity: number) => void;
  onSimulateExpiration: (merchant: Merchant) => void;
}

function MerchantCard({
  merchant,
  currentTick,
  scenarioId,
  linkedRoutes,
  hasRotationFallbackActive,
  idPrefix,
  onToggleReception,
  onSaveCapacity,
  onSimulateExpiration,
}: MerchantCardProps) {
  const effectiveStatus = getEffectiveMerchantStatus(merchant, currentTick);
  const isOpen = effectiveStatus === 'open';
  const isReceptionActive = isOpen || effectiveStatus === 'full';
  const remainingCupo = Math.max(0, merchant.capacity - merchant.occupied);
  const overCapacity = merchant.occupied > merchant.capacity;

  const [capacityDraft, setCapacityDraft] = useState<string>(() =>
    String(merchant.capacity)
  );
  const [capacityError, setCapacityError] = useState<string | null>(null);

  useEffect(() => {
    setCapacityDraft(String(merchant.capacity));
    setCapacityError(null);
  }, [merchant.capacity, scenarioId]);

  const inputId = `${idPrefix}-cupo-${merchant.id}`;
  const hintId = `${idPrefix}-cupo-hint-${merchant.id}`;
  const errorId = `${idPrefix}-cupo-error-${merchant.id}`;

  const handleCapacityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCapacityDraft(event.target.value);
    if (capacityError !== null) {
      setCapacityError(null);
    }
  };

  const handleCapacityBlur = () => {
    const validationError = validateCapacityDraft(capacityDraft);
    setCapacityError(validationError);
  };

  const handleCapacitySubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validationError = validateCapacityDraft(capacityDraft);
    if (validationError) {
      setCapacityError(validationError);
      return;
    }
    setCapacityError(null);
    onSaveCapacity(merchant, Number(capacityDraft.trim()));
  };

  const routesText =
    linkedRoutes.length > 0
      ? linkedRoutes.map((route) => `Ruta ${route.code} (${route.corridor})`).join(' · ')
      : merchant.corridorId;

  const targetExpiredTick = Math.max(0, currentTick - 1);
  const alreadyExpiredAtTarget =
    merchant.status === 'expired' && merchant.validUntilTick <= targetExpiredTick;

  return (
    <li className="bq-card flex flex-col gap-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="space-y-1">
          <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900">
            <Store className="h-5 w-5 shrink-0 text-[#123f78]" aria-hidden="true" />
            <span>{merchant.name}</span>
          </h3>
          <p className="flex flex-wrap items-center gap-1.5 text-sm text-slate-700">
            <MapPin className="h-4 w-4 shrink-0 text-slate-500" aria-hidden="true" />
            <span className="font-semibold text-slate-900">{merchant.zone}</span>
            <span aria-hidden="true">·</span>
            <span>{routesText}</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2" aria-label="Indicadores del comercio">
          {effectiveStatus === 'open' && (
            <span className="bq-badge bq-badge-ok">
              <CircleCheck className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>Abierto</span>
            </span>
          )}
          {effectiveStatus === 'closed' && (
            <span className="bq-badge bq-badge-warn">
              <CirclePause className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>Cerrado</span>
            </span>
          )}
          {effectiveStatus === 'full' && (
            <span className="bq-badge bq-badge-warn">
              <CirclePause className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>Sin cupo disponible</span>
            </span>
          )}
          {effectiveStatus === 'expired' && (
            <span className="bq-badge bq-badge-alert">
              <TriangleAlert className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>Dato vencido</span>
            </span>
          )}

          {merchant.accessible ? (
            <span className="bq-badge bq-badge-info">
              <Accessibility className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>Accesible</span>
            </span>
          ) : (
            <span className="bq-badge border-slate-400 bg-slate-100 text-slate-800">
              <Info className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>Acceso estándar</span>
            </span>
          )}

          {merchant.freeOrientationNoPurchase && (
            <span className="bq-badge border-emerald-700 bg-emerald-50 text-emerald-950">
              <HandHeart className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>Orientación gratuita sin compra</span>
            </span>
          )}
        </div>
      </div>

      <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
          <dt className="text-xs font-semibold uppercase tracking-wide text-slate-600">
            Categoría
          </dt>
          <dd className="mt-1 font-bold text-slate-900">
            {CATEGORY_LABELS[merchant.category]}
          </dd>
        </div>

        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
          <dt className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-600">
            <Users className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Capacidad y cupo</span>
          </dt>
          <dd className="mt-1 font-bold text-slate-900">
            {merchant.occupied} / {merchant.capacity} ocupados
          </dd>
          <dd className="mt-0.5 text-xs text-slate-700">
            {overCapacity
              ? '0 cupos disponibles (ocupación sobre el máximo)'
              : `${remainingCupo} cupos disponibles`}
          </dd>
        </div>

        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
          <dt className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-600">
            <Clock className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Vigencia del dato</span>
          </dt>
          <dd className="mt-1 font-bold text-slate-900">
            Vigente hasta Tick {merchant.validUntilTick}
          </dd>
          <dd className="mt-0.5 text-xs text-slate-700">
            Tick actual {currentTick}{' '}
            {currentTick > merchant.validUntilTick || effectiveStatus === 'expired'
              ? '· Caducado (requiere actualización)'
              : '· Vigente'}
          </dd>
        </div>
      </dl>

      {merchant.services.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-700">
          <span className="font-semibold text-slate-800">Servicios en punto:</span>
          {merchant.services.map((service) => (
            <span
              key={service}
              className="rounded-md border border-slate-300 bg-white px-2 py-1 font-medium text-slate-800"
            >
              {service}
            </span>
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 bg-[#f7f7f2] px-3 py-2 text-xs text-slate-800">
        <p className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4 shrink-0 text-[#123f78]" aria-hidden="true" />
          <span>
            <strong>Equidad y rotación comercial (Prioridad #{merchant.rotationPriority}):</strong>{' '}
            {hasRotationFallbackActive && isOpen
              ? 'Turno activo por rotación automática en el corredor ante cierre o vencimiento de otro aliado.'
              : 'Mantiene visibilidad equitativa y relevo automático entre comercios abiertos de la misma ruta.'}
          </span>
        </p>
      </div>

      <div className="flex flex-col gap-3 border-t border-slate-200 pt-3 lg:flex-row lg:items-end lg:justify-between">
        <form
          noValidate
          onSubmit={handleCapacitySubmit}
          className="flex flex-col gap-2 sm:flex-row sm:items-end"
        >
          <div className="flex flex-col gap-1">
            <label
              htmlFor={inputId}
              className="text-sm font-semibold text-slate-900"
            >
              Actualizar cupo máximo
            </label>
            <input
              id={inputId}
              type="number"
              min={0}
              max={500}
              step={1}
              inputMode="numeric"
              value={capacityDraft}
              onChange={handleCapacityChange}
              onBlur={handleCapacityBlur}
              aria-invalid={capacityError ? true : undefined}
              aria-describedby={capacityError ? `${hintId} ${errorId}` : hintId}
              className={`w-full rounded-lg border bg-white px-3 py-2 text-slate-900 sm:w-40 ${
                capacityError
                  ? 'border-red-700 ring-1 ring-red-700'
                  : 'border-slate-400'
              }`}
            />
            <p id={hintId} className="text-xs text-slate-600">
              Rango permitido: 0 a 500.
            </p>
            {capacityError && (
              <p
                id={errorId}
                className="flex items-center gap-1.5 text-xs font-semibold text-red-800"
              >
                <CircleAlert className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>{capacityError}</span>
              </p>
            )}
          </div>

          <button
            type="submit"
            className="bq-btn bq-btn-primary shrink-0"
            aria-label={`Guardar cupo de ${merchant.name}`}
          >
            <ShieldCheck className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>Guardar cupo</span>
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => onToggleReception(merchant, effectiveStatus)}
            className={`bq-btn ${isReceptionActive ? 'border-amber-700 bg-amber-50 text-amber-950' : 'bq-btn-primary'}`}
            aria-label={
              isReceptionActive
                ? `Cerrar recepción de ${merchant.name}`
                : `Reabrir recepción de ${merchant.name}`
            }
          >
            {isReceptionActive ? (
              <>
                <Lock className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>Cerrar recepción</span>
              </>
            ) : (
              <>
                <LockOpen className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>Reabrir recepción</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => onSimulateExpiration(merchant)}
            disabled={alreadyExpiredAtTarget}
            className="bq-btn border-red-700 bg-red-50 text-red-900"
            aria-label={`Simular vencimiento (caducar dato) de ${merchant.name}`}
          >
            <RotateCcw className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>Simular vencimiento (caducar dato)</span>
          </button>
        </div>
      </div>
    </li>
  );
}

/**
 * BQ Market panel for neighborhood corridor merchants in Barranquilla.
 * Supports OutreachProvider context by default and optional externalState/onMarketUpdate overrides.
 */
export function MerchantPanel({
  externalState,
  onMarketUpdate,
}: MerchantPanelProps = {}) {
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
      'MerchantPanel debe usarse dentro de OutreachProvider o recibir externalState.'
    );
  }

  const handleUpdate = (payload: MarketUpdatePayload): CommandResult | void => {
    if (onMarketUpdate) {
      const extRes = onMarketUpdate(payload);
      if (extRes && typeof extRes === 'object' && 'state' in extRes) {
        if (isExternalMode && extRes.ok) {
          setStandaloneState(extRes.state);
        }
        return extRes;
      }
      if (isExternalMode) {
        const localRes = applyMarketUpdate(state, payload);
        if (localRes.ok) {
          setStandaloneState(localRes.state);
        }
        return localRes;
      }
      return extRes;
    }

    if (isExternalMode) {
      const localRes = applyMarketUpdate(state, payload);
      if (localRes.ok) {
        setStandaloneState(localRes.state);
      }
      return localRes;
    }

    return ctx!.updateMarket(payload);
  };

  const instanceId = useId();
  const headingId = `${instanceId}-bq-market-heading`;
  const searchInputId = `${instanceId}-market-search`;
  const categorySelectId = `${instanceId}-market-category`;
  const accessibleCheckboxId = `${instanceId}-market-accessible`;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('all');
  const [onlyAccessible, setOnlyAccessible] = useState(false);
  const [lastFeedback, setLastFeedback] = useState<MarketFeedback | null>(null);

  useEffect(() => {
    setLastFeedback(null);
  }, [state.scenarioId]);

  const routesById = useMemo(
    () => new Map(state.routes.map((route) => [route.id, route])),
    [state.routes]
  );

  const summary = useMemo(() => {
    let openCount = 0;
    let closedCount = 0;
    let expiredCount = 0;

    for (const merchant of state.merchants) {
      const effective = getEffectiveMerchantStatus(merchant, state.currentTick);
      if (effective === 'open') {
        openCount += 1;
      } else if (effective === 'closed' || effective === 'full') {
        closedCount += 1;
      } else {
        expiredCount += 1;
      }
    }

    let routesWithOpenMerchants = 0;
    let rotatedRoutesCount = 0;

    for (const route of state.routes) {
      const linked = state.merchants.filter((m) => m.routeIds.includes(route.id));
      const openLinked = linked.filter(
        (m) =>
          getEffectiveMerchantStatus(m, state.currentTick) === 'open' &&
          m.capacity > 0
      );
      const inactiveLinked = linked.filter(
        (m) => getEffectiveMerchantStatus(m, state.currentTick) !== 'open'
      );
      if (openLinked.length > 0) {
        routesWithOpenMerchants += 1;
        if (inactiveLinked.length > 0) {
          rotatedRoutesCount += 1;
        }
      }
    }

    const pendingNodesCount = state.nodes.filter(
      (node) => node.status === 'pending_physical_withdrawal'
    ).length;

    return {
      openCount,
      closedCount,
      expiredCount,
      routesWithOpenMerchants,
      rotatedRoutesCount,
      pendingNodesCount,
    };
  }, [state.merchants, state.routes, state.nodes, state.currentTick]);

  const rotatedRouteIds = useMemo(() => {
    const ids = new Set<string>();
    for (const route of state.routes) {
      const linked = state.merchants.filter((m) => m.routeIds.includes(route.id));
      const hasOpen = linked.some(
        (m) =>
          getEffectiveMerchantStatus(m, state.currentTick) === 'open' &&
          m.capacity > 0
      );
      const hasInactive = linked.some(
        (m) => getEffectiveMerchantStatus(m, state.currentTick) !== 'open'
      );
      if (hasOpen && hasInactive) {
        ids.add(route.id);
      }
    }
    return ids;
  }, [state.routes, state.merchants, state.currentTick]);

  const filteredMerchants = useMemo(() => {
    const normalizedQuery = normalizeSearchText(searchQuery);
    return state.merchants.filter((merchant) => {
      if (selectedCategory !== 'all' && merchant.category !== selectedCategory) {
        return false;
      }
      if (onlyAccessible && !merchant.accessible) {
        return false;
      }
      if (!normalizedQuery) {
        return true;
      }
      const routeText = merchant.routeIds
        .map((id) => {
          const r = routesById.get(id);
          return r ? `${r.code} ${r.name} ${r.corridor}` : id;
        })
        .join(' ');
      const haystack = normalizeSearchText(
        `${merchant.name} ${merchant.zone} ${CATEGORY_LABELS[merchant.category]} ${routeText} ${merchant.services.join(' ')}`
      );
      return haystack.includes(normalizedQuery);
    });
  }, [
    state.merchants,
    searchQuery,
    selectedCategory,
    onlyAccessible,
    routesById,
  ]);

  const executeMarketCommand = (
    merchant: Merchant,
    payload: MarketUpdatePayload,
    fallbackActionLabel: string
  ) => {
    const res = handleUpdate(payload);
    const affectedRoutes = merchant.routeIds
      .map((id) => {
        const route = routesById.get(id);
        return route ? `Ruta ${route.code}` : id;
      })
      .join(', ');

    if (res && typeof res === 'object' && 'state' in res) {
      if (!res.ok) {
        setLastFeedback({
          ok: false,
          message: res.error || 'No fue posible actualizar el comercio.',
        });
        return;
      }
      const nextState = res.state;
      const pendingNodes = nextState.nodes.filter(
        (node) => node.status === 'pending_physical_withdrawal'
      ).length;
      const noticeCount = Object.keys(nextState.notices).length;

      setLastFeedback({
        ok: true,
        message: `${fallbackActionLabel} en ${merchant.name}. Recalculadas ${affectedRoutes || 'rutas del corredor'} y ${noticeCount} avisos ciudadanos (Aviso v${nextState.noticeVersion}). ${pendingNodes} de ${nextState.nodes.length} nodos BQ pasaron a «Pendiente de retiro físico». Motivo: ${nextState.lastRecalculationReason}`,
      });
      return;
    }

    setLastFeedback({
      ok: true,
      message: `${fallbackActionLabel} enviada para ${merchant.name} (${affectedRoutes || 'corredor'}). Rutas, avisos y nodos BQ se sincronizaron con el panel de control.`,
    });
  };

  const handleToggleReception = (
    merchant: Merchant,
    effectiveStatus: EffectiveDisplayStatus
  ) => {
    const nextStatus: MerchantStatus =
      effectiveStatus === 'open' || effectiveStatus === 'full'
        ? 'closed'
        : 'open';
    const actionLabel =
      nextStatus === 'closed' ? 'Cierre de recepción' : 'Reapertura de recepción';

    executeMarketCommand(
      merchant,
      {
        merchantId: merchant.id,
        status: nextStatus,
        actorRole: 'Comercio barrial',
      },
      actionLabel
    );
  };

  const handleSaveCapacity = (merchant: Merchant, nextCapacity: number) => {
    executeMarketCommand(
      merchant,
      {
        merchantId: merchant.id,
        capacity: nextCapacity,
        actorRole: 'Comercio barrial',
      },
      `Cupo actualizado a ${nextCapacity}`
    );
  };

  const handleSimulateExpiration = (merchant: Merchant) => {
    const expiredTick = Math.max(0, state.currentTick - 1);
    executeMarketCommand(
      merchant,
      {
        merchantId: merchant.id,
        status: 'expired',
        validUntilTick: expiredTick,
        actorRole: 'Comercio barrial',
      },
      `Vencimiento simulado (vigencia caducada a Tick ${expiredTick})`
    );
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setOnlyAccessible(false);
  };

  const hasActiveFilters =
    searchQuery.trim() !== '' || selectedCategory !== 'all' || onlyAccessible;

  return (
    <section
      aria-labelledby={headingId}
      className="bq-outreach space-y-5"
    >
      <header className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2
              id={headingId}
              className="flex items-center gap-2 text-xl font-bold text-slate-900 sm:text-2xl"
            >
              <Store className="h-6 w-6 shrink-0 text-[#123f78]" aria-hidden="true" />
              <span>BQ Market — Comercios barriales del corredor</span>
            </h2>
            <p className="mt-1 text-sm text-slate-700">
              {state.scenarioLabel} · Tick actual {state.currentTick} · Aviso vigente v
              {state.noticeVersion}
            </p>
          </div>
        </div>

        <div
          role="note"
          className="flex items-start gap-3 rounded-xl border border-[#123f78]/40 bg-[#e8f0fb] px-4 py-3 text-sm font-semibold text-[#123f78]"
        >
          <Info className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
          <p>
            Datos simulados · Comercio barrial demo (Barranquilla) — orientación gratuita sin obligación de compra
          </p>
        </div>
      </header>

      <div
        aria-label="Resumen operativo de comercios barriales"
        className="grid grid-cols-2 gap-3 lg:grid-cols-4"
      >
        <div className="bq-card flex items-center gap-3 p-3">
          <CircleCheck className="h-5 w-5 shrink-0 text-[#14532d]" aria-hidden="true" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
              Abiertos
            </p>
            <p className="text-xl font-bold text-slate-900">{summary.openCount}</p>
          </div>
        </div>

        <div className="bq-card flex items-center gap-3 p-3">
          <CirclePause className="h-5 w-5 shrink-0 text-[#78350f]" aria-hidden="true" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
              Cerrados
            </p>
            <p className="text-xl font-bold text-slate-900">{summary.closedCount}</p>
          </div>
        </div>

        <div className="bq-card flex items-center gap-3 p-3">
          <TriangleAlert className="h-5 w-5 shrink-0 text-[#7f1d1d]" aria-hidden="true" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
              Vencidos
            </p>
            <p className="text-xl font-bold text-slate-900">{summary.expiredCount}</p>
          </div>
        </div>

        <div className="bq-card flex items-center gap-3 p-3">
          <RefreshCw className="h-5 w-5 shrink-0 text-[#123f78]" aria-hidden="true" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
              Rotación comercial activa
            </p>
            <p className="text-sm font-bold text-slate-900">
              {summary.routesWithOpenMerchants}/{state.routes.length} rutas cubiertas
            </p>
            <p className="text-xs text-slate-700">
              {summary.rotatedRoutesCount > 0
                ? `${summary.rotatedRoutesCount} ruta(s) con relevo activo`
                : 'Turnos equitativos vigentes'}
            </p>
          </div>
        </div>
      </div>

      <search
        aria-label="Filtrar comercios barriales de BQ Market"
        className="bq-card block space-y-4"
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-12 md:items-end">
          <div className="flex flex-col gap-1.5 md:col-span-5">
            <label
              htmlFor={searchInputId}
              className="flex items-center gap-1.5 text-sm font-semibold text-slate-900"
            >
              <Search className="h-4 w-4 text-slate-600" aria-hidden="true" />
              <span>Buscar comercio, barrio o servicio</span>
            </label>
            <input
              id={searchInputId}
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Ej. El Prado, hidratación, Av. Murillo..."
              className="w-full rounded-lg border border-slate-400 bg-white px-3 py-2 text-slate-900"
            />
          </div>

          <div className="flex flex-col gap-1.5 md:col-span-4">
            <label
              htmlFor={categorySelectId}
              className="text-sm font-semibold text-slate-900"
            >
              Categoría
            </label>
            <select
              id={categorySelectId}
              value={selectedCategory}
              onChange={(event) =>
                setSelectedCategory(event.target.value as CategoryFilter)
              }
              className="w-full rounded-lg border border-slate-400 bg-white px-3 py-2 text-slate-900"
            >
              {CATEGORY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-3">
            <label
              htmlFor={accessibleCheckboxId}
              className="bq-touch-target inline-flex w-full cursor-pointer items-center gap-3 rounded-lg border border-slate-400 bg-white px-3 py-2 text-sm font-semibold text-slate-900"
            >
              <input
                id={accessibleCheckboxId}
                type="checkbox"
                checked={onlyAccessible}
                onChange={(event) => setOnlyAccessible(event.target.checked)}
                style={{
                  minBlockSize: '1.25rem',
                  minInlineSize: '1.25rem',
                  width: '1.25rem',
                  height: '1.25rem',
                }}
                className="shrink-0 accent-[#123f78]"
              />
              <Accessibility
                className="h-4 w-4 shrink-0 text-[#123f78]"
                aria-hidden="true"
              />
              <span>Solo accesibles</span>
            </label>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 pt-3 text-sm text-slate-700">
          <p>
            Mostrando <strong>{filteredMerchants.length}</strong> de{' '}
            <strong>{state.merchants.length}</strong> comercios barriales
          </p>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="bq-btn text-sm"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      </search>

      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-sm ${
          lastFeedback
            ? lastFeedback.ok
              ? 'border-emerald-700 bg-emerald-50 text-emerald-950'
              : 'border-red-700 bg-red-50 text-red-950'
            : 'border-slate-300 bg-white text-slate-800'
        }`}
      >
        {lastFeedback ? (
          lastFeedback.ok ? (
            <CircleCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-800" aria-hidden="true" />
          ) : (
            <CircleAlert className="mt-0.5 h-5 w-5 shrink-0 text-red-800" aria-hidden="true" />
          )
        ) : (
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-[#123f78]" aria-hidden="true" />
        )}
        <p>
          {lastFeedback
            ? lastFeedback.message
            : `Estado de sincronización: Aviso v${state.noticeVersion} activo. ${summary.pendingNodesCount} de ${state.nodes.length} nodos BQ en «Pendiente de retiro físico».`}
        </p>
      </div>

      {filteredMerchants.length === 0 ? (
        <div className="bq-card space-y-3 text-center">
          <p className="text-base font-semibold text-slate-900">
            Ningún comercio coincide con los filtros actuales.
          </p>
          <p className="text-sm text-slate-700">
            Ajusta la búsqueda, cambia la categoría o desactiva el filtro de accesibilidad.
          </p>
          {hasActiveFilters && (
            <div className="flex justify-center">
              <button
                type="button"
                onClick={clearFilters}
                className="bq-btn bq-btn-primary"
              >
                Limpiar filtros
              </button>
            </div>
          )}
        </div>
      ) : (
        <ul
          aria-label="Lista de comercios barriales en el corredor"
          className="m-0 grid list-none grid-cols-1 gap-4 p-0"
        >
          {filteredMerchants.map((merchant) => {
            const linkedRoutes = merchant.routeIds
              .map((routeId) => routesById.get(routeId))
              .filter((route): route is RouteOption => Boolean(route));
            const hasRotationFallbackActive = merchant.routeIds.some((id) =>
              rotatedRouteIds.has(id)
            );

            return (
              <MerchantCard
                key={merchant.id}
                merchant={merchant}
                currentTick={state.currentTick}
                scenarioId={state.scenarioId}
                linkedRoutes={linkedRoutes}
                hasRotationFallbackActive={hasRotationFallbackActive}
                idPrefix={instanceId}
                onToggleReception={handleToggleReception}
                onSaveCapacity={handleSaveCapacity}
                onSimulateExpiration={handleSimulateExpiration}
              />
            );
          })}
        </ul>
      )}
    </section>
  );
}
