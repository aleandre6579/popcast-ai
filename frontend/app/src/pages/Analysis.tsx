import React, { useEffect } from 'react';
import { Card } from '@/components/ui/card';
import gsap from 'gsap';

export const channels = [
  { name: 'Time Estimation' },
  { name: 'Advertisement' },
  { name: 'Information' },
  { name: 'TheAppventurer' },
  { name: 'Pollssss' },
  { name: 'Achivements' },
];

const Analysis: React.FC = () => {
  // GSAP animations on render
  useEffect(() => {
    gsap.fromTo(
      '.channels',
      { y: '+=random(100, 400)', x: '-=random(10, 200)', opacity: 0 },
      { y: 0, x: 0, opacity: 1, duration: 1},
    );
  }, []);

  return (
    <div>
      <Card className='channels absolute -bottom-2 -left-2 flex flex-col gap-2 p-4 pl-6'>
        <h6 className='text-xl font-bold'>Channels</h6>
        {channels.map((channel, index) => (
          <div key={channel.name} className='flex gap-6'>
            <span className='w-2 text-center' key={'channel_index-' + index}>
              {index}
            </span>
            <span key={'channel_name-' + index}>{channel.name}</span>
          </div>
        ))}
      </Card>
    </div>
  );
};

export default Analysis;
