import { useCallback, useState } from 'react'
import { Dumbbell, Plus } from 'lucide-react'
import EmptyState from '../components/common/EmptyState'
import ScreenToolbar from '../components/common/ScreenToolbar'
import DrillAnimation from '../components/training/DrillAnimation'
import DrillSessionControls from '../components/training/DrillSessionControls'
import DrillTimer from '../components/training/DrillTimer'
import TrainingDetail from '../components/training/TrainingDetail'
import TrainingForm from '../components/training/TrainingForm'
import TrainingList from '../components/training/TrainingList'
import { useBackHandler } from '../hooks/useBackNavigation'
import { scrollScreenToTop, useScreenScroll } from '../hooks/useScreenScroll'
import { useTrainingDayProgress } from '../hooks/useTrainingDayProgress'
import { useTrainings } from '../hooks/useTrainings'
import { cloneTraining, hasDrillSteps } from '../utils/trainings'
import {
  getAdjacentDrillId,
  getNextIncompleteDrillId,
  getSessionEntries,
  getSessionEntry,
  getTurnSlot,
  groupSessionEntries,
} from '../utils/trainingSession'
import { getDefaultDrillSeconds } from '../utils/timer'

const SCREENS = {
  LIST: 'list',
  DETAIL: 'detail',
  DRILL: 'drill',
  FORM: 'form',
}

