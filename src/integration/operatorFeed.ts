import type { Schemas } from "@/shared/api/contract.generated";
import type { useApiQuery } from "@/shared/api/useApiQuery";
import { createContext, useContext } from "react";
export const LIVE_POLL_MS = 5000;
export type OperationsSnapshot = {
  data: Schemas["OperationsOut"];
  revision: string | null;
};
export const OperatorFeedContext = createContext<ReturnType<
  typeof useApiQuery<OperationsSnapshot>
> | null>(null);
export function useOptionalOperatorFeed() {
  return useContext(OperatorFeedContext);
}
