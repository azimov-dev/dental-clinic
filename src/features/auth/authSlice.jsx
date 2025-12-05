// src/features/auth/authSlice.jsx
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { apiClient } from "../../api/client";

// use same keys as your working app
const tokenKey = "token";
const userKey = "user";

const savedToken = localStorage.getItem(tokenKey);
const savedUser = localStorage.getItem(userKey);

const initialState = {
  user: savedUser ? JSON.parse(savedUser) : null,
  token: savedToken || null,
  status: "idle",
  error: null,
};

export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async ({ phone, password }, { rejectWithValue }) => {
    try {
      const data = await apiClient("/auth/login", {
        method: "POST",
        body: { phone, password },
      });
      return data; // { token, user }
    } catch (err) {
      return rejectWithValue(err.message || "Login failed");
    }
  },
);

export const logoutUser = createAsyncThunk("auth/logoutUser", async () => {
  return true;
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.error = null;

        const data = action.payload || {};
        const token = data.token;
        const user = data.user || data.data || {};

        const name =
          user.full_name ||
          user.fullName ||
          user.name ||
          `${user.first_name || ""} ${user.last_name || ""}`.trim() ||
          "User";

        const normalizedUser = {
          id: user.id,
          full_name: name,
          role: user.role || user.user_role || "reception",
        };

        state.token = token;
        state.user = normalizedUser;

        localStorage.setItem(tokenKey, token);
        localStorage.setItem(userKey, JSON.stringify(normalizedUser));
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Login failed";
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.status = "idle";
        state.token = null;
        state.user = null;
        state.error = null;
        localStorage.removeItem(tokenKey);
        localStorage.removeItem(userKey);
      });
  },
});

export const selectAuth = (state) => state.auth;
export const selectCurrentUser = (state) => state.auth.user;
export const selectToken = (state) => state.auth.token;

export default authSlice.reducer;
