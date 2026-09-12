import {
  formatTournamentDate,
  getTournamentStatusClassName,
  getTournamentStatusLabel,
} from '../../utils/tournaments'

export default function TournamentList({ tournaments, onSelect }) {
  return (
    <ul className="space-y-3">
      {tournaments.map((tournament) => {
        const subtitle = [
          formatTournamentDate(tournament.date),
          tournament.category,
          tournament.playerName,
        ]
          .filter(Boolean)
          .join(' · ')

        return (
          <li key={tournament.id}>
            <button
              type="button"
              onClick={() => onSelect(tournament.id)}
              className="w-full rounded-2xl bg-slate-800 px-4 py-4 text-left"
            >
              <div className="flex items-start justify-between gap-3">
                <p className="text-base font-semibold text-white">
                  {tournament.name || 'Torneo sin nombre'}
                </p>
                <p
                  className={`shrink-0 text-sm font-semibold ${getTournamentStatusClassName(
                    tournament.status,
                  )}`}
                >
                  {getTournamentStatusLabel(tournament.status)}
                </p>
              </div>
              <p className="mt-1 text-sm text-slate-300">
                {subtitle || 'Sin fecha ni categoría'}
              </p>
            </button>
          </li>
        )
      })}
    </ul>
  )
}
