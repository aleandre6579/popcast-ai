import { Button } from '@/components/ui/button'
import { UserIcon } from 'lucide-react'
import React, { useState } from 'react'
import { ModeToggle } from './ModeToggle'
import { useSelector } from 'react-redux'
import { RootState } from '@/store'
import { setIsDraggingAudioFile } from '@/reducers/uploadSlice'

interface DragDetectorProps {}

const DragDetector: React.FC<DragDetectorProps> = () => {

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isAudioFile(e)) {
      setIsDraggingAudioFile(true);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    console.log("ASDASD");
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingAudioFile(false);
  };

  const isAudioFile = (e: React.DragEvent): boolean => {
    const files = e.dataTransfer.files;
    if (files.length) {
      return Array.from(files).some((item) => 
        item.type.startsWith("audio/")
      );
    }
    return false;
  };

  document.body.addEventListener("dragenter", handleDragEnter);
    document.body.addEventListener("dragover", handleDragOver);
    document.body.addEventListener("dragleave", handleDragLeave);
    document.body.addEventListener("drop", handleDrop);

    <div
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className='absolute top-0 left-0 w-full h-full z-50 pointer-events-auto'
    />
  )
}

export default DragDetector
