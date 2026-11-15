import type { DataMode } from "@/config/dataMode";
import type { ApiClient } from "@/shared/api/client";
import type { State } from "@/domain/types";
import type { AuthSession } from "@/features/auth/model/types";
import type { Action, ActionResult } from "@/store/types";
import { createContext, useContext } from "react";

export interface AppContext {
  mode: DataMode;
  api?: ApiClient;
  auth: AuthSession;
  s: State;
  act: (a: Action) => ActionResult;
  go: (path: string) => void;
  path: string;
  notify: (message: string) => void;
}

export const Context = createContext<AppContext>(null!);

export function useApp() {
  return useContext(Context);
}
