import { useState } from 'react'
import { createTournament } from '../../utils/dataModels'
import { fromDateInputValue, toDateInputValue } from '../../utils/matches'
import { TextField } from '../common/FormField'

function getFormValues(tournament, defaultPlayerName = '') {
  const values = createTournament(tournament ?? {})

  return {
    name: values.name,
    date: toDateInputValue(values.date),
    category: values.category,
    playerName: values.playerName || defaultPlayerName,
  }
}

export default function TournamentForm({
  tournament,
  defaultPlayerName = '',
  onSubmit,
  submitLabel,
}) {
  const [values, setValues] = useState(() =>
    getFormValues(tournament, defaultPlayerName),
  )
  const [formError, setFormError] = useState('')

  function handleChange(event) {
    const { name, value } = event.target
    setValues((current) => ({ ...current, [name]: value }))
  }

  function handleSubmit(event) {
    event.preventDefault()

    if (!values.name.trim()) {
      setFormError('El nombre del torneo es obligatorio.')
      return
    }

    if (!values.playerName.trim()) {
      setFormError('Poné tu nombre como figura en el fixture.')
      return
    }

    setFormError('')
    onSubmit({
      name: values.name.trim(),
      date: values.date ? fromDateInputValue(values.date) : '',
      category: values.category.trim(),
      playerName: values.playerName.trim(),
    })
  }

  return (
    <form className="space-y-4 pb-6" onSubmit={handleSubmit}>
      <TextField
        label="Nombre del torneo"
        name="name"
        value={values.name}
        onChange={handleChange}
        placeholder="Open de primavera"
      />
      <TextField
        label="Tu nombre en el fixture"
        name="playerName"
        value={values.playerName}
        onChange={handleChange}
        placeholder="Manuel Aquino"
      />
      <TextField
        label="Fecha"
        name="date"
        type="date"
        value={values.date}
        onChange={handleChange}
      />
      <TextField
        label="Categoría"
        name="category"
        value={values.category}
        onChange={handleChange}
        placeholder="4ta, 5ta, damas..."
      />
      {formError ? <p className="text-sm text-red-400">{formError}</p> : null}
      <button
        type="submit"
        className="min-h-14 w-full rounded-2xl bg-white text-base font-semibold text-slate-900"
      >
        {submitLabel}
      </button>
    </form>
  )
}
