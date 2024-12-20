import * as THREE from 'three';
import { useGLTF } from '@react-three/drei';
import { GLTF } from 'three-stdlib';

type GLTFResult = GLTF & {
  nodes: {
    speaker_left: THREE.Mesh;
  };
  materials: {
    ['panasonic_sa-pm02-speaker']: THREE.MeshStandardMaterial;
  };
};

export default function Speaker(props: JSX.IntrinsicElements['group']) {
  const { nodes, materials } = useGLTF(
    '/objects/cdplayer/speaker-transformed.glb',
  ) as GLTFResult;
  return (
    <group {...props} dispose={null}>
      <mesh
        name='speaker_left'
        castShadow
        receiveShadow
        geometry={nodes.speaker_left.geometry}
        material={materials['panasonic_sa-pm02-speaker']}
        rotation={[-Math.PI / 2, 0, 0]}
      />
    </group>
  );
}

useGLTF.preload('/objects/cdplayer/speaker-transformed.glb');
