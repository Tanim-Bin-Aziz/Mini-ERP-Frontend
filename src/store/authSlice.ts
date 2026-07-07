import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { AuthUser } from '@/types';

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
}

const STORAGE_KEY = 'mini_erp_auth';

const loadInitialState = (): AuthState => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { user: null, accessToken: null, refreshToken: null };
    return JSON.parse(raw) as AuthState;
  } catch {
    return { user: null, accessToken: null, refreshToken: null };
  }
};

const persist = (state: AuthState) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

const authSlice = createSlice({
  name: 'auth',
  initialState: loadInitialState(),
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: AuthUser; accessToken: string; refreshToken: string }>
    ) => {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      persist(state);
    },
    setTokens: (state, action: PayloadAction<{ accessToken: string; refreshToken: string }>) => {
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      persist(state);
    },
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      localStorage.removeItem(STORAGE_KEY);
    },
  },
});

export const { setCredentials, setTokens, logout } = authSlice.actions;
export default authSlice.reducer;
