import { useMemo, useState } from 'react'
import { usePlayerProfile } from '../../hooks/usePlayerProfile'
import { useRivals } from '../../hooks/useRivals'
import { useStrategySuggestions } from '../../hooks/useStrategySuggestions'
import { useTournament } from '../../hooks/useTournament'
import TableZoneMap from '../common/TableZoneMap'
import {
  FormSection,
  OptionalSection,
  SelectField,
  TextAreaField,
  TextField,
} from '../common/FormField'
import {
  collectRankingCandidates,
  collectRankingClubs,
  filterRankingCandidates,
  filterRankingClubs,
} from '../../utils/rivals'
import { sanitizeZoneIds } from '../../utils/tableZones'
import { normalizeName } from '../../utils/tournaments'
import { BUILD, HEIGHT, MOBILITY } from '../../utils/constants'
import { createRival } from '../../utils/dataModels'
import {
  BUILD_OPTIONS,
  GRIP_OPTIONS,
  HAND_OPTIONS,
  HEIGHT_OPTIONS,
  MOBILITY_OPTIONS,
  PLAY_STYLE_OPTIONS,
  RHYTHM_OPTIONS,
  RUBBER_OPTIONS,
} from '../../utils/labels'

function getFormValues(rival) {
  return createRival(rival ?? {})
}

function hasPhysicalData(rival) {
  if (!rival) {
    return false
  }

  return (
    rival.height !== HEIGHT.UNKNOWN ||
    rival.build !== BUILD.UNKNOWN ||
    rival.mobility !== MOBILITY.UNKNOWN
  )
}

const SUGGESTION_LIMIT = 8

