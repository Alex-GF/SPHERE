import { useContext } from 'react';
import { PlaygroundContext } from '../context/playgroundContext';

function usePlayground() {
  const value = useContext(PlaygroundContext);

  if (value === null) {
    throw new Error('usePlayground must be used within PlaygroundProvider');
  }

  return value;
}

export default usePlayground