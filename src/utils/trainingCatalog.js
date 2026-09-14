import { DRILL_ACTION, DRILL_ACTOR, TRAINING_DRILL_KIND } from './constants'
import { createTraining } from './dataModels'
import { TRAINING_ZONES as Z } from './trainingZones'

const A = DRILL_ACTOR.A
const B = DRILL_ACTOR.B

function step(actor, action, zoneId, label) {
  return { actor, action, zoneId, label }
}

export const GRUPO_ROJO_TRAINING_ID = 'catalog-grupo-rojo'

export function createGrupoRojoTraining() {
  return createTraining({
    id: GRUPO_ROJO_TRAINING_ID,
    name: 'Grupo Rojo',
    groupName: 'Grupo Rojo',
    isCatalog: true,
    players: [
      'Boada L',
      'Boada M',
      'Diaz Andres',
      'Bentancourt',
      'Crocco',
      'Aquino',
      'Maza',
      'Huang Juan',
      'Aguirre J',
      'Akizawa',
      'Cericola.I',
    ],
    notes: 'Calentamiento articular antes de cada entrenamiento.',
    rotation: '2 ejercicios de continuidad y 2 de saque por turno.',
    drillDurationLabel: '8 minutos cada uno',
    drills: [
      {
        id: 'grupo-rojo-warmup-articular',
        kind: TRAINING_DRILL_KIND.WARMUP,
        title: 'Calentamiento articular',
        durationLabel: 'Antes de cada entrenamiento',
        description: 'Movilidad de hombros, muñecas, cadera y tobillos antes de subir a la mesa.',
        steps: [],
      },
      {
        id: 'grupo-rojo-warmup-flat',
        kind: TRAINING_DRILL_KIND.WARMUP,
        section: 'Calentamiento en mesa',
        title: 'Plano de drive',
        durationLabel: '2:30',
        description: 'Intercambio plano de drive. 2 minutos 30.',
        steps: [
          step(A, DRILL_ACTION.FLAT, Z.B_LONG_FH, 'Plano de drive'),
          step(B, DRILL_ACTION.BLOCK, Z.A_LONG_FH, 'Devuelve al drive'),
        ],
      },
      {
        id: 'grupo-rojo-warmup-flat-bh',
        kind: TRAINING_DRILL_KIND.WARMUP,
        section: 'Calentamiento en mesa',
        title: 'Plano de revés',
        durationLabel: '2:30',
        description: 'Intercambio plano de revés. 2 minutos 30.',
        steps: [
          step(A, DRILL_ACTION.FLAT, Z.B_LONG_BH, 'Plano de revés'),
          step(B, DRILL_ACTION.BLOCK, Z.A_LONG_BH, 'Devuelve al revés'),
        ],
      },
      {
        id: 'grupo-rojo-warmup-top',
        kind: TRAINING_DRILL_KIND.WARMUP,
        section: 'Calentamiento en mesa',
        title: 'Top de drive',
        durationLabel: '5 min',
        description: 'Topspin de drive. 5 minutos.',
        steps: [
          step(A, DRILL_ACTION.TOP, Z.B_LONG_FH, 'Top de drive'),
          step(B, DRILL_ACTION.BLOCK, Z.A_LONG_FH, 'Bloquea al drive'),
        ],
      },
      {
        id: 'grupo-rojo-warmup-top-bh',
        kind: TRAINING_DRILL_KIND.WARMUP,
        section: 'Calentamiento en mesa',
        title: 'Top de revés',
        durationLabel: '5 min',
        description: 'Topspin de revés. 5 minutos.',
        steps: [
          step(A, DRILL_ACTION.TOP, Z.B_LONG_BH, 'Top de revés'),
          step(B, DRILL_ACTION.BLOCK, Z.A_LONG_BH, 'Bloquea al revés'),
        ],
      },
      {
        id: 'grupo-rojo-warmup-chop',
        kind: TRAINING_DRILL_KIND.WARMUP,
        section: 'Calentamiento en mesa',
        title: 'Corte cruzado',
        durationLabel: '5 min',
        description: 'Corte o push cruzado, de revés a revés.',
        steps: [
          step(A, DRILL_ACTION.CHOP, Z.B_LONG_BH, 'Corte cruzado al revés'),
          step(B, DRILL_ACTION.CHOP, Z.A_LONG_BH, 'Corte cruzado de vuelta'),
        ],
      },
      {
        id: 'grupo-rojo-continuous-drive-bh',
        kind: TRAINING_DRILL_KIND.CONTINUOUS,
        title: 'Libre de drive al revés',
        durationLabel: '8 min',
        description: 'A ataca de drive al revés del bloqueador. B bloquea de vuelta al drive.',
        steps: [
          step(A, DRILL_ACTION.DRIVE, Z.B_LONG_BH, 'Drive al revés de B'),
          step(B, DRILL_ACTION.BLOCK, Z.A_LONG_FH, 'Bloquea al drive de A'),
        ],
      },
      {
        id: 'grupo-rojo-continuous-1-1',
        kind: TRAINING_DRILL_KIND.CONTINUOUS,
        title: 'Revés y drive (1 y 1)',
        durationLabel: '8 min',
        description: 'Un revés y un drive. B bloquea cada pelota al mismo lado.',
        steps: [
          step(A, DRILL_ACTION.BACKHAND, Z.B_LONG_BH, 'Revés cruzado'),
          step(B, DRILL_ACTION.BLOCK, Z.A_LONG_BH, 'Bloquea al revés'),
          step(A, DRILL_ACTION.DRIVE, Z.B_LONG_FH, 'Drive cruzado'),
          step(B, DRILL_ACTION.BLOCK, Z.A_LONG_FH, 'Bloquea al drive'),
        ],
      },
      {
        id: 'grupo-rojo-continuous-four',
        kind: TRAINING_DRILL_KIND.CONTINUOUS,
        title: 'Revés, medio, revés y punta',
        durationLabel: '8 min',
        description:
          'B alimenta: revés, medio de drive, revés y punta de drive. A cubre las cuatro zonas.',
        steps: [
          step(B, DRILL_ACTION.BLOCK, Z.A_LONG_BH, 'Al revés de A'),
          step(A, DRILL_ACTION.BACKHAND, Z.B_LONG_BH, 'Revés'),
          step(B, DRILL_ACTION.BLOCK, Z.A_LONG_MID, 'Al medio de drive'),
          step(A, DRILL_ACTION.DRIVE, Z.B_LONG_MID, 'Drive al medio'),
          step(B, DRILL_ACTION.BLOCK, Z.A_LONG_BH, 'Otra vez al revés'),
          step(A, DRILL_ACTION.BACKHAND, Z.B_LONG_BH, 'Revés'),
          step(B, DRILL_ACTION.BLOCK, Z.A_LONG_FH, 'A la punta de drive'),
          step(A, DRILL_ACTION.DRIVE, Z.B_LONG_FH, 'Drive a la punta'),
        ],
      },
      {
        id: 'grupo-rojo-serve-bh-open',
        kind: TRAINING_DRILL_KIND.SERVE,
        title: 'Corto, larga de revés y paralelo',
        durationLabel: '8 min',
        description:
          'Saque corto, recepción larga y salida de revés. Bloquean plano de revés al mismo lugar. Abre el que saca paralelo y punto libre.',
        steps: [
          step(A, DRILL_ACTION.SERVE, Z.B_SHORT_MID, 'Saque corto'),
          step(B, DRILL_ACTION.RECEIVE, Z.A_LONG_BH, 'Recepción larga al revés'),
          step(A, DRILL_ACTION.BLOCK, Z.B_LONG_BH, 'Bloqueo plano al revés'),
          step(B, DRILL_ACTION.BLOCK, Z.A_LONG_BH, 'Bloqueo al mismo lugar'),
          step(A, DRILL_ACTION.DRIVE, Z.B_LONG_FH, 'Abre paralelo'),
          step(A, DRILL_ACTION.FREE, '', 'Punto libre'),
        ],
      },
      {
        id: 'grupo-rojo-serve-fh-cross',
        kind: TRAINING_DRILL_KIND.SERVE,
        title: 'Corto, larga de drive y 2 tops',
        durationLabel: '8 min',
        description:
          'Saque corto, recepción al drive larga. Salen de drive cruzado, bloquean de drive cruzado, 2 top paralelos y liberan el punto.',
        steps: [
          step(A, DRILL_ACTION.SERVE, Z.B_SHORT_MID, 'Saque corto'),
          step(B, DRILL_ACTION.RECEIVE, Z.A_LONG_FH, 'Recepción larga al drive'),
          step(A, DRILL_ACTION.DRIVE, Z.B_LONG_FH, 'Salida de drive cruzado'),
          step(B, DRILL_ACTION.BLOCK, Z.A_LONG_FH, 'Bloqueo de drive cruzado'),
          step(A, DRILL_ACTION.TOP, Z.B_LONG_BH, 'Top paralelo'),
          step(B, DRILL_ACTION.BLOCK, Z.A_LONG_FH, 'Devuelve para el segundo top'),
          step(A, DRILL_ACTION.TOP, Z.B_LONG_BH, 'Segundo top paralelo'),
          step(A, DRILL_ACTION.FREE, '', 'Punto libre'),
        ],
      },
      {
        id: 'grupo-rojo-serve-pivot',
        kind: TRAINING_DRILL_KIND.SERVE,
        title: 'Corto, larga de revés y pívot',
        durationLabel: '8 min',
        description:
          'Saque libre corto, recepción larga al revés, pívot de drive libre y punto libre.',
        steps: [
          step(A, DRILL_ACTION.SERVE, Z.B_SHORT_BH, 'Saque corto libre'),
          step(B, DRILL_ACTION.RECEIVE, Z.A_LONG_BH, 'Recepción larga al revés'),
          step(A, DRILL_ACTION.PIVOT, Z.B_LONG_MID, 'Pívot de drive libre'),
          step(A, DRILL_ACTION.FREE, '', 'Punto libre'),
        ],
      },
      {
        id: 'grupo-rojo-serve-long-bh',
        kind: TRAINING_DRILL_KIND.SERVE,
        title: 'Largo al revés y ataque',
        durationLabel: '8 min',
        description:
          'Saque largo al revés. Salida de drive (pívot) o de revés. Atacan al revés y punto libre.',
        steps: [
          step(A, DRILL_ACTION.SERVE, Z.B_LONG_BH, 'Saque largo al revés'),
          step(B, DRILL_ACTION.PIVOT, Z.A_LONG_BH, 'Salida de pívot o revés'),
          step(A, DRILL_ACTION.DRIVE, Z.B_LONG_BH, 'Atacan al revés'),
          step(A, DRILL_ACTION.FREE, '', 'Punto libre'),
        ],
      },
    ],
  })
}

export function getCatalogTrainings() {
  return [createGrupoRojoTraining()]
}
