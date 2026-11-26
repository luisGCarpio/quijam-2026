'use client';

import React, { useCallback, useId, useMemo, useState } from 'react';
import {
  Accessibility,
  AlertTriangle,
  Bot,
  Briefcase,
  Building2,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Filter,
  Info,
  MapPin,
  RotateCcw,
  Send,
  ShieldCheck,
  Tag,
} from 'lucide-react';
import { answerLocalAiQuestion } from './engine.mjs';
import { useOptionalOutreach } from './store';
import type {
  JobOpportunity,
  LocalAiResponse,
  OutreachState,
} from './types';

export interface LocalAssistantProps {
  externalState?: OutreachState;
  onAskLocalAi?: (query: string) => LocalAiResponse;
}

type ModalityFilter = 'Todos' | JobOpportunity['modality'];

interface ConversationEntry {
  id: string;
  query: string;
  response: LocalAiResponse;
  isInitialSummary?: boolean;
}

const PRESET_QUESTIONS: readonly string[] = [
  '¿Por qué se asignó o pausó la ruta C?',
  '¿Cómo funciona el cruce compartido B+C (430)?',
  '¿Qué comercios cerraron o vencieron?',
  '¿Hay fichas BQ Node pendientes de retiro?',
  '¿Dónde hay hidratación y acceso inclusivo?',
];

const MODALITY_OPTIONS: readonly ModalityFilter[] = [
  'Todos',
  'Voluntariado',
  'Capacitación',
  'Empleo local',
];

function AiResponseCard({ entry }: { entry: ConversationEntry }) {
  const { response } = entry;

  return (
    <article
      className="bq-card space-y-3 border-slate-300 bg-white"
      aria-label={
        entry.isInitialSummary
          ? `Resumen automático v${response.noticeVersion}`
          : `Respuesta local a: ${entry.query}`
      }
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="bq-badge bq-badge-info">
            <Bot className="h-3.5 w-3.5" aria-hidden="true" />
            {entry.isInitialSummary ? 'Estado inicial / vigente' : 'Consulta local'}
          </span>
          <p className="text-sm font-semibold text-slate-900">
            {entry.query}
          </p>
        </div>
        <span className="bq-badge bq-badge-ok">
          v{response.noticeVersion}
        </span>
      </div>

      <p className="text-sm leading-relaxed text-slate-900">
        {response.answer}
      </p>

      <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
        <h4 className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-800">
          <CheckCircle2 className="h-4 w-4 text-[#123f78]" aria-hidden="true" />
          Evidencia verificable del estado actual (v{response.noticeVersion})
        </h4>
        <ul className="list-disc space-y-1 pl-5 text-sm text-slate-800">
          {response.evidence.map((item, idx) => (
            <li key={`${entry.id}-ev-${idx}`}>{item}</li>
          ))}
        </ul>
      </div>

      {response.referencedResources.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700">
            <Tag className="h-3.5 w-3.5" aria-hidden="true" />
            Recursos referenciados:
          </span>
          {response.referencedResources.map((resourceId) => (
            <span
              key={`${entry.id}-res-${resourceId}`}
              className="bq-badge bq-badge-info font-mono text-xs"
            >
              {resourceId}
            </span>
          ))}
        </div>
      )}

      <p className="flex items-start gap-1.5 text-xs text-slate-600">
        <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#123f78]" aria-hidden="true" />
        <span>{response.disclaimer}</span>
      </p>
    </article>
  );
}

interface JobCardProps {
  job: JobOpportunity;
  expanded: boolean;
  onToggle: (jobId: string) => void;
}

