import { useParams } from 'react-router-dom';
import { useState } from 'react';
import Memory from './Memory';
import Blitz from './Blitz';
import Ahorcado from './Ahorcado';
import Satzbau from './Satzbau';
import Hoeren from './Hoeren';
import Konjugation from './Konjugation';
import Wortregen from './Wortregen';
import { BackLink } from '../../components/ui';

const MAP: Record<string, (p: { onRestart: () => void }) => React.JSX.Element> = {
  memory: Memory,
  blitz: Blitz,
  ahorcado: Ahorcado,
  satzbau: Satzbau,
  hoeren: Hoeren,
  konjugation: Konjugation,
  wortregen: Wortregen,
};

export default function GamePage() {
  const { game = '' } = useParams();
  const [round, setRound] = useState(0);
  const Comp = MAP[game];
  if (!Comp) return <BackLink to="/spiele" />;
  return <Comp key={round} onRestart={() => setRound((r) => r + 1)} />;
}
