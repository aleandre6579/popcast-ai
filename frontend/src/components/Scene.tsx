import Room from './objects/Room'
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
import {
  BlurPass,
  Resizer,
  KernelSize,
  Resolution,
  MipmapBlurPass,
} from 'postprocessing'
import { useFrame, useThree } from '@react-three/fiber'
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
    <EffectComposer multisampling={0} stencilBuffer={false}>
      <Bloom
        luminanceThreshold={10}
        luminanceSmoothing={0.025}
        intensity={1}
        resolutionX={300}
        resolutionY={300}
        kernelSize={KernelSize.LARGE}
        mipmapBlurPass={undefined}
      />
    </EffectComposer>
  )
}

function Scene() {
  const cameraRef = useRef<THREE.PerspectiveCamera>(null!)
  const location = useLocation()

  const degreesToRadians = (degrees: number): number =>
    degrees * (Math.PI / 180)

  return (
    <>
      <AdaptiveDpr pixelated />
      <PostProcess />
      <OrbitControls />
      <PerspectiveCamera 
        makeDefault 
        position={[0, 1, 4]}
        rotation={[-Math.atan2(5, 5), Math.PI / 2, 0]}
      />
      <ambientLight intensity={0.35} />
      <pointLight
        position={[-0.5, 3, 1]}
        decay={1.2}
        distance={20}
        intensity={12}
        castShadow
      />

      <group>
        <Room position={[0,0,0]} scale={[2,2,2]} />
        <CDPlayer position={[0, 0, 0]} scale={[5, 5, 5]} />
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
