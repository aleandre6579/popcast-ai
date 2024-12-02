import { Input } from '@/components/ui/input'
import React, { useEffect, useRef } from 'react'
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
import { useNavigate } from 'react-router-dom'
import AnimatedTooltip from '@/components/ui/animated-tooltip'

interface UploadProps {}

const Upload: React.FC<UploadProps> = () => {
  const dispatch = useDispatch()
  const { cdPlayer } = useSelector((state: RootState) => state.outline)
  const { uploadedFileName } = useSelector((state: RootState) => state.upload)

  const navigate = useNavigate()

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

  const titleInputRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!titleInputRef.current) return

    if (!uploadedFileName) {
      titleInputRef.current.style.display = 'none'
    } else {
      titleInputRef.current.style.display = 'flex'
    }
  }, [uploadedFileName])

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
        <AnimatedTooltip />

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

        <div
          ref={titleInputRef}
          className='absolute bottom-[-55px] flex justify-center w-full gap-2'
        >
          <Input
            value={uploadedFileName}
            className='w-[250px] border-black dark:border-white'
          />
          <Button onClick={() => navigate('/analysis')}>Analyze</Button>
        </div>
      </div>

      <DragDetector />
    </div>
  )
}

export default Upload
