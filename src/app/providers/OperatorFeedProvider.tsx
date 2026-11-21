import { LIVE_POLL_MS, OperatorFeedContext } from "@/integration/operatorFeed";
import { useApiQuery } from "@/shared/api/useApiQuery";
import { useCallback, type ReactNode } from "react";
import { useApp } from "./AppContext";

export function OperatorFeedProvider({ children }: { children: ReactNode }) {
  const { api } = useApp();
  const load = useCallback(
    async (signal: AbortSignal) => {
      let revision: string | null = null;
      const data = await api.request("GET /operations", {
        signal,
        onHeaders: (headers) => {
          revision = headers.get("X-Operational-Revision");
        },
      });
      return { data, revision };
    },
    [api],
  );
  const feed = useApiQuery(load, { retain: true, pollMs: LIVE_POLL_MS });
  return (
    <OperatorFeedContext.Provider value={feed}>
      {children}
    </OperatorFeedContext.Provider>
  );
}
