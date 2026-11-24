import { Panel, Alert, Empty, Link, PageTitle, SectionHead } from "@/shared/ui";
import { OperatorScreenData } from "@/integration/OperatorScreenData";
import { StudentData } from "@/integration/StudentScreenData";
import { useApp } from "@/app/providers/AppContext";
import { config } from "@/config/app";
import { occupancy } from "@/domain/selectors";
import { CampusMap } from "@/features/hubs/components/CampusMap";
import { HubCards } from "@/features/hubs/components/HubCards";
import { Icon } from "@/shared/components/Icon";

import { useOptionalOperatorFeed } from "@/integration/operatorFeed";
import { alertLabel } from "@/integration/operatorRecords";
import { useEffect, useState } from "react";
import { DashboardActivity } from "../components/DashboardActivity";
export function Dashboard() {
  return (
    <StudentData screen="dashboard">
      <OperatorScreenData activity>
        <DashboardView />
      </OperatorScreenData>
    </StudentData>
  );
}
function DashboardView() {
  const { s, go } = useApp();
  const feed = useOptionalOperatorFeed();
  const alerts =
    feed?.result.status === "ready" ? feed.result.data.data.alerts : [];
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
          {/* <DashboardWelcomeBanner go={go} /> */}
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
                className="interactive-card bg-panel rounded-lg flex items-center gap-4 hover:text-content [&_>_svg]:ml-auto [&_>_svg]:text-content-muted [&_>_svg]:w-4.5 max-[1200px]:gap-2 max-[1200px]:[&_>_svg]:hidden max-[600px]:gap-4 max-[600px]:[&_>_svg]:block p-5 max-[1200px]:p-4 max-[600px]:p-4"
              >
                <span
                  data-slot="icon-box"
                  className="inline-flex items-center justify-center bg-soft text-primary w-11 h-11 rounded-lg shrink-0 max-[1200px]:w-9 max-[1200px]:h-9 max-[600px]:h-11 max-[600px]:w-11"
                >
                  <Icon name={icon} size={24} />
                </span>
                <span>
                  <strong className="block text-sm">{title}</strong>
                  <small className="block text-sm mt-1 leading-normal max-[600px]:mt-0">
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
                  ? `${hold.vehicle} · ${Math.max(0, Math.ceil(hold.expires - s.clock))} minutes remaining`
                  : `${activeRide!.vehicle} · ${Math.max(0, Math.floor(s.clock - activeRide!.start))} minutes elapsed`}
              </p>
              <Link
                to={
                  hold
                    ? `/student/holds/${encodeURIComponent(hold.id)}`
                    : `/student/rides/${encodeURIComponent(activeRide!.id)}`
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
              String(
                s.vehicles.filter((vehicle) => vehicle.status === "available")
                  .length,
              ),
              "Available shared vehicles",
              "Reported available by fleet status",
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
            <Panel
              data-slot="panel"
              className="min-w-0 [&_>_span]:text-sm [&_>_span]:text-content-muted [&_>_div_>_span:first-child]:text-sm [&_>_div_>_span:first-child]:text-content-muted"
              key={label}
            >
              <div className="flex justify-between items-center gap-2 max-[600px]:items-start">
                <span>{label}</span>
                <span
                  data-slot="icon-box"
                  className="inline-flex items-center justify-center bg-soft text-primary w-8 h-8 rounded-lg shrink-0 max-[600px]:hidden"
                >
                  <Icon name={icon} />
                </span>
              </div>
              <strong className="metric-value">{value}</strong>
              <small className="leading-[1.6] block max-[600px]:text-sm">
                {detail}
              </small>
            </Panel>
          ))}
        </div>
      )}
      <div className="mt-5 max-[600px]:mt-5">
        <SectionHead
          title={student ? "Explore your campus" : "Network overview"}
          subtitle={"Check live availability across campus."}
          action={
            <Link
              to={`/${s.role}/hubs`}
              data-slot="text-link"
              className="leading-[16px] text-primary inline-flex items-center gap-2 text-sm font-semibold hover:underline"
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
              : "Dispatch commitments are shown in hub details."
          }
        />
        {!s.hubs.length ? (
          <Empty
            title="No campus hubs yet"
            text="Campus hubs will appear here when available."
          />
        ) : (
          <HubCards />
        )}
      </div>
      {alerts.length > 0 && (
        <Alert>
          <ul>
            {alerts.map((alert) => (
              <li key={`${alert.hub_id}-${alert.code}`}>
                <Link to={`/operator/hubs/${encodeURIComponent(alert.hub_id)}`}>
                  {s.hubs.find((hub) => hub.id === alert.hub_id)?.name ??
                    alert.hub_id}
                </Link>
                {" · "}
                {alertLabel(alert.code)}
              </li>
            ))}
          </ul>
        </Alert>
      )}
      <DashboardActivity s={s} student={student} go={go} />
    </>
  );
}
function CurrentDateTime() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const untilNextMinute = () => 60000 - (Date.now() % 60000);
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
    <div className="flex items-center gap-3 text-sm text-content-muted shrink-0 [&_>_svg]:text-content-muted [&_small]:block [&_small]:text-sm [&_small]:text-content-muted max-[1200px]:hidden">
      <Icon name="sun" />
      <time dateTime={now.toISOString()}>
        {date}
        <small className="leading-[1.6]">{currentTime}</small>
      </time>
    </div>
  );
}