function JobCard({ job, expanded, onToggle }: JobCardProps) {
  const detailId = useId();

  const modalityBadgeClass =
    job.modality === 'Voluntariado'
      ? 'bq-badge bq-badge-ok'
      : job.modality === 'Capacitación'
        ? 'bq-badge bq-badge-info'
        : 'bq-badge bq-badge-warn';

  return (
    <article className="bq-card flex flex-col justify-between gap-3 bg-white">
      <div className="space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <h3 className="text-base font-bold text-slate-900">{job.title}</h3>
          <span className={modalityBadgeClass}>{job.modality}</span>
        </div>

        <dl className="space-y-1.5 text-sm text-slate-700">
          <div className="flex items-start gap-2">
            <dt className="sr-only">Organización ilustrativa</dt>
            <Building2 className="mt-0.5 h-4 w-4 shrink-0 text-slate-600" aria-hidden="true" />
            <dd>{job.organization}</dd>
          </div>
          <div className="flex items-start gap-2">
            <dt className="sr-only">Corredor o zona</dt>
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-600" aria-hidden="true" />
            <dd>{job.corridorZone}</dd>
          </div>
          <div className="flex items-start gap-2">
            <dt className="sr-only">Horario ilustrativo</dt>
            <Clock className="mt-0.5 h-4 w-4 shrink-0 text-slate-600" aria-hidden="true" />
            <dd>{job.schedule}</dd>
          </div>
        </dl>

        <div className="flex flex-wrap gap-2">
          <span
            className={
              job.accessible
                ? 'bq-badge bq-badge-ok'
                : 'bq-badge bq-badge-warn'
            }
          >
            <Accessibility className="h-3.5 w-3.5" aria-hidden="true" />
            {job.accessible
              ? 'Acceso inclusivo disponible'
              : 'Accesibilidad por verificar'}
          </span>
          <span className="bq-badge bq-badge-warn">
            <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
            {job.partnerStatus}
          </span>
        </div>
      </div>

      <div className="border-t border-slate-200 pt-2">
        <button
          type="button"
          className="bq-btn w-full justify-between text-sm"
          aria-expanded={expanded}
          aria-controls={detailId}
          onClick={() => onToggle(job.id)}
        >
          <span>{expanded ? 'Ocultar detalle ilustrativo' : 'Ver detalle ilustrativo'}</span>
          {expanded ? (
            <ChevronUp className="h-4 w-4" aria-hidden="true" />
          ) : (
            <ChevronDown className="h-4 w-4" aria-hidden="true" />
          )}
        </button>

        <div
          id={detailId}
          hidden={!expanded}
          className="mt-3 space-y-2 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-slate-800"
        >
          <p>{job.description}</p>
          <p className="flex items-start gap-1.5 text-xs font-semibold text-amber-900">
            <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <span>
              Ficha conceptual sin valor contractual: no se recopilan datos personales, no existen postulaciones activas y no hay convenios institucionales confirmados.
            </span>
          </p>
        </div>
      </div>
    </article>
  );
}

interface LocalAssistantViewProps {
  state: OutreachState;
  askLocalAi: (query: string) => LocalAiResponse;
}

