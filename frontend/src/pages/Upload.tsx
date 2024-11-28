import { Input } from '@/components/ui/input'
import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../store'
import {
  setFileUploaded,
  openDock,
  closeDock,
  setIsDraggingAudioFile,
} from '../reducers/uploadSlice'
import { addOutline, removeOutline } from '../reducers/outlineSlice'
import useSize from '@/hooks/useSize'
import { clamp } from 'three/src/math/MathUtils.js'
import gsap from 'gsap'
import { ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import DragDetector from '@/components/DragDetector'
import { handleUpload } from '@/utils/upload'
import { Toaster } from 'sonner'

interface UploadProps {}

const Upload: React.FC<UploadProps> = () => {
  const dispatch = useDispatch()
  const { cdPlayer } = useSelector((state: RootState) => state.outline)

  const handleUploadOnHover = (
    e: React.MouseEvent<HTMLInputElement, MouseEvent>,
  ) => {
    e.preventDefault()
    e.stopPropagation()
    if (cdPlayer === null) return
    dispatch(addOutline(cdPlayer))
    dispatch(openDock())
  }

  const handleUploadOffHover = (
    e: React.MouseEvent<HTMLInputElement, MouseEvent>,
  ) => {
    e.preventDefault()
    e.stopPropagation()
    if (cdPlayer === null) return
    dispatch(removeOutline(cdPlayer))
    dispatch(closeDock())
  }

  const handleDrop = (e: DragEvent | React.ChangeEvent) => {
    handleUpload(e, dispatch)
  }

  const [width, height] = useSize()
  const uploadBoxWidth = width * 0.23 + height * 0.4 - 10
  const uploadBoxHeight = width * 0.1 + height * 0.14 + 60

  useEffect(() => {
    const timeline = gsap.timeline({ repeat: -1, ease: 'linear' })

    timeline.fromTo('.tooltip', { y: -10 }, { y: 10, duration: 1 }, 0)
    timeline.to('.tooltip', { y: -10, duration: 1, delay: 2 })

    timeline.fromTo(
      '.downArrow',
      { y: -5 },
      { y: 5, duration: 0.5, repeat: 11, yoyo: true },
      0,
    )
  }, [])

  return (
    <div>
      <h1 className='text-4xl font-extrabold text-center mt-8 tracking-tight'>
        AI insights for your next big hit!
      </h1>
      <p className='text-sm text-center mt-2'>
        Submit your songs and receive quick and meaningful feedback.
      </p>

      <div
        style={{ width: uploadBoxWidth, height: uploadBoxHeight }}
        className='absolute top-[calc(50%+22px)] left-1/2 transform -translate-x-1/2 -translate-y-1/2'
      >
        <p className='tooltip flex justify-center gap-3 text-center absolute top-[-50px] w-full'>
          <ChevronDown className='downArrow' />
          <span>
            Click on the CD player or drop an audio file to get started!
          </span>
          <ChevronDown className='downArrow' />
        </p>

        <Input
          onMouseEnter={e => {
            handleUploadOnHover(e)
          }}
          onMouseLeave={e => {
            handleUploadOffHover(e)
          }}
          onChange={e => {
            handleDrop(e)
          }}
          className='opacity-0 absolute top-0 w-full h-full cursor-pointer'
          type='file'
        />

        <div className='absolute bottom-[-55px] flex justify-center w-full gap-2'>
          <Input className='w-[250px] border-black dark:border-white' />
          <Button>Analyze</Button>
        </div>
      </div>

      <DragDetector />
    </div>
  )
}

export default Upload
