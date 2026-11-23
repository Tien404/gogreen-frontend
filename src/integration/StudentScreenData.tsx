import { Missing } from "@/app/pages/Missing";
import { LIVE_POLL_MS } from "@/integration/operatorFeed";
import { loadStudentData, type StudentScreen } from "@/integration/studentData";
import { ApiLoadError } from "@/shared/api/ApiFeedback";
import { LoadingState } from "@/shared/ui";
import { useApiQuery } from "@/shared/api/useApiQuery";
import { useCallback, type ReactNode } from "react";
import { Context, useApp } from "@/app/providers/AppContext";
import { RefreshStudentData } from "./studentRefresh";
export function StudentData({
  screen,
  id,
  children,
}: {
  screen: StudentScreen;
  id?: string;
  children: ReactNode;
}) {
  const app = useApp();
  const { api, s } = app;
  const name = s.profile?.name;
  const owner = s.persona;
  const load = useCallback(
    (signal: AbortSignal) =>
      loadStudentData(api!, screen, id, owner, name, signal),
    [api, screen, id, owner, name],
  );
  const { result, refreshError, retry } = useApiQuery(load, {
    enabled: s.role === "student",
    retain: true,
    pollMs: LIVE_POLL_MS,
  });
  if (s.role !== "student") return children;
  if (result.status === "loading") return <LoadingState label={"Loading…"} />;
  if (result.status === "error") {
    if (result.code === 404 && id) return <Missing />;
    return <ApiLoadError message={result.message} retry={retry} />;
  }
  return (
    <Context.Provider value={{ ...app, s: { ...s, ...result.data } }}>
      <RefreshStudentData.Provider value={retry}>
        {refreshError && (
          <ApiLoadError message={refreshError.message} retry={retry} />
        )}
        {children}
      </RefreshStudentData.Provider>
    </Context.Provider>
  );
}
