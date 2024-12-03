import { Input } from '@/components/ui/input'
import React, { useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../store'
import { Card } from '@/components/ui/card'

interface AnalysisProps {}

export const channels = [
  { name: 'Time Estimation' },
  { name: 'Advertisement' },
  { name: 'Information' },
  { name: 'TheAppventurer' },
  { name: 'Pollssss' },
  { name: 'Achivements' },
]

const Analysis: React.FC<AnalysisProps> = () => {
  const dispatch = useDispatch()
  const { cdPlayer } = useSelector((state: RootState) => state.outline)

  return (
    <div>
      <Card className='absolute -bottom-2 -left-2 flex flex-col gap-2 p-4 pl-6'>
        <h6 className='text-xl font-bold'>Channels</h6>
        {channels.map((channel, index) => (
          <div className='flex gap-6 '>
            <span className='w-2  text-center' key={'channel_index-' + index}>
              {index}
            </span>
            <span key={'channel_name-' + index}>{channel.name}</span>
          </div>
        ))}
      </Card>
    </div>
  )
}

export default Analysis
