import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  surprises: [],
  selectedSurprise: null,
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
    setSelectedSurprise: (state, action) => {
      state.selectedSurprise = action.payload;
    },
  },
});

export const {
  setSurprises,
  unlockSurprise,
  lockSurprise,
  setSelectedSurprise,
} = surprisesSlice.actions;
export default surprisesSlice.reducer;
