import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { firebaseMethods } from "@app/utils/callFirebaseFunction";
import Scene from "@app/interfaces/Scene";
import { callMicroservice } from "@app/utils/callFirebaseMicroservice";

export interface TitleAndPlotMeta {
  title: string | null;
  genre: number | null;
  audience: number | null;
  summary?: string | null;
  attributes: string[];
  userText: string | null;
}

export interface CreationInitState extends TitleAndPlotMeta {
  creationId: string | null;
  scenes: Scene[];
  maxStep: number;
}

const initialState: CreationInitState = {
  creationId: null,
  title: null,
  audience: null,
  genre: null,
  summary: null,
  userText: null,
  attributes: [],
  scenes: [],
  maxStep: 0,
};

export const fetchTitlePlotMeta = createAsyncThunk<TitleAndPlotMeta, string>(
  "creation/fetchTitlePlotMeta",
  async creationId => {
    const result = await callMicroservice<TitleAndPlotMeta>(firebaseMethods.GET_CREATION_TITLE_PLOT_META, {
      creationId,
    });

    return result;
  }
);

export const fetchScenes = createAsyncThunk<{ scenes: Scene[] }, string>("creation/fetchScenes", async creationId => {
  const result = await callMicroservice<{ scenes: Scene[] }>(firebaseMethods.GET_SCENES, { creationId });

  return result;
});

export const creationSlice = createSlice({
  name: "creation",
  initialState,
  reducers: {
    resetStore: () => {
      return initialState;
    },
    setCreationId: (state, action: PayloadAction<{ creationId?: string | null }>) => {
      const { payload } = action;
      state.creationId = payload.creationId ?? null;
    },
    setScenes: (state, action: PayloadAction<{ scenes: Scene[] }>) => {
      const { payload } = action;
      state.scenes = payload.scenes;
    },
    setCreationMeta: (state, action: PayloadAction<Partial<TitleAndPlotMeta>>) => {
      const { payload } = action;
      state.title = payload.title || state.title;
      state.genre = payload.genre ?? state.genre;
      state.audience = payload.audience ?? state.audience;
      state.attributes = payload.attributes || state.attributes;
      state.summary = payload.summary || state.summary;
      state.userText = payload.userText || state.userText;
    },
    setSummary: (state, action: PayloadAction<{ summary: string | null }>) => {
      const { payload } = action;
      state.summary = payload.summary;
    },
    setMaxStep: (state, action: PayloadAction<{ maxStep: number }>) => {
      const { payload } = action;
      state.maxStep = payload.maxStep;
    },
  },
  extraReducers: builder => {
    builder.addCase(fetchScenes.fulfilled, (state, action) => {
      const { payload } = action;
      state.scenes = payload.scenes;
    });
    builder.addCase(fetchTitlePlotMeta.fulfilled, (state, action) => {
      const { payload } = action;
      state.title = payload.title || state.title;
      state.genre = payload.genre ?? state.genre;
      state.audience = payload.audience ?? state.audience;
      state.attributes = payload.attributes || state.attributes;
      state.summary = payload.summary || state.summary;
      state.userText = payload.userText || state.userText;
    });
  },
});

export const { resetStore, setCreationId, setCreationMeta, setScenes, setSummary, setMaxStep } = creationSlice.actions;

export default creationSlice.reducer;
