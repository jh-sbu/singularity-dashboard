import type { Scenario, Technology, TechCategory, EffectType, ResourceType } from '../types/index';

const VALID_CATEGORIES: TechCategory[] = [
  'algorithms', 'neural', 'agi', 'superintelligence', 'singularity',
  'automation', 'production', 'theoretical',
];

const VALID_EFFECT_TYPES: EffectType[] = [
  'add_research_rate', 'multiply_research_rate', 'add_production_rate', 'unlock_category',
];

const VALID_RESOURCE_TYPES: ResourceType[] = ['research', 'production', 'energy'];

function isValidCategory(value: unknown): value is TechCategory {
  return typeof value === 'string' && (VALID_CATEGORIES as string[]).includes(value);
}

function isValidEffectType(value: unknown): value is EffectType {
  return typeof value === 'string' && (VALID_EFFECT_TYPES as string[]).includes(value);
}

function isValidResourceType(value: unknown): value is ResourceType {
  return typeof value === 'string' && (VALID_RESOURCE_TYPES as string[]).includes(value);
}

function validateEffect(effect: unknown, techId: string, idx: number): string[] {
  const errors: string[] = [];
  if (typeof effect !== 'object' || effect === null) {
    errors.push(`Tech "${techId}" effect[${idx}] must be an object`);
    return errors;
  }
  const e = effect as Record<string, unknown>;
  if (!isValidEffectType(e['type'])) {
    errors.push(`Tech "${techId}" effect[${idx}].type "${String(e['type'])}" is not a valid EffectType`);
  }
  if (!isValidResourceType(e['target'])) {
    errors.push(`Tech "${techId}" effect[${idx}].target "${String(e['target'])}" is not a valid ResourceType`);
  }
  if (typeof e['value'] !== 'number') {
    errors.push(`Tech "${techId}" effect[${idx}].value must be a number`);
  }
  return errors;
}

function validateTechnology(tech: unknown, index: number, allIds: Set<string>): string[] {
  const errors: string[] = [];
  if (typeof tech !== 'object' || tech === null) {
    errors.push(`technologies[${index}] must be an object`);
    return errors;
  }
  const t = tech as Record<string, unknown>;
  const techId = typeof t['id'] === 'string' ? t['id'] : `<index ${index}>`;

  if (typeof t['id'] !== 'string' || t['id'].length === 0) {
    errors.push(`technologies[${index}].id must be a non-empty string`);
  }
  if (typeof t['name'] !== 'string') {
    errors.push(`Tech "${techId}" is missing field "name"`);
  }
  if (typeof t['description'] !== 'string') {
    errors.push(`Tech "${techId}" is missing field "description"`);
  }
  if (!isValidCategory(t['category'])) {
    errors.push(`Tech "${techId}".category "${String(t['category'])}" is not a valid TechCategory`);
  }
  if (typeof t['tier'] !== 'number' || !Number.isInteger(t['tier']) || t['tier'] < 0) {
    errors.push(`Tech "${techId}".tier must be a non-negative integer`);
  }
  if (typeof t['baseCost'] !== 'number' || t['baseCost'] <= 0) {
    errors.push(`Tech "${techId}".baseCost must be a positive number`);
  }
  if (!Array.isArray(t['prerequisites'])) {
    errors.push(`Tech "${techId}".prerequisites must be an array`);
  }
  if (!Array.isArray(t['effects'])) {
    errors.push(`Tech "${techId}".effects must be an array`);
  } else {
    (t['effects'] as unknown[]).forEach((effect, idx) => {
      errors.push(...validateEffect(effect, techId, idx));
    });
  }

  // Check prereq references — only possible if allIds is populated
  if (Array.isArray(t['prerequisites'])) {
    (t['prerequisites'] as unknown[]).forEach((prereqId, idx) => {
      if (typeof prereqId !== 'string') {
        errors.push(`Tech "${techId}".prerequisites[${idx}] must be a string`);
      } else if (!allIds.has(prereqId)) {
        errors.push(`Tech "${techId}".prerequisites[${idx}] references unknown tech "${prereqId}"`);
      }
    });
  }

  return errors;
}

function detectCycles(technologies: Technology[]): string[] {
  const errors: string[] = [];
  const graph = new Map<string, string[]>();
  for (const tech of technologies) {
    graph.set(tech.id, tech.prerequisites);
  }

  // 0 = unvisited, 1 = in stack, 2 = done
  const state = new Map<string, number>();
  const stack: string[] = [];

  function dfs(id: string): boolean {
    const s = state.get(id) ?? 0;
    if (s === 2) return false;
    if (s === 1) {
      const cycleStart = stack.indexOf(id);
      const cycle = stack.slice(cycleStart).join(' → ');
      errors.push(`Cycle detected: ${cycle} → ${id}`);
      return true;
    }

    state.set(id, 1);
    stack.push(id);
    for (const prereq of graph.get(id) ?? []) {
      dfs(prereq);
    }
    stack.pop();
    state.set(id, 2);
    return false;
  }

  for (const tech of technologies) {
    if ((state.get(tech.id) ?? 0) === 0) {
      dfs(tech.id);
    }
  }

  return errors;
}

export function validateScenarioJSON(
  raw: unknown
): { valid: true; scenario: Scenario } | { valid: false; errors: string[] } {
  const errors: string[] = [];

  if (typeof raw !== 'object' || raw === null) {
    return { valid: false, errors: ['Input must be a non-null object'] };
  }

  const obj = raw as Record<string, unknown>;

  // Top-level required fields
  if (typeof obj['id'] !== 'string' || obj['id'].length === 0) {
    errors.push('Scenario must have a non-empty string "id"');
  }
  if (typeof obj['name'] !== 'string') {
    errors.push('Scenario must have a string "name"');
  }
  if (typeof obj['description'] !== 'string') {
    errors.push('Scenario must have a string "description"');
  }
  if (typeof obj['startingResearchRate'] !== 'number') {
    errors.push('Scenario must have a number "startingResearchRate"');
  }
  if (typeof obj['startingResearchPoints'] !== 'number') {
    errors.push('Scenario must have a number "startingResearchPoints"');
  }
  if (!Array.isArray(obj['technologies'])) {
    errors.push('Scenario must have an array "technologies"');
    return { valid: false, errors };
  }
  if ((obj['technologies'] as unknown[]).length === 0) {
    errors.push('"technologies" must be a non-empty array');
    return { valid: false, errors };
  }

  // First pass: collect all IDs
  const allIds = new Set<string>();
  for (const tech of obj['technologies'] as unknown[]) {
    if (typeof tech === 'object' && tech !== null) {
      const id = (tech as Record<string, unknown>)['id'];
      if (typeof id === 'string' && id.length > 0) {
        allIds.add(id);
      }
    }
  }

  // Second pass: validate each technology
  (obj['technologies'] as unknown[]).forEach((tech, idx) => {
    errors.push(...validateTechnology(tech, idx, allIds));
  });

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  // DAG cycle check
  const cycleErrors = detectCycles(obj['technologies'] as Technology[]);
  if (cycleErrors.length > 0) {
    return { valid: false, errors: cycleErrors };
  }

  return { valid: true, scenario: raw as Scenario };
}
