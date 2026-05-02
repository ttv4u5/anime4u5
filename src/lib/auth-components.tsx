import { ReactNode } from "react";
import { useAuth } from "@/hooks/use-auth.ts";

export function Authenticated({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : null;
}

export function Unauthenticated({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  return !isAuthenticated ? <>{children}</> : null;
}

export function AuthLoading({ children }: { children: ReactNode }) {
  const { isLoading } = useAuth();
  return isLoading ? <>{children}</> : null;
}
