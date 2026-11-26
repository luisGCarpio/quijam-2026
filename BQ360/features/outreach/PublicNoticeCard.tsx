'use client';

import React, { useId, useState } from 'react';
import {
  Accessibility,
  Ban,
  CheckCircle2,
  Clock,
  Compass,
  Droplets,
  FileCheck2,
  HeartPulse,
  Landmark,
  Leaf,
  MapPin,
  Newspaper,
  PauseCircle,
  PhoneCall,
  RefreshCw,
  Route,
  ShieldAlert,
  Store,
  User,
  Users,
  WifiOff,
} from 'lucide-react';
import { PROFILE_LABELS } from './data.mjs';
import { useOptionalOutreach } from './store';
import type {
  CorridorResource,
  MerchantCategory,
  OutreachState,
  PolicyId,
  PublicNotice,
  PublicProfileId,
  RouteOption,
} from './types';

export interface PublicNoticeCardProps {
  externalState?: OutreachState;
  externalProfile?: PublicProfileId;
  onProfileChange?: (profile: PublicProfileId) => void;
}

const PROFILE_ORDER: PublicProfileId[] = [
  'turista',
  'ciudadano',
  'movilidad_reducida',
  'prensa',
];

const POLICY_LABELS: Record<PolicyId, string> = {
  shortest: 'Ruta más corta',
  balanced: 'Distribución equilibrada',
  intervention: 'Intervención Calle 30 / Malecón',
};

const MERCHANT_CATEGORY_LABELS: Record<MerchantCategory, string> = {
  gastronomia: 'Gastronomía barrial',
  artesania: 'Artesanía local',
  hidratacion: 'Hidratación',
  servicios: 'Servicios al visitante',
};

function ProfileIcon({ profileId }: { profileId: PublicProfileId }) {
  switch (profileId) {
    case 'turista':
      return <Compass className="h-5 w-5 shrink-0" aria-hidden="true" />;
    case 'ciudadano':
      return <User className="h-5 w-5 shrink-0" aria-hidden="true" />;
    case 'movilidad_reducida':
      return <Accessibility className="h-5 w-5 shrink-0" aria-hidden="true" />;
    case 'prensa':
      return <Newspaper className="h-5 w-5 shrink-0" aria-hidden="true" />;
  }
}

function getServiceDescriptor(serviceText: string): {
  label: string;
  icon: React.ReactNode;
} {
  const normalized = serviceText.toLowerCase();
  if (
    normalized.includes('salud') ||
    normalized.includes('crue') ||
    normalized.includes('atenci') ||
    normalized.includes('emergencia') ||
    normalized.includes('125') ||
    normalized.includes('123') ||
    normalized.includes('119')
  ) {
    return {
      label: 'Atención / Salud',
      icon: (
        <HeartPulse
          className="h-4 w-4 shrink-0 text-[#7f1d1d]"
          aria-hidden="true"
        />
      ),
    };
  }
  if (normalized.includes('hidrataci') || normalized.includes('agua')) {
    return {
      label: 'Hidratación',
      icon: (
        <Droplets
          className="h-4 w-4 shrink-0 text-[#123f78]"
          aria-hidden="true"
        />
      ),
    };
  }
  if (
    normalized.includes('punto verde') ||
    normalized.includes('jard') ||
    normalized.includes('ribera') ||
    normalized.includes('verde')
  ) {
    return {
      label: 'Ambiente',
      icon: (
        <Leaf
          className="h-4 w-4 shrink-0 text-[#14532d]"
          aria-hidden="true"
        />
      ),
    };
  }
  if (
    normalized.includes('malec') ||
    normalized.includes('centro hist') ||
    normalized.includes('mercado') ||
    normalized.includes('cultura') ||
    normalized.includes('corredor') ||
    normalized.includes('murales') ||
    normalized.includes('feria') ||
    normalized.includes('bienvenida')
  ) {
    return {
      label: 'Cultura y entorno',
      icon: (
        <Landmark
          className="h-4 w-4 shrink-0 text-[#78350f]"
          aria-hidden="true"
        />
      ),
    };
  }
  return {
    label: 'Servicio en ruta',
    icon: (
      <MapPin
        className="h-4 w-4 shrink-0 text-slate-700"
        aria-hidden="true"
      />
    ),
  };
}

