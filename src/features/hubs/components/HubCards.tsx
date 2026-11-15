import { useApp } from "@/app/providers/AppContext";
import { available, freeSpaces, pointFree } from "@/domain/selectors";
import { Icon } from "@/shared/components/Icon";
import { time } from "@/shared/lib/time";
import { Badge, Link } from "@/shared/ui";

type HubCardsProps = { limit?: number };

export function HubCards({ limit = 4 }: HubCardsProps) {
  const { s } = useApp();

  return (
    <div className="grid grid-cols-4 gap-4 max-[1200px]:grid-cols-2 max-[600px]:grid-cols-1">
      {s.hubs.slice(0, limit).map((h, i) => (
        <Link
          to={`/${s.role}/hubs/${h.id}`}
          className="rounded-xs bg-panel block min-w-0 motion-safe:hover:-translate-y-1 hover:shadow-control hover:text-content p-5 max-[600px]:p-5"
          key={h.id}
        >
          <div className="flex justify-between items-center mb-5 gap-2 max-[600px]:mb-3">
            <span
              data-index={i}
              className="w-9 h-9 rounded-xs bg-soft text-accent grid place-items-center text-xs font-semibold data-[index='1']:bg-[#f0eef7] data-[index='1']:text-[#74628c] data-[index='2']:bg-[#edf2f8] data-[index='2']:text-[#507491] data-[index='3']:bg-[#faf1e7] data-[index='3']:text-[#89683d]"
            >
              0{i + 1}
            </span>
            <Badge>{freeSpaces(s, h.id) === 0 ? "Full" : "Available"}</Badge>
          </div>
          <h3>{h.name}</h3>
          <p className="leading-[1.65] text-xs whitespace-normal min-h-5 mt-1 max-[600px]:min-h-0">
            {h.area}
          </p>
          <div className="flex justify-between gap-2 pt-4 [&_svg]:inline [&_svg]:mr-2 [&_svg]:w-[16px] [&_svg]:h-[16px] [&_svg]:text-content-muted [&_svg]:align-middle my-5 mx-0 max-[600px]:my-4 max-[600px]:mx-0">
            <span className="text-sm font-semibold">
              <Icon name="bike" />
              {available(s, h.id).length}
              <small className="leading-[1.6] block font-normal text-xs mt-1">
                vehicles
              </small>
            </span>
            <span className="text-sm font-semibold">
              <Icon name="parking" />
              {freeSpaces(s, h.id)}
              <small className="leading-[1.6] block font-normal text-xs mt-1">
                spaces
              </small>
            </span>
            <span className="text-sm font-semibold">
              <Icon name="bolt" />
              {pointFree(s, h.id)}
              <small className="leading-[1.6] block font-normal text-xs mt-1">
                points
              </small>
            </span>
          </div>
          <div className="pt-3 flex justify-between text-content-muted text-xs gap-1">
            <span>Updated · {time(s.clock)}</span>
            <Icon name="arrow" size={16} />
          </div>
        </Link>
      ))}
    </div>
  );
}
