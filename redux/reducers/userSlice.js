import { createSlice } from "@reduxjs/toolkit";

export const userSlice = createSlice({
  name: "user",
  initialState: {
    currentUser: null,
    currGroupCode: "",
    currGroupName: "",
    currUserName: "",
    currTentType: "",
  },
  reducers: {
    setCurrentUser: (state, action) => {
      state.currentUser = action.payload;
    },
    reset: (state) => {
      state.currentUser = null;
      state.currGroupCode = "";
      state.currGroupName = "";
    },
    setGroupCode: (state, action) => {
      state.currGroupCode = action.payload;
    },
    setGroupName: (state, action) => {
      state.currGroupName = action.payload;
    },
    setUserName: (state, action) => {
      state.currUserName = action.payload;
    },
    setTentType: (state, action) => {
      state.currTentType = action.payload;
    }
  },
});

export const { setCurrentUser, reset, setGroupCode, setGroupName, setUserName, setTentType } = userSlice.actions;

export default userSlice.reducer;