function renderStatusMeta(status: PublicNotice['status']) {
  switch (status) {
    case 'active':
      return {
        label: 'Vigente',
        badgeClass: 'bq-badge bq-badge-ok',
        boxClass: 'border-[#14532d] bg-[#dcfce7] text-[#14532d]',
        icon: <CheckCircle2 className="h-5 w-5 shrink-0" aria-hidden="true" />,
      };
    case 'recalculated':
      return {
        label: 'Recalculado',
        badgeClass: 'bq-badge bq-badge-info',
        boxClass: 'border-[#123f78] bg-[#e8f0fb] text-[#123f78]',
        icon: <RefreshCw className="h-5 w-5 shrink-0" aria-hidden="true" />,
      };
    case 'paused':
      return {
        label: 'Pausa preventiva',
        badgeClass: 'bq-badge bq-badge-warn',
        boxClass: 'border-[#78350f] bg-[#fef3c7] text-[#78350f]',
        icon: <PauseCircle className="h-5 w-5 shrink-0" aria-hidden="true" />,
      };
    case 'pending_specific_attention':
      return {
        label: 'Pendiente de atención específica',
        badgeClass: 'bq-badge bq-badge-alert',
        boxClass: 'border-2 border-[#7f1d1d] bg-[#fee2e2] text-[#7f1d1d]',
        icon: <ShieldAlert className="h-5 w-5 shrink-0" aria-hidden="true" />,
      };
  }
}

