import { Input } from '@/components/ui/input'
import React, { useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../store'

interface AnalysisProps {}

const Analysis: React.FC<AnalysisProps> = () => {
  const dispatch = useDispatch()
  const { cdPlayer } = useSelector((state: RootState) => state.outline)

  return (
    <div>
      <h1 className='text-4xl font-extrabold text-center mt-8 tracking-tight'>
        Analyzing...
      </h1>
 
    </div>
  )
}

export default Analysis
