import type { Scenario } from '../types/index';
import { singularityScenario } from './scenarios/singularity';
import { noSingularityScenario } from './scenarios/noSingularity';

export { singularityScenario };
export { noSingularityScenario };
export const DEFAULT_SCENARIOS: Scenario[] = [singularityScenario, noSingularityScenario];
