import { Button } from '@/components/ui/button';
import { UserIcon } from 'lucide-react';
import React from 'react';
import { ModeToggle } from './ModeToggle';
import { SignedIn, SignedOut, UserButton } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';

const Header: React.FC = () => {
  const navigate = useNavigate();

  return (
    <header className='flex justify-between items-center p-4 bg-transparent'>
      <div className='flex items-center space-x-2'>
        <img src='/logo.png' alt='Logo' className='h-8 w-8' />
        <span className='text-xl font-bold'>PopcastAI</span>
      </div>
      <div className='flex gap-2'>
        <ModeToggle />

        <SignedIn>
          <UserButton />
        </SignedIn>

        <SignedOut>
          <Button onClick={() => navigate('/sign-in')}>
            <UserIcon />
            <span>Sign In</span>
          </Button>
        </SignedOut>
      </div>
    </header>
  );
};

export default Header;
