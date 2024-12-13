import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import { Toaster } from './ui/sonner';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import Scene from './threejs/Scene';

export default function RootLayout() {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Canvas
        id='threejs-canvas'
        shadows
        gl={{
          toneMapping: THREE.ACESFilmicToneMapping,
          powerPreference: 'high-performance',
          alpha: false,
          antialias: true,
          stencil: false,
          autoClear: false,
          depth: true,
        }}
        onCreated={state => {
          state.gl.shadowMap.enabled = true;
          state.gl.shadowMap.needsUpdate = true;
          state.gl.shadowMap.type = THREE.VSMShadowMap;
        }}
      >
        <Scene />
      </Canvas>
      <div style={{ width: '100vw', height: '100vh' }} className='absolute top-0 left-0 z-10 flex flex-col'>
        <Header />
        <main className='h-full'>
          <Outlet />
        </main>
        <Footer />
        <Toaster richColors />
      </div>
    </div>
  );
}
