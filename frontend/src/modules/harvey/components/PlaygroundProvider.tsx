import { PlaygroundContext } from '../context/playgroundContext';

interface Props {
  playground: boolean;
  children: React.ReactNode;
}

function PlaygroundProvider({ playground, children }: Props) {
  return <PlaygroundContext.Provider value={playground}>{children}</PlaygroundContext.Provider>;
}

export default PlaygroundProvider;
