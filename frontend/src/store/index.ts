import { configureStore } from '@reduxjs/toolkit';

// 临时的空 store，稍后会添加 reducers
export const store = configureStore({
  reducer: {
    // 稍后添加 reducers
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;