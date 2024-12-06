import * as THREE from 'three'
import { useEffect, useRef } from 'react'
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
import Screen from './Screen'
import CD from '../CD'

function CDPlayer(props: JSX.IntrinsicElements['group']) {
  const dispatch = useDispatch()
  const { openDock, uploaded } = useSelector((state: RootState) => state.upload)

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
  const cdPlayerRef = useRef<THREE.Group>(null)
  useEffect(() => {
    if (cdPlayerRef.current) {
      dispatch(setCdPlayer(cdPlayerRef.current))
    }
  }, [dispatch])

  return (
    <group ref={cdPlayerRef} {...props} dispose={null}>
      <Body />

      <group ref={dockRef}>
        <Dock position={[0, 0, 0]} />
        <CD visible={uploaded} />
      </group>
      <DockBtn />
      <PlayBtn />
      <Speaker position={[-0.16, 0, 0]} />
      <Speaker position={[0.16, 0, 0]} />
      <VolumeKnob />
      <Screen position={[-0.0765, 0.0876, 0.097]} />
    </group>
  )
}

export default CDPlayer
