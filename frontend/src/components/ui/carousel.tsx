import React, { useState, useRef, useEffect } from 'react'

type CarouselProps = {
  children: React.ReactNode
  showArrows?: boolean
  autoScroll?: boolean
  autoScrollInterval?: number
}

const Carousel: React.FC<CarouselProps> = ({
  children,
  showArrows = true,
  autoScroll = false,
  autoScrollInterval = 3000,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const carouselRef = useRef<HTMLDivElement>(null)
  const items = React.Children.toArray(children)

  const scrollToIndex = (index: number) => {
    const carousel = carouselRef.current
    if (carousel) {
      const scrollPosition = carousel.clientWidth * index
      carousel.scrollTo({ left: scrollPosition, behavior: 'smooth' })
    }
    setCurrentIndex(index)
  }

  const scrollPrev = () => {
    const prevIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1
    scrollToIndex(prevIndex)
  }

  const scrollNext = () => {
    const nextIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0
    scrollToIndex(nextIndex)
  }

  useEffect(() => {
    if (!autoScroll) return

    const interval = setInterval(() => {
      scrollNext()
    }, autoScrollInterval)

    return () => clearInterval(interval)
  }, [currentIndex, autoScroll, autoScrollInterval])

  return (
    <div className='relative overflow-hidden'>
      {showArrows && (
        <button
          className='absolute left-2 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white p-2 rounded-full'
          onClick={scrollPrev}
          aria-label='Previous'
        >
          &larr;
        </button>
      )}
      <div
        ref={carouselRef}
        className='flex overflow-hidden snap-x snap-mandatory'
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {items.map((item, index) => (
          <div
            key={index}
            className='flex-shrink-0 w-full snap-start'
            style={{ width: '100%' }}
          >
            {item}
          </div>
        ))}
      </div>
      {showArrows && (
        <button
          className='absolute right-2 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white p-2 rounded-full'
          onClick={scrollNext}
          aria-label='Next'
        >
          &rarr;
        </button>
      )}
    </div>
  )
}

export default Carousel
