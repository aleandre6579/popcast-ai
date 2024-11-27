import * as THREE from 'three'
import React, { useEffect, useRef } from 'react'
import Body from './Body'
import Dock from './Dock'
import DockBtn from './DockBtn'
import PlayBtn from './PlayBtn'
import Speaker from './Speaker'
import VolumeKnob from './VolumeKnob'
import gsap from 'gsap'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '@/store'
import { setCdPlayer } from '@/reducers/outlineSlice'

function CDPlayer(props: JSX.IntrinsicElements['group']) {
  const dispatch = useDispatch()
  const { openDock } = useSelector((state: RootState) => state.upload)

  const openDockZ = 0.12
  const dockRef = useRef<THREE.Group>(null)

  // Animate the dock opening
  if (dockRef?.current) {
    if (openDock) {
      gsap.to(dockRef.current.position, {
        z: openDockZ,
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

  // Add cd player ref to global state (for outlining)
  const cdPlayerRef = useRef<THREE.Mesh>(null)
  useEffect(() => {
    if (cdPlayerRef.current) {
      dispatch(setCdPlayer(cdPlayerRef.current))
    }
  }, [dispatch])

  return (
    <group ref={cdPlayerRef} {...props} dispose={null}>
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
