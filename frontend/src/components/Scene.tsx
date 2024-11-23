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
import { clamp } from 'three/src/math/MathUtils.js'
import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import gsap from 'gsap'

const cameraPositions: Record<string, THREE.Vector3> = {
  home: new THREE.Vector3(0, 0, 10),
  about: new THREE.Vector3(10, 5, 10),
  contact: new THREE.Vector3(-10, 5, 10),
}

function PostProcess() {
  return (
    <EffectComposer multisampling={8}>
      <Bloom
        intensity={1.5}
        luminanceThreshold={0.9}
        luminanceSmoothing={0.9}
        radius={0.5}
      />
    </EffectComposer>
  )
}

function Scene() {
  const cameraRef = useRef<THREE.PerspectiveCamera>(null!)
  const location = useLocation()

  useEffect(() => {
    const targetPosition =
      cameraPositions[location.pathname.slice(1)] || cameraPositions.home

    if (cameraRef.current) {
      gsap.to(cameraRef.current.position, {
        x: targetPosition.x,
        y: targetPosition.y,
        z: targetPosition.z,
        duration: 1.5,
        ease: 'power3.inOut',
      })
    }
  }, [location])

  const degreesToRadians = (degrees: number): number =>
    degrees * (Math.PI / 180)

  const { width: w, height: h } = useThree(state => state.viewport)
  const sceneScale = clamp(w / 6, 2, 5)

  return (
    <>
      <AdaptiveDpr pixelated />
      <PostProcess />
      <Environment background environmentIntensity={0.05}>
        <mesh>
          <sphereGeometry args={[50, 100, 100]} />
          <meshBasicMaterial color={'white'} side={THREE.BackSide} />
        </mesh>
      </Environment>

      <PerspectiveCamera makeDefault position={[0, 3, 10]} />
      <ambientLight intensity={1.2} />
      <spotLight
        position={[0, 8, 12]}
        intensity={120}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />

      <group scale={sceneScale}>
        {/* Floor */}
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, -1.2, 0]}
          castShadow
          receiveShadow
        >
          <planeGeometry args={[40, 20]} />
        </mesh>

        <CDPlayer position={[0, -0.3, 0.5]} scale={[5, 5, 5]} />
        <CD
          position={[-0.03, 0, 1.3]}
          rotation={[
            degreesToRadians(100),
            degreesToRadians(-29),
            degreesToRadians(40),
          ]}
          scale={[0.1, 0.1, 0.1]}
        />
      </group>
    </>
  )
}

export default Scene
