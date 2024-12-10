import * as THREE from 'three';
import { useGLTF } from '@react-three/drei';
import { GLTF } from 'three-stdlib';

type GLTFResult = GLTF & {
  nodes: {
    cd: THREE.Mesh;
  };
  materials: {
    None: THREE.MeshStandardMaterial;
  };
};

export default function CD(props: JSX.IntrinsicElements['group']) {
  const { nodes, materials } = useGLTF(
    '/objects/cdplayer/cd-transformed.glb',
  ) as GLTFResult;

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
  );
}

useGLTF.preload('/objects/cdplayer/cd-transformed.glb');
