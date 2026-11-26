import { OperatorScreenData } from "@/integration/OperatorScreenData";
import { StudentData } from "@/integration/StudentScreenData";
import { PageTitle } from "@/shared/ui";
import { ActivityFeed } from "../components/ActivityFeed";
export function Activity() {
  return (
    <>
      <PageTitle title="Activity" />
      <StudentData screen="activity">
        <OperatorScreenData activity>
          <ActivityFeed />
        </OperatorScreenData>
      </StudentData>
    </>
  );
}
