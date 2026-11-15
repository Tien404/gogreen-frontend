import { useApp } from "@/app/providers/AppContext";
import { LIVE_POLL_MS } from "@/integration/operatorFeed";
import { activityLink, campusTime } from "@/integration/studentRecords";
import { panelClass, recordRowClass, RecordFeedback } from "@/shared/api/ApiRecordUi";
import { useApiQuery } from "@/shared/api/useApiQuery";
import { Badge, Button, Empty, Link, PageTitle } from "@/shared/ui";
import { useCallback } from "react";

export function ApiActivity() {
  const { api, auth } = useApp();
  const load = useCallback((signal: AbortSignal) => api!.request("GET /activity", { signal }), [api]);
  const query = useApiQuery(load, { retain: true, pollMs: auth.user?.role === "operator" ? LIVE_POLL_MS : 0 });
  return (
    <>
      <PageTitle title="Activity" description="Review activity recorded by the server." action={<Button variant="secondary" onClick={query.retry}>Refresh</Button>} />
      <section data-slot="panel" className={panelClass}>
        <RecordFeedback query={query} item="activity" />
        {query.result.status === "ready" && (query.result.data.length ? (
          <ul>
            {query.result.data.map((item) => {
              const link = activityLink(item, auth.user?.role);
              return (
                <li key={item.operation_id} className={recordRowClass}>
                  <div>
                    <strong className="capitalize">{item.action.toLowerCase().replaceAll("_", " ")}</strong>
                    <p className="text-sm text-content-muted">{campusTime(item.at)}{auth.user?.role === "operator" && ` · ${item.actor_id}`}</p>
                    {item.reason && <p className="text-sm">{item.reason}</p>}
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge>{item.outcome.toLowerCase()}</Badge>
                    {link && <Link to={link}>View record</Link>}
                  </div>
                </li>
              );
            })}
          </ul>
        ) : <Empty title="No activity yet" text="Recorded actions will appear here." />)}
      </section>
    </>
  );
}
