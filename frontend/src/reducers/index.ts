import { combineReducers } from '@reduxjs/toolkit'
import uploadReducer from './uploadSlice'

const rootReducer = combineReducers({
  upload: uploadReducer,
})

export default rootReducer
