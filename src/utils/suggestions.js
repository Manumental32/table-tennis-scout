import { MATCH_RESULT } from './constants'
import { isCoachedMatch } from './matches'
import { normalizeName } from './tournaments'

const RELATED_FIELDS = {
  thingsToDo: ['thingsToDo', 'whatIsWorking', 'whatWorked', 'preferredBall', 'targetAreas'],
  thingsToAvoid: ['thingsToAvoid', 'whatToChange', 'whatDidNotWork', 'myMistakes'],
  mainObjective: ['mainObjective', 'advice'],
  serves: ['serves', 'preferredServe', 'thingsToDo', 'whatWorked'],
  receive: ['receive', 'problematicReceive', 'thingsToAvoid'],
  effectsAndRhythm: ['effectsAndRhythm'],
  tablePlacement: ['tablePlacement', 'distanceFromTable'],
  targetAreas: ['targetAreas', 'preferredBall'],
  whatIsWorking: ['whatIsWorking', 'whatWorked', 'thingsToDo'],
  whatToChange: ['whatToChange', 'whatDidNotWork', 'thingsToAvoid'],
  notes: ['notes', 'generalNotes'],
  whatWorked: ['whatWorked', 'whatIsWorking', 'thingsToDo'],
  whatDidNotWork: ['whatDidNotWork', 'myMistakes', 'thingsToAvoid'],
  myMistakes: ['myMistakes', 'whatDidNotWork'],
  advice: ['advice', 'mainObjective'],
  opponentWeaknessesDiscovered: [
    'opponentWeaknessesDiscovered',
    'mainWeaknessDescription',
  ],
  mainStrengthDescription: ['mainStrengthDescription'],
  mainWeaknessDescription: ['mainWeaknessDescription'],
  preferredServe: ['preferredServe', 'serves'],
  problematicReceive: ['problematicReceive', 'receive'],
  preferredBall: ['preferredBall', 'targetAreas'],
  generalNotes: ['generalNotes', 'notes'],
}

const RIVAL_FIELDS = [
  'thingsToDo',
  'thingsToAvoid',
  'mainObjective',
  'preferredServe',
  'problematicReceive',
  'preferredBall',
  'mainStrengthDescription',
  'mainWeaknessDescription',
  'generalNotes',
  'distanceFromTable',
]

export function splitStrategyPhrases(value) {
  if (!value) {
    return []
  }

  return String(value)
    .split(/\n|;|•/)
    .map((line) => line.replace(/^[-*]\s*/, '').trim())
    .filter((line) => line.length >= 4)
}

function addPhrase(bag, text, fieldName) {
  for (const phrase of splitStrategyPhrases(text)) {
    const key = normalizeName(phrase)

    if (key.length < 3) {
      continue
    }

    const current = bag.get(key) ?? {
      text: phrase,
      count: 0,
      fields: new Set(),
    }

    current.count += 1
    current.fields.add(fieldName)

    if (phrase.length < current.text.length) {
      current.text = phrase
    }

    bag.set(key, current)
  }
}

export function collectStrategyPhrases(rivals = [], matches = []) {
  const bag = new Map()

  for (const rival of rivals) {
    for (const fieldName of RIVAL_FIELDS) {
      addPhrase(bag, rival[fieldName], fieldName)
    }
  }

  for (const match of matches) {
    addPhrase(bag, match.notes, 'notes')

    for (const [fieldName, value] of Object.entries(match.preMatchStrategy ?? {})) {
      if (typeof value === 'string') {
        addPhrase(bag, value, fieldName)
      }
    }

    for (const [fieldName, value] of Object.entries(match.duringMatchNotes ?? {})) {
      if (typeof value === 'string') {
        addPhrase(bag, value, fieldName)
      }
    }

    for (const [fieldName, value] of Object.entries(match.postMatchAnalysis ?? {})) {
      if (typeof value === 'string') {
        addPhrase(bag, value, fieldName)
      }
    }
  }

  const tendencies = scorePhrasesByResult(matches)

  return [...bag.values()]
    .map((item) => {
      const tendency = tendencies.get(normalizeName(item.text))

      return {
        text: item.text,
        count: item.count,
        fields: [...item.fields],
        wins: tendency?.wins ?? 0,
        losses: tendency?.losses ?? 0,
        winRate: tendency?.winRate ?? null,
      }
    })
    .sort(comparePhrases)
}

