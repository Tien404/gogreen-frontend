import type { AppContext } from "@/app/providers/AppContext";
import { ActivityFeed } from "@/features/activity/components/ActivityFeed";
import { Icon } from "@/shared/components/Icon";
import { time } from "@/shared/lib/time";
import { Badge, Button, Link, SectionHead } from "@/shared/ui";

type DashboardActivityProps = Pick<AppContext, "s" | "go"> & {
  student: boolean;
};

export function DashboardActivity({ s, student, go }: DashboardActivityProps) {
  return (
    <div className="grid grid-cols-[1.45fr_1fr] gap-5 mt-5 max-[1200px]:grid-cols-[1.2fr_1fr] max-[900px]:grid-cols-2 max-[600px]:grid-cols-1 max-[600px]:mt-5">
      <section
        data-slot="panel"
        className="bg-panel rounded-sm min-w-0 max-[600px]:rounded-xs p-5 max-[600px]:p-5"
      >
        <SectionHead
          title="Recent activity"
          action={
            <Link
              data-slot="text-link"
              className="leading-[16px] text-accent inline-flex items-center gap-2 text-xs font-semibold hover:underline"
              to={`/${s.role}/activity`}
            >
              View all <Icon name="arrow" size={16} />
            </Link>
          }
        />
        <ActivityFeed compact />
      </section>
      <section
        data-slot="panel"
        className="bg-panel rounded-sm min-w-0 max-[600px]:rounded-xs p-5 max-[600px]:p-5"
      >
        <div
          data-slot="icon-box"
          className="inline-flex items-center justify-center bg-soft text-accent w-11 h-11 rounded-xs shrink-0 mb-5"
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
          s.bookings
            .filter(
              (b) =>
                b.owner === s.persona &&
                ["checked-in", "confirmed", "overstaying"].includes(b.status),
            )
            .map((b) => (
              <Link
                key={b.id}
                to={`/student/parking/${b.id}`}
                className="flex items-center justify-between gap-3 border-t border-solid border-t-divider text-sm py-4 px-0"
              >
                <span>
                  <strong>{s.hubs.find((h) => h.id === b.hub)?.name}</strong>
                  <small className="leading-[1.6] block">
                    {time(b.start)}–{time(b.end)} · {b.vehicle}
                  </small>
                </span>
                <Badge>{b.status}</Badge>
              </Link>
            ))
        ) : (
          <Button variant="secondary" onClick={() => go("/operator/incidents")}>
            Review incidents <Icon name="arrow" size={16} />
          </Button>
        )}
      </section>
    </div>
  );
}
