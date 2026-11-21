import { OperatorScreenData } from "@/integration/OperatorScreenData";
import { StudentData } from "@/integration/StudentScreenData";
import { Missing } from "@/app/pages/Missing";
import { Icon } from "@/shared/components/Icon";
import { Alert, Badge, Button, Empty, Link, PageTitle } from "@/shared/ui";
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
        <section
          data-slot="panel"
          className="bg-panel rounded-sm min-w-0 max-w-162.5 max-[600px]:rounded-xs p-5 max-[600px]:p-5"
        >
          <ChargeForm />
        </section>
      </>
    );
  if (id) {
    if (!c) return <Missing />;
    return (
      <>
        <Link
          className="inline-flex items-center gap-2 text-xs text-content-muted mb-5"
          to={`/${s.role}/charging`}
        >
          <Icon name="arrow-left" size={16} /> Charging
        </Link>
        <PageTitle
          title={`Charging ${c.id}`}
          description={`${c.vehicle} · ${s.hubs.find((h) => h.id === c.hub)?.name}`}
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
        <div className="flex bg-surface-inset rounded-xs gap-1 [&_button[aria-pressed='true']]:bg-panel [&_button[aria-pressed='true']]:shadow-control [&_button[aria-pressed='true']]:text-content [&_button:hover]:bg-panel/80 max-[600px]:max-w-full max-[600px]:overflow-x-auto p-1">
          {["all", "queue", "schedule", "finished"].map((t) => (
            <button
              key={t}
              aria-pressed={tab === t}
              onClick={() => setTab(t)}
              className="border-0 border-solid rounded-xs bg-transparent text-content-muted text-xs flex items-center gap-2 capitalize min-h-9 max-[600px]:flex-1 py-2 px-3 max-[600px]:p-2"
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
      <div
        data-slot="panel"
        className="bg-panel rounded-sm min-w-0 max-[600px]:rounded-xs p-5 max-[600px]:p-5"
      >
        <div className="overflow-x-auto max-w-full max-[600px]:my-0 max-[600px]:-mx-1">
          <table className="w-full border-collapse text-left text-sm max-[600px]:min-w-140">
            <thead>
              <tr>
                <th className="align-middle first:pl-0 last:pr-0 text-xs font-medium text-content-muted bg-surface-muted whitespace-nowrap [&_small]:block [&_small]:font-normal [&_small]:max-w-75 py-4 px-3">
                  Request / vehicle
                </th>
                <th className="align-middle first:pl-0 last:pr-0 text-xs font-medium text-content-muted bg-surface-muted whitespace-nowrap [&_small]:block [&_small]:font-normal [&_small]:max-w-75 py-4 px-3">
                  Hub
                </th>
                <th className="align-middle first:pl-0 last:pr-0 text-xs font-medium text-content-muted bg-surface-muted whitespace-nowrap [&_small]:block [&_small]:font-normal [&_small]:max-w-75 py-4 px-3">
                  Battery / target
                </th>
                <th className="align-middle first:pl-0 last:pr-0 text-xs font-medium text-content-muted bg-surface-muted whitespace-nowrap [&_small]:block [&_small]:font-normal [&_small]:max-w-75 py-4 px-3">
                  Status
                </th>
                <th className="align-middle first:pl-0 last:pr-0 text-xs font-medium text-content-muted bg-surface-muted whitespace-nowrap [&_small]:block [&_small]:font-normal [&_small]:max-w-75 py-4 px-3">
                  Allocation
                </th>
                <th className="align-middle first:pl-0 last:pr-0 text-xs font-medium text-content-muted bg-surface-muted whitespace-nowrap [&_small]:block [&_small]:font-normal [&_small]:max-w-75 py-4 px-3">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="[&_tr:hover]:bg-surface-muted">
              {visible.map((c) => (
                <tr key={c.id}>
                  <th
                    scope="row"
                    className="border-b border-solid border-b-divider align-middle first:pl-0 last:pr-0 font-medium whitespace-nowrap py-4 px-3"
                  >
                    {c.id}
                    <small className="leading-[1.6] block font-normal max-w-75">
                      {c.vehicle} ·{" "}
                      {c.owner === "operator" ? "Shared" : "Private"}
                    </small>
                  </th>
                  <td className="border-b border-solid border-b-divider align-middle first:pl-0 last:pr-0 [&_small]:block [&_small]:font-normal [&_small]:max-w-75 py-4 px-3">
                    {s.hubs.find((h) => h.id === c.hub)?.name}
                  </td>
                  <td className="border-b border-solid border-b-divider align-middle first:pl-0 last:pr-0 [&_small]:block [&_small]:font-normal [&_small]:max-w-75 py-4 px-3">
                    {c.battery === null ? "—" : `${c.battery}%`} / {c.target}%
                  </td>
                  <td className="border-b border-solid border-b-divider align-middle first:pl-0 last:pr-0 [&_small]:block [&_small]:font-normal [&_small]:max-w-75 py-4 px-3">
                    <Badge>{c.status}</Badge>
                  </td>
                  <td className="border-b border-solid border-b-divider align-middle first:pl-0 last:pr-0 py-4 px-3">
                    {c.point ?? "Awaiting point"}
                    <small className="leading-[1.6] block font-normal max-w-75">
                      {c.schedule && (
                        <span className="block">{c.schedule}</span>
                      )}
                      <span className="wrap-anywhere">{c.reason}</span>
                    </small>
                  </td>
                  <td className="border-b border-solid border-b-divider align-middle first:pl-0 last:pr-0 [&_small]:block [&_small]:font-normal [&_small]:max-w-75 py-4 px-3">
                    <Link
                      data-slot="text-link"
                      className="leading-[16px] text-accent inline-flex items-center gap-2 text-xs font-semibold hover:underline"
                      to={`/${s.role}/charging/${encodeURIComponent(c.id)}`}
                    >
                      View session <Icon name="arrow" size={16} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!visible.length && (
          <Empty
            title="No charging requests"
            text="New requests will appear here."
          />
        )}
      </div>
    </>
  );
}
