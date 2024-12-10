import { cutExtension } from '@/utils/upload';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type SetAudioFileUploadedPayload = {
  audioFileName: string;
  audioFile: File;
};

interface UploadState {
  uploaded: boolean;
  uploadedFileName: string | undefined;
  uploadedFile: File | undefined;
  openDock: boolean;
  isDraggingAudioFile: boolean;
}

const initialState: UploadState = {
  uploaded: false,
  uploadedFileName: undefined,
  uploadedFile: undefined,
  openDock: false,
  isDraggingAudioFile: false,
};

const uploadSlice = createSlice({
  name: 'upload',
  initialState,
  reducers: {
    setIsDraggingAudioFile: (state, action: PayloadAction<boolean>) => {
      state.isDraggingAudioFile = action.payload;
    },
    setAudioFileUploaded: (
      state,
      action: PayloadAction<SetAudioFileUploadedPayload>,
    ) => {
      state.uploaded = true;
      state.uploadedFileName = cutExtension(action.payload.audioFileName);
      state.uploadedFile = action.payload.audioFile;
    },
    resetFileUploaded: state => {
      state.uploaded = false;
      state.uploadedFileName = undefined;
      state.uploadedFile = undefined;
    },
    openDock: state => {
      state.openDock = true;
    },
    closeDock: state => {
      state.openDock = false;
    },
  },
});

export const {
  setIsDraggingAudioFile,
  setAudioFileUploaded,
  resetFileUploaded,
  openDock,
  closeDock,
} = uploadSlice.actions;

export default uploadSlice.reducer;
