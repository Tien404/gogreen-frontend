import type { State } from "@/domain/types";
import { resolveApiBaseUrl } from "@/config/api";
import { useServerSession } from "@/features/auth/hooks/useServerSession";
import { Alert } from "@/shared/ui";
import { Toast } from "@/shared/ui/Toast";
import { useState } from "react";
import { useNavigate, useRoutes } from "react-router";
import { Context, type AppContext } from "./providers/AppContext";
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
  const content = useRoutes(appRoutes);
  return (
    <Context.Provider value={{ ...value, path, go: (url) => navigate(url) }}>
      {content}
      <Toast message={toast} onDismiss={dismissToast} />
    </Context.Provider>
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
  };
  return (
    <AppFrame
      value={{
        api: client,
        s,
        auth,
        notify,
      }}
      toast={toast}
      dismissToast={() => notify("")}
    />
  );
}
function appConfig() {
  try {
    return { baseUrl: resolveApiBaseUrl(import.meta.env.VITE_API_BASE_URL) };
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Check the application configuration.",
    };
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
  return <ApiApp baseUrl={settings.baseUrl!} />;
}

export default App;
