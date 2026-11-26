import { StudentActivityCard } from "@/features/student-mobility/StudentActivityCard";
import { StudentJourney } from "@/features/student-mobility/StudentJourney";
import { StudentRecordLink } from "@/features/student-mobility/StudentRecordLink";
import { currentStudentActivities } from "@/features/student-mobility/studentActivities";
import { recordUrl } from "@/integration/studentRecords";
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
  const activeStudentCard = !operator
    ? currentStudentActivities(s).find((item) => item.kind === "charging")
    : undefined;
  const visible = charges.filter(
    (session) =>
      tab === "all" ||
      (tab === "queue"
        ? session.status === "pending"
        : tab === "schedule"
          ? ["scheduled", "active"].includes(session.status)
          : !["pending", "scheduled", "active"].includes(session.status)),
  );
  if (newRequest) return <ChargeForm />;
  if (id) {
    if (!c) return <Missing />;
    const detail = (
      <>
        <Link
          className="inline-flex items-center gap-2 text-sm text-content-muted mb-5"
          to={`/${s.role}/charging`}
        >
          <Icon name="arrow-left" size={16} /> Charging
        </Link>
        <PageTitle
          title={
            operator
              ? "Charging session"
              : c.status === "active"
                ? "Charging in progress"
                : c.status === "scheduled"
                  ? "Charging scheduled"
                  : c.status === "pending"
                    ? "Charging requested"
                    : "Charging " + c.status
          }
          action={operator ? <Badge>{c.status}</Badge> : undefined}
        />
        <ChargingSessionDetails s={s} c={c} canAct={canAct} />
      </>
    );
    return operator ? (
      detail
    ) : (
      <StudentJourney
        hub={c.hub}
        active={["pending", "scheduled", "active"].includes(c.status)}
      >
        {detail}
      </StudentJourney>
    );
  }
  const list = (
    <>
      <PageTitle
        title="Charging"
        action={
          operator ? undefined : (
            <Button size="sm" onClick={() => go("/student/charging/new")}>
              <Icon name="plus" size={16} />
              New request
            </Button>
          )
        }
      />
      {activeStudentCard && (
        <div className="mb-5">
          <StudentActivityCard activity={activeStudentCard} headingLevel={2} />
        </div>
      )}
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
              className="capitalize"
            >
              {t}
            </button>
          ))}
        </div>
      </div>
      {!operator && visible.length > 0 ? (
        <ul aria-label="Your charging requests" className="grid gap-3">
          {visible.map((charge) => (
            <StudentRecordLink
              key={charge.id}
              to={recordUrl("charging", charge.id)}
              title={vehicleLabel(s, charge.vehicle)}
              location={
                s.hubs.find((hub) => hub.id === charge.hub)?.name ??
                "Charging hub"
              }
              detail={[
                charge.battery === null
                  ? null
                  : "Battery " + charge.battery + "%",
                "Target " + charge.target + "%",
                charge.point ?? "Awaiting point",
                charge.schedule,
              ]
                .filter(Boolean)
                .join(" · ")}
              status={charge.status}
            />
          ))}
        </ul>
      ) : !visible.length ? (
        <Empty
          title="No charging requests"
          text="New requests will appear here."
        />
      ) : (
        <Table
          aria-label="Charging requests and allocations"
          className="w-full border-collapse text-left text-sm max-[600px]:min-w-190"
        >
          <TableHeader>
            <TableRow>
              <TableHead>Vehicle</TableHead>
              <TableHead>Hub</TableHead>
              <TableHead>Battery / target</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Allocation</TableHead>
              <TableHead className="w-px">
                <span className="sr-only">Details</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visible.map((c) => (
              <TableRow key={c.id}>
                <TableHead scope="row" className="border-b border-divider">
                  {vehicleLabel(s, c.vehicle)}
                  <small className="leading-[1.6] block font-normal max-w-75">
                    {c.owner === "operator" ? "Shared" : "Private"}
                  </small>
                </TableHead>
                <TableCell className="border-b border-divider">
                  {s.hubs.find((h) => h.id === c.hub)?.name}
                </TableCell>
                <TableCell className="border-b border-divider">
                  {c.battery === null ? "—" : `${c.battery}%`} / {c.target}%
                </TableCell>
                <TableCell className="border-b border-divider">
                  <Badge>{c.status}</Badge>
                </TableCell>
                <TableCell className="border-b border-divider">
                  {c.point ?? (c.status === "pending" ? "Awaiting point" : "—")}
                  <small className="leading-[1.6] block font-normal max-w-75">
                    {c.schedule && c.schedule !== "No assigned schedule" && (
                      <span className="block">{c.schedule}</span>
                    )}
                    <span className="wrap-anywhere">{c.reason}</span>
                  </small>
                </TableCell>
                <TableCell className="border-b border-divider">
                  <Button asChild variant="ghost" size="icon">
                    <Link
                      aria-label={`View charging session for ${vehicleLabel(s, c.vehicle)}`}
                      to={`/operator/charging/${encodeURIComponent(c.id)}`}
                    >
                      <Icon name="chevron" />
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </>
  );
  const current =
    charges.find((item) => item.status === "active") ??
    charges.find(
      (item) => item.status === "scheduled" || item.status === "pending",
    );
  return operator ? (
    list
  ) : (
    <StudentJourney
      hub={current?.hub}
      active={Boolean(activeStudentCard)}
      availabilityMode="charging"
    >
      {list}
    </StudentJourney>
  );
}
