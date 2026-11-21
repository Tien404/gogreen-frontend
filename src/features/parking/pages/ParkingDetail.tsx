import { useRefreshStudentData } from "@/integration/studentRefresh";
import { studentDate } from "@/integration/studentData";
import { recordUrl } from "@/integration/studentRecords";
import { apiErrorMessage } from "@/shared/api/errors";
import { useApiAction } from "@/shared/api/useApiAction";
import { StudentData } from "@/integration/StudentScreenData";
import { Missing } from "@/app/pages/Missing";
import { useApp } from "@/app/providers/AppContext";
import { Icon } from "@/shared/components/Icon";
import {
  Alert,
  Badge,
  Button,
  Confirm,
  Link,
  PageTitle,
  SectionHead,
} from "@/shared/ui";
import { useState } from "react";
type ParkingDetailProps = {
  id: string;
};
export function ParkingDetail(props: ParkingDetailProps) {
  return (
    <StudentData screen="parking" id={props.id}>
      <ParkingDetailView {...props} />
    </StudentData>
  );
}
function ParkingDetailView({ id }: ParkingDetailProps) {
  const { s, api } = useApp();
  const refresh = useRefreshStudentData();
  const command = useApiAction();
  const b = s.bookings.find((b) => b.id === id && b.owner === s.persona)!;
  const [error] = useState("");
  const action = async (type: string) => {
    if (b) {
      const params = { reservation_id: b.id };
      await command.run(() => {
        if (type === "check-in")
          return api.request(
            "POST /parking/reservations/{reservation_id}/check-in",
            { params },
          );
        if (type === "cancel-booking")
          return api.request(
            "POST /parking/reservations/{reservation_id}/cancel",
            { params },
          );
        return api.request("POST /parking/sessions/{session_id}/check-out", {
          params: { session_id: b.sessionId! },
        });
      });
      refresh?.();
      return;
    }
  };
  if (!b) return <Missing />;
  return (
    <>
      <Link
        className="inline-flex items-center gap-2 text-xs text-content-muted mb-5"
        to="/student"
      >
        <Icon name="arrow-left" size={16} /> Overview
      </Link>
      <PageTitle
        title={`Parking ${b.id}`}
        description={`${s.hubs.find((h) => h.id === b.hub)?.name} · ${b.vehicle}`}
        action={<Badge>{b.status}</Badge>}
      />
      <div
        data-slot="two-col"
        className="grid grid-cols-2 gap-5 **:data-[slot~=two-col]:gap-4 [&_>_[data-slot~=panel]_>_p]:mt-3 [&_>_[data-slot~=panel]_>_p]:mb-5 max-[900px]:gap-4 max-[600px]:grid-cols-1 max-[600px]:**:data-[slot~=two-col]:grid-cols-1 [&_>_[data-slot~=panel]_>_p]:mx-0"
      >
        <section
          data-slot="panel"
          className="bg-panel rounded-sm min-w-0 max-[600px]:rounded-xs p-5 max-[600px]:p-5"
        >
          <div className="h-50 rounded-xs bg-soft grid place-items-center text-accent mb-5 max-[600px]:h-42.5">
            <Icon name="parking" size={64} />
          </div>
          <dl className="grid grid-cols-[minmax(100px,0.8fr)_1.2fr] gap-4 text-sm **:data-[slot~=badge]:align-top my-5 mx-0">
            <dt className="text-content-muted">Vehicle</dt>
            <dd className="wrap-anywhere m-0">
              {s.privateVehicles.find((v) => v.id === b.vehicle)?.identifier ??
                b.vehicle}
            </dd>
            <dt className="text-content-muted">Hub</dt>
            <dd className="wrap-anywhere m-0">
              {s.hubs.find((h) => h.id === b.hub)?.name}
            </dd>
            <dt className="text-content-muted">Starts</dt>
            <dd className="wrap-anywhere m-0">{studentDate(b.start)}</dd>
            <dt className="text-content-muted">Ends</dt>
            <dd className="wrap-anywhere m-0">{studentDate(b.end)}</dd>
            <dt className="text-content-muted">Timezone</dt>
            <dd className="wrap-anywhere m-0">Asia/Ho_Chi_Minh</dd>
            <dt className="text-content-muted">Service</dt>
            <dd className="wrap-anywhere m-0">{b.service}</dd>
            {b.space && (
              <>
                <dt className="text-content-muted">Parking space</dt>
                <dd className="wrap-anywhere m-0">{b.space}</dd>
              </>
            )}
            <dt className="text-content-muted">Physical occupancy</dt>
            <dd className="wrap-anywhere m-0">
              {["checked-in", "overstaying"].includes(b.status)
                ? "Vehicle occupies one parking space"
                : "No current space occupied by this booking"}
            </dd>
          </dl>
          {s.charges
            .filter((c) => c.booking === b.id)
            .map((c) => (
              <Link
                className="flex items-center justify-between gap-3 border-t border-solid border-t-divider text-sm [&_small]:block py-4 px-0"
                key={c.id}
                to={recordUrl("charging", c.id)}
              >
                <span className="min-w-0 wrap-anywhere">{c.id} · Charging</span>
                <Badge>{c.status}</Badge>
              </Link>
            ))}
        </section>
        <section
          data-slot="panel"
          className="bg-panel rounded-sm min-w-0 max-[600px]:rounded-xs p-5 max-[600px]:p-5"
        >
          <SectionHead title="Manage your booking" />
          {command.error != null && (
            <Alert tone="error">{apiErrorMessage(command.error)}</Alert>
          )}
          {error && <Alert tone="error">{error}</Alert>}
          {["confirmed", "checked-in"].includes(b.status) && (
            <Link
              to={`/student/charging/new?${new URLSearchParams({ parking: b.id })}`}
            >
              Request charging
            </Link>
          )}
          {b.status === "confirmed" && (
            <>
              <Alert>
                {`Check-in opens at ${studentDate(b.start)}. The server checks whether your booking is still eligible.`}
              </Alert>
              <Button
                disabled={command.busy}
                onClick={() => action("check-in")}
              >
                Check in vehicle <Icon name="check" />
              </Button>
              <div className="flex items-center flex-wrap gap-3 mt-5 *:data-[slot~=button]:shrink-0">
                <Confirm
                  title={`Cancel ${b.id}?`}
                  description={
                    "Cancel this parking booking and any charging request linked to it."
                  }
                  trigger={
                    <Button variant="ghost" disabled={command.busy}>
                      Cancel booking
                    </Button>
                  }
                  onConfirm={() => action("cancel-booking")}
                />
              </div>
            </>
          )}
          {["checked-in", "overstaying"].includes(b.status) && (
            <>
              <Alert tone={b.status === "overstaying" ? "error" : "info"}>
                {b.status === "overstaying"
                  ? "Your booking is overdue. Your vehicle still occupies its space."
                  : "Your private vehicle is checked in."}
              </Alert>
              <div className="flex items-center flex-wrap gap-3 mt-5 *:data-[slot~=button]:shrink-0">
                <Confirm
                  title="Check out this vehicle?"
                  description="One parking space will be released and active charging stopped. Confirm only when ready to leave."
                  trigger={
                    <Button disabled={command.busy || !b.sessionId}>
                      Check out
                    </Button>
                  }
                  onConfirm={() => action("checkout")}
                />
              </div>
            </>
          )}
          {["completed", "cancelled", "expired"].includes(b.status) && (
            <>
              <Alert>
                {b.status === "expired"
                  ? "No-show: this booking expired without check-in. No parked vehicle was removed."
                  : `This booking is ${b.status}.`}
              </Alert>
              <Link
                to="/student/parking/new"
                data-slot="button"
                className="active:translate-y-px inline-flex items-center justify-center gap-2 min-h-11 rounded-xs text-sm font-medium leading-[24px] whitespace-normal text-on-dark bg-accent [&:hover:not(:disabled)]:bg-brand-hover [&:hover:not(:disabled)]:text-on-dark py-2 px-5"
              >
                Book parking again
              </Link>
            </>
          )}
        </section>
      </div>
    </>
  );
}
