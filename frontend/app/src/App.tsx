import './App.css';
import { Suspense, useEffect, useState } from 'react';
import RouterProvider from './routes/RouterProvider';
import { ClerkProvider } from '@clerk/clerk-react';
import { dark } from '@clerk/themes';
import { useTheme } from './components/theme-provider';

function App() {
  const theme = useTheme();
  const [clerkTheme, setClerkTheme] = useState<typeof dark | undefined>(dark);

  useEffect(() => {
    setClerkTheme(theme.theme === 'dark' ? dark : undefined);
  }, [theme]);

  const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

  if (!PUBLISHABLE_KEY) {
    throw new Error('Missing Publishable Key');
  }

  return (
    <ClerkProvider
      appearance={{ baseTheme: clerkTheme }}
      publishableKey={PUBLISHABLE_KEY}
      afterSignOutUrl='/'
    >
      <Suspense fallback={null}>
        <RouterProvider />
      </Suspense>
    </ClerkProvider>
  );
}

export default App;
