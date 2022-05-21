import { createSlice } from "@reduxjs/toolkit";

export const userSlice = createSlice({
  name: "user",
  initialState: {
    inGroup: false,
    groupCode: "",
  },
  reducers: {
    inGroup: (state) => {
      state.inGroup = true;
    },
    setGroupCode: (state, action) => {
      state.groupCode = action.payload;
    },
  },
});

export const { inGroup, setGroupCode } = userSlice.actions;

export default userSlice.reducer;
