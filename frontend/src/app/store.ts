import { configureStore } from "@reduxjs/toolkit";
import rcaReducer from "../features/rca/rcaSlice";
import copilotReducer from "../features/copilot/copilotSlice";
import investigationsReducer from "../features/investigations/investigationsSlice";

export const store = configureStore({
  reducer: {
    rca: rcaReducer,
    copilot: copilotReducer,
    investigations: investigationsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
