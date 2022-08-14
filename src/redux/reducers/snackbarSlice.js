import { createSlice } from '@reduxjs/toolkit';

export const snackbarSlice = createSlice({
  name: 'snackbar',
  initialState: {
    snackbarOpen: false,
    snackbarMessage: '',
  },
  reducers: {
    toggleSnackBar: (state) => {
      state.snackbarOpen = !state.snackbarOpen;
    },
    setSnackMessage: (state, action) => {
      state.snackbarMessage = action.payload;
    },
  },
});

export const { toggleSnackBar, setSnackMessage } = snackbarSlice.actions;

export default snackbarSlice.reducer;
