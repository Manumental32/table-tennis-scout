import { Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { MATCH_KIND, MATCH_RESULT } from '../../utils/constants'
import {
  createDuringMatchNotes,
  createMatch,
  createMatchSet,
  createPostMatchAnalysis,
  createPreMatchStrategy,
} from '../../utils/dataModels'
import { useStrategySuggestions } from '../../hooks/useStrategySuggestions'
import {
  fromDateInputValue,
  getMatchKind,
  getResultFromSets,
  getSetScoreHint,
  hasFilledFields,
  isClosedSet,
  isCoachedMatch,
  parseSetScore,
  toDateInputValue,
} from '../../utils/matches'
import {
  collectRankingCandidates,
  collectRankingClubs,
  toRankingClubSuggestions,
  toRankingNameSuggestions,
} from '../../utils/rivals'
import { normalizeName } from '../../utils/tournaments'
import { hasSelectedZones } from '../../utils/tableZones'
import TableZoneMap from '../common/TableZoneMap'
import {
  CONTROL_CLASS,
  FormSection,
  OptionalSection,
  SelectField,
  TextAreaField,
  TextField,
} from '../common/FormField'
import SetScoreField from './SetScoreField'

const EMPTY_SET = { playerScore: '', opponentScore: '', notes: '' }

function getKnownPersonSuggestions(people, query) {
  const normalizedQuery = query.trim().toLowerCase()

  if (!normalizedQuery) {
    return []
  }

  return people
    .filter((person) => {
      const name = person.name.toLowerCase()
      const club = (person.club ?? '').toLowerCase()
      return name.includes(normalizedQuery) || club.includes(normalizedQuery)
    })
    .filter((person) => normalizeName(person.name) !== normalizeName(query))
    .slice(0, 8)
    .map((person) => ({
      id: person.id,
      label: person.name,
      subtitle: person.club,
      value: {
        id: person.id,
        name: person.name,
        club: person.club ?? '',
      },
    }))
}

function getFormValues(match, kind, teammates = [], rivals = []) {
  const values = createMatch({
    ...(match ?? {}),
    kind: match ? getMatchKind(match) : kind,
  })
  const teammate =
    teammates.find((item) => item.id === values.teammateId) ?? null
  const rival = rivals.find((item) => item.id === values.rivalId) ?? null

  return {
    ...values,
    rivalId: values.rivalId ?? '',
    teammateId: values.teammateId ?? '',
    tournamentId: values.tournamentId ?? '',
    newTeammateName: teammate?.name ?? '',
    newTeammateClub: teammate?.club ?? '',
    newRivalName: rival?.name ?? '',
    newRivalClub: rival?.club ?? '',
    date: toDateInputValue(values.date),
    sets:
      values.sets.length > 0
        ? values.sets.map((set) => ({
            playerScore: String(set.playerScore),
            opponentScore: String(set.opponentScore),
            notes: set.notes ?? '',
          }))
        : [{ ...EMPTY_SET }],
  }
}

export default function MatchForm({
  match,
  kind = MATCH_KIND.OWN,
  rivals,
  teammates,
  tournaments,
  playerName = '',
  onSubmit,
  submitLabel,
}) {
  const [values, setValues] = useState(() =>
    getFormValues(match, kind, teammates, rivals),
  )
  const [formError, setFormError] = useState('')
  const phrases = useStrategySuggestions()
  const isCoaching = isCoachedMatch(values)
  const inferredResult = getResultFromSets(values.sets)
  const result =
    inferredResult === MATCH_RESULT.UNKNOWN ? values.result : inferredResult
  const playerLabel = isCoaching
    ? values.newTeammateName.trim() || 'Compañero'
    : playerName.trim() || 'Vos'
  const rivalLabel = values.newRivalName.trim() || 'Rival'
  const rankingCandidates = collectRankingCandidates(
    tournaments,
    rivals,
    playerName,
  )
  const teammateRankingCandidates = collectRankingCandidates(
    tournaments,
    teammates,
    playerName,
  )
  const rankingClubs = collectRankingClubs(tournaments)
  const teammateNameSuggestions = [
    ...getKnownPersonSuggestions(teammates, values.newTeammateName),
    ...toRankingNameSuggestions(
      teammateRankingCandidates,
      values.newTeammateName,
      values.tournamentId,
    ),
  ].slice(0, 8)
  const teammateClubSuggestions = toRankingClubSuggestions(
    rankingClubs,
    values.newTeammateClub,
  )
  const rivalNameSuggestions = [
    ...getKnownPersonSuggestions(rivals, values.newRivalName),
    ...toRankingNameSuggestions(
      rankingCandidates,
      values.newRivalName,
      values.tournamentId,
    ),
  ].slice(0, 8)
  const rivalClubSuggestions = toRankingClubSuggestions(
    rankingClubs,
    values.newRivalClub,
  )

  const tournamentOptions = [
    { value: '', label: 'Sin torneo' },
    ...tournaments.map((tournament) => ({
      value: tournament.id,
      label: tournament.name || 'Torneo sin nombre',
    })),
  ]

  function handleChange(event) {
    const { name, value } = event.target
    setValues((currentValues) => ({
      ...currentValues,
      [name]: value,
    }))

    if (formError) {
      setFormError('')
    }
  }

  function handlePickTeammateName(item) {
    const candidate = item.value
    setValues((currentValues) => ({
      ...currentValues,
      newTeammateName: candidate.name,
      newTeammateClub: candidate.club || currentValues.newTeammateClub,
    }))

    if (formError) {
      setFormError('')
    }
  }

  function handlePickTeammateClub(item) {
    setValues((currentValues) => ({
      ...currentValues,
      newTeammateClub: item.value,
    }))
  }

  function applyRivalSelection(rival) {
    setValues((currentValues) => ({
      ...currentValues,
      rivalId: rival.id,
      newRivalName: rival.name,
      newRivalClub: rival.club ?? '',
      preMatchStrategy: createPreMatchStrategy({
        ...currentValues.preMatchStrategy,
        thingsToDo:
          currentValues.preMatchStrategy.thingsToDo || rival.thingsToDo || '',
        thingsToAvoid:
          currentValues.preMatchStrategy.thingsToAvoid ||
          rival.thingsToAvoid ||
          '',
        mainObjective:
          currentValues.preMatchStrategy.mainObjective ||
          rival.mainObjective ||
          '',
        targetZones: hasSelectedZones(currentValues.preMatchStrategy.targetZones)
          ? currentValues.preMatchStrategy.targetZones
          : rival.targetZones,
      }),
    }))

    if (formError) {
      setFormError('')
    }
  }

  function handlePickRivalName(item) {
    const candidate = item.value
    const existingRival = candidate.id
      ? rivals.find((rival) => rival.id === candidate.id)
      : null

    if (existingRival) {
      applyRivalSelection(existingRival)
      return
    }

    setValues((currentValues) => ({
      ...currentValues,
      rivalId: '',
      newRivalName: candidate.name,
      newRivalClub: candidate.club || currentValues.newRivalClub,
    }))

    if (formError) {
      setFormError('')
    }
  }

  function handlePickRivalClub(item) {
    setValues((currentValues) => ({
      ...currentValues,
      newRivalClub: item.value,
    }))
  }

  function handleStrategyChange(section, event) {
    const { name, value } = event.target
    setValues((currentValues) => ({
      ...currentValues,
      [section]: {
        ...currentValues[section],
        [name]: value,
      },
    }))
  }

  function handleZonesChange(targetZones) {
    setValues((currentValues) => ({
      ...currentValues,
      preMatchStrategy: {
        ...currentValues.preMatchStrategy,
        targetZones,
      },
    }))
  }

  function handleSetChange(index, field, value) {
    setValues((currentValues) => ({
      ...currentValues,
      sets: currentValues.sets.map((set, setIndex) =>
        setIndex === index ? { ...set, [field]: value } : set,
      ),
    }))
  }

  function addSet() {
    setValues((currentValues) => ({
      ...currentValues,
      sets: [...currentValues.sets, { ...EMPTY_SET }],
    }))
  }

  function removeSet(index) {
    setValues((currentValues) => {
      if (currentValues.sets.length === 1) {
        return {
          ...currentValues,
          sets: [{ ...EMPTY_SET }],
        }
      }

      return {
        ...currentValues,
        sets: currentValues.sets.filter((_, setIndex) => setIndex !== index),
      }
    })
  }

  function handleResultChange(result) {
    setValues((currentValues) => ({
      ...currentValues,
      result,
    }))
  }

  function handleSubmit(event) {
    event.preventDefault()

    if (isCoaching) {
      if (!values.newTeammateName.trim()) {
        setFormError('Elegí o cargá un compañero')
        return
      }
    } else if (!values.newRivalName.trim()) {
      setFormError('Elegí un rival o cargalo a mano')
      return
    }

    const sets = values.sets
      .map((set) =>
        createMatchSet({
          playerScore: parseSetScore(set.playerScore),
          opponentScore: parseSetScore(set.opponentScore),
          notes: set.notes.trim(),
        }),
      )
      .filter((set) => set.playerScore > 0 || set.opponentScore > 0 || set.notes)

    const submittedResult = getResultFromSets(sets)
    const {
      newTeammateName,
      newTeammateClub,
      newRivalName,
      newRivalClub,
      ...matchValues
    } = values

    onSubmit({
      ...matchValues,
      kind: getMatchKind(values),
      tournamentId: values.tournamentId || null,
      rivalId: null,
      teammateId: null,
      newRival: newRivalName.trim()
        ? {
            name: newRivalName.trim(),
            club: newRivalClub.trim(),
          }
        : null,
      newTeammate: isCoaching
        ? {
            name: newTeammateName.trim(),
            club: newTeammateClub.trim(),
          }
        : null,
      date: fromDateInputValue(values.date),
      result:
        submittedResult === MATCH_RESULT.UNKNOWN
          ? values.result
          : submittedResult,
      sets,
      score: sets
        .map((set) => `${set.playerScore}-${set.opponentScore}`)
        .join('  '),
      notes: values.notes.trim(),
      preMatchStrategy: createPreMatchStrategy(values.preMatchStrategy),
      duringMatchNotes: createDuringMatchNotes(values.duringMatchNotes),
      postMatchAnalysis: createPostMatchAnalysis(values.postMatchAnalysis),
    })
  }

  return (
    <form className="space-y-8 pb-6" onSubmit={handleSubmit}>
      <FormSection title={isCoaching ? 'Coucheo' : 'Partido'}>
        {isCoaching ? (
          <>
            <TextField
              label="Compañero"
              name="newTeammateName"
              value={values.newTeammateName}
              onChange={handleChange}
              placeholder="Nombre"
              autoComplete="off"
              suggestionItems={teammateNameSuggestions}
              onPickSuggestion={handlePickTeammateName}
            />
            <TextField
              label="Club"
              name="newTeammateClub"
              value={values.newTeammateClub}
              onChange={handleChange}
              placeholder="Opcional"
              autoComplete="off"
              suggestionItems={teammateClubSuggestions}
              onPickSuggestion={handlePickTeammateClub}
            />
          </>
        ) : null}

        {tournaments.length > 0 ? (
          <SelectField
            label="Torneo"
            name="tournamentId"
            value={values.tournamentId}
            onChange={handleChange}
            options={tournamentOptions}
          />
        ) : null}

        <TextField
          label={isCoaching ? 'Rival al que se enfrentó' : 'Rival'}
          name="newRivalName"
          value={values.newRivalName}
          onChange={handleChange}
          placeholder="Nombre"
          autoComplete="off"
          suggestionItems={rivalNameSuggestions}
          onPickSuggestion={handlePickRivalName}
        />
        <TextField
          label="Club del rival"
          name="newRivalClub"
          value={values.newRivalClub}
          onChange={handleChange}
          placeholder="Opcional"
          autoComplete="off"
          suggestionItems={rivalClubSuggestions}
          onPickSuggestion={handlePickRivalClub}
        />
        {formError ? <p className="text-sm text-red-400">{formError}</p> : null}

        <TextField
          label="Fecha"
          name="date"
          type="date"
          value={values.date}
          onChange={handleChange}
        />
      </FormSection>

      <FormSection title="Sets">
        <p className="text-sm text-slate-400">
          A 11. Si hay deuce, 12-10, 13-11, 14-12.
        </p>
        <div className="space-y-4">
          {values.sets.map((set, index) => {
            const closed = isClosedSet(set.playerScore, set.opponentScore)
            const scoreHint = getSetScoreHint(set.playerScore, set.opponentScore)
            const playerWins =
              closed &&
              parseSetScore(set.playerScore) > parseSetScore(set.opponentScore)

            return (
            <div key={`set-${index}`} className="space-y-3 rounded-2xl bg-slate-800 p-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold uppercase tracking-wide text-slate-400">
                  Set {index + 1}
                </p>
                <button
                  type="button"
                  onClick={() => removeSet(index)}
                  aria-label={`Quitar set ${index + 1}`}
                  className="flex min-h-12 min-w-12 items-center justify-center rounded-xl bg-slate-700 text-slate-300"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <SetScoreField
                  label={playerLabel}
                  value={set.playerScore}
                  isWinner={playerWins}
                  onChange={(value) =>
                    handleSetChange(index, 'playerScore', value)
                  }
                />
                <SetScoreField
                  label={rivalLabel}
                  value={set.opponentScore}
                  isWinner={closed && !playerWins}
                  onChange={(value) =>
                    handleSetChange(index, 'opponentScore', value)
                  }
                />
              </div>
              {scoreHint ? (
                <p className="text-sm text-amber-400">{scoreHint}</p>
              ) : null}
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-300">
                  Nota del set
                </span>
                <input
                  value={set.notes}
                  onChange={(event) =>
                    handleSetChange(index, 'notes', event.target.value)
                  }
                  placeholder="Error, ajuste o algo para recordar"
                  className={CONTROL_CLASS}
                />
              </label>
            </div>
            )
          })}
        </div>
        <button
          type="button"
          onClick={addSet}
          className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-slate-800 text-sm font-medium text-white"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Agregar set
        </button>
      </FormSection>

      <TextAreaField
        label="Notas"
        name="notes"
        value={values.notes}
        onChange={handleChange}
        phrases={phrases}
      />

      <OptionalSection
        title={isCoaching ? 'Plan para el compañero' : 'Estrategia pre-partido'}
        description={
          isCoaching
            ? 'Qué decirle antes o durante el partido.'
            : 'Saque, recepción y plan táctico.'
        }
        defaultOpen={hasFilledFields(values.preMatchStrategy)}
      >
        <TextAreaField
          label="Saques"
          name="serves"
          value={values.preMatchStrategy.serves}
          onChange={(event) => handleStrategyChange('preMatchStrategy', event)}
          phrases={phrases}
        />
        <TextAreaField
          label="Recepción"
          name="receive"
          value={values.preMatchStrategy.receive}
          onChange={(event) => handleStrategyChange('preMatchStrategy', event)}
          phrases={phrases}
        />
        <TextAreaField
          label="Efectos y ritmo"
          name="effectsAndRhythm"
          value={values.preMatchStrategy.effectsAndRhythm}
          onChange={(event) => handleStrategyChange('preMatchStrategy', event)}
          phrases={phrases}
        />
        <TableZoneMap
          selectedIds={values.preMatchStrategy.targetZones}
          onChange={handleZonesChange}
        />
        <TextAreaField
          label="Ubicación en la mesa"
          name="tablePlacement"
          value={values.preMatchStrategy.tablePlacement}
          onChange={(event) => handleStrategyChange('preMatchStrategy', event)}
          phrases={phrases}
        />
        <TextAreaField
          label="Zonas a atacar"
          name="targetAreas"
          value={values.preMatchStrategy.targetAreas}
          onChange={(event) => handleStrategyChange('preMatchStrategy', event)}
          phrases={phrases}
        />
        <TextAreaField
          label="Hacer"
          name="thingsToDo"
          value={values.preMatchStrategy.thingsToDo}
          onChange={(event) => handleStrategyChange('preMatchStrategy', event)}
          phrases={phrases}
        />
        <TextAreaField
          label="Evitar"
          name="thingsToAvoid"
          value={values.preMatchStrategy.thingsToAvoid}
          onChange={(event) => handleStrategyChange('preMatchStrategy', event)}
          phrases={phrases}
        />
        <TextAreaField
          label="Objetivo"
          name="mainObjective"
          value={values.preMatchStrategy.mainObjective}
          onChange={(event) => handleStrategyChange('preMatchStrategy', event)}
          phrases={phrases}
        />
      </OptionalSection>

      <OptionalSection
        title="Durante el partido"
        description="Ajustes en vivo, entre sets."
        defaultOpen={hasFilledFields(values.duringMatchNotes)}
      >
        <TextAreaField
          label="Qué está funcionando"
          name="whatIsWorking"
          value={values.duringMatchNotes.whatIsWorking}
          onChange={(event) => handleStrategyChange('duringMatchNotes', event)}
          phrases={phrases}
        />
        <TextAreaField
          label="Qué cambiar"
          name="whatToChange"
          value={values.duringMatchNotes.whatToChange}
          onChange={(event) => handleStrategyChange('duringMatchNotes', event)}
          phrases={phrases}
        />
        <TextAreaField
          label="Notas en vivo"
          name="notes"
          value={values.duringMatchNotes.notes}
          onChange={(event) => handleStrategyChange('duringMatchNotes', event)}
          phrases={phrases}
        />
      </OptionalSection>

      <OptionalSection
        title={isCoaching ? 'Devolución al compañero' : 'Análisis post-partido'}
        description={
          isCoaching
            ? 'Errores, qué le funcionó y qué decirle.'
            : 'Qué funcionó y qué ajustar.'
        }
        defaultOpen={hasFilledFields(values.postMatchAnalysis)}
      >
        <TextAreaField
          label={isCoaching ? 'Qué le funcionó' : 'Qué funcionó'}
          name="whatWorked"
          value={values.postMatchAnalysis.whatWorked}
          onChange={(event) => handleStrategyChange('postMatchAnalysis', event)}
          phrases={phrases}
        />
        <TextAreaField
          label={isCoaching ? 'Qué no le funcionó' : 'Qué no funcionó'}
          name="whatDidNotWork"
          value={values.postMatchAnalysis.whatDidNotWork}
          onChange={(event) => handleStrategyChange('postMatchAnalysis', event)}
          phrases={phrases}
        />
        <TextAreaField
          label={isCoaching ? 'Errores que tuvo' : 'Mis errores'}
          name="myMistakes"
          value={values.postMatchAnalysis.myMistakes}
          onChange={(event) => handleStrategyChange('postMatchAnalysis', event)}
          phrases={phrases}
        />
        <TextAreaField
          label={isCoaching ? 'Qué decirle' : 'Para el próximo'}
          name="advice"
          value={values.postMatchAnalysis.advice}
          onChange={(event) => handleStrategyChange('postMatchAnalysis', event)}
          phrases={phrases}
        />
        {!isCoaching ? (
          <TextAreaField
            label="Debilidades del rival"
            name="opponentWeaknessesDiscovered"
            value={values.postMatchAnalysis.opponentWeaknessesDiscovered}
            onChange={(event) =>
              handleStrategyChange('postMatchAnalysis', event)
            }
            phrases={phrases}
          />
        ) : null}
        <TextAreaField
          label="Notas del análisis"
          name="notes"
          value={values.postMatchAnalysis.notes}
          onChange={(event) => handleStrategyChange('postMatchAnalysis', event)}
          phrases={phrases}
        />
      </OptionalSection>

      <div>
        <p className="mb-2 text-sm font-medium text-slate-300">
          {isCoaching ? 'Resultado del compañero' : 'Resultado'}
        </p>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => handleResultChange(MATCH_RESULT.WIN)}
            className={`min-h-14 rounded-2xl text-base font-semibold ${
              result === MATCH_RESULT.WIN
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-800 text-slate-300'
            }`}
          >
            Victoria
          </button>
          <button
            type="button"
            onClick={() => handleResultChange(MATCH_RESULT.LOSS)}
            className={`min-h-14 rounded-2xl text-base font-semibold ${
              result === MATCH_RESULT.LOSS
                ? 'bg-red-600 text-white'
                : 'bg-slate-800 text-slate-300'
            }`}
          >
            Derrota
          </button>
        </div>
      </div>

      <button
        type="submit"
        className="min-h-14 w-full rounded-2xl bg-white text-base font-semibold text-slate-900"
      >
        {submitLabel}
      </button>
    </form>
  )
}
