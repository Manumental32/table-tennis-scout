import { useState } from 'react'
import { ANALYSIS_SECTION } from '../../utils/constants'
import {
  createDuringMatchNotes,
  createPostMatchAnalysis,
  createPreMatchStrategy,
} from '../../utils/dataModels'
import { useStrategySuggestions } from '../../hooks/useStrategySuggestions'
import { hasSelectedZones, sanitizeZoneIds } from '../../utils/tableZones'
import { formatFixtureLine } from '../../utils/tournaments'
import TableZoneMap from '../common/TableZoneMap'
import { TextAreaField } from '../common/FormField'

const SECTIONS = [
  { id: ANALYSIS_SECTION.PRE, label: 'Pre' },
  { id: ANALYSIS_SECTION.DURING, label: 'Durante' },
  { id: ANALYSIS_SECTION.POST, label: 'Post' },
]

function getSectionKey(section) {
  if (section === ANALYSIS_SECTION.DURING) {
    return 'duringMatchNotes'
  }

  if (section === ANALYSIS_SECTION.POST) {
    return 'postMatchAnalysis'
  }

  return 'preMatchStrategy'
}

function getFormValues(match, rival) {
  const preMatchStrategy = createPreMatchStrategy(match?.preMatchStrategy)

  return {
    preMatchStrategy: {
      ...preMatchStrategy,
      thingsToDo: preMatchStrategy.thingsToDo || rival?.thingsToDo || '',
      thingsToAvoid: preMatchStrategy.thingsToAvoid || rival?.thingsToAvoid || '',
      mainObjective: preMatchStrategy.mainObjective || rival?.mainObjective || '',
      targetZones: hasSelectedZones(preMatchStrategy.targetZones)
        ? preMatchStrategy.targetZones
        : sanitizeZoneIds(rival?.targetZones),
    },
    duringMatchNotes: createDuringMatchNotes(match?.duringMatchNotes),
    postMatchAnalysis: createPostMatchAnalysis(match?.postMatchAnalysis),
  }
}

export default function FixtureMatchAnalysis({
  fixtureMatch,
  match,
  rival,
  section,
  onSectionChange,
  onSubmit,
}) {
  const [values, setValues] = useState(() => getFormValues(match, rival))
  const [justSaved, setJustSaved] = useState(false)
  const phrases = useStrategySuggestions()

  function handleSectionChange(event) {
    const { name, value } = event.target
    const sectionKey = getSectionKey(section)

    setJustSaved(false)
    setValues((current) => ({
      ...current,
      [sectionKey]: {
        ...current[sectionKey],
        [name]: value,
      },
    }))
  }

  function handleZonesChange(targetZones) {
    setJustSaved(false)
    setValues((current) => ({
      ...current,
      preMatchStrategy: {
        ...current.preMatchStrategy,
        targetZones,
      },
    }))
  }

  function handleSubmit(event) {
    event.preventDefault()
    onSubmit({
      preMatchStrategy: createPreMatchStrategy(values.preMatchStrategy),
      duringMatchNotes: createDuringMatchNotes(values.duringMatchNotes),
      postMatchAnalysis: createPostMatchAnalysis(values.postMatchAnalysis),
    })
    setJustSaved(true)
  }

  return (
    <form className="space-y-4 pb-6" onSubmit={handleSubmit}>
      <section className="rounded-2xl bg-slate-800 px-4 py-4">
        <p className="text-lg font-semibold text-white">{fixtureMatch.opponent}</p>
        <p className="mt-1 text-sm text-slate-300">{formatFixtureLine(fixtureMatch)}</p>
        {rival?.club ? (
          <p className="mt-1 text-sm text-slate-400">{rival.club}</p>
        ) : null}
      </section>

      <div className="grid grid-cols-3 gap-2">
        {SECTIONS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onSectionChange(item.id)}
            className={`min-h-12 rounded-xl text-sm font-semibold ${
              section === item.id
                ? 'bg-white text-slate-900'
                : 'bg-slate-800 text-slate-300'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {section === ANALYSIS_SECTION.PRE ? (
        <div className="space-y-4">
          <TableZoneMap
            selectedIds={values.preMatchStrategy.targetZones}
            onChange={handleZonesChange}
          />
          <TextAreaField
            label="Hacer"
            name="thingsToDo"
            value={values.preMatchStrategy.thingsToDo}
            onChange={handleSectionChange}
            phrases={phrases}
          />
          <TextAreaField
            label="Evitar"
            name="thingsToAvoid"
            value={values.preMatchStrategy.thingsToAvoid}
            onChange={handleSectionChange}
            phrases={phrases}
          />
          <TextAreaField
            label="Objetivo"
            name="mainObjective"
            value={values.preMatchStrategy.mainObjective}
            onChange={handleSectionChange}
            phrases={phrases}
          />
          <TextAreaField
            label="Saques"
            name="serves"
            value={values.preMatchStrategy.serves}
            onChange={handleSectionChange}
            phrases={phrases}
          />
          <TextAreaField
            label="Recepción"
            name="receive"
            value={values.preMatchStrategy.receive}
            onChange={handleSectionChange}
            phrases={phrases}
          />
        </div>
      ) : null}

      {section === ANALYSIS_SECTION.DURING ? (
        <div className="space-y-4">
          <TextAreaField
            label="Qué está funcionando"
            name="whatIsWorking"
            value={values.duringMatchNotes.whatIsWorking}
            onChange={handleSectionChange}
            phrases={phrases}
          />
          <TextAreaField
            label="Qué cambiar"
            name="whatToChange"
            value={values.duringMatchNotes.whatToChange}
            onChange={handleSectionChange}
            phrases={phrases}
          />
          <TextAreaField
            label="Notas en vivo"
            name="notes"
            value={values.duringMatchNotes.notes}
            onChange={handleSectionChange}
            phrases={phrases}
          />
        </div>
      ) : null}

      {section === ANALYSIS_SECTION.POST ? (
        <div className="space-y-4">
          <TextAreaField
            label="Qué funcionó"
            name="whatWorked"
            value={values.postMatchAnalysis.whatWorked}
            onChange={handleSectionChange}
            phrases={phrases}
          />
          <TextAreaField
            label="Qué no funcionó"
            name="whatDidNotWork"
            value={values.postMatchAnalysis.whatDidNotWork}
            onChange={handleSectionChange}
            phrases={phrases}
          />
          <TextAreaField
            label="Mis errores"
            name="myMistakes"
            value={values.postMatchAnalysis.myMistakes}
            onChange={handleSectionChange}
            phrases={phrases}
          />
          <TextAreaField
            label="Para el próximo"
            name="advice"
            value={values.postMatchAnalysis.advice}
            onChange={handleSectionChange}
            phrases={phrases}
          />
        </div>
      ) : null}

      <button
        type="submit"
        className="min-h-14 w-full rounded-2xl bg-white text-base font-semibold text-slate-900"
      >
        {justSaved ? 'Guardado' : 'Guardar análisis'}
      </button>
    </form>
  )
}