export default function RivalForm({ rival, onSubmit, submitLabel }) {
  const [values, setValues] = useState(() => getFormValues(rival))
  const [nameError, setNameError] = useState('')
  const phrases = useStrategySuggestions()
  const { rivals } = useRivals()
  const { tournaments } = useTournament()
  const { profile } = usePlayerProfile()
  const rankingCandidates = useMemo(
    () => collectRankingCandidates(tournaments, rivals, profile.name),
    [profile.name, rivals, tournaments],
  )
  const rankingClubs = useMemo(
    () => collectRankingClubs(tournaments),
    [tournaments],
  )
  const nameSuggestions = values.name.trim()
    ? filterRankingCandidates(rankingCandidates, values.name)
        .filter(
          (candidate) =>
            normalizeName(candidate.name) !== normalizeName(values.name),
        )
        .slice(0, SUGGESTION_LIMIT)
        .map((candidate) => ({
          id: `${candidate.tournamentId}-${candidate.name}`,
          label: candidate.name,
          subtitle: [candidate.club, candidate.tournamentName]
            .filter(Boolean)
            .join(' · '),
          value: candidate,
        }))
    : []
  const clubSuggestions = filterRankingClubs(rankingClubs, values.club)
    .slice(0, SUGGESTION_LIMIT)
    .map((club) => ({
      id: club,
      label: club,
      value: club,
    }))

  function handleChange(event) {
    const { name, value } = event.target
    setValues((currentValues) => ({
      ...currentValues,
      [name]: value,
    }))

    if (name === 'name' && nameError) {
      setNameError('')
    }
  }

  function handlePickRankingName(item) {
    const candidate = item.value
    setValues((currentValues) => ({
      ...currentValues,
      name: candidate.name,
      club: candidate.club || currentValues.club,
    }))

    if (nameError) {
      setNameError('')
    }
  }

  function handlePickRankingClub(item) {
    setValues((currentValues) => ({
      ...currentValues,
      club: item.value,
    }))
  }

  function handleZonesChange(targetZones) {
    setValues((currentValues) => ({
      ...currentValues,
      targetZones,
    }))
  }

  function handleSubmit(event) {
    event.preventDefault()
    const name = values.name.trim()

    if (!name) {
      setNameError('El nombre es obligatorio')
      return
    }

    onSubmit({
      ...values,
      name,
      club: values.club.trim(),
      targetZones: sanitizeZoneIds(values.targetZones),
    })
  }

  return (
    <form className="space-y-8 pb-6" onSubmit={handleSubmit}>
      <FormSection title="Datos básicos">
        <TextField
          label="Nombre"
          name="name"
          value={values.name}
          onChange={handleChange}
          placeholder="Nombre del rival"
          autoComplete="off"
          error={nameError}
          suggestionItems={nameSuggestions}
          onPickSuggestion={handlePickRankingName}
        />
        <TextField
          label="Club"
          name="club"
          value={values.club}
          onChange={handleChange}
          placeholder="Club u origen"
          autoComplete="off"
          suggestionItems={clubSuggestions}
          onPickSuggestion={handlePickRankingClub}
        />
      </FormSection>

      <FormSection title="Plan rápido">
        <TextAreaField
          label="Hacer"
          name="thingsToDo"
          value={values.thingsToDo}
          onChange={handleChange}
          placeholder={'Saque corto al revés\nBuscar tercera pelota de derecha'}
          phrases={phrases}
        />
        <TextAreaField
          label="Evitar"
          name="thingsToAvoid"
          value={values.thingsToAvoid}
          onChange={handleChange}
          placeholder={'Pelota larga al revés\nRitmo demasiado rápido'}
          phrases={phrases}
        />
        <TextAreaField
          label="Objetivo"
          name="mainObjective"
          value={values.mainObjective}
          onChange={handleChange}
          placeholder={'Sacarlo de la mesa\nEvitar intercambio rápido'}
          phrases={phrases}
        />
      </FormSection>

      <FormSection title="Perfil técnico">
        <SelectField
          label="Mano"
          name="hand"
          value={values.hand}
          onChange={handleChange}
          options={HAND_OPTIONS}
        />
        <SelectField
          label="Agarre"
          name="grip"
          value={values.grip}
          onChange={handleChange}
          options={GRIP_OPTIONS}
        />
        <SelectField
          label="Goma de derecha"
          name="forehandRubber"
          value={values.forehandRubber}
          onChange={handleChange}
          options={RUBBER_OPTIONS}
        />
        <SelectField
          label="Goma de revés"
          name="backhandRubber"
          value={values.backhandRubber}
          onChange={handleChange}
          options={RUBBER_OPTIONS}
        />
      </FormSection>

      <FormSection title="Estilo">
        <SelectField
          label="Estilo"
          name="mainStrength"
          value={values.mainStrength}
          onChange={handleChange}
          options={PLAY_STYLE_OPTIONS}
        />
        <SelectField
          label="Ritmo preferido"
          name="preferredRhythm"
          value={values.preferredRhythm}
          onChange={handleChange}
          options={RHYTHM_OPTIONS}
        />
      </FormSection>

      <OptionalSection
        title="Datos físicos"
        description="Opcional. Abrí solo si aporta para el partido."
        defaultOpen={hasPhysicalData(rival)}
      >
        <SelectField
          label="Altura"
          name="height"
          value={values.height}
          onChange={handleChange}
          options={HEIGHT_OPTIONS}
        />
        <SelectField
          label="Complexión"
          name="build"
          value={values.build}
          onChange={handleChange}
          options={BUILD_OPTIONS}
        />
        <SelectField
          label="Movilidad"
          name="mobility"
          value={values.mobility}
          onChange={handleChange}
          options={MOBILITY_OPTIONS}
        />
      </OptionalSection>

      <FormSection title="Información táctica">
        <TableZoneMap
          selectedIds={values.targetZones}
          onChange={handleZonesChange}
        />
        <TextField
          label="Distancia de la mesa"
          name="distanceFromTable"
          value={values.distanceFromTable}
          onChange={handleChange}
          placeholder="Corto, medio o lejos"
          phrases={phrases}
        />
        <TextAreaField
          label="En qué es fuerte"
          name="mainStrengthDescription"
          value={values.mainStrengthDescription}
          onChange={handleChange}
          phrases={phrases}
        />
        <TextAreaField
          label="En qué es flojo"
          name="mainWeaknessDescription"
          value={values.mainWeaknessDescription}
          onChange={handleChange}
          phrases={phrases}
        />
        <TextField
          label="Saque preferido"
          name="preferredServe"
          value={values.preferredServe}
          onChange={handleChange}
          phrases={phrases}
        />
        <TextField
          label="Recepción problemática"
          name="problematicReceive"
          value={values.problematicReceive}
          onChange={handleChange}
          phrases={phrases}
        />
        <TextField
          label="Pelota preferida"
          name="preferredBall"
          value={values.preferredBall}
          onChange={handleChange}
          phrases={phrases}
        />
        <TextAreaField
          label="Notas"
          name="generalNotes"
          value={values.generalNotes}
          onChange={handleChange}
          phrases={phrases}
        />
      </FormSection>

      <FormSection title="Material">
        <TextField
          label="Madera"
          name="blade"
          value={values.blade}
          onChange={handleChange}
        />
        <TextField
          label="Marca goma derecha"
          name="forehandRubberBrand"
          value={values.forehandRubberBrand}
          onChange={handleChange}
        />
        <TextField
          label="Modelo goma derecha"
          name="forehandRubberModel"
          value={values.forehandRubberModel}
          onChange={handleChange}
        />
        <TextField
          label="Marca goma revés"
          name="backhandRubberBrand"
          value={values.backhandRubberBrand}
          onChange={handleChange}
        />
        <TextField
          label="Modelo goma revés"
          name="backhandRubberModel"
          value={values.backhandRubberModel}
          onChange={handleChange}
        />
      </FormSection>

      <button
        type="submit"
        className="min-h-14 w-full rounded-2xl bg-white text-base font-semibold text-slate-900"
      >
        {submitLabel}
      </button>
    </form>
  )
}
