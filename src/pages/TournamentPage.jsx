import { CalendarDays, Plus } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import EmptyState from '../components/common/EmptyState'
import ScreenToolbar from '../components/common/ScreenToolbar'
import RankingView from '../components/ranking/RankingView'
import FixtureMatchAnalysis from '../components/tournament/FixtureMatchAnalysis'
import FixtureValidation from '../components/tournament/FixtureValidation'
import FixtureView from '../components/tournament/FixtureView'
import TournamentForm from '../components/tournament/TournamentForm'
import TournamentList from '../components/tournament/TournamentList'
import TournamentPdfUpload from '../components/tournament/TournamentPdfUpload'
import { useBackHandler } from '../hooks/useBackNavigation'
import { useMatches } from '../hooks/useMatches'
import { usePlayerProfile } from '../hooks/usePlayerProfile'
import { useRivals } from '../hooks/useRivals'
import { useTournament } from '../hooks/useTournament'
import {
  createPdfMetaFromFile,
  processTournamentSources,
} from '../services/pdf/processTournament'
import {
  SAMPLE_GROUPS_TEXT,
  SAMPLE_RANKING_TEXT,
  SAMPLE_TABLES_TEXT,
} from '../services/pdf/sampleTexts'
import { ANALYSIS_SECTION, TOURNAMENT_STATUS } from '../utils/constants'
import { createFixtureMatch } from '../utils/dataModels'
import { findOwnMatchForRival } from '../utils/matches'
import { findRivalByName } from '../utils/rivals'
import {
  findOpponentClub,
  formatTournamentDate,
  getTournamentScreen,
  sortTournaments,
} from '../utils/tournaments'

const SCREENS = {
  LIST: 'list',
  FORM: 'form',
  DETAIL: 'detail',
  REVIEW: 'review',
  FIXTURE: 'fixture',
  ANALYSIS: 'analysis',
  RANKING: 'ranking',
}

