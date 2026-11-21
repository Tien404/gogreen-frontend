import { OperatorScreenData } from "@/integration/OperatorScreenData";
import { Missing } from "@/app/pages/Missing";
import { Icon } from "@/shared/components/Icon";
import { Alert, Badge, Button, Empty, Link, PageTitle } from "@/shared/ui";
import { CreateDispatchDialog } from "../components/CreateDispatchDialog";
import { DispatchDetails } from "../components/DispatchDetails";
import { useDispatches } from "../hooks/useDispatches";
type DispatchesProps = {
  id?: string;
};
export function Dispatches(props: DispatchesProps) {
  return (
    <OperatorScreenData dispatchId={props.id}>
      <DispatchesView {...props} />
    </OperatorScreenData>
  );
}
function DispatchesView({ id }: DispatchesProps) {
  const {
    s,
    busy,
    valid,
    candidates,
    hubs,
    open,
    setOpen,
    source,
    setSource,
    destination,
    setDestination,
    vehicles,
    setVehicles,
    error,
    review,
    setReview,
    d,
    action,
    submitDispatch,
  } = useDispatches({ id });
  if (id && !d) return <Missing />;
  if (d)
    return (
      <>
        <Link
          className="inline-flex items-center gap-2 text-xs text-content-muted mb-5"
          to="/operator/dispatch"
        >
          <Icon name="arrow-left" size={16} /> All dispatches
        </Link>
        <PageTitle
          title={`Dispatch ${encodeURIComponent(d.id)}`}
          description={`${s.hubs.find((h) => h.id === d.source)?.name} → ${s.hubs.find((h) => h.id === d.destination)?.name}`}
          action={<Badge>{d.status}</Badge>}
        />
        <DispatchDetails
          d={d}
          s={s}
          error={error}
          action={action}
          busy={busy}
        />
      </>
    );
  return (
    <>
      <PageTitle
        title="Vehicle dispatch"
        description="Balance the shared fleet between hubs, one reviewed movement at a time."
        action={
          <Button onClick={() => setOpen(true)}>
            <Icon name="plus" />
            Create dispatch
          </Button>
        }
      />
      <Alert>
        Only shared vehicles can be dispatched. Planned vehicles remain at the
        source until departure.
      </Alert>
      <div
        data-slot="panel"
        className="bg-panel rounded-sm min-w-0 max-[600px]:rounded-xs p-5 max-[600px]:p-5"
      >
        <div className="overflow-x-auto max-w-full max-[600px]:my-0 max-[600px]:-mx-1">
          <table className="w-full border-collapse text-left text-sm max-[600px]:min-w-140">
            <thead>
              <tr>
                <th className="align-middle first:pl-0 last:pr-0 text-xs font-medium text-content-muted bg-surface-muted whitespace-nowrap [&_small]:block [&_small]:font-normal [&_small]:max-w-75 py-4 px-3">
                  Dispatch
                </th>
                <th className="align-middle first:pl-0 last:pr-0 text-xs font-medium text-content-muted bg-surface-muted whitespace-nowrap [&_small]:block [&_small]:font-normal [&_small]:max-w-75 py-4 px-3">
                  Source → destination
                </th>
                <th className="align-middle first:pl-0 last:pr-0 text-xs font-medium text-content-muted bg-surface-muted whitespace-nowrap [&_small]:block [&_small]:font-normal [&_small]:max-w-75 py-4 px-3">
                  Vehicles
                </th>
                <th className="align-middle first:pl-0 last:pr-0 text-xs font-medium text-content-muted bg-surface-muted whitespace-nowrap [&_small]:block [&_small]:font-normal [&_small]:max-w-75 py-4 px-3">
                  Status
                </th>
                <th className="align-middle first:pl-0 last:pr-0 text-xs font-medium text-content-muted bg-surface-muted whitespace-nowrap [&_small]:block [&_small]:font-normal [&_small]:max-w-75 py-4 px-3">
                  Details
                </th>
              </tr>
            </thead>
            <tbody className="[&_tr:hover]:bg-surface-muted">
              {s.dispatches.map((d) => (
                <tr key={d.id}>
                  <th
                    scope="row"
                    className="border-b border-solid border-b-divider align-middle first:pl-0 last:pr-0 font-medium whitespace-nowrap [&_small]:block [&_small]:font-normal [&_small]:max-w-75 py-4 px-3"
                  >
                    {d.id}
                  </th>
                  <td className="border-b border-solid border-b-divider align-middle first:pl-0 last:pr-0 [&_small]:block [&_small]:font-normal [&_small]:max-w-75 py-4 px-3">
                    {s.hubs.find((h) => h.id === d.source)?.name} →{" "}
                    {s.hubs.find((h) => h.id === d.destination)?.name}
                  </td>
                  <td className="border-b border-solid border-b-divider align-middle first:pl-0 last:pr-0 [&_small]:block [&_small]:font-normal [&_small]:max-w-75 py-4 px-3">
                    {d.vehicles.join(", ")}
                  </td>
                  <td className="border-b border-solid border-b-divider align-middle first:pl-0 last:pr-0 [&_small]:block [&_small]:font-normal [&_small]:max-w-75 py-4 px-3">
                    <Badge>{d.status}</Badge>
                  </td>
                  <td className="border-b border-solid border-b-divider align-middle first:pl-0 last:pr-0 [&_small]:block [&_small]:font-normal [&_small]:max-w-75 py-4 px-3">
                    <Link
                      data-slot="text-link"
                      className="leading-[16px] text-accent inline-flex items-center gap-2 text-xs font-semibold hover:underline"
                      to={`/operator/dispatch/${encodeURIComponent(d.id)}`}
                    >
                      View dispatch <Icon name="arrow" size={16} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!s.dispatches.length && (
          <Empty
            title="No dispatches planned"
            text="Select a source, destination and eligible vehicles to create a movement."
            action={
              <Button onClick={() => setOpen(true)}>
                Create your first dispatch
              </Button>
            }
          />
        )}
      </div>
      <CreateDispatchDialog
        s={s}
        open={open}
        setOpen={setOpen}
        submitDispatch={submitDispatch}
        source={source}
        setSource={setSource}
        setVehicles={setVehicles}
        setReview={setReview}
        destination={destination}
        setDestination={setDestination}
        vehicles={vehicles}
        review={review}
        error={error}
        busy={busy}
        valid={valid}
        candidates={candidates}
        hubs={hubs}
      />
    </>
  );
}
