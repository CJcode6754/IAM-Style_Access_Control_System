import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/api";

export const fetchModules = createAsyncThunk(
  "modules/fetchModules",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/modules");
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const createModule = createAsyncThunk(
  "modules/createModule",
  async (moduleData, { rejectWithValue }) => {
    try {
      const response = await api.post("/modules", moduleData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const updateModule = createAsyncThunk(
  "modules/updateModule",
  async ({ id, moduleData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/modules/${id}`, moduleData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const deleteModule = createAsyncThunk(
  "modules/deleteModule",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/modules/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const initialState = {
  modules: [],
  isLoading: false,
  error: null,
};

const moduleSlice = createSlice({
  name: "modules",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchModules.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchModules.fulfilled, (state, action) => {
        state.isLoading = false;
        state.modules = Array.isArray(action.payload?.modules)
          ? action.payload.modules
          : Array.isArray(action.payload)
          ? action.payload
          : [];
      })
      .addCase(fetchModules.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(createModule.fulfilled, (state, action) => {
        state.modules.push(action.payload);
      })
      .addCase(updateModule.fulfilled, (state, action) => {
        const index = state.modules.findIndex(
          (module) => module.id === action.payload.id
        );
        if (index !== -1) {
          state.modules[index] = action.payload;
        }
      })
      .addCase(deleteModule.fulfilled, (state, action) => {
        state.modules = state.modules.filter(
          (module) => module.id !== action.payload
        );
      });
  },
});

export const { clearError } = moduleSlice.actions;
export default moduleSlice.reducer;
