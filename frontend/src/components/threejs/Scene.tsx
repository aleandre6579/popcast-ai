import Room from './Room'
import CDPlayer from './cdplayer/CDPlayer'
import CD from './CD'
import {
  Environment,
  AdaptiveDpr,
  OrbitControls,
  PerspectiveCamera,
  Text,
} from '@react-three/drei'
import * as THREE from 'three'
import { EffectComposer, Bloom, Outline } from '@react-three/postprocessing'
import {
  BlurPass,
  Resizer,
  KernelSize,
  Resolution,
  MipmapBlurPass,
} from 'postprocessing'
import { useFrame, useThree } from '@react-three/fiber'
import { clamp } from 'three/src/math/MathUtils.js'
import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import gsap from 'gsap'
import { useSelector } from 'react-redux'
import { RootState } from '@/store'

const cameraPositions: Record<string, THREE.Vector3> = {
  home: new THREE.Vector3(0, 0, 10),
  about: new THREE.Vector3(10, 5, 10),
  contact: new THREE.Vector3(-10, 5, 10),
}

function PostProcess() {
  const outlinedObjects = useSelector(
    (state: RootState) => state.outline.outlinedObjects,
  )

  return (
    <EffectComposer
      enabled
      multisampling={4}
      stencilBuffer={false}
      autoClear={false}
    >
      <Bloom
        luminanceThreshold={10}
        luminanceSmoothing={0.1}
        intensity={1}
        resolutionX={240}
        resolutionY={240}
        kernelSize={KernelSize.SMALL}
        mipmapBlurPass={undefined}
      />
      <Outline
        selection={outlinedObjects}
        visibleEdgeColor={0xffffff}
        hiddenEdgeColor={0x000000}
        edgeStrength={2}
        pulseSpeed={0}
        xRay={false}
        kernelSize={KernelSize.VERY_SMALL}
      />
    </EffectComposer>
  )
}

function Scene() {
  const { width, height } = useThree(state => state.viewport)
  const scaledFov = clamp(70 - (width / (height * 3)) * 45, 10, 100)

  const degreesToRadians = (degrees: number): number =>
    degrees * (Math.PI / 180)

  return (
    <>
      <AdaptiveDpr pixelated />
      <PostProcess />
      <PerspectiveCamera
        makeDefault
        position={[0, 1.4, 4]}
        fov={scaledFov}
        rotation={[-Math.PI / 16, 0, 0]}
      />
      <ambientLight intensity={0.28} />
      <pointLight
        position={[-0, 1.5, 2.5]}
        power={100}
        castShadow
        shadow-bias={-0.0001}
      />

      {/* Scene Objects */}
      <group>
        <Room position={[0, 0, 0]} scale={[2, 2, 2]} />

        <CDPlayer scale={[5, 5, 5]} position={[0, 0, 0]} />

        <CD position={[0, 0, 0]} scale={[5, 5, 5]} />
      </group>
    </>
  )
}

export default Scene
