import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  name: null,
  token: null,
  status: null,
  isConnected: false,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    login: (state, action) => {
      state.name = action.payload.name;
      state.token = action.payload.token;
      state.status = action.payload.status;
      state.isConnected = true;
    },
    logout: (state) => {
      state.name = null;
      state.token = null;
      state.status = null;
      state.isConnected = false;
    },
  },
});

export const { login, logout } = userSlice.actions;
export default userSlice.reducer;
