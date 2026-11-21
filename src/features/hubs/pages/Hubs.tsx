import { config } from "@/config/app";
import { ApiLoadError } from "@/shared/api/ApiFeedback";
import { Icon } from "@/shared/components/Icon";
import { time } from "@/shared/lib/time";
import { Button, Empty, Link, PageTitle } from "@/shared/ui";
import { CampusMap } from "../components/CampusMap";
import { useHubs } from "../hooks/useHubs";
export function Hubs() {
  const {
    role,
    source,
    retry,
    search,
    setSearch,
    view,
    setView,
    filter,
    setFilter,
    selected,
    setSelected,
    hubs,
  } = useHubs();
  return (
    <>
      <PageTitle
        title="Campus hubs"
        description={`Find shared vehicles, parking and charging around the ${config.campus}.`}
      />
      <div className="flex items-center gap-3 flex-wrap mb-5 max-[600px]:items-stretch max-[600px]:gap-2">
        <div
          data-slot="search-input"
          className="flex items-center bg-panel rounded-xs min-w-40 flex-1 gap-2 max-w-105 text-content-muted focus-within:outline-2 focus-within:outline-accent focus-within:outline-offset-2 [&_input:focus-visible]:outline-none max-[600px]:max-w-none max-[600px]:basis-full py-0 px-3"
        >
          <Icon name="search" />
          <input
            aria-label="Search hubs"
            placeholder="Search a hub…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border-0 border-solid border-control-border rounded-xs bg-transparent min-h-11 text-content text-sm max-w-full placeholder:text-content-muted hover:bg-soft w-full min-w-0 py-2 px-0"
          />
        </div>
        <select
          aria-label="Filter hub resources"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border border-solid border-control-border rounded-xs bg-panel min-h-11 text-content text-sm max-w-full hover:bg-soft cursor-pointer max-[600px]:max-w-full max-[600px]:flex-1 max-[600px]:min-w-0 py-2 px-3"
        >
          <option value="all">All resources</option>
          <option value="vehicles">Shared vehicles available</option>
          <option value="parking">Parking available</option>
          <option value="charging">Charging available</option>
        </select>
        <div className="flex bg-surface-inset rounded-xs gap-1 [&_button[aria-pressed='true']]:bg-panel [&_button[aria-pressed='true']]:shadow-control [&_button[aria-pressed='true']]:text-content [&_button:hover]:bg-panel/80 max-[600px]:max-w-full max-[600px]:overflow-x-auto p-1">
          {["map", "list"].map((v) => (
            <button
              key={v}
              aria-pressed={view === v}
              onClick={() => setView(v)}
              className="border-0 border-solid rounded-xs bg-transparent text-content-muted text-xs flex items-center gap-2 capitalize min-h-9 max-[600px]:flex-1 py-2 px-3 max-[600px]:p-2"
            >
              <Icon name={v === "map" ? "map" : "menu"} size={16} />
              {v}
            </button>
          ))}
        </div>
      </div>
      {source.status === "loading" && <p role="status">Loading hubs…</p>}
      {source.status === "error" && (
        <ApiLoadError message={source.message} retry={retry} />
      )}
      {source.status === "ready" && (
        <>
          {view === "map" && (
            <CampusMap selected={selected} onSelect={setSelected} hubs={hubs} />
          )}
          <div
            data-slot="panel"
            className="mt-5 bg-panel rounded-sm min-w-0 max-[600px]:mt-5 max-[600px]:rounded-xs p-5 max-[600px]:p-5"
          >
            <div className="overflow-x-auto max-w-full max-[600px]:my-0 max-[600px]:-mx-1">
              <table className="w-full border-collapse text-left text-sm max-[600px]:min-w-140">
                <caption className="text-left pt-0 pb-5 text-content-muted text-xs px-0">
                  Hub resources
                  {source.data.clock !== null &&
                    ` · Updated ${time(source.data.clock)}`}
                </caption>
                <thead>
                  <tr>
                    <th className="align-middle first:pl-0 last:pr-0 text-xs font-medium text-content-muted bg-surface-muted whitespace-nowrap [&_small]:block [&_small]:font-normal [&_small]:max-w-75 py-4 px-3">
                      Hub
                    </th>
                    <th className="align-middle first:pl-0 last:pr-0 text-xs font-medium text-content-muted bg-surface-muted whitespace-nowrap [&_small]:block [&_small]:font-normal [&_small]:max-w-75 py-4 px-3">
                      Shared vehicles
                    </th>
                    <th className="align-middle first:pl-0 last:pr-0 text-xs font-medium text-content-muted bg-surface-muted whitespace-nowrap [&_small]:block [&_small]:font-normal [&_small]:max-w-75 py-4 px-3">
                      Physical occupancy
                    </th>
                    <th className="align-middle first:pl-0 last:pr-0 text-xs font-medium text-content-muted bg-surface-muted whitespace-nowrap [&_small]:block [&_small]:font-normal [&_small]:max-w-75 py-4 px-3">
                      Parking available
                    </th>
                    <th className="align-middle first:pl-0 last:pr-0 text-xs font-medium text-content-muted bg-surface-muted whitespace-nowrap [&_small]:block [&_small]:font-normal [&_small]:max-w-75 py-4 px-3">
                      Charging points available
                    </th>
                    <th className="align-middle first:pl-0 last:pr-0 text-xs font-medium text-content-muted bg-surface-muted whitespace-nowrap [&_small]:block [&_small]:font-normal [&_small]:max-w-75 py-4 px-3">
                      Details
                    </th>
                  </tr>
                </thead>
                <tbody className="[&_tr:hover]:bg-surface-muted">
                  {hubs.map((h) => (
                    <tr
                      key={h.id}
                      data-selected={selected === h.id}
                      className="data-[selected=true]:bg-soft!"
                    >
                      <th
                        scope="row"
                        className="border-b border-solid border-b-divider align-middle first:pl-0 last:pr-0 font-medium whitespace-nowrap py-4 px-3"
                      >
                        <Link to={`/${role}/hubs/${encodeURIComponent(h.id)}`}>
                          {h.name}
                        </Link>
                        <small className="leading-[1.6] block font-normal max-w-75">
                          {h.area}
                        </small>
                      </th>
                      <td className="border-b border-solid border-b-divider align-middle first:pl-0 last:pr-0 [&_small]:block [&_small]:font-normal [&_small]:max-w-75 py-4 px-3">
                        {h.availableVehicles} available
                      </td>
                      <td className="border-b border-solid border-b-divider align-middle first:pl-0 last:pr-0 [&_small]:block [&_small]:font-normal [&_small]:max-w-75 py-4 px-3">
                        {h.occupied} / {h.capacity}
                      </td>
                      <td className="border-b border-solid border-b-divider align-middle first:pl-0 last:pr-0 [&_small]:block [&_small]:font-normal [&_small]:max-w-75 py-4 px-3">
                        {h.parkingAvailable} now
                      </td>
                      <td className="border-b border-solid border-b-divider align-middle first:pl-0 last:pr-0 [&_small]:block [&_small]:font-normal [&_small]:max-w-75 py-4 px-3">
                        {h.availablePoints} / {h.points.length}
                      </td>
                      <td className="border-b border-solid border-b-divider align-middle first:pl-0 last:pr-0 [&_small]:block [&_small]:font-normal [&_small]:max-w-75 py-4 px-3">
                        <Link
                          data-slot="text-link"
                          className="leading-[16px] text-accent inline-flex items-center gap-2 text-xs font-semibold hover:underline"
                          to={`/${role}/hubs/${encodeURIComponent(h.id)}`}
                        >
                          View hub <Icon name="arrow" size={16} />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {!hubs.length &&
              (source.data.hubs.length ? (
                <Empty />
              ) : (
                <Empty
                  title="No campus hubs yet"
                  text="There are no hubs to display."
                  action={
                    <Button variant="secondary" onClick={retry}>
                      Refresh
                    </Button>
                  }
                />
              ))}
          </div>
        </>
      )}
    </>
  );
}
