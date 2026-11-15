import { PageTitle } from "@/shared/ui";
import { ActivityFeed } from "../components/ActivityFeed";

export function Activity() {
  return (
    <>
      <PageTitle
        title="Activity"
        description="Your actions, outcomes and resource history."
      />
      <ActivityFeed />
    </>
  );
}
