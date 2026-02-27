import { createContext, useContext, useEffect, useReducer, useRef } from 'react';
import type { ReactNode } from 'react';
import type { GameState, GameAction } from '../types/index';
import { gameReducer, makeInitialState } from '../engine/gameReducer';
import { singularityScenario } from '../data/scenarios/singularity';

interface GameContextValue {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
}

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(
    gameReducer,
    undefined,
    () => makeInitialState(singularityScenario)
  );

  const dispatchRef = useRef(dispatch);
  dispatchRef.current = dispatch;

  useEffect(() => {
    let lastTime = performance.now();
    const id = setInterval(() => {
      const now = performance.now();
      dispatchRef.current({ type: 'TICK', deltaMs: now - lastTime });
      lastTime = now;
    }, 100);
    return () => clearInterval(id);
  }, []);

  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame(): GameContextValue {
  const ctx = useContext(GameContext);
  if (!ctx) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return ctx;
}
