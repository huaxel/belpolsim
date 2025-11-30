import { useState } from 'react';
import { MainMenu } from './components/MainMenu';
import { GameView } from './components/GameView';

const App = () => {
  const [view, setView] = useState<'menu' | 'game'>('menu');
  const [shouldLoad, setShouldLoad] = useState(false);

  const handleNewGame = () => {
    setShouldLoad(false);
    setView('game');
  };

  const handleLoadGame = () => {
    setShouldLoad(true);
    setView('game');
  };

  const handleExit = () => {
    setView('menu');
  };

  return (
    <>
      {view === 'menu' ? (
        <MainMenu onNewGame={handleNewGame} onLoadGame={handleLoadGame} />
      ) : (
        <GameView shouldLoad={shouldLoad} onExit={handleExit} />
      )}
    </>
  );
};

export default App;
