import { ApiDispatch, ApiDispatchRecord } from "@/features/dispatch/pages/ApiDispatch";
import { ApiIncidents } from "@/features/incidents/pages/ApiIncidents";
import { ApiOperatorFleet, ApiOperatorOverview } from "@/features/monitoring/pages/ApiMonitoring";
import { ApiWhatIf, ApiWhatIfNew, ApiWhatIfResult } from "@/features/scenarios/pages/ApiWhatIf";
import { ApiActivity } from "@/features/activity/pages/ApiActivity";
import { ApiCharging, ApiChargingNew } from "@/features/charging/pages/ApiCharging";
import { ApiChargingRecord } from "@/features/charging/pages/ApiChargingRecord";
import { ApiParking } from "@/features/parking/pages/ApiParking";
import { ApiParkingRecord } from "@/features/parking/pages/ApiParkingRecord";
import { ApiFindRide } from "@/features/rentals/pages/ApiFindRide";
import { ApiHoldRecord, ApiRideRecord } from "@/features/rentals/pages/ApiRentalRecords";
import { ApiPrivateVehicles } from "@/features/vehicles/pages/ApiPrivateVehicles";
import { ApiHubRecord, ApiHubs } from "@/features/hubs/pages/ApiHubs";
import type { RouteObject } from "react-router";
import { ApiStudentOverview } from "../pages/ApiStudentOverview";
import { LoginInsteadOfSignUp, OperatorChargingRedirect, PendingApiPage } from "./ApiBoundaryPages";
import { appRoutes } from "./routes";

const workspacePages: Record<string, NonNullable<RouteObject["Component"]>> = {
  "student-overview": ApiStudentOverview,
  "student-find-ride": ApiFindRide,
  "student-hold": ApiHoldRecord,
  "student-ride": ApiRideRecord,
  "student-vehicles": ApiPrivateVehicles,
  "student-new-parking": ApiParking,
  "student-parking": ApiParkingRecord,
  "student-charging": ApiCharging,
  "student-new-charging": ApiChargingNew,
  "student-charging-session": ApiChargingRecord,
  "student-activity": ApiActivity,
  "operator-overview": ApiOperatorOverview,
  "operator-fleet": ApiOperatorFleet,
  "operator-incidents": ApiIncidents,
  "operator-dispatch": ApiDispatch,
  "operator-dispatch-detail": ApiDispatchRecord,
  "operator-what-if": ApiWhatIf,
  "operator-new-scenario": ApiWhatIfNew,
  "operator-scenario-run": ApiWhatIfResult,
  "operator-charging": ApiCharging,
  "operator-new-charging": OperatorChargingRedirect,
  "operator-charging-session": ApiChargingRecord,
  "operator-activity": ApiActivity,
};

export const apiRoutes: RouteObject[] = appRoutes.map((route) => {
  if (route.id === "signup") return { ...route, Component: LoginInsteadOfSignUp };
  if (!route.children) return route;
  const children = route.children.map((child) => {
    const connected = child.id ? workspacePages[child.id] : undefined;
    if (connected) return { ...child, Component: connected };
    if (child.path === "*") return child;
    if (child.index || child.path === "hubs") return { ...child, Component: ApiHubs };
    if (child.path === "hubs/:hubId") return { ...child, Component: ApiHubRecord };
    // Other screens join the API workspace as their data/actions are connected.
    return { ...child, Component: PendingApiPage };
  });
  return { ...route, children };
});
