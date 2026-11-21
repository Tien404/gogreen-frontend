import { Context, useApp } from "@/app/providers/AppContext";
import { Missing } from "@/app/pages/Missing";
import { readPages } from "@/features/hubs/hubResources";
import { ApiLoadError } from "@/shared/api/ApiFeedback";
import { useApiQuery } from "@/shared/api/useApiQuery";
import { useCallback, type ReactNode } from "react";
import {
  dispatchRecord,
  incidentRecord,
  operatorActivity,
  operatorCharge,
  operatorState,
} from "./operatorData";
import { LIVE_POLL_MS, useOptionalOperatorFeed } from "./operatorFeed";
type Props = {
  children: ReactNode;
  activity?: boolean;
  dispatchId?: string;
  incidentId?: string;
  chargeId?: string;
};
export function OperatorScreenData({
  children,
  activity,
  dispatchId,
  incidentId,
  chargeId,
}: Props) {
  const app = useApp();
  const { api, s } = app;
  const feed = useOptionalOperatorFeed();
  const needsRecord = Boolean(activity || dispatchId || incidentId || chargeId);
  const load = useCallback(
    async (signal: AbortSignal) => {
      if (dispatchId)
        return {
          dispatch: await api!.request("GET /redistribution-tasks/{task_id}", {
            signal,
            params: { task_id: dispatchId },
          }),
        };
      if (incidentId)
        return {
          incident: await api!.request("GET /incidents/{incident_id}", {
            signal,
            params: { incident_id: incidentId },
          }),
        };
      if (chargeId)
        return {
          charge: await api!.request("GET /charging/sessions/{session_id}", {
            signal,
            params: { session_id: chargeId },
          }),
        };
      return {
        activity: await readPages((offset, limit) =>
          api!.request("GET /activity", { signal, query: { offset, limit } }),
        ),
      };
    },
    [api, dispatchId, incidentId, chargeId],
  );
  const records = useApiQuery(load, {
    enabled: s.role === "operator" && needsRecord,
    retain: true,
    pollMs: LIVE_POLL_MS,
  });
  if (s.role !== "operator") return children;
  const network = feed?.result;
  if (!network || network.status === "loading")
    return <p role="status">Loading operations…</p>;
  if (network.status === "error")
    return <ApiLoadError message={network.message} retry={feed!.retry} />;
  if (needsRecord && records.result.status === "loading")
    return <p role="status">Loading…</p>;
  if (needsRecord && records.result.status === "error") {
    if (records.result.code === 404) return <Missing />;
    return (
      <ApiLoadError message={records.result.message} retry={records.retry} />
    );
  }
  const next = operatorState(network.data.data, s);
  if (needsRecord && records.result.status === "ready") {
    const detail = records.result.data;
    if (detail.dispatch) next.dispatches = [dispatchRecord(detail.dispatch)];
    if (detail.charge)
      next.charges = [operatorCharge(detail.charge, next.vehicles)];
    if (detail.incident)
      next.incidents = [
        incidentRecord(detail.incident, next.hubs),
        ...next.incidents.filter((i) => i.id !== incidentId),
      ];
    if (detail.activity) next.activity = detail.activity.map(operatorActivity);
  }
  const refresh = () => {
    feed?.retry();
    if (needsRecord) records.retry();
  };
  const error = feed?.refreshError ?? records.refreshError;
  return (
    <Context.Provider value={{ ...app, s: next, refreshOperations: refresh }}>
      {error && <ApiLoadError message={error.message} retry={refresh} />}
      {children}
    </Context.Provider>
  );
}
