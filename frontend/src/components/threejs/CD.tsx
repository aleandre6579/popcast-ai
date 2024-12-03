/*
Auto-generated by: https://github.com/pmndrs/gltfjsx
Command: npx gltfjsx@6.5.3 cd.glb --types --keepnames --shadows --instance --exportdefault --transform --simplify 
Files: cd.glb [100.84KB] > /home/alean/apps/popcast-ai/frontend/public/objects/cdplayer/cd-transformed.glb [96.72KB] (4%)
*/

import * as THREE from 'three'
import React, { useEffect, useRef } from 'react'
import { useGLTF } from '@react-three/drei'
import { GLTF } from 'three-stdlib'
import { useSelector } from 'react-redux'
import { RootState } from '@/store'

type GLTFResult = GLTF & {
  nodes: {
    cd: THREE.Mesh
  }
  materials: {
    None: THREE.MeshStandardMaterial
  }
}

export default function CD(props: JSX.IntrinsicElements['group']) {
  const { nodes, materials } = useGLTF(
    '/objects/cdplayer/cd-transformed.glb',
  ) as GLTFResult

  return (
    <group {...props} dispose={null}>
      <mesh
        name='cd'
        castShadow
        receiveShadow
        geometry={nodes.cd.geometry}
        material={materials.None}
        position={[-0.004, 0.054, 0.037]}
        rotation={[1.57, 0.005, 1.42]}
        scale={[0.025, 0.025, 0.01]}
      />
    </group>
  )
}

useGLTF.preload('/objects/cdplayer/cd-transformed.glb')
