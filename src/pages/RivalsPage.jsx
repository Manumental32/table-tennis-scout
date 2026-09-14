import { Plus, Search, Users } from 'lucide-react'
import { useCallback, useState } from 'react'
import EmptyState from '../components/common/EmptyState'
import ScreenToolbar from '../components/common/ScreenToolbar'
import QuickScoutingCard from '../components/rivals/QuickScoutingCard'
import RivalForm from '../components/rivals/RivalForm'
import RivalList from '../components/rivals/RivalList'
import { useBackHandler } from '../hooks/useBackNavigation'
import { useScreenScroll } from '../hooks/useScreenScroll'
import { useMatches } from '../hooks/useMatches'
import { useRivals } from '../hooks/useRivals'
import { filterRivals } from '../utils/rivals'
import { getRivalRecord } from '../utils/stats'
import RivalPage from './RivalPage'

const SCREENS = {
  LIST: 'list',
  FORM: 'form',
  PROFILE: 'profile',
  SCOUTING: 'scouting',
}

export default function RivalsPage() {
  const { rivals, addRival, updateRival, removeRival, getRivalById } = useRivals()
  const { matches } = useMatches()
  const [screen, setScreenState] = useState(SCREENS.LIST)
  const [selectedRivalId, setSelectedRivalId] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')

  const selectedRival = selectedRivalId ? getRivalById(selectedRivalId) : null
  const visibleRivals = filterRivals(rivals, searchQuery)

  const scrollKey =
    screen === SCREENS.LIST
      ? 'rivals:list'
      : screen === SCREENS.FORM
        ? `rivals:form:${selectedRivalId ?? 'new'}`
        : `rivals:${screen}:${selectedRivalId ?? ''}`

  const setScreen = useScreenScroll(scrollKey, setScreenState)

  const handleHardwareBack = useCallback(() => {
    if (screen === SCREENS.SCOUTING) {
      setScreen(SCREENS.PROFILE)
      return true
    }

    if (screen === SCREENS.FORM && selectedRivalId) {
      setScreen(SCREENS.PROFILE)
      return true
    }

    if (screen === SCREENS.FORM || screen === SCREENS.PROFILE) {
      setScreen(SCREENS.LIST)
      setSelectedRivalId(null)
      return true
    }

    return false
  }, [screen, selectedRivalId, setScreen])

  useBackHandler(handleHardwareBack)

  function openList() {
    setScreen(SCREENS.LIST)
    setSelectedRivalId(null)
  }

  function openCreate() {
    setSelectedRivalId(null)
    setScreen(SCREENS.FORM)
  }

  function openProfile(rivalId) {
    setSelectedRivalId(rivalId)
    setScreen(SCREENS.PROFILE)
  }

  function handleSave(values) {
    if (selectedRival) {
      updateRival(selectedRival.id, values)
      setScreen(SCREENS.PROFILE)
      return
    }

    const createdRival = addRival(values)
    setSelectedRivalId(createdRival.id)
    setScreen(SCREENS.PROFILE)
  }

  function handleDelete() {
    if (!selectedRival) {
      return
    }

    removeRival(selectedRival.id)
    openList()
  }

  if (screen === SCREENS.FORM) {
    return (
      <>
        <ScreenToolbar
          title={selectedRival ? 'Editar rival' : 'Nuevo rival'}
          onBack={selectedRival ? () => setScreen(SCREENS.PROFILE) : openList}
        />
        <RivalForm
          rival={selectedRival}
          onSubmit={handleSave}
          submitLabel={selectedRival ? 'Guardar cambios' : 'Crear rival'}
        />
      </>
    )
  }

  if (screen === SCREENS.PROFILE && selectedRival) {
    return (
      <RivalPage
        rival={selectedRival}
        record={getRivalRecord(matches, selectedRival.id)}
        onBack={openList}
        onEdit={() => setScreen(SCREENS.FORM)}
        onDelete={handleDelete}
        onOpenScouting={() => setScreen(SCREENS.SCOUTING)}
      />
    )
  }

  if (screen === SCREENS.SCOUTING && selectedRival) {
    return (
      <>
        <ScreenToolbar
          title="Plan rápido"
          onBack={() => setScreen(SCREENS.PROFILE)}
        />
        <QuickScoutingCard rival={selectedRival} />
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
        Agregar rival
      </button>

      {rivals.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Sin rivales todavía"
          description="Cuando agregues rivales, vas a poder consultar su perfil técnico y la tarjeta de scouting."
        />
      ) : (
        <>
          <label className="relative block">
            <Search
              className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Buscar por nombre o club"
              className="min-h-12 w-full rounded-xl border border-slate-700 bg-slate-800 py-3 pl-12 pr-4 text-base text-white outline-none placeholder:text-slate-500 focus:border-slate-500"
            />
          </label>

          {visibleRivals.length === 0 ? (
            <EmptyState
              icon={Search}
              title="Sin resultados"
              description="No hay rivales que coincidan con esa búsqueda."
            />
          ) : (
            <RivalList rivals={visibleRivals} onSelect={openProfile} />
          )}
        </>
      )}
    </div>
  )
}
