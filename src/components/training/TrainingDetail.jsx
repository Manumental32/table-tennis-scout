import { useState } from 'react'
import { Check, Copy, Pencil, Play, Trash2 } from 'lucide-react'
import { TRAINING_DRILL_KIND } from '../../utils/constants'
import {
  formatPlayerList,
  hasDrillSteps,
  isCatalogTraining,
} from '../../utils/trainings'
import { getKindLabel, getTurnProgress } from '../../utils/trainingSession'

function getTurnStatus(progress) {
  if (!progress) {
    return ''
  }

  const continuous = `${progress.continuousDone}/${progress.continuousTotal} continuos`
  const serve = `${progress.serveDone}/${progress.serveTotal} de saque`
  return `${continuous} · ${serve}`
}

export default function TrainingDetail({
  training,
  groups,
  entries,
  completedIds,
  canDelete,
  onOpenDrill,
  onToggleComplete,
  onEdit,
  onDuplicate,
  onDelete,
}) {
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false)
  const catalogNote = isCatalogTraining(training)
    ? 'Plantilla. Si la editás, se guarda tu versión en este dispositivo.'
    : ''
  const completedCount = entries.filter((entry) =>
    completedIds.includes(entry.drill.id),
  ).length

  return (
    <div className="space-y-4 pb-6">
      <section className="rounded-2xl bg-slate-800 px-4 py-4">
        <p className="text-xl font-semibold text-white">{training.name}</p>
        {training.rotation ? (
          <p className="mt-2 text-sm leading-relaxed text-slate-300">
            {training.rotation}
          </p>
        ) : null}
        {training.drillDurationLabel ? (
          <p className="mt-1 text-sm text-slate-400">{training.drillDurationLabel}</p>
        ) : null}
        {training.notes ? (
          <p className="mt-3 text-sm leading-relaxed text-slate-300">{training.notes}</p>
        ) : null}
        {entries.length > 0 ? (
          <p className="mt-3 text-sm font-medium text-slate-300">
            {completedCount} / {entries.length} hechos hoy
          </p>
        ) : null}
        {catalogNote ? (
          <p className="mt-3 text-xs leading-relaxed text-slate-500">{catalogNote}</p>
        ) : null}
      </section>

      {training.players.length > 0 ? (
        <section className="rounded-2xl bg-slate-800 px-4 py-4">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
            Grupo
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-white">
            {formatPlayerList(training.players)}
          </p>
        </section>
      ) : null}

      {groups.map((group) => {
        const turn = Number.parseInt(String(group.id).replace('turn-', ''), 10)
        const turnProgress = Number.isNaN(turn)
          ? null
          : getTurnProgress(entries, completedIds, turn)
        const subtitle = turnProgress
          ? getTurnStatus(turnProgress)
          : group.subtitle

        return (
          <section key={group.id} className="space-y-3">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
                {group.title}
              </h3>
              {subtitle ? (
                <p className="mt-1 text-xs font-medium text-slate-500">{subtitle}</p>
              ) : null}
            </div>
            {group.sections.map((section) => (
              <div key={section.title || group.id} className="space-y-3">
                {section.title ? (
                  <h4 className="pt-1 text-sm font-semibold text-slate-200">
                    {section.title}
                  </h4>
                ) : null}
                {section.entries.map((entry) => {
                  const { drill, number } = entry
                  const isCompleted = completedIds.includes(drill.id)
                  const kindLabel =
                    drill.kind === TRAINING_DRILL_KIND.WARMUP
                      ? ''
                      : getKindLabel(drill.kind)

                  return (
                    <article
                      key={drill.id}
                      className={`rounded-2xl px-4 py-4 ${
                        isCompleted ? 'bg-slate-800/70' : 'bg-slate-800'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <p
                          className={`flex h-8 min-w-8 items-center justify-center rounded-full text-sm font-semibold ${
                            isCompleted
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-700 text-white'
                          }`}
                        >
                          {number}
                        </p>
                        <div className="min-w-0 flex-1">
                          <p
                            className={`text-base font-semibold ${
                              isCompleted ? 'text-slate-300' : 'text-white'
                            }`}
                          >
                            {drill.title}
                          </p>
                          <p className="mt-1 text-sm text-slate-400">
                            {[drill.durationLabel, kindLabel].filter(Boolean).join(' · ')}
                          </p>
                          {drill.description ? (
                            <p className="mt-2 text-sm leading-relaxed text-slate-300">
                              {drill.description}
                            </p>
                          ) : null}
                        </div>
                      </div>
                      <div className="mt-4 grid grid-cols-[1fr_auto] gap-2">
                        <button
                          type="button"
                          onClick={() => onOpenDrill(drill.id)}
                          className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-white text-sm font-semibold text-slate-900"
                        >
                          <Play className="h-4 w-4" aria-hidden="true" />
                          {isCompleted
                            ? 'Ver de nuevo'
                            : hasDrillSteps(drill)
                              ? 'Hacer ejercicio'
                              : 'Empezar timer'}
                        </button>
                        <button
                          type="button"
                          onClick={() => onToggleComplete(drill.id)}
                          aria-label={
                            isCompleted
                              ? `Sacar hecho de ${drill.title}`
                              : `Marcar ${drill.title} como hecho`
                          }
                          className={`flex min-h-12 min-w-12 items-center justify-center rounded-xl ${
                            isCompleted
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-700 text-slate-300'
                          }`}
                        >
                          <Check className="h-4 w-4" aria-hidden="true" />
                        </button>
                      </div>
                    </article>
                  )
                })}
              </div>
            ))}
          </section>
        )
      })}

      <button
        type="button"
        onClick={onEdit}
        className="flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-slate-800 text-base font-semibold text-white"
      >
        <Pencil className="h-5 w-5" aria-hidden="true" />
        Editar plan
      </button>
      <button
        type="button"
        onClick={onDuplicate}
        className="flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-slate-800 text-sm font-medium text-white"
      >
        <Copy className="h-4 w-4" aria-hidden="true" />
        Duplicar
      </button>
      {canDelete ? (
        isConfirmingDelete ? (
          <div className="rounded-2xl bg-slate-800 px-4 py-4">
            <p className="text-sm text-slate-300">
              ¿Eliminar {training.name}? Si era una plantilla, vuelve la original.
            </p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setIsConfirmingDelete(false)}
                className="min-h-12 rounded-xl bg-slate-700 font-medium text-white"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={onDelete}
                className="min-h-12 rounded-xl bg-red-500 font-medium text-white"
              >
                Eliminar
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setIsConfirmingDelete(true)}
            className="flex min-h-12 w-full items-center justify-center gap-2 text-sm font-medium text-red-400"
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
            Eliminar plan
          </button>
        )
      ) : null}
    </div>
  )
}
