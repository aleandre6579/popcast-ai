import { RootState } from '@/store'
import { PerspectiveCamera } from '@react-three/drei'
import { useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import * as THREE from 'three'
import gsap from 'gsap'

type CameraProps = {
  scaledFov: number
}

const cameraPositions = {
  '/': [0, 1.4, 4],
  '/analysis': [9.5, 2.4, 4.4],
  '/results': [0, 3.4, 4],
  '/support': [0, 12, 4],
}

const cameraRotations = {
  '/': [-Math.PI / 16, 0, 0],
  '/analysis': [0, -Math.PI / 2, 0],
  '/results': [0, Math.PI / 2, 0],
  '/support': [Math.PI / 2, 0, 0],
}

function Camera({ scaledFov }: CameraProps) {
  const { routePath } = useSelector((state: RootState) => state.router)
  const cameraRef = useRef<THREE.PerspectiveCamera>(null)

  useEffect(() => {
    if (!cameraRef.current) return

    const newPosition = cameraPositions[routePath]
    const newRotation = cameraRotations[routePath]

    gsap.to(cameraRef.current.position, {
      x: newPosition[0],
      y: newPosition[1],
      z: newPosition[2],
      duration: 1,
      ease: 'power2.out',
    })

    gsap.to(cameraRef.current.rotation, {
      x: newRotation[0],
      y: newRotation[1],
      z: newRotation[2],
      duration: 1,
      ease: 'power2.out',
    })
  }, [routePath])

  return (
    <PerspectiveCamera
      makeDefault
      ref={cameraRef}
      fov={scaledFov}
      rotation={[-Math.PI / 16, 0, 0]}
      position={[0, 1.4, 4]}
    />
  )
}

export default Camera
