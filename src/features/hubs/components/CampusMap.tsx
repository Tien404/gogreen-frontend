import { config } from "@/config/app";
import { useApp } from "@/app/providers/AppContext";
import { available, freeSpaces } from "@/domain/selectors";
import { Icon } from "@/shared/components/Icon";
import { CampusMapArtwork } from "./CampusMapArtwork";

type CampusMapProps = {
  selected?: string;
  onSelect?: (id: string) => void;
  visibleIds?: string[];
};

export function CampusMap({ selected, onSelect, visibleIds }: CampusMapProps) {
  const { s, go } = useApp();

  return (
    <div className="h-90 rounded-sm relative overflow-hidden bg-[#eaf0e9] max-[600px]:h-82.5 max-[600px]:rounded-xs">
      <div className="absolute z-2 top-4 left-4 right-4 flex justify-between items-center pointer-events-none [&_>_span:first-child]:flex [&_>_span:first-child]:items-center [&_>_span:first-child]:gap-2 [&_>_span:first-child]:bg-panel [&_>_span:first-child]:rounded-xs [&_>_span:first-child]:text-xs [&_>_span:first-child]:shadow-[0_2px_8px] [&_>_span:first-child]:shadow-content/6 [&_>_span:last-child]:text-xs [&_>_span:last-child]:text-content-muted [&_>_span:last-child]:bg-panel/80 [&_>_span:last-child]:rounded-lg max-[600px]:[&_>_span:last-child]:hidden [&_>_span:first-child]:py-2 [&_>_span:first-child]:px-3 [&_>_span:last-child]:py-1 [&_>_span:last-child]:px-3">
        <span>
          <Icon name="pin" size={16} /> {config.campus}
        </span>
        <span>Schematic map</span>
      </div>
      <CampusMapArtwork />
      {s.hubs
        .filter((h) => !visibleIds || visibleIds.includes(h.id))
        .map((h) => (
          <button
            key={h.id}
            aria-label={`${h.name}, ${available(s, h.id).length} vehicles, ${freeSpaces(s, h.id)} spaces available`}
            data-selected={selected === h.id}
            className="absolute -translate-x-1/2 -translate-y-1/2 bg-panel flex gap-2 items-center pr-3 pl-2 rounded-xs shadow-[0_4px_10px] shadow-content/6 z-3 text-left whitespace-nowrap motion-safe:hover:-translate-y-[calc(50%+var(--spacing-1))] data-[selected=true]:bg-soft data-[selected=true]:text-accent active:-translate-x-1/2! active:translate-y-[-49%]! max-[900px]:gap-2 max-[600px]:flex max-[600px]:flex-col max-[600px]:gap-1 max-[600px]:min-w-23 max-[600px]:text-center max-[600px]:shadow-[0_2px_6px] max-[600px]:shadow-content/6 max-[600px]:nth-of-type-2:left-[58%]! max-[600px]:nth-of-type-3:left-[78%]! max-[600px]:nth-of-type-3:top-[66%]! py-2 max-[900px]:p-2 max-[600px]:py-2 max-[600px]:px-1"
            style={{ left: `${h.x}%`, top: `${h.y}%` }}
            onClick={() =>
              onSelect ? onSelect(h.id) : go(`/${s.role}/hubs/${h.id}`)
            }
          >
            <span className="h-8 w-8 bg-accent text-on-dark grid place-items-center rounded-xs max-[600px]:w-[28px] max-[600px]:h-[28px] max-[600px]:rounded-xs">
              <Icon name="bike" size={18} />
            </span>
            <span>
              <strong className="text-xs block leading-4.5 max-[900px]:text-xs max-[600px]:text-xs">
                {h.name}
              </strong>
              <small className="text-xs block leading-4.5 max-[900px]:text-xs max-[600px]:hidden">
                {available(s, h.id).length} vehicles{" "}
                <span className="my-0 mx-1">·</span> {freeSpaces(s, h.id)}{" "}
                spaces
              </small>
            </span>
          </button>
        ))}
      <div className="absolute bottom-3 left-4 right-4 flex justify-between gap-2 text-xs text-content-muted items-center [&_>_span:first-child]:flex [&_>_span:first-child]:items-center [&_>_span:first-child]:gap-2 [&_>_span:first-child]:bg-panel/80 [&_>_span:first-child]:rounded-xs max-[600px]:[&_>_span:last-child]:hidden [&_>_span:first-child]:py-1 [&_>_span:first-child]:px-2">
        <span>
          <i className="w-1.5 h-1.5 inline-block rounded-lg bg-accent" /> Hub
          available
        </span>
        <span>Illustrative locations · use hub list for details</span>
      </div>
      <div
        className="flex items-center gap-1 absolute right-5 bottom-6 text-sm text-content-muted font-semibold"
        aria-hidden="true"
      >
        N <Icon name="arrow-up" size={16} />
      </div>
    </div>
  );
}
