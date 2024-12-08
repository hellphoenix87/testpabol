import { configureStore } from "@reduxjs/toolkit";
import userSlice from "../slices/userSlice";
import utilsSlice from "../slices/utilsSlice";

const store = configureStore({
  reducer: {
    user: userSlice,
    utils: utilsSlice,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
