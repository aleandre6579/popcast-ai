import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Upload from '@/pages/Upload';
import Analysis from '@/pages/Analysis';
import Results from '@/pages/Results';
import Support from '@/pages/Support';
import RootLayout from '@/components/RootLayout';
import { SignIn, SignUp } from '@clerk/clerk-react';

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { path: '/', element: <Upload /> },
      { path: '/analysis', element: <Analysis /> },
      { path: '/results', element: <Results /> },
      { path: '/support', element: <Support /> },
      { path: '/sign-in/*', element: <SignIn /> },
      { path: '/sign-up/*', element: <SignUp /> },
    ],
  },
]);

const Router: React.FC = () => {
  return <RouterProvider router={router} />;
};

export default Router;
