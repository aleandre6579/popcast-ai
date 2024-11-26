import React, { useEffect, useReducer, useRef, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import useSize from '../hooks/useSize.ts'
import { gsap } from 'gsap'

interface FooterProps {}

const Footer: React.FC<FooterProps> = () => {
  const location = useLocation()
  const [width, _] = useSize()

  const pages = [
    { name: 'Upload', path: '/' },
    { name: 'Analysis', path: '/analysis' },
    { name: 'Results', path: '/results' },
    { name: 'Support', path: '/support' },
  ]

  let pageIndex = 0
  for (let i = 0; i < pages.length; i++) {
    if (pages[i].path === location.pathname) {
      pageIndex = i
    }
  }

  // Draw footer
  const footerWidth = (width * 4) / 6
  const sliderWidth = footerWidth - 40
  const sliderSectionWidth = (sliderWidth / 1.314 - 30) / 3
  const sliderSectionGap = 18.3
  const markerLeftBase =
    (footerWidth - (sliderSectionWidth + sliderSectionGap * 2) * 3) / 2 +
    sliderSectionGap

  // Animate marker
  const markerRef = useRef(null)
  let markerTween = gsap.to(markerRef.current, {
    x: pageIndex * (sliderSectionWidth + sliderSectionGap - 0.75),
    duration: 0.75,
    ease: 'power3',
  })
  markerTween.play()

  return (
    <footer className='w-full p-10 flex flex-col items-center'>
      <div
        style={{ width: footerWidth }}
        className='flex flex-col items-center gap-4 relative'
      >
        <nav className='w-full flex justify-between relative'>
          {pages.map(page => (
            <div key={page.name} className='w-full'>
              <NavLink
                to={page.path}
                className={({ isActive }) =>
                  `text-sm font-medium flex flex-col items-center ${
                    isActive
                      ? 'font-[800]'
                      : 'hover:text-gray-900 dark:hover:text-gray-100'
                  }`
                }
              >
                {page.name}
                <span className='z-10 top-7 rounded-full border-4 border-black border-solid dark:border-white absolute size-5 block' />
              </NavLink>
            </div>
          ))}
        </nav>

        <div
          style={{ gap: sliderSectionGap }}
          className='w-full flex justify-center relative'
        >
          <span
            style={{ width: sliderSectionWidth }}
            className='bg-black dark:bg-white h-1'
          />
          <span
            style={{ width: sliderSectionWidth }}
            className='bg-black dark:bg-white h-1'
          />
          <span
            style={{ width: sliderSectionWidth }}
            className='bg-black dark:bg-white h-1'
          />

          <span
            ref={markerRef}
            style={{ left: markerLeftBase }}
            className='absolute top-[-8px] rounded-full bg-black dark:bg-white size-5 block'
          />
        </div>
      </div>
    </footer>
  )
}
export default Footer
