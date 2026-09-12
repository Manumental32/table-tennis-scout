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
  hasFilledFields,
  isCoachedMatch,
  parseSetScore,
  toDateInputValue,
} from '../../utils/matches'
import {
  CONTROL_CLASS,
  FormSection,
  OptionalSection,
  SelectField,
  TextAreaField,
  TextField,
} from '../common/FormField'

const NEW_TEAMMATE_VALUE = '__new__'
const EMPTY_SET = { playerScore: '', opponentScore: '', notes: '' }

function getFormValues(match, kind) {
  const values = createMatch({
    ...(match ?? {}),
    kind: match ? getMatchKind(match) : kind,
  })

  return {
    ...values,
    rivalId: values.rivalId ?? '',
    teammateId: values.teammateId ?? '',
    tournamentId: values.tournamentId ?? '',
    newTeammateName: '',
    newTeammateClub: '',
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
  onSubmit,
  submitLabel,
}) {
  const [values, setValues] = useState(() => getFormValues(match, kind))
  const [formError, setFormError] = useState('')
  const phrases = useStrategySuggestions()
  const isCoaching = isCoachedMatch(values)

  const rivalOptions = [
    {
      value: '',
      label: isCoaching ? 'Rival del compañero (opcional)' : 'Elegí un rival',
    },
    ...rivals.map((rival) => ({
      value: rival.id,
      label: rival.club ? `${rival.name} · ${rival.club}` : rival.name,
    })),
  ]

  const teammateOptions = [
    { value: '', label: 'Elegí un compañero' },
    ...teammates.map((teammate) => ({
      value: teammate.id,
      label: teammate.club ? `${teammate.name} · ${teammate.club}` : teammate.name,
    })),
    { value: NEW_TEAMMATE_VALUE, label: 'Nuevo compañero' },
  ]

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

  function handleRivalChange(event) {
    const rivalId = event.target.value
    const selectedRival = rivals.find((rival) => rival.id === rivalId)

    setValues((currentValues) => ({
      ...currentValues,
      rivalId,
      preMatchStrategy: createPreMatchStrategy({
        ...currentValues.preMatchStrategy,
        thingsToDo:
          currentValues.preMatchStrategy.thingsToDo ||
          selectedRival?.thingsToDo ||
          '',
        thingsToAvoid:
          currentValues.preMatchStrategy.thingsToAvoid ||
          selectedRival?.thingsToAvoid ||
          '',
        mainObjective:
          currentValues.preMatchStrategy.mainObjective ||
          selectedRival?.mainObjective ||
          '',
      }),
    }))

    if (formError) {
      setFormError('')
    }
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
      const isNewTeammate = values.teammateId === NEW_TEAMMATE_VALUE
      const newName = values.newTeammateName.trim()

      if (!values.teammateId || (isNewTeammate && !newName)) {
        setFormError('Elegí o cargá un compañero')
        return
      }
    } else if (!values.rivalId) {
      setFormError('Elegí un rival')
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

    const { newTeammateName, newTeammateClub, ...matchValues } = values

    onSubmit({
      ...matchValues,
      kind: getMatchKind(values),
      tournamentId: values.tournamentId || null,
      rivalId: values.rivalId || null,
      teammateId: isCoaching ? values.teammateId : null,
      newTeammate:
        isCoaching && values.teammateId === NEW_TEAMMATE_VALUE
          ? {
              name: newTeammateName.trim(),
              club: newTeammateClub.trim(),
            }
          : null,
      date: fromDateInputValue(values.date),
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
      <FormSection title={isCoaching ? 'Cocheo' : 'Partido'}>
        {isCoaching ? (
          <>
            <SelectField
              label="Compañero"
              name="teammateId"
              value={values.teammateId}
              onChange={handleChange}
              options={teammateOptions}
            />
            {values.teammateId === NEW_TEAMMATE_VALUE ? (
              <>
                <TextField
                  label="Nombre del compañero"
                  name="newTeammateName"
                  value={values.newTeammateName}
                  onChange={handleChange}
                  placeholder="Nombre"
                  autoComplete="off"
                />
                <TextField
                  label="Club"
                  name="newTeammateClub"
                  value={values.newTeammateClub}
                  onChange={handleChange}
                  placeholder="Opcional"
                  autoComplete="off"
                />
              </>
            ) : null}
            <SelectField
              label="Rival al que se enfrentó"
              name="rivalId"
              value={values.rivalId}
              onChange={handleRivalChange}
              options={rivalOptions}
            />
          </>
        ) : (
          <SelectField
            label="Rival"
            name="rivalId"
            value={values.rivalId}
            onChange={handleRivalChange}
            options={rivalOptions}
          />
        )}
        {formError ? <p className="text-sm text-red-400">{formError}</p> : null}

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
          label="Fecha"
          name="date"
          type="date"
          value={values.date}
          onChange={handleChange}
        />

        <div>
          <p className="mb-2 text-sm font-medium text-slate-300">
            {isCoaching ? 'Resultado del compañero' : 'Resultado'}
          </p>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleResultChange(MATCH_RESULT.WIN)}
              className={`min-h-14 rounded-2xl text-base font-semibold ${
                values.result === MATCH_RESULT.WIN
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
                values.result === MATCH_RESULT.LOSS
                  ? 'bg-red-600 text-white'
                  : 'bg-slate-800 text-slate-300'
              }`}
            >
              Derrota
            </button>
          </div>
        </div>
      </FormSection>

      <FormSection title="Sets">
        <div className="space-y-4">
          {values.sets.map((set, index) => (
            <div key={`set-${index}`} className="space-y-3 rounded-2xl bg-slate-800 p-3">
              <div className="flex items-end gap-3">
                <label className="flex-1">
                  <span className="mb-2 block text-sm font-medium text-slate-300">
                    Set {index + 1} · {isCoaching ? 'Compañero' : 'Vos'}
                  </span>
                  <input
                    inputMode="numeric"
                    value={set.playerScore}
                    onChange={(event) =>
                      handleSetChange(index, 'playerScore', event.target.value)
                    }
                    className={CONTROL_CLASS}
                  />
                </label>
                <label className="flex-1">
                  <span className="mb-2 block text-sm font-medium text-slate-300">
                    Rival
                  </span>
                  <input
                    inputMode="numeric"
                    value={set.opponentScore}
                    onChange={(event) =>
                      handleSetChange(
                        index,
                        'opponentScore',
                        event.target.value,
                      )
                    }
                    className={CONTROL_CLASS}
                  />
                </label>
                <button
                  type="button"
                  onClick={() => removeSet(index)}
                  aria-label={`Quitar set ${index + 1}`}
                  className="flex min-h-12 min-w-12 items-center justify-center rounded-xl bg-slate-700 text-slate-300"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
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
          ))}
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

      <button
        type="submit"
        className="min-h-14 w-full rounded-2xl bg-white text-base font-semibold text-slate-900"
      >
        {submitLabel}
      </button>
    </form>
  )
}
