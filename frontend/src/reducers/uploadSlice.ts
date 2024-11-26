import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface UploadState {
  uploaded: boolean
  uploadedFileName: string | null
  openDock: boolean
}

const initialState: UploadState = {
  uploaded: false,
  uploadedFileName: null,
  openDock: false,
}

const uploadSlice = createSlice({
  name: 'upload',
  initialState,
  reducers: {
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

export const { setFileUploaded, resetFileUploaded, openDock, closeDock } = uploadSlice.actions

export default uploadSlice.reducer
