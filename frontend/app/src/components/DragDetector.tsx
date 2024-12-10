import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import {
  closeDock,
  openDock,
  setIsDraggingAudioFile,
} from '@/reducers/uploadSlice';
import { handleUpload } from '@/utils/upload';

interface DragDetectorProps {}

const DragDetector: React.FC<DragDetectorProps> = () => {
  const dispatch = useDispatch();
  const { isDraggingAudioFile } = useSelector(
    (state: RootState) => state.upload,
  );

  let dragCounter = 0;

  const handleDragEnter = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter++;
    if (dragCounter === 1) dispatch(setIsDraggingAudioFile(true));
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter--;
    if (dragCounter === 0) dispatch(setIsDraggingAudioFile(false));
  };

  const handleDrop = (e: DragEvent) => {
    dragCounter = 0;
    handleUpload(e, dispatch);
  };

  useEffect(() => {
    document.body.addEventListener('dragenter', handleDragEnter);
    document.body.addEventListener('dragover', handleDragOver);
    document.body.addEventListener('dragleave', handleDragLeave);
    document.body.addEventListener('drop', handleDrop);

    // Cleanup on component unmount
    return () => {
      document.body.removeEventListener('dragenter', handleDragEnter);
      document.body.removeEventListener('dragover', handleDragOver);
      document.body.removeEventListener('dragleave', handleDragLeave);
      document.body.removeEventListener('drop', handleDrop);
    };
  }, []);

  useEffect(() => {
    if (isDraggingAudioFile) {
      dispatch(openDock());
    } else {
      dispatch(closeDock());
    }
  }, [isDraggingAudioFile]);

  return <></>;
};

export default DragDetector;
