import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/api";

export const fetchRoles = createAsyncThunk(
  "roles/fetchRoles",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/roles");
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const createRole = createAsyncThunk(
  "roles/createRole",
  async (roleData, { rejectWithValue }) => {
    try {
      const response = await api.post("/roles", roleData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const updateRole = createAsyncThunk(
  "roles/updateRole",
  async ({ id, roleData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/roles/${id}`, roleData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const deleteRole = createAsyncThunk(
  "roles/deleteRole",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/roles/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const assignPermissionsToRole = createAsyncThunk(
  "roles/assignPermissions",
  async ({ roleId, permissionIds }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/roles/${roleId}/permissions`, {
        permissionIds,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const removePermissionFromRole = createAsyncThunk(
  "roles/removePermission",
  async ({ roleId, permissionId }, { rejectWithValue }) => {
    try {
      await api.delete(`/roles/${roleId}/permissions/${permissionId}`);
      return { roleId, permissionId };
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const initialState = {
  roles: [],
  isLoading: false,
  error: null,
};

const roleSlice = createSlice({
  name: "roles",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRoles.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchRoles.fulfilled, (state, action) => {
        state.isLoading = false;
        const data = action.payload;

        // Handle both array and object shapes from API
        if (Array.isArray(data)) {
          state.roles = data;
        } else if (data && Array.isArray(data.roles)) {
          state.roles = data.roles;
        } else {
          state.roles = []; // fallback to empty array if unexpected shape
        }
      })

      .addCase(fetchRoles.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(createRole.fulfilled, (state, action) => {
        state.roles.push(action.payload);
      })
      .addCase(updateRole.fulfilled, (state, action) => {
        const index = state.roles.findIndex(
          (role) => role.id === action.payload.id
        );
        if (index !== -1) {
          state.roles[index] = action.payload;
        }
      })
      .addCase(deleteRole.fulfilled, (state, action) => {
        state.roles = state.roles.filter((role) => role.id !== action.payload);
      })
      .addCase(assignPermissionsToRole.fulfilled, (state, action) => {
        const index = state.roles.findIndex(
          (role) => role.id === action.payload.id
        );
        if (index !== -1) {
          state.roles[index] = action.payload;
        }
      });
  },
});

export const { clearError } = roleSlice.actions;
export default roleSlice.reducer;
