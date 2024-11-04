import './App.css'
import { Canvas } from '@react-three/fiber'
import MyRoundedBox from './components/threejs/my_rounded_box'
import { Suspense } from 'react'
import { Environment } from '@react-three/drei'
import * as THREE from 'three'

function App() {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Canvas id="threejs-canvas" shadows>
        <Suspense fallback={null}>
          <Environment background>
            <mesh>
              <sphereGeometry args={[50,100,100]} />
              <meshBasicMaterial color={"cyan"} side={THREE.BackSide} />
            </mesh>
          </Environment>

          <ambientLight intensity={0.1} />
          <MyRoundedBox position={[0, 0, 1]}/>
          <MyRoundedBox position={[0, 0, 2]}/>
          <MyRoundedBox position={[1, 1, 1]}/>
          <MyRoundedBox position={[1, 1, 2]}/>
        </Suspense>
      </Canvas>
    </div>
  )
}

export default App
