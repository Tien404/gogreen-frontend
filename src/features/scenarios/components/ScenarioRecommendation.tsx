import { Icon } from "@/shared/components/Icon";
import { Alert, Badge, Button, Confirm } from "@/shared/ui";
import type { WhatIfModel } from "../hooks/useWhatIf";

type ScenarioRecommendationProps = Pick<
  WhatIfModel,
  "r" | "s" | "result" | "act" | "setError" | "error"
>;

export function ScenarioRecommendation({
  r,
  s,
  result,
  act,
  setError,
  error,
}: ScenarioRecommendationProps) {
  const source = s.hubs.find((hub) => hub.id === result.source)?.name;
  const destination = s.hubs.find((hub) => hub.id === result.destination)?.name;

  return (
    <section
      data-slot="panel"
      className="mt-5 bg-panel rounded-sm min-w-0 [&_>_[data-slot~=section-head]_>_[data-slot~=badge]]:ml-auto max-[600px]:mt-5 max-[600px]:rounded-xs max-[600px]:[&_>_[data-slot~=section-head]_>_[data-slot~=badge]]:ml-0 p-5 max-[600px]:p-5"
    >
      <div
        data-slot="section-head"
        className="flex items-center justify-start gap-4 mb-5 [&_p]:text-xs [&_p]:mt-1 max-[600px]:items-start max-[600px]:[&_p]:text-xs max-[600px]:**:data-[slot~=text-link]:shrink-0 max-[600px]:**:data-[slot~=text-link]:text-xs max-[600px]:**:data-[slot~=text-link]:gap-1 max-[600px]:[&_[data-slot~=text-link]_svg]:hidden max-[600px]:flex-wrap"
      >
        <span
          data-slot="icon-box"
          className="inline-flex items-center justify-center bg-soft text-accent w-11 h-11 rounded-xs shrink-0"
        >
          <Icon name="dispatch" />
        </span>
        <div>
          <span
            data-slot="eyebrow"
            className="text-xs font-semibold tracking-[1.7px] text-accent mb-3"
          >
            RECOMMENDATION 01
          </span>
          <h2 className="leading-[1.4] text-md max-[600px]:text-md">
            Plan one shared-vehicle transfer
          </h2>
        </div>
        <Badge>
          {r.applied
            ? "Applied"
            : r.snapshot !== s.revision || s.preset === "what-if"
              ? "Stale"
              : "Ready to review"}
        </Badge>
      </div>
      <p className="leading-[1.65] max-w-212.5">
        Move {r.vehicle || "an eligible vehicle"} from {source} to {destination}
        . {result.rationale}
      </p>
      <div
        data-slot="two-col"
        className="grid grid-cols-2 gap-5 **:data-[slot~=two-col]:gap-4 [&_>_[data-slot~=panel]_>_p]:mt-3 [&_>_[data-slot~=panel]_>_p]:mb-5 max-[900px]:gap-4 max-[600px]:grid-cols-1 max-[600px]:**:data-[slot~=two-col]:grid-cols-1 [&_>_[data-slot~=panel]_>_p]:mx-0"
      >
        <dl className="grid grid-cols-[minmax(100px,0.8fr)_1.2fr] gap-4 text-sm **:data-[slot~=badge]:align-top my-5 mx-0">
          <dt className="text-content-muted">Illustrative impact</dt>
          <dd className="wrap-anywhere m-0">
            One additional shared vehicle at {destination} after dispatch
            completion.
          </dd>
          <dt className="text-content-muted">Evidence</dt>
          <dd className="wrap-anywhere m-0">
            Preset demand peak: {Math.max(...r.scenario)} requests. Baseline
            peak: {Math.max(...r.baseline)}.
          </dd>
        </dl>
        <dl className="grid grid-cols-[minmax(100px,0.8fr)_1.2fr] gap-4 text-sm **:data-[slot~=badge]:align-top my-5 mx-0">
          <dt className="text-content-muted">Prerequisites</dt>
          <dd className="wrap-anywhere m-0">
            Vehicle available at source; destination capacity; unchanged
            snapshot.
          </dd>
          <dt className="text-content-muted">Apply effect</dt>
          <dd className="wrap-anywhere m-0">
            One planned dispatch, with no immediate vehicle movement.
          </dd>
        </dl>
      </div>
      <Confirm
        title="Apply this recommendation?"
        description={`${r.vehicle} will be committed to a planned dispatch from ${source} to ${destination}. Review and start it separately.`}
        trigger={
          <Button disabled={r.applied}>
            {r.applied ? "Already applied" : "Preview and apply"}
            <Icon name="arrow" />
          </Button>
        }
        onConfirm={() => {
          const result = act({ type: "apply", id: r.id });

          setError(result.error ? result.message : "");
        }}
      />
      {error && <Alert tone="error">{error}</Alert>}
    </section>
  );
}
