import { config } from "@/config/app";
import { mapTiles } from "@/config/map";
import { useApp } from "@/app/providers/AppContext";
import { Icon } from "@/shared/components/Icon";
import type { Coordinates } from "@/shared/lib/coordinates";
import { Button, Link } from "@/shared/ui";
import { useEffect, useRef, useState } from "react";
import type {
  FitBoundsOptions,
  LayerGroup,
  Map as LeafletMap,
  Marker,
  TileLayer,
} from "leaflet";
import type { HubResources } from "../hubResources";
import { campusCenter, hubLocation } from "../hubMap";
import "leaflet/dist/leaflet.css";
import "./campus-map.css";

type CampusMapHub = Pick<
  HubResources,
  | "id"
  | "name"
  | "coordinates"
  | "availableVehicles"
  | "parkingAvailable"
  | "availablePoints"
>;

export type MapIndicator = {
  label: string;
  value: number | string;
  symbol: "bike" | "parking" | "bolt" | "alert";
  tone: "neutral" | "affected" | "warning";
};

type MapConnection = { from: string; to: string; animate?: boolean };

export type CampusMapView = { center: Coordinates; zoom: number };

type CampusMapProps = {
  selected?: string;
  onSelect?: (id: string) => void;
  hubs?: CampusMapHub[];
  indicators?: ReadonlyMap<string, MapIndicator>;
  connections?: MapConnection[];
  label?: string;
  view?: CampusMapView;
  onViewChange?: (view: CampusMapView) => void;
  directory?: boolean;
  journey?: boolean;
  focusHub?: string;
  destinationHub?: string;
  showVehicleAvailability?: boolean;
  availabilityMode?: "all" | "vehicles" | "parking" | "charging";
  markerSelection?: boolean;
  showControl?: boolean;
};
type Runtime = {
  L: typeof import("leaflet");
  map: LeafletMap;
  tiles: TileLayer;
  markers: Map<string, { marker: Marker; label: string }>;
  routes: Map<string, LayerGroup>;
};
type TileStatus = "loading" | "ready" | "error" | "unavailable";
const journeyPadding: FitBoundsOptions = {
  paddingTopLeft: [30, 100],
  paddingBottomRight: [46, 38],
};
const directoryPadding: FitBoundsOptions = { padding: [45, 45] };

