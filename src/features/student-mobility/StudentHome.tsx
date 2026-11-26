import { useApp } from "@/app/providers/AppContext";
import { StudentData } from "@/integration/StudentScreenData";
import { recordUrl } from "@/integration/studentRecords";
import { MobilityArtwork } from "@/shared/components/MobilityArtwork";
import { Icon } from "@/shared/components/Icon";
import { Link } from "@/shared/ui";
import { useState } from "react";
import { StudentActivityCard } from "./StudentActivityCard";
import { StudentJourney } from "./StudentJourney";
import { currentStudentActivities } from "./studentActivities";

export function StudentHome() {
  return (
    <StudentData screen="dashboard">
      <StudentHomeView />
    </StudentData>
  );
}

function StudentHomeView() {
  const { s } = useApp();
  const [selected, setSelected] = useState("");
  const [current, ...otherActivities] = currentStudentActivities(s);
  const hub = s.hubs.find((item) => item.id === selected);
  const origin = hub ? "?" + new URLSearchParams({ origin: hub.id }) : "";
  const parking = hub ? "?" + new URLSearchParams({ hub: hub.id }) : "";

  return (
    <StudentJourney
      home
      active={Boolean(current)}
      hub={hub?.id ?? current?.hub}
      destination={hub ? undefined : current?.destination}
      onHubSelect={setSelected}
    >
      {current ? (
        <>
          <StudentActivityCard activity={current} />
          {otherActivities.length > 0 && (
            <div
              className="student-home-other mt-4"
              aria-label="Other current activities"
            >
              {otherActivities.map((activity) => (
                <Link
                  key={activity.id}
                  to={recordUrl(activity.kind, activity.id)}
                >
                  <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-green-muted text-primary">
                    <Icon name={activity.icon} size={19} />
                  </span>
                  <span className="min-w-0">
                    <strong className="block text-base">
                      {activity.title}
                    </strong>
                    <span className="block text-sm text-content-muted">
                      {activity.location} · {activity.detail}
                    </span>
                  </span>
                  <Icon name="chevron" size={18} />
                </Link>
              ))}
            </div>
          )}
        </>
      ) : (
        <h1 className="student-home-heading xl:mb-4">Get around campus</h1>
      )}
      {hub && (
        <div
          aria-live="polite"
          className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-green-muted p-3.5"
        >
          <div>
            <h2 className="text-lg font-semibold">{hub.name}</h2>
            {hub.live && (
              <p className="mt-1 text-sm text-content-muted">
                {hub.live.availableVehicles} vehicles · {hub.live.bookable}{" "}
                parking spaces · {hub.live.availablePoints} charging points
              </p>
            )}
          </div>
          <Link
            className="flex min-h-11 items-center gap-1 text-sm font-semibold text-primary"
            to={`/student/hubs/${encodeURIComponent(hub.id)}`}
          >
            View hub <Icon name="chevron" size={17} />
          </Link>
        </div>
      )}
      <section aria-label="Campus services" className="mt-5">
        <nav
          aria-label="Start a campus service"
          className="student-home-services"
        >
          {(
            [
              {
                key: "ride",
                label: "Find a ride",
                icon: "bike",
                artwork: "e-bike",
                to: "/student/find-ride" + origin,
              },
              {
                key: "parking",
                label: "Book parking",
                icon: "parking",
                artwork: "electric-motorcycle",
                to: hub ? "/student/parking/new" + parking : "/student/parking",
              },
              {
                key: "charging",
                label: "Request charging",
                icon: "bolt",
                artwork: "charging-point",
                to: "/student/charging",
              },
              {
                key: "hubs",
                label: "Browse hubs",
                icon: "map",
                artwork: "campus-hub",
                to: "/student/hubs",
              },
            ] as const
          ).map(({ key, label, icon, artwork, to }) => (
            <Link key={key} data-service={key} to={to}>
              <span className="student-service-icon">
                <Icon name={icon} size={21} />
              </span>
              <MobilityArtwork name={artwork} className="student-service-art" />
              <span className="student-service-label">
                <strong>{label}</strong>
                <Icon name="chevron" size={17} />
              </span>
            </Link>
          ))}
        </nav>
      </section>
    </StudentJourney>
  );
}
