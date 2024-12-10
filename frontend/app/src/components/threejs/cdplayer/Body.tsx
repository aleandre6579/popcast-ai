import * as THREE from 'three';
import { useGLTF } from '@react-three/drei';
import { GLTF } from 'three-stdlib';

type GLTFResult = GLTF & {
  nodes: {
    cdplayer: THREE.Mesh;
  };
  materials: {
    ['panasonic_sa-pm02-player']: THREE.MeshPhysicalMaterial;
  };
};

export default function Body(props: JSX.IntrinsicElements['group']) {
  const { nodes, materials } = useGLTF(
    '/objects/cdplayer/cdplayer-transformed.glb',
  ) as GLTFResult;

  materials['panasonic_sa-pm02-player'].shadowSide = THREE.DoubleSide;

  return (
    <group {...props} dispose={null}>
      <mesh
        material-depthWrite={true}
        material-depthTest={true}
        name='cdplayer_body'
        castShadow
        receiveShadow
        geometry={nodes.cdplayer.geometry}
        material={materials['panasonic_sa-pm02-player']}
        rotation={[-Math.PI / 2, 0, 0]}
      />
    </group>
  );
}

useGLTF.preload('/objects/cdplayer/cdplayer-transformed.glb');
