import { useApp } from "@/app/providers/AppContext";
import { config } from "@/config/app";
import { ApiError } from "@/shared/api/errors";
import { mapHub, mapVehicle, type ApiHub } from "@/integration/apiMappers";
import { useApiQuery } from "@/shared/api/useApiQuery";
import { Alert, Badge, Button, Empty, Link, PageTitle, SectionHead } from "@/shared/ui";
import { useCallback, type ReactNode } from "react";
import { useParams } from "react-router";

const updatedAt = new Intl.DateTimeFormat("en-GB", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: config.timezone,
});

function HubFeedback({ message, retry }: { message: string; retry: () => void }) {
  return (
    <>
      <Alert tone="error">{message}</Alert>
      <Button onClick={retry}>Retry loading</Button>
    </>
  );
}

export function ApiHubs() {
  const { api, auth, path } = useApp();
  const load = useCallback(async (signal: AbortSignal) => {
    const rows = await api!.request("GET /mobility/hubs", { signal });
    if (!Array.isArray(rows)) throw new ApiError(502, "INVALID_RESPONSE", "Expected a list of hubs.", true);
    return rows.map(mapHub);
  }, [api]);
  const { result, retry } = useApiQuery(load);
  const role = auth.user!.role;
  const overview = path === `/${role}` || path === `/${role}/`;

  return (
    <>
      <PageTitle
        title={overview ? `Welcome, ${auth.user!.name}` : "Campus hubs"}
        description={`View parking and charging availability around the ${config.campus}.`}
      />
      {result.status === "loading" && <p role="status">Loading hubs…</p>}
      {result.status === "error" && <HubFeedback message={result.message} retry={retry} />}
      {result.status === "ready" && (result.data.length === 0 ? (
        <Empty title="No campus hubs yet" text="There are no hubs to display." action={<Button onClick={retry}>Refresh</Button>} />
      ) : (
        <div className="grid grid-cols-2 gap-4 max-[700px]:grid-cols-1" aria-label="Campus hubs">
          {result.data.map((hub) => (
            <section key={hub.id} data-slot="panel" className="min-w-0 rounded-sm bg-panel p-5">
              <SectionHead title={hub.name} subtitle={hub.type ?? "Campus hub"} />
              <HubCounts hub={hub} />
              <Link to={`/${role}/hubs/${encodeURIComponent(hub.id)}`}>View hub</Link>
            </section>
          ))}
        </div>
      ))}
    </>
  );
}

export function ApiHubRecord() {
  const { hubId } = useParams();
  const { api, auth } = useApp();
  const load = useCallback(async (signal: AbortSignal) =>
    mapHub(await api!.request("GET /mobility/hubs/{hub_id}", { params: { hub_id: hubId! }, signal })), [api, hubId]);
  const { result, retry } = useApiQuery(load);
  const back = <Link to={`/${auth.user!.role}/hubs`}>All hubs</Link>;

  if (result.status === "loading") return <p role="status">Loading hub…</p>;
  if (result.status === "error") {
    if (result.code === 404) return <Empty title="Hub not found" text="This address does not match a campus hub." action={back} />;
    return <HubFeedback message={result.message} retry={retry} />;
  }
  const hub = result.data;
  return (
    <>
      <div className="mb-5">{back}</div>
      <PageTitle
        title={hub.name}
        description={`Updated ${updatedAt.format(hub.updatedAt)}`}
        action={auth.user?.role === "student" && <Link to={`/student/find-ride?${new URLSearchParams({ origin: hub.id })}`}>Find a ride from this hub</Link>}
      />
      <section data-slot="panel" className="rounded-sm bg-panel p-5">
        <SectionHead title="Hub resources" />
        <HubCounts hub={hub} />
      </section>
      {auth.user?.role === "student" && <HubVehicles hubId={hub.id} />}
      <section data-slot="panel" className="mt-5 rounded-sm bg-panel p-5">
        <SectionHead title="Charging points" />
        {hub.points.length ? (
          <ul className="divide-y divide-divider">
            {hub.points.map((point) => (
              <li key={point.id} className="flex items-center justify-between gap-3 py-3">
                <span>{point.id}</span>
                <Badge>{point.status === "in-use" ? "In use" : point.status === "available" ? "Available" : "Unavailable"}</Badge>
              </li>
            ))}
          </ul>
        ) : <Empty title="No charging points" text="This hub has no charging points." />}
      </section>
    </>
  );
}

function HubVehicles({ hubId }: { hubId: string }) {
  const { api } = useApp();
  const load = useCallback(async (signal: AbortSignal) => (
    await api!.request("GET /mobility/vehicles", { query: { hub_id: hubId }, signal })
  ).map(mapVehicle), [api, hubId]);
  const { result, retry } = useApiQuery(load);
  return (
    <section data-slot="panel" className="mt-5 rounded-sm bg-panel p-5">
      <SectionHead title="Shared vehicles available here" />
      {result.status === "loading" && <p role="status">Loading vehicles…</p>}
      {result.status === "error" && <HubFeedback message={result.message} retry={retry} />}
      {result.status === "ready" && (result.data.length ? (
        <ul className="divide-y divide-divider">
          {result.data.map((vehicle) => <li key={vehicle.id} className="flex flex-wrap justify-between gap-2 py-3">
            <span>{vehicle.id} · {vehicle.type ?? "Shared vehicle"}</span>
            <span>{vehicle.battery == null ? "Battery unknown" : `${vehicle.battery}% battery`}</span>
          </li>)}
        </ul>
      ) : <Empty title="No available vehicles" text="Try another nearby hub." />)}
    </section>
  );
}

function HubCounts({ hub }: { hub: ApiHub }) {
  const availablePoints = hub.points.filter((point) => point.status === "available").length;
  const rows: [string, ReactNode][] = [
    ["Physical occupancy", `${hub.capacity - hub.physicalFree} / ${hub.capacity}`],
    ["Bookable spaces", hub.bookable],
    ["Charging points available", `${availablePoints} / ${hub.points.length}`],
  ];
  return (
    <dl className="my-4 space-y-2 text-sm">
      {rows.map(([label, value]) => (
        <div key={label} className="flex justify-between gap-3">
          <dt className="text-content-muted">{label}</dt>
          <dd className="font-semibold">{value}</dd>
        </div>
      ))}
    </dl>
  );
}
