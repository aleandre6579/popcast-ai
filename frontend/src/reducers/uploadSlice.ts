import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface UploadState {
  uploaded: boolean
  uploadedFileName: string | null
  openDock: boolean
  isDraggingAudioFile: boolean
}

const initialState: UploadState = {
  uploaded: false,
  uploadedFileName: null,
  openDock: false,
  isDraggingAudioFile: false
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
      state.uploadedFileName = action.payload
    },
    resetFileUploaded: state => {
      state.uploaded = false
      state.uploadedFileName = null
    },
    openDock: state => {
      state.openDock = true
    },
    closeDock: state => {
      state.openDock = false
    },
  },
})

export const { setIsDraggingAudioFile, setFileUploaded, resetFileUploaded, openDock, closeDock } =
  uploadSlice.actions

export default uploadSlice.reducer
