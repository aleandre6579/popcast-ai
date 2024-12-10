import * as THREE from 'three';
import { forwardRef } from 'react';
import { useGLTF } from '@react-three/drei';
import { GLTF } from 'three-stdlib';

type GLTFResult = GLTF & {
  nodes: {
    dock_front: THREE.Mesh;
    dock_center: THREE.Mesh;
  };
  materials: {
    ['Material.004']: THREE.MeshStandardMaterial;
    ['Material.003']: THREE.MeshStandardMaterial;
  };
};

const Dock = forwardRef<THREE.Group, JSX.IntrinsicElements['group']>(
  (props, ref) => {
    const { nodes, materials } = useGLTF(
      '/objects/cdplayer/dock-transformed.glb',
    ) as GLTFResult;
    return (
      <group ref={ref} {...props} dispose={null}>
        <mesh
          name='dock_front'
          receiveShadow
          geometry={nodes.dock_front.geometry}
          material={materials['Material.004']}
          rotation={[-Math.PI / 2, 0, 0]}
        />
        <mesh
          name='dock_center'
          receiveShadow
          geometry={nodes.dock_center.geometry}
          material={materials['Material.003']}
          position={[-0.004, 0.053, 0.037]}
          scale={[0.008, 0.002, 0.008]}
        />
      </group>
    );
  },
);
Dock.displayName = 'Dock'

useGLTF.preload('/objects/cdplayer/dock-transformed.glb');

export default Dock;
