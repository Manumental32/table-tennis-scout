import { useState } from 'react'
import { ChevronDown, Eye, EyeOff } from 'lucide-react'
import {
  filterSuggestions,
  getCurrentLine,
  replaceCurrentLine,
} from '../../utils/suggestions'

export const CONTROL_CLASS =
  'min-h-12 w-full rounded-xl border border-slate-700 bg-slate-800 px-4 text-base text-white outline-none placeholder:text-slate-500 focus:border-slate-500'

function SuggestionList({ items, onPick }) {
  if (items.length === 0) {
    return null
  }

  return (
    <ul className="mt-2 space-y-1">
      {items.map((item) => {
        const isObject = typeof item === 'object' && item !== null
        const key = isObject ? item.id : item
        const label = isObject ? item.label : item
        const subtitle = isObject ? item.subtitle : ''

        return (
          <li key={key}>
            <button
              type="button"
              onMouseDown={(event) => {
                event.preventDefault()
                onPick(item)
              }}
              className="min-h-11 w-full rounded-xl bg-slate-700 px-3 py-2 text-left"
            >
              <span className="block text-sm text-white">{label}</span>
              {subtitle ? (
                <span className="mt-0.5 block text-xs text-slate-400">
                  {subtitle}
                </span>
              ) : null}
            </button>
          </li>
        )
      })}
    </ul>
  )
}

export function TextField({
  label,
  error,
  phrases = [],
  fieldName,
  type = 'text',
  suggestionItems,
  onPickSuggestion,
  ...props
}) {
  const [isFocused, setIsFocused] = useState(false)
  const [isSecretVisible, setIsSecretVisible] = useState(false)
  const isSecret = type === 'password'
  const inputType = isSecret && isSecretVisible ? 'text' : type
  const query = String(props.value ?? '')
  const visibleSuggestions = suggestionItems
    ? suggestionItems
    : isFocused && phrases.length > 0
      ? filterSuggestions(phrases, fieldName ?? props.name, query)
      : []

  function pickSuggestion(item) {
    if (suggestionItems) {
      onPickSuggestion?.(item)
      return
    }

    props.onChange?.({
      target: { name: props.name, value: item },
    })
  }

  return (
    <label className="block [&:focus-within_.suggestion-panel]:block">
      <span className="mb-2 block text-sm font-medium text-slate-300">
        {label}
      </span>
      <span className="relative block">
        <input
          className={isSecret ? `${CONTROL_CLASS} pr-14` : CONTROL_CLASS}
          {...props}
          type={inputType}
          onFocus={(event) => {
            setIsFocused(true)
            props.onFocus?.(event)
          }}
          onBlur={(event) => {
            setIsFocused(false)
            props.onBlur?.(event)
          }}
        />
        {isSecret ? (
          <button
            type="button"
            onClick={() => setIsSecretVisible((current) => !current)}
            aria-label={isSecretVisible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-slate-400"
          >
            {isSecretVisible ? (
              <EyeOff className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Eye className="h-5 w-5" aria-hidden="true" />
            )}
          </button>
        ) : null}
      </span>
      <div className={suggestionItems ? 'suggestion-panel hidden' : undefined}>
        <SuggestionList items={visibleSuggestions} onPick={pickSuggestion} />
      </div>
      {error ? <p className="mt-2 text-sm text-red-400">{error}</p> : null}
    </label>
  )
}

export function TextAreaField({ label, phrases = [], fieldName, ...props }) {
  const [isFocused, setIsFocused] = useState(false)
  const currentLine = getCurrentLine(props.value)
  const visibleSuggestions =
    isFocused && phrases.length > 0
      ? filterSuggestions(phrases, fieldName ?? props.name, currentLine)
      : []

  function pickSuggestion(phrase) {
    props.onChange?.({
      target: { name: props.name, value: replaceCurrentLine(props.value, phrase) },
    })
  }

  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-300">
        {label}
      </span>
      <textarea
        className={`${CONTROL_CLASS} min-h-28 py-3`}
        {...props}
        onFocus={(event) => {
          setIsFocused(true)
          props.onFocus?.(event)
        }}
        onBlur={(event) => {
          setIsFocused(false)
          props.onBlur?.(event)
        }}
      />
      <SuggestionList items={visibleSuggestions} onPick={pickSuggestion} />
    </label>
  )
}

export function SelectField({ label, options, ...props }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-300">
        {label}
      </span>
      <select className={CONTROL_CLASS} {...props}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  )
}

export function FormSection({ title, children }) {
  return (
    <section className="space-y-4">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
        {title}
      </h3>
      {children}
    </section>
  )
}

export function OptionalSection({ title, description, defaultOpen = false, children }) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <section className="rounded-2xl bg-slate-800">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        aria-expanded={isOpen}
        className="flex min-h-14 w-full items-center justify-between gap-3 px-4 py-3 text-left"
      >
        <span>
          <span className="block text-sm font-semibold uppercase tracking-wide text-slate-400">
            {title}
          </span>
          {description ? (
            <span className="mt-1 block text-sm text-slate-300">{description}</span>
          ) : null}
        </span>
        <ChevronDown
          className={`h-5 w-5 shrink-0 text-slate-400 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
          aria-hidden="true"
        />
      </button>
      {isOpen ? <div className="space-y-4 px-4 pb-4">{children}</div> : null}
    </section>
  )
}
