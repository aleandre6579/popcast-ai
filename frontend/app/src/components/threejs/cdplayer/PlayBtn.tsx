import * as THREE from 'three';
import { useGLTF } from '@react-three/drei';
import { GLTF } from 'three-stdlib';

type GLTFResult = GLTF & {
  nodes: {
    play_btn: THREE.Mesh;
  };
  materials: {
    ['panasonic_sa-pm02-player']: THREE.MeshPhysicalMaterial;
  };
};

export default function PlayBtn(props: JSX.IntrinsicElements['group']) {
  const { nodes, materials } = useGLTF(
    '/objects/cdplayer/play_btn-transformed.glb',
  ) as GLTFResult;
  return (
    <group {...props} dispose={null}>
      <mesh
        name='play_btn'
        receiveShadow
        geometry={nodes.play_btn.geometry}
        material={materials['panasonic_sa-pm02-player']}
        rotation={[-Math.PI / 2, 0, 0]}
      />
    </group>
  );
}

useGLTF.preload('/objects/cdplayer/play_btn-transformed.glb');
