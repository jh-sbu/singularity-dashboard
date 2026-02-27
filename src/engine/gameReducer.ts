import type { GameState, GameAction, Scenario } from '../types/index';

export function computeResearchRate(
  scenario: Scenario,
  unlockedTechs: ReadonlySet<string>
): number {
  let rate = scenario.startingResearchRate;

  // Sum all additive effects first
  for (const tech of scenario.technologies) {
    if (!unlockedTechs.has(tech.id)) continue;
    for (const effect of tech.effects) {
      if (effect.type === 'add_research_rate' && effect.target === 'research') {
        rate += effect.value;
      }
    }
  }

  // Apply all multiplicative effects sequentially
  for (const tech of scenario.technologies) {
    if (!unlockedTechs.has(tech.id)) continue;
    for (const effect of tech.effects) {
      if (effect.type === 'multiply_research_rate' && effect.target === 'research') {
        rate *= effect.value;
      }
    }
  }

  return rate;
}

export function makeInitialState(scenario: Scenario): GameState {
  return {
    scenario,
    researchPoints: scenario.startingResearchPoints,
    researchRate: scenario.startingResearchRate,
    unlockedTechs: new Set<string>(),
    elapsedTime: 0,
    lastSampleTime: 0,
    rateHistory: [],
  };
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'TICK': {
      const deltaSeconds = action.deltaMs / 1000;
      const newRp = state.researchPoints + state.researchRate * deltaSeconds;
      const newElapsed = state.elapsedTime + deltaSeconds;

      const newHistory = [...state.rateHistory];
      let newLastSampleTime = state.lastSampleTime;

      if (newElapsed - state.lastSampleTime >= 1) {
        newHistory.push({ elapsedSeconds: newElapsed, researchRate: state.researchRate });
        newLastSampleTime = newElapsed;
      }

      return {
        ...state,
        researchPoints: newRp,
        elapsedTime: newElapsed,
        lastSampleTime: newLastSampleTime,
        rateHistory: newHistory,
      };
    }

    case 'UNLOCK_TECH': {
      const tech = state.scenario.technologies.find((t) => t.id === action.techId);
      if (!tech) return state;

      // Guard: decorative techs cannot be unlocked
      if (tech.decorative) return state;

      // Guard: insufficient RP
      if (state.researchPoints < tech.baseCost) return state;

      // Guard: prerequisites not met
      const prereqsMet = tech.prerequisites.every((prereqId) =>
        state.unlockedTechs.has(prereqId)
      );
      if (!prereqsMet) return state;

      const newUnlocked = new Set(state.unlockedTechs);
      newUnlocked.add(action.techId);

      const newRate = computeResearchRate(state.scenario, newUnlocked);

      return {
        ...state,
        researchPoints: state.researchPoints - tech.baseCost,
        unlockedTechs: newUnlocked,
        researchRate: newRate,
      };
    }

    case 'LOAD_SCENARIO': {
      return makeInitialState(action.scenario);
    }

    case 'RESET': {
      return makeInitialState(state.scenario);
    }

    default: {
      return state;
    }
  }
}
