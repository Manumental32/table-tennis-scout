import { useState } from 'react'
import { TextField } from '../common/FormField'

const MODES = {
  SIGN_IN: 'signIn',
  SIGN_UP: 'signUp',
}

function getSubmitLabel(isSubmitting, isSignIn) {
  if (isSubmitting) {
    return 'Esperá…'
  }

  if (isSignIn) {
    return 'Entrar'
  }

  return 'Crear cuenta'
}

export default function AuthForm({
  onSignIn,
  onSignUp,
  onEnterLocal,
  allowLocalDev = false,
  configError,
}) {
  const [mode, setMode] = useState(MODES.SIGN_IN)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [formError, setFormError] = useState('')
  const [infoMessage, setInfoMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isSignIn = mode === MODES.SIGN_IN

  function handleModeChange(nextMode) {
    setMode(nextMode)
    setFormError('')
    setInfoMessage('')
  }

  async function handleSubmit(event) {
    event.preventDefault()

    const nextEmail = email.trim()

    if (!nextEmail || !password) {
      setFormError('Completá email y contraseña.')
      return
    }

    if (password.length < 6) {
      setFormError('La contraseña tiene que tener al menos 6 caracteres.')
      return
    }

    setIsSubmitting(true)
    setFormError('')
    setInfoMessage('')

    const result = isSignIn
      ? await onSignIn(nextEmail, password)
      : await onSignUp(nextEmail, password)

    setIsSubmitting(false)

    if (result.error) {
      setFormError(result.error)
      return
    }

    if (result.status === 'already_registered') {
      setMode(MODES.SIGN_IN)
      setFormError('Ese email ya tiene una cuenta. Entrá con tu contraseña.')
      return
    }

    if (result.status === 'needs_confirmation') {
      setMode(MODES.SIGN_IN)
      setInfoMessage(
        'Cuenta creada. Revisá el email para confirmarla y después entrá con la misma contraseña.',
      )
      return
    }

    if (result.status === 'signed_in') {
      setInfoMessage('Entrando…')
    }
  }

  return (
    <form className="space-y-4 pb-6" onSubmit={handleSubmit}>
      <p className="text-sm leading-relaxed text-slate-300">
        Con una cuenta el historial viaja entre la Mac y el celular. Sin internet,
        seguís usando lo que ya está en este dispositivo.
      </p>

      {configError ? <p className="text-sm text-red-400">{configError}</p> : null}

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => handleModeChange(MODES.SIGN_IN)}
          className={`min-h-12 rounded-xl text-sm font-semibold ${
            isSignIn ? 'bg-white text-slate-900' : 'bg-slate-800 text-slate-300'
          }`}
        >
          Entrar
        </button>
        <button
          type="button"
          onClick={() => handleModeChange(MODES.SIGN_UP)}
          className={`min-h-12 rounded-xl text-sm font-semibold ${
            isSignIn ? 'bg-slate-800 text-slate-300' : 'bg-white text-slate-900'
          }`}
        >
          Crear cuenta
        </button>
      </div>

      <TextField
        label="Email"
        name="email"
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        autoComplete="email"
      />
      <TextField
        label="Contraseña"
        name="password"
        type="password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        autoComplete={isSignIn ? 'current-password' : 'new-password'}
      />

      {formError ? (
        <p className="rounded-xl bg-red-950 px-4 py-3 text-sm text-red-200">{formError}</p>
      ) : null}
      {infoMessage ? (
        <p className="rounded-xl bg-emerald-950 px-4 py-3 text-sm text-emerald-100">
          {infoMessage}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="min-h-14 w-full rounded-2xl bg-white text-base font-semibold text-slate-900 disabled:opacity-60"
      >
        {getSubmitLabel(isSubmitting, isSignIn)}
      </button>

      {allowLocalDev ? (
        <>
          <button
            type="button"
            onClick={onEnterLocal}
            className="min-h-12 w-full rounded-xl bg-slate-800 text-sm font-medium text-slate-200"
          >
            Entrar en local
          </button>
          <p className="text-xs leading-relaxed text-slate-500">
            Solo aparece en localhost. No sincroniza con la nube.
          </p>
        </>
      ) : null}
    </form>
  )
}
