import { motion } from 'framer-motion'
import {
  TABLE_SIDE,
  TABLE_SIDE_LABELS,
  getOpponentRows,
  getOwnRows,
  getZoneAriaLabel,
  getZoneShortLabel,
  hasSelectedZones,
  parseZoneId,
  sanitizeZoneIds,
  toggleZone,
} from '../../utils/tableZones'

function ZoneButton({ zoneId, isSelected, isActive, readOnly, onToggle }) {
  const label = getZoneShortLabel(zoneId)
  const [depthLabel, laneLabel] = label.split('\n')
  const isOpponent = zoneId.startsWith(`${TABLE_SIDE.OPPONENT}-`)
  const selectedClass = isOpponent
    ? 'bg-emerald-600 text-white'
    : 'bg-sky-600 text-white'
  const className = `relative flex min-h-11 flex-col items-center justify-center rounded-lg px-1 text-center text-[11px] font-medium leading-tight ${
    isSelected ? selectedClass : 'bg-slate-700 text-slate-300'
  } ${isActive ? 'ring-2 ring-amber-300' : ''}`
  const content = (
    <>
      <span>{depthLabel}</span>
      <span>{laneLabel}</span>
      {isActive ? (
        <motion.span
          layoutId="drill-ball"
          className="absolute left-1/2 top-1.5 h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-orange-400"
        />
      ) : null}
    </>
  )

  if (readOnly) {
    return (
      <div className={className} aria-label={getZoneAriaLabel(zoneId)}>
        {content}
      </div>
    )
  }

  return (
    <button
      type="button"
      aria-pressed={isSelected}
      aria-label={getZoneAriaLabel(zoneId)}
      onClick={() => onToggle(zoneId)}
      className={className}
    >
      {content}
    </button>
  )
}

function Half({ rows, selected, activeZoneId, readOnly, onToggle }) {
  return (
    <div className="grid grid-cols-3 gap-1">
      {rows.flatMap((row) =>
        row.map((zoneId) => (
          <ZoneButton
            key={zoneId}
            zoneId={zoneId}
            isSelected={selected.has(zoneId)}
            isActive={activeZoneId === zoneId}
            readOnly={readOnly}
            onToggle={onToggle}
          />
        )),
      )}
    </div>
  )
}

export default function TableZoneMap({
  selectedIds = [],
  activeZoneId = '',
  onChange,
  readOnly = false,
  forceVisible = false,
  title = 'Zonas de la mesa',
  description = 'Tocá para marcar. Arriba es el lado del rival (corto pegado a la red).',
  opponentLabel = TABLE_SIDE_LABELS[TABLE_SIDE.OPPONENT],
  ownLabel = TABLE_SIDE_LABELS[TABLE_SIDE.OWN],
}) {
  const zones = sanitizeZoneIds(selectedIds)
  const currentZoneId = parseZoneId(activeZoneId) ? activeZoneId : ''

  if (readOnly && !hasSelectedZones(zones) && !currentZoneId && !forceVisible) {
    return null
  }

  const selected = new Set(zones)

  function handleToggle(zoneId) {
    if (readOnly) {
      return
    }

    onChange?.(toggleZone(zones, zoneId))
  }

  return (
    <section className="space-y-3">
      {title ? (
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
          {title}
        </h3>
      ) : null}
      {description && !readOnly ? (
        <p className="text-sm leading-relaxed text-slate-300">{description}</p>
      ) : null}

      <div className="rounded-2xl bg-slate-800 px-4 py-4">
        <p className="mb-2 text-center text-xs font-semibold uppercase tracking-wide text-emerald-300">
          {opponentLabel}
        </p>
        <Half
          rows={getOpponentRows()}
          selected={selected}
          activeZoneId={currentZoneId}
          readOnly={readOnly}
          onToggle={handleToggle}
        />
        <div className="my-2 rounded-full bg-amber-200 py-1 text-center text-[11px] font-semibold text-slate-900">
          Red
        </div>
        <Half
          rows={getOwnRows()}
          selected={selected}
          activeZoneId={currentZoneId}
          readOnly={readOnly}
          onToggle={handleToggle}
        />
        <p className="mt-2 text-center text-xs font-semibold uppercase tracking-wide text-sky-300">
          {ownLabel}
        </p>
      </div>
    </section>
  )
}
