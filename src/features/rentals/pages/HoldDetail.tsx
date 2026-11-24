import { VehicleArtwork } from "@/shared/components/MobilityArtwork";
import { rememberedVehicleType } from "../model/vehiclePresentation";
import { vehicleLabel } from "@/integration/recordLabels";
import {
  Panel,
  RecordReference,
  Alert,
  Badge,
  Battery,
  Button,
  Confirm,
  PageTitle,
  SectionHead,
} from "@/shared/ui";
import { useRefreshStudentData } from "@/integration/studentRefresh";
import { recordUrl } from "@/integration/studentRecords";
import { apiErrorMessage } from "@/shared/api/errors";
import { useApiAction } from "@/shared/api/useApiAction";
import { StudentData } from "@/integration/StudentScreenData";
import { Missing } from "@/app/pages/Missing";
import { useApp } from "@/app/providers/AppContext";
import { Icon } from "@/shared/components/Icon";
import { time } from "@/shared/lib/time";

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
  const { s, go, api, notify } = useApp();
  const refresh = useRefreshStudentData();
  const command = useApiAction();
  const h = s.holds.find((h) => h.id === id && h.owner === s.persona)!;
  const v = s.vehicles.find((v) => v.id === h?.vehicle);
  const active = h?.status === "held";
  if (!h) return <Missing />;
  const remaining = active ? Math.max(0, Math.ceil(h.expires - s.clock)) : 0;
  const hubName = (id: string) =>
    s.hubs.find((hub) => hub.id === id)?.name ??
    (id ? "Unknown hub" : "Not specified");
  async function pickup() {
    const result = await command.run(() =>
      api.request("POST /rentals/reservations/{reservation_id}/pickup", {
        params: { reservation_id: h.id },
      }),
    );
    if (result.ok) {
      notify("Vehicle unlocked and picked up. Have a safe ride!", "success");
      go(recordUrl("rental", result.data.rental_id));
    } else refresh?.();
  }
  async function cancel() {
    const result = await command.run(() =>
      api.request("POST /rentals/reservations/{reservation_id}/cancel", {
        params: { reservation_id: h.id },
      }),
    );
    if (result.ok) {
      notify("Vehicle hold reservation cancelled.", "info");
    }
    refresh?.();
  }
  return (
    <>
      <PageTitle
        title={active ? "Your ride is waiting." : `Hold ${h.status}`}
        description={`${vehicleLabel(s, h.vehicle)} · Pick up at ${hubName(h.origin)}`}
        action={<Badge>{h.status}</Badge>}
      />
      <div
        data-slot="two-col"
        className="grid grid-cols-2 gap-5 **:data-[slot~=two-col]:gap-4 max-[900px]:gap-4 max-[900px]:grid-cols-1 max-[600px]:**:data-[slot~=two-col]:grid-cols-1"
      >
        <Panel data-slot="panel" className="min-w-0">
          <div className="h-50 rounded-lg bg-soft grid place-items-center text-primary mb-5 max-[600px]:h-42.5">
            <VehicleArtwork
              type={v?.type ?? rememberedVehicleType(h.vehicle) ?? ""}
            />
          </div>
          <SectionHead
            title={v ? `${h.vehicle} · ${v.type}` : h.vehicle}
            action={<Battery value={v?.battery ?? null} />}
          />
          <dl className="record-details">
            <dt className="text-content-muted">Pickup location</dt>
            <dd className="wrap-anywhere m-0">{hubName(h.origin)}</dd>
            <dt className="text-content-muted">Intended destination</dt>
            <dd className="wrap-anywhere m-0">{hubName(h.destination)}</dd>
            <dt className="text-content-muted">Hold expires</dt>
            <dd className="wrap-anywhere m-0">{time(h.expires)}</dd>
          </dl>
          <RecordReference value={h.id} label="Hold reference" />
          <Alert>
            No return space is reserved. Check availability when you arrive.
          </Alert>
        </Panel>
        <Panel data-slot="panel" className="min-w-0">
          <span
            data-slot="hold-deadline"
            className="text-sm font-medium text-primary"
          >
            {active ? "Hold countdown" : "Hold status"}
          </span>
          <div
            className="text-3xl leading-[1.3] tracking-tight text-primary tabular-nums my-4 capitalize"
            aria-label={active ? `${remaining} minutes remaining` : undefined}
          >
            {active ? (
              <>
                {remaining}
                <span className="text-base font-normal normal-case"> min</span>
              </>
            ) : (
              h.status.replaceAll("-", " ")
            )}
          </div>
          <p className="leading-[1.65] mt-3 mb-5 mx-0">
            {active
              ? "Pick up your vehicle before the hold expires."
              : "This hold is no longer active."}
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
        </Panel>
      </div>
    </>
  );
}
