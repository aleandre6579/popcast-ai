import './App.css'
import { Canvas } from '@react-three/fiber'
import CDPlayer from './components/objects/CDPlayer'
import CD from './components/objects/CD'
import { Suspense } from 'react'
import { Environment, AdaptiveDpr, OrbitControls } from '@react-three/drei'
import * as THREE from 'three'

function App() {
  const degreesToRadians = (degrees: number): number => degrees * (Math.PI / 180)

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Canvas id='threejs-canvas' shadows>
        <AdaptiveDpr pixelated />
        <Suspense fallback={null}>
          <OrbitControls />
          <ambientLight intensity={1} />
          <Environment background environmentIntensity={0.2}>
            <mesh>
              <sphereGeometry args={[50, 100, 100]} />
              <meshBasicMaterial color={'white'} side={THREE.BackSide} />
            </mesh>
          </Environment>

          {/* Floor */}
          <mesh
            rotation={[-Math.PI / 2, 0, 0]}
            position={[0, -1, 0]}
            receiveShadow
          >
            <planeGeometry args={[30, 30]} />
            <shadowMaterial opacity={0.2} />
          </mesh>

          <CDPlayer scale={[10, 10, 10]} />
          <CD
            position={[-0.03, 0.48, 1]}
            rotation={[
              degreesToRadians(100),
              degreesToRadians(-29),
              degreesToRadians(40),
            ]}
            scale={[0.3, 0.3, 0.3]}
          />

          <pointLight
            position={[5, 5, 5]}
            intensity={1}
            castShadow
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
          />
        </Suspense>
      </Canvas>
    </div>
  )
}

export default App
