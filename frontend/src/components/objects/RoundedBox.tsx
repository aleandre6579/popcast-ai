import { Vector3 } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'

interface RoundedBoxProps {
  position: Vector3
}

function MyRoundedBox(props: RoundedBoxProps) {
  return (
    <>
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
    </>
  )
}

export default MyRoundedBox
