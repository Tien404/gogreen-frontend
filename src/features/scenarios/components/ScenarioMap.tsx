import type { State } from "@/domain/types";
import {
  CampusMap,
  type MapIndicator,
  type CampusMapView,
} from "@/features/hubs/components/CampusMap";
import { hubLocation } from "@/features/hubs/hubMap";
import { dispatchAdviceUrl, metricLabel } from "@/integration/operatorRecords";
import type { Schemas } from "@/shared/api/contract.generated";
import { Icon } from "@/shared/components/Icon";
import { coordinates } from "@/shared/lib/coordinates";
import { Button, Link, Panel, SectionHead } from "@/shared/ui";
import { useState } from "react";

const scenarioIndicators = {
  RENTAL_DEMAND_SURGE: {
    metric: "unmet_rental_demand",
    symbol: "bike",
    caution: (n: number) => n > 0,
  },
  PARKING_CAPACITY: {
    metric: "parking_bookable_at_end",
    symbol: "parking",
    caution: (n: number) => n === 0,
  },
  CHARGING_DEMAND_SURGE: {
    metric: "charges_not_completed_at_horizon",
    symbol: "bolt",
    caution: (n: number) => n > 0,
  },
  CHARGER_FAULT: {
    metric: "charging_capacity",
    symbol: "bolt",
    caution: (n: number, before: number) => n < before,
  },
  FLEET_IMBALANCE: {
    metric: "available_vehicles_at_start",
    symbol: "bike",
    caution: (n: number) => n === 0,
  },
} as const;

type Run = Schemas["SimulationRunOut"];
const views = ["baseline", "scenario"] as const;
type Phase = (typeof views)[number];
const phases = { baseline: "Baseline", scenario: "Scenario" };

