import './App.css';
import { Suspense } from 'react';
import RouterProvider from './routes/RouterProvider';
import { ThemeProvider } from './components/theme-provider';

function App() {
  return (
    <ThemeProvider defaultTheme='dark' storageKey='vite-ui-theme'>
      <Suspense fallback={null}>
        <RouterProvider />
      </Suspense>
    </ThemeProvider>
  );
}

export default App;
