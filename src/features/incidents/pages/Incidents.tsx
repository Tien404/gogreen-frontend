import { assetLabel } from "@/integration/recordLabels";
import {
  Input,
  Select,
  Panel,
  Textarea,
  Alert,
  Badge,
  Button,
  Empty,
  Field,
  Modal,
  PageTitle,
} from "@/shared/ui";
import { OperatorScreenData } from "@/integration/OperatorScreenData";
import { useSearchParams } from "react-router";
import { Icon } from "@/shared/components/Icon";
import { time } from "@/shared/lib/time";

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
        action={
          <Button onClick={() => setOpen(true)}>
            <Icon name="plus" />
            Record incident
          </Button>
        }
      />
      <div className="filter-bar">
        <div data-slot="search-input" className="filter-search">
          <Icon name="search" />
          <Input
            aria-label="Search incidents"
            value={search}
            placeholder="Search incidents or resources…"
            onChange={(e) => setSearch(e.target.value)}
            className="border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
          />
        </div>
        <Select
          aria-label="Incident status"
          value={filter}
          onValueChange={(value) => setFilter(value)}
          wrapperClassName="max-w-full cursor-pointer max-[600px]:max-w-full max-[600px]:flex-1 max-[600px]:min-w-0"
        >
          <option value="open">Open incidents</option>
          <option value="resolved">Resolved incidents</option>
          <option value="all">All incidents</option>
        </Select>
      </div>
      <div className="grid gap-5">
        {items.map((i) => (
          <Panel key={i.id} data-slot="panel" className="min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <span
                data-slot="icon-box"
                className="inline-flex items-center justify-center bg-green-muted text-green-ink w-11 h-11 rounded-lg shrink-0"
              >
                <Icon name="alert" />
              </span>
              <div className={"flex-1 min-w-32 wrap-anywhere"}>
                <h3>{assetLabel(s, i.resource)}</h3>
                <small className="leading-[1.6] block">
                  {i.type} · Reported {time(i.time)}
                </small>
              </div>
              <Badge>{i.severity}</Badge>
              <Badge>{i.status}</Badge>
            </div>
            <p className="leading-[1.65] mt-5 wrap-anywhere">{i.description}</p>
            <ol
              data-compact="true"
              className="list-none [&_li:before]:content-[''] [&_li:before]:absolute [&_li:before]:-left-1.25 [&_li:before]:top-1.75 [&_li:before]:w-2.25 [&_li:before]:h-2.25 [&_li:before]:bg-primary [&_li:before]:rounded-full [&_small]:block [&_small]:mt-1 data-[compact=true]:mt-5 [&[data-compact=true]_li]:pb-3 m-0 p-0"
            >
              <li className="relative ml-2 pt-0 pr-0 pb-5 pl-5 text-sm">
                Operator-recorded incident
              </li>
              {i.resolution && (
                <li className="relative ml-2 pt-0 pr-0 pb-5 pl-5 text-sm">
                  <span className="wrap-anywhere">
                    Resolved: {i.resolution}
                  </span>
                </li>
              )}
            </ol>
            {i.status === "open" && (
              <Button
                variant="secondary"
                className="max-[600px]:w-full"
                onClick={() => setResolve(i.id)}
              >
                Resolve
              </Button>
            )}
          </Panel>
        ))}
      </div>
      {!items.length && (
        <Empty
          title="No matching incidents"
          text="Try all statuses, or record an incident."
          action={
            filter !== "all" || search ? (
              <Button
                variant="secondary"
                onClick={() => {
                  setFilter("all");
                  setSearch("");
                }}
              >
                Clear filters
              </Button>
            ) : undefined
          }
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
            <Textarea
              required
              name="reason"
              rows={3}
              placeholder="Describe inspection, outcome and any remaining action."
              className="max-w-full resize-y"
            />
          </Field>
          {error && <Alert tone="error">{error}</Alert>}
          <Button type="submit" className="max-[600px]:w-full" disabled={busy}>
            Confirm
          </Button>
        </form>
      </Modal>
    </>
  );
}
