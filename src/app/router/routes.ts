import { Parking } from "@/features/parking/pages/Parking";
import { Activity } from "@/features/activity/pages/Activity";
import { Login, SignUp } from "@/features/auth/pages/AuthPages";
import { Charging } from "@/features/charging/pages/Charging";
import { StudentHome } from "@/features/student-mobility/StudentHome";
import { Dashboard } from "@/features/dashboard/pages/Dashboard";
import { Dispatches } from "@/features/dispatch/pages/Dispatches";
import { Fleet } from "@/features/fleet/pages/Fleet";
import { Hubs } from "@/features/hubs/pages/Hubs";
import { Incidents } from "@/features/incidents/pages/Incidents";
import { ParkingNew } from "@/features/parking/pages/ParkingNew";
import { FindRide } from "@/features/rentals/pages/FindRide";
import { WhatIf } from "@/features/scenarios/pages/WhatIf";
import { PrivateVehicles } from "@/features/vehicles/pages/PrivateVehicles";
import type { RouteObject } from "react-router";
import { OperatorWorkspace, StudentWorkspace } from "../layout/Workspace";
import { Entry } from "../pages/Entry";
import {
  ChargingPage,
  DispatchPage,
  HoldPage,
  HubPage,
  NewChargingPage,
  NewScenarioPage,
  NotFoundPage,
  ParkingPage,
  RidePage,
  ScenarioRunPage,
  UnknownRoutePage,
} from "./RecordPages";
// Declarative, browser-only routes. These are UI pages, never API endpoints.
export const appRoutes: RouteObject[] = [
  { id: "entry", path: "/", Component: Entry },
  { id: "login", path: "/login", Component: Login },
  { id: "signup", path: "/signup", Component: SignUp },
  {
    id: "student",
    path: "/student",
    Component: StudentWorkspace,
    children: [
      { id: "student-overview", index: true, Component: StudentHome },
      { id: "student-hubs", path: "hubs", Component: Hubs },
      { id: "student-hub", path: "hubs/:hubId", Component: HubPage },
      { id: "student-find-ride", path: "find-ride", Component: FindRide },
      { id: "student-hold", path: "holds/:holdId", Component: HoldPage },
      { id: "student-ride", path: "rides/:rideId", Component: RidePage },
      { id: "student-vehicles", path: "vehicles", Component: PrivateVehicles },
      { id: "student-parking-list", path: "parking", Component: Parking },
      { id: "student-new-parking", path: "parking/new", Component: ParkingNew },
      {
        id: "student-parking",
        path: "parking/:bookingId",
        Component: ParkingPage,
      },
      { id: "student-charging", path: "charging", Component: Charging },
      {
        id: "student-new-charging",
        path: "charging/new",
        Component: NewChargingPage,
      },
      {
        id: "student-charging-session",
        path: "charging/:sessionId",
        Component: ChargingPage,
      },
      { id: "student-activity", path: "activity", Component: Activity },
      { id: "student-not-found", path: "*", Component: UnknownRoutePage },
    ],
  },
  {
    id: "operator",
    path: "/operator",
    Component: OperatorWorkspace,
    children: [
      { id: "operator-overview", index: true, Component: Dashboard },
      { id: "operator-hubs", path: "hubs", Component: Hubs },
      { id: "operator-hub", path: "hubs/:hubId", Component: HubPage },
      { id: "operator-fleet", path: "fleet", Component: Fleet },
      { id: "operator-incidents", path: "incidents", Component: Incidents },
      { id: "operator-dispatch", path: "dispatch", Component: Dispatches },
      {
        id: "operator-dispatch-detail",
        path: "dispatch/:dispatchId",
        Component: DispatchPage,
      },
      { id: "operator-charging", path: "charging", Component: Charging },
      {
        id: "operator-new-charging",
        path: "charging/new",
        Component: NewChargingPage,
      },
      {
        id: "operator-charging-session",
        path: "charging/:sessionId",
        Component: ChargingPage,
      },
      { id: "operator-what-if", path: "what-if", Component: WhatIf },
      {
        id: "operator-new-scenario",
        path: "what-if/new",
        Component: NewScenarioPage,
      },
      {
        id: "operator-scenario-run",
        path: "what-if/runs/:runId",
        Component: ScenarioRunPage,
      },
      { id: "operator-activity", path: "activity", Component: Activity },
      { id: "operator-not-found", path: "*", Component: UnknownRoutePage },
    ],
  },
  { id: "not-found", path: "*", Component: NotFoundPage },
];
