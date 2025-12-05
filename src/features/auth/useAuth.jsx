// src/features/auth/useAuth.js
import { useSelector } from "react-redux";
import { selectAuth } from "./authSlice.jsx";

export function useAuth() {
  const { user, token, status, error } = useSelector(selectAuth);

  const isAuthenticated = Boolean(token && user);
  const role = user?.role || null; // "admin" | "doctor" | "reception"

  return {
    user,
    token,
    status,
    error,
    isAuthenticated,
    role,
  };
}