export function CampusMap({
  selected,
  onSelect,
  hubs,
  directory,
  indicators,
  connections,
  label = "Campus hub map",
  view,
  onViewChange,
  journey,
  focusHub,
  destinationHub,
  showVehicleAvailability = true,
  availabilityMode = "all",
  markerSelection = true,
  showControl = true,
}: CampusMapProps) {
  const { s } = useApp();
  const impact = Boolean(indicators);
  const canvas = useRef<HTMLDivElement>(null);
  const fittedBounds = useRef("");
  const applyingView = useRef(false);
  const [runtime, setRuntime] = useState<Runtime | null>(null);
  const [status, setStatus] = useState<TileStatus>("loading");
  const [localSelected, setLocalSelected] = useState("");
  const displayHubs =
    hubs ??
    s.hubs.map((hub) => ({
      id: hub.id,
      name: hub.name,
      coordinates: hub.coordinates,
      availableVehicles: hub.live?.availableVehicles ?? 0,
      parkingAvailable: hub.live?.bookable ?? 0,
      availablePoints: hub.live?.availablePoints ?? 0,
    }));
  const located = displayHubs.flatMap((hub) => {
    const location = hubLocation(hub);
    return location ? [{ ...hub, ...location }] : [];
  });
  const selectedId = selected ?? localSelected;
  const active = located.find((hub) => hub.id === selectedId);
  const focusIds = [focusHub, destinationHub].filter(Boolean);

  useEffect(() => {
    let disposed = false;
    let instance: LeafletMap | undefined;
    let observer: ResizeObserver | undefined;
    void import("leaflet")
      .then((L) => {
        if (disposed || !canvas.current) return;
        const reducedMotion = window.matchMedia(
          "(prefers-reduced-motion: reduce)",
        ).matches;
        const map = L.map(canvas.current, {
          center: [...campusCenter],
          zoom: 14,
          minZoom: 12,
          maxZoom: 19,
          scrollWheelZoom: false,
          zoomControl: false,
          zoomAnimation: !reducedMotion,
          fadeAnimation: !reducedMotion,
          markerZoomAnimation: !reducedMotion,
        });
        instance = map;
        L.control.zoom({ position: "bottomright" }).addTo(map);
        let failed = false;
        const tiles = L.tileLayer(mapTiles.url, {
          maxZoom: 19,
          attribution: mapTiles.attribution,
        });
        tiles.on("loading", () => {
          failed = false;
          setStatus("loading");
        });
        tiles.on("tileerror", () => {
          failed = true;
          setStatus("error");
        });
        tiles.on("load", () => setStatus(failed ? "error" : "ready"));
        tiles.addTo(map);
        const markers: Runtime["markers"] = new Map();
        let width = map.getSize().x;
        observer = new ResizeObserver(([entry]) => {
          const nextWidth = entry.contentRect.width;
          map.invalidateSize({ pan: false });
          if (impact && nextWidth !== width && markers.size) {
            const bounds = L.latLngBounds(
              Array.from(markers.values(), ({ marker }) => marker.getLatLng()),
            );
            map.fitBounds(bounds, {
              ...directoryPadding,
              maxZoom: 16,
              animate: false,
            });
          }
          width = nextWidth;
        });
        observer.observe(canvas.current);
        fittedBounds.current = "";
        setRuntime({ L, map, tiles, markers, routes: new Map() });
      })
      .catch(() => {
        if (!disposed) setStatus("unavailable");
      });
    return () => {
      disposed = true;
      observer?.disconnect();
      instance?.remove();
    };
  }, [impact]);

  useEffect(() => {
    if (!runtime) return;
    const { L, map, markers } = runtime;
    const ids = new Set(located.map((hub) => hub.id));
    for (const [id, entry] of markers) {
      if (!ids.has(id)) {
        entry.marker.remove();
        markers.delete(id);
      }
    }
    for (const hub of located) {
      const indicator = indicators?.get(hub.id);
      const modeValue =
        availabilityMode === "parking"
          ? hub.parkingAvailable
          : availabilityMode === "charging"
            ? hub.availablePoints
            : hub.availableVehicles;
      const modeSymbol =
        availabilityMode === "parking"
          ? "parking"
          : availabilityMode === "charging"
            ? "bolt"
            : "bike";
      const label = indicator
        ? hub.name + ", " + indicator.label
        : showVehicleAvailability
          ? `${hub.name}, ${hub.availableVehicles} vehicles, ${hub.parkingAvailable} parking spaces, ${hub.availablePoints} charging points`
          : hub.name;
      let entry = markers.get(hub.id);
      const signature = indicator ? JSON.stringify(indicator) + label : label;
      if (!entry || entry.label !== signature) {
        const content = document.createElement("span");
        content.className = "campus-hub-pin";
        const logo = document.createElement("span");
        logo.className = "campus-hub-logo";
        if (indicator) {
          content.dataset.tone = indicator.tone;
          logo.dataset.symbol = indicator.symbol;
        } else if (showVehicleAvailability && availabilityMode !== "all") {
          logo.dataset.symbol = modeSymbol;
        }
        logo.setAttribute("aria-hidden", "true");
        content.append(logo);
        if (
          indicator ||
          (showVehicleAvailability && availabilityMode !== "all")
        ) {
          const count = document.createElement("span");
          count.className = "campus-hub-count";
          count.textContent = String(indicator?.value ?? modeValue);
          content.append(count);
        }
        let htmlEl: HTMLElement = content;
        let iconSize: [number, number] = [44, 48];
        let iconAnchor: [number, number] = [22, 48];
        if (
          !indicator &&
          showVehicleAvailability &&
          availabilityMode === "all"
        ) {
          const wrapper = document.createElement("span");
          wrapper.className = "campus-hub-stack";
          wrapper.append(content);
          const stats = document.createElement("span");
          stats.className = "campus-hub-stats";
          stats.setAttribute("aria-hidden", "true");
          for (const [sym, val] of [
            ["bike", hub.availableVehicles],
            ["parking", hub.parkingAvailable],
            ["bolt", hub.availablePoints],
          ] as const) {
            const item = document.createElement("span");
            item.className = "campus-hub-stat";
            const symEl = document.createElement("span");
            symEl.className = "campus-hub-stat-icon";
            symEl.dataset.symbol = sym;
            item.append(symEl, document.createTextNode(String(val)));
            stats.append(item);
          }
          wrapper.append(stats);
          htmlEl = wrapper;
          iconSize = [86, 48];
          iconAnchor = [22, 44];
        }
        const icon = L.divIcon({
          className: "campus-hub-marker",
          html: htmlEl,
          iconSize,
          iconAnchor,
          tooltipAnchor: [0, -44],
        });
        if (entry) entry.marker.setIcon(icon);
        else {
          entry = {
            marker: L.marker([...hub.position], {
              icon,
              title: hub.name,
              keyboard: markerSelection,
              interactive: markerSelection,
            }).addTo(map),
            label,
          };
          markers.set(hub.id, entry);
        }
        entry.label = signature;
        const tooltip = document.createElement("span");
        tooltip.textContent =
          showVehicleAvailability && !indicator
            ? `${hub.name} · ${hub.availableVehicles} vehicles · ${hub.parkingAvailable} parking spaces · ${hub.availablePoints} charging points`
            : hub.name;
        entry.marker.unbindTooltip().bindTooltip(tooltip, {
          direction: "top",
          className: "campus-hub-tooltip",
        });
      }
      entry.marker.setLatLng([...hub.position]);
      if (markerSelection) {
        entry.marker.off("click").on("click", () => {
          if (onSelect) onSelect(hub.id);
          else setLocalSelected(hub.id);
        });
      }
      const element = entry.marker.getElement();
      const marker = entry.marker;
      if (element && markerSelection)
        element.onkeydown = (event) => {
          if (event.key === " ") {
            event.preventDefault();
            marker.fire("click");
          }
        };
      element?.setAttribute("aria-label", label);
      if (markerSelection)
        element?.setAttribute("aria-pressed", String(hub.id === selectedId));
      const focused = focusIds.includes(hub.id);
      element?.toggleAttribute("data-journey-focus", focused);
      entry.marker.setZIndexOffset(hub.id === selectedId || focused ? 1000 : 0);
    }
    // Polling refreshes marker data without resetting the user's pan/zoom.
    const focus = located.filter((hub) => focusIds.includes(hub.id));
    const bounds = focus.length ? focus : located;
    const boundsKey = bounds
      .map((hub) => `${hub.id}:${hub.position.join(",")}`)
      .sort()
      .join(";");
    if (boundsKey !== fittedBounds.current && bounds.length) {
      map.fitBounds(L.latLngBounds(bounds.map((hub) => [...hub.position])), {
        ...(journey ? journeyPadding : directoryPadding),
        maxZoom: focus.length === 1 ? 15 : 16,
        animate: false,
      });
      fittedBounds.current = boundsKey;
    }
  }, [
    runtime,
    located,
    onSelect,
    selectedId,
    focusIds,
    availabilityMode,
    showVehicleAvailability,
    markerSelection,
    indicators,
    journey,
  ]);

  useEffect(() => {
    if (!runtime || !onViewChange) return;
    const { map } = runtime;
    function reportView() {
      if (applyingView.current) return;
      const center = map.getCenter();
      onViewChange?.({ center: [center.lat, center.lng], zoom: map.getZoom() });
    }
    map.on("moveend", reportView);
    return () => {
      map.off("moveend", reportView);
    };
  }, [onViewChange, runtime]);

  useEffect(() => {
    if (!runtime || !view) return;
    const { map } = runtime;
    const center = map.getCenter();
    if (
      map.getZoom() === view.zoom &&
      Math.abs(center.lat - view.center[0]) < 0.000001 &&
      Math.abs(center.lng - view.center[1]) < 0.000001
    )
      return;
    applyingView.current = true;
    map.setView([...view.center], view.zoom, { animate: false });
    applyingView.current = false;
  }, [runtime, view]);

  useEffect(() => {
    if (!runtime) return;
    const { L, map, routes } = runtime;
    const positions = new Map(located.map((hub) => [hub.id, hub.position]));
    const activeRoutes = new Set<string>();
    for (const { from, to, animate } of connections ?? []) {
      const start = positions.get(from);
      const end = positions.get(to);
      if (!start || !end) continue;
      const samePoint = start[0] === end[0] && start[1] === end[1];
      const key = JSON.stringify([from, to, start, end, Boolean(animate)]);
      activeRoutes.add(key);
      if (routes.has(key)) continue;
      const layer = L.layerGroup().addTo(map);
      routes.set(key, layer);
      if (samePoint) {
        L.circleMarker([...start], {
          radius: 26,
          className: animate
            ? "campus-map-transfer campus-map-transfer-animated"
            : "campus-map-transfer",
          dashArray: "6 5",
          weight: 3,
          fillOpacity: 0.08,
          interactive: false,
        }).addTo(layer);
        continue;
      }
      L.polyline([[...start], [...end]], {
        className: animate
          ? "campus-map-transfer campus-map-transfer-animated"
          : "campus-map-transfer",
        dashArray: "7 7",
        weight: 4,
        opacity: 1,
        interactive: false,
      }).addTo(layer);
    }
    for (const [key, layer] of routes) {
      if (activeRoutes.has(key)) continue;
      layer.remove();
      routes.delete(key);
    }
  }, [connections, located, runtime]);

  const showAll = () => {
    if (!runtime || !located.length) return;
    runtime.map.fitBounds(
      runtime.L.latLngBounds(located.map((hub) => [...hub.position])),
      {
        ...(journey ? journeyPadding : directoryPadding),
        maxZoom: 16,
        animate: false,
      },
    );
  };
  const retry = () => {
    if (status === "unavailable") {
      window.location.reload();
      return;
    }
    setStatus("loading");
    runtime?.tiles.redraw();
  };

  return (
    <section
      className="campus-map"
      data-directory={directory || undefined}
      data-impact={impact || undefined}
      data-journey={journey || undefined}
      aria-label={label}
    >
      <div className="campus-map-heading">
        <div>
          <Icon name="pin" size={16} />
          <span title={journey || impact ? config.campus : undefined}>
            {journey || impact ? "Campus map" : config.campus}
          </span>
        </div>
        {showControl && (
          <Button
            variant="secondary"
            size="sm"
            className="ml-auto shrink-0 text-content-muted"
            onClick={showAll}
            disabled={!runtime || !located.length}
          >
            <Icon name="focus" size={16} />
            Focus hubs
          </Button>
        )}
      </div>
      <div
        ref={canvas}
        className="campus-map-canvas"
        role="region"
        aria-label="Interactive campus map. Use arrow keys to pan and plus or minus to zoom."
      />
      {focusHub && destinationHub && focusHub === destinationHub && (
        <p className="campus-map-demo" role="status">
          Same hub · Round trip
        </p>
      )}
      {/* {status === "loading" && (
        <p className="campus-map-status" role="status">
          Loading map…
        </p>
      )} */}
      {(status === "error" || status === "unavailable") && (
        <div className="campus-map-status campus-map-error" role="status">
          <span>
            Map{" "}
            {status === "unavailable"
              ? "could not start"
              : "tiles could not load"}
            .{" "}
            {journey
              ? "You can still use the controls below."
              : "Hub data is still available in the list."}
          </span>
          <Button variant="ghost" size="sm" onClick={retry}>
            Retry map
          </Button>
        </div>
      )}
      {active && markerSelection && !indicators && (!journey || !onSelect) && (
        <div className="campus-map-selection" aria-live="polite">
          <div>
            <strong>{active.name}</strong>
            <p>
              {showVehicleAvailability
                ? active.availableVehicles + " vehicles · "
                : ""}
              {active.parkingAvailable} parking spaces ·{" "}
              {active.availablePoints} charging points available
            </p>
          </div>
          <Link
            className="campus-map-detail"
            to={`/${s.role}/hubs/${encodeURIComponent(active.id)}`}
          >
            View hub <Icon name="arrow" size={16} />
          </Link>
        </div>
      )}
    </section>
  );
}
