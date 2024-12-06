import './App.css'
import { Suspense } from 'react'
import AuthProvider from './auth/authProvider'
import RouterProvider from './routes/RouterProvider'
import { ThemeProvider } from './components/theme-provider'
import { Canvas } from '@react-three/fiber'
import Scene from './components/threejs/Scene'
import * as THREE from 'three'

function App() {
  return (
    <ThemeProvider defaultTheme='dark' storageKey='vite-ui-theme'>
      <AuthProvider>
        <Suspense>
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
                state.gl.shadowMap.enabled = true
                state.gl.shadowMap.needsUpdate = true
                state.gl.shadowMap.type = THREE.VSMShadowMap
              }}
            >
              <Scene />
            </Canvas>
            <RouterProvider />
          </div>
        </Suspense>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
