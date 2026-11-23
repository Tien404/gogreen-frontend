import { Panel, Badge, Button, Link, SectionHead } from "@/shared/ui";
import { type AppContext } from "@/app/providers/AppContext";
import { ActivityFeed } from "@/features/activity/components/ActivityFeed";
import { Icon } from "@/shared/components/Icon";
import { studentDate } from "@/integration/studentData";
import { recordUrl } from "@/integration/studentRecords";
import { time } from "@/shared/lib/time";

type DashboardActivityProps = Pick<AppContext, "s" | "go"> & {
  student: boolean;
};
export function DashboardActivity({ s, student, go }: DashboardActivityProps) {
  const history = student
    ? [
        ...s.rides.map((ride) => ({
          url: recordUrl("rental", ride.id),
          name: `Ride · ${ride.vehicle}`,
          time: `Picked up ${studentDate(ride.start)}`,
          status: ride.status,
        })),
        ...s.holds.map((hold) => ({
          url: recordUrl("hold", hold.id),
          name: `Hold · ${hold.vehicle}`,
          time: `Expires ${studentDate(hold.expires)}`,
          status: hold.status,
        })),
      ]
    : [];
  return (
    <div className="grid grid-cols-[1.45fr_1fr] gap-5 mt-5 max-[1200px]:grid-cols-[1.2fr_1fr] max-[900px]:grid-cols-1 max-[600px]:grid-cols-1 max-[600px]:mt-5">
      <Panel data-slot="panel" className="min-w-0">
        <SectionHead
          title="Recent activity"
          action={
            <Link
              data-slot="text-link"
              className="leading-[16px] text-primary inline-flex items-center gap-2 text-sm font-semibold hover:underline"
              to={`/${s.role}/activity`}
            >
              View all <Icon name="arrow" size={16} />
            </Link>
          }
        />
        <ActivityFeed compact />
        {history.length > 0 && (
          <details className="mt-4 border-t border-divider pt-4">
            <summary className="cursor-pointer text-sm font-semibold">
              Your holds and rides
            </summary>
            {history.map((record) => (
              <Link
                key={record.url}
                to={record.url}
                className="flex items-center justify-between gap-3 py-3 text-sm"
              >
                <span className="min-w-0 wrap-anywhere">
                  <strong>{record.name}</strong>
                  <small className="block text-content-muted">
                    {record.time}
                  </small>
                </span>
                <Badge>{record.status}</Badge>
              </Link>
            ))}
          </details>
        )}
      </Panel>
      <Panel data-slot="panel" className="min-w-0 self-start">
        <div
          data-slot="icon-box"
          className="inline-flex items-center justify-center bg-soft text-primary w-11 h-11 rounded-lg shrink-0 mb-5"
        >
          <Icon name={student ? "parking" : "alert"} size={24} />
        </div>
        <h2 className="leading-[1.4] mb-2">
          {student
            ? "Your parking, sorted."
            : "A little attention goes a long way."}
        </h2>
        <p className="leading-[1.65] mb-5">
          {student
            ? "Your bookings and charging sessions, all in one place."
            : `${s.incidents.filter((i) => i.status === "open").length} open incidents across the network. Review linked resources before taking action.`}
        </p>
        {student ? (
          <>
            {!s.bookings.some(
              (booking) =>
                booking.owner === s.persona &&
                ["checked-in", "confirmed", "overstaying"].includes(
                  booking.status,
                ),
            ) &&
              !s.charges.some((charge) =>
                ["pending", "scheduled", "active"].includes(charge.status),
              ) && (
                <div>
                  <p className="mb-4">
                    No active parking bookings or charging sessions.
                  </p>
                  <Button
                    variant="secondary"
                    onClick={() => go("/student/parking/new")}
                  >
                    Book parking <Icon name="arrow" size={16} />
                  </Button>
                </div>
              )}
            {s.bookings
              .filter(
                (b) =>
                  b.owner === s.persona &&
                  ["checked-in", "confirmed", "overstaying"].includes(b.status),
              )
              .map((b) => (
                <Link
                  key={b.id}
                  to={`/student/parking/${encodeURIComponent(b.id)}`}
                  className="flex items-center justify-between gap-3 border-t border-solid border-t-divider text-sm py-4 px-0"
                >
                  <span className="min-w-0 wrap-anywhere">
                    <strong>{s.hubs.find((h) => h.id === b.hub)?.name}</strong>
                    <small className="leading-[1.6] block">
                      {time(b.start)}–{time(b.end)} · {b.vehicle}
                    </small>
                  </span>
                  <Badge>{b.status}</Badge>
                </Link>
              ))}
            {s.charges
              .filter((charge) =>
                ["pending", "scheduled", "active"].includes(charge.status),
              )
              .map((charge) => (
                <Link
                  to={`/student/charging/${encodeURIComponent(charge.id)}`}
                  key={charge.id}
                  className="flex items-center justify-between gap-3 border-t border-solid border-t-divider text-sm py-4 px-0"
                >
                  <span className="min-w-0 wrap-anywhere">
                    <strong>Charging</strong>
                    <small className="block">{charge.vehicle}</small>
                  </span>
                  <Badge>{charge.status}</Badge>
                </Link>
              ))}
          </>
        ) : (
          <Button variant="secondary" onClick={() => go("/operator/incidents")}>
            Review incidents <Icon name="arrow" size={16} />
          </Button>
        )}
      </Panel>
    </div>
  );
}
