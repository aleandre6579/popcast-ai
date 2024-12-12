import React, { useEffect } from 'react';
import gsap from 'gsap';
import { SignIn } from '@clerk/clerk-react';

const LogIn: React.FC = () => {
  // GSAP animations on render
  useEffect(() => {
    gsap.fromTo(
      '.signin-form',
      { y: '-=100', opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5 },
    );
  }, []);

  return (
    <div className='h-full flex items-center justify-center'>
      <div className='signin-form'>
        <SignIn />
      </div>
    </div>
  );
};

export default LogIn;
