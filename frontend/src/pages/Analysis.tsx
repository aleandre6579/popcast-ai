import { Input } from '@/components/ui/input'
import React, { useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../store'

interface AnalysisProps {}

const Analysis: React.FC<AnalysisProps> = () => {
  const dispatch = useDispatch()
  const { cdPlayer } = useSelector((state: RootState) => state.outline)

  const channels = [
    {name: 'channel 1'},
    {name: 'channel 2'},
    {name: 'channel 3'},
    {name: 'channel 4'}
  ]

  return (
    <div className='flex flex-col'>
      <div className='grow' />
      <div className='flex flex-col gap-2'>
        {channels.map(channel =>
          <span>{channel.name}</span>
        )}
      </div>
    </div>
  )
}

export default Analysis
