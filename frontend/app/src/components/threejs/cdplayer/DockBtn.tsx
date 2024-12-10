import * as THREE from 'three';
import { useGLTF } from '@react-three/drei';
import { GLTF } from 'three-stdlib';

type GLTFResult = GLTF & {
  nodes: {
    dock_btn: THREE.Mesh;
  };
  materials: {
    ['panasonic_sa-pm02-player']: THREE.MeshPhysicalMaterial;
  };
};

export default function DockBtn(props: JSX.IntrinsicElements['group']) {
  const { nodes, materials } = useGLTF(
    '/objects/cdplayer/dock_btn-transformed.glb',
  ) as GLTFResult;
  return (
    <group {...props} dispose={null}>
      <mesh
        name='dock_btn'
        receiveShadow
        geometry={nodes.dock_btn.geometry}
        material={materials['panasonic_sa-pm02-player']}
        rotation={[-Math.PI / 2, 0, 0]}
      />
    </group>
  );
}

useGLTF.preload('/objects/cdplayer/dock_btn-transformed.glb');
