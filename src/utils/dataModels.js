import {
  BUILD,
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
} from './constants'

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
