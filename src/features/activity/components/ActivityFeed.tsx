import { activityResourceLabel } from "@/integration/recordLabels";
import { Input, Select, Badge, Button, Empty, Link } from "@/shared/ui";
import { Icon } from "@/shared/components/Icon";
import { time } from "@/shared/lib/time";

import { useActivity } from "../hooks/useActivity";

function activityIcon(a: { action: string; link?: string }): string {
  const link = a.link ?? "";
  const action = a.action;
  if (link.includes("/charging/") || /charg/i.test(action)) return "bolt";
  if (
    link.includes("/parking/") ||
    /park|check[- ]?in|check[- ]?out|no[- ]?show/i.test(action)
  )
    return "parking";
  if (link.includes("/holds/") || /hold|reserv/i.test(action)) return "clock";
  if (
    link.includes("/rides/") ||
    link.includes("/vehicles") ||
    /ride|rental|pickup|return|vehicle/i.test(action)
  )
    return "bike";
  if (link.includes("/dispatch/") || /dispatch|redistribut/i.test(action))
    return "dispatch";
  if (link.includes("/incidents") || /incident|fault|alert/i.test(action))
    return "alert";
  if (
    link.includes("/what-if/") ||
    /simulat|what[- ]?if|scenario/i.test(action)
  )
    return "flask";
  return "activity";
}

type ActivityFeedProps = {
  compact?: boolean;
};
export function ActivityFeed({ compact = false }: ActivityFeedProps) {
  const { s, filter, setFilter, outcome, setOutcome, items } = useActivity();
  return (
    <>
      {!compact && (
        <div className="filter-bar">
          <div data-slot="search-input" className="filter-search">
            <Icon name="search" />
            <Input
              aria-label="Search activity"
              placeholder="Search activity or resource…"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
            />
          </div>
          <Select
            aria-label="Filter activity outcome"
            value={outcome}
            onValueChange={(value) => setOutcome(value)}
          >
            <option value="all">All outcomes</option>
            {["Success", "Failed", "Expired", "Ignored", "Attention"].map(
              (x) => (
                <option key={x}>{x}</option>
              ),
            )}
          </Select>
        </div>
      )}
      <div role="list" aria-label="Activity records">
        {(compact ? items.slice(0, 4) : items).map((a) => (
          <div
            role="listitem"
            className="activity-row flex gap-3 border-b border-solid border-b-divider items-start last:border-b-0 last:border-solid py-4 px-0"
            key={a.id}
          >
            <div
              data-error={a.result === "Failed"}
              className="h-9 w-9 grid place-items-center bg-green-muted rounded-lg text-green-ink shrink-0 data-[error=true]:text-danger data-[error=true]:bg-danger-surface"
            >
              <Icon name={activityIcon(a)} />
            </div>
            <div className="flex-1 min-w-0">
              <strong className="block text-base font-semibold leading-snug capitalize wrap-anywhere">
                {a.action.replaceAll("-", " ")}
              </strong>
              {a.reason && (
                <p className="mt-1 text-sm leading-relaxed wrap-anywhere">
                  {a.reason}
                </p>
              )}
              <small className="mt-1 block text-sm leading-snug wrap-anywhere">
                {a.actor} ·{" "}
                {a.link ? (
                  <Link
                    to={
                      a.link.startsWith(`/${s.role}`)
                        ? a.link
                        : `/${s.role}/activity`
                    }
                  >
                    {activityResourceLabel(s, a)}
                  </Link>
                ) : (
                  activityResourceLabel(s, a)
                )}
              </small>
            </div>
            <div className="activity-meta flex items-end flex-col gap-1 shrink-0 max-[600px]:**:data-[slot~=badge]:text-sm max-[600px]:gap-2 max-[600px]:**:data-[slot~=badge]:py-px max-[600px]:**:data-[slot~=badge]:px-2">
              <Badge>{a.result}</Badge>
              <small className="text-sm tabular-nums">{time(a.at)}</small>
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <Empty
            title={
              filter || outcome !== "all"
                ? "No matching activity"
                : "No activity yet"
            }
            text={
              filter || outcome !== "all"
                ? "Clear the search and outcome filter to see all activity."
                : "Actions in this workspace will appear here."
            }
            action={
              filter || outcome !== "all" ? (
                <Button
                  variant="secondary"
                  onClick={() => {
                    setFilter("");
                    setOutcome("all");
                  }}
                >
                  Clear filters
                </Button>
              ) : undefined
            }
          />
        )}
      </div>
    </>
  );
}
