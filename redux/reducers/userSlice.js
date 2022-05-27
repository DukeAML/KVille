import { createSlice } from "@reduxjs/toolkit";

export const userSlice = createSlice({
  name: "user",
  initialState: {
    currentUser: null,
  },
  reducers: {
    setCurrentUser: (state, action) => {
      state.currentUser = action.payload;
    },
    reset: (state) => {
      state.currentUser = null;
    },
  },
});

export const { setCurrentUser, reset } = userSlice.actions;

export default userSlice.reducer;

// export const userSlice = createSlice({
//   name: "user",
//   initialState: {
//     inGroup: false,
//     groupInfo: {
//       groupCode: "",
//       userName: "",
//     },
//     isCreator: false,
//   },
//   reducers: {
//     inGroup: (state) => {
//       state.inGroup = true;
//     },
//     notInGroup: (state) => {
//       state.inGroup = false;
//     },
//     setGroupInfo: (state, action) => {
//       state.groupInfo = action.payload;
//     },
//     setCreatorRole: (state) => {
//       state.isCreator = true;
//     },
//     reset: (state) => {
//       state.inGroup = false;
//       state.groupInfo = {
//         groupCode: "",
//         userName: "",
//       };
//       state.isCreator = false;
//     },
//   },
// });

// export const { inGroup, notInGroup, setGroupInfo, setCreatorRole, reset } = userSlice.actions;

// export default userSlice.reducer;
