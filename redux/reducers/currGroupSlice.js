import { createSlice } from "@reduxjs/toolkit";

export const currGroupSlice = createSlice({
  name: "currGroup",
  initialState: {
    groupCode: "",
  },
  reducers: {
    setGroupCode: (state, action) => {
      state.groupCode = action.payload;
    },
  },
});

export const { setGroupCode } = currGroupSlice.actions;

export default currGroupSlice.reducer;
