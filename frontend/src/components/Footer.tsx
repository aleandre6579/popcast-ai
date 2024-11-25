import React, { useEffect, useReducer, useRef, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useThree } from '@react-three/fiber'
import * as Slider from '@radix-ui/react-slider'
import useSize from "../hooks/useSize"

interface FooterProps {}

const Footer: React.FC<FooterProps> = () => {
  const pages = [
    { name: 'Upload', path: '/' },
    { name: 'Analysis', path: '/analysis' },
    { name: 'Results', path: '/results' },
    { name: 'Support', path: '/support' },
  ]

  const [ width, height ] = useSize()
  const footerWidth = width * 4 / 6
  const sliderWidth = footerWidth - 40
  const sliderSectionWidth = sliderWidth / 1.32 - 30
  //const sliderSectionGap = 10000 / sliderSectionWidth * 1 - 2
  const sliderSectionGap = 18.3
  console.log(sliderSectionWidth);
  
  
  return (
    <footer className='w-full p-10 flex flex-col items-center'>
      <div style={{width: footerWidth}} className='flex flex-col items-center gap-4'>
        <nav className='w-full flex justify-between relative'>
          {pages.map(page => (
            <div className='w-full'>
              <NavLink
                key={page.name}
                to={page.path}
                className={({ isActive }) =>
                  `text-sm font-medium flex flex-col items-center ${
                    isActive
                      ? 'font-black'
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

        <div style={{gap: sliderSectionGap}} className='w-full flex justify-center relative'>
          <span style={{width: sliderSectionWidth / 3}} className='bg-black dark:bg-white h-1' />
          <span style={{width: sliderSectionWidth / 3}} className='bg-black dark:bg-white h-1' />
          <span style={{width: sliderSectionWidth / 3}} className='bg-black dark:bg-white h-1' />
          
          <span className='absolute left-[68px] top-[-8px] rounded-full bg-black dark:bg-white size-5 block' />
        </div>
      </div>
    </footer>
  )
}
export default Footer
