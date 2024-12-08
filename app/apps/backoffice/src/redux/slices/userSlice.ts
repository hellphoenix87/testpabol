import { PayloadAction, createSlice } from "@reduxjs/toolkit";

interface UserState {
  uid: string | null;
  loggedIn: boolean;
  authDataPending: boolean;
  display_name: string | null;
  email: string | null;
  about: string | null;
  avatar_url?: ArrayBuffer | string | null;
  header_url: string | null;
  twitter: string | null;
  instagram: string | null;
  web: string | null;
  location: string | null;
}

const initialState: UserState = {
  uid: null,
  loggedIn: false,
  authDataPending: true,
  display_name: null,
  email: null,
  about: null,
  avatar_url: null,
  header_url: null,
  twitter: null,
  instagram: null,
  web: null,
  location: null,
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    resetStore: () => {
      return initialState;
    },
    setUser: (state, action: PayloadAction<Partial<UserState>>) => {
      const { payload } = action;
      state.uid = payload.uid ?? state.uid;
      state.display_name = payload.display_name ?? state.display_name;
      state.email = payload.email ?? state.email;
      state.loggedIn = payload.loggedIn ?? state.loggedIn;
    },
  },
});

export const { resetStore, setUser } = userSlice.actions;

export default userSlice.reducer;
