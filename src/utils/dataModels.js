import {
  BUILD,
  DRILL_ACTION,
  DRILL_ACTOR,
  GRIP,
  HAND,
  HEIGHT,
  MATCH_KIND,
  MATCH_RESULT,
  MOBILITY,
  PLAY_STYLE,
  RHYTHM,
  RUBBER,
  TOURNAMENT_STATUS,
  TRAINING_DRILL_KIND,
} from './constants'
import { parseZoneId, sanitizeZoneIds } from './tableZones'

export function createId() {
  return crypto.randomUUID()
}

export function createPreMatchStrategy(overrides = {}) {
  return {
    serves: '',
    receive: '',
    effectsAndRhythm: '',
    tablePlacement: '',
    targetAreas: '',
    thingsToDo: '',
    thingsToAvoid: '',
    mainObjective: '',
    ...overrides,
    targetZones: sanitizeZoneIds(overrides.targetZones),
  }
}

export function createPostMatchAnalysis(overrides = {}) {
  return {
    whatWorked: '',
    whatDidNotWork: '',
    opponentWeaknessesDiscovered: '',
    myMistakes: '',
    advice: '',
    notes: '',
    ...overrides,
  }
}

export function createDuringMatchNotes(overrides = {}) {
  return {
    whatIsWorking: '',
    whatToChange: '',
    notes: '',
    ...overrides,
  }
}

export function createMatchSet(overrides = {}) {
  return {
    playerScore: 0,
    opponentScore: 0,
    notes: '',
    ...overrides,
  }
}

export function createTeammate(overrides = {}) {
  return {
    id: createId(),
    name: '',
    club: '',
    notes: '',
    ...overrides,
  }
}

export function createRival(overrides = {}) {
  return {
    id: createId(),
    name: '',
    club: '',
    height: HEIGHT.UNKNOWN,
    build: BUILD.UNKNOWN,
    mobility: MOBILITY.UNKNOWN,
    hand: HAND.UNKNOWN,
    grip: GRIP.SHAKEHAND,
    forehandRubber: RUBBER.INVERTED,
    backhandRubber: RUBBER.INVERTED,
    forehandRubberBrand: '',
    forehandRubberModel: '',
    backhandRubberBrand: '',
    backhandRubberModel: '',
    blade: '',
    mainStrength: PLAY_STYLE.UNKNOWN,
    preferredRhythm: RHYTHM.UNKNOWN,
    distanceFromTable: '',
    mainStrengthDescription: '',
    mainWeaknessDescription: '',
    preferredServe: '',
    problematicReceive: '',
    preferredBall: '',
    thingsToDo: '',
    thingsToAvoid: '',
    mainObjective: '',
    generalNotes: '',
    ...overrides,
    targetZones: sanitizeZoneIds(overrides.targetZones),
  }
}

export function createMatch(overrides = {}) {
  const { preMatchStrategy, duringMatchNotes, postMatchAnalysis, sets, ...rest } =
    overrides

  return {
    id: createId(),
    kind: MATCH_KIND.OWN,
    tournamentId: null,
    rivalId: null,
    teammateId: null,
    date: new Date().toISOString(),
    result: MATCH_RESULT.UNKNOWN,
    sets: Array.isArray(sets) ? sets.map((set) => createMatchSet(set)) : [],
    score: '',
    preMatchStrategy: createPreMatchStrategy(preMatchStrategy),
    duringMatchNotes: createDuringMatchNotes(duringMatchNotes),
    postMatchAnalysis: createPostMatchAnalysis(postMatchAnalysis),
    notes: '',
    ...rest,
  }
}

export function createPdfMeta(overrides = {}) {
  return {
    fileName: '',
    size: 0,
    ...overrides,
  }
}

export function createExtractedTexts(overrides = {}) {
  return {
    ranking: '',
    groups: '',
    tables: '',
    ...overrides,
  }
}

export function createPlayerRef(overrides = {}) {
  return {
    name: '',
    club: '',
    ...overrides,
  }
}

export function createRankingEntry(overrides = {}) {
  return {
    position: null,
    name: '',
    club: '',
    points: null,
    ratingChange: null,
    licenseId: '',
    category: '',
    ...overrides,
  }
}

export function createTournamentGroup(overrides = {}) {
  return {
    name: '',
    category: '',
    zona: '',
    players: [],
    ...overrides,
  }
}

export function createScheduleEntry(overrides = {}) {
  return {
    time: '',
    table: '',
    playerA: '',
    playerB: '',
    category: '',
    zona: '',
    stage: '',
    day: '',
    ...overrides,
  }
}

export function createFixtureMatch(overrides = {}) {
  return {
    id: createId(),
    time: '',
    opponent: '',
    table: '',
    group: '',
    matchId: null,
    ...overrides,
  }
}

export function createPlayerProfile(overrides = {}) {
  return {
    id: createId(),
    name: '',
    club: '',
    ...overrides,
  }
}

function sanitizePlayers(value) {
  if (!Array.isArray(value)) {
    return []
  }

  return value.map((name) => String(name).trim()).filter(Boolean)
}

function isValidEnum(value, allowed) {
  return Object.values(allowed).includes(value)
}

export function createDrillStep(overrides = {}) {
  const zoneId = parseZoneId(overrides.zoneId) ? overrides.zoneId : ''

  return {
    actor: isValidEnum(overrides.actor, DRILL_ACTOR)
      ? overrides.actor
      : DRILL_ACTOR.A,
    action: isValidEnum(overrides.action, DRILL_ACTION)
      ? overrides.action
      : DRILL_ACTION.DRIVE,
    zoneId,
    label: typeof overrides.label === 'string' ? overrides.label : '',
  }
}

export function createTrainingDrill(overrides = {}) {
  const { steps, kind, ...rest } = overrides

  return {
    id: createId(),
    kind: isValidEnum(kind, TRAINING_DRILL_KIND)
      ? kind
      : TRAINING_DRILL_KIND.CONTINUOUS,
    title: '',
    durationLabel: '',
    description: '',
    ...rest,
    steps: Array.isArray(steps) ? steps.map((step) => createDrillStep(step)) : [],
  }
}

export function createTraining(overrides = {}) {
  const { drills, players, ...rest } = overrides

  return {
    id: createId(),
    name: '',
    groupName: '',
    notes: '',
    rotation: '',
    drillDurationLabel: '',
    isCatalog: false,
    ...rest,
    players: sanitizePlayers(players),
    drills: Array.isArray(drills)
      ? drills.map((drill) => createTrainingDrill(drill))
      : [],
  }
}

export function createTournament(overrides = {}) {
  const { extractedTexts, ...rest } = overrides

  return {
    id: createId(),
    name: '',
    date: '',
    category: '',
    playerName: '',
    status: TOURNAMENT_STATUS.DRAFT,
    rankingPdf: null,
    groupsPdf: null,
    tablesPdf: null,
    extractedTexts: createExtractedTexts(extractedTexts),
    parseWarnings: [],
    players: [],
    ranking: [],
    groups: [],
    matches: [],
    tables: [],
    schedule: [],
    fixture: [],
    ...rest,
  }
}
