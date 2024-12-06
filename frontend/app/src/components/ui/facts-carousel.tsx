import React, { useState, useRef, useEffect } from 'react'
import { Button } from './button'
import { ChevronRight, ChevronLeft } from 'lucide-react'

type FactsCarouselProps = {
  children: React.ReactNode
  showArrows?: boolean
  autoScroll?: boolean
  autoScrollInterval?: number
}

const FactsCarousel: React.FC<FactsCarouselProps> = ({
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
      const scrollPosition = (carousel.clientWidth + 4.48) * index
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
    <div className='flex flex-col items-center gap-2'>
      <div
        ref={carouselRef}
        className='flex overflow-hidden gap-1 w-full items-center'
      >
        {items.map((item, index) => (
          <div key={index} className='flex-shrink-0 w-full'>
            {item}
          </div>
        ))}
      </div>
      {showArrows && (
        <div className='flex gap-4'>
          <Button
            variant={'outline'}
            size={'icon'}
            className='rounded-full'
            onClick={scrollPrev}
            aria-label='Previous'
          >
            <ChevronLeft />
          </Button>
          <Button
            variant={'outline'}
            size={'icon'}
            className='rounded-full'
            onClick={scrollNext}
            aria-label='Next'
          >
            <ChevronRight />
          </Button>
        </div>
      )}
    </div>
  )
}

export default FactsCarousel
