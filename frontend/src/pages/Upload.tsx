import { Input } from '@/components/ui/input'
import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../store';
import { setFileUploaded, openDock, closeDock } from '../reducers/uploadSlice';
import useSize from '@/hooks/useSize';
import { clamp } from 'three/src/math/MathUtils.js';

interface UploadProps {}

const Upload: React.FC<UploadProps> = () => {

  const dispatch = useDispatch();

  const handleUploadOnHover = () => {
    dispatch(openDock());
  }

  const handleUploadOffHover = () => {
    dispatch(closeDock());
  }

  const handleFileUpload = (file: File) => {
    dispatch(setFileUploaded(file.name));
  }

  const [width, height] = useSize()
  const uploadBoxWidth = (width * 0.23 + height * 0.4) - 10
  const uploadBoxHeight = (width * 0.1 + height * 0.14) + 60

  return (
    <div>
      <h1 className='text-4xl font-extrabold text-center mt-8 tracking-tight'>
        AI insights for your next big hit!
      </h1>
      <p className='text-sm text-center mt-2'>
        Submit your songs and receive quick and meaningful feedback.
      </p>

      <Input
        onMouseEnter={handleUploadOnHover}
        onMouseLeave={handleUploadOffHover}
        onChange={e => {
          if (e.target.files && e.target.files[0]) {
            handleFileUpload(e.target.files[0])
          }
        }}
        style={{width: uploadBoxWidth, height: uploadBoxHeight}}
        className='absolute top-[calc(50%+22px)] left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-1'
        type='file'
      />
    </div>
  )
}

export default Upload
