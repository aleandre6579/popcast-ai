import './App.css'
import { Suspense } from 'react'
import AuthProvider from './auth/authProvider'
import RouterProvider from './routes/RouterProvider'
import { ThemeProvider } from './components/theme-provider'

function App() {
  return (
    <ThemeProvider defaultTheme='dark' storageKey='vite-ui-theme'>
      <AuthProvider>
        <Suspense>
          <RouterProvider />
        </Suspense>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
