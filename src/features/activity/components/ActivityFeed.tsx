import { Icon } from "@/shared/components/Icon";
import { time } from "@/shared/lib/time";
import { Badge, Empty, Link } from "@/shared/ui";
import { useActivity } from "../hooks/useActivity";
type ActivityFeedProps = {
  compact?: boolean;
};
export function ActivityFeed({ compact = false }: ActivityFeedProps) {
  const { s, filter, setFilter, outcome, setOutcome, items } = useActivity();
  return (
    <>
      {!compact && (
        <div className="flex items-center gap-3 flex-wrap mb-5 max-[600px]:items-stretch max-[600px]:gap-2">
          <div
            data-slot="search-input"
            className="flex items-center bg-panel rounded-xs min-w-40 flex-1 gap-2 max-w-105 text-content-muted focus-within:outline-2 focus-within:outline-accent focus-within:outline-offset-2 [&_input:focus-visible]:outline-none max-[600px]:max-w-none max-[600px]:basis-full py-0 px-3"
          >
            <Icon name="search" />
            <input
              aria-label="Search activity"
              placeholder="Search activity or resource…"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="border-0 border-solid border-control-border rounded-xs bg-transparent min-h-11 text-content text-sm max-w-full placeholder:text-content-muted hover:bg-soft w-full min-w-0 py-2 px-0"
            />
          </div>
          <select
            aria-label="Filter activity outcome"
            value={outcome}
            onChange={(e) => setOutcome(e.target.value)}
            className="border border-solid border-control-border rounded-xs bg-panel min-h-11 text-content text-sm max-w-full hover:bg-soft cursor-pointer max-[600px]:max-w-full max-[600px]:flex-1 max-[600px]:min-w-0 py-2 px-3"
          >
            <option value="all">All outcomes</option>
            {["Success", "Failed", "Expired", "Ignored", "Attention"].map(
              (x) => (
                <option key={x}>{x}</option>
              ),
            )}
          </select>
        </div>
      )}
      <div>
        {(compact ? items.slice(0, 4) : items).map((a) => (
          <div
            className="flex gap-3 border-b border-solid border-b-surface-inset items-start last:border-b-0 last:border-solid py-4 px-0"
            key={a.id}
          >
            <div
              data-error={a.result === "Failed"}
              className="h-9 w-9 grid place-items-center bg-soft rounded-xs text-accent shrink-0 data-[error=true]:text-danger data-[error=true]:bg-danger-surface"
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
              <p className="leading-[1.65] text-xs max-[600px]:max-w-full wrap-anywhere">
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
                    {a.resource}
                  </Link>
                ) : (
                  a.resource
                )}
              </small>
            </div>
            <div className="flex items-end flex-col gap-1 shrink-0 max-[600px]:**:data-[slot~=badge]:text-xs max-[600px]:gap-2 max-[600px]:**:data-[slot~=badge]:py-px max-[600px]:**:data-[slot~=badge]:px-2">
              <Badge>{a.result}</Badge>
              <small className="leading-[1.6]">{time(a.at)}</small>
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <Empty
            title="No activity yet"
            text="Actions in this workspace will appear here."
          />
        )}
      </div>
    </>
  );
}
