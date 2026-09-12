import { useState } from 'react'
import { TextField } from '../common/FormField'

export default function PlayerProfileForm({
  profile,
  onSubmit,
  submitLabel,
  description,
}) {
  const [values, setValues] = useState({
    name: profile?.name ?? '',
    club: profile?.club ?? '',
  })
  const [formError, setFormError] = useState('')

  function handleChange(event) {
    const { name, value } = event.target
    setValues((current) => ({ ...current, [name]: value }))

    if (formError) {
      setFormError('')
    }
  }

  function handleSubmit(event) {
    event.preventDefault()

    const name = values.name.trim()

    if (!name) {
      setFormError('Poné tu nombre como figura en el ranking y el fixture.')
      return
    }

    onSubmit({
      name,
      club: values.club.trim(),
    })
  }

  return (
    <form className="space-y-4 pb-6" onSubmit={handleSubmit}>
      {description ? <p className="text-sm leading-relaxed text-slate-300">{description}</p> : null}
      <TextField
        label="Tu nombre"
        name="name"
        value={values.name}
        onChange={handleChange}
        placeholder="Manuel Aquino"
        autoComplete="name"
      />
      <TextField
        label="Club"
        name="club"
        value={values.club}
        onChange={handleChange}
        placeholder="GTM"
        autoComplete="organization"
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
