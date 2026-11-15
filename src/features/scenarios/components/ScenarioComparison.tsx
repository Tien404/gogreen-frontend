import { time } from "@/shared/lib/time";
import { Alert, SectionHead } from "@/shared/ui";
import type { WhatIfModel } from "../hooks/useWhatIf";

type ScenarioComparisonProps = Pick<WhatIfModel, "s" | "r" | "result">;

export function ScenarioComparison({ s, r, result }: ScenarioComparisonProps) {
  return (
    <div
      data-slot="two-col"
      className="mt-5 grid grid-cols-2 gap-5 **:data-[slot~=two-col]:gap-4 max-[900px]:gap-4 max-[600px]:mt-5 max-[600px]:grid-cols-1 max-[600px]:**:data-[slot~=two-col]:grid-cols-1"
    >
      <section
        data-slot="panel"
        className="bg-panel rounded-sm min-w-0 max-[600px]:rounded-xs p-5 max-[600px]:p-5"
      >
        <SectionHead
          title="Demand over time"
          subtitle="Requests per 10-minute interval · baseline vs scenario"
        />
        <div className="flex gap-5 text-content-muted text-xs">
          <span className="flex items-center gap-2">
            <i className="w-1.5 h-1.5 inline-block rounded-lg bg-content-muted" />
            Baseline
          </span>
          <span className="flex items-center gap-2">
            <i className="w-1.5 h-1.5 inline-block rounded-lg bg-accent" />
            Scenario
          </span>
        </div>
        <svg
          className="w-full my-4 mx-0"
          viewBox="0 0 500 240"
          role="img"
          aria-label={`Scenario demand peaks at ${Math.max(...r.scenario)} requests; baseline peak ${Math.max(...r.baseline)}. Interval values in table below.`}
        >
          {[0, 10, 20, 30, 40].map((n) => (
            <g key={n}>
              <line
                x1="40"
                y1={200 - n * 4}
                x2="480"
                y2={200 - n * 4}
                className="stroke-divider"
              />
              <text
                x="12"
                y={204 - n * 4}
                className="fill-content-muted"
                fontSize="12"
              >
                {n}
              </text>
            </g>
          ))}
          <polyline
            points={r.baseline
              .map((v, i) => `${50 + i * 82},${200 - v * 4}`)
              .join(" ")}
            fill="none"
            className="stroke-content-muted"
            strokeWidth="3"
            strokeDasharray="6 4"
          />
          <polyline
            points={r.scenario
              .map((v, i) => `${50 + i * 82},${200 - v * 4}`)
              .join(" ")}
            fill="none"
            className="stroke-accent"
            strokeWidth="3"
          />
          {r.scenario.map((v, i) => (
            <g key={i}>
              <circle
                cx={50 + i * 82}
                cy={200 - v * 4}
                r="4"
                className="fill-accent"
              />
              <text
                x={40 + i * 82}
                y="225"
                fontSize="12"
                className="fill-content-muted"
              >
                {i * 10}m
              </text>
            </g>
          ))}
        </svg>
        <details className="text-xs text-content-muted my-4 mx-0">
          <summary className="cursor-pointer py-2 px-0">
            View accessible data table
          </summary>
          <table className="w-full border-collapse text-left text-sm max-[600px]:min-w-140">
            <thead>
              <tr>
                <th className="align-middle first:pl-0 last:pr-0 text-xs font-medium text-content-muted bg-surface-muted whitespace-nowrap [&_small]:block [&_small]:font-normal [&_small]:max-w-75 py-4 px-3">
                  Minute
                </th>
                <th className="align-middle first:pl-0 last:pr-0 text-xs font-medium text-content-muted bg-surface-muted whitespace-nowrap [&_small]:block [&_small]:font-normal [&_small]:max-w-75 py-4 px-3">
                  Baseline requests
                </th>
                <th className="align-middle first:pl-0 last:pr-0 text-xs font-medium text-content-muted bg-surface-muted whitespace-nowrap [&_small]:block [&_small]:font-normal [&_small]:max-w-75 py-4 px-3">
                  Scenario requests
                </th>
              </tr>
            </thead>
            <tbody className="[&_tr:hover]:bg-surface-muted">
              {r.baseline.map((v, i) => (
                <tr key={i}>
                  <th className="border-b border-solid border-b-divider align-middle first:pl-0 last:pr-0 font-medium whitespace-nowrap [&_small]:block [&_small]:font-normal [&_small]:max-w-75 py-4 px-3">
                    {i * 10}
                  </th>
                  <td className="border-b border-solid border-b-divider align-middle first:pl-0 last:pr-0 [&_small]:block [&_small]:font-normal [&_small]:max-w-75 py-4 px-3">
                    {v}
                  </td>
                  <td className="border-b border-solid border-b-divider align-middle first:pl-0 last:pr-0 [&_small]:block [&_small]:font-normal [&_small]:max-w-75 py-4 px-3">
                    {r.scenario[i]}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </details>
        <p className="leading-[1.65] text-content-muted mt-3 mb-5 mx-0">
          Started charging requests: mean wait {result.wait} minutes (
          {result.started} requests). Still waiting: {result.chargingWaiting}{" "}
          requests, reported separately. Zero-denominator metrics: N/A.
        </p>
      </section>
      <section
        data-slot="panel"
        className="bg-panel rounded-sm min-w-0 max-[600px]:rounded-xs p-5 max-[600px]:p-5"
      >
        <SectionHead title="Fixture timeline" />
        <ol className="list-none [&_li:before]:content-[''] [&_li:before]:absolute [&_li:before]:-left-1.25 [&_li:before]:top-1.75 [&_li:before]:w-2.25 [&_li:before]:h-2.25 [&_li:before]:bg-accent [&_li:before]:rounded-full [&_li:last-child]:border-l-transparent data-[compact=true]:mt-5 [&[data-compact=true]_li]:pb-3 m-0 p-0">
          <li className="relative ml-2 pt-0 pr-0 pb-5 pl-5 border-l border-solid border-l-divider text-sm">
            {time(r.captured)} · Snapshot selected
            <small className="leading-[1.6] block mt-1">
              Operational state is kept separate.
            </small>
          </li>
          <li className="relative ml-2 pt-0 pr-0 pb-5 pl-5 border-l border-solid border-l-divider text-sm">
            {time(r.captured + 10)} · Preset demand increases
            <small className="leading-[1.6] block mt-1">{result.event}</small>
          </li>
          <li className="relative ml-2 pt-0 pr-0 pb-5 pl-5 border-l border-solid border-l-divider text-sm">
            {time(r.captured + 30)} · Shared fleet imbalance
            <small className="leading-[1.6] block mt-1">
              {s.hubs.find((hub) => hub.id === result.source)?.name} has
              vehicles;{" "}
              {s.hubs.find((hub) => hub.id === result.destination)?.name} needs
              supply.
            </small>
          </li>
          <li className="relative ml-2 pt-0 pr-0 pb-5 pl-5 border-l border-solid border-l-divider text-sm">
            {time(r.captured + 60)} · Supported horizon ends
            <small className="leading-[1.6] block mt-1">
              Results loaded from a bundled fixture.
            </small>
          </li>
        </ol>
        <Alert>
          Limitations: no simulation, optimization or battery model. All five
          categories use explicitly illustrative fixture series.
        </Alert>
      </section>
    </div>
  );
}
