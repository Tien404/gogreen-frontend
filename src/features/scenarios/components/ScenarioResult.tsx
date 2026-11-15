import { Icon } from "@/shared/components/Icon";
import { time } from "@/shared/lib/time";
import { Alert, Badge, Button, Empty, Link, PageTitle } from "@/shared/ui";
import type { WhatIfModel } from "../hooks/useWhatIf";
import { ScenarioComparison } from "./ScenarioComparison";
import { ScenarioRecommendation } from "./ScenarioRecommendation";

type ScenarioResultProps = Pick<
  WhatIfModel,
  "s" | "act" | "r" | "result" | "setError" | "error"
>;

export function ScenarioResult({
  s,
  act,
  r,
  result,
  setError,
  error,
}: ScenarioResultProps) {
  return (
    <>
      <Link
        className="inline-flex items-center gap-2 text-xs text-content-muted mb-5"
        to="/operator/what-if"
      >
        <Icon name="arrow-left" size={16} /> What-if scenarios
      </Link>
      <PageTitle
        title={r.type}
        description={`${r.id} · ${r.horizon}-minute preset · Snapshot at 20 October, ${time(r.captured)}`}
        action={<Badge>{r.status}</Badge>}
      />
      <Alert>
        Illustrative mock results. Supported fixture inputs:{" "}
        {s.hubs.find((hub) => hub.id === r.hub)?.name}, {r.demand} demand. These
        results do not predict real operations.
      </Alert>
      {r.status === "failed" ? (
        <Empty
          title="Mock run interrupted"
          text="The failure preset interrupted this demonstration. Retry loads the matching result fixture."
          action={
            <Button onClick={() => act({ type: "retry-run", id: r.id })}>
              Retry mock run
            </Button>
          }
        />
      ) : (
        <>
          <div className="grid grid-cols-4 gap-4 max-[1200px]:grid-cols-2 max-[600px]:gap-2">
            {[
              [
                "Served demand",
                `${result.served} / 40`,
                `Baseline: ${result.baselineServed} / 40`,
              ],
              [
                "Rejected demand",
                String(result.rejected),
                `Baseline: ${result.baselineRejected}`,
              ],
              [
                "Still waiting",
                String(result.waiting),
                "Not counted in started wait",
              ],
              [
                "Completed trips",
                String(result.trips),
                "Separate from served requests",
              ],
            ].map(([title, value, detail]) => (
              <div
                data-slot="panel"
                className="bg-panel rounded-sm min-w-0 [&_>_div]:flex [&_>_div]:justify-between [&_>_div]:items-center [&_>_div]:gap-2 [&_>_div_>_span:first-child]:text-xs [&_>_div_>_span:first-child]:text-content-muted **:data-[slot~=icon-box]:h-8 **:data-[slot~=icon-box]:w-8 max-[600px]:rounded-xs max-[600px]:[&_>_div]:items-start max-[600px]:**:data-[slot~=icon-box]:hidden p-5 max-[600px]:p-4"
                key={title}
              >
                <span className="text-xs text-content-muted">{title}</span>
                <strong className="text-lg leading-[1.4] block tracking-[-1px] mt-3 mb-1 max-[600px]:text-lg max-[600px]:tracking-[-0.5px] mx-0">
                  {value}
                </strong>
                <small className="leading-[1.6] block max-[600px]:text-xs">
                  {detail}
                </small>
              </div>
            ))}
          </div>
          <ScenarioComparison s={s} r={r} result={result} />
          <ScenarioRecommendation
            r={r}
            s={s}
            result={result}
            act={act}
            setError={setError}
            error={error}
          />
        </>
      )}
    </>
  );
}
