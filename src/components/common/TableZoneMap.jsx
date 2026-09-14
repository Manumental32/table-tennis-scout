import { motion } from 'framer-motion'
import {
  TABLE_LANE,
  TABLE_SIDE,
  TABLE_SIDE_LABELS,
  getLaneStrokeLabel,
  getOpponentRows,
  getOwnRows,
  getZoneAriaLabel,
  getZoneShortLabel,
  getZoneStroke,
  hasSelectedZones,
  parseZoneId,
  sanitizeZoneIds,
  toggleZone,
} from '../../utils/tableZones'

const BALL_TRANSITION = { type: 'tween', duration: 0.45, ease: 'easeInOut' }

const STROKE_TINT = {
  backhand: 'bg-sky-300/30',
  forehand: 'bg-amber-300/30',
  middle: 'bg-white/5',
}

function StrokeHeaders({ side }) {
  const toneClass = {
    [TABLE_LANE.LEFT]:
      side === TABLE_SIDE.OWN ? 'text-sky-300' : 'text-amber-300',
    [TABLE_LANE.MIDDLE]: 'text-slate-400',
    [TABLE_LANE.RIGHT]:
      side === TABLE_SIDE.OWN ? 'text-amber-300' : 'text-sky-300',
  }

  return (
    <div className="grid grid-cols-3 text-center text-[10px] font-semibold uppercase tracking-wide">
      {Object.values(TABLE_LANE).map((lane) => (
        <span key={`${side}-${lane}`} className={toneClass[lane]}>
          {getLaneStrokeLabel(side, lane)}
        </span>
      ))}
    </div>
  )
}

function ZoneButton({
  zoneId,
  isSelected,
  isActive,
  readOnly,
  ballLabel,
  onToggle,
}) {
  const label = getZoneShortLabel(zoneId)
  const [depthLabel] = label.split('\n')
  const stroke = getZoneStroke(zoneId)
  const tintClass = isActive
    ? 'bg-white/35'
    : isSelected
      ? 'bg-white/18'
      : (STROKE_TINT[stroke] ?? 'bg-transparent')
  const className = `relative flex min-h-11 flex-col items-center justify-center px-1 text-center text-[10px] font-medium leading-tight text-white/70 ${tintClass} ${
    isActive ? 'ring-2 ring-inset ring-amber-200' : ''
  }`
  const content = (
    <>
      {readOnly ? null : <span>{depthLabel}</span>}
      {isActive ? (
        <motion.span
          layoutId="drill-ball"
          transition={BALL_TRANSITION}
          className="absolute left-1/2 top-1/2 z-20 flex h-7 min-w-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-orange-400 px-1 text-xs font-bold text-slate-900 shadow-[0_2px_8px_rgba(0,0,0,0.35)]"
        >
          {ballLabel || ''}
        </motion.span>
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

function Half({ rows, selected, activeZoneId, ballLabel, readOnly, onToggle }) {
  return (
    <div className="grid h-full grid-cols-3 grid-rows-2 divide-x divide-y divide-white/40">
      {rows.flatMap((row) =>
        row.map((zoneId) => (
          <ZoneButton
            key={zoneId}
            zoneId={zoneId}
            isSelected={selected.has(zoneId)}
            isActive={activeZoneId === zoneId}
            ballLabel={ballLabel}
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
  ballLabel = '',
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
        <p className="mb-1 text-center text-xs font-semibold uppercase tracking-wide text-emerald-300">
          {opponentLabel}
        </p>
        <StrokeHeaders side={TABLE_SIDE.OPPONENT} />

        <div className="mt-2 rounded-sm bg-[#5c3d24] p-[5px] shadow-lg">
          <div className="relative overflow-visible rounded-[2px] border-[3px] border-white bg-[#0f7a3a] shadow-[inset_0_0_40px_rgba(0,0,0,0.28)]">
            <div className="pointer-events-none absolute inset-y-0 left-1/2 z-10 w-[2px] -translate-x-1/2 bg-white" />
            <div className="grid h-[268px] grid-rows-[1fr_10px_1fr]">
              <Half
                rows={getOpponentRows()}
                selected={selected}
                activeZoneId={currentZoneId}
                ballLabel={ballLabel}
                readOnly={readOnly}
                onToggle={handleToggle}
              />
              <div className="relative z-20 flex items-center">
                <div className="absolute -left-1.5 h-5 w-1.5 rounded-sm bg-slate-200 shadow" />
                <div className="absolute -right-1.5 h-5 w-1.5 rounded-sm bg-slate-200 shadow" />
                <div className="absolute inset-x-0 h-2.5 bg-gradient-to-b from-slate-100 via-white to-slate-300 shadow-md" />
              </div>
              <Half
                rows={getOwnRows()}
                selected={selected}
                activeZoneId={currentZoneId}
                ballLabel={ballLabel}
                readOnly={readOnly}
                onToggle={handleToggle}
              />
            </div>
          </div>
        </div>

        <StrokeHeaders side={TABLE_SIDE.OWN} />
        <p className="mt-1 text-center text-xs font-semibold uppercase tracking-wide text-sky-300">
          {ownLabel}
        </p>
      </div>
    </section>
  )
}
