import { useGameStore } from '@/store/gameStore';
import Lobby from '@/components/Lobby';
import Game from '@/components/Game';
import { Toaster } from '@/components/ui/sonner';

function App() {
  const { gameState } = useGameStore();
  
  return (
    <>
      {gameState?.status === 'playing' ? (
        <Game />
      ) : (
        <Lobby />
      )}
      <Toaster position="top-center" />
    </>
  );
}

export default App;
