import { OperatorScreenData } from "@/integration/OperatorScreenData";
import { useSearchParams } from "react-router";
import { Icon } from "@/shared/components/Icon";
import { time } from "@/shared/lib/time";
import {
  Alert,
  Badge,
  Button,
  Empty,
  Field,
  Modal,
  PageTitle,
} from "@/shared/ui";
import { ReportIncidentDialog } from "../components/ReportIncidentDialog";
import { useIncidents } from "../hooks/useIncidents";
export function Incidents() {
  const [params] = useSearchParams();
  return (
    <OperatorScreenData incidentId={params.get("incident") || undefined}>
      <IncidentsView />
    </OperatorScreenData>
  );
}
function IncidentsView() {
  const {
    s,
    busy,
    resource,
    setResource,
    targets,
    open,
    setOpen,
    filter,
    setFilter,
    search,
    setSearch,
    error,
    resolve,
    setResolve,
    items,
    reportIncident,
    resolveIncident,
  } = useIncidents();
  return (
    <>
      <PageTitle
        title="Incidents"
        description="Record faults, track exceptions and document how they were resolved."
        action={
          <Button onClick={() => setOpen(true)}>
            <Icon name="plus" />
            Record incident
          </Button>
        }
      />
      <div className="flex items-center gap-3 flex-wrap mb-5 max-[600px]:items-stretch max-[600px]:gap-2">
        <div
          data-slot="search-input"
          className="flex items-center bg-panel rounded-xs min-w-40 flex-1 gap-2 max-w-105 text-content-muted focus-within:outline-2 focus-within:outline-accent focus-within:outline-offset-2 [&_input:focus-visible]:outline-none max-[600px]:max-w-none max-[600px]:basis-full py-0 px-3"
        >
          <Icon name="search" />
          <input
            aria-label="Search incidents"
            value={search}
            placeholder="Search incidents or resources…"
            onChange={(e) => setSearch(e.target.value)}
            className="border-0 border-solid border-control-border rounded-xs bg-transparent min-h-11 text-content text-sm max-w-full placeholder:text-content-muted hover:bg-soft w-full min-w-0 py-2 px-0"
          />
        </div>
        <select
          aria-label="Incident status"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border border-solid border-control-border rounded-xs bg-panel min-h-11 text-content text-sm max-w-full hover:bg-soft cursor-pointer max-[600px]:max-w-full max-[600px]:flex-1 max-[600px]:min-w-0 py-2 px-3"
        >
          <option value="open">Open incidents</option>
          <option value="resolved">Resolved incidents</option>
          <option value="all">All incidents</option>
        </select>
      </div>
      <div className="grid gap-5">
        {items.map((i) => (
          <section
            key={i.id}
            data-slot="panel"
            className="bg-panel rounded-sm min-w-0 max-[600px]:rounded-xs p-5 max-[600px]:p-5"
          >
            <div className="flex items-center gap-3 flex-wrap">
              <span
                data-slot="icon-box"
                className="inline-flex items-center justify-center bg-soft text-accent w-11 h-11 rounded-xs shrink-0"
              >
                <Icon name="alert" />
              </span>
              <div className={"flex-1 min-w-32 wrap-anywhere"}>
                <h3>{i.resource}</h3>
                <small className="leading-[1.6] block">
                  {i.id} · {i.type} · Reported {time(i.time)}
                </small>
              </div>
              <Badge>{i.severity}</Badge>
              <Badge>{i.status}</Badge>
            </div>
            <p className="leading-[1.65] mt-5 wrap-anywhere">{i.description}</p>
            <ol
              data-compact="true"
              className="list-none [&_li:before]:content-[''] [&_li:before]:absolute [&_li:before]:-left-1.25 [&_li:before]:top-1.75 [&_li:before]:w-2.25 [&_li:before]:h-2.25 [&_li:before]:bg-accent [&_li:before]:rounded-full [&_li:last-child]:border-l-transparent [&_small]:block [&_small]:mt-1 data-[compact=true]:mt-5 [&[data-compact=true]_li]:pb-3 m-0 p-0"
            >
              <li className="relative ml-2 pt-0 pr-0 pb-5 pl-5 border-l border-solid border-l-divider text-sm">
                Operator-recorded incident
              </li>
              {i.resolution && (
                <li className="relative ml-2 pt-0 pr-0 pb-5 pl-5 border-l border-solid border-l-divider text-sm">
                  <span className="wrap-anywhere">
                    Resolved: {i.resolution}
                  </span>
                </li>
              )}
            </ol>
            {i.status === "open" && (
              <Button variant="secondary" onClick={() => setResolve(i.id)}>
                Resolve incident
              </Button>
            )}
          </section>
        ))}
      </div>
      {!items.length && (
        <Empty
          title="No matching incidents"
          text="Try all statuses, or record an incident."
        />
      )}
      <ReportIncidentDialog
        s={s}
        open={open}
        setOpen={setOpen}
        reportIncident={reportIncident}
        error={error}
        busy={busy}
        resource={resource}
        setResource={setResource}
        targets={targets}
      />
      <Modal
        title={`Resolve ${resolve}`}
        description="Record the outcome. Resolution does not automatically complete affected sessions or rides."
        open={!!resolve}
        onOpenChange={(v) => !v && setResolve("")}
      >
        <form onSubmit={resolveIncident}>
          <Field label="Resolution and follow-up">
            <textarea
              required
              name="reason"
              rows={3}
              placeholder="Describe inspection, outcome and any remaining action."
              className="border border-solid border-control-border rounded-xs bg-panel min-h-11 text-content text-sm max-w-full placeholder:text-content-muted hover:bg-soft resize-y py-2 px-3"
            />
          </Field>
          {error && <Alert tone="error">{error}</Alert>}
          <Button type="submit" disabled={busy}>
            Confirm resolution
          </Button>
        </form>
      </Modal>
    </>
  );
}
