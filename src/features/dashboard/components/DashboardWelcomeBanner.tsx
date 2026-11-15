import type { AppContext } from "@/app/providers/AppContext";
import { Icon } from "@/shared/components/Icon";
import { MobilityArtwork } from "@/shared/components/MobilityArtwork";
import { Button } from "@/shared/ui";

type DashboardWelcomeBannerProps = Pick<AppContext, "go">;

export function DashboardWelcomeBanner({ go }: DashboardWelcomeBannerProps) {
  return (
    <div className="rounded-sm bg-soft flex items-center justify-between gap-5 overflow-hidden relative p-5 max-[600px]:flex-col max-[600px]:items-stretch max-[600px]:gap-4">
      <div className="relative z-1 min-w-0">
        <span
          data-slot="eyebrow"
          className="text-xs font-semibold tracking-[1.5px] text-accent mb-3 max-[600px]:text-xs"
        >
          LET’S GET YOU MOVING
        </span>
        <h2 className="text-lg leading-[1.1] tracking-[-1.5px] mb-4 text-brand-strong max-[600px]:text-lg">
          Your campus.
          <br />A little closer.
        </h2>
        <p className="leading-[1.65] text-content-muted mb-5 max-[600px]:text-xs max-[600px]:max-w-42.5">
          Shared rides and easy parking.
          <br />
          All in one place.
        </p>
        <Button onClick={() => go("/student/find-ride")}>
          Find a ride <Icon name="arrow" />
        </Button>
      </div>
      <div
        className="relative isolate flex w-[52%] shrink-0 items-center justify-center max-[600px]:w-full"
        aria-hidden="true"
      >
        <MobilityArtwork
          name="campus-hub-reduced"
          className="w-full max-w-115"
        />
      </div>
    </div>
  );
}
