import CDPlayer from './objects/CDPlayer'
import CD from './objects/CD'
import {
  Environment,
  AdaptiveDpr,
  OrbitControls,
  PerspectiveCamera,
} from '@react-three/drei'
import * as THREE from 'three'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import { useThree } from '@react-three/fiber'

function PostProcess() {
  return (
    <EffectComposer multisampling={8}>
      <Bloom
        intensity={1.5} // Controls the strength of the glow
        luminanceThreshold={0.9} // Glow starts on bright areas
        luminanceSmoothing={0.9} // Smooth transition of glow
        radius={0.5} // Size of the glow
      />
    </EffectComposer>
  )
}

function Scene() {
  const degreesToRadians = (degrees: number): number =>
    degrees * (Math.PI / 180)

  const { width: w, height: h } = useThree((state) => state.viewport)

  return (
    <>
        <AdaptiveDpr pixelated />
        <PostProcess />
        <Environment background environmentIntensity={0.2}>
          <mesh>
            <sphereGeometry args={[50, 100, 100]} />
            <meshBasicMaterial color={'white'} side={THREE.BackSide} />
          </mesh>
        </Environment>

        <PerspectiveCamera
          makeDefault
          position={[0, 7, 15]}
          rotation={[-0.3, 0, 0]}
        />

        <group scale={[w / 4, w / 4, w / 4]}>
            {/* Floor */}
            <mesh
            rotation={[-Math.PI / 2, 0, 0]}
            position={[0, -1, 0]}
            receiveShadow
            >
            <planeGeometry args={[30, 30]} />
            <shadowMaterial opacity={0.2} />
            </mesh>

            <CDPlayer position={[0, 0, 0]} scale={[5,5,5]} />
            <CD
            position={[-0.03, 0.48, 1]}
            rotation={[
                degreesToRadians(100),
                degreesToRadians(-29),
                degreesToRadians(40),
            ]}
            scale={[0.1, 0.1, 0.1]}
            />

            <ambientLight intensity={1} />
            <pointLight
            position={[5, 5, 5]}
            intensity={1}
            castShadow
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
            />
        </group>
    </>
  )
}

export default Scene
