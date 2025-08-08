import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/api";

export const fetchPermissions = createAsyncThunk(
  "permissions/fetchPermissions",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/permissions");
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createPermission = createAsyncThunk(
  "permissions/createPermission",
  async (permissionData, { rejectWithValue }) => {
    try {
      // Map frontend data structure to backend expected structure
      const backendData = {
        name: permissionData.description, // Backend expects 'name' field
        action: permissionData.action,
        module_id: permissionData.moduleId // Backend expects 'module_id' not 'moduleId'
      };
      
      const response = await api.post("/permissions", backendData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updatePermission = createAsyncThunk(
  "permissions/updatePermission",
  async ({ id, permissionData }, { rejectWithValue }) => {
    try {
      // Map frontend data structure to backend expected structure
      const backendData = {
        name: permissionData.description, // Backend expects 'name' field
        action: permissionData.action,
        module_id: permissionData.moduleId // Backend expects 'module_id' not 'moduleId'
      };
      
      const response = await api.put(`/permissions/${id}`, backendData);
      return { id, ...response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deletePermission = createAsyncThunk(
  "permissions/deletePermission",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/permissions/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const initialState = {
  permissions: [],
  isLoading: false,
  error: null,
};

const permissionSlice = createSlice({
  name: "permissions",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPermissions.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPermissions.fulfilled, (state, action) => {
        state.isLoading = false;
        // Handle the backend response structure
        const permissions = action.payload?.permissions || action.payload || [];
        
        // Transform backend data to match frontend expectations
        state.permissions = Array.isArray(permissions) ? permissions.map(permission => ({
          id: permission.id,
          moduleId: permission.module_id,
          action: permission.action,
          description: permission.name, // Backend 'name' maps to frontend 'description'
          module_name: permission.module_name,
          created_at: permission.created_at,
          role_count: permission.role_count
        })) : [];
      })
      .addCase(fetchPermissions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || action.payload || 'Failed to fetch permissions';
      })
      .addCase(createPermission.pending, (state) => {
        state.error = null;
      })
      .addCase(createPermission.fulfilled, (state, action) => {
        // Transform the created permission to match frontend structure
        const newPermission = action.payload.permission || action.payload;
        state.permissions.push({
          id: newPermission.id,
          moduleId: newPermission.module_id,
          action: newPermission.action,
          description: newPermission.name,
        });
      })
      .addCase(createPermission.rejected, (state, action) => {
        state.error = action.payload?.message || action.payload || 'Failed to create permission';
      })
      .addCase(updatePermission.pending, (state) => {
        state.error = null;
      })
      .addCase(updatePermission.fulfilled, (state, action) => {
        const updatedPermission = action.payload;
        const index = state.permissions.findIndex(
          (permission) => permission.id === updatedPermission.id
        );
        if (index !== -1) {
          // Update the permission while maintaining the frontend structure
          state.permissions[index] = {
            ...state.permissions[index],
            moduleId: updatedPermission.module_id || state.permissions[index].moduleId,
            action: updatedPermission.action || state.permissions[index].action,
            description: updatedPermission.name || state.permissions[index].description,
          };
        }
      })
      .addCase(updatePermission.rejected, (state, action) => {
        state.error = action.payload?.message || action.payload || 'Failed to update permission';
      })
      .addCase(deletePermission.pending, (state) => {
        state.error = null;
      })
      .addCase(deletePermission.fulfilled, (state, action) => {
        state.permissions = state.permissions.filter(
          (permission) => permission.id !== action.payload
        );
      })
      .addCase(deletePermission.rejected, (state, action) => {
        state.error = action.payload?.message || action.payload || 'Failed to delete permission';
      });
  },
});

export const { clearError } = permissionSlice.actions;
export default permissionSlice.reducer;