import type { ApiClient } from "@/shared/api/client";
import type { State } from "@/domain/types";
import type { AuthSession } from "@/features/auth/model/types";
import { createContext, useContext } from "react";
export type NotificationType = "info" | "success" | "warning" | "error";

export interface AppContext {
  api: ApiClient;
  auth: AuthSession;
  s: State;
  go: (path: string) => void;
  path: string;
  notify: (message: string, type?: NotificationType) => void;
  refreshOperations?: () => void;
}
export const Context = createContext<AppContext>(null!);
export function useApp() {
  return useContext(Context);
}
