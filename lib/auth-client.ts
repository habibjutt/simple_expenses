import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:3000",
  fetchOptions: {
    refetchOnWindowFocus: false, // Prevent refetch when switching tabs
  },
});

export const {
  signUp,
  signIn,
  signOut,
  useSession,
  getSession,
  changePassword,
} = authClient;
