import React from 'react';
import { Card } from '@/components/ui/card';

export const channels = [
  { name: 'Time Estimation' },
  { name: 'Advertisement' },
  { name: 'Information' },
  { name: 'TheAppventurer' },
  { name: 'Pollssss' },
  { name: 'Achivements' },
];

const Analysis: React.FC = () => {
  return (
    <div>
      <Card className='absolute -bottom-2 -left-2 flex flex-col gap-2 p-4 pl-6'>
        <h6 className='text-xl font-bold'>Channels</h6>
        {channels.map((channel, index) => (
          <div key={channel.name} className='flex gap-6'>
            <span className='w-2  text-center' key={'channel_index-' + index}>
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
