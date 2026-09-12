import { useMatches } from './useMatches'
import { useRivals } from './useRivals'
import { collectStrategyPhrases } from '../utils/suggestions'

export function useStrategySuggestions() {
  const { rivals } = useRivals()
  const { matches } = useMatches()

  return collectStrategyPhrases(rivals, matches)
}