export default function TournamentPage() {
  const {
    tournaments,
    addTournament,
    updateTournament,
    removeTournament,
    getTournamentById,
  } = useTournament()
  const { rivals, addRival } = useRivals()
  const { matches, addMatch, updateMatch, getMatchById } = useMatches()
  const { profile } = usePlayerProfile()
  const [screen, setScreen] = useState(SCREENS.LIST)
  const [selectedTournamentId, setSelectedTournamentId] = useState(null)
  const [selectedFixtureMatchId, setSelectedFixtureMatchId] = useState(null)
  const [analysisSection, setAnalysisSection] = useState(ANALYSIS_SECTION.PRE)
  const [rankingBackScreen, setRankingBackScreen] = useState(SCREENS.FIXTURE)
  const [isProcessing, setIsProcessing] = useState(false)
  const [processError, setProcessError] = useState('')

  const selectedTournament = selectedTournamentId
    ? getTournamentById(selectedTournamentId)
    : null
  const selectedFixtureMatch = selectedTournament?.fixture.find(
    (item) => item.id === selectedFixtureMatchId,
  )
  const selectedAnalysisRival = selectedFixtureMatch
    ? findRivalByName(rivals, selectedFixtureMatch.opponent)
    : null
  const visibleTournaments = sortTournaments(tournaments)

  useEffect(() => {
    document.getElementById('app-content')?.scrollTo({ top: 0 })
  }, [screen])

  const handleHardwareBack = useCallback(() => {
    if (screen === SCREENS.ANALYSIS) {
      setSelectedFixtureMatchId(null)
      setScreen(SCREENS.FIXTURE)
      return true
    }

    if (screen === SCREENS.RANKING) {
      setScreen(rankingBackScreen)
      return true
    }

    if (screen === SCREENS.REVIEW) {
      setScreen(SCREENS.DETAIL)
      return true
    }

    if (screen === SCREENS.FORM && selectedTournamentId) {
      setScreen(SCREENS.DETAIL)
      return true
    }

    if (
      screen === SCREENS.FORM ||
      screen === SCREENS.DETAIL ||
      screen === SCREENS.FIXTURE
    ) {
      setScreen(SCREENS.LIST)
      setSelectedTournamentId(null)
      setSelectedFixtureMatchId(null)
      setRankingBackScreen(SCREENS.FIXTURE)
      setProcessError('')
      return true
    }

    return false
  }, [rankingBackScreen, screen, selectedTournamentId])

  useBackHandler(handleHardwareBack)

  function openList() {
    setScreen(SCREENS.LIST)
    setSelectedTournamentId(null)
    setSelectedFixtureMatchId(null)
    setRankingBackScreen(SCREENS.FIXTURE)
    setProcessError('')
  }

  function openCreate() {
    setSelectedTournamentId(null)
    setProcessError('')
    setScreen(SCREENS.FORM)
  }

  function openTournament(tournamentId) {
    const tournament = getTournamentById(tournamentId)

    if (!tournament) {
      return
    }

    setSelectedTournamentId(tournamentId)
    setProcessError('')
    setScreen(getTournamentScreen(tournament.status))
  }

  function handleSave(values) {
    if (selectedTournament) {
      updateTournament(selectedTournament.id, values)
      setScreen(SCREENS.DETAIL)
      return
    }

    const createdTournament = addTournament(values)
    setSelectedTournamentId(createdTournament.id)
    setScreen(SCREENS.DETAIL)
  }

  function handleDelete() {
    if (!selectedTournament) {
      return
    }

    removeTournament(selectedTournament.id)
    openList()
  }

  async function handleProcess(sources) {
    if (!selectedTournament) {
      return
    }

    const hasFile = sources.rankingFile || sources.groupsFile || sources.tablesFile
    const hasText =
      sources.rankingText.trim() ||
      sources.groupsText.trim() ||
      sources.tablesText.trim()

    if (!hasFile && !hasText) {
      setProcessError('Cargá al menos un PDF o pegá el texto.')
      return
    }

    setIsProcessing(true)
    setProcessError('')

    try {
      const result = await processTournamentSources({
        ...sources,
        playerName: selectedTournament.playerName,
      })

      updateTournament(selectedTournament.id, {
        status: TOURNAMENT_STATUS.REVIEW,
        rankingPdf:
          createPdfMetaFromFile(sources.rankingFile) ?? selectedTournament.rankingPdf,
        groupsPdf:
          createPdfMetaFromFile(sources.groupsFile) ?? selectedTournament.groupsPdf,
        tablesPdf:
          createPdfMetaFromFile(sources.tablesFile) ?? selectedTournament.tablesPdf,
        extractedTexts: result.extracted,
        parseWarnings: result.warnings,
        players: result.players,
        ranking: result.ranking,
        groups: result.groups,
        matches: result.matches,
        tables: result.tables,
        schedule: result.schedule,
        fixture: result.fixture,
      })
      setScreen(SCREENS.REVIEW)
    } catch {
      setProcessError(
        'No se pudo leer el PDF. Probá pegar el texto o armar el fixture a mano.',
      )
    } finally {
      setIsProcessing(false)
    }
  }

  function handleManual() {
    if (!selectedTournament) {
      return
    }

    const fixture =
      selectedTournament.fixture.length > 0
        ? selectedTournament.fixture
        : [createFixtureMatch({ group: '' })]

    updateTournament(selectedTournament.id, {
      status: TOURNAMENT_STATUS.REVIEW,
      fixture,
    })
    setProcessError('')
    setScreen(SCREENS.REVIEW)
  }

  function handleUseSample() {
    handleProcess({
      rankingFile: null,
      groupsFile: null,
      tablesFile: null,
      rankingText: SAMPLE_RANKING_TEXT,
      groupsText: SAMPLE_GROUPS_TEXT,
      tablesText: SAMPLE_TABLES_TEXT,
    })
  }

  function getMatchForFixture(fixtureMatch) {
    if (!selectedTournament || !fixtureMatch) {
      return null
    }

    const linkedMatch = fixtureMatch.matchId
      ? getMatchById(fixtureMatch.matchId)
      : null

    if (linkedMatch) {
      return linkedMatch
    }

    const rival = findRivalByName(rivals, fixtureMatch.opponent)
    return findOwnMatchForRival(matches, selectedTournament.id, rival?.id)
  }

  function openRanking(fromScreen) {
    setRankingBackScreen(fromScreen)
    setScreen(SCREENS.RANKING)
  }

  function openAnalysis(fixtureMatchId, section) {
    setSelectedFixtureMatchId(fixtureMatchId)
    setAnalysisSection(section)
    setScreen(SCREENS.ANALYSIS)
  }

  function handleSaveAnalysis(values) {
    if (!selectedTournament || !selectedFixtureMatch) {
      return
    }

    const opponentName = selectedFixtureMatch.opponent
    const existingRival = findRivalByName(rivals, opponentName)
    const rival =
      existingRival ??
      addRival({
        name: opponentName,
        club: findOpponentClub(selectedTournament, opponentName),
      })
    const existingMatch =
      (selectedFixtureMatch.matchId
        ? getMatchById(selectedFixtureMatch.matchId)
        : null) ??
      findOwnMatchForRival(matches, selectedTournament.id, rival.id)

    if (existingMatch) {
      updateMatch(existingMatch.id, {
        ...values,
        rivalId: rival.id,
        tournamentId: selectedTournament.id,
      })
      return
    }

    const createdMatch = addMatch({
      ...values,
      rivalId: rival.id,
      tournamentId: selectedTournament.id,
      date: selectedTournament.date || new Date().toISOString(),
    })

    updateTournament(selectedTournament.id, {
      fixture: selectedTournament.fixture.map((item) =>
        item.id === selectedFixtureMatch.id
          ? { ...item, matchId: createdMatch.id }
          : item,
      ),
    })
  }

  function handleConfirm(fixture) {
    if (!selectedTournament) {
      return
    }

    updateTournament(selectedTournament.id, {
      status: TOURNAMENT_STATUS.CONFIRMED,
      fixture,
      parseWarnings: [],
    })
    setScreen(SCREENS.FIXTURE)
  }

  if (screen === SCREENS.FORM) {
    return (
      <>
        <ScreenToolbar
          title={selectedTournament ? 'Editar torneo' : 'Nuevo torneo'}
          onBack={selectedTournament ? () => setScreen(SCREENS.DETAIL) : openList}
        />
        <TournamentForm
          tournament={selectedTournament}
          defaultPlayerName={profile.name}
          onSubmit={handleSave}
          submitLabel={selectedTournament ? 'Guardar cambios' : 'Crear torneo'}
        />
      </>
    )
  }

  if (screen === SCREENS.DETAIL && selectedTournament) {
    return (
      <>
        <ScreenToolbar title={selectedTournament.name} onBack={openList} />
        <section className="mb-4 rounded-2xl bg-slate-800 px-4 py-4">
          <p className="text-sm text-slate-300">
            {[formatTournamentDate(selectedTournament.date), selectedTournament.category]
              .filter(Boolean)
              .join(' · ') || 'Sin fecha ni categoría'}
          </p>
          <p className="mt-2 text-sm text-slate-400">Jugador</p>
          <p className="mt-1 text-base font-semibold text-white">
            {selectedTournament.playerName}
          </p>
          <button
            type="button"
            onClick={() => setScreen(SCREENS.FORM)}
            className="mt-4 min-h-12 w-full rounded-xl bg-slate-700 text-sm font-medium text-white"
          >
            Editar datos
          </button>
        </section>
        <TournamentPdfUpload
          tournament={selectedTournament}
          onProcess={handleProcess}
          onManual={handleManual}
          onUseSample={handleUseSample}
          isProcessing={isProcessing}
          error={processError}
        />
        {selectedTournament.ranking?.length > 0 ? (
          <button
            type="button"
            onClick={() => openRanking(SCREENS.DETAIL)}
            className="mt-4 min-h-14 w-full rounded-2xl bg-slate-800 text-base font-semibold text-white"
          >
            Ver ranking
          </button>
        ) : null}
        <button
          type="button"
          onClick={handleDelete}
          className="mt-6 min-h-12 w-full text-sm font-medium text-red-400"
        >
          Eliminar torneo
        </button>
      </>
    )
  }

  if (screen === SCREENS.REVIEW && selectedTournament) {
    return (
      <>
        <ScreenToolbar title="Revisar fixture" onBack={() => setScreen(SCREENS.DETAIL)} />
        <FixtureValidation
          tournament={selectedTournament}
          onConfirm={handleConfirm}
          onOpenRanking={() => openRanking(SCREENS.REVIEW)}
          onBackToPdfs={() => setScreen(SCREENS.DETAIL)}
        />
      </>
    )
  }

  if (screen === SCREENS.FIXTURE && selectedTournament) {
    return (
      <>
        <ScreenToolbar title="Fixture" onBack={openList} />
        <FixtureView
          tournament={selectedTournament}
          getMatchForFixture={getMatchForFixture}
          onOpenAnalysis={openAnalysis}
          onOpenRanking={() => openRanking(SCREENS.FIXTURE)}
          onEditFixture={() => setScreen(SCREENS.REVIEW)}
          onEditTournament={() => setScreen(SCREENS.FORM)}
          onDelete={handleDelete}
        />
      </>
    )
  }

  if (screen === SCREENS.RANKING && selectedTournament) {
    return (
      <>
        <ScreenToolbar
          title="Ranking"
          onBack={() => setScreen(rankingBackScreen)}
        />
        <RankingView
          tournament={selectedTournament}
          playerName={selectedTournament.playerName || profile.name}
          playerClub={profile.club}
        />
      </>
    )
  }

  if (screen === SCREENS.ANALYSIS && selectedTournament && selectedFixtureMatch) {
    return (
      <>
        <ScreenToolbar
          title="Análisis"
          onBack={() => {
            setSelectedFixtureMatchId(null)
            setScreen(SCREENS.FIXTURE)
          }}
        />
        <FixtureMatchAnalysis
          fixtureMatch={selectedFixtureMatch}
          match={getMatchForFixture(selectedFixtureMatch)}
          rival={selectedAnalysisRival}
          section={analysisSection}
          onSectionChange={setAnalysisSection}
          onSubmit={handleSaveAnalysis}
        />
      </>
    )
  }

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={openCreate}
        className="flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-white text-base font-semibold text-slate-900"
      >
        <Plus className="h-5 w-5" aria-hidden="true" />
        Nuevo torneo
      </button>

      {visibleTournaments.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title="Sin torneo activo"
          description="Cargá el torneo, subí los PDFs de ranking, grupos y mesas, y revisá el fixture antes de confirmarlo."
        />
      ) : (
        <TournamentList tournaments={visibleTournaments} onSelect={openTournament} />
      )}
    </div>
  )
}
