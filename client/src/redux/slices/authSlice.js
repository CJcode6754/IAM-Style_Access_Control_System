import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';

export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', response.data.token);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const fetchUserPermissions = createAsyncThunk(
  'auth/me/permissions',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/auth/me/permissions');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const simulateAction = createAsyncThunk(
  'auth/simulateAction',
  async ({ module, action }, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/simulate-action', { module, action });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  permissions: [],
  isLoading: false,
  error: null,
  simulationResult: null,
  isAuthenticated: !!localStorage.getItem('token'),
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.permissions = [];
      state.isAuthenticated = false;
      localStorage.removeItem('token');
    },
    clearError: (state) => {
      state.error = null;
    },
    clearSimulationResult: (state) => {
      state.simulationResult = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchUserPermissions.fulfilled, (state, action) => {
        state.permissions = action.payload.permissions || [];
      })
      .addCase(simulateAction.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(simulateAction.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(simulateAction.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

// Selectors
export const selectAuth = state => state.auth;
export const selectIsAuthenticated = state => !!state.auth.token;
export const selectUser = state => state.auth.user;
export const selectPermissions = state => state.auth.permissions;

export const selectHasPermission = (state, moduleName, actionType) => {
  const { permissions } = selectAuth(state);
  return permissions && Array.isArray(permissions) && permissions.some(permission => 
    permission.module_name === moduleName && 
    permission.action === actionType
  );
};

export const { logout, clearError, clearSimulationResult } = authSlice.actions;
export default authSlice.reducer;
