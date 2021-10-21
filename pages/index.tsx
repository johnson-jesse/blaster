import type { NextPage } from 'next'
import React from 'react'
import Game from '../core/Game';
import Canvas2D from '../component/Canvas2D/Canvas2D';

const Home: NextPage = () => {
  const [ctx2d, setCtx2d] = React.useState();
  const [engine, setEngine] = React.useState<Game>();

  const handleContextReady = (ctx2d: any) => {
    setCtx2d(ctx2d);
    setEngine(new Game(ctx2d));
  }
  return (
    <div>
      <Canvas2D onContextReady={handleContextReady} width={600} height={600}/>
    </div>
  )
}

export default Home
