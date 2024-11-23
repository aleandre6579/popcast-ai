import './App.css'
import { Suspense } from 'react'
import AuthProvider from './auth/authProvider'
import RouterProvider from './routes/RouterProvider'

function App() {
  return (
    <AuthProvider>
      <Suspense>
        <RouterProvider />
      </Suspense>
    </AuthProvider>
  )
}

export default App
