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
import { StudentData } from "@/integration/StudentScreenData";
import { Missing } from "@/app/pages/Missing";
import { Icon } from "@/shared/components/Icon";

import { ChargeForm } from "../components/ChargeForm";
import { ChargingSessionDetails } from "../components/ChargingSessionDetails";
import { useCharging } from "../hooks/useCharging";
type ChargingProps = {
  id?: string;
  newRequest?: boolean;
};
export function Charging(props: ChargingProps) {
  return (
    <StudentData
      screen={
        props.newRequest ? "newCharging" : props.id ? "charge" : "charging"
      }
      id={props.id}
    >
      <OperatorScreenData chargeId={props.id}>
        <ChargingView {...props} />
      </OperatorScreenData>
    </StudentData>
  );
}
function ChargingView({ id, newRequest = false }: ChargingProps) {
  const { s, go, tab, setTab, operator, charges, c, canAct } = useCharging(id);
  const visible = charges.filter(
    (session) =>
      tab === "all" ||
      (tab === "queue"
        ? session.status === "pending"
        : tab === "schedule"
          ? ["scheduled", "active"].includes(session.status)
          : !["pending", "scheduled", "active"].includes(session.status)),
  );
  if (newRequest)
    return (
      <>
        <PageTitle
          title="Request charging"
          description="Choose your vehicle, parking context and target charge."
        />
        <Panel data-slot="panel" className="min-w-0 max-w-162.5">
          <ChargeForm />
        </Panel>
      </>
    );
  if (id) {
    if (!c) return <Missing />;
    return (
      <>
        <Link
          className="inline-flex items-center gap-2 text-sm text-content-muted mb-5"
          to={`/${s.role}/charging`}
        >
          <Icon name="arrow-left" size={16} /> Charging
        </Link>
        <PageTitle
          title="Charging session"
          description={`${c.id} · ${c.vehicle} · ${s.hubs.find((h) => h.id === c.hub)?.name}`}
          action={<Badge>{c.status}</Badge>}
        />
        <ChargingSessionDetails s={s} c={c} canAct={canAct} />
      </>
    );
  }
  return (
    <>
      <PageTitle
        title="Charging"
        description={
          operator
            ? "Review the charging queue, allocations and campus requests."
            : "Your requests and sessions. Keep track of your next charge."
        }
        action={
          operator ? undefined : (
            <Button onClick={() => go("/student/charging/new")}>
              <Icon name="plus" />
              New request
            </Button>
          )
        }
      />
      <div className="flex items-center gap-3 flex-wrap mb-5 max-[600px]:items-stretch max-[600px]:gap-2 max-[600px]:*:data-[slot~=search-input]:max-w-none max-[600px]:*:data-[slot~=search-input]:basis-full max-[600px]:[&_>_select]:max-w-full max-[600px]:[&_>_select]:flex-1 max-[600px]:[&_>_select]:min-w-0">
        <div
          className="segmented-control"
          role="group"
          aria-label="Charging status filter"
        >
          {["all", "queue", "schedule", "finished"].map((t) => (
            <button
              key={t}
              aria-pressed={tab === t}
              onClick={() => setTab(t)}
              className="border-0 border-solid rounded-lg bg-transparent text-content-muted text-sm flex items-center gap-2 capitalize min-h-9 max-[600px]:flex-1 py-2 px-3 max-[600px]:p-2"
            >
              {t}
            </button>
          ))}
        </div>
      </div>
      <Alert>
        {
          "Charging priority uses need-by time, lower battery, then request order."
        }{" "}
        Active sessions are not interrupted for a new request.
      </Alert>
      <Panel data-slot="panel" className="min-w-0">
        <div className="min-w-0 max-w-full">
          <Table
            aria-label="Charging requests and allocations"
            className="w-full border-collapse text-left text-sm max-[600px]:min-w-190"
          >
            <TableHeader>
              <TableRow>
                <TableHead className="[&_small]:block [&_small]:font-normal [&_small]:max-w-75">
                  Request / vehicle
                </TableHead>
                <TableHead className="[&_small]:block [&_small]:font-normal [&_small]:max-w-75">
                  Hub
                </TableHead>
                <TableHead className="[&_small]:block [&_small]:font-normal [&_small]:max-w-75">
                  Battery / target
                </TableHead>
                <TableHead className="[&_small]:block [&_small]:font-normal [&_small]:max-w-75">
                  Status
                </TableHead>
                <TableHead className="[&_small]:block [&_small]:font-normal [&_small]:max-w-75">
                  Allocation
                </TableHead>
                <TableHead className="[&_small]:block [&_small]:font-normal [&_small]:max-w-75">
                  Action
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="[&_tr:hover]:bg-surface-muted">
              {visible.map((c) => (
                <TableRow key={c.id}>
                  <TableHead
                    scope="row"
                    className="border-b border-solid border-b-divider "
                  >
                    {c.id}
                    <small className="leading-[1.6] block font-normal max-w-75">
                      {c.vehicle} ·{" "}
                      {c.owner === "operator" ? "Shared" : "Private"}
                    </small>
                  </TableHead>
                  <TableCell className="border-b border-solid border-b-divider  [&_small]:block [&_small]:font-normal [&_small]:max-w-75">
                    {s.hubs.find((h) => h.id === c.hub)?.name}
                  </TableCell>
                  <TableCell className="border-b border-solid border-b-divider  [&_small]:block [&_small]:font-normal [&_small]:max-w-75">
                    {c.battery === null ? "—" : `${c.battery}%`} / {c.target}%
                  </TableCell>
                  <TableCell className="border-b border-solid border-b-divider  [&_small]:block [&_small]:font-normal [&_small]:max-w-75">
                    <Badge>{c.status}</Badge>
                  </TableCell>
                  <TableCell className="border-b border-solid border-b-divider ">
                    {c.point ?? "Awaiting point"}
                    <small className="leading-[1.6] block font-normal max-w-75">
                      {c.schedule && (
                        <span className="block">{c.schedule}</span>
                      )}
                      <span className="wrap-anywhere">{c.reason}</span>
                    </small>
                  </TableCell>
                  <TableCell className="border-b border-solid border-b-divider  [&_small]:block [&_small]:font-normal [&_small]:max-w-75">
                    <Link
                      data-slot="text-link"
                      className="leading-[16px] text-primary inline-flex items-center gap-2 text-sm font-semibold hover:underline"
                      to={`/${s.role}/charging/${encodeURIComponent(c.id)}`}
                    >
                      View session <Icon name="arrow" size={16} />
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {!visible.length && (
          <Empty
            title="No charging requests"
            text="New requests will appear here."
          />
        )}
      </Panel>
    </>
  );
}
