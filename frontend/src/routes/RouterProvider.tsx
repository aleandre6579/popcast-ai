import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Canvas } from '@react-three/fiber'
import Scene from '../components/Scene'
import Navbar from '../components/ui/Navbar'
import { Upload } from 'antd'

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
            powerPreference: 'high-performance',
            alpha: false,
            antialias: false,
            stencil: false,
            depth: false,
          }}
        >
          <Scene />
        </Canvas>

        <div className='absolute top-0 left-0 w-full z-10'>
          {/* UI Overlay */}
          <Navbar />

          {/* Routes */}
          <Routes>
            <Route path='/' element={<Upload />} />
            <Route path='/analysis' element={<About />} />
            <Route path='/results' element={<Contact />} />
            <Route path='/support' element={<Contact />} />
          </Routes>
        </div>
      </div>
    </Router>
  )
}

export default RouterProvider
