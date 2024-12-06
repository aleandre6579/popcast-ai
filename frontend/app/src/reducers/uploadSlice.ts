import { cutExtension } from '@/utils/upload'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface UploadState {
  uploaded: boolean
  uploadedFileName: string | undefined
  openDock: boolean
  isDraggingAudioFile: boolean
}

const initialState: UploadState = {
  uploaded: false,
  uploadedFileName: undefined,
  openDock: false,
  isDraggingAudioFile: false,
}

const uploadSlice = createSlice({
  name: 'upload',
  initialState,
  reducers: {
    setIsDraggingAudioFile: (state, action: PayloadAction<boolean>) => {
      state.isDraggingAudioFile = action.payload
    },
    setFileUploaded: (state, action: PayloadAction<string>) => {
      state.uploaded = true
      state.uploadedFileName = cutExtension(action.payload)
    },
    resetFileUploaded: state => {
      state.uploaded = false
      state.uploadedFileName = undefined
    },
    openDock: state => {
      state.openDock = true
    },
    closeDock: state => {
      state.openDock = false
    },
  },
})

export const {
  setIsDraggingAudioFile,
  setFileUploaded,
  resetFileUploaded,
  openDock,
  closeDock,
} = uploadSlice.actions

export default uploadSlice.reducer
