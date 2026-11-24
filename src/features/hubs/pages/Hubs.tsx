import { config } from "@/config/app";
import { ApiLoadError } from "@/shared/api/ApiFeedback";
import { Icon } from "@/shared/components/Icon";
import { time } from "@/shared/lib/time";
import {
  LoadingState,
  Button,
  Empty,
  Input,
  Link,
  Select,
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui";
import { CampusMap } from "../components/CampusMap";
import { useHubs } from "../hooks/useHubs";
import "./hubs.css";

export function Hubs() {
  const {
    role,
    source,
    retry,
    search,
    setSearch,
    filter,
    setFilter,
    selected,
    setSelected,
    hubs,
  } = useHubs();
  const filtered = Boolean(search || filter !== "all");
  const clearFilters = () => {
    setSearch("");
    setFilter("all");
  };
  return (
    <section className="hub-directory" aria-labelledby="hub-directory-title">
      <header className="hub-directory-heading">
        <div>
          <h1 id="hub-directory-title">Campus hubs</h1>
          <p>
            Find shared vehicles, parking and charging around the{" "}
            {config.campus}.
          </p>
        </div>
        {source.status === "ready" && source.data.clock !== null && (
          <p className="hub-directory-updated">
            Updated {time(source.data.clock)}
          </p>
        )}
      </header>

      <div
        className="hub-directory-toolbar"
        role="group"
        aria-label="Hub filters"
      >
        <div data-slot="search-input" className="hub-directory-search">
          <Icon name="search" size={18} />
          <Input
            aria-label="Search hubs"
            placeholder="Search a hub…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
          />
        </div>
        <Select
          className="border-0 shadow-none"
          wrapperClassName="hub-directory-filter"
          aria-label="Filter hub resources"
          value={filter}
          onValueChange={(value) => setFilter(value)}
        >
          <option value="all">All resources</option>
          <option value="vehicles">Shared vehicles available</option>
          <option value="parking">Parking available</option>
          <option value="charging">Charging available</option>
        </Select>
      </div>

      {source.status === "loading" && <LoadingState label={"Loading hubs…"} />}
      {source.status === "error" && (
        <ApiLoadError message={source.message} retry={retry} />
      )}
      {source.status === "ready" && (
        <>
          <div className="hub-directory-results">
            <p role="status" aria-live="polite" aria-atomic="true">
              {hubs.length} {hubs.length === 1 ? "hub" : "hubs"}
              {filtered
                ? ` matching your filters · ${source.data.hubs.length} total`
                : " across campus"}
            </p>
            {filtered && hubs.length > 0 && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Clear filters
              </Button>
            )}
          </div>
          {hubs.length > 0 && (
            <CampusMap
              selected={selected}
              onSelect={setSelected}
              hubs={hubs}
              directory
            />
          )}
          {hubs.length > 0 && (
            <div
              className="hub-directory-table"
              role="region"
              aria-label="Compare hub resources"
              tabIndex={0}
            >
              <Table scrollable={false}>
                <TableCaption className="sr-only">
                  Hub resources. Occupancy is occupied spaces out of capacity;
                  charging is available points out of total.
                </TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead scope="col">Hub</TableHead>
                    <TableHead scope="col">Vehicles available</TableHead>
                    <TableHead scope="col">Occupied / capacity</TableHead>
                    <TableHead scope="col">Parking available</TableHead>
                    <TableHead scope="col">Charging points available</TableHead>
                    <TableHead scope="col">
                      <span className="sr-only">Details</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {hubs.map((h) => (
                    <TableRow key={h.id} data-selected={selected === h.id}>
                      <TableHead scope="row">
                        <Link to={`/${role}/hubs/${encodeURIComponent(h.id)}`}>
                          {h.name}
                        </Link>
                        <small>{h.area}</small>
                      </TableHead>
                      <TableCell>
                        <strong className="hub-directory-number">
                          {h.availableVehicles}
                        </strong>
                        <span className="sr-only"> vehicles available</span>
                      </TableCell>
                      <TableCell>
                        <strong className="hub-directory-number">
                          {h.occupied}
                        </strong>
                        <span className="hub-directory-total">
                          {" "}
                          / {h.capacity}
                        </span>
                        <span className="sr-only"> spaces occupied</span>
                      </TableCell>
                      <TableCell>
                        <strong className="hub-directory-number">
                          {h.parkingAvailable}
                        </strong>
                        <span className="sr-only"> spaces available now</span>
                      </TableCell>
                      <TableCell>
                        <strong className="hub-directory-number">
                          {h.availablePoints}
                        </strong>
                        <span className="hub-directory-total">
                          {" "}
                          / {h.points.length}
                        </span>
                        <span className="sr-only">
                          {" "}
                          charging points available
                        </span>
                      </TableCell>
                      <TableCell>
                        <Link
                          className="hub-directory-detail"
                          aria-label={`View ${h.name}`}
                          to={`/${role}/hubs/${encodeURIComponent(h.id)}`}
                        >
                          View hub <Icon name="arrow" size={16} />
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          {!hubs.length &&
            (source.data.hubs.length ? (
              <Empty
                title="No matching hubs"
                text="Try another hub name or clear the resource filter."
                action={
                  <Button variant="secondary" onClick={clearFilters}>
                    Clear filters
                  </Button>
                }
              />
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
        </>
      )}
    </section>
  );
}
