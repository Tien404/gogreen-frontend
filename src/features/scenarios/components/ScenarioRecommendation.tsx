import { Panel, Link, SectionHead } from "@/shared/ui";
import { dispatchAdviceUrl } from "@/integration/operatorRecords";
import type { Schemas } from "@/shared/api/contract.generated";
import { Icon } from "@/shared/components/Icon";

export function ScenarioRecommendations({
  recommendations,
}: {
  recommendations: Schemas["SimulationAdvice"][];
}) {
  return (
    <Panel data-slot="panel" className="mt-5 min-w-0">
      <SectionHead title="Recommendations" />
      {recommendations.length ? (
        <ul className="divide-y divide-divider">
          {recommendations.map((advice, index) => {
            const url = dispatchAdviceUrl(advice);
            return (
              <li
                key={`${advice.type}-${index}`}
                className="flex items-start gap-3 py-4"
              >
                <span
                  data-slot="icon-box"
                  className="grid size-9 shrink-0 place-items-center rounded-lg bg-green-muted text-green-ink"
                >
                  <Icon name={url ? "dispatch" : "alert"} />
                </span>
                <div className="min-w-0 wrap-anywhere">
                  <p className="leading-[1.65]">{advice.reason}</p>
                  {url && (
                    <Link
                      to={url}
                      className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-primary hover:underline"
                    >
                      Review suggested dispatch <Icon name="arrow" size={16} />
                    </Link>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="text-content-muted">
          No coordination action was recommended.
        </p>
      )}
    </Panel>
  );
}
