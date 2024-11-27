import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Object3D, Mesh } from 'three'

interface OutlineState {
  outlinedObjects: Object3D[]
  cdPlayer: Object3D | null
}

const initialState: OutlineState = {
  outlinedObjects: [],
  cdPlayer: null,
}

const outlineSlice = createSlice({
  name: 'outline',
  initialState,
  reducers: {
    addOutline: (state, action: PayloadAction<Object3D>) => {
      const object = action.payload
      object.traverse(child => {
        if (child instanceof Mesh && !state.outlinedObjects.includes(child)) {
          state.outlinedObjects.push(child)
        } else {
          addOutline(child)
        }
      })
    },
    removeOutline: (state, action: PayloadAction<Object3D>) => {
      const object = action.payload
      object.traverse(child => {
        if (child instanceof Mesh && state.outlinedObjects.includes(child)) {
          const index = state.outlinedObjects.findIndex(
            obj => obj === child,
          )
          if (index !== -1) {
            state.outlinedObjects.splice(index, 1)
          }
        } else {
          removeOutline(child)
        }
      })
    },
    setCdPlayer: (state, action: PayloadAction<Object3D>) => {
      state.cdPlayer = action.payload
    },
  },
})

export const { addOutline, removeOutline, setCdPlayer } = outlineSlice.actions

export default outlineSlice.reducer
