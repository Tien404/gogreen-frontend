import {
  Panel,
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  Alert,
  Badge,
  Button,
  Empty,
  Link,
  PageTitle,
} from "@/shared/ui";
import { OperatorScreenData } from "@/integration/OperatorScreenData";
import { Missing } from "@/app/pages/Missing";
import { Icon } from "@/shared/components/Icon";

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
          className="inline-flex items-center gap-2 text-sm text-content-muted mb-5"
          to="/operator/dispatch"
        >
          <Icon name="arrow-left" size={16} /> All dispatches
        </Link>
        <PageTitle
          title="Vehicle dispatch"
          description={`${d.id} · ${s.hubs.find((h) => h.id === d.source)?.name} → ${s.hubs.find((h) => h.id === d.destination)?.name}`}
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
      <Panel data-slot="panel" className="min-w-0">
        <div className="min-w-0 max-w-full">
          <Table
            aria-label="Vehicle dispatches"
            className="w-full border-collapse text-left text-sm max-[600px]:min-w-190"
          >
            <TableHeader>
              <TableRow>
                <TableHead className="[&_small]:block [&_small]:font-normal [&_small]:max-w-75">
                  Dispatch
                </TableHead>
                <TableHead className="[&_small]:block [&_small]:font-normal [&_small]:max-w-75">
                  Source → destination
                </TableHead>
                <TableHead className="[&_small]:block [&_small]:font-normal [&_small]:max-w-75">
                  Vehicles
                </TableHead>
                <TableHead className="[&_small]:block [&_small]:font-normal [&_small]:max-w-75">
                  Status
                </TableHead>
                <TableHead className="[&_small]:block [&_small]:font-normal [&_small]:max-w-75">
                  Details
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="[&_tr:hover]:bg-surface-muted">
              {s.dispatches.map((d) => (
                <TableRow key={d.id}>
                  <TableHead
                    scope="row"
                    className="border-b border-solid border-b-divider  [&_small]:block [&_small]:font-normal [&_small]:max-w-75"
                  >
                    {d.id}
                  </TableHead>
                  <TableCell className="border-b border-solid border-b-divider  [&_small]:block [&_small]:font-normal [&_small]:max-w-75">
                    {s.hubs.find((h) => h.id === d.source)?.name} →{" "}
                    {s.hubs.find((h) => h.id === d.destination)?.name}
                  </TableCell>
                  <TableCell className="border-b border-solid border-b-divider  [&_small]:block [&_small]:font-normal [&_small]:max-w-75">
                    {d.vehicles.join(", ")}
                  </TableCell>
                  <TableCell className="border-b border-solid border-b-divider  [&_small]:block [&_small]:font-normal [&_small]:max-w-75">
                    <Badge>{d.status}</Badge>
                  </TableCell>
                  <TableCell className="border-b border-solid border-b-divider  [&_small]:block [&_small]:font-normal [&_small]:max-w-75">
                    <Link
                      data-slot="text-link"
                      className="leading-[16px] text-primary inline-flex items-center gap-2 text-sm font-semibold hover:underline"
                      to={`/operator/dispatch/${encodeURIComponent(d.id)}`}
                    >
                      View dispatch <Icon name="arrow" size={16} />
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
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
      </Panel>
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
