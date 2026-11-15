import type { State } from "@/domain/types";
import { resolveApiBaseUrl, resolveDataMode } from "@/config/dataMode";
import { useAuthSession } from "@/features/auth/hooks/useAuthSession";
import { useServerSession } from "@/features/auth/hooks/useServerSession";
import { Alert } from "@/shared/ui";
import { Toast } from "@/shared/ui/Toast";
import { useState } from "react";
import { useNavigate, useRoutes } from "react-router";
import { Context, type AppContext } from "./providers/AppContext";
import { useDemoState } from "./providers/useDemoState";
import { apiRoutes } from "./router/apiRoutes";
import { appRoutes } from "./router/routes";
import { useRouteExperience } from "./router/useRouteExperience";

function AppFrame({
  value,
  toast,
  dismissToast,
}: {
  value: Omit<AppContext, "path" | "go">;
  toast: string;
  dismissToast: () => void;
}) {
  const path = useRouteExperience();
  const navigate = useNavigate();
  const content = useRoutes(value.mode === "api" ? apiRoutes : appRoutes);
  return (
    <Context.Provider value={{ ...value, path, go: (url) => navigate(url) }}>
      {content}
      <Toast message={toast} onDismiss={dismissToast} />
    </Context.Provider>
  );
}

function PreviewApp() {
  const { s, act, toast, notify, dismissToast } = useDemoState();
  const auth = useAuthSession((profile) => {
    act({
      type: "role",
      role: profile?.role ?? null,
      persona: profile?.persona ?? "student",
      profile,
    });
  });

  return (
    <AppFrame
      value={{ mode: "preview", s, act, notify, auth }}
      toast={toast}
      dismissToast={dismissToast}
    />
  );
}

function ApiApp({ baseUrl }: { baseUrl: string }) {
  const { client, auth } = useServerSession(baseUrl);
  const [toast, notify] = useState("");
  const s: State = {
    role: auth.user?.role ?? null,
    profile: auth.user ?? undefined,
    persona: auth.user?.persona ?? "",
    clock: 0,
    preset: "api",
    serial: 0,
    revision: 0,
    loadFailed: false,
    hubs: [],
    vehicles: [],
    privateVehicles: [],
    holds: [],
    rides: [],
    bookings: [],
    charges: [],
    incidents: [],
    dispatches: [],
    activity: [],
    runs: [],
  };

  return (
    <AppFrame
      value={{
        mode: "api",
        api: client,
        s,
        auth,
        notify,
        act: () => ({
          error: true,
          message: "This action is available in preview mode.",
        }),
      }}
      toast={toast}
      dismissToast={() => notify("")}
    />
  );
}

function appConfig() {
  try {
    const mode = resolveDataMode(
      import.meta.env.VITE_APP_MODE,
      import.meta.env.MODE,
    );
    if (mode === "preview") return { mode } as const;
    return {
      mode,
      baseUrl: resolveApiBaseUrl(import.meta.env.VITE_API_BASE_URL),
    } as const;
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Check the application configuration.",
    } as const;
  }
}

function App() {
  const settings = appConfig();
  if (settings.error)
    return (
      <main id="main-content" tabIndex={-1} className="mx-auto max-w-100 p-5">
        <Alert tone="error">{settings.error}</Alert>
      </main>
    );
  if (settings.mode === "preview") return <PreviewApp />;
  return <ApiApp baseUrl={settings.baseUrl!} />;
}

export default App;
