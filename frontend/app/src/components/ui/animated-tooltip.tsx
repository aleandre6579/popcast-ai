import React, { useEffect } from 'react';
import gsap from 'gsap';
import { ChevronDown } from 'lucide-react';

interface AnimatedTooltipProps {}

const AnimatedTooltip: React.FC<AnimatedTooltipProps> = () => {
  // Tooltip animation
  useEffect(() => {
    const timeline = gsap.timeline({ repeat: -1, ease: 'linear' });

    timeline.fromTo('.tooltip', { y: -10 }, { y: 10, duration: 1 }, 0);
    timeline.to('.tooltip', { y: -10, duration: 1, delay: 2 });

    timeline.fromTo(
      '.downArrow',
      { y: -5 },
      { y: 5, duration: 0.5, repeat: 11, yoyo: true },
      0,
    );
  }, []);

  return (
    <p className='tooltip flex justify-center gap-3 text-center absolute top-[-50px] w-full'>
      <ChevronDown className='downArrow' />
      <span>Click on the CD player or drop an audio file to get started!</span>
      <ChevronDown className='downArrow' />
    </p>
  );
};

export default AnimatedTooltip;
