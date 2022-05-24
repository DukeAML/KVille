import { createSlice } from "@reduxjs/toolkit";


export const userSlice = createSlice({
  name: "user",
  initialState: {
    inGroup: false,
    groupInfo: {
      groupCode: "",
      userName: "",
    },
  },
  reducers: {
    inGroup: (state) => {
      state.inGroup = true;
    },
    notInGroup: (state) => {
      state.inGroup = false;
    },
    setGroupInfo: (state, action) => {
      state.groupInfo = action.payload;
    },
  },
});

export const { inGroup, notInGroup, setGroupInfo } = userSlice.actions;

export default userSlice.reducer;
