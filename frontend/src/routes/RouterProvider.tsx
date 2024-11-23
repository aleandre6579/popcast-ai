import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Canvas } from '@react-three/fiber'
import Scene from '../components/Scene'
import Navbar from '../components/ui/Navbar'

const Home: React.FC = () => <h1>Home Page</h1>
const About: React.FC = () => <h1>About Page</h1>
const Contact: React.FC = () => <h1>Contact Page</h1>

const RouterProvider: React.FC = () => {
  return (
    <Router>
      <div style={{width: '100vw', height: '100vh' }}>
        {/* Three.js Scene */}
        <Canvas id='threejs-canvas' shadows>
          <Scene />
        </Canvas>

        <div 
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            zIndex: 10, // Ensure it's on top of the canvas
          }}        
        >
          {/* UI Overlay */}
          <Navbar />

          {/* Routes */}
          <Routes>
            <Route path='/home' element={<Home />} />
            <Route path='/about' element={<About />} />
            <Route path='/contact' element={<Contact />} />
          </Routes>
        </div>
      </div>
    </Router>
  )
}

export default RouterProvider