export function ScenarioMap({ run, s }: { run: Run; s: State }) {
  const [view, setView] = useState<CampusMapView>();
  const [selectedId, selectHub] = useState(run.hub_id);
  const saved = run.hub_context ?? [];
  const savedById = new Map(saved.map((hub) => [hub.hub_id, hub]));
  const transfers = run.recommendations.flatMap((item) => {
    const url = dispatchAdviceUrl(item);
    return url && item.from_hub_id && item.to_hub_id
      ? [
          {
            from: item.from_hub_id,
            to: item.to_hub_id,
            url,
            vehicle: item.vehicle_id,
          },
        ]
      : [];
  });
  const ids = new Set([
    ...(saved.length
      ? saved.map((hub) => hub.hub_id)
      : s.hubs.map((hub) => hub.id)),
    run.hub_id,
    ...transfers.flatMap(({ from, to }) => [from, to]),
  ]);
  const hubs = Array.from(ids, (id) => {
    const snapshot = savedById.get(id);
    const geography = s.hubs.find((hub) => hub.id === id);
    return {
      id,
      name: snapshot?.name ?? geography?.name ?? id,
      coordinates: snapshot
        ? coordinates(snapshot.latitude, snapshot.longitude)
        : geography?.coordinates,
      availableVehicles: snapshot?.eligible_rentals ?? 0,
      parkingAvailable: snapshot?.bookable_spaces ?? 0,
      availablePoints: snapshot?.working_points ?? 0,
    };
  });
  const name = (id: string) => hubs.find((hub) => hub.id === id)?.name ?? id;
  const locatedIds = new Set(
    hubs.filter((hub) => hubLocation(hub)).map((hub) => hub.id),
  );
  const visibleConnections = transfers.filter(
    ({ from, to }) => locatedIds.has(from) && locatedIds.has(to),
  );
  const style = scenarioIndicators[run.scenario_type];
  const snapshotIndicator = {
    bike: { field: "eligible_rentals", label: "Eligible rentals" },
    parking: { field: "bookable_spaces", label: "Bookable spaces" },
    bolt: { field: "working_points", label: "Working points" },
  } as const;
  const context = snapshotIndicator[style.symbol];
  const metric = run.metrics.find((item) => item.name === style.metric);
  const indicators = (phase: Phase) =>
    new Map(
      hubs.map((hub): [string, MapIndicator] => {
        if (hub.id === run.hub_id && metric) {
          const value = metric[phase];
          const warning =
            phase === "scenario" && style.caution(value, metric.baseline);
          return [
            hub.id,
            {
              label:
                phases[phase] +
                ": " +
                metricLabel(metric.name) +
                ", " +
                value +
                " " +
                metric.unit,
              value,
              symbol: warning ? "alert" : style.symbol,
              tone: warning ? "warning" : "affected",
            },
          ];
        }
        const snapshot = savedById.get(hub.id);
        return [
          hub.id,
          {
            label: snapshot
              ? snapshot[context.field] +
                " " +
                context.label.toLowerCase() +
                " at snapshot"
              : "Snapshot counts unavailable",
            value: snapshot?.[context.field] ?? "—",
            symbol:
              snapshot?.status && snapshot.status !== "ACTIVE"
                ? "alert"
                : style.symbol,
            tone: "neutral",
          },
        ];
      }),
    );

  const snapshotHub = savedById.get(selectedId);
  const selectedMetric = selectedId === run.hub_id ? metric : undefined;

  return (
    <Panel data-slot="panel" className="my-5 min-w-0">
      <SectionHead title="Hub impact map" />
      <div className="min-w-0">
        <div className="min-w-0">
          {locatedIds.size > 0 ? (
            <div className="grid min-w-0 gap-4 min-[850px]:grid-cols-2">
              {views.map((phase) => (
                <div
                  key={phase}
                  className="min-w-0 overflow-hidden rounded-xl border border-divider"
                >
                  <h3 className="border-b border-divider bg-surface-muted px-4 py-3 text-base font-semibold">
                    {phases[phase]}
                  </h3>
                  <CampusMap
                    label={phases[phase] + " Hub map"}
                    hubs={hubs}
                    indicators={indicators(phase)}
                    connections={
                      phase === "scenario" ? visibleConnections : undefined
                    }
                    selected={selectedId}
                    onSelect={selectHub}
                    showVehicleAvailability={false}
                    view={view}
                    onViewChange={setView}
                  />
                </div>
              ))}
            </div>
          ) : (
            <p className="rounded-lg bg-surface-muted p-4 text-sm text-content-muted">
              Hub coordinates are unavailable for this run. You can still review
              the Hub details.
            </p>
          )}
          <ul
            aria-label="Map legend"
            className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm text-content-muted"
          >
            <li className="inline-flex items-center gap-1.5">
              <Icon name={style.symbol} size={16} /> {context.label} at snapshot
            </li>
            <li className="inline-flex items-center gap-1.5">
              <span
                aria-hidden="true"
                className="inline-block size-4 rounded bg-primary"
              />{" "}
              Modeled Hub
            </li>
            <li className="inline-flex items-center gap-1.5">
              <Icon name="alert" size={16} /> Capacity or demand warning
            </li>
            {hubs.some((hub) => hubLocation(hub)?.demo) && (
              <li className="inline-flex items-center gap-1.5">
                <Icon name="pin" size={16} /> Includes demo Hub locations
              </li>
            )}
            {visibleConnections.length > 0 && (
              <li className="inline-flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className="w-6 border-t-2 border-dashed border-primary"
                />{" "}
                Proposed move
              </li>
            )}
          </ul>
        </div>
        <div className="mt-4 grid min-w-0 items-start gap-4 rounded-xl border border-divider bg-surface-muted p-4 min-[800px]:grid-cols-[minmax(200px,1fr)_minmax(0,2fr)]">
          <div className="min-w-0">
            <h3 className="px-1 text-sm font-semibold text-content-muted">
              Campus Hubs
            </h3>
            <div
              className="mt-2 grid gap-1"
              role="group"
              aria-label="Select a Hub"
            >
              {hubs.map(({ id, name: hubName }) => (
                <Button
                  key={id}
                  variant="ghost"
                  aria-pressed={selectedId === id}
                  onClick={() => selectHub(id)}
                  className="h-auto min-h-11 justify-start gap-2 whitespace-normal px-3 text-left text-content-muted hover:bg-panel/70 hover:text-content aria-pressed:bg-panel aria-pressed:text-primary aria-pressed:font-semibold"
                >
                  <Icon
                    name={id === run.hub_id ? style.symbol : "pin"}
                    size={17}
                  />
                  <span className="flex-1 wrap-anywhere">{hubName}</span>
                  {!locatedIds.has(id) && (
                    <span className="rounded-full bg-panel px-2 py-0.5 text-xs font-medium text-content-muted">
                      Unmapped
                    </span>
                  )}
                  {id === run.hub_id && (
                    <span className="rounded-full bg-green-muted px-2 py-0.5 text-xs font-medium text-primary">
                      Modeled
                    </span>
                  )}
                </Button>
              ))}
            </div>
          </div>
          <div
            className="rounded-lg border border-divider bg-panel p-4"
            aria-live="polite"
          >
            <h3 className="text-base font-semibold wrap-anywhere">
              {name(selectedId)}
            </h3>
            {selectedMetric && (
              <div className="mt-3 border-b border-divider pb-3 text-sm">
                <p className="font-medium text-content-muted">
                  {metricLabel(selectedMetric.name)} · {selectedMetric.unit}
                </p>
                <dl className="mt-2 grid grid-cols-2 gap-3">
                  {views.map((phase) => (
                    <div key={phase}>
                      <dt className="text-xs text-content-muted">
                        {phases[phase]}
                      </dt>
                      <dd className="text-xl font-semibold tabular-nums">
                        {selectedMetric[phase]}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}
            {snapshotHub ? (
              <>
                <p className="mb-2 mt-3 text-sm text-content-muted">
                  At snapshot{" "}
                  {snapshotHub.status === "ACTIVE"
                    ? "· Active Hub"
                    : snapshotHub.status
                      ? "· Unavailable Hub"
                      : ""}
                </p>
                <dl className="grid gap-2 text-sm">
                  {[
                    [
                      "bike",
                      "Eligible rental vehicles",
                      snapshotHub.eligible_rentals,
                    ],
                    [
                      "parking",
                      "Bookable parking spaces",
                      snapshotHub.bookable_spaces,
                    ],
                    [
                      "bolt",
                      "Working charging points",
                      snapshotHub.working_points,
                    ],
                  ].map(([icon, label, value]) => (
                    <div key={label} className="flex justify-between gap-3">
                      <dt className="inline-flex items-center gap-2 text-content-muted">
                        <Icon name={String(icon)} size={16} />
                        {label}
                      </dt>
                      <dd className="font-semibold tabular-nums">{value}</dd>
                    </div>
                  ))}
                </dl>
              </>
            ) : (
              <p className="mt-2 text-sm text-content-muted">
                This run has no saved resource counts for this Hub.
              </p>
            )}
          </div>
        </div>
      </div>
      {transfers.length > 0 && (
        <ul
          aria-label="Proposed vehicle moves"
          className="mt-4 divide-y divide-divider border-t border-divider"
        >
          {transfers.map(({ from, to, url, vehicle }) => (
            <li
              key={url}
              className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 py-2 text-sm"
            >
              <span className="inline-flex min-w-0 items-center gap-2 wrap-anywhere">
                <Icon name="dispatch" size={18} />
                <span>
                  <strong>
                    {name(from)} → {name(to)}
                  </strong>{" "}
                  · {vehicle}
                </span>
              </span>
              <Link
                data-slot="text-link"
                to={url}
                className="inline-flex min-h-11 items-center gap-2 font-semibold text-primary hover:underline"
              >
                Review move <Icon name="arrow" size={16} />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}
