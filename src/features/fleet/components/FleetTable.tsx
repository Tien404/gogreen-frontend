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
  const pageItems = list.slice((current - 1) * 8, current * 8);
  const hubTitle = (hubId?: string | null) =>
    liveHubName ??
    s.hubs.find((h) => h.id === hubId)?.name ??
    "In transit / off hub";

  return (
    <div className="min-w-0 max-w-full">
      <ul aria-label="Shared fleet vehicles" className="grid gap-3 md:hidden">
        {pageItems.map((v) => {
          const canFindRide = v.status === "available";
          return (
            <li
              key={vehicleLabel(s, v.id)}
              className="rounded-xl bg-surface-muted p-4"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <strong className="block text-sm font-semibold text-content wrap-anywhere">
                    {vehicleLabel(s, v.id)}
                  </strong>
                  <span className="mt-0.5 block text-xs text-content-muted">
                    {v.type} · {hubTitle(v.hub)}
                  </span>
                </div>
                <Badge>{v.status}</Badge>
              </div>
              <div className="mt-3 flex items-center justify-between gap-2">
                <div>
                  <Battery value={v.battery} />
                  {v.stale && (
                    <small className="mt-0.5 block text-xs text-content-muted">
                      Stale reading
                    </small>
                  )}
                </div>
                {s.role === "student" ? (
                  <Button
                    size="sm"
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
                    Find ride <Icon name="arrow" size={16} />
                  </Button>
                ) : (
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() => setSelected(v.id)}
                  >
                    Details <Icon name="chevron" size={16} />
                  </Button>
                )}
              </div>
            </li>
          );
        })}
      </ul>
      <div className="hidden md:block">
        <Table
          aria-label="Shared fleet vehicles"
          className="w-full border-collapse text-left text-sm"
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
                {s.role === "student" ? (
                  "Action"
                ) : (
                  <span className="sr-only">Details</span>
                )}
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
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label={`View details for ${vehicleLabel(s, v.id)}`}
                        onClick={() => setSelected(v.id)}
                      >
                        <Icon name="chevron" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
