import { configureStore } from '@reduxjs/toolkit';
import rootReducer from './reducers'; // Assuming you have a rootReducer file

// Create the Redux store
const store = configureStore({
  reducer: rootReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: false, // Customize middleware settings if needed
    }),
  devTools: process.env.NODE_ENV !== 'production', // Enable Redux DevTools in development
});

// Export the store
export default store;

// Define the RootState and AppDispatch types for type inference in your app
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
