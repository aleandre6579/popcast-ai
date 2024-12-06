import React from 'react'

interface SupportProps {}

const Support: React.FC<SupportProps> = () => {

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

export default Support
