import { Vector3 } from '@react-three/fiber'
import { RoundedBox, OrbitControls } from '@react-three/drei'

interface RoundedBoxProps {
  position: Vector3
}

function MyRoundedBox(props: RoundedBoxProps) {
  return (
    <>
        <pointLight
          position={[5, 5, 5]}
          intensity={30}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />

        {/* RoundedBox with shadow casting */}
        <RoundedBox
          args={[1, 1, 1]}
          position={props.position}
          radius={0.02}
          smoothness={4}
          bevelSegments={4}
          creaseAngle={0.4}
          castShadow
          receiveShadow
        >
          <meshStandardMaterial color='white' />
        </RoundedBox>

        {/* Shadow-receiving plane */}
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, -1, 0]}
          receiveShadow
        >
          <planeGeometry args={[10, 10]} />
          <shadowMaterial opacity={0.3} />
        </mesh>

        <OrbitControls />
    </>
  )
}

export default MyRoundedBox
