import { configureStore } from "@reduxjs/toolkit";
import accessRequestReducer from "./slices/accessRequestSlice";

export const store = configureStore({
  reducer: {
    accessRequest: accessRequestReducer,
  },
});
