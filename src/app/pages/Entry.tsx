import { config } from "@/config/app";
import { Brand } from "@/shared/components/Brand";
import { Icon } from "@/shared/components/Icon";
import { MobilityArtwork } from "@/shared/components/MobilityArtwork";
import { Link } from "@/shared/ui";
import { useApp } from "../providers/AppContext";

export function Entry() {
  const { auth, go, mode } = useApp();

  const enter = (role: "student" | "operator") => {
    auth.preview(role);
    go(`/${role}`);
  };

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
          {mode === "preview" && <Link
            to="/signup"
            className="rounded-xs px-4 py-2 font-medium text-accent hover:bg-soft"
          >
            Sign up
          </Link>}
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
            {mode === "preview" && <Link
              to="/signup"
              className="inline-flex min-h-6 items-center justify-center rounded-xs border border-control-border bg-panel px-5 py-3 text-sm font-medium text-content hover:bg-soft"
            >
              Create account
            </Link>}
          </div>
          {mode === "preview" && <details className="mt-5 max-w-140 rounded-sm bg-demo-surface p-4 text-demo">
            <summary className="cursor-pointer rounded-xs font-medium focus-visible:outline-demo">
              Preview mode
            </summary>
            <p className="my-4 text-xs text-demo">
              Explore fictional campus data without filling in a form. This
              frontend stores no accounts after a reload.
            </p>
            <div className="flex flex-col gap-4 max-w-140">
              <button
                className="flex items-center text-left gap-5 bg-demo-surface rounded-sm min-h-25 [&_>_span:nth-child(2)]:flex-1 max-[600px]:gap-3 text-demo motion-safe:hover:-translate-y-1 hover:shadow-control focus-visible:outline-demo **:data-[slot~=workspace-avatar]:bg-demo-surface-hover **:data-[slot~=workspace-avatar]:text-demo p-5 max-[600px]:p-4"
                onClick={() => enter("student")}
              >
                <span
                  data-slot="icon-box"
                  className="inline-flex items-center justify-center bg-demo-surface-hover text-demo w-6 h-6 rounded-xs shrink-0 max-[600px]:w-11 max-[600px]:h-11"
                >
                  <Icon name="bike" size={32} />
                </span>
                <span>
                  <strong className="block text-md max-[600px]:text-sm">
                    Explore as student
                  </strong>
                  <small className="leading-[1.6] block mt-1 max-[600px]:text-xs text-demo">
                    Find a ride. Make it to your next thing.
                  </small>
                </span>
                <Icon name="arrow" />
              </button>
              <button
                className="flex items-center text-left gap-5 bg-demo-surface rounded-sm min-h-25 [&_>_span:nth-child(2)]:flex-1 max-[600px]:gap-3 text-demo motion-safe:hover:-translate-y-1 hover:shadow-control focus-visible:outline-demo **:data-[slot~=workspace-avatar]:bg-demo-surface-hover **:data-[slot~=workspace-avatar]:text-demo p-5 max-[600px]:p-4"
                onClick={() => enter("operator")}
              >
                <span
                  data-slot="icon-box"
                  className="inline-flex items-center justify-center bg-demo-surface-hover text-demo w-6 h-6 rounded-xs shrink-0 max-[600px]:w-11 max-[600px]:h-11"
                >
                  <Icon name="grid" size={32} />
                </span>
                <span>
                  <strong className="block text-md max-[600px]:text-sm">
                    Explore as operator
                  </strong>
                  <small className="leading-[1.6] block mt-1 max-[600px]:text-xs text-demo">
                    Keep your campus moving.
                  </small>
                </span>
                <Icon name="arrow" />
              </button>
            </div>
          </details>}
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
