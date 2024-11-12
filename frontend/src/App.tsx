import './App.css'
import { Canvas } from '@react-three/fiber'
import Scene from './components/Scene'
import { Suspense } from 'react'
import { Overlay } from './components/Overlay'

function App() {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Canvas id='threejs-canvas' shadows>
        <Suspense>
          <Scene />
        </Suspense>
      </Canvas>
      <Overlay />
    </div>
  )
}

export default App
