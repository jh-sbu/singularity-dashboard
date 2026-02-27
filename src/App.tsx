import { useEffect } from 'react';
import { GameProvider, useGame } from './context/GameContext';
import type { GameAction } from './types/index';

function DebugView() {
  const { state, dispatch } = useGame();

  useEffect(() => {
    (window as unknown as { dispatch: React.Dispatch<GameAction> }).dispatch = dispatch;
  }, [dispatch]);

  return (
    <div style={{ fontFamily: 'monospace', padding: '1rem' }}>
      <p>RP: {state.researchPoints.toFixed(2)}</p>
      <p>Rate: {state.researchRate}/s</p>
      <p>Elapsed: {state.elapsedTime.toFixed(1)}s</p>
    </div>
  );
}

export default function App() {
  return <GameProvider><DebugView /></GameProvider>;
}
