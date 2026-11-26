import { CampusMap } from "@/features/hubs/components/CampusMap";
import {
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent,
  type ReactNode,
} from "react";

const minSheetHeight = 144;

export function StudentJourney({
  children,
  hub,
  destination,
  onHubSelect,
  selectedHub = hub,
  mapSelection = true,
  home = false,
  active = false,
  availabilityMode,
  step,
}: {
  children: ReactNode;
  hub?: string;
  destination?: string;
  selectedHub?: string;
  onHubSelect?: (id: string) => void;
  mapSelection?: boolean;
  home?: boolean;
  active?: boolean;
  availabilityMode?: "all" | "vehicles" | "parking" | "charging";
  step?: string;
}) {
  const [height, setHeight] = useState<number>();
  const [contentHeight, setContentHeight] = useState<number>();
  const [dragging, setDragging] = useState(false);
  const drag = useRef<{ pointerId: number; y: number; height: number } | null>(
    null,
  );
  const suppressClick = useRef(false);
  const sheetRef = useRef<HTMLElement>(null);
  const handleRef = useRef<HTMLButtonElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const handle = handleRef.current;
    const content = contentRef.current;
    if (!handle || !content) return;

    const measure = () => {
      const next = Math.ceil(
        handle.getBoundingClientRect().height +
          content.getBoundingClientRect().height,
      );
      setContentHeight(next);
    };

    if (step !== undefined && scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(handle);
    observer.observe(content);
    return () => observer.disconnect();
  }, [step]);

  function maxHeight() {
    return sheetRef.current
      ? parseFloat(getComputedStyle(sheetRef.current).maxHeight)
      : minSheetHeight;
  }

  function resize(next: number, limit = maxHeight()) {
    setHeight(Math.min(limit, Math.max(minSheetHeight, next)));
  }

  function handlePointerDown(event: PointerEvent<HTMLButtonElement>) {
    if (!event.isPrimary || event.button !== 0 || !sheetRef.current) return;
    suppressClick.current = false;
    drag.current = {
      pointerId: event.pointerId,
      y: event.clientY,
      height: sheetRef.current.offsetHeight,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handlePointerMove(event: PointerEvent<HTMLButtonElement>) {
    const start = drag.current;
    if (!start || event.pointerId !== start.pointerId) return;
    const delta = start.y - event.clientY;
    if (!suppressClick.current && Math.abs(delta) < 4) return;
    suppressClick.current = true;
    setDragging(true);
    resize(start.height + delta);
  }

  function endDrag() {
    drag.current = null;
    setDragging(false);
  }

  return (
    <div className="student-journey" data-home={home} data-active={active}>
      <div className="student-journey-map">
        <CampusMap
          journey
          selected={onHubSelect ? selectedHub : undefined}
          onSelect={onHubSelect}
          markerSelection={mapSelection}
          focusHub={hub}
          destinationHub={destination}
          connections={
            hub && destination
              ? [{ from: hub, to: destination, animate: true }]
              : undefined
          }
          showVehicleAvailability
          availabilityMode={availabilityMode ?? (home ? "all" : "vehicles")}
        />
      </div>
      <section
        ref={sheetRef}
        className="student-journey-sheet"
        data-stepped={step !== undefined || undefined}
        data-dragging={dragging || undefined}
        style={
          {
            "--student-sheet-height":
              height === undefined ? undefined : height + "px",
            "--student-sheet-content-height":
              contentHeight === undefined ? undefined : contentHeight + "px",
          } as CSSProperties
        }
        aria-label={home ? "Campus services and current activity" : undefined}
      >
        <button
          ref={handleRef}
          type="button"
          className="student-sheet-handle"
          aria-label="Drag or tap to resize panel"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onLostPointerCapture={endDrag}
          onClick={(event) => {
            if (suppressClick.current && event.detail > 0) {
              suppressClick.current = false;
              return;
            }
            const limit = maxHeight();
            const current = sheetRef.current?.offsetHeight ?? 0;
            resize(current >= limit - 1 ? limit * 0.65 : limit, limit);
          }}
          onKeyDown={(event) => {
            if (event.key !== "ArrowUp" && event.key !== "ArrowDown") return;
            event.preventDefault();
            resize(
              (sheetRef.current?.offsetHeight ?? 0) +
                (event.key === "ArrowUp" ? 48 : -48),
            );
          }}
        >
          <span aria-hidden="true" />
        </button>
        <div ref={scrollRef} className="student-sheet-content">
          <div ref={contentRef} className="student-sheet-body">
            {children}
          </div>
        </div>
      </section>
    </div>
  );
}
