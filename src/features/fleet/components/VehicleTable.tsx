import { Icon } from "@/shared/components/Icon";
import { time } from "@/shared/lib/time";
import { Badge, Battery, Button, Empty, Link, Modal } from "@/shared/ui";
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
      <div className="flex items-center gap-3 flex-wrap mb-5 max-[600px]:items-stretch max-[600px]:gap-2">
        <div
          data-slot="search-input"
          className="flex items-center bg-panel rounded-xs min-w-40 flex-1 gap-2 max-w-105 text-content-muted focus-within:outline-2 focus-within:outline-accent focus-within:outline-offset-2 [&_input:focus-visible]:outline-none max-[600px]:max-w-none max-[600px]:basis-full py-0 px-3"
        >
          <Icon name="search" />
          <input
            aria-label="Search shared vehicles"
            placeholder="Search vehicle ID or type…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="border-0 border-solid border-control-border rounded-xs bg-transparent min-h-11 text-content text-sm max-w-full placeholder:text-content-muted hover:bg-soft w-full min-w-0 py-2 px-0"
          />
        </div>
        <select
          aria-label="Vehicle status"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className="border border-solid border-control-border rounded-xs bg-panel min-h-11 text-content text-sm max-w-full hover:bg-soft cursor-pointer max-[600px]:max-w-full max-[600px]:flex-1 max-[600px]:min-w-0 py-2 px-3"
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
        </select>
        <select
          aria-label="Sort vehicles"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="border border-solid border-control-border rounded-xs bg-panel min-h-11 text-content text-sm max-w-full hover:bg-soft cursor-pointer max-[600px]:max-w-full max-[600px]:flex-1 max-[600px]:min-w-0 py-2 px-3"
        >
          <option value="id">Vehicle ID</option>
          <option value="battery">Battery: highest first</option>
        </select>
      </div>
      <FleetTable
        list={list}
        current={current}
        s={s}
        go={go}
        liveHubName={live?.hubName}
        setSelected={setSelected}
      />
      {!list.length && <Empty />}
      <div className="flex justify-end items-center gap-2 pt-5 **:data-[slot~=button]:text-xs **:data-[slot~=button]:min-h-9 max-[600px]:flex-wrap max-[600px]:*:data-[slot~=button]:flex-1 **:data-[slot~=button]:py-1 **:data-[slot~=button]:px-3">
        <small className="leading-[1.6] mr-auto max-[600px]:w-full">
          {list.length} shared vehicles · Page {current} of {pages}
        </small>
        <Button
          variant="secondary"
          disabled={current <= 1}
          onClick={() => setPage(current - 1)}
        >
          Previous
        </Button>
        <Button
          variant="secondary"
          disabled={current >= pages}
          onClick={() => setPage(current + 1)}
        >
          Next
        </Button>
      </div>
      <Modal
        title={v?.id ?? "Vehicle"}
        description="Shared fleet vehicle details"
        drawer
        open={!!v}
        onOpenChange={(open) => !open && setSelected("")}
      >
        {v && (
          <>
            <div className="h-50 rounded-xs bg-soft grid place-items-center text-accent mb-5 max-[600px]:h-42.5">
              <Icon name="bike" size={64} />
            </div>
            <dl className="grid grid-cols-[minmax(100px,0.8fr)_1.2fr] gap-4 text-sm **:data-[slot~=badge]:align-top my-5 mx-0">
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
              className="leading-[16px] text-accent inline-flex items-center gap-2 text-xs font-semibold hover:underline"
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
