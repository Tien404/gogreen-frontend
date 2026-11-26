import { StudentActivityCard } from "@/features/student-mobility/StudentActivityCard";
import { StudentJourney } from "@/features/student-mobility/StudentJourney";
import { StudentRecordLink } from "@/features/student-mobility/StudentRecordLink";
import { currentStudentActivities } from "@/features/student-mobility/studentActivities";
import { recordUrl } from "@/integration/studentRecords";
import { useState } from "react";
import { useApp } from "@/app/providers/AppContext";
import { StudentData } from "@/integration/StudentScreenData";
import { studentDate } from "@/integration/studentData";
import { vehicleLabel } from "@/integration/recordLabels";
import { Icon } from "@/shared/components/Icon";
import { Button, Empty, Link, PageTitle, Panel } from "@/shared/ui";

export function Parking() {
  return (
    <StudentData screen="parkingList">
      <ParkingList />
    </StudentData>
  );
}
function ParkingList() {
  const { s } = useApp();
  const [filter, setFilter] = useState("all");
  const bookings = s.bookings.filter((booking) => booking.owner === s.persona);
  const visible = bookings
    .filter(
      (booking) =>
        filter === "all" ||
        (filter === "upcoming"
          ? booking.status === "confirmed"
          : filter === "parked"
            ? ["checked-in", "overstaying"].includes(booking.status)
            : !["confirmed", "checked-in", "overstaying"].includes(
                booking.status,
              )),
    )
    .sort((a, b) => b.start - a.start);
  const currentBooking =
    bookings.find((item) =>
      ["checked-in", "overstaying"].includes(item.status),
    ) ?? bookings.find((item) => item.status === "confirmed");
  const activeCard = currentStudentActivities(s).find(
    (item) => item.kind === "parking",
  );
  return (
    <StudentJourney
      hub={currentBooking?.hub}
      active={Boolean(activeCard)}
      availabilityMode="parking"
    >
      <PageTitle
        title="Parking"
        action={
          <Button asChild size="sm">
            <Link to="/student/parking/new">
              <Icon name="plus" size={16} />
              New parking
            </Link>
          </Button>
        }
      />
      {activeCard && (
        <div className="mb-5">
          <StudentActivityCard activity={activeCard} headingLevel={2} />
        </div>
      )}
      <div
        role="group"
        aria-label="Parking status filter"
        className="segmented-control mb-4"
      >
        {["all", "upcoming", "parked", "history"].map((value) => (
          <button
            key={value}
            className="capitalize"
            aria-pressed={filter === value}
            onClick={() => setFilter(value)}
          >
            {value}
          </button>
        ))}
      </div>
      {visible.length ? (
        <ul aria-label="Your parking bookings" className="grid gap-3">
          {visible.map((booking) => (
            <StudentRecordLink
              key={booking.id}
              to={recordUrl("parking", booking.id)}
              title={vehicleLabel(s, booking.vehicle)}
              location={
                s.hubs.find((hub) => hub.id === booking.hub)?.name ??
                "Parking hub"
              }
              detail={
                studentDate(booking.start) +
                " – " +
                studentDate(booking.end) +
                (s.charges.some((charge) => charge.booking === booking.id)
                  ? " · Parking + charging"
                  : "")
              }
              status={booking.status}
            />
          ))}
        </ul>
      ) : (
        <Panel className="bg-surface-muted">
          <Empty
            title={
              bookings.length
                ? "No bookings in this view"
                : "No parking bookings yet"
            }
            text={
              bookings.length
                ? "Choose another filter to see your parking bookings."
                : "Book a space for your private vehicle, with optional charging."
            }
            action={
              bookings.length ? (
                <Button variant="secondary" onClick={() => setFilter("all")}>
                  Show all
                </Button>
              ) : (
                <Button asChild>
                  <Link to="/student/parking/new">New parking</Link>
                </Button>
              )
            }
          />
        </Panel>
      )}
    </StudentJourney>
  );
}
