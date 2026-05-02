import { useContext } from "react";
import { AuthContext } from "@/components/providers/auth.tsx";

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    return {
      user: null,
      isLoading: false,
      removeUser: () => {},
      isAuthenticated: false,
      signinRedirect: () => {},
    };
  }
  return context;
}
