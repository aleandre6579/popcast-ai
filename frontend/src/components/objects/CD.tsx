import { useGLTF } from '@react-three/drei'
import { GroupProps } from '@react-three/fiber'

type CDProps = GroupProps

export default function CD(props: CDProps) {
  const { nodes, materials } = useGLTF('/objects/cd/scene-transformed.glb')
  return (
    <group {...props} dispose={null}>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Object_2.geometry}
        material={materials.None}
        rotation={[-2.957, -0.505, 0.366]}
      />
    </group>
  )
}

useGLTF.preload('/objects/cd/scene-transformed.glb')
