import type { ChangeEvent } from 'react';
import { useGame } from '../context/GameContext';
import { DEFAULT_SCENARIOS } from '../data/index';

export function ScenarioSelector() {
  const { state, dispatch } = useGame();

  function handleScenarioChange(event: ChangeEvent<HTMLSelectElement>) {
    const scenario = DEFAULT_SCENARIOS.find((s) => s.id === event.target.value);
    if (scenario) dispatch({ type: 'LOAD_SCENARIO', scenario });
  }

  function handleReset() {
    dispatch({ type: 'RESET' });
  }

  return (
    <div className="scenario-selector">
      <span className="scenario-selector__label">Scenario</span>
      <div className="scenario-selector__row">
        <select
          className="scenario-selector__select"
          value={state.scenario.id}
          onChange={handleScenarioChange}
        >
          {DEFAULT_SCENARIOS.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
        <button className="btn btn--ghost" onClick={handleReset}>Reset</button>
      </div>
    </div>
  );
}
