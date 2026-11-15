import { useOptionalOperatorFeed } from "@/integration/operatorFeed";
import { alertLabel } from "@/integration/operatorRecords";
import { campusTime } from "@/integration/studentRecords";
import { RecordFeedback } from "@/shared/api/ApiRecordUi";
import { DemoControls } from "@/features/demo/pages/DemoControls";
import { time } from "@/shared/lib/time";
import { Alert, Button, Link, Modal } from "@/shared/ui";
import { useApp } from "../providers/AppContext";
import type { WorkspaceModel } from "./useWorkspace";

type WorkspaceDialogsProps = Pick<
  WorkspaceModel,
  | "controls"
  | "setControls"
  | "notifications"
  | "setNotifications"
  | "profile"
  | "setProfile"
  | "s"
  | "auth"
  | "enter"
  | "go"
>;

export function WorkspaceDialogs({
  controls,
  setControls,
  notifications,
  setNotifications,
  profile,
  setProfile,
  s,
  auth,
  enter,
  go,
}: WorkspaceDialogsProps) {
  const { mode } = useApp();
  const feed = useOptionalOperatorFeed();
  if (mode === "api") {
    const data = feed?.result.status === "ready" ? feed.result.data.data : null;
    return (
      <>
        {feed && <Modal
          title="Notifications"
          description="Current alerts from campus operations."
          open={notifications}
          onOpenChange={setNotifications}
        >
          <RecordFeedback query={feed} item="notifications" />
          {data && (data.alerts.length ? <ul className="divide-y divide-divider">
            {data.alerts.map((alert) => (
              <li key={`${alert.hub_id}-${alert.code}`} className="flex flex-wrap justify-between gap-2 py-3">
                <span>{alertLabel(alert.code)}</span>
                <Link to={`/operator/hubs/${encodeURIComponent(alert.hub_id)}`}>{data.hubs.find((hub) => hub.hub_id === alert.hub_id)?.name ?? alert.hub_id}</Link>
              </li>
            ))}
          </ul> : <p>No active alerts.</p>)}
          {data && <p className="mt-3 text-xs text-content-muted">Updated {campusTime(data.as_of)}</p>}
        </Modal>}
        <Modal
          title="Your account"
          description="Signed-in account for this workspace."
          open={profile}
          onOpenChange={setProfile}
        >
          <p className="font-medium">{auth.user?.name}</p>
          <p className="capitalize text-content-muted">{auth.user?.role}</p>
        </Modal>
      </>
    );
  }
  return (
    <>
      <Modal
        demo
        title="Demo"
        description="Reproduce exceptions, advance time and reset local data."
        drawer
        open={controls}
        onOpenChange={setControls}
      >
        <div className="*:data-[slot~=page-title]:hidden **:data-[slot~=two-col]:grid-cols-1 **:data-[slot~=clock-display]:text-lg [&_[data-slot~=demo-page]_>_[data-slot~=page-title]]:hidden">
          <DemoControls />
        </div>
      </Modal>
      <Modal
        title="Notifications"
        description="Updates from this local demonstration."
        open={notifications}
        onOpenChange={setNotifications}
      >
        {s.incidents
          .filter((i) => i.status === "open")
          .map((i) => (
            <Alert key={i.id} tone="error">
              {i.resource}: {i.description}
            </Alert>
          ))}
        <p className="leading-[1.65] text-content-muted">
          Updated at {time(s.clock)}
        </p>
      </Modal>
      <Modal
        demo
        title="Demo"
        description="Role switching changes the persona shown in this frontend."
        open={profile}
        onOpenChange={setProfile}
      >
        <div className="flex flex-col gap-4">
          <Button
            variant="secondary"
            onClick={() => enter(s.role === "student" ? "operator" : "student")}
          >
            Switch to {s.role === "student" ? "operator" : "student"} workspace
          </Button>
          {s.role === "student" && (
            <Button
              variant="secondary"
              onClick={() => {
                auth.preview(
                  "student",
                  s.persona === "student" ? "student-2" : "student",
                );
                setProfile(false);
              }}
            >
              Switch student account
            </Button>
          )}
          <Button variant="ghost" onClick={() => go("/")}>
            Exit to entry
          </Button>
        </div>
      </Modal>
    </>
  );
}
