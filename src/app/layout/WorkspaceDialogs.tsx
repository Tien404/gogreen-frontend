import { useOptionalOperatorFeed } from "@/integration/operatorFeed";
import { alertLabel } from "@/integration/operatorRecords";
import { campusTime } from "@/integration/studentRecords";
import { RecordFeedback } from "@/shared/api/ApiRecordUi";
import { Link, Modal } from "@/shared/ui";
import type { WorkspaceModel } from "./useWorkspace";
type WorkspaceDialogsProps = Pick<
  WorkspaceModel,
  "notifications" | "setNotifications"
>;
export function WorkspaceDialogs({
  notifications,
  setNotifications,
}: WorkspaceDialogsProps) {
  const feed = useOptionalOperatorFeed();
  const data = feed?.result.status === "ready" ? feed.result.data.data : null;
  return (
    <>
      {feed && (
        <Modal
          title="Notifications"
          description="Current alerts from campus operations."
          open={notifications}
          onOpenChange={setNotifications}
        >
          <RecordFeedback query={feed} item="notifications" />
          {data &&
            (data.alerts.length ? (
              <ul className="divide-y divide-divider">
                {data.alerts.map((alert) => (
                  <li
                    key={`${alert.hub_id}-${alert.code}`}
                    className="flex flex-wrap justify-between gap-2 py-3"
                  >
                    <span>{alertLabel(alert.code)}</span>
                    <Link
                      to={`/operator/hubs/${encodeURIComponent(alert.hub_id)}`}
                    >
                      {data.hubs.find((hub) => hub.hub_id === alert.hub_id)
                        ?.name ?? alert.hub_id}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No active alerts.</p>
            ))}
          {data && (
            <p className="mt-3 text-sm text-content-muted">
              Updated {campusTime(data.as_of)}
            </p>
          )}
        </Modal>
      )}
    </>
  );
}
