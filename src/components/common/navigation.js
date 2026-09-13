export const VIEWS = {
  DASHBOARD: 'dashboard',
  RIVALS: 'rivals',
  MATCHES: 'matches',
  TOURNAMENT: 'tournament',
  TRAININGS: 'trainings',
}

const VIEW_TITLES = {
  [VIEWS.DASHBOARD]: 'Inicio',
  [VIEWS.RIVALS]: 'Rivales',
  [VIEWS.MATCHES]: 'Partidos',
  [VIEWS.TOURNAMENT]: 'Torneo',
  [VIEWS.TRAININGS]: 'Entrenar',
}

export function getViewTitle(view) {
  return VIEW_TITLES[view] ?? VIEW_TITLES[VIEWS.DASHBOARD]
}
