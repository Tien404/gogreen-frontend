type Artwork =
  | "campus-hub"
  | "campus-hub-reduced"
  | "e-bike"
  | "electric-motorcycle"
  | "charging-point";

/** Exported Figma vectors. Empty alt keeps contextual illustrations decorative. */
type MobilityArtworkProps = {
  name: Artwork;
  className?: string;
};

export function MobilityArtwork({
  name,
  className = "",
}: MobilityArtworkProps) {
  return (
    <img
      src={`/illustrations/${name}.svg`}
      alt=""
      aria-hidden="true"
      draggable={false}
      decoding="async"
      className={`block object-contain ${className}`}
    />
  );
}

type VehicleArtworkProps = { type: string };

export function VehicleArtwork({ type }: VehicleArtworkProps) {
  return (
    <MobilityArtwork
      name={type === "Electric motorcycle" ? "electric-motorcycle" : "e-bike"}
      className="h-30 w-37.5 drop-shadow-[0_10px_8px] drop-shadow-content/10"
    />
  );
}
