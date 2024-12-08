import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import SortTypes from "@app/constants/SortTypes";
import { ToastState } from "@app/interfaces/Utils";

interface FilterState {
  selectedGenre: string | null;
  sortType: SortTypes;
}

interface UtilsState {
  loginOpen: boolean;
  toast: ToastState | null;
  filter: FilterState;
}

const initialState: UtilsState = {
  loginOpen: false,
  toast: null,
  filter: {
    selectedGenre: null,
    sortType: SortTypes.RELEVANCE,
  },
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
    setToastOpen: (state, action: PayloadAction<ToastState>) => {
      const { payload } = action;
      state.toast = {
        message: payload.message,
        type: payload.type,
      };
    },
    setToastClosed: state => {
      state.toast = null;
    },
    addFilterSelectedGenre: (state, action: PayloadAction<string>) => {
      const { payload } = action;
      state.filter = {
        ...state.filter,
        selectedGenre: payload,
      };
    },
    removeFilterSelectedGenre: state => {
      state.filter = {
        ...state.filter,
        selectedGenre: null,
      };
    },
    restFilter: state => {
      state.filter = {
        ...state.filter,
        selectedGenre: null,
      };
    },
    setSortType: (state, action: PayloadAction<SortTypes>) => {
      const { payload } = action;
      state.filter = {
        ...state.filter,
        sortType: payload,
      };
    },
  },
});

export const {
  resetStore,
  setLoginOpen,
  setToastOpen,
  setToastClosed,
  restFilter,
  addFilterSelectedGenre,
  removeFilterSelectedGenre,
  setSortType,
} = utilsSlice.actions;

export default utilsSlice.reducer;
