import { Input } from '@/components/ui/input'
import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../store'
import { setFileUploaded, openDock, closeDock } from '../reducers/uploadSlice'
import { addOutline, removeOutline } from '../reducers/outlineSlice'
import useSize from '@/hooks/useSize'
import { clamp } from 'three/src/math/MathUtils.js'
import gsap from 'gsap'
import { ChevronDown } from 'lucide-react'

interface UploadProps {}

const Upload: React.FC<UploadProps> = () => {
  const dispatch = useDispatch()
  const { cdPlayer } = useSelector((state: RootState) => state.outline)

  const handleUploadOnHover = () => {
    if (cdPlayer === null) return
    dispatch(addOutline(cdPlayer))
    dispatch(openDock())
  }

  const handleUploadOffHover = () => {
    if (cdPlayer === null) return
    dispatch(removeOutline(cdPlayer))
    dispatch(closeDock())
  }

  const handleFileUpload = (file: File) => {
    dispatch(setFileUploaded(file.name))
  }

  const [width, height] = useSize()
  const uploadBoxWidth = width * 0.23 + height * 0.4 - 10
  const uploadBoxHeight = width * 0.1 + height * 0.14 + 60

  useEffect(() => {
    const timeline = gsap.timeline({ repeat: -1, yoyo: true, ease: 'linear' })

    timeline.fromTo('.animateUpDown', { y: -10 }, { y: 10, duration: 2 }, 0)

    timeline
      .fromTo('.downArrow', { y: 0 }, { y: 10, duration: 0.5 }, 0)
      .to('.chevron', { y: 0, duration: 0.5 })
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
        <p className='animateUpDown flex justify-center gap-5 text-center absolute top-[-50px] w-full'>
          <ChevronDown className='downArrow' />
          <span>Click the CD player or drag an audio file to get started!</span>
          <ChevronDown className='downArrow' />
        </p>

        <Input
          onMouseEnter={handleUploadOnHover}
          onMouseLeave={handleUploadOffHover}
          onChange={e => {
            if (e.target.files && e.target.files[0]) {
              handleFileUpload(e.target.files[0])
            }
          }}
          className='opacity-0 absolute top-0 w-full h-full'
          type='file'
        />
      </div>
    </div>
  )
}

export default Upload
