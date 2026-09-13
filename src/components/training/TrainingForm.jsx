import { Plus } from 'lucide-react'
import { useState } from 'react'
import { DRILL_ACTION, DRILL_ACTOR, TRAINING_DRILL_KIND } from '../../utils/constants'
import {
  createDrillStep,
  createTraining,
  createTrainingDrill,
} from '../../utils/dataModels'
import { formatPlayerLines, parsePlayerLines } from '../../utils/trainings'
import { FormSection, TextAreaField, TextField } from '../common/FormField'
import DrillEditor from './DrillEditor'

function createStepDraft() {
  return {
    actor: DRILL_ACTOR.A,
    action: DRILL_ACTION.DRIVE,
    zoneId: '',
    label: '',
  }
}

function getFormValues(training) {
  const values = createTraining(training ?? {})

  return {
    ...values,
    playersText: formatPlayerLines(values.players),
    stepDrafts: Object.fromEntries(
      values.drills.map((drill) => [drill.id, createStepDraft()]),
    ),
  }
}

export default function TrainingForm({ training, onSubmit, submitLabel }) {
  const [values, setValues] = useState(() => getFormValues(training))
  const [formError, setFormError] = useState('')

  function handleChange(event) {
    const { name, value } = event.target
    setValues((current) => ({ ...current, [name]: value }))

    if (formError) {
      setFormError('')
    }
  }

  function handleDrillChange(drillId, nextDrill) {
    setValues((current) => ({
      ...current,
      drills: current.drills.map((drill) =>
        drill.id === drillId ? nextDrill : drill,
      ),
    }))
  }

  function handleDraftChange(drillId, nextDraft) {
    setValues((current) => ({
      ...current,
      stepDrafts: {
        ...current.stepDrafts,
        [drillId]: nextDraft,
      },
    }))
  }

  function handleAddStep(drillId, step) {
    setValues((current) => ({
      ...current,
      drills: current.drills.map((drill) =>
        drill.id === drillId
          ? { ...drill, steps: [...drill.steps, createDrillStep(step)] }
          : drill,
      ),
    }))
  }

  function handleRemoveStep(drillId, stepIndex) {
    setValues((current) => ({
      ...current,
      drills: current.drills.map((drill) =>
        drill.id === drillId
          ? {
              ...drill,
              steps: drill.steps.filter((_, index) => index !== stepIndex),
            }
          : drill,
      ),
    }))
  }

  function handleAddDrill() {
    const drill = createTrainingDrill({
      kind: TRAINING_DRILL_KIND.CONTINUOUS,
    })

    setValues((current) => ({
      ...current,
      drills: [...current.drills, drill],
      stepDrafts: {
        ...current.stepDrafts,
        [drill.id]: createStepDraft(),
      },
    }))
  }

  function handleRemoveDrill(drillId) {
    setValues((current) => {
      const nextDrafts = { ...current.stepDrafts }
      delete nextDrafts[drillId]

      return {
        ...current,
        drills: current.drills.filter((drill) => drill.id !== drillId),
        stepDrafts: nextDrafts,
      }
    })
  }

  function handleSubmit(event) {
    event.preventDefault()
    const name = values.name.trim()

    if (!name) {
      setFormError('El nombre del plan es obligatorio')
      return
    }

    const drills = values.drills.filter(
      (drill) =>
        drill.title.trim() || drill.description.trim() || drill.steps.length > 0,
    )
    const untitled = drills.find((drill) => !drill.title.trim())

    if (untitled) {
      setFormError('Cada ejercicio necesita un nombre')
      return
    }

    const trainingValues = { ...values }
    delete trainingValues.playersText
    delete trainingValues.stepDrafts

    onSubmit(
      createTraining({
        ...trainingValues,
        name,
        groupName: values.groupName.trim(),
        notes: values.notes.trim(),
        rotation: values.rotation.trim(),
        drillDurationLabel: values.drillDurationLabel.trim(),
        players: parsePlayerLines(values.playersText),
        drills,
        isCatalog: false,
      }),
    )
  }

  return (
    <form className="space-y-8 pb-6" onSubmit={handleSubmit}>
      <FormSection title="Plan">
        <TextField
          label="Nombre"
          name="name"
          value={values.name}
          onChange={handleChange}
          placeholder="Grupo Verde"
          autoComplete="off"
          error={formError && !values.name.trim() ? formError : ''}
        />
        <TextField
          label="Grupo"
          name="groupName"
          value={values.groupName}
          onChange={handleChange}
          placeholder="Grupo Verde"
          autoComplete="off"
        />
        <TextAreaField
          label="Jugadores"
          name="playersText"
          value={values.playersText}
          onChange={handleChange}
          placeholder={'Aquino\nCrocco\nBoada L'}
        />
        <TextField
          label="Rotación"
          name="rotation"
          value={values.rotation}
          onChange={handleChange}
          placeholder="2 continuos y 2 de saque por turno"
          autoComplete="off"
        />
        <TextField
          label="Tiempo por ejercicio"
          name="drillDurationLabel"
          value={values.drillDurationLabel}
          onChange={handleChange}
          placeholder="8 minutos cada uno"
          autoComplete="off"
        />
        <TextAreaField
          label="Notas"
          name="notes"
          value={values.notes}
          onChange={handleChange}
          placeholder="Calentamiento articular antes de cada entrenamiento."
        />
      </FormSection>

      <FormSection title="Ejercicios">
        {values.drills.map((drill) => (
          <DrillEditor
            key={drill.id}
            drill={drill}
            draft={values.stepDrafts[drill.id] ?? createStepDraft()}
            onChange={(nextDrill) => handleDrillChange(drill.id, nextDrill)}
            onDraftChange={(nextDraft) => handleDraftChange(drill.id, nextDraft)}
            onAddStep={(step) => handleAddStep(drill.id, step)}
            onRemoveStep={(index) => handleRemoveStep(drill.id, index)}
            onRemove={() => handleRemoveDrill(drill.id)}
          />
        ))}
        <button
          type="button"
          onClick={handleAddDrill}
          className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-slate-800 text-sm font-medium text-white"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Agregar ejercicio
        </button>
      </FormSection>

      {formError ? (
        <p className="rounded-xl bg-red-950 px-4 py-3 text-sm text-red-200">
          {formError}
        </p>
      ) : null}

      <button
        type="submit"
        className="min-h-14 w-full rounded-2xl bg-white text-base font-semibold text-slate-900"
      >
        {submitLabel}
      </button>
    </form>
  )
}
