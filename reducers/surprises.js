import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  surprises: [],
};

const surprisesSlice = createSlice({
  name: "surprises",
  initialState,
  reducers: {
    setSurprises: (state, action) => {
      state.surprises = action.payload;
    },
    unlockSurprise: (state, action) => {
      const surpriseId = action.payload;
      const surpriseToUnlock = state.surprises.find(
        (surprise) => surprise._id === surpriseId,
      );
      if (surpriseToUnlock) {
        surpriseToUnlock.isUnlocked = true;
      }
    },
    lockSurprise: (state, action) => {
      const surpriseId = action.payload;
      const surpriseToLock = state.surprises.find(
        (surprise) => surprise._id === surpriseId,
      );
      if (surpriseToLock) {
        surpriseToLock.isUnlocked = false;
      }
    },
  },
});

export const { setSurprises, unlockSurprise, lockSurprise } =
  surprisesSlice.actions;
export default surprisesSlice.reducer;
