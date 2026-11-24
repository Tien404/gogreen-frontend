import { vehicleLabel } from "@/integration/recordLabels";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  Badge,
  Battery,
  Button,
} from "@/shared/ui";
import { Icon } from "@/shared/components/Icon";

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
    <div className="min-w-0 max-w-full">
      <Table
        aria-label="Shared fleet vehicles"
        className="w-full border-collapse text-left text-sm max-[600px]:min-w-140"
      >
        <TableHeader>
          <TableRow>
            <TableHead className="[&_small]:block [&_small]:font-normal [&_small]:max-w-75">
              Shared vehicle
            </TableHead>
            <TableHead className="[&_small]:block [&_small]:font-normal [&_small]:max-w-75">
              Hub
            </TableHead>
            <TableHead className="[&_small]:block [&_small]:font-normal [&_small]:max-w-75">
              Battery
            </TableHead>
            <TableHead className="[&_small]:block [&_small]:font-normal [&_small]:max-w-75">
              Status
            </TableHead>
            <TableHead className="[&_small]:block [&_small]:font-normal [&_small]:max-w-75">
              Action
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {list.slice((current - 1) * 8, current * 8).map((v) => {
            const canFindRide = v.status === "available";
            return (
              <TableRow key={vehicleLabel(s, v.id)}>
                <TableHead
                  scope="row"
                  className="border-b border-solid border-b-divider "
                >
                  {vehicleLabel(s, v.id)}
                  <small className="leading-[1.6] block font-normal max-w-75">
                    {v.type}
                  </small>
                </TableHead>
                <TableCell className="border-b border-solid border-b-divider  [&_small]:block [&_small]:font-normal [&_small]:max-w-75">
                  {liveHubName ??
                    s.hubs.find((h) => h.id === v.hub)?.name ??
                    "In transit / off hub"}
                </TableCell>
                <TableCell className="border-b border-solid border-b-divider ">
                  <Battery value={v.battery} />
                  {v.stale && (
                    <small className="leading-[1.6] block font-normal max-w-75">
                      Stale reading
                    </small>
                  )}
                </TableCell>
                <TableCell className="border-b border-solid border-b-divider  [&_small]:block [&_small]:font-normal [&_small]:max-w-75">
                  <Badge>{v.status}</Badge>
                </TableCell>
                <TableCell className="border-b border-solid border-b-divider  [&_small]:block [&_small]:font-normal [&_small]:max-w-75">
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
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
