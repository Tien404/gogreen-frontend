import { Icon } from "@/shared/components/Icon";
import { Badge, Battery, Button } from "@/shared/ui";
import type { VehicleTableModel } from "../hooks/useVehicleTable";
type FleetTableProps = Pick<
  VehicleTableModel,
  "list" | "current" | "s" | "go" | "setSelected"
> & {
  liveHubName?: string;
};
export function FleetTable({
  list,
  current,
  s,
  go,
  setSelected,
  liveHubName,
}: FleetTableProps) {
  return (
    <div className="overflow-x-auto max-w-full max-[600px]:my-0 max-[600px]:-mx-1">
      <table className="w-full border-collapse text-left text-sm max-[600px]:min-w-140">
        <thead>
          <tr>
            <th className="align-middle first:pl-0 last:pr-0 text-xs font-medium text-content-muted bg-surface-muted whitespace-nowrap [&_small]:block [&_small]:font-normal [&_small]:max-w-75 py-4 px-3">
              Shared vehicle
            </th>
            <th className="align-middle first:pl-0 last:pr-0 text-xs font-medium text-content-muted bg-surface-muted whitespace-nowrap [&_small]:block [&_small]:font-normal [&_small]:max-w-75 py-4 px-3">
              Hub
            </th>
            <th className="align-middle first:pl-0 last:pr-0 text-xs font-medium text-content-muted bg-surface-muted whitespace-nowrap [&_small]:block [&_small]:font-normal [&_small]:max-w-75 py-4 px-3">
              Battery
            </th>
            <th className="align-middle first:pl-0 last:pr-0 text-xs font-medium text-content-muted bg-surface-muted whitespace-nowrap [&_small]:block [&_small]:font-normal [&_small]:max-w-75 py-4 px-3">
              Status
            </th>
            <th className="align-middle first:pl-0 last:pr-0 text-xs font-medium text-content-muted bg-surface-muted whitespace-nowrap [&_small]:block [&_small]:font-normal [&_small]:max-w-75 py-4 px-3">
              Action
            </th>
          </tr>
        </thead>
        <tbody className="[&_tr:hover]:bg-surface-muted">
          {list.slice((current - 1) * 8, current * 8).map((v) => {
            const canFindRide = v.status === "available";
            return (
              <tr key={v.id}>
                <th
                  scope="row"
                  className="border-b border-solid border-b-divider align-middle first:pl-0 last:pr-0 font-medium whitespace-nowrap py-4 px-3"
                >
                  {v.id}
                  <small className="leading-[1.6] block font-normal max-w-75">
                    {v.type}
                  </small>
                </th>
                <td className="border-b border-solid border-b-divider align-middle first:pl-0 last:pr-0 [&_small]:block [&_small]:font-normal [&_small]:max-w-75 py-4 px-3">
                  {liveHubName ??
                    s.hubs.find((h) => h.id === v.hub)?.name ??
                    "In transit / off hub"}
                </td>
                <td className="border-b border-solid border-b-divider align-middle first:pl-0 last:pr-0 py-4 px-3">
                  <Battery value={v.battery} />
                  {v.stale && (
                    <small className="leading-[1.6] block font-normal max-w-75">
                      Stale reading
                    </small>
                  )}
                </td>
                <td className="border-b border-solid border-b-divider align-middle first:pl-0 last:pr-0 [&_small]:block [&_small]:font-normal [&_small]:max-w-75 py-4 px-3">
                  <Badge>{v.status}</Badge>
                </td>
                <td className="border-b border-solid border-b-divider align-middle first:pl-0 last:pr-0 [&_small]:block [&_small]:font-normal [&_small]:max-w-75 py-4 px-3">
                  {s.role === "student" ? (
                    <Button
                      variant="secondary"
                      disabled={!canFindRide}
                      title={
                        !canFindRide
                          ? "Unavailable, low or unknown battery"
                          : "Find a suitable ride"
                      }
                      onClick={() =>
                        go(
                          `/student/find-ride?${new URLSearchParams({ origin: v.hub ?? "" })}`,
                        )
                      }
                    >
                      Find ride
                    </Button>
                  ) : (
                    <Button variant="ghost" onClick={() => setSelected(v.id)}>
                      View details <Icon name="arrow" size={16} />
                    </Button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
