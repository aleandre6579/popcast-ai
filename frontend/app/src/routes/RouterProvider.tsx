import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '@/components/Footer';
import { Toaster } from '@/components/ui/sonner';
import RoutesProvider from './RoutesProvider';

const RouterProvider: React.FC = () => {
  return (
    <Router>
      <div className='absolute top-0 left-0 w-full z-10 flex flex-col h-full'>
        <Header />
        <RoutesProvider />
        <Footer />
        <Toaster richColors />
      </div>
    </Router>
  );
};

export default RouterProvider;
