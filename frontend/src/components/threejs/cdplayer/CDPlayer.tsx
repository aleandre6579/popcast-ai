import * as THREE from 'three'
import React, { useEffect, useRef } from 'react'
import Body from './Body'
import Dock from './Dock'
import DockBtn from './DockBtn'
import PlayBtn from './PlayBtn'
import Speaker from './Speaker'
import VolumeKnob from './VolumeKnob'
import gsap from 'gsap'
import { useSelector } from 'react-redux'
import { RootState } from '@/store'

function CDPlayer(props: JSX.IntrinsicElements['group']) {
  const openDockZ = 0.12

  const dockRef = useRef<THREE.Group>(null)

  const { openDock } = useSelector(
    (state: RootState) => state.upload
  );

  // Dock animation
  if (dockRef?.current) {
    if (openDock) {
      gsap.to(dockRef.current.position, {
        z: 0.12,
        duration: 2,
        ease: 'power2.out',
      })
    } else {
      gsap.to(dockRef.current.position, {
        z: 0,
        duration: 2,
        ease: 'power2.out',
      })
    }
  }

  return (
    <group {...props} dispose={null}>
      <Body />
      <Dock ref={dockRef} position={[0, 0, 0]} />
      <DockBtn />
      <PlayBtn />
      <Speaker position={[-0.16, 0, 0]} />
      <Speaker position={[0.16, 0, 0]} />
      <VolumeKnob />
    </group>
  )
}

export default CDPlayer
