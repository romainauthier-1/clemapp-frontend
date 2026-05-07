import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  name: null,
  token: null,
  status: null,
  isConnected: false,
  notifActivated: false,
  userList: [],
  linus: null,
  selectedGuest: null,
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
      state.notifActivated = action.payload.subscription;
      state.linus = action.payload.linus;
    },
    logout: (state) => {
      state.name = null;
      state.token = null;
      state.status = null;
      state.isConnected = false;
      state.notifActivated = false;
      state.userList = [];
      state.linus = null;
    },
    activateNotif: (state, action) => {
      state.notifActivated = action.payload;
    },
    setUserList: (state, action) => {
      state.userList = action.payload;
    },
    changeLinusStore: (state, action) => {
      state.linus = action.payload;
    },
    setSelectedGuest: (state, action) => {
      state.selectedGuest = action.payload;
    },
  },
});

export const {
  login,
  logout,
  activateNotif,
  setUserList,
  changeLinusStore,
  setSelectedGuest,
} = userSlice.actions;
export default userSlice.reducer;
