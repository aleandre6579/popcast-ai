import * as THREE from 'three'
import { useGLTF } from '@react-three/drei'
import { GLTF } from 'three-stdlib'
import Screen from './Screen'

type GLTFResult = GLTF & {
  nodes: {
    TV_Light: THREE.Mesh
    Screen3: THREE.Mesh
    MetalArms: THREE.Mesh
    Object_5: THREE.Mesh
    Object_5_1: THREE.Mesh
    Object_7: THREE.Mesh
    Object_7_1: THREE.Mesh
    Screen1: THREE.Mesh
    Screen2: THREE.Mesh
    Screen4: THREE.Mesh
    Object_7001: THREE.Mesh
    Object_7001_1: THREE.Mesh
    Object_5001: THREE.Mesh
    Object_5001_1: THREE.Mesh
    Object_5001_2: THREE.Mesh
  }
  materials: {
    GlowLampBlue: THREE.MeshStandardMaterial
    blackScreen: THREE.MeshStandardMaterial
    metallArm: THREE.MeshStandardMaterial
    monitoHuelle: THREE.MeshStandardMaterial
    monitoHuelle2: THREE.MeshStandardMaterial
    monitoHuelle2dark: THREE.MeshStandardMaterial
    HolzverkleidungDark: THREE.MeshStandardMaterial
    Holzverkleidung: THREE.MeshStandardMaterial
  }
}

export default function TVs(props: JSX.IntrinsicElements['group']) {
  const { nodes, materials } = useGLTF(
    '/objects/tvs/tvs-transformed.glb',
  ) as GLTFResult
  return (
    <group {...props} dispose={null}>
      <group
        name='TV1'
        position={[2.008, 0, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <mesh
          name='Object_7'
          castShadow
          receiveShadow
          geometry={nodes.Object_7.geometry}
          material={materials.monitoHuelle}
        />
        <mesh
          name='Object_7_1'
          castShadow
          receiveShadow
          geometry={nodes.Object_7_1.geometry}
          material={materials.monitoHuelle}
        />
      </group>
      <group
        name='TV2'
        position={[2.008, 0, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <mesh
          name='Object_5'
          castShadow
          receiveShadow
          geometry={nodes.Object_5.geometry}
          material={materials.monitoHuelle}
        />
        <mesh
          name='Object_5_1'
          castShadow
          receiveShadow
          geometry={nodes.Object_5_1.geometry}
          material={materials.monitoHuelle}
        />
      </group>
      <group
        name='TV3'
        position={[2.008, 0, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <mesh
          name='Object_7001'
          castShadow
          receiveShadow
          geometry={nodes.Object_7001.geometry}
          material={materials.monitoHuelle2dark}
        />
        <mesh
          name='Object_7001_1'
          castShadow
          receiveShadow
          geometry={nodes.Object_7001_1.geometry}
          material={materials.HolzverkleidungDark}
        />
      </group>
      <group
        name='TV4'
        position={[2.008, 0, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <mesh
          name='Object_5001'
          castShadow
          receiveShadow
          geometry={nodes.Object_5001.geometry}
          material={materials.monitoHuelle2dark}
        />
        <mesh
          name='Object_5001_1'
          castShadow
          receiveShadow
          geometry={nodes.Object_5001_1.geometry}
          material={materials.HolzverkleidungDark}
        />
        <mesh
          name='Object_5001_2'
          castShadow
          receiveShadow
          geometry={nodes.Object_5001_2.geometry}
          material={materials.HolzverkleidungDark}
        />
      </group>

      <mesh
        name='Screen1'
        position={[2.008, 0, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <Screen channelNum={0} position={[0.21, 0, 2.945]} />
      </mesh>
      <mesh
        name='Screen2'
        position={[2.008, 0, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <Screen channelNum={1} position={[-4.218, 0, 2.945]} />
      </mesh>
      <mesh
        name='Screen3'
        position={[2.008, 0, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <Screen channelNum={2} position={[0.21, 0, -0.07]} />
      </mesh>
      <mesh
        name='Screen4'
        position={[2.008, 0, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <Screen channelNum={3} position={[-4.218, 0, -0.07]} />
      </mesh>

      <mesh
        name='MetalArms'
        castShadow
        receiveShadow
        geometry={nodes.MetalArms.geometry}
        material={materials.metallArm}
        position={[2.008, 0, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      />
    </group>
  )
}

useGLTF.preload('/objects/tvs/tvs-transformed.glb')
