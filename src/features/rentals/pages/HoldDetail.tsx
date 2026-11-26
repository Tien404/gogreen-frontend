import { StudentJourney } from "@/features/student-mobility/StudentJourney";
import { VehicleArtwork } from "@/shared/components/MobilityArtwork";
import { rememberedVehicleType } from "../model/vehiclePresentation";
import { vehicleLabel } from "@/integration/recordLabels";
import {
  Panel,
  Alert,
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
import { useEffect, useState } from "react";

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
  const clockKey = `${h?.expires ?? 0}-${s.clock}`;
  const [tick, setTick] = useState({ key: clockKey, elapsed: 0 });
  useEffect(() => {
    if (!active) return;
    const timer = window.setInterval(() => {
      setTick((prev) => ({
        key: clockKey,
        elapsed: prev.key === clockKey ? prev.elapsed + 1 : 1,
      }));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [active, clockKey]);
  const elapsedSeconds = tick.key === clockKey ? tick.elapsed : 0;
  if (!h) return <Missing />;
  const remaining = active ? Math.max(0, Math.ceil(h.expires - s.clock)) : 0;
  const totalSecondsLeft = active
    ? Math.max(0, Math.round((h.expires - s.clock) * 60) - elapsedSeconds)
    : 0;
  const countdownMins = String(Math.floor(totalSecondsLeft / 60)).padStart(
    2,
    "0",
  );
  const countdownSecs = String(totalSecondsLeft % 60).padStart(2, "0");
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
      go(recordUrl("rental", result.data.rental_id));
    } else refresh?.();
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
    <StudentJourney hub={h.origin} destination={h.destination} active={active}>
      <PageTitle
        title={
          active
            ? "Vehicle on hold"
            : h.status === "expired"
              ? "Your hold expired"
              : "Hold " + h.status
        }
      />
      <div
        data-slot="two-col"
        className="grid grid-cols-2 gap-5 **:data-[slot~=two-col]:gap-4 max-[900px]:gap-4 max-[900px]:grid-cols-1 max-[600px]:**:data-[slot~=two-col]:grid-cols-1"
      >
        <Panel data-slot="panel" className="min-w-0">
          {active && (
            <div data-slot="hold-deadline">
              <p className="text-sm font-medium text-content-muted">
                Time to pick up
              </p>
              <p
                className="mt-1 text-4xl font-semibold leading-none tracking-tight text-primary tabular-nums"
                aria-label={`${remaining} minutes remaining`}
              >
                {countdownMins}:{countdownSecs}
              </p>
            </div>
          )}
          {command.error != null && (
            <Alert tone="error">{apiErrorMessage(command.error)}</Alert>
          )}
          {active ? (
            <div className="flex items-center gap-3 mt-5 max-[600px]:grid max-[600px]:grid-cols-2 max-[600px]:*:data-[slot~=button]:w-full">
              <Confirm
                title="Cancel this hold?"
                description={`${h.vehicle} becomes available again at its current hub.`}
                trigger={
                  <Button variant="secondary" disabled={command.busy}>
                    Cancel
                  </Button>
                }
                onConfirm={cancel}
              />
              <Confirm
                title="Confirm vehicle pickup?"
                description={`${h.vehicle} will leave ${hubName(h.origin)}. Your ride starts immediately.`}
                trigger={
                  <Button
                    className="max-[600px]:button-wide"
                    disabled={command.busy}
                  >
                    Pick up <Icon name="arrow" />
                  </Button>
                }
                onConfirm={pickup}
              />
            </div>
          ) : (
            <>
              <Button
                className="max-[600px]:w-full"
                onClick={() => go("/student/find-ride")}
              >
                Find a ride
              </Button>
            </>
          )}
        </Panel>
        <Panel data-slot="panel" className="min-w-0">
          <div className="h-50 rounded-lg bg-soft grid place-items-center text-primary mb-5 max-[600px]:h-42.5">
            <VehicleArtwork
              type={v?.type ?? rememberedVehicleType(h.vehicle) ?? ""}
            />
          </div>
          <SectionHead
            title={
              v
                ? `${vehicleLabel(s, h.vehicle)} · ${v.type}`
                : vehicleLabel(s, h.vehicle)
            }
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
        </Panel>
      </div>
    </StudentJourney>
  );
}
