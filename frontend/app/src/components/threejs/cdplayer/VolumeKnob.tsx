import * as THREE from 'three';
import { useGLTF } from '@react-three/drei';
import { GLTF } from 'three-stdlib';

type GLTFResult = GLTF & {
  nodes: {
    volume_mixer: THREE.Mesh;
  };
  materials: {
    ['panasonic_sa-pm02-player']: THREE.MeshPhysicalMaterial;
  };
};

export default function VolumeKnob(props: JSX.IntrinsicElements['group']) {
  const { nodes, materials } = useGLTF(
    '/objects/cdplayer/volume_knob-transformed.glb',
  ) as GLTFResult;
  return (
    <group {...props} dispose={null}>
      <mesh
        name='volume_mixer'
        castShadow
        receiveShadow
        geometry={nodes.volume_mixer.geometry}
        material={materials['panasonic_sa-pm02-player']}
        rotation={[-Math.PI / 2, 0, 0]}
      />
    </group>
  );
}

useGLTF.preload('/objects/cdplayer/volume_knob-transformed.glb');
