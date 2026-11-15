import { ApiHubs } from "@/features/hubs/pages/ApiHubs";
import { ApiTripHistory } from "@/features/rentals/pages/ApiTripHistory";
import { Link } from "@/shared/ui";

export function ApiStudentOverview() {
  return (
    <>
      <div className="mb-5 flex flex-wrap gap-4">
        <Link to="/student/find-ride">Find a ride</Link>
        <Link to="/student/parking/new">Book parking</Link>
        <Link to="/student/charging">Charging</Link>
      </div>
      <ApiTripHistory />
      <ApiHubs />
    </>
  );
}
