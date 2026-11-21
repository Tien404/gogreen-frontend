import { config } from "@/config/app";
import { Brand } from "@/shared/components/Brand";
import { Icon } from "@/shared/components/Icon";
import { MobilityArtwork } from "@/shared/components/MobilityArtwork";
import { Link } from "@/shared/ui";
import { useApp } from "../providers/AppContext";
export function Entry() {
  useApp();
  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="min-h-dvh bg-canvas flex flex-col relative overflow-hidden before:content-[''] before:absolute before:w-200 before:h-200 before:rounded-full before:-right-87.5 before:top-22.5 before:shadow-[0_0_0_80px_var(--color-soft),0_0_0_180px_var(--color-surface-muted)] before:pointer-events-none max-[600px]:before:-right-162.5 py-5 px-6 max-[600px]:p-5"
    >
      <div className="flex justify-between items-center relative max-[600px]:**:data-[slot~=brand]:text-md max-[600px]:gap-2">
        <Brand />
        <nav
          aria-label="Account navigation"
          className="flex items-center gap-4 text-sm"
        >
          <Link
            to="/login"
            className="font-medium text-content hover:text-accent"
          >
            Log in
          </Link>
        </nav>
      </div>
      <div className="relative grid grid-cols-[1.1fr_1fr] items-center gap-6 max-w-290 w-full my-7 mx-auto max-[900px]:grid-cols-1 max-[900px]:gap-5 max-[600px]:my-5">
        <div className="min-w-0">
          <div
            data-slot="eyebrow"
            className="text-xs font-semibold tracking-[1.7px] text-accent mb-3"
          >
            A LITTLE MORE CONNECTED
          </div>
          <h1 className="text-lg leading-[1.05] tracking-[-4px] mb-5 max-[600px]:text-lg max-[600px]:tracking-[-3px]">
            Your campus,
            <br />
            <span className="text-accent">in motion.</span>
          </h1>
          <p className="text-md leading-[1.8] mb-5 max-[600px]:text-sm">
            Shared electric rides. A space to park. A place to recharge.
            <br className="max-[600px]:hidden" />
            Meet your everyday campus companion.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/login"
              className="inline-flex min-h-6 items-center justify-center gap-2 rounded-xs bg-accent px-5 py-3 text-sm font-medium text-on-dark hover:bg-brand-hover hover:text-on-dark"
            >
              Log in <Icon name="arrow" />
            </Link>
          </div>

          <p className="mt-5 text-xs text-content-muted">
            One account for your everyday campus journey.
          </p>
        </div>
        <figure className="m-0 min-w-0 max-[900px]:hidden">
          <MobilityArtwork name="campus-hub" className="w-full" />
          <figcaption className="text-center text-xs text-content-muted mt-4">
            Ride. Park. Recharge. All connected.
          </figcaption>
        </figure>
      </div>
      <div className="flex justify-between items-center relative mt-auto text-xs text-content-muted max-[600px]:items-start max-[600px]:flex-col max-[600px]:gap-1">
        <span>{config.tagline}</span>
        <span>{config.campus}</span>
      </div>
    </main>
  );
}
