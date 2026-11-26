import { config } from "@/config/app";
import { Brand } from "@/shared/components/Brand";
import { Icon } from "@/shared/components/Icon";
import { MobilityArtwork } from "@/shared/components/MobilityArtwork";
import { Button, Link } from "@/shared/ui";
import { useApp } from "../providers/AppContext";
export function Entry() {
  useApp();
  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="min-h-dvh bg-canvas flex flex-col relative overflow-hidden py-5 px-6 max-[600px]:p-5"
    >
      <div className="flex justify-between items-center relative max-[600px]:**:data-[slot~=brand]:text-md max-[600px]:gap-2">
        <Brand />
        <nav
          aria-label="Account navigation"
          className="flex items-center gap-4 text-sm"
        >
          <Link
            to="/login"
            className="font-medium text-content hover:text-primary"
          >
            Log in
          </Link>
        </nav>
      </div>
      <div className="mx-auto my-auto grid w-full max-w-6xl justify-items-center gap-8 py-8 text-center sm:gap-10 sm:py-12">
        <div className="min-w-0">
          <h1 className="text-4xl font-semibold leading-[1.1] tracking-tight sm:text-6xl">
            Your campus,
            <br />
            <span className="text-primary">in motion.</span>
          </h1>
          <p className="mx-auto mt-4 max-w-[42ch] text-balance text-base leading-relaxed sm:text-lg">
            Shared electric rides, parking and charging across campus.
          </p>
          <Button asChild size="lg" className="mt-6">
            <Link to="/login">
              Log in <Icon name="arrow" />
            </Link>
          </Button>
        </div>
        <MobilityArtwork
          name="campus-hub"
          className="h-auto max-h-[min(38svh,24rem)] w-full max-w-2xl"
        />
      </div>
      <div className="relative mt-auto flex justify-between items-center text-sm text-content-muted max-[600px]:flex-col max-[600px]:gap-1">
        <span>{config.tagline}</span>
        <span>{config.campus}</span>
      </div>
    </main>
  );
}
