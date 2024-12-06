import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import FactsCarousel from '@/components/ui/facts-carousel'

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
    <div className='relative w-full h-full flex flex-col items-center justify-center gap-2'>
      <h1 className='text-2xl font-bold text-center'>PopcastAI Facts</h1>

      <div className='w-11/12'>
        <FactsCarousel autoScroll autoScrollInterval={5000}>
          {facts.map((fact, index) => (
            <Card key={'fact-' + index}>
              <CardContent className='flex items-center justify-center p-4'>
                <p className='text-lg font-medium text-center'>{fact}</p>
              </CardContent>
            </Card>
          ))}
        </FactsCarousel>
      </div>
    </div>
  )
}

export default InformationScreen
