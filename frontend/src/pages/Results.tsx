import { Input } from '@/components/ui/input'
import React, { useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../store'

interface ResultsProps {}

const Results: React.FC<ResultsProps> = () => {
  const dispatch = useDispatch()
  const { cdPlayer } = useSelector((state: RootState) => state.outline)

  return (
    <div>
      <h1 className='text-4xl font-extrabold text-center mt-8 tracking-tight'>
        AI insights for your next big hit!
      </h1>
      <p className='text-sm text-center mt-2'>
        Submit your songs and receive quick and meaningful feedback.
      </p>
    </div>
  )
}

export default Results
