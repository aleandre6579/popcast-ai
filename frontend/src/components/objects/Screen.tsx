import { useRef } from 'react'
import { MeshProps, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function Screen(props: MeshProps) {
  const meshRef = useRef<THREE.Mesh>(null) // Explicitly typing the ref

  const vertexShader = `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `

  const fragmentShader = `
    varying vec2 vUv;
    uniform float time;

    // Simple pseudo-random function
    float random(vec2 p) {
      return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
    }

    void main() {
      // Pixelation effect (lower value for larger pixels)
      vec2 uv = floor(vUv * 200.0) / 10.0;
      float noise = random(uv + time * 0.1);
      vec3 color = vec3(0.0, 0.0, 1.0) * (0.8 + 0.2 * noise);
      gl_FragColor = vec4(color, 1.0);
    }
  `

  // Custom shape with left rounded corners for the screen
  const ScreenShape = () => {
    const shape = new THREE.Shape()
    const width = 1.19
    const height = 0.23
    const cornerRadius = 0.07

    // Draw screen shape with rounded corners on the left side
    shape.moveTo(width, 0)
    shape.lineTo(width, height)
    shape.lineTo(cornerRadius, height)
    shape.quadraticCurveTo(0, height, 0, height - cornerRadius)
    shape.lineTo(0, cornerRadius)
    shape.quadraticCurveTo(0, 0, cornerRadius, 0)
    shape.lineTo(width, 0)

    return new THREE.ShapeGeometry(shape)
  }

  useFrame(({ clock }) => {
    if (meshRef.current && meshRef.current.material) {
      meshRef.current.material.uniforms.time.value = clock.getElapsedTime()
    }
  })

  return (
    <mesh
      castShadow receiveShadow
      scale={[0.1, 0.1, 0]}
      ref={meshRef}
      {...props}
      geometry={ScreenShape()}
    >
      <shaderMaterial
        attach='material'
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={{
          time: { value: 0 },
        }}
        transparent={true} // Enable transparency
        opacity={0.8} // Set opacity
      />
    </mesh>
  )
}
