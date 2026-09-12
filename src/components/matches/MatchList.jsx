import {
  formatMatchDate,
  formatScore,
  getMatchTitle,
  getResultClassName,
  getResultLabel,
  isCoachedMatch,
} from '../../utils/matches'

export default function MatchList({
  matches,
  getRivalById,
  getTeammateById,
  onSelect,
}) {
  return (
    <ul className="space-y-3">
      {matches.map((match) => {
        const rival = match.rivalId ? getRivalById(match.rivalId) : null
        const teammate = match.teammateId
          ? getTeammateById(match.teammateId)
          : null
        const score = match.score || formatScore(match.sets)
        const title = getMatchTitle(match, rival, teammate)
        const subtitle = [
          isCoachedMatch(match) ? 'Cocheo' : '',
          isCoachedMatch(match) && rival?.name ? `vs ${rival.name}` : '',
          formatMatchDate(match.date),
          score,
        ]
          .filter(Boolean)
          .join(' · ')

        return (
          <li key={match.id}>
            <button
              type="button"
              onClick={() => onSelect(match.id)}
              className="w-full rounded-2xl bg-slate-800 px-4 py-4 text-left"
            >
              <div className="flex items-start justify-between gap-3">
                <p className="text-base font-semibold text-white">{title}</p>
                <p
                  className={`shrink-0 text-sm font-semibold ${getResultClassName(match.result)}`}
                >
                  {getResultLabel(match.result)}
                </p>
              </div>
              <p className="mt-1 text-sm text-slate-300">{subtitle}</p>
            </button>
          </li>
        )
      })}
    </ul>
  )
}
