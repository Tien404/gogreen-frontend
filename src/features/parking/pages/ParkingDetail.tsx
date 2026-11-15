import { Missing } from "@/app/pages/Missing";
import { useApp } from "@/app/providers/AppContext";
import { config } from "@/config/app";
import { Icon } from "@/shared/components/Icon";
import { time } from "@/shared/lib/time";
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

type ParkingDetailProps = { id: string };

export function ParkingDetail({ id }: ParkingDetailProps) {
  const { s, act } = useApp();

  const b = s.bookings.find((b) => b.id === id && b.owner === s.persona)!;

  const [error, setError] = useState("");

  const action = (type: string) => {
    const r = act({ type, id: b?.id });

    setError(r.error ? r.message : "");
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
              {s.privateVehicles.find((v) => v.id === b.vehicle)?.identifier}
            </dd>
            <dt className="text-content-muted">Hub</dt>
            <dd className="wrap-anywhere m-0">
              {s.hubs.find((h) => h.id === b.hub)?.name}
            </dd>
            <dt className="text-content-muted">Starts</dt>
            <dd className="wrap-anywhere m-0">20 October · {time(b.start)}</dd>
            <dt className="text-content-muted">Ends</dt>
            <dd className="wrap-anywhere m-0">20 October · {time(b.end)}</dd>
            <dt className="text-content-muted">Timezone</dt>
            <dd className="wrap-anywhere m-0">Asia/Ho_Chi_Minh</dd>
            <dt className="text-content-muted">Service</dt>
            <dd className="wrap-anywhere m-0">{b.service}</dd>
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
                to={`/student/charging/${c.id}`}
              >
                <span>{c.id} · Charging</span>
                <Badge>{c.status}</Badge>
              </Link>
            ))}
        </section>
        <section
          data-slot="panel"
          className="bg-panel rounded-sm min-w-0 max-[600px]:rounded-xs p-5 max-[600px]:p-5"
        >
          <SectionHead title="Manage your booking" />
          {error && <Alert tone="error">{error}</Alert>}
          {b.status === "confirmed" && (
            <>
              <Alert>
                Check in from {time(b.start)} until{" "}
                {time(b.start + config.checkInGrace)}. Check-in opens at the
                booking start time.
              </Alert>
              <Button onClick={() => action("check-in")}>
                Check in vehicle <Icon name="check" />
              </Button>
              <div className="flex items-center flex-wrap gap-3 mt-5 *:data-[slot~=button]:shrink-0">
                <Confirm
                  title={`Cancel ${b.id}?`}
                  description="The parking booking and its pending or scheduled combined charging request will be cancelled."
                  trigger={<Button variant="ghost">Cancel booking</Button>}
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
                  title="Extend by 30 minutes?"
                  description={`This changes the end time from ${time(b.end)} to ${time(b.end + 30)} if the fixture interval is available.`}
                  trigger={
                    <Button variant="secondary">Extend 30 minutes</Button>
                  }
                  onConfirm={() => action("extend")}
                />
                <Confirm
                  title="Check out this vehicle?"
                  description="One parking space will be released and active charging stopped. Confirm only when ready to leave."
                  trigger={<Button>Check out</Button>}
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
