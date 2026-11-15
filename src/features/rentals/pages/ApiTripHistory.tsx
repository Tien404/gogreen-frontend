import { useApp } from "@/app/providers/AppContext";
import { campusTime, recordUrl, statusLabel } from "@/integration/studentRecords";
import { panelClass, recordRowClass, RecordFeedback } from "@/shared/api/ApiRecordUi";
import { useApiQuery } from "@/shared/api/useApiQuery";
import { Badge, Empty, Link, SectionHead } from "@/shared/ui";
import { useCallback } from "react";

export function ApiTripHistory() {
  const { api } = useApp();
  const load = useCallback(async (signal: AbortSignal) => {
    const [holds, rides] = await Promise.all([
      api!.request("GET /rentals/reservations", { signal }),
      api!.request("GET /rentals/rentals", { signal }),
    ]);
    return { holds, rides };
  }, [api]);
  const query = useApiQuery(load, { retain: true });
  return (
    <section data-slot="panel" className={panelClass}>
      <SectionHead title="Your holds and rides" action={<Link to="/student/find-ride">Find a ride</Link>} />
      <RecordFeedback query={query} item="holds and rides" />
      {query.result.status === "ready" && (
        query.result.data.holds.length || query.result.data.rides.length ? (
          <ul>
            {query.result.data.rides.map((ride) => (
              <li key={ride.rental_id} className={recordRowClass}>
                <div>
                  <Link to={recordUrl("rental", ride.rental_id)}>Ride · {ride.vehicle_id}</Link>
                  <p className="text-sm text-content-muted">Picked up {campusTime(ride.picked_up_at)}</p>
                </div>
                <Badge>{statusLabel("rental", ride.status)}</Badge>
              </li>
            ))}
            {query.result.data.holds.map((hold) => (
              <li key={hold.reservation_id} className={recordRowClass}>
                <div>
                  <Link to={recordUrl("hold", hold.reservation_id)}>Hold · {hold.vehicle_id}</Link>
                  <p className="text-sm text-content-muted">Expires {campusTime(hold.expires_at)}</p>
                </div>
                <Badge>{statusLabel("hold", hold.status)}</Badge>
              </li>
            ))}
          </ul>
        ) : <Empty title="No holds or rides yet" text="Find a shared vehicle when you’re ready to travel." />
      )}
    </section>
  );
}
