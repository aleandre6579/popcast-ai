import * as THREE from 'three'
import React, { useEffect } from 'react'
import { useGLTF } from '@react-three/drei'
import { GLTF } from 'three-stdlib'
import { useTheme } from '../theme-provider'
import gsap from 'gsap'

type GLTFResult = GLTF & {
  nodes: {
    Cube: THREE.Mesh
  }
  materials: {
    Material: THREE.MeshStandardMaterial
  }
}

export default function Room(props: JSX.IntrinsicElements['group']) {
  const { theme } = useTheme()

  const { nodes, materials } = useGLTF(
    '/objects/room/room-transformed.glb',
  ) as GLTFResult

  const lightColor = new THREE.Color(0xffffff)
  const darkColor = new THREE.Color(0x242424)

  useEffect(() => {
    const targetColor = theme === 'dark' ? darkColor : lightColor

    gsap.to(materials.Material.color, {
      r: targetColor.r,
      g: targetColor.g,
      b: targetColor.b,
      duration: 0.8,
      ease: 'power4',
    })
  }, [theme])

  return (
    <group {...props} dispose={null}>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Cube.geometry}
        material={materials.Material}
        position={[0, 4, 0]}
        scale={[8, 4, 8]}
      />
    </group>
  )
}

useGLTF.preload('/room-transformed.glb')
