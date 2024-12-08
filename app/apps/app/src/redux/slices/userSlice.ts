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
  newsletter?: string | boolean | null;
  is_creator?: boolean | null;
  is_welcomed?: boolean | null;
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
  newsletter: null,
  is_creator: false,
  is_welcomed: false,
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
      state.avatar_url = payload.avatar_url;
      state.about = payload.about ?? state.about;
      state.header_url = payload.header_url ?? state.header_url;
      state.twitter = payload.twitter ?? state.twitter;
      state.instagram = payload.instagram ?? state.instagram;
      state.web = payload.web ?? state.web;
      state.location = payload.location ?? state.location;
      state.loggedIn = payload.loggedIn ?? state.loggedIn;
      state.is_creator = payload.is_creator;
      state.is_welcomed = payload.is_welcomed;
      state.authDataPending = false;
      state.newsletter = payload.newsletter;
    },
  },
});

export const { resetStore, setUser } = userSlice.actions;

export default userSlice.reducer;
