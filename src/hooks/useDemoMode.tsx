import { useAuth } from "@/hooks/useAuth";

export const DEMO_EMAIL = "demo@customer-connection.app";
export const DEMO_PASSWORD = "demo123456";

export function useDemoMode() {
  const { user } = useAuth();
  const isDemoMode = user?.email === DEMO_EMAIL;
  return { isDemoMode };
}
