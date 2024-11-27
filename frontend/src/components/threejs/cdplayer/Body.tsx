/*
Auto-generated by: https://github.com/pmndrs/gltfjsx
Command: npx gltfjsx@6.5.3 cdplayer.glb --types --keepnames --shadows --instance --exportdefault --transform --simplify 
Files: cdplayer.glb [592.53KB] > /home/alean/apps/popcast-ai/frontend/public/objects/cdplayer/cdplayer-transformed.glb [561.61KB] (5%)
*/

import * as THREE from 'three'
import React, { useEffect, useRef } from 'react'
import { useGLTF } from '@react-three/drei'
import { GLTF } from 'three-stdlib'
import { useDispatch } from 'react-redux'
import { setCdPlayer } from '@/reducers/outlineSlice' // Import the Redux action

type GLTFResult = GLTF & {
  nodes: {
    cdplayer: THREE.Mesh
  }
  materials: {
    ['panasonic_sa-pm02-player']: THREE.MeshPhysicalMaterial
  }
}

export default function Body(props: JSX.IntrinsicElements['group']) {
  const { nodes, materials } = useGLTF(
    '/objects/cdplayer/cdplayer-transformed.glb',
  ) as GLTFResult

  return (
    <group {...props} dispose={null}>
      <mesh
        name='cdplayer_body'
        castShadow
        receiveShadow
        geometry={nodes.cdplayer.geometry}
        material={materials['panasonic_sa-pm02-player']}
        rotation={[-Math.PI / 2, 0, 0]}
      />
    </group>
  )
}

useGLTF.preload('/cdplayer-transformed.glb')
