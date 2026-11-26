import { vehicleLabel } from "@/integration/recordLabels";
import { VehicleArtwork } from "@/shared/components/MobilityArtwork";
import {
  Input,
  Select,
  Badge,
  Battery,
  Button,
  Empty,
  Link,
  Modal,
} from "@/shared/ui";
import { Icon } from "@/shared/components/Icon";
import { time } from "@/shared/lib/time";

import {
  useVehicleTable,
  type LiveVehicleTable,
} from "../hooks/useVehicleTable";
import { FleetTable } from "./FleetTable";
type VehicleTableProps = {
  hub?: string;
  live?: LiveVehicleTable;
};
export function VehicleTable({ hub, live }: VehicleTableProps) {
  const {
    s,
    go,
    search,
    setSearch,
    status,
    setStatus,
    setPage,
    sort,
    setSort,
    setSelected,
    list,
    pages,
    current,
    v,
  } = useVehicleTable({ hub, live });
  return (
    <>
      <div className="filter-bar">
        <div data-slot="search-input" className="filter-search">
          <Icon name="search" />
          <Input
            aria-label="Search shared vehicles"
            placeholder="Search vehicle ID or type…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
          />
        </div>
        <Select
          aria-label="Vehicle status"
          value={status}
          onValueChange={(value) => {
            setStatus(value);
            setPage(1);
          }}
          wrapperClassName="max-w-full cursor-pointer max-[600px]:max-w-full max-[600px]:flex-1 max-[600px]:min-w-0"
        >
          <option value="all">All statuses</option>
          {[
            "available",
            "held",
            "charging",
            "maintenance",
            "in-transit",
            "committed",
            "riding",
          ].map((x) => (
            <option key={x}>{x}</option>
          ))}
        </Select>
        <Select
          aria-label="Sort vehicles"
          value={sort}
          onValueChange={(value) => setSort(value)}
          wrapperClassName="max-w-full cursor-pointer max-[600px]:max-w-full max-[600px]:flex-1 max-[600px]:min-w-0"
        >
          <option value="id">Vehicle ID</option>
          <option value="battery">Battery: highest first</option>
        </Select>
      </div>
      <FleetTable
        list={list}
        current={current}
        s={s}
        go={go}
        liveHubName={live?.hubName}
        setSelected={setSelected}
      />
      {!list.length && (
        <Empty
          action={
            search || status !== "all" ? (
              <Button
                variant="secondary"
                onClick={() => {
                  setSearch("");
                  setStatus("all");
                  setPage(1);
                }}
              >
                Clear filters
              </Button>
            ) : undefined
          }
        />
      )}
      <nav
        aria-label="Shared fleet pagination"
        className="flex flex-wrap items-center justify-end gap-2 pt-5"
      >
        <small className="mr-auto leading-[1.6]">
          {list.length} shared vehicles · Page {current} of {pages}
        </small>
        <Button
          type="button"
          variant="secondary"
          size="icon"
          aria-label="Previous page"
          disabled={current <= 1}
          onClick={() => setPage(current - 1)}
        >
          <Icon name="chevron-left" />
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="icon"
          aria-label="Next page"
          disabled={current >= pages}
          onClick={() => setPage(current + 1)}
        >
          <Icon name="chevron" />
        </Button>
      </nav>
      <Modal
        title={v ? vehicleLabel(s, v.id) : "Vehicle"}
        description="Shared fleet vehicle details"
        drawer
        open={!!v}
        onOpenChange={(open) => !open && setSelected("")}
      >
        {v && (
          <>
            <div className="h-50 rounded-lg bg-soft grid place-items-center text-primary mb-5 max-[600px]:h-42.5">
              <VehicleArtwork type={v.type} />
            </div>
            <dl className="record-details">
              <dt className="text-content-muted">Type</dt>
              <dd className="wrap-anywhere m-0">{v.type}</dd>
              <dt className="text-content-muted">Battery</dt>
              <dd className="wrap-anywhere m-0">
                <Battery value={v.battery} />
              </dd>
              <dt className="text-content-muted">Status</dt>
              <dd className="wrap-anywhere m-0">
                <Badge>{v.status}</Badge>
              </dd>
              <dt className="text-content-muted">Location</dt>
              <dd className="wrap-anywhere m-0">
                {live?.hubName ??
                  s.hubs.find((h) => h.id === v.hub)?.name ??
                  "Off hub"}
              </dd>
              <dt className="text-content-muted">Freshness</dt>
              <dd className="wrap-anywhere m-0">
                {v.observedClock == null
                  ? "Reading time unavailable"
                  : `Observed ${time(v.observedClock)}`}
              </dd>
            </dl>
            <Link
              data-slot="text-link"
              className="leading-[16px] text-primary inline-flex items-center gap-2 text-sm font-semibold hover:underline"
              to="/operator/incidents"
            >
              Review or record an incident <Icon name="arrow" size={16} />
            </Link>
          </>
        )}
      </Modal>
    </>
  );
}
