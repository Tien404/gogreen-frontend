import { Missing } from "@/app/pages/Missing";
import { Charging } from "@/features/charging/pages/Charging";
import { Dispatches } from "@/features/dispatch/pages/Dispatches";
import { HubDetail } from "@/features/hubs/pages/HubDetail";
import { ParkingDetail } from "@/features/parking/pages/ParkingDetail";
import { HoldDetail } from "@/features/rentals/pages/HoldDetail";
import { RideDetail } from "@/features/rentals/pages/RideDetail";
import { WhatIf } from "@/features/scenarios/pages/WhatIf";
import { Empty, Link, PageTitle } from "@/shared/ui";
import { Navigate, useParams } from "react-router";
import { useApp } from "../providers/AppContext";
export function HubPage() {
  const { hubId } = useParams();
  return hubId ? <HubDetail id={hubId} /> : <Missing />;
}
export function HoldPage() {
  const { holdId } = useParams();
  return holdId ? <HoldDetail id={holdId} /> : <Missing />;
}
export function RidePage() {
  const { rideId } = useParams();
  return rideId ? <RideDetail id={rideId} /> : <Missing />;
}
export function ParkingPage() {
  const { bookingId } = useParams();
  return bookingId ? <ParkingDetail id={bookingId} /> : <Missing />;
}
export function ChargingPage() {
  const { sessionId } = useParams();
  return sessionId ? <Charging id={sessionId} /> : <Missing />;
}
export function NewChargingPage() {
  const { s } = useApp();
  if (s.role === "operator")
    return <Navigate replace to="/operator/charging" />;
  return <Charging newRequest />;
}
export function DispatchPage() {
  const { dispatchId } = useParams();
  return dispatchId ? <Dispatches id={dispatchId} /> : <Missing />;
}
export function NewScenarioPage() {
  return <WhatIf newScenario />;
}
export function ScenarioRunPage() {
  const { runId } = useParams();
  return runId ? <WhatIf id={runId} /> : <Missing />;
}
export function UnknownRoutePage() {
  const { s } = useApp();
  return (
    <>
      <PageTitle
        title="Page not found"
        description="This address does not match a page in the campus workspace."
      />
      <Empty
        title="Let’s get you back on track"
        text="Check the address or return to your overview."
        action={
          <Link
            data-slot="button"
            className="active:translate-y-px inline-flex items-center justify-center gap-2 min-h-11 rounded-lg text-sm font-medium leading-[24px] whitespace-normal text-on-dark bg-primary [&:hover:not(:disabled)]:bg-brand-hover [&:hover:not(:disabled)]:text-on-dark py-2 px-5"
            to={s.role ? `/${s.role}` : "/"}
          >
            Back to overview
          </Link>
        }
      />
    </>
  );
}
export function NotFoundPage() {
  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="pt-5 pb-0 max-w-400 outline-none focus-visible:outline-3 focus-visible:outline-primary focus-visible:-outline-offset-4 min-[1600px]:pt-6 min-[1600px]:pb-0 max-[1200px]:pt-5 max-[1200px]:pb-0 max-[600px]:pt-5 max-[600px]:pb-0 px-6 m-auto min-[1600px]:px-6 max-[1200px]:px-5 max-[600px]:px-4"
    >
      <UnknownRoutePage />
    </main>
  );
}
