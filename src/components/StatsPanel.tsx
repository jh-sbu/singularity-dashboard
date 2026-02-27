import { useGame } from '../context/GameContext';
import { formatRP, formatRate, formatElapsed } from '../utils/format';

export function StatsPanel() {
  const { state } = useGame();

  return (
    <div className="stats-panel">
      <span className="stats-panel__title">Statistics</span>
      <div className="stat-row">
        <span className="stat-row__label">Research Points</span>
        <span className="stat-row__value stat-row__value--accent">
          {formatRP(state.researchPoints)}
        </span>
      </div>
      <div className="stat-row">
        <span className="stat-row__label">Research Rate</span>
        <span className="stat-row__value stat-row__value--success">
          {formatRate(state.researchRate)}
        </span>
      </div>
      <div className="stat-row">
        <span className="stat-row__label">Elapsed Time</span>
        <span className="stat-row__value">
          {formatElapsed(state.elapsedTime)}
        </span>
      </div>
    </div>
  );
}
