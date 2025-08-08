import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import userReducer from './slices/userSlice';
import groupReducer from './slices/groupSlice';
import roleReducer from './slices/roleSlice';
import moduleReducer from './slices/moduleSlice';
import permissionReducer from './slices/permissionSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    users: userReducer,
    groups: groupReducer,
    roles: roleReducer,
    modules: moduleReducer,
    permissions: permissionReducer,
  },
});
