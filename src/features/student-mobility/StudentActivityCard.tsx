import { Icon } from "@/shared/components/Icon";
import { Button, Link } from "@/shared/ui";
import { recordUrl } from "@/integration/studentRecords";
import type { StudentActivity } from "./studentActivities";

export function StudentActivityCard({
  activity,
  headingLevel = 1,
}: {
  activity: StudentActivity;
  headingLevel?: 1 | 2;
}) {
  const Heading = headingLevel === 1 ? "h1" : "h2";
  return (
    <div
      data-slot="activity-status-card"
      className="rounded-2xl bg-surface-muted min-[850px]:bg-panel p-4"
    >
      <div className="flex items-start gap-3">
        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-green-muted text-primary">
          <Icon name={activity.icon} size={22} />
        </span>
        <div className="min-w-0 flex-1">
          <Heading
            className={
              headingLevel === 1
                ? "student-home-heading"
                : "text-xl font-semibold leading-tight"
            }
          >
            {activity.title}
          </Heading>
          <p className="mt-1 text-base font-medium text-content">
            {activity.location}
          </p>
        </div>
      </div>

      <p className="mt-3 text-sm text-content-muted">{activity.detail}</p>
      <Button asChild className="button-wide mt-4">
        <Link to={recordUrl(activity.kind, activity.id)}>
          {activity.action} <Icon name="arrow" size={18} />
        </Link>
      </Button>
    </div>
  );
}
