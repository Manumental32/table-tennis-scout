import { useState } from 'react'
import { Copy, Pencil, Play, Trash2 } from 'lucide-react'
import {
  formatPlayerList,
  groupDrillsByKind,
  hasDrillSteps,
  isCatalogTraining,
} from '../../utils/trainings'

export default function TrainingDetail({
  training,
  canDelete,
  onOpenDrill,
  onEdit,
  onDuplicate,
  onDelete,
}) {
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false)
  const groups = groupDrillsByKind(training.drills)
  const catalogNote = isCatalogTraining(training)
    ? 'Plantilla. Si la editás, se guarda tu versión en este dispositivo.'
    : ''

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

      {groups.map((group) => (
        <section key={group.kind} className="space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
            {group.title}
          </h3>
          {group.drills.map((drill) => (
            <article key={drill.id} className="rounded-2xl bg-slate-800 px-4 py-4">
              <p className="text-base font-semibold text-white">{drill.title}</p>
              {drill.durationLabel ? (
                <p className="mt-1 text-sm text-slate-400">{drill.durationLabel}</p>
              ) : null}
              {drill.description ? (
                <p className="mt-2 text-sm leading-relaxed text-slate-300">
                  {drill.description}
                </p>
              ) : null}
              {hasDrillSteps(drill) ? (
                <button
                  type="button"
                  onClick={() => onOpenDrill(drill.id)}
                  className="mt-4 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-white text-sm font-semibold text-slate-900"
                >
                  <Play className="h-4 w-4" aria-hidden="true" />
                  Ver A y B
                </button>
              ) : null}
            </article>
          ))}
        </section>
      ))}

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
