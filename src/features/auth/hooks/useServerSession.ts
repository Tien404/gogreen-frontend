import type { AccountProfile } from "@/domain/types";
import { createApiClient } from "@/shared/api/client";
import { ApiError, apiErrorMessage } from "@/shared/api/errors";
import { mapSession } from "@/integration/apiMappers";
import { useEffect, useState } from "react";
import type { AuthSession } from "../model/types";

type SessionState =
  | { status: "loading"; user: null }
  | { status: "ready"; user: AccountProfile | null }
  | { status: "error"; user: null; error: string };

export function useServerSession(baseUrl: string): { client: ReturnType<typeof createApiClient>; auth: AuthSession } {
  const [state, setState] = useState<SessionState>({ status: "loading", user: null });
  const [attempt, setAttempt] = useState(0);
  const [client] = useState(() => createApiClient({
    baseUrl,
    onUnauthorized: () => setState({ status: "ready", user: null }),
  }));

  useEffect(() => {
    const controller = new AbortController();
    const load = async () => {
      try {
        const response = await client.request("GET /sessions/me", {
          signal: controller.signal,
          onUnauthorized: "ignore",
        });
        if (!controller.signal.aborted) setState({ status: "ready", user: mapSession(response) });
      } catch (error) {
        if (controller.signal.aborted) return;
        setState(error instanceof ApiError && error.status === 401
          ? { status: "ready", user: null }
          : { status: "error", user: null, error: apiErrorMessage(error) });
      }
    };

    void load();
    return () => controller.abort();
  }, [attempt, client]);

  return {
    client,
    auth: {
      ...state,
      retry() {
        setState({ status: "loading", user: null });
        setAttempt((value) => value + 1);
      },
      async signIn({ email, password }) {
        try {
          const normalizedEmail = email.trim().toLowerCase();
          const response = await client.request("POST /sessions", {
            body: { login_alias: normalizedEmail, password },
            onUnauthorized: "ignore",
          });
          const user = mapSession(response, normalizedEmail);
          setState({ status: "ready", user });
          return { user };
        } catch (error) {
          return { error: apiErrorMessage(error) };
        }
      },
      async signOut() {
        try {
          await client.request("POST /sessions/logout", { onUnauthorized: "ignore" });
        } catch (error) {
          if (!(error instanceof ApiError && error.status === 401)) return { error: apiErrorMessage(error) };
        }
        setState({ status: "ready", user: null });
        return {};
      },
      async signUp() {
        return { error: "Use an account provided for this workspace." };
      },
      preview() {
        return null;
      },
    },
  };
}
