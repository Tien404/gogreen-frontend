import { useRefreshStudentData } from "@/integration/studentRefresh";
import { recordUrl } from "@/integration/studentRecords";
import { apiErrorMessage } from "@/shared/api/errors";
import { useApiAction } from "@/shared/api/useApiAction";
import { StudentData } from "@/integration/StudentScreenData";
import { Missing } from "@/app/pages/Missing";
import { useApp } from "@/app/providers/AppContext";
import { Icon } from "@/shared/components/Icon";
import { time } from "@/shared/lib/time";
import {
  Alert,
  Badge,
  Battery,
  Button,
  Confirm,
  PageTitle,
  SectionHead,
} from "@/shared/ui";
type HoldDetailProps = {
  id: string;
};
export function HoldDetail(props: HoldDetailProps) {
  return (
    <StudentData screen="hold" id={props.id}>
      <HoldDetailView {...props} />
    </StudentData>
  );
}
function HoldDetailView({ id }: HoldDetailProps) {
  const { s, go, api } = useApp();
  const refresh = useRefreshStudentData();
  const command = useApiAction();
  const h = s.holds.find((h) => h.id === id && h.owner === s.persona)!;
  const v = s.vehicles.find((v) => v.id === h?.vehicle);
  const active = h?.status === "held";
  if (!h) return <Missing />;
  const remaining = active ? Math.max(0, Math.ceil(h.expires - s.clock)) : 0;
  const hubName = (id: string) =>
    s.hubs.find((hub) => hub.id === id)?.name ?? (id || "Not specified");
  async function pickup() {
    const result = await command.run(() =>
      api.request("POST /rentals/reservations/{reservation_id}/pickup", {
        params: { reservation_id: h.id },
      }),
    );
    if (result.ok) go(recordUrl("rental", result.data.rental_id));
    else refresh?.();
  }
  async function cancel() {
    await command.run(() =>
      api.request("POST /rentals/reservations/{reservation_id}/cancel", {
        params: { reservation_id: h.id },
      }),
    );
    refresh?.();
  }
  return (
    <>
      <PageTitle
        title={active ? "Your ride is waiting." : `Hold ${h.status}`}
        description={`${h.id} · Pick up at ${hubName(h.origin)}`}
        action={<Badge>{h.status}</Badge>}
      />
      <div
        data-slot="two-col"
        className="grid grid-cols-2 gap-5 **:data-[slot~=two-col]:gap-4 max-[900px]:gap-4 max-[600px]:grid-cols-1 max-[600px]:**:data-[slot~=two-col]:grid-cols-1"
      >
        <section
          data-slot="panel"
          className="bg-panel rounded-sm min-w-0 max-[600px]:rounded-xs p-5 max-[600px]:p-5"
        >
          <div className="h-50 rounded-xs bg-soft grid place-items-center text-accent mb-5 max-[600px]:h-42.5">
            <Icon name="bike" size={96} />
          </div>
          <SectionHead
            title={v ? `${h.vehicle} · ${v.type}` : h.vehicle}
            action={<Battery value={v?.battery ?? null} />}
          />
          <dl className="grid grid-cols-[minmax(100px,0.8fr)_1.2fr] gap-4 text-sm **:data-[slot~=badge]:align-top my-5 mx-0">
            <dt className="text-content-muted">Pickup location</dt>
            <dd className="wrap-anywhere m-0">{hubName(h.origin)}</dd>
            <dt className="text-content-muted">Intended destination</dt>
            <dd className="wrap-anywhere m-0">{hubName(h.destination)}</dd>
            <dt className="text-content-muted">Hold expires</dt>
            <dd className="wrap-anywhere m-0">
              {time(h.expires)} · Asia/Ho_Chi_Minh
            </dd>
          </dl>
          <Alert>
            No return space is reserved. Check availability when you arrive.
          </Alert>
        </section>
        <section
          data-slot="panel"
          className="bg-panel rounded-sm min-w-0 max-[600px]:rounded-xs p-5 max-[600px]:p-5"
        >
          <span
            data-slot="eyebrow"
            className="text-xs font-semibold tracking-[1.7px] text-accent mb-3"
          >
            HOLD COUNTDOWN
          </span>
          <div
            className="text-lg leading-[1.3] tracking-[-3px] text-accent max-[600px]:text-lg my-5 mx-0"
            aria-label={`${remaining} minutes remaining`}
          >
            {String(remaining).padStart(2, "0")}
            <span className="text-[#52705c]">:00</span>
          </div>
          <p className="leading-[1.65] mt-3 mb-5 mx-0">
            Pick up your vehicle before the hold expires.
          </p>
          {command.error != null && (
            <Alert tone="error">{apiErrorMessage(command.error)}</Alert>
          )}
          {active ? (
            <>
              <Confirm
                title="Confirm vehicle pickup?"
                description={`${h.vehicle} will leave ${hubName(h.origin)}. Your ride starts immediately.`}
                trigger={
                  <Button disabled={command.busy}>
                    Confirm pickup <Icon name="arrow" />
                  </Button>
                }
                onConfirm={pickup}
              />
              <div className="flex items-center flex-wrap gap-3 mt-5 *:data-[slot~=button]:shrink-0">
                <Confirm
                  title="Cancel this hold?"
                  description={`${h.vehicle} becomes available again at its current hub.`}
                  trigger={
                    <Button variant="ghost" disabled={command.busy}>
                      Cancel hold
                    </Button>
                  }
                  onConfirm={cancel}
                />
              </div>
            </>
          ) : (
            <>
              <Alert tone={h.status === "expired" ? "error" : "info"}>
                {h.status === "expired"
                  ? "Your hold expired. The vehicle is available to reserve again."
                  : "This hold has ended."}
              </Alert>
              <Button onClick={() => go("/student/find-ride")}>
                Find another ride
              </Button>
            </>
          )}
        </section>
      </div>
    </>
  );
}
