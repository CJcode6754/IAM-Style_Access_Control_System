import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/api';

export const fetchGroups = createAsyncThunk(
  'groups/fetchGroups',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/groups');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const createGroup = createAsyncThunk(
  'groups/createGroup',
  async (groupData, { rejectWithValue }) => {
    try {
      const response = await api.post('/groups', groupData);
      if (response.data.error) {
        return rejectWithValue(response.data);
      }
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      return rejectWithValue({
        message: errorMessage,
        error: error.response?.data
      });
    }
  }
);

export const updateGroup = createAsyncThunk(
  'groups/updateGroup',
  async ({ id, groupData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/groups/${id}`, groupData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const deleteGroup = createAsyncThunk(
  'groups/deleteGroup',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/groups/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const assignUserToGroup = createAsyncThunk(
  'groups/assignUser',
  async ({ groupId, userIds }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/groups/${groupId}/users`, { userIds });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const removeUserFromGroup = createAsyncThunk(
  'groups/removeUser',
  async ({ groupId, userId }, { rejectWithValue }) => {
    try {
      await api.delete(`/groups/${groupId}/users/${userId}`);
      return { groupId, userId };
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const assignRolesToGroup = createAsyncThunk(
  'groups/assignRoles',
  async ({ groupId, roleIds }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/groups/${groupId}/roles`, { roleIds });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const initialState = {
  groups: [],
  isLoading: false,
  error: null,
};

const groupSlice = createSlice({
  name: 'groups',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchGroups.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchGroups.fulfilled, (state, action) => {
        state.isLoading = false;
        state.groups = action.payload.groups || [];
        state.error = null;
      })
      .addCase(fetchGroups.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Failed to fetch groups';
      })
      .addCase(createGroup.pending, (state) => {
        state.error = null;
      })
      .addCase(createGroup.fulfilled, (state, action) => {
        if (action.payload.group) {
          state.groups.push(action.payload.group);
        }
        state.error = null;
      })
      .addCase(createGroup.rejected, (state, action) => {
        state.error = action.payload?.message || 'Failed to create group';
      })
      .addCase(updateGroup.fulfilled, (state, action) => {
        const index = state.groups.findIndex(group => group.id === action.payload.id);
        if (index !== -1) {
          state.groups[index] = action.payload;
        }
      })
      .addCase(deleteGroup.fulfilled, (state, action) => {
        state.groups = state.groups.filter(group => group.id !== action.payload);
      })
      .addCase(assignUserToGroup.fulfilled, (state, action) => {
        const index = state.groups.findIndex(group => group.id === action.payload.id);
        if (index !== -1) {
          state.groups[index] = action.payload;
        }
      })
      .addCase(assignRolesToGroup.fulfilled, (state, action) => {
        const index = state.groups.findIndex(group => group.id === action.payload.id);
        if (index !== -1) {
          state.groups[index] = action.payload;
        }
      });
  },
});

export const { clearError } = groupSlice.actions;
export default groupSlice.reducer;
