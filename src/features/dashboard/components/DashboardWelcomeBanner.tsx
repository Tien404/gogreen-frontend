import type { AppContext } from "@/app/providers/AppContext";
import { Icon } from "@/shared/components/Icon";
import { MobilityArtwork } from "@/shared/components/MobilityArtwork";
import { Button } from "@/shared/ui";

type DashboardWelcomeBannerProps = Pick<AppContext, "go">;

export function DashboardWelcomeBanner({ go }: DashboardWelcomeBannerProps) {
  return (
    <div className="rounded-xl bg-green-muted flex items-center justify-between gap-5 overflow-hidden relative p-5 max-[600px]:flex-col max-[600px]:items-stretch max-[600px]:gap-4">
      <div className="relative z-1 min-w-0">
        <h2 className="text-2xl leading-[1.2] tracking-tight mb-2 text-brand-strong max-[600px]:text-2xl">
          Your campus.
          <br />A little closer.
        </h2>
        <p className="leading-[1.65] text-green-ink mb-5 max-[600px]:text-sm">
          Shared rides and easy parking.
          <br />
          All in one place.
        </p>
        <Button
          className="max-[600px]:w-full"
          onClick={() => go("/student/find-ride")}
        >
          Find a ride <Icon name="arrow" />
        </Button>
      </div>
      <div
        className="relative isolate flex w-[32%] max-w-64 shrink-0 items-center justify-center max-[600px]:hidden"
        aria-hidden="true"
      >
        <MobilityArtwork
          name="campus-hub-reduced"
          className="w-full max-h-48 object-contain"
        />
      </div>
    </div>
  );
}
