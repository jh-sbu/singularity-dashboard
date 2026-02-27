import type { GameState, TechStatus, Technology } from '../types/index';

export function getTechStatus(state: GameState, techId: string): TechStatus {
  if (state.unlockedTechs.has(techId)) {
    return 'unlocked';
  }

  const tech = state.scenario.technologies.find((t) => t.id === techId);
  if (!tech) {
    return 'locked';
  }

  if (tech.decorative) {
    return 'locked';
  }

  const allPrereqsMet = tech.prerequisites.every((prereqId) =>
    state.unlockedTechs.has(prereqId)
  );

  return allPrereqsMet ? 'available' : 'locked';
}

export function getAvailableTechs(state: GameState): Technology[] {
  return state.scenario.technologies.filter(
    (tech) => getTechStatus(state, tech.id) === 'available'
  );
}
