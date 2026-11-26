import { vehicleLabel } from "@/integration/recordLabels";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
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
        action={
          <Button onClick={() => setOpen(true)}>
            <Icon name="plus" />
            New dispatch
          </Button>
        }
      />
      {s.dispatches.length ? (
        <Table
          aria-label="Vehicle dispatches"
          className="w-full border-collapse text-left text-sm min-w-112"
        >
          <TableHeader>
            <TableRow>
              <TableHead>Vehicles</TableHead>
              <TableHead>Source → destination</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-px">
                <span className="sr-only">Details</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {s.dispatches.map((d) => {
              const vehicleNames = d.vehicles
                .map((id) => vehicleLabel(s, id))
                .join(", ");
              return (
                <TableRow key={d.id}>
                  <TableHead scope="row" className="border-b border-divider">
                    {vehicleNames}
                  </TableHead>
                  <TableCell className="border-b border-divider">
                    {s.hubs.find((h) => h.id === d.source)?.name} →{" "}
                    {s.hubs.find((h) => h.id === d.destination)?.name}
                  </TableCell>
                  <TableCell className="border-b border-divider">
                    <Badge>{d.status}</Badge>
                  </TableCell>
                  <TableCell className="border-b border-divider">
                    <Button asChild variant="ghost" size="icon">
                      <Link
                        aria-label={`View dispatch for ${vehicleNames}`}
                        to={`/operator/dispatch/${encodeURIComponent(d.id)}`}
                      >
                        <Icon name="chevron" />
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      ) : (
        <Empty
          title="No dispatches planned"
          text="New dispatches will appear here."
        />
      )}
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
