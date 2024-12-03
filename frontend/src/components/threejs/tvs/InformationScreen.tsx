import React from 'react'
import Carousel from '@/components/ui/carousel'
import { Card, CardContent } from '@/components/ui/card'

const facts = [
  'Our AI uses deep learning to predict song viewcounts with remarkable accuracy.',
  'We analyze song spectrograms to extract meaningful audio features.',
  "Get actionable insights to optimize your song's popularity.",
  'Our platform integrates seamlessly with a stunning 3D experience.',
  'Experiment with different audio features and see real-time predictions.',
  'Empower your creativity with data-driven songwriting suggestions.',
]

const InformationScreen: React.FC = () => {
  return (
    <div className='relative w-full h-full flex flex-col items-center justify-center'>
      <h1 className='text-2xl font-bold text-center'>
        Learn About Your AI Assistant
      </h1>

<div className='w-11/12'>
      <Carousel>
        {facts.map((fact, index) => (
          <Card>
            <CardContent className='flex items-center justify-center p-6'>
              <p className='text-sm font-medium text-center'>{fact}</p>
            </CardContent>
          </Card>
        ))}
      </Carousel>

</div>
    </div>
  )
}

export default InformationScreen
