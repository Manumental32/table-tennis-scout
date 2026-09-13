import { getOptionLabel, HAND_OPTIONS } from '../../utils/labels'
import { HAND } from '../../utils/constants'
import { getScoutingPlan } from '../../utils/rivals'
import TableZoneMap from '../common/TableZoneMap'

function PlanSection({ title, items, accentClass, emptyLabel }) {
  return (
    <section className="rounded-2xl bg-slate-800 px-4 py-5">
      <h3 className={`text-sm font-semibold uppercase tracking-wide ${accentClass}`}>
        {title}
      </h3>
      {items.length > 0 ? (
        <ul className="mt-3 space-y-2">
          {items.map((item) => (
            <li key={item} className="text-base leading-relaxed text-white">
              {item}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-sm text-slate-400">{emptyLabel}</p>
      )}
    </section>
  )
}

export default function QuickScoutingCard({ rival }) {
  const plan = getScoutingPlan(rival)
  const details = [
    rival.club,
    rival.hand !== HAND.UNKNOWN ? getOptionLabel(HAND_OPTIONS, rival.hand) : '',
  ].filter(Boolean)

  return (
    <div className="space-y-4 pb-6">
      <section className="rounded-2xl bg-slate-800 px-4 py-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          Rival
        </p>
        <h3 className="mt-2 text-2xl font-semibold text-white">{rival.name}</h3>
        {details.length > 0 ? (
          <p className="mt-1 text-sm text-slate-300">{details.join(' · ')}</p>
        ) : null}
      </section>

      <TableZoneMap selectedIds={rival.targetZones} readOnly />

      <PlanSection
        title="Hacer"
        items={plan.thingsToDo}
        accentClass="text-emerald-400"
        emptyLabel="Todavía no cargaste qué hacer."
      />
      <PlanSection
        title="Evitar"
        items={plan.thingsToAvoid}
        accentClass="text-red-400"
        emptyLabel="Todavía no cargaste qué evitar."
      />
      <PlanSection
        title="Objetivo"
        items={plan.objectives}
        accentClass="text-sky-400"
        emptyLabel="Todavía no cargaste el objetivo."
      />
    </div>
  )
}
