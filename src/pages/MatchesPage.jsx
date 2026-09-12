import { Plus, Search, Swords, Users } from 'lucide-react'
import { useEffect, useState } from 'react'
import EmptyState from '../components/common/EmptyState'
import ScreenToolbar from '../components/common/ScreenToolbar'
import MatchForm from '../components/matches/MatchForm'
import MatchList from '../components/matches/MatchList'
import { VIEWS } from '../components/common/navigation'
import { useMatches } from '../hooks/useMatches'
import { useRivals } from '../hooks/useRivals'
import { useTeammates } from '../hooks/useTeammates'
import { useTournament } from '../hooks/useTournament'
import { MATCH_KIND } from '../utils/constants'
import {
  filterMatches,
  getMatchKind,
  isCoachedMatch,
  sortMatchesByDate,
} from '../utils/matches'
import MatchPage from './MatchPage'

const SCREENS = {
  LIST: 'list',
  FORM: 'form',
  DETAIL: 'detail',
}

const LIST_FILTERS = {
  ALL: 'all',
  OWN: 'own',
  COACHED: 'coached',
}

export default function MatchesPage({ onNavigate }) {
  const { matches, addMatch, updateMatch, removeMatch, getMatchById } =
    useMatches()
  const { rivals, getRivalById } = useRivals()
  const { teammates, addTeammate, getTeammateById } = useTeammates()
  const { tournaments, getTournamentById } = useTournament()
  const [screen, setScreen] = useState(SCREENS.LIST)
  const [formKind, setFormKind] = useState(MATCH_KIND.OWN)
  const [listFilter, setListFilter] = useState(LIST_FILTERS.ALL)
  const [selectedMatchId, setSelectedMatchId] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')

  const selectedMatch = selectedMatchId ? getMatchById(selectedMatchId) : null
  const selectedRival = selectedMatch?.rivalId
    ? getRivalById(selectedMatch.rivalId)
    : null
  const selectedTeammate = selectedMatch?.teammateId
    ? getTeammateById(selectedMatch.teammateId)
    : null
  const selectedTournament = selectedMatch?.tournamentId
    ? getTournamentById(selectedMatch.tournamentId)
    : null

  const filteredByKind = matches.filter((match) => {
    if (listFilter === LIST_FILTERS.OWN) {
      return !isCoachedMatch(match)
    }

    if (listFilter === LIST_FILTERS.COACHED) {
      return isCoachedMatch(match)
    }

    return true
  })

  const visibleMatches = sortMatchesByDate(
    filterMatches(filteredByKind, getRivalById, getTeammateById, searchQuery),
  )

  useEffect(() => {
    document.getElementById('app-content')?.scrollTo({ top: 0 })
  }, [screen])

  function openList() {
    setScreen(SCREENS.LIST)
    setSelectedMatchId(null)
  }

  function openCreate(kind) {
    if (kind === MATCH_KIND.OWN && rivals.length === 0) {
      onNavigate?.(VIEWS.RIVALS)
      return
    }

    setFormKind(kind)
    setSelectedMatchId(null)
    setScreen(SCREENS.FORM)
  }

  function openDetail(matchId) {
    setSelectedMatchId(matchId)
    setScreen(SCREENS.DETAIL)
  }

  function handleSave(values) {
    const { newTeammate, ...matchValues } = values
    let teammateId = matchValues.teammateId

    if (newTeammate?.name) {
      const createdTeammate = addTeammate(newTeammate)
      teammateId = createdTeammate.id
    }

    const payload = {
      ...matchValues,
      teammateId: teammateId || null,
    }

    if (selectedMatch) {
      updateMatch(selectedMatch.id, payload)
      setScreen(SCREENS.DETAIL)
      return
    }

    const createdMatch = addMatch(payload)
    setSelectedMatchId(createdMatch.id)
    setScreen(SCREENS.DETAIL)
  }

  function handleDelete() {
    if (!selectedMatch) {
      return
    }

    removeMatch(selectedMatch.id)
    openList()
  }

  if (screen === SCREENS.FORM) {
    const editingKind = selectedMatch ? getMatchKind(selectedMatch) : formKind
    const isCoaching = editingKind === MATCH_KIND.COACHED

    return (
      <>
        <ScreenToolbar
          title={
            selectedMatch
              ? isCoaching
                ? 'Editar cocheo'
                : 'Editar partido'
              : isCoaching
                ? 'Cochear compañero'
                : 'Nuevo partido'
          }
          onBack={selectedMatch ? () => setScreen(SCREENS.DETAIL) : openList}
        />
        <MatchForm
          match={selectedMatch}
          kind={editingKind}
          rivals={rivals}
          teammates={teammates}
          tournaments={tournaments}
          onSubmit={handleSave}
          submitLabel={selectedMatch ? 'Guardar cambios' : isCoaching ? 'Guardar cocheo' : 'Registrar partido'}
        />
      </>
    )
  }

  if (screen === SCREENS.DETAIL && selectedMatch) {
    return (
      <MatchPage
        match={selectedMatch}
        rival={selectedRival}
        teammate={selectedTeammate}
        tournament={selectedTournament}
        onBack={openList}
        onEdit={() => setScreen(SCREENS.FORM)}
        onDelete={handleDelete}
      />
    )
  }

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={() => openCreate(MATCH_KIND.OWN)}
        className="flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-white text-base font-semibold text-slate-900"
      >
        <Plus className="h-5 w-5" aria-hidden="true" />
        Registrar partido
      </button>
      <button
        type="button"
        onClick={() => openCreate(MATCH_KIND.COACHED)}
        className="flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-slate-800 text-base font-semibold text-white"
      >
        Cochear compañero
      </button>

      {matches.length === 0 ? (
        <EmptyState
          icon={rivals.length === 0 ? Users : Swords}
          title="Sin registros todavía"
          description="Cargá un partido tuyo o el cocheo de un compañero del club."
        />
      ) : (
        <>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: LIST_FILTERS.ALL, label: 'Todos' },
              { id: LIST_FILTERS.OWN, label: 'Míos' },
              { id: LIST_FILTERS.COACHED, label: 'Cocheo' },
            ].map((filter) => (
              <button
                key={filter.id}
                type="button"
                onClick={() => setListFilter(filter.id)}
                className={`min-h-11 rounded-xl text-sm font-medium ${
                  listFilter === filter.id
                    ? 'bg-white text-slate-900'
                    : 'bg-slate-800 text-slate-300'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>

          <label className="relative block">
            <Search
              className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Buscar por rival o compañero"
              className="min-h-12 w-full rounded-xl border border-slate-700 bg-slate-800 py-3 pl-12 pr-4 text-base text-white outline-none placeholder:text-slate-500 focus:border-slate-500"
            />
          </label>

          {visibleMatches.length === 0 ? (
            <EmptyState
              icon={Search}
              title="Sin resultados"
              description="No hay registros que coincidan con ese filtro."
            />
          ) : (
            <MatchList
              matches={visibleMatches}
              getRivalById={getRivalById}
              getTeammateById={getTeammateById}
              onSelect={openDetail}
            />
          )}
        </>
      )}
    </div>
  )
}
