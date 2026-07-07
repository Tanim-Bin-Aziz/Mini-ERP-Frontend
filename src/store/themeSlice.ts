import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

type Theme = 'light' | 'dark';
const STORAGE_KEY = 'mini_erp_theme';

const applyThemeClass = (theme: Theme) => {
  document.documentElement.classList.toggle('dark', theme === 'dark');
};

const loadInitialTheme = (): Theme => {
  const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
  const theme =
    stored ?? (window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  applyThemeClass(theme);
  return theme;
};

const themeSlice = createSlice({
  name: 'theme',
  initialState: { mode: loadInitialTheme() },
  reducers: {
    toggleTheme: (state) => {
      state.mode = state.mode === 'dark' ? 'light' : 'dark';
      localStorage.setItem(STORAGE_KEY, state.mode);
      applyThemeClass(state.mode);
    },
    setTheme: (state, action: PayloadAction<Theme>) => {
      state.mode = action.payload;
      localStorage.setItem(STORAGE_KEY, state.mode);
      applyThemeClass(state.mode);
    },
  },
});

export const { toggleTheme, setTheme } = themeSlice.actions;
export default themeSlice.reducer;
