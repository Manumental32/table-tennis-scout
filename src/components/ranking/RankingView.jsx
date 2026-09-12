import { Search, Trophy } from 'lucide-react'
import { useState } from 'react'
import {
  filterRanking,
  findRankingEntry,
  formatRankingPoints,
  formatRatingChange,
  getDefaultRankingCategory,
  getRankingCategories,
  getRatingChangeClassName,
  isRankingClubmate,
  isRankingOpponent,
  needsRankingSearch,
} from '../../utils/ranking'
import { formatFetembaCategory } from '../../services/pdf/fetemba'
import { namesMatch } from '../../utils/tournaments'
import EmptyState from '../common/EmptyState'

function getRowClassName(isPlayer, isOpponent) {
  if (isPlayer) {
    return 'bg-white text-slate-900'
  }

  if (isOpponent) {
    return 'bg-slate-700 text-white'
  }

  return 'bg-slate-800 text-white'
}

function getPlayerChangeClassName(change) {
  if (change > 0) {
    return 'text-emerald-700'
  }

  if (change < 0) {
    return 'text-red-700'
  }

  return 'text-slate-500'
}

function getHighlightLabel(isPlayer, isOpponent, isClubmate) {
  if (isPlayer) {
    return 'Vos'
  }

  if (isOpponent) {
    return 'Rival del fixture'
  }

  if (isClubmate) {
    return 'Tu club'
  }

  return ''
}

function RankingRow({ entry, isPlayer, isOpponent, isClubmate }) {
  const ratingChange = formatRatingChange(entry.ratingChange)
  const details = [entry.club, formatFetembaCategory(entry.category)].filter(Boolean)
  const rowClass = getRowClassName(isPlayer, isOpponent)
  const metaClass = isPlayer ? 'text-slate-600' : 'text-slate-300'
  const changeClass = isPlayer
    ? getPlayerChangeClassName(entry.ratingChange)
    : getRatingChangeClassName(entry.ratingChange)
  const highlightLabel = getHighlightLabel(isPlayer, isOpponent, isClubmate)

  return (
    <article className={`rounded-2xl px-4 py-4 ${rowClass}`}>
      <div className="flex items-start gap-3">
        <p className="w-10 shrink-0 text-lg font-semibold tabular-nums">
          {entry.position != null ? `${entry.position}°` : '—'}
        </p>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <p className="text-base font-semibold">{entry.name}</p>
            <p className="shrink-0 text-base font-semibold tabular-nums">
              {formatRankingPoints(entry.points)}
            </p>
          </div>
          <div className="mt-1 flex items-center justify-between gap-3">
            <p className={`min-w-0 truncate text-sm ${metaClass}`}>
              {details.join(' · ') || 'Sin club ni categoría'}
            </p>
            {ratingChange ? (
              <p className={`shrink-0 text-sm font-medium tabular-nums ${changeClass}`}>
                {ratingChange}
              </p>
            ) : null}
          </div>
          {highlightLabel ? (
            <p className={`mt-2 text-xs font-semibold uppercase tracking-wide ${metaClass}`}>
              {highlightLabel}
            </p>
          ) : null}
        </div>
      </div>
    </article>
  )
}

export default function RankingView({ tournament, playerName = '', playerClub = '' }) {
  const entries = tournament.ranking ?? []
  const resolvedName = playerName || tournament.playerName
  const [query, setQuery] = useState('')
  const [clubOnly, setClubOnly] = useState(false)
  const [category, setCategory] = useState(() =>
    getDefaultRankingCategory(entries, resolvedName, tournament.category),
  )

  const categories = getRankingCategories(entries)
  const playerEntry = findRankingEntry(entries, resolvedName)
  const resolvedClub = playerClub || playerEntry?.club || ''
  const opponentNames = (tournament.fixture ?? [])
    .map((match) => match.opponent)
    .filter(Boolean)
  const clubFilter = clubOnly ? resolvedClub : ''
  const visibleEntries = filterRanking(entries, {
    query,
    category,
    club: clubFilter,
  })
  const askForSearch = needsRankingSearch(entries, query, category, clubFilter)

  if (entries.length === 0) {
    return (
      <EmptyState
        icon={Trophy}
        title="Sin ranking"
        description="Cargá el PDF de ranking del torneo para consultar posición, club, puntos y categoría."
      />
    )
  }

  return (
    <div className="space-y-4 pb-6">
      {playerEntry ? (
        <section className="rounded-2xl bg-slate-800 px-4 py-4">
          <p className="text-sm text-slate-400">Tu posición</p>
          <p className="mt-1 text-lg font-semibold text-white">{playerEntry.name}</p>
          <p className="mt-1 text-sm text-slate-300">
            {[
              playerEntry.position != null ? `${playerEntry.position}°` : '',
              `${formatRankingPoints(playerEntry.points)} pts`,
              formatFetembaCategory(playerEntry.category),
            ]
              .filter(Boolean)
              .join(' · ')}
          </p>
        </section>
      ) : null}

      <div className="space-y-3">
        <label className="relative block">
          <Search
            className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
            aria-hidden="true"
          />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar por nombre o club"
            className="min-h-12 w-full rounded-xl border border-slate-700 bg-slate-800 py-3 pl-12 pr-4 text-base text-white outline-none placeholder:text-slate-500 focus:border-slate-500"
          />
        </label>
        {resolvedClub ? (
          <button
            type="button"
            onClick={() => setClubOnly((current) => !current)}
            className={`min-h-12 w-full rounded-xl text-sm font-semibold ${
              clubOnly ? 'bg-white text-slate-900' : 'bg-slate-800 text-white'
            }`}
          >
            {clubOnly ? `Tu club · ${resolvedClub}` : `Quiénes juegan de ${resolvedClub}`}
          </button>
        ) : null}
      </div>

      {categories.length > 1 ? (
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
          <button
            type="button"
            onClick={() => setCategory('')}
            className={`min-h-11 shrink-0 rounded-xl px-4 text-sm font-semibold ${
              category === ''
                ? 'bg-white text-slate-900'
                : 'bg-slate-800 text-slate-300'
            }`}
          >
            Todas
          </button>
          {categories.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setCategory(item.value)}
              className={`min-h-11 shrink-0 rounded-xl px-4 text-sm font-semibold ${
                category === item.value
                  ? 'bg-white text-slate-900'
                  : 'bg-slate-800 text-slate-300'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      ) : null}

      {askForSearch ? (
        <EmptyState
          icon={Search}
          title="Elegí una categoría"
          description="El ranking es largo. Filtrá por categoría o buscá un jugador."
        />
      ) : visibleEntries.length === 0 ? (
        <EmptyState
          icon={Search}
          title="Sin resultados"
          description="No hay jugadores que coincidan con esa búsqueda."
        />
      ) : (
        <>
          <p className="text-sm text-slate-400">
            {visibleEntries.length}{' '}
            {visibleEntries.length === 1 ? 'jugador' : 'jugadores'}
          </p>
          <div className="space-y-3">
            {visibleEntries.map((entry, index) => (
              <RankingRow
                key={`${entry.licenseId || entry.name}-${entry.position ?? index}`}
                entry={entry}
                isPlayer={namesMatch(entry.name, resolvedName)}
                isOpponent={isRankingOpponent(entry, opponentNames)}
                isClubmate={isRankingClubmate(entry, resolvedClub, resolvedName)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
