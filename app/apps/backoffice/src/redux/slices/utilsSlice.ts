import { PayloadAction, createSlice } from "@reduxjs/toolkit";

interface UtilsState {
  loginOpen: boolean;
}

const initialState: UtilsState = {
  loginOpen: false,
};

export const utilsSlice = createSlice({
  name: "utils",
  initialState,
  reducers: {
    resetStore: () => {
      return initialState;
    },
    setLoginOpen: (state, action: PayloadAction<{ loginOpen: boolean }>) => {
      const { payload } = action;
      state.loginOpen = payload.loginOpen;
    },
  },
});

export const { resetStore, setLoginOpen } = utilsSlice.actions;

export default utilsSlice.reducer;
