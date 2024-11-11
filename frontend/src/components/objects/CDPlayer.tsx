import { useGLTF } from '@react-three/drei'
import { GroupProps } from '@react-three/fiber'
import Screen from './Screen'

type CDPlayerProps = GroupProps

export default function CDPlayer(props: CDPlayerProps) {
  const { nodes, materials } = useGLTF('/objects/cdplayer/scene-transformed.glb') as any

  // Fix transparency issues
  Object.values(materials).forEach((material: any) => {
    material.transparent = false
    material.depthWrite = true
  })

  return (
    <group>
      <group {...props} dispose={null}>
        <mesh
          castShadow
          receiveShadow
          geometry={
            nodes['panasonic_sa-pm02_player_panasonic_sa-pm02-player_0'].geometry
          }
          material={materials['panasonic_sa-pm02-player']}
          rotation={[-Math.PI / 2, 0, 0]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={
            nodes['panasonic_sa-pm02_speaker-l_panasonic_sa-pm02-speaker_0']
              .geometry
          }
          material={materials['panasonic_sa-pm02-speaker']}
          position={[-0.161, 0, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
        />
      </group>
      <Screen position={[-0.75,0.88,0.97]}/>
    </group>
  )
}

useGLTF.preload('/objects/cdplayer/scene-transformed.glb')
