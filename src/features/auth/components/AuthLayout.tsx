import { config } from "@/config/app";
import { Brand } from "@/shared/components/Brand";
import { MobilityArtwork } from "@/shared/components/MobilityArtwork";
import { Link } from "@/shared/ui";
import { Bike, MapPin, Zap } from "lucide-react";
import type { ReactNode } from "react";

type AuthLayoutProps = {
  title: string;
  description: string;
  children: ReactNode;
};

export function AuthLayout({ title, description, children }: AuthLayoutProps) {
  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="min-h-dvh bg-canvas p-5 sm:p-6 flex flex-col"
    >
      <header className="mx-auto flex w-full max-w-290 items-center justify-between gap-5">
        <Link to="/" aria-label="gogreen home" className="rounded-lg">
          <Brand />
        </Link>
        <Link
          to="/"
          className="text-sm text-content-muted hover:text-primary underline-offset-4 hover:underline"
        >
          Back to home
        </Link>
      </header>
      <div className="mx-auto my-auto grid w-full max-w-290 items-center gap-6 py-6 lg:grid-cols-2 lg:gap-7">
        <section className="mx-auto w-full max-w-115 rounded-xl bg-panel p-5 sm:p-6">
          <h1 className="text-[28px] leading-[1.2] tracking-[-0.025em]">
            {title}
          </h1>
          <p className="text-sm text-content-muted mt-3 mb-5">{description}</p>
          {children}
        </section>
        <aside className="hidden min-w-0 lg:block" aria-label="Campus mobility">
          <MobilityArtwork name="campus-hub" className="w-full max-h-97.5" />
          <h2 className="mt-5 text-[28px] leading-[1.2] tracking-[-0.025em] text-brand-strong">
            A little greener.
            <br />A lot more connected.
          </h2>
          <p className="mt-4 max-w-100">
            One account for shared rides, convenient parking and a little more
            charge.
          </p>
          <div className="mt-5 flex flex-wrap gap-5 text-sm text-content-muted">
            <span className="inline-flex items-center gap-2">
              <Bike size={18} strokeWidth={1.75} />
              Ride
            </span>
            <span className="inline-flex items-center gap-2">
              <MapPin size={18} strokeWidth={1.75} />
              Park
            </span>
            <span className="inline-flex items-center gap-2">
              <Zap size={18} strokeWidth={1.75} />
              Recharge
            </span>
          </div>
        </aside>
      </div>
      <footer className="mx-auto flex w-full max-w-290 flex-wrap justify-between gap-3 text-sm text-content-muted">
        <span>gogreen · Your campus, connected.</span>
        <span>{config.campus}</span>
      </footer>
    </main>
  );
}