export default function TrainingsPage() {
  const {
    trainings,
    addTraining,
    saveTraining,
    removeTraining,
    getTrainingById,
    isStoredTraining,
  } = useTrainings()
  const [screen, setScreenState] = useState(SCREENS.LIST)
  const [selectedTrainingId, setSelectedTrainingId] = useState(null)
  const [selectedDrillId, setSelectedDrillId] = useState(null)

  const selectedTraining = selectedTrainingId
    ? getTrainingById(selectedTrainingId)
    : null
  const selectedDrill = selectedTraining?.drills.find(
    (drill) => drill.id === selectedDrillId,
  )
  const sessionEntries = getSessionEntries(selectedTraining?.drills ?? [])
  const sessionGroups = groupSessionEntries(sessionEntries)
  const selectedEntry = selectedDrillId
    ? getSessionEntry(sessionEntries, selectedDrillId)
    : null
  const { completedIds, isCompleted, toggleCompleted } =
    useTrainingDayProgress(selectedTrainingId)

  const scrollKey =
    screen === SCREENS.LIST
      ? 'trainings:list'
      : screen === SCREENS.DRILL
        ? `trainings:drill:${selectedDrillId ?? ''}`
        : screen === SCREENS.FORM
          ? `trainings:form:${selectedTrainingId ?? 'new'}`
          : `trainings:detail:${selectedTrainingId ?? ''}`

  const setScreen = useScreenScroll(scrollKey, setScreenState)

  const handleHardwareBack = useCallback(() => {
    if (screen === SCREENS.DRILL) {
      setScreen(SCREENS.DETAIL)
      return true
    }

    if (screen === SCREENS.FORM && selectedTrainingId) {
      setScreen(SCREENS.DETAIL)
      return true
    }

    if (screen === SCREENS.FORM || screen === SCREENS.DETAIL) {
      setScreen(SCREENS.LIST)
      setSelectedTrainingId(null)
      setSelectedDrillId(null)
      return true
    }

    return false
  }, [screen, selectedTrainingId, setScreen])

  useBackHandler(handleHardwareBack)

  function openList() {
    setScreen(SCREENS.LIST)
    setSelectedTrainingId(null)
    setSelectedDrillId(null)
  }

  function openCreate() {
    setSelectedTrainingId(null)
    setSelectedDrillId(null)
    setScreen(SCREENS.FORM)
  }

  function openDetail(trainingId) {
    setSelectedTrainingId(trainingId)
    setSelectedDrillId(null)
    setScreen(SCREENS.DETAIL)
  }

  function openDrill(drillId, options = {}) {
    if (options.scrollToTop) {
      scrollScreenToTop(`trainings:drill:${drillId}`)
    }

    setSelectedDrillId(drillId)
    setScreen(SCREENS.DRILL)
  }

  function goToAdjacentDrill(offset) {
    const nextId = getAdjacentDrillId(sessionEntries, selectedDrillId, offset)

    if (nextId) {
      openDrill(nextId, { scrollToTop: offset > 0 })
    }
  }

  function handleToggleComplete() {
    if (!selectedDrillId) {
      return
    }

    const wasCompleted = isCompleted(selectedDrillId)
    const nextIds = toggleCompleted(selectedDrillId)

    if (wasCompleted) {
      return
    }

    const nextId = getNextIncompleteDrillId(sessionEntries, nextIds, selectedDrillId)

    if (nextId && nextId !== selectedDrillId) {
      openDrill(nextId, { scrollToTop: true })
    }
  }

  function handleSave(values) {
    if (selectedTraining) {
      saveTraining(selectedTraining.id, values)
      setScreen(SCREENS.DETAIL)
      return
    }

    const created = addTraining(values)
    setSelectedTrainingId(created.id)
    setScreen(SCREENS.DETAIL)
  }

  function handleDuplicate() {
    if (!selectedTraining) {
      return
    }

    const copy = addTraining(cloneTraining(selectedTraining))
    setSelectedTrainingId(copy.id)
    setScreen(SCREENS.DETAIL)
  }

  function handleDelete() {
    if (!selectedTraining || !isStoredTraining(selectedTraining.id)) {
      return
    }

    removeTraining(selectedTraining.id)
    openList()
  }

  if (screen === SCREENS.FORM) {
    return (
      <>
        <ScreenToolbar
          title={selectedTraining ? 'Editar plan' : 'Nuevo plan'}
          onBack={selectedTraining ? () => setScreen(SCREENS.DETAIL) : openList}
        />
        <TrainingForm
          training={selectedTraining}
          onSubmit={handleSave}
          submitLabel={selectedTraining ? 'Guardar cambios' : 'Crear plan'}
        />
      </>
    )
  }

  if (screen === SCREENS.DRILL && selectedTraining && selectedDrill) {
    const drillNumber = selectedEntry?.number ?? 0
    const drillTitle = drillNumber
      ? `${drillNumber}. ${selectedDrill.title}`
      : selectedDrill.title

    return (
      <>
        <ScreenToolbar
          title={drillTitle}
          onBack={() => setScreen(SCREENS.DETAIL)}
        />
        <div className="space-y-4">
          {hasDrillSteps(selectedDrill) ? (
            <DrillAnimation key={selectedDrill.id} drill={selectedDrill} />
          ) : selectedDrill.description ? (
            <p className="text-sm leading-relaxed text-slate-300">
              {selectedDrill.description}
            </p>
          ) : null}
          <DrillTimer
            key={selectedDrill.id}
            defaultSeconds={getDefaultDrillSeconds(
              selectedDrill,
              selectedTraining,
            )}
          />
          <DrillSessionControls
            number={drillNumber}
            total={sessionEntries.length}
            slot={getTurnSlot(sessionEntries, selectedDrill.id)}
            isCompleted={isCompleted(selectedDrill.id)}
            hasPrevious={Boolean(
              getAdjacentDrillId(sessionEntries, selectedDrill.id, -1),
            )}
            hasNext={Boolean(
              getAdjacentDrillId(sessionEntries, selectedDrill.id, 1),
            )}
            onPrevious={() => goToAdjacentDrill(-1)}
            onNext={() => goToAdjacentDrill(1)}
            onToggleComplete={handleToggleComplete}
          />
        </div>
      </>
    )
  }

  if (screen === SCREENS.DETAIL && selectedTraining) {
    return (
      <>
        <ScreenToolbar title={selectedTraining.name} onBack={openList} />
        <TrainingDetail
          training={selectedTraining}
          groups={sessionGroups}
          entries={sessionEntries}
          completedIds={completedIds}
          canDelete={isStoredTraining(selectedTraining.id)}
          onOpenDrill={(drillId) => openDrill(drillId, { scrollToTop: true })}
          onToggleComplete={toggleCompleted}
          onEdit={() => setScreen(SCREENS.FORM)}
          onDuplicate={handleDuplicate}
          onDelete={handleDelete}
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
        Nuevo plan
      </button>
      {trainings.length === 0 ? (
        <EmptyState
          icon={Dumbbell}
          title="Todavía no hay entrenamientos"
          description="Creá un plan con calentamiento, continuos y saque. Después lo ves en la mesa con A y B."
        />
      ) : (
        <TrainingList trainings={trainings} onSelect={openDetail} />
      )}
    </div>
  )
}
