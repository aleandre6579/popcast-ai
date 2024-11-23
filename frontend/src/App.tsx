import './App.css'
import { Suspense } from 'react'
import AuthProvider from './auth/authProvider'
import RouterProvider from './routes/RouterProvider'

function App() {
  return (
    <AuthProvider>
      <Suspense>
        <RouterProvider />
        <div className="flex items-center justify-center h-screen bg-blue-500 text-red text-3xl">
      Tailwind CSS is Working!
    </div>
      </Suspense>
    </AuthProvider>
  )
}

export default App
