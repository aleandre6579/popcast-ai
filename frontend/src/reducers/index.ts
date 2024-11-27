import { combineReducers } from '@reduxjs/toolkit'
import uploadReducer from './uploadSlice'
import outlineReducer from './outlineSlice'

const rootReducer = combineReducers({
  upload: uploadReducer,
  outline: outlineReducer,
})

export default rootReducer
