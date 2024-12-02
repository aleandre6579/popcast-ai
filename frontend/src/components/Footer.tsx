import React, { useEffect, useRef } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import useSize from '../hooks/useSize.ts'
import { gsap } from 'gsap'
import clsx from 'clsx'

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

  const footerWidth = Math.min(width * 5/9, 600)
  const footerSectionGap = 16.5
  const footerSectionWidth = footerWidth / 3 - footerSectionGap * 2

  const markerRef = useRef<HTMLSpanElement>(null)
  const markerLeft =
    (footerWidth - footerSectionWidth * 3 - footerSectionGap * 4) / 2

  useEffect(() => {
    if (markerRef.current) {
      markerRef.current.style.left = `${markerLeft}px`
    }
  }, [markerLeft])

  useEffect(() => {
    let pageIndex = 0
    for (let i = 0; i < pages.length; i++) {
      if (pages[i].path === location.pathname) {
        pageIndex = i
      }
    }

    gsap.to(markerRef.current, {
      x: pageIndex * (footerSectionWidth + footerSectionGap - 0.75),
      duration: 0.75,
      ease: 'power3',
    })
  }, [location.pathname, footerSectionWidth, footerSectionGap])

  return (
    <footer className="w-full p-10 flex flex-col items-center">
      <div
      style={{width: footerWidth}}
        className="flex flex-col gap-4 relative"
      >
        <nav className="w-full flex justify-between relative">
          {pages.map((page) => (
            <div key={page.name}>
              <NavLink
                to={page.path}
                className={({ isActive }) =>
                  `text-sm font-medium ${
                    isActive
                      ? 'font-[1000]'
                      : 'font-[300] hover:text-gray-900 dark:hover:text-gray-100'
                  }`
                }
              >
                {page.name === 'Support' ? (
                  <span className="text-red-600 w-full flex flex-col items-center">
                    {page.name}
                    <span className="z-10 top-7 rounded-full border-4 border-red-600 border-solid absolute size-5 block" />
                  </span>
                ) : (
                  <span className="w-full flex flex-col items-center">
                    {page.name}
                    <span className="z-10 top-7 rounded-full border-4 border-black border-solid dark:border-white absolute size-5 block" />
                  </span>
                )}
              </NavLink>
            </div>
          ))}
        </nav>

        <div
          style={{ gap: footerSectionGap }}
          className="w-full flex justify-center relative"
        >
          <span
            style={{ width: footerSectionWidth }}
            className="bg-black dark:bg-white h-1"
          />
          <span
            style={{ width: footerSectionWidth }}
            className="bg-black dark:bg-white h-1"
          />
          <span
            style={{ width: footerSectionWidth }}
            className="bg-black dark:bg-white h-1"
          />

          <span
            ref={markerRef}
            className={clsx(
              location.pathname === '/support'
                ? 'bg-red-600'
                : 'bg-black dark:bg-white',
              'absolute top-[-6px] rounded-full size-[17px] block'
            )}
          />
        </div>
      </div>
    </footer>
  )
}
export default Footer
