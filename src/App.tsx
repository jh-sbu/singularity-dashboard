import { useEffect } from 'react';
import type { Dispatch } from 'react';
import { GameProvider, useGame } from './context/GameContext';
import type { GameAction } from './types/index';
import { ScenarioSelector } from './components/ScenarioSelector';
import { StatsPanel } from './components/StatsPanel';

// Exposes dispatch on window for browser console debugging.
// window.dispatch({ type: 'UNLOCK_TECH', techId: 'basic_algorithms' })
function DebugDispatch() {
  const { dispatch } = useGame();
  useEffect(() => {
    (window as unknown as { dispatch: Dispatch<GameAction> }).dispatch = dispatch;
  }, [dispatch]);
  return null;
}

function AppShell() {
  return (
    <>
      <DebugDispatch />
      <div className="app-shell">
        <header className="app-header">
          <span style={{ fontWeight: 600, fontSize: '15px' }}>Singularity Dashboard</span>
          <ScenarioSelector />
        </header>
        <main className="app-main">
          <p className="techtree-placeholder">Tech Tree — Phase 3</p>
        </main>
        <aside className="app-sidebar">
          <StatsPanel />
        </aside>
      </div>
    </>
  );
}

export default function App() {
  return <GameProvider><AppShell /></GameProvider>;
}
