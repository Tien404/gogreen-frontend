import { activityResourceLabel } from "@/integration/recordLabels";
import { Input, Select, Badge, Button, Empty, Link } from "@/shared/ui";
import { Icon } from "@/shared/components/Icon";
import { time } from "@/shared/lib/time";

import { useActivity } from "../hooks/useActivity";
type ActivityFeedProps = {
  compact?: boolean;
};
export function ActivityFeed({ compact = false }: ActivityFeedProps) {
  const { s, filter, setFilter, outcome, setOutcome, items } = useActivity();
  return (
    <>
      {!compact && (
        <div className="filter-bar">
          <div
            data-slot="search-input"
            className="flex items-center bg-panel rounded-lg min-w-40 flex-1 gap-2 max-w-105 text-content-muted focus-within:outline-2 focus-within:outline-primary focus-within:outline-offset-2 [&_input:focus-visible]:outline-none max-[600px]:max-w-none max-[600px]:basis-full py-0 px-3"
          >
            <Icon name="search" />
            <Input
              aria-label="Search activity"
              placeholder="Search activity or resource…"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="max-w-full w-full min-w-0 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
            />
          </div>
          <Select
            className="border-0 shadow-none"
            aria-label="Filter activity outcome"
            value={outcome}
            onValueChange={(value) => setOutcome(value)}
            wrapperClassName="max-w-full cursor-pointer max-[600px]:max-w-full max-[600px]:flex-1 max-[600px]:min-w-0"
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
              <Icon
                name={
                  a.action.includes("harg")
                    ? "bolt"
                    : a.action.includes("ncident")
                      ? "alert"
                      : "activity"
                }
              />
            </div>
            <div className="flex-1 min-w-0">
              <strong className="text-sm capitalize">
                {a.action.replaceAll("-", " ")}
              </strong>
              <p className="leading-[1.65] text-sm max-[600px]:max-w-full wrap-anywhere">
                {a.reason}
              </p>
              <small className="leading-[1.6] block wrap-anywhere">
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
              <small className="leading-[1.6]">{time(a.at)}</small>
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