function getMatchStrategyTexts(match) {
  return [
    ...Object.values(match.preMatchStrategy ?? {}),
    ...Object.values(match.duringMatchNotes ?? {}),
    ...Object.values(match.postMatchAnalysis ?? {}),
    match.notes,
  ].filter((value) => typeof value === 'string')
}

export function scorePhrasesByResult(matches = []) {
  const bag = new Map()

  for (const match of matches) {
    if (isCoachedMatch(match)) {
      continue
    }

    if (
      match.result !== MATCH_RESULT.WIN &&
      match.result !== MATCH_RESULT.LOSS
    ) {
      continue
    }

    const seen = new Set()

    for (const text of getMatchStrategyTexts(match)) {
      for (const phrase of splitStrategyPhrases(text)) {
        const key = normalizeName(phrase)

        if (key.length < 3 || seen.has(key)) {
          continue
        }

        seen.add(key)

        const current = bag.get(key) ?? {
          text: phrase,
          wins: 0,
          losses: 0,
        }

        if (match.result === MATCH_RESULT.WIN) {
          current.wins += 1
        } else {
          current.losses += 1
        }

        if (phrase.length < current.text.length) {
          current.text = phrase
        }

        bag.set(key, current)
      }
    }
  }

  return new Map(
    [...bag.entries()].map(([key, item]) => {
      const played = item.wins + item.losses

      return [
        key,
        {
          ...item,
          played,
          winRate: played > 0 ? item.wins / played : null,
        },
      ]
    }),
  )
}

export function getWinningPhrases(matches, limit = 5) {
  return [...scorePhrasesByResult(matches).values()]
    .filter((item) => item.wins > 0)
    .sort((left, right) => {
      if (right.wins !== left.wins) {
        return right.wins - left.wins
      }

      return (right.winRate ?? 0) - (left.winRate ?? 0)
    })
    .slice(0, limit)
}

export function getLosingPhrases(matches, limit = 5) {
  return [...scorePhrasesByResult(matches).values()]
    .filter((item) => item.losses > 0)
    .sort((left, right) => {
      if (right.losses !== left.losses) {
        return right.losses - left.losses
      }

      return (left.winRate ?? 1) - (right.winRate ?? 1)
    })
    .slice(0, limit)
}

function comparePhrases(left, right) {
  const leftRate = left.winRate
  const rightRate = right.winRate

  if (leftRate != null && rightRate != null && leftRate !== rightRate) {
    return rightRate - leftRate
  }

  if (rightRate != null && leftRate == null) {
    return 1
  }

  if (leftRate != null && rightRate == null) {
    return -1
  }

  return right.count - left.count || left.text.localeCompare(right.text, 'es')
}

export function getCurrentLine(value) {
  const lines = String(value ?? '').split('\n')
  return lines[lines.length - 1] ?? ''
}

export function replaceCurrentLine(value, nextLine) {
  const lines = String(value ?? '').split('\n')
  lines[lines.length - 1] = nextLine
  return lines.join('\n')
}

function phraseMatchesQuery(phrase, normalizedQuery) {
  const normalizedText = normalizeName(phrase.text)

  if (normalizedText === normalizedQuery) {
    return false
  }

  if (!normalizedQuery) {
    return true
  }

  return normalizedText.includes(normalizedQuery)
}

export function filterSuggestions(phrases, fieldName, query, limit = 6) {
  const relatedFields = RELATED_FIELDS[fieldName] ?? []
  const normalizedQuery = normalizeName(query)
  const related = relatedFields.length
    ? phrases.filter((phrase) =>
        phrase.fields.some((field) => relatedFields.includes(field)),
      )
    : phrases
  const relatedMatches = related.filter((phrase) =>
    phraseMatchesQuery(phrase, normalizedQuery),
  )
  const used = new Set(relatedMatches.map((phrase) => normalizeName(phrase.text)))
  const extra =
    normalizedQuery && relatedMatches.length < limit
      ? phrases.filter((phrase) => {
          const key = normalizeName(phrase.text)
          return phraseMatchesQuery(phrase, normalizedQuery) && !used.has(key)
        })
      : []

  return [...relatedMatches, ...extra]
    .sort(comparePhrases)
    .slice(0, limit)
    .map((phrase) => phrase.text)
}
