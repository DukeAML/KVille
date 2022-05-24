import { createSlice } from "@reduxjs/toolkit";


export const userSlice = createSlice({
  name: "user",
  initialState: {
    inGroup: false,
    groupInfo: {
      groupCode: "",
      userName: "",
    },
    isCreator: false,
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
    setCreatorRole: (state) => {
      state.isCreator = true;
    },
  },
});

export const { inGroup, notInGroup, setGroupInfo, setCreatorRole } = userSlice.actions;

export default userSlice.reducer;
