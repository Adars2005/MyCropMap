import { configureStore } from '@reduxjs/toolkit';
import uploadReducer from '../features/upload/uploadSlice';
import plantReducer from '../features/plants/plantSlice';
import uiReducer from '../features/ui/uiSlice';

export const store = configureStore({
  reducer: {
    upload: uploadReducer,
    plants: plantReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types for File objects
        ignoredActions: ['upload/uploadToCloudinary/pending'],
        // Ignore these field paths in all actions
        ignoredActionPaths: ['payload.files', 'meta.arg'],
        // Ignore these paths in the state
        ignoredPaths: ['upload.files'],
      },
    }),
});

export default store;
