import { Input } from '@/components/ui/input';
import React, { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { openDock, closeDock } from '../reducers/uploadSlice';
import { addOutline, removeOutline } from '../reducers/outlineSlice';
import useSize from '@/hooks/useSize';
import { Button } from '@/components/ui/button';
import DragDetector from '@/components/DragDetector';
import { handleUpload } from '@/utils/upload';
import { useNavigate } from 'react-router-dom';
import AnimatedTooltip from '@/components/ui/animated-tooltip';
import axiosReq from '@/axios';
import axios from 'axios';
import gsap from 'gsap';

const Upload: React.FC = () => {
  //GSAP animations on render
  useEffect(() => {
    const onRenderTimeline = gsap.timeline();
    onRenderTimeline
      .fromTo(
        '.title',
        { y: '-=50', opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8 },
      )
      .fromTo(
        '.subtitle',
        { y: '-=50', opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8 },
        0.3,
      )
      .fromTo(
        '.tooltip',
        { opacity: 0, ease: 'elastic.inOut' },
        { opacity: 1, duration: 0.8 },
        1,
      );
  }, []);

  const dispatch = useDispatch();
  const { cdPlayer } = useSelector((state: RootState) => state.outline);
  const { uploadedFile, uploadedFileName } = useSelector(
    (state: RootState) => state.upload,
  );

  const navigate = useNavigate();

  const handleUploadOnHover = (
    e: React.MouseEvent<HTMLInputElement, MouseEvent>,
  ) => {
    e.preventDefault();
    e.stopPropagation();
    if (cdPlayer === null) return;
    dispatch(addOutline(cdPlayer));
    dispatch(openDock());
  };

  const handleUploadOffHover = (
    e: React.MouseEvent<HTMLInputElement, MouseEvent>,
  ) => {
    e.preventDefault();
    e.stopPropagation();
    if (cdPlayer === null) return;
    dispatch(removeOutline(cdPlayer));
    dispatch(closeDock());
  };

  const handleDrop = (e: DragEvent | React.ChangeEvent) => {
    handleUpload(e, dispatch);
  };

  async function handleAnalyzePress() {
    if (!uploadedFile) return;

    const formData = new FormData();
    formData.append('file', uploadedFile);

    try {
      const response = await axiosReq.post('/analysis', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('Response:', response.data);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(
          'Axios error response:',
          error.response?.data || error.message,
        );
      } else {
        console.error('Unexpected error:', error);
      }
    }

    navigate('/analysis');
  }

  const [width, height] = useSize();
  const uploadBoxWidth = width * 0.23 + height * 0.4 - 10;
  const uploadBoxHeight = width * 0.1 + height * 0.14 + 60;

  const titleInputRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!titleInputRef.current) return;

    if (!uploadedFileName) {
      titleInputRef.current.style.display = 'none';
    } else {
      titleInputRef.current.style.display = 'flex';
    }
  }, [uploadedFileName]);

  return (
    <div>
      <h1 className='title text-4xl font-extrabold text-center mt-8 tracking-tight'>
        AI insights for your next big hit!
      </h1>
      <p className='subtitle text-sm text-center mt-2'>
        Submit your songs and receive quick and meaningful feedback.
      </p>

      <div
        style={{ width: uploadBoxWidth, height: uploadBoxHeight }}
        className='absolute top-[calc(50%+22px)] left-1/2 transform -translate-x-1/2 -translate-y-1/2'
      >
        <AnimatedTooltip />

        <Input
          onMouseEnter={e => {
            handleUploadOnHover(e);
          }}
          onMouseLeave={e => {
            handleUploadOffHover(e);
          }}
          onChange={e => {
            handleDrop(e);
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
          <Button onClick={() => handleAnalyzePress()}>Analyze</Button>
        </div>
      </div>

      <DragDetector />
    </div>
  );
};

export default Upload;
