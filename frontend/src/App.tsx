import './App.css';
import { Canvas } from '@react-three/fiber';
import { RoundedBox, OrbitControls } from '@react-three/drei';

function App() {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Canvas shadows>
        {/* Lighting with shadow casting enabled */}
        <ambientLight intensity={0.3} />
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
          radius={0.05}
          smoothness={4}
          bevelSegments={4}
          creaseAngle={0.4}
          castShadow
        >
          <meshPhongMaterial color="cyan" />
        </RoundedBox>

        {/* Shadow-receiving plane */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]} receiveShadow>
          <planeGeometry args={[10, 10]} />
          <shadowMaterial opacity={0.3} />
        </mesh>

        <OrbitControls />
      </Canvas>
    </div>
  );
}

export default App;
