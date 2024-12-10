import {
  setAudioFileUploaded,
  setIsDraggingAudioFile,
} from '@/reducers/uploadSlice';
import { Dispatch } from '@reduxjs/toolkit';
import React from 'react';
import { fileUploadErrorToast, fileUploadSuccessToast } from './toasts';

export const handleUpload = (
  e: DragEvent | React.ChangeEvent,
  dispatch: Dispatch,
) => {
  e.preventDefault();
  e.stopPropagation();

  dispatch(setIsDraggingAudioFile(false));

  let files: FileList | null = null;

  // Handling DragEvent
  if ('dataTransfer' in e && e.dataTransfer) {
    files = e.dataTransfer.files;
    // Handling React.ChangeEvent
  } else if ('target' in e && e.target instanceof HTMLInputElement) {
    files = e.target.files;
  }

  if (files && files.length > 0) {
    const audioFile = Array.from(files).find(file =>
      file.type.startsWith('audio/'),
    );
    if (audioFile) {
      fileUploadSuccessToast();
      dispatch(
        setAudioFileUploaded({
          audioFile: audioFile,
          audioFileName: audioFile.name,
        }),
      );
    } else {
      fileUploadErrorToast('The file you uploaded is not audio!');
    }
  }
};

export const cutExtension = (filename: string) => {
  return filename.substring(0, filename.lastIndexOf('.'));
};