function LocalAssistantView({ state, askLocalAi }: LocalAssistantViewProps) {
  const [queryInput, setQueryInput] = useState<string>('');
  const [validationError, setValidationError] = useState<string>('');
  const [userEntries, setUserEntries] = useState<ConversationEntry[]>([]);
  const [modalityFilter, setModalityFilter] = useState<ModalityFilter>('Todos');
  const [accessibleOnly, setAccessibleOnly] = useState<boolean>(false);
  const [expandedJobIds, setExpandedJobIds] = useState<Record<string, boolean>>({});

  const instanceId = useId();
  const aiHeadingId = `${instanceId}-bq-ai-heading`;
  const aiQueryId = `${instanceId}-bq-ai-query`;
  const aiQueryErrorId = `${instanceId}-bq-ai-query-error`;
  const jobsHeadingId = `${instanceId}-bq-jobs-heading`;
  const accessibleCheckboxId = `${instanceId}-bq-jobs-accessible`;

  const welcomeEntry = useMemo<ConversationEntry>(() => {
    const response = askLocalAi('resumen');
    return {
      id: `ai-welcome-v${state.noticeVersion}-t${state.currentTick}`,
      query: 'Resumen verificable del estado actual',
      response,
      isInitialSummary: true,
    };
  }, [askLocalAi, state]);

  const submitQuery = useCallback(
    (rawQuery: string, clearInput = true) => {
      const trimmed = rawQuery.trim();
      if (!trimmed) {
        setValidationError(
          'Escribe una pregunta o selecciona una consulta rápida para consultar el estado local.'
        );
        return;
      }

      setValidationError('');
      const response = askLocalAi(trimmed);
      setUserEntries((prev) => [
        {
          id: `ai-entry-${prev.length + 1}-v${response.noticeVersion}`,
          query: trimmed,
          response,
        },
        ...prev,
      ]);
      if (clearInput) {
        setQueryInput('');
      }
    },
    [askLocalAi]
  );

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    submitQuery(queryInput);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.nativeEvent.isComposing) return;
    if (e.key === 'Enter') {
      e.preventDefault();
      submitQuery(queryInput);
    }
  };

  const handlePresetClick = (presetQuery: string) => {
    submitQuery(presetQuery, false);
  };

  const handleToggleJob = useCallback((jobId: string) => {
    setExpandedJobIds((prev) => ({
      ...prev,
      [jobId]: !prev[jobId],
    }));
  }, []);

  const filteredJobs = useMemo(() => {
    return state.jobs.filter((job) => {
      if (modalityFilter !== 'Todos' && job.modality !== modalityFilter) {
        return false;
      }
      if (accessibleOnly && !job.accessible) {
        return false;
      }
      return true;
    });
  }, [state.jobs, modalityFilter, accessibleOnly]);

  const conversationFeed = useMemo<ConversationEntry[]>(
    () => [...userEntries, welcomeEntry],
    [userEntries, welcomeEntry]
  );

  return (
    <div className="bq-outreach space-y-6">
      {/* Section 1: BQ AI Local Verificable */}
      <section
        className="bq-card space-y-4"
        aria-labelledby={aiHeadingId}
      >
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 pb-3">
          <div className="space-y-1">
            <h2
              id={aiHeadingId}
              className="flex items-center gap-2 text-lg font-bold text-slate-900"
            >
              <Bot className="h-5 w-5 text-[#123f78]" aria-hidden="true" />
              BQ AI · Asistente local verificable (sin API key · reglas deterministas sobre datos simulados)
            </h2>
            <p className="text-sm text-slate-700">
              Consulta explicable 100 % local sobre el estado vigente de rutas, cruces, comercios y puntos presenciales BQ Node en Barranquilla.
            </p>
          </div>
          <span className="bq-badge bq-badge-info">
            <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
            Sin API externa · Aviso v{state.noticeVersion} · Tick {state.currentTick}
          </span>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-700">
            Consultas rápidas verificables
          </p>
          <div className="flex flex-wrap gap-2">
            {PRESET_QUESTIONS.map((question) => (
              <button
                key={question}
                type="button"
                className="bq-btn text-left text-sm"
                onClick={() => handlePresetClick(question)}
              >
                {question}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleFormSubmit} className="space-y-2" noValidate>
          <label
            htmlFor={aiQueryId}
            className="block text-sm font-semibold text-slate-900"
          >
            Pregunta sobre el estado actual del escenario
          </label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              id={aiQueryId}
              type="text"
              value={queryInput}
              onChange={(e) => {
                setQueryInput(e.target.value);
                if (validationError) {
                  setValidationError('');
                }
              }}
              onKeyDown={handleInputKeyDown}
              placeholder="Ej.: ¿Qué comercios cerraron o por qué cambió la ruta?"
              aria-describedby={validationError ? aiQueryErrorId : undefined}
              aria-invalid={validationError ? true : undefined}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder:text-slate-500"
            />
            <button
              type="submit"
              className="bq-btn bq-btn-primary shrink-0"
            >
              <Send className="h-4 w-4" aria-hidden="true" />
              Consultar estado
            </button>
          </div>
          {validationError && (
            <p
              id={aiQueryErrorId}
              role="alert"
              className="text-sm font-medium text-red-700"
            >
              {validationError}
            </p>
          )}
        </form>

        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          <h3 className="text-sm font-bold text-slate-800">
            Historial de respuestas verificables ({conversationFeed.length})
          </h3>
          {userEntries.length > 0 && (
            <button
              type="button"
              className="bq-btn text-xs"
              onClick={() => setUserEntries([])}
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              Limpiar consultas
            </button>
          )}
        </div>

        <div className="space-y-3" aria-live="polite">
          {conversationFeed.map((entry) => (
            <AiResponseCard key={entry.id} entry={entry} />
          ))}
        </div>
      </section>

      {/* Section 2: BQ Jobs — Catálogo Ilustrativo / Evolutivo */}
      <section
        className="bq-card space-y-4"
        aria-labelledby={jobsHeadingId}
      >
        <div
          role="note"
          className="rounded-xl border-2 border-amber-400 bg-amber-50 p-4 text-amber-950"
        >
          <div className="flex flex-wrap items-start gap-3">
            <AlertTriangle
              className="mt-0.5 h-5 w-5 shrink-0 text-amber-800"
              aria-hidden="true"
            />
            <div className="space-y-1">
              <h2
                id={jobsHeadingId}
                className="flex items-center gap-2 text-base font-bold text-amber-950"
              >
                <Briefcase className="h-5 w-5 shrink-0" aria-hidden="true" />
                BQ Jobs · Catálogo ilustrativo y evolutivo — datos ficticios, sin convenios institucionales confirmados
              </h2>
              <p className="text-sm text-amber-900">
                Muestra conceptual de posibles líneas futuras de vinculación ciudadana. No recopila datos personales ni constituye convocatorias reales.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filtrar por modalidad">
            <span className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wide text-slate-700">
              <Filter className="h-3.5 w-3.5" aria-hidden="true" />
              Modalidad:
            </span>
            {MODALITY_OPTIONS.map((modality) => {
              const active = modalityFilter === modality;
              return (
                <button
                  key={modality}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setModalityFilter(modality)}
                  className={
                    active ? 'bq-btn bq-btn-primary text-sm' : 'bq-btn text-sm'
                  }
                >
                  {modality}
                </button>
              );
            })}
          </div>

          <label
            htmlFor={accessibleCheckboxId}
            className="flex min-h-[48px] cursor-pointer items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-900"
          >
            <input
              id={accessibleCheckboxId}
              type="checkbox"
              checked={accessibleOnly}
              onChange={(e) => setAccessibleOnly(e.target.checked)}
              className="h-5 w-5 accent-[#123f78]"
            />
            <span>Solo accesibles</span>
          </label>
        </div>

        <p className="text-sm text-slate-700">
          Mostrando <strong>{filteredJobs.length}</strong> de{' '}
          <strong>{state.jobs.length}</strong> fichas ilustrativas.
        </p>

        {filteredJobs.length === 0 ? (
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
            <p>
              No hay fichas ilustrativas que coincidan con los filtros seleccionados.
            </p>
            <button
              type="button"
              className="bq-btn mt-3 text-sm"
              onClick={() => {
                setModalityFilter('Todos');
                setAccessibleOnly(false);
              }}
            >
              Restablecer filtros
            </button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {filteredJobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                expanded={Boolean(expandedJobIds[job.id])}
                onToggle={handleToggleJob}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export function LocalAssistant({
  externalState,
  onAskLocalAi,
}: LocalAssistantProps = {}) {
  const ctx = useOptionalOutreach();
  const state = externalState ?? ctx?.state;

  const askLocalAi = useCallback(
    (query: string): LocalAiResponse => {
      if (onAskLocalAi) {
        return onAskLocalAi(query);
      }
      if (!externalState && ctx) {
        return ctx.askLocalAi(query);
      }
      if (!state) {
        throw new Error(
          'LocalAssistant debe usarse dentro de OutreachProvider o recibir externalState.'
        );
      }
      return answerLocalAiQuestion(state, query);
    },
    [onAskLocalAi, externalState, ctx, state]
  );

  if (!state) {
    throw new Error(
      'LocalAssistant debe usarse dentro de OutreachProvider o recibir externalState.'
    );
  }

  return <LocalAssistantView state={state} askLocalAi={askLocalAi} />;
}
