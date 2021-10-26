import type { NextPage } from 'next'
import React from 'react'
import Game from '../core/Game';
import Canvas2D from '../component/Canvas2D/Canvas2D';

const Home: NextPage = () => {
  const [engine, setEngine] = React.useState<Game>();

  const handleContextReady = (ctx2d: HTMLCanvasElement) => {
    setEngine(new Game(ctx2d));
  }
  return (
    <div className='min-h-screen flex flex-col justify-center items-center'>
      <div className='-mt-10 mb-10 text-5xl' style={{ fontFamily: 'Atari Classic Int' }}>Blaster!</div>
      <Canvas2D onContextReady={handleContextReady} width={600} height={600}/>
    </div>
  )
}

export default Home
