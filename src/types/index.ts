export type EffectType =
  | 'add_research_rate'
  | 'multiply_research_rate'
  | 'add_production_rate'
  | 'unlock_category';

export type ResourceType = 'research' | 'production' | 'energy';

export type TechCategory =
  | 'algorithms'
  | 'neural'
  | 'agi'
  | 'superintelligence'
  | 'singularity'
  | 'automation'
  | 'production'
  | 'theoretical';

export type TechStatus = 'locked' | 'available' | 'unlocked';

export interface TechEffect {
  type: EffectType;
  target: ResourceType;
  value: number;
}

export interface Technology {
  id: string;
  name: string;
  description: string;
  category: TechCategory;
  tier: number;
  baseCost: number;
  prerequisites: string[];
  effects: TechEffect[];
  decorative?: boolean;
}

export interface Scenario {
  id: string;
  name: string;
  description: string;
  technologies: Technology[];
  startingResearchRate: number;
  startingResearchPoints: number;
}

export interface RateHistorySample {
  elapsedSeconds: number;
  researchRate: number;
}

export interface GameState {
  scenario: Scenario;
  researchPoints: number;
  researchRate: number;
  unlockedTechs: ReadonlySet<string>;
  elapsedTime: number;
  lastSampleTime: number;
  rateHistory: RateHistorySample[];
}

export type GameAction =
  | { type: 'TICK'; deltaMs: number }
  | { type: 'UNLOCK_TECH'; techId: string }
  | { type: 'LOAD_SCENARIO'; scenario: Scenario }
  | { type: 'RESET' };

export interface NodeLayout {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}
