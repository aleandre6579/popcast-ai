import Room from './Room'
import CDPlayer from './cdplayer/CDPlayer'
import CD from './CD'
import { AdaptiveDpr, PerspectiveCamera } from '@react-three/drei'
import * as THREE from 'three'
import { EffectComposer, Bloom, Outline } from '@react-three/postprocessing'
import { KernelSize } from 'postprocessing'
import { useThree } from '@react-three/fiber'
import { clamp } from 'three/src/math/MathUtils.js'
import { useEffect, useRef } from 'react'
import { useTheme } from '../theme-provider'
import gsap from 'gsap'
import { useSelector } from 'react-redux'
import { RootState } from '@/store'
import Camera from './Camera'
import TVs from './TVs'

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
  const { theme } = useTheme()
  const { width, height } = useThree(state => state.viewport)
  const scaledFov = clamp(70 - (width / (height * 3)) * 45, 10, 100)
  const pointLightRef = useRef<THREE.PointLight>(null)

  useEffect(() => {
    if (!pointLightRef.current) return

    const targetPower = theme === 'dark' ? 300 : 500

    gsap.to(pointLightRef.current, {
      power: targetPower,
      duration: 0.8,
      ease: 'power4',
    })
  }, [theme])

  return (
    <>
      <AdaptiveDpr pixelated />
      <PostProcess />
      <Camera scaledFov={scaledFov} />
      <ambientLight intensity={0.25} />
      <pointLight
        ref={pointLightRef}
        position={[0, 3, 3]}
        decay={1.3}
        castShadow
        shadow-bias={-0.0005}
      />

      {/* Scene Objects */}
      <group>
        <Room position={[0, 0, 0]} scale={[2, 2, 2]} />
        <CDPlayer scale={[5, 5, 5]} position={[0, 0, 0]} />
        <TVs
          position={[14.5, 2, 3.5]}
          rotation={[0, Math.PI / 2, 0]}
          scale={0.4}
        />
      </group>
    </>
  )
}

export default Scene
