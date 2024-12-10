import { combineReducers } from '@reduxjs/toolkit';
import uploadReducer from './uploadSlice';
import outlineReducer from './outlineSlice';
import routerReducer from './routerSlice';

const rootReducer = combineReducers({
  upload: uploadReducer,
  outline: outlineReducer,
  router: routerReducer,
});

export default rootReducer;
