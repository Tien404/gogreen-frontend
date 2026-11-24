import { useState } from "react";
import { useApp } from "@/app/providers/AppContext";
import { StudentData } from "@/integration/StudentScreenData";
import { studentDate } from "@/integration/studentData";
import { vehicleLabel } from "@/integration/recordLabels";
import { Icon } from "@/shared/components/Icon";
import {
  Badge,
  Button,
  Empty,
  Link,
  PageTitle,
  Panel,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui";

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
  return (
    <>
      <PageTitle
        title="Parking"
        description="Your parking bookings, current stays and history."
        action={
          <Button asChild>
            <Link to="/student/parking/new">
              <Icon name="plus" />
              Book parking
            </Link>
          </Button>
        }
      />
      <div
        role="group"
        aria-label="Parking status filter"
        className="segmented-control mb-5"
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
        <Panel>
          <Table aria-label="Your parking bookings" className="min-w-190">
            <TableHeader>
              <TableRow>
                <TableHead>Vehicle</TableHead>
                <TableHead>Hub</TableHead>
                <TableHead>Parking interval</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>
                  <span className="sr-only">Details</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visible.map((booking) => (
                <TableRow key={booking.id}>
                  <TableHead scope="row">
                    {vehicleLabel(s, booking.vehicle)}
                  </TableHead>
                  <TableCell>
                    {s.hubs.find((hub) => hub.id === booking.hub)?.name ??
                      "Parking hub"}
                  </TableCell>
                  <TableCell>
                    {studentDate(booking.start)}
                    <span className="block text-content-muted">
                      to {studentDate(booking.end)}
                    </span>
                  </TableCell>
                  <TableCell>
                    {s.charges.some((charge) => charge.booking === booking.id)
                      ? "Parking + charging"
                      : "Parking only"}
                  </TableCell>
                  <TableCell>
                    <Badge>{booking.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <Link
                      className="inline-flex min-h-11 items-center gap-2 whitespace-nowrap font-semibold text-primary"
                      to={`/student/parking/${encodeURIComponent(booking.id)}`}
                    >
                      View booking <Icon name="arrow" size={16} />
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Panel>
      ) : (
        <Panel>
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
                  Show all bookings
                </Button>
              ) : (
                <Button asChild>
                  <Link to="/student/parking/new">Book parking</Link>
                </Button>
              )
            }
          />
        </Panel>
      )}
    </>
  );
}
