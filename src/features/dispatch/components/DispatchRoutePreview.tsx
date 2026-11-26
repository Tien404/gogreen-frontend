import type { Hub } from "@/domain/types";
import {
  CampusMap,
  type MapIndicator,
} from "@/features/hubs/components/CampusMap";
import { hubLocation } from "@/features/hubs/hubMap";
import { useEffect, useRef } from "react";

export function DispatchRoutePreview({
  source,
  destination,
  vehicles,
  focusOnMount = false,
}: {
  source: Hub | undefined;
  destination: Hub | undefined;
  vehicles: string[];
  focusOnMount?: boolean;
}) {
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (focusOnMount) heading.current?.focus();
  }, [focusOnMount]);

  const start = source && hubLocation(source);
  const end = destination && hubLocation(destination);
  const canDraw = Boolean(
    start &&
    end &&
    (start.position[0] !== end.position[0] ||
      start.position[1] !== end.position[1]),
  );
  const hubs = [source, destination].flatMap((hub) =>
    hub
      ? [
          {
            id: hub.id,
            name: hub.name,
            coordinates: hub.coordinates,
            availableVehicles: hub.live?.availableVehicles ?? 0,
            parkingAvailable: hub.live?.bookable ?? 0,
            availablePoints: hub.live?.availablePoints ?? 0,
          },
        ]
      : [],
  );
  const indicators = new Map<string, MapIndicator>();
  if (source)
    indicators.set(source.id, {
      label:
        vehicles.length === 0
          ? "Source"
          : vehicles.length === 1
            ? `Source: ${vehicles[0]}`
            : `Source: ${vehicles.length} vehicles`,
      value: String(vehicles.length),
      symbol: "bike",
      tone: "affected",
    });
  if (destination)
    indicators.set(destination.id, {
      label: "Destination",
      value: "P",
      symbol: "parking",
      tone: "neutral",
    });

  return (
    <section aria-labelledby="dispatch-preview-title" className="mb-4 min-w-0">
      <h3
        id="dispatch-preview-title"
        tabIndex={-1}
        ref={heading}
        className="text-base font-semibold"
      >
        Dispatch preview
      </h3>
      {focusOnMount && (
        <p className="mt-1 wrap-anywhere text-sm text-content-muted">
          {source?.name} → {destination?.name} · {vehicles.join(", ")}
        </p>
      )}
      {canDraw ? (
        <div className="dispatch-route-map mt-3 overflow-hidden rounded-xl border border-divider">
          <CampusMap
            label="Proposed dispatch route"
            hubs={hubs}
            indicators={indicators}
            connections={
              source && destination
                ? [{ from: source.id, to: destination.id, animate: true }]
                : undefined
            }
            showVehicleAvailability={false}
            showControl={false}
          />
        </div>
      ) : (
        <p className="mt-3 rounded-lg bg-surface-muted p-3 text-sm text-content-muted">
          {source?.id === destination?.id && source
            ? "Choose different source and destination hubs."
            : start && end
              ? "Both hubs share the same map location."
              : "Map coordinates are unavailable for one or both hubs."}
        </p>
      )}
    </section>
  );
}