export function PublicNoticeCard({
  externalState,
  externalProfile,
  onProfileChange,
}: PublicNoticeCardProps = {}) {
  const ctx = useOptionalOutreach();
  const isExternalMode = externalState !== undefined;
  const [localProfile, setLocalProfile] = useState<PublicProfileId>('ciudadano');
  const radioGroupId = useId();
  const headingId = useId();

  const state = isExternalMode ? externalState : ctx?.state;
  if (!state) {
    throw new Error(
      'PublicNoticeCard debe usarse dentro de OutreachProvider o recibir externalState.'
    );
  }

  const activeProfile =
    externalProfile ?? (isExternalMode ? localProfile : ctx?.activeProfile ?? localProfile);

  const handleProfileChange = (nextProfile: PublicProfileId) => {
    if (externalProfile === undefined) {
      if (!isExternalMode && ctx) {
        ctx.setActiveProfile(nextProfile);
      } else {
        setLocalProfile(nextProfile);
      }
    }
    onProfileChange?.(nextProfile);
  };

  const notice = state.notices[activeProfile];
  const profileMeta = PROFILE_LABELS[activeProfile];
  const assignedRoute: RouteOption | null = notice.routeId
    ? state.routes.find((r) => r.id === notice.routeId) ?? null
    : null;
  const destinationResource: CorridorResource | null = assignedRoute
    ? state.resources.find((r) => r.id === assignedRoute.destinationId) ?? null
    : null;

  const pausedResources = state.resources.filter(
    (r) => r.status === 'preventive_pause'
  );
  const verifiedClosures = state.resources.filter(
    (r) => r.status === 'verified_closure'
  );

  const isReducedMobilityNoRoute =
    activeProfile === 'movilidad_reducida' && notice.routeId === null;
  const showSpecificAttentionBox =
    notice.status === 'pending_specific_attention' || isReducedMobilityNoRoute;

  const statusMeta = renderStatusMeta(notice.status);
  const isNoticeExpired = state.currentTick > notice.validUntilTick;

  return (
    <section
      aria-labelledby={headingId}
      className="bq-outreach bq-card space-y-5 text-slate-900"
    >
      {/* Profile Selector (<fieldset> + <legend> + visible <input type="radio">) */}
      <fieldset className="rounded-xl border border-slate-300 bg-slate-50/80 p-4">
        <legend className="px-2 text-sm font-bold text-slate-900">
          Seleccione el perfil de orientación pública
        </legend>
        <div className="mt-2 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          {PROFILE_ORDER.map((profileId) => {
            const item = PROFILE_LABELS[profileId];
            const isSelected = activeProfile === profileId;
            const inputId = `${radioGroupId}-${profileId}`;

            return (
              <label
                key={profileId}
                htmlFor={inputId}
                className={`bq-touch-target flex cursor-pointer items-start gap-3 rounded-xl p-3 transition-colors ${
                  isSelected
                    ? 'border-2 border-[#123f78] bg-[#e8f0fb] text-[#0f172a]'
                    : 'border border-slate-300 bg-white text-slate-900 hover:border-[#123f78]'
                }`}
              >
                <input
                  id={inputId}
                  type="radio"
                  name={radioGroupId}
                  value={profileId}
                  checked={isSelected}
                  onChange={() => handleProfileChange(profileId)}
                  className="h-5 w-5 shrink-0 cursor-pointer accent-[#123f78]"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 font-bold text-slate-900">
                      <ProfileIcon profileId={profileId} />
                      {item.label}
                    </span>
                    {isSelected ? (
                      <span className="bq-badge bq-badge-info text-xs">
                        Seleccionado
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-slate-700">
                    {item.description}
                  </p>
                </div>
              </label>
            );
          })}
        </div>
      </fieldset>

      {/* Notice Header & Metadata */}
      <header className="space-y-3 border-b border-slate-200 pb-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="bq-badge bq-badge-info">
            <FileCheck2 className="h-4 w-4 shrink-0" aria-hidden="true" />
            Aviso v{notice.version}
          </span>

          <span
            className={`bq-badge ${
              isNoticeExpired ? 'bq-badge-warn' : 'bq-badge-ok'
            }`}
          >
            <Clock className="h-4 w-4 shrink-0" aria-hidden="true" />
            Vigente hasta Tick {notice.validUntilTick} · Tick actual{' '}
            {state.currentTick}
          </span>

          <span className={statusMeta.badgeClass}>
            {statusMeta.icon}
            {statusMeta.label}
          </span>

          <span className="bq-badge border-slate-600 bg-slate-100 text-slate-900">
            <WifiOff className="h-4 w-4 shrink-0" aria-hidden="true" />
            Datos simulados · Orientación disponible sin conexión
          </span>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
            Perfil {profileMeta.label} · {state.scenarioLabel} · Política:{' '}
            {POLICY_LABELS[state.policy]}
          </p>
          <h2
            id={headingId}
            className="mt-1 text-lg font-extrabold leading-snug text-slate-950 sm:text-xl"
          >
            {notice.headline}
          </h2>
          <p className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-slate-700">
            <Clock className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span>Emitido: {notice.issuedAt}</span>
            {isNoticeExpired ? (
              <span className="font-semibold text-[#78350f]">
                · Aviso vencido respecto al tick actual; verifique actualización en
                BQ Node.
              </span>
            ) : null}
          </p>
        </div>
      </header>

      {/* Explicit Status Banner */}
      <div
        role="status"
        aria-live="polite"
        className={`rounded-xl border p-4 ${statusMeta.boxClass}`}
      >
        <div className="flex items-start gap-3">
          <div className="mt-0.5 shrink-0">{statusMeta.icon}</div>
          <div className="space-y-2 text-sm">
            <p className="font-extrabold">Estado del aviso: {statusMeta.label}</p>

            {notice.status === 'active' ? (
              <p>
                Orientación vigente y verificada para el perfil{' '}
                <strong>{profileMeta.label}</strong> en el escenario actual.
              </p>
            ) : null}

            {notice.status === 'recalculated' ? (
              <p>
                <strong>Motivo de recálculo:</strong>{' '}
                {state.lastRecalculationReason}
              </p>
            ) : null}

            {notice.status === 'paused' ? (
              <div className="space-y-1.5">
                <p className="font-semibold">
                  Pausa preventiva acotada: riesgo reportado en verificación, no
                  equivale a cierre oficial definitivo.
                </p>
                <p>{notice.reason}</p>
              </div>
            ) : null}

            {showSpecificAttentionBox ? (
              <div className="space-y-2.5">
                <p className="font-extrabold">
                  Sin ruta compatible verificada — NO se redirige por corredores
                  inaccesibles.
                </p>
                <p>
                  Las personas con movilidad reducida permanecen en espera segura y
                  reciben atención prioritaria presencial en el BQ Node más
                  cercano. No se asignan rutas sin piso nivelado ni rampas
                  verificadas.
                </p>
                <div className="rounded-lg border border-[#7f1d1d]/40 bg-white/90 p-3 text-slate-900">
                  <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-[#7f1d1d]">
                    <PhoneCall className="h-4 w-4 shrink-0" aria-hidden="true" />
                    Líneas de atención Barranquilla
                  </p>
                  <ul className="mt-1.5 flex flex-wrap gap-3 text-sm font-bold">
                    <li>
                      <span className="rounded bg-[#fee2e2] px-2 py-0.5 text-[#7f1d1d]">
                        123
                      </span>{' '}
                      Emergencias
                    </li>
                    <li>
                      <span className="rounded bg-[#fee2e2] px-2 py-0.5 text-[#7f1d1d]">
                        125
                      </span>{' '}
                      Salud / CRUE
                    </li>
                    <li>
                      <span className="rounded bg-[#fee2e2] px-2 py-0.5 text-[#7f1d1d]">
                        119
                      </span>{' '}
                      Bomberos
                    </li>
                  </ul>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* Accessibility Guarantee Badge when Reduced Mobility has a verified accessible route */}
      {activeProfile === 'movilidad_reducida' && assignedRoute ? (
        <div className="flex items-start gap-3 rounded-xl border border-[#14532d] bg-[#dcfce7] p-3.5 text-sm text-[#14532d]">
          <Accessibility className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
          <div>
            <p className="font-bold">
              Protección de accesibilidad activa en {assignedRoute.name}
            </p>
            <p className="mt-0.5">
              Ruta verificada con piso nivelado y reserva prioritaria. No se
              redirige por corredores no accesibles.
            </p>
          </div>
        </div>
      ) : null}

      {/* Preventive Pause vs Verified Closure Distinction */}
      {pausedResources.length > 0 && notice.status !== 'paused' ? (
        <div className="rounded-xl border border-[#78350f] bg-[#fef3c7] p-3.5 text-sm text-[#78350f]">
          <p className="flex items-center gap-2 font-bold">
            <PauseCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
            Pausa preventiva acotada en el sistema
          </p>
          <p className="mt-1">
            Pausa preventiva acotada: riesgo reportado en verificación, no
            equivale a cierre oficial definitivo.
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-xs font-medium">
            {pausedResources.map((res) => (
              <li key={res.id}>
                {res.name}
                {res.pauseReason ? ` — ${res.pauseReason}` : ''}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {pausedResources.length > 0 && notice.status === 'paused' ? (
        <div className="rounded-xl border border-[#78350f]/60 bg-white p-3.5 text-sm text-slate-900">
          <p className="font-bold text-[#78350f]">
            Recursos en pausa preventiva (en verificación):
          </p>
          <ul className="mt-1.5 list-disc space-y-1 pl-5 text-xs text-slate-800">
            {pausedResources.map((res) => (
              <li key={res.id}>
                <strong>{res.name}</strong>
                {res.pauseReason ? `: ${res.pauseReason}` : ''}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {verifiedClosures.length > 0 ? (
        <div
          role="alert"
          className="rounded-xl border-2 border-[#7f1d1d] bg-[#fee2e2] p-3.5 text-sm text-[#7f1d1d]"
        >
          <p className="flex items-center gap-2 font-extrabold">
            <Ban className="h-4 w-4 shrink-0" aria-hidden="true" />
            Cierre oficial verificado (distinto a pausa preventiva)
          </p>
          <p className="mt-1">
            A diferencia de una pausa preventiva acotada en verificación, estos
            recursos presentan cierre oficial confirmado y permanecen
            inhabilitados hasta reapertura formal:
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-xs font-semibold">
            {verifiedClosures.map((res) => (
              <li key={res.id}>
                {res.name}
                {res.pauseReason ? ` — ${res.pauseReason}` : ''}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {/* Route & Load Details */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
          <h3 className="flex items-center gap-2 text-sm font-extrabold text-slate-900">
            <Route className="h-4 w-4 shrink-0 text-[#123f78]" aria-hidden="true" />
            Corredor asignado y carga operativa
          </h3>

          <dl className="mt-3 space-y-2.5 text-sm">
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                Ruta / Corredor
              </dt>
              <dd className="mt-0.5 font-bold text-slate-950">
                {notice.routeName}
              </dd>
              {assignedRoute ? (
                <dd className="text-xs text-slate-700">
                  {assignedRoute.corridor}
                </dd>
              ) : null}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Tiempo estimado
                </dt>
                <dd className="mt-0.5 font-bold text-slate-900">
                  {assignedRoute ? `${assignedRoute.travelMinutes} min` : 'No aplica'}
                </dd>
              </div>

              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Carga vs. capacidad
                </dt>
                <dd className="mt-0.5 font-bold text-slate-900">
                  {destinationResource
                    ? `${destinationResource.assigned} / ${destinationResource.capacity} plazas`
                    : assignedRoute
                      ? `${assignedRoute.assignedTotal} asignados`
                      : '0 / 0 (sin corredor)'}
                </dd>
                {assignedRoute ? (
                  <dd className="text-xs text-slate-700">
                    En ruta: {assignedRoute.assignedTotal} ({assignedRoute.assignedAccess}{' '}
                    accesibles · {assignedRoute.assignedFlex} general)
                  </dd>
                ) : null}
              </div>
            </div>

            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                Criterio de asignación
              </dt>
              <dd className="mt-0.5 text-slate-800">{notice.reason}</dd>
            </div>
          </dl>
        </div>

        {/* Global Demand Snapshot */}
        <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
          <h3 className="flex items-center gap-2 text-sm font-extrabold text-slate-900">
            <Users className="h-4 w-4 shrink-0 text-[#123f78]" aria-hidden="true" />
            Panorama global de demanda
          </h3>

          <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-3 lg:grid-cols-1">
            <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2.5">
              <span className="text-xs font-semibold text-slate-700">
                Asignados
              </span>
              <span className="text-sm font-extrabold text-[#14532d]">
                Asignados: {state.allocation.assignedTotal} /{' '}
                {state.allocation.totalDemand}
              </span>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2.5">
              <span className="text-xs font-semibold text-slate-700">
                Pendientes totales
              </span>
              <span className="text-sm font-extrabold text-slate-900">
                Pendientes: {state.allocation.pendingTotal}
              </span>
            </div>

            <div
              className={`flex items-center justify-between rounded-lg border px-3 py-2.5 ${
                state.allocation.pendingAccess > 0
                  ? 'border-[#7f1d1d] bg-[#fee2e2] text-[#7f1d1d]'
                  : 'border-slate-200 bg-white text-slate-900'
              }`}
            >
              <span className="text-xs font-semibold">
                Atención accesible pendiente
              </span>
              <span className="text-sm font-extrabold">
                Pendientes por accesibilidad: {state.allocation.pendingAccess}
              </span>
            </div>
          </div>

          <p className="mt-3 text-xs text-slate-700">
            Cruce compartido utilizado:{' '}
            <strong>
              {state.allocation.sharedCrossingUsed} /{' '}
              {state.allocation.sharedCrossingCapacity}
            </strong>{' '}
            plazas.
          </p>
        </div>
      </div>

      {/* Services Along the Route */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <h3 className="flex items-center gap-2 text-sm font-extrabold text-slate-900">
            <Droplets className="h-4 w-4 shrink-0 text-[#123f78]" aria-hidden="true" />
            Servicios incluidos en la ruta
          </h3>
          <ul className="mt-3 space-y-2 text-sm">
            {notice.servicesIncluded.map((service, idx) => {
              const descriptor = getServiceDescriptor(service);
              return (
                <li
                  key={`${notice.id}-svc-${idx}`}
                  className="flex items-start gap-2.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2"
                >
                  <span className="mt-0.5 shrink-0">{descriptor.icon}</span>
                  <div className="min-w-0">
                    <span className="block text-[11px] font-bold uppercase tracking-wide text-slate-600">
                      {descriptor.label}
                    </span>
                    <span className="text-slate-900">{service}</span>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Open Neighborhood Merchants */}
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="flex items-center gap-2 text-sm font-extrabold text-slate-900">
              <Store className="h-4 w-4 shrink-0 text-[#123f78]" aria-hidden="true" />
              Comercios barriales abiertos en la ruta
            </h3>
            <span className="bq-badge bq-badge-info text-xs">
              Orientación gratuita sin obligación de compra
            </span>
          </div>

          {notice.openMerchants.length > 0 ? (
            <ul className="mt-3 space-y-2.5 text-sm">
              {notice.openMerchants.map((merchant) => {
                const remainingCupo = Math.max(
                  0,
                  merchant.capacity - merchant.occupied
                );
                return (
                  <li
                    key={merchant.id}
                    className="rounded-lg border border-slate-200 bg-slate-50 p-3"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="font-bold text-slate-950">
                          {merchant.name}
                        </p>
                        <p className="text-xs text-slate-700">
                          {merchant.zone} ·{' '}
                          {MERCHANT_CATEGORY_LABELS[merchant.category]}
                        </p>
                      </div>
                      <span className="bq-badge bq-badge-ok text-xs">
                        Cupo disponible: {remainingCupo} / {merchant.capacity}
                      </span>
                    </div>

                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                      {merchant.accessible ? (
                        <span className="inline-flex items-center gap-1 rounded bg-[#e8f0fb] px-2 py-0.5 font-semibold text-[#123f78]">
                          <Accessibility
                            className="h-3.5 w-3.5 shrink-0"
                            aria-hidden="true"
                          />
                          Acceso nivelado
                        </span>
                      ) : null}
                      {merchant.freeOrientationNoPurchase ? (
                        <span className="font-semibold text-slate-700">
                          Orientación gratuita sin obligación de compra
                        </span>
                      ) : null}
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
              <p className="font-semibold text-slate-900">
                No hay comercios barriales abiertos disponibles en este corredor
                para el tick actual.
              </p>
              <p className="mt-1 text-xs">
                Los puntos BQ Node y de hidratación mantienen orientación gratuita
                sin obligación de compra.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
