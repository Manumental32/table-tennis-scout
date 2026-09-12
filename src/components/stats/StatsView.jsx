import { ChartColumn } from 'lucide-react'
import { MATCH_RESULT } from '../../utils/constants'
import { formatMatchDate } from '../../utils/matches'
import {
  createRecord,
  formatRecordScore,
  formatWinRate,
  getHandRecords,
  getRecentForm,
  getRivalRecords,
  getLosingPhrases,
  getRubberRecords,
  getTacticalInsights,
  getTournamentRecords,
  getWinningPhrases,
} from '../../utils/stats'
import EmptyState from '../common/EmptyState'

function StatCard({ label, value, detail }) {
  return (
    <article className="rounded-2xl bg-slate-800 px-4 py-4">
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-white">{value}</p>
      {detail ? <p className="mt-1 text-sm text-slate-300">{detail}</p> : null}
    </article>
  )
}

function RecordRow({ title, record, detail }) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-2xl bg-slate-800 px-4 py-4">
      <div className="min-w-0">
        <p className="text-base font-semibold text-white">{title}</p>
        {detail ? <p className="mt-1 text-sm text-slate-300">{detail}</p> : null}
      </div>
      <div className="shrink-0 text-right">
        <p className="text-base font-semibold text-white">
          {formatRecordScore(record)}
        </p>
        <p className="mt-1 text-sm text-slate-300">{formatWinRate(record.winRate)}</p>
      </div>
    </div>
  )
}

export default function StatsView({ matches, rivals, tournaments, getRivalById }) {
  const record = createRecord(matches)
  const rivalRecords = getRivalRecords(matches, rivals)
  const tournamentRecords = getTournamentRecords(matches, tournaments)
  const handRecords = getHandRecords(matches, getRivalById)
  const rubberRecords = getRubberRecords(matches, getRivalById)
  const recentForm = getRecentForm(matches)
  const insights = getTacticalInsights(matches, getRivalById)
  const winningPhrases = getWinningPhrases(matches)
  const losingPhrases = getLosingPhrases(matches)

  if (record.played === 0 && record.pending === 0) {
    return (
      <EmptyState
        icon={ChartColumn}
        title="Sin estadísticas todavía"
        description="Cuando registres partidos con resultado, acá vas a ver win rate, sets y cómo te fue contra cada rival."
      />
    )
  }

  return (
    <div className="space-y-4 pb-6">
      <section className="grid grid-cols-2 gap-3">
        <StatCard
          label="Win rate"
          value={formatWinRate(record.winRate)}
          detail={`${record.wins}V · ${record.losses}D`}
        />
        <StatCard
          label="Partidos"
          value={String(record.played)}
          detail={
            record.pending > 0 ? `${record.pending} sin resultado` : 'Con resultado'
          }
        />
        <StatCard
          label="Sets"
          value={`${record.setsWon}-${record.setsLost}`}
          detail="Ganados-perdidos"
        />
        <StatCard
          label="Marcador"
          value={formatRecordScore(record)}
          detail="Victorias-derrotas"
        />
      </section>

      {recentForm.length > 0 ? (
        <section className="rounded-2xl bg-slate-800 px-4 py-4">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
            Forma reciente
          </h3>
          <div className="mt-3 flex gap-2">
            {recentForm.map((item) => (
              <span
                key={item.id}
                className={`flex h-10 w-10 items-center justify-center rounded-xl text-sm font-semibold ${
                  item.result === MATCH_RESULT.WIN
                    ? 'bg-emerald-600 text-white'
                    : 'bg-red-600 text-white'
                }`}
              >
                {item.result === MATCH_RESULT.WIN ? 'V' : 'D'}
              </span>
            ))}
          </div>
        </section>
      ) : null}

      {rivalRecords.length > 0 ? (
        <section className="space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
            Contra rivales
          </h3>
          {rivalRecords.map((item) => (
            <RecordRow
              key={item.rival.id}
              title={item.rival.name}
              record={item.record}
              detail={[
                item.rival.club,
                `${item.record.setsWon}-${item.record.setsLost} sets`,
                item.record.pending > 0 ? `${item.record.pending} pendiente` : '',
              ]
                .filter(Boolean)
                .join(' · ')}
            />
          ))}
        </section>
      ) : null}

      {tournamentRecords.length > 0 ? (
        <section className="space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
            Por torneo
          </h3>
          {tournamentRecords.map((item) => (
            <RecordRow
              key={item.tournament.id}
              title={item.tournament.name || 'Torneo'}
              record={item.record}
              detail={formatMatchDate(item.tournament.date)}
            />
          ))}
        </section>
      ) : null}

      {handRecords.length > 0 ? (
        <section className="space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
            Según la mano
          </h3>
          {handRecords.map((item) => (
            <RecordRow key={item.key} title={item.label} record={item.record} />
          ))}
        </section>
      ) : null}

      {rubberRecords.length > 0 ? (
        <section className="space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
            Según la goma de derecha
          </h3>
          {rubberRecords.map((item) => (
            <RecordRow key={item.key} title={item.label} record={item.record} />
          ))}
        </section>
      ) : null}

      {winningPhrases.length > 0 || losingPhrases.length > 0 ? (
        <section className="space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
            Tendencias
          </h3>
          {winningPhrases.length > 0 ? (
            <div className="space-y-2 rounded-2xl bg-slate-800 px-4 py-4">
              <p className="text-sm font-semibold text-emerald-300">Cuando ganás</p>
              {winningPhrases.map((item) => (
                <div key={item.text} className="pt-2">
                  <p className="text-sm text-white">{item.text}</p>
                  <p className="mt-1 text-sm text-slate-400">
                    {item.wins}V · {item.losses}D · {formatWinRate(item.winRate)}
                  </p>
                </div>
              ))}
            </div>
          ) : null}
          {losingPhrases.length > 0 ? (
            <div className="space-y-2 rounded-2xl bg-slate-800 px-4 py-4">
              <p className="text-sm font-semibold text-red-300">Cuando perdés</p>
              {losingPhrases.map((item) => (
                <div key={item.text} className="pt-2">
                  <p className="text-sm text-white">{item.text}</p>
                  <p className="mt-1 text-sm text-slate-400">
                    {item.wins}V · {item.losses}D · {formatWinRate(item.winRate)}
                  </p>
                </div>
              ))}
            </div>
          ) : null}
        </section>
      ) : null}

      {insights.length > 0 ? (
        <section className="space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
            Qué funcionó
          </h3>
          {insights.map((item) => (
            <article key={item.id} className="space-y-2 rounded-2xl bg-slate-800 px-4 py-4">
              <p className="text-base font-semibold text-white">{item.rivalName}</p>
              {item.whatWorked ? (
                <p className="text-sm text-slate-300">
                  <span className="text-slate-400">Funcionó: </span>
                  {item.whatWorked}
                </p>
              ) : null}
              {item.whatDidNotWork ? (
                <p className="text-sm text-slate-300">
                  <span className="text-slate-400">No funcionó: </span>
                  {item.whatDidNotWork}
                </p>
              ) : null}
              {item.advice ? (
                <p className="text-sm text-slate-300">
                  <span className="text-slate-400">Para el próximo: </span>
                  {item.advice}
                </p>
              ) : null}
            </article>
          ))}
        </section>
      ) : null}
    </div>
  )
}
