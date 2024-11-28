import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Canvas } from '@react-three/fiber'
import Scene from '../components/threejs/Scene'
import Upload from '@/pages/Upload'
import Header from '../components/Header'
import Footer from '@/components/Footer'
import { Toaster } from '@/components/ui/sonner'

const About: React.FC = () => <h1 className='text-black'>About Page</h1>
const Contact: React.FC = () => <h1 className='text-black'>Contact Page</h1>

const RouterProvider: React.FC = () => {
  return (
    <Router>
      <div style={{ width: '100vw', height: '100vh' }}>
        {/* Three.js Scene */}
        <Canvas
          id='threejs-canvas'
          shadows
          gl={{
            toneMapping: 0,
            powerPreference: 'high-performance',
            alpha: false,
            antialias: true,
            stencil: false,
            autoClear: false,
            depth: true,
          }}
        >
          <Scene />
        </Canvas>

        <div className='absolute top-0 left-0 w-full z-10 flex flex-col h-full'>
          <Header />

          <div className='grow'>
            <Routes>
              <Route path='/' element={<Upload />} />
              <Route path='/analysis' element={<About />} />
              <Route path='/results' element={<Contact />} />
              <Route path='/support' element={<Contact />} />
            </Routes>
          </div>

          <Footer />
          <Toaster richColors />
        </div>
      </div>
    </Router>
  )
}

export default RouterProvider
