import { useState } from 'react'
import { Crosshair, Pencil, Trash2, Video } from 'lucide-react'
import { BUILD, GRIP, HAND, HEIGHT, MOBILITY, PLAY_STYLE, RHYTHM, RUBBER } from '../../utils/constants'
import {
  BUILD_OPTIONS,
  GRIP_OPTIONS,
  HAND_OPTIONS,
  HEIGHT_OPTIONS,
  MOBILITY_OPTIONS,
  PLAY_STYLE_OPTIONS,
  RHYTHM_OPTIONS,
  RUBBER_OPTIONS,
  getOptionLabel,
} from '../../utils/labels'
import { formatRecordScore, formatWinRate } from '../../utils/stats'
import { hasSelectedZones } from '../../utils/tableZones'
import { buildYoutubeSearchUrl } from '../../utils/youtube'
import TableZoneMap from '../common/TableZoneMap'

function ProfileRow({ label, value }) {
  if (!value || value === 'Sin dato') {
    return null
  }

  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <dt className="text-sm text-slate-400">{label}</dt>
      <dd className="text-right text-sm font-medium text-white">{value}</dd>
    </div>
  )
}

function hasTacticalInfo(rival) {
  return Boolean(
    rival.distanceFromTable ||
      rival.mainStrengthDescription ||
      rival.mainWeaknessDescription ||
      rival.preferredServe ||
      rival.problematicReceive ||
      rival.preferredBall ||
      rival.generalNotes ||
      hasSelectedZones(rival.targetZones),
  )
}

function formatRubber(type, brand, model) {
  const typeLabel = getOptionLabel(RUBBER_OPTIONS, type)

  if (type === RUBBER.UNKNOWN && !brand && !model) {
    return ''
  }

  return [typeLabel !== 'Sin dato' ? typeLabel : '', brand, model]
    .filter(Boolean)
    .join(' · ')
}

export default function RivalProfile({
  rival,
  record,
  onEdit,
  onDelete,
  onOpenScouting,
}) {
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false)
  const youtubeUrl = buildYoutubeSearchUrl(rival.name)

  return (
    <div className="space-y-4 pb-6">
      <section className="rounded-2xl bg-slate-800 px-4 py-4">
        <p className="text-xl font-semibold text-white">{rival.name}</p>
        {rival.club ? (
          <p className="mt-1 text-sm text-slate-300">{rival.club}</p>
        ) : null}
        {record && (record.played > 0 || record.pending > 0) ? (
          <p className="mt-3 text-sm text-slate-300">
            {[
              formatRecordScore(record),
              formatWinRate(record.winRate),
              `${record.setsWon}-${record.setsLost} sets`,
              record.pending > 0 ? `${record.pending} pendiente` : '',
            ]
              .filter(Boolean)
              .join(' · ')}
          </p>
        ) : null}
      </section>

      <button
        type="button"
        onClick={onOpenScouting}
        className="flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-white text-base font-semibold text-slate-900"
      >
        <Crosshair className="h-5 w-5" aria-hidden="true" />
        Ver plan rápido
      </button>

      <a
        href={youtubeUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-slate-800 text-base font-semibold text-white"
      >
        <Video className="h-5 w-5" aria-hidden="true" />
        Buscar videos
      </a>

      <section className="rounded-2xl bg-slate-800 px-4">
        <h3 className="pt-4 text-sm font-semibold uppercase tracking-wide text-slate-400">
          Perfil
        </h3>
        <dl className="divide-y divide-slate-700">
          <ProfileRow
            label="Mano"
            value={
              rival.hand !== HAND.UNKNOWN
                ? getOptionLabel(HAND_OPTIONS, rival.hand)
                : ''
            }
          />
          <ProfileRow
            label="Agarre"
            value={
              rival.grip !== GRIP.UNKNOWN
                ? getOptionLabel(GRIP_OPTIONS, rival.grip)
                : ''
            }
          />
          <ProfileRow
            label="Derecha"
            value={formatRubber(
              rival.forehandRubber,
              rival.forehandRubberBrand,
              rival.forehandRubberModel,
            )}
          />
          <ProfileRow
            label="Revés"
            value={formatRubber(
              rival.backhandRubber,
              rival.backhandRubberBrand,
              rival.backhandRubberModel,
            )}
          />
          <ProfileRow label="Madera" value={rival.blade} />
          <ProfileRow
            label="Estilo"
            value={
              rival.mainStrength !== PLAY_STYLE.UNKNOWN
                ? getOptionLabel(PLAY_STYLE_OPTIONS, rival.mainStrength)
                : ''
            }
          />
          <ProfileRow
            label="Ritmo"
            value={
              rival.preferredRhythm !== RHYTHM.UNKNOWN
                ? getOptionLabel(RHYTHM_OPTIONS, rival.preferredRhythm)
                : ''
            }
          />
          <ProfileRow
            label="Altura"
            value={
              rival.height !== HEIGHT.UNKNOWN
                ? getOptionLabel(HEIGHT_OPTIONS, rival.height)
                : ''
            }
          />
          <ProfileRow
            label="Complexión"
            value={
              rival.build !== BUILD.UNKNOWN
                ? getOptionLabel(BUILD_OPTIONS, rival.build)
                : ''
            }
          />
          <ProfileRow
            label="Movilidad"
            value={
              rival.mobility !== MOBILITY.UNKNOWN
                ? getOptionLabel(MOBILITY_OPTIONS, rival.mobility)
                : ''
            }
          />
        </dl>
      </section>

      {hasTacticalInfo(rival) ? (
        <section className="space-y-3 rounded-2xl bg-slate-800 px-4 py-4">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
            Táctica
          </h3>
          <TableZoneMap
            selectedIds={rival.targetZones}
            readOnly
            title=""
            description=""
          />
          <ProfileBlock label="Distancia" value={rival.distanceFromTable} />
          <ProfileBlock label="Fortaleza" value={rival.mainStrengthDescription} />
          <ProfileBlock label="Debilidad" value={rival.mainWeaknessDescription} />
          <ProfileBlock label="Saque" value={rival.preferredServe} />
          <ProfileBlock label="Recepción" value={rival.problematicReceive} />
          <ProfileBlock label="Pelota" value={rival.preferredBall} />
          <ProfileBlock label="Notas" value={rival.generalNotes} />
        </section>
      ) : null}

      <button
        type="button"
        onClick={onEdit}
        className="flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-slate-800 text-base font-semibold text-white"
      >
        <Pencil className="h-5 w-5" aria-hidden="true" />
        Editar perfil
      </button>

      {isConfirmingDelete ? (
        <div className="rounded-2xl bg-slate-800 px-4 py-4">
          <p className="text-sm text-slate-300">
            ¿Eliminar a {rival.name}? Esta acción no se puede deshacer.
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
          Eliminar rival
        </button>
      )}
    </div>
  )
}

function ProfileBlock({ label, value }) {
  if (!value) {
    return null
  }

  return (
    <div>
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-1 whitespace-pre-line text-sm text-white">{value}</p>
    </div>
  )
}
