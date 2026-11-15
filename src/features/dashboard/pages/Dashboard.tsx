import { useApp } from "@/app/providers/AppContext";
import { config } from "@/config/app";
import { available, occupancy } from "@/domain/selectors";
import { CampusMap } from "@/features/hubs/components/CampusMap";
import { HubCards } from "@/features/hubs/components/HubCards";
import { Icon } from "@/shared/components/Icon";
import { Alert, Link, PageTitle, SectionHead } from "@/shared/ui";
import { useEffect, useState } from "react";
import { DashboardActivity } from "../components/DashboardActivity";
import { DashboardWelcomeBanner } from "../components/DashboardWelcomeBanner";

export function Dashboard() {
  const { s, go } = useApp();

  const student = s.role === "student";

  const activeRide = s.rides.find(
    (r) => r.owner === s.persona && r.status === "active",
  );

  const hold = s.holds.find(
    (h) => h.owner === s.persona && h.status === "held",
  );

  const total = s.hubs.reduce((n, h) => n + h.capacity, 0);

  const occupied = s.hubs.reduce((n, h) => n + occupancy(s, h.id), 0);

  return (
    <>
      <PageTitle
        eyebrow="OVERVIEW"
        title={student ? "A better way around campus." : "Campus at a glance."}
        description={
          student
            ? "Find your next ride, a place to park, or a little more charge."
            : "A clear view of your hubs, shared fleet and campus operations."
        }
        action={<CurrentDateTime />}
      />
      {student ? (
        <>
          <DashboardWelcomeBanner go={go} />
          <div className="grid grid-cols-3 gap-4 mt-5 max-[600px]:grid-cols-1 max-[600px]:gap-2 max-[600px]:mt-4">
            {[
              ["bike", "Find a ride", "Shared electric vehicles", "find-ride"],
              [
                "parking",
                "Book parking",
                "A space for your own vehicle",
                "parking/new",
              ],
              [
                "bolt",
                "Charge your vehicle",
                "Keep your day moving",
                "charging/new",
              ],
            ].map(([icon, title, description, path]) => (
              <Link
                key={title}
                to={`/student/${path}`}
                className="bg-panel rounded-xs flex items-center gap-4 motion-safe:hover:-translate-y-1 hover:shadow-control hover:text-content [&_>_svg]:ml-auto [&_>_svg]:text-content-muted [&_>_svg]:w-4.5 max-[1200px]:gap-2 max-[1200px]:[&_>_svg]:hidden max-[600px]:gap-4 max-[600px]:[&_>_svg]:block p-5 max-[1200px]:p-4 max-[600px]:p-4"
              >
                <span
                  data-slot="icon-box"
                  className="inline-flex items-center justify-center bg-soft text-accent w-11 h-11 rounded-xs shrink-0 max-[1200px]:w-9 max-[1200px]:h-9 max-[600px]:h-11 max-[600px]:w-11"
                >
                  <Icon name={icon} size={24} />
                </span>
                <span>
                  <strong className="block text-sm">{title}</strong>
                  <small className="block text-xs mt-1 leading-normal max-[600px]:mt-0">
                    {description}
                  </small>
                </span>
                <Icon name="arrow" />
              </Link>
            ))}
          </div>
          {(hold || activeRide) && (
            <Alert>
              <strong>
                {hold ? "Your vehicle is on hold" : "Your ride is active"}
              </strong>
              <p className="leading-[1.65]">
                {hold
                  ? `${hold.vehicle} · ${Math.max(0, hold.expires - s.clock)} minutes remaining`
                  : `${activeRide!.vehicle} · ${s.clock - activeRide!.start} minutes elapsed`}
              </p>
              <Link
                to={
                  hold
                    ? `/student/holds/${hold.id}`
                    : `/student/rides/${activeRide!.id}`
                }
              >
                View {hold ? "hold" : "ride"} <Icon name="arrow" size={16} />
              </Link>
            </Alert>
          )}
        </>
      ) : (
        <div className="grid grid-cols-4 gap-4 max-[1200px]:grid-cols-2 max-[600px]:gap-2">
          {[
            [
              "parking",
              `${occupied} / ${total}`,
              "Spaces occupied",
              "Physical occupancy",
            ],
            [
              "bike",
              String(available(s).length),
              "Available shared vehicles",
              "Known battery · rental ready",
            ],
            [
              "bolt",
              String(s.charges.filter((c) => c.status === "active").length),
              "Active charging sessions",
              "Across all campus hubs",
            ],
            [
              "alert",
              String(s.incidents.filter((i) => i.status === "open").length),
              "Open incidents",
              "Needs operator attention",
            ],
          ].map(([icon, value, label, detail]) => (
            <div
              data-slot="panel"
              className="bg-panel rounded-sm min-w-0 [&_>_span]:text-xs [&_>_span]:text-content-muted [&_>_div_>_span:first-child]:text-xs [&_>_div_>_span:first-child]:text-content-muted max-[600px]:rounded-xs p-5 max-[600px]:p-4"
              key={label}
            >
              <div className="flex justify-between items-center gap-2 max-[600px]:items-start">
                <span>{label}</span>
                <span
                  data-slot="icon-box"
                  className="inline-flex items-center justify-center bg-soft text-accent w-8 h-8 rounded-xs shrink-0 max-[600px]:hidden"
                >
                  <Icon name={icon} />
                </span>
              </div>
              <strong className="text-lg leading-[1.4] block tracking-[-1px] mt-3 mb-1 max-[600px]:text-lg max-[600px]:tracking-[-0.5px] mx-0">
                {value}
              </strong>
              <small className="leading-[1.6] block max-[600px]:text-xs">
                {detail}
              </small>
            </div>
          ))}
        </div>
      )}
      <div className="mt-5 max-[600px]:mt-5">
        <SectionHead
          title={student ? "Explore your campus" : "Network overview"}
          subtitle="Four hubs. More ways to get where you’re going."
          action={
            <Link
              to={`/${s.role}/hubs`}
              data-slot="text-link"
              className="leading-[16px] text-accent inline-flex items-center gap-2 text-xs font-semibold hover:underline"
            >
              View all hubs <Icon name="arrow" size={16} />
            </Link>
          }
        />
        <CampusMap />
      </div>
      <div className="mt-5 max-[600px]:mt-5">
        <SectionHead
          title={student ? "Find your nearest hub" : "Hub availability"}
          subtitle={
            student
              ? "Check vehicles, parking and charging before you head out."
              : "Current fixture availability. Dispatch commitments are shown in hub details."
          }
        />
        <HubCards />
      </div>
      <DashboardActivity s={s} student={student} go={go} />
    </>
  );
}

function CurrentDateTime() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const untilNextMinute = () => 60_000 - (Date.now() % 60_000);

    let timer: number;

    const tick = () => {
      setNow(new Date());
      timer = window.setTimeout(tick, untilNextMinute());
    };

    timer = window.setTimeout(tick, untilNextMinute());

    const refreshWhenVisible = () => {
      if (document.hidden) return;

      window.clearTimeout(timer);
      tick();
    };

    document.addEventListener("visibilitychange", refreshWhenVisible);

    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("visibilitychange", refreshWhenVisible);
    };
  }, []);

  const date = now.toLocaleDateString("en-GB", {
    timeZone: config.timezone,
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const currentTime = now.toLocaleTimeString("en-GB", {
    timeZone: config.timezone,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });

  return (
    <div className="flex items-center gap-3 text-xs text-content-muted shrink-0 [&_>_svg]:text-[#8b9791] [&_small]:block [&_small]:text-xs [&_small]:text-content-muted max-[1200px]:hidden">
      <Icon name="sun" />
      <time dateTime={now.toISOString()}>
        {date}
        <small className="leading-[1.6]">
          {currentTime} · {config.timezone}
        </small>
      </time>
    </div>
  );
}
