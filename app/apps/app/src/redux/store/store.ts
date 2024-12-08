import { configureStore } from "@reduxjs/toolkit";
import creationSlice from "../slices/creationSlice";
import userSlice from "../slices/userSlice";
import utilsSlice from "../slices/utilsSlice";

const store = configureStore({
  reducer: {
    creation: creationSlice,
    user: userSlice,
    utils: utilsSlice,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
