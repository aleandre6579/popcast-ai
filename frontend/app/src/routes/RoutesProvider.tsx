import React, { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Upload from '@/pages/Upload';
import Analysis from '@/pages/Analysis';
import Results from '@/pages/Results';
import Support from '@/pages/Support';
import { useDispatch } from 'react-redux';
import { setRoutePath } from '@/reducers/routerSlice';

export const routes = [
  { path: '/', component: <Upload /> },
  { path: '/analysis', component: <Analysis /> },
  { path: '/results', component: <Results /> },
  { path: '/support', component: <Support /> },
] as const;

export type RoutePath = (typeof routes)[number]['path'];

const RoutesProvider: React.FC = () => {
  const location = useLocation();
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setRoutePath(location.pathname as RoutePath));
  }, [location.pathname]);

  return (
    <div className='grow'>
      <Routes>
        {routes.map(({ path, component }) => (
          <Route key={path} path={path} element={component} />
        ))}
      </Routes>
    </div>
  );
};

export default RoutesProvider;
