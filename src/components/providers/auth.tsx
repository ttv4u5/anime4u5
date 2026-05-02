import { createContext, useState, useCallback, ReactNode } from "react";

export const AuthContext = createContext<any>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const signinRedirect = useCallback(async () => {
    setIsLoading(true);
    // Mock login - simulate auth process
    setTimeout(() => {
      setUser({
        profile: {
          name: "Demo User",
          email: "demo@example.com",
          sub: "demo-123",
        },
      });
      setIsLoading(false);
    }, 1000);
  }, []);

  const removeUser = useCallback(() => {
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        signinRedirect,
        removeUser,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
