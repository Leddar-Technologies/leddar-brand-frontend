import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

export const submitAccessRequest = createAsyncThunk(
  "accessRequest/submit",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await api.post("/auth/register/brand", formData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Something went wrong",
      );
    }
  },
);

const accessRequestSlice = createSlice({
  name: "accessRequest",
  initialState: {
    loading: false,
    error: null,
    success: false,
  },
  reducers: {
    resetState: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(submitAccessRequest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(submitAccessRequest.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(submitAccessRequest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetState } = accessRequestSlice.actions;
export default accessRequestSlice.reducer;
