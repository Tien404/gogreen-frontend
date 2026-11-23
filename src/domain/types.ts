import type { config } from "@/config/app";
export type Role = "student" | "operator";
export interface AccountProfile {
  name: string;
  email: string;
  role: Role;
  persona: string;
}
export type VehicleType = (typeof config.vehicleTypes)[number];
export type Status =
  | "available"
  | "held"
  | "riding"
  | "charging"
  | "maintenance"
  | "in-transit"
  | "committed"
  | "unknown";
export interface Hub {
  id: string;
  coordinates?: readonly [latitude: number, longitude: number] | null;
  name: string;
  area: string;
  capacity: number;
  points: number;
  x: number;
  y: number;
  live?: {
    occupied: number;
    bookable: number;
    availablePoints: number;
    availableVehicles: number;
    active: boolean;
    pointIds: string[];
  };
}
export interface Vehicle {
  id: string;
  type: string;
  battery: number | null;
  status: Status;
  hub: string | null;
  stale?: boolean;
  observedClock?: number | null;
}
export interface PrivateVehicle {
  id: string;
  owner: string;
  identifier: string;
  type: string;
  battery: number | null;
}
export interface Hold {
  id: string;
  owner: string;
  vehicle: string;
  origin: string;
  destination: string;
  expires: number;
  status: "held" | "cancelled" | "expired" | "picked-up";
}
export interface Ride {
  id: string;
  owner: string;
  vehicle: string;
  origin: string;
  destination: string;
  start: number;
  end?: number;
  status: "active" | "completed" | "disputed";
}
export interface Booking {
  id: string;
  owner: string;
  vehicle: string;
  hub: string;
  start: number;
  end: number;
  service: string;
  sessionId?: string;
  space?: string;
  status:
    | "confirmed"
    | "cancelled"
    | "checked-in"
    | "completed"
    | "expired"
    | "overstaying";
}
export interface Charge {
  id: string;
  owner: string;
  vehicle: string;
  hub: string;
  booking?: string;
  status:
    | "pending"
    | "scheduled"
    | "active"
    | "completed"
    | "cancelled"
    | "stopped"
    | "interrupted";
  battery: number | null;
  schedule?: string;
  target: number;
  reason: string;
  point?: string;
}
export interface Incident {
  id: string;
  resource: string;
  severity: string;
  type: string;
  description: string;
  status: "open" | "resolved";
  resolution?: string;
  time: number;
}
export interface Dispatch {
  id: string;
  source: string;
  destination: string;
  vehicles: string[];
  status: "planned" | "in-transit" | "completed" | "cancelled" | "failed";
  reason?: string;
  started?: number;
  completed?: number;
}
export interface Activity {
  persona?: string;
  id: string;
  at: number;
  actor: string;
  action: string;
  resource: string;
  result: string;
  reason: string;
  link: string;
}
export interface State {
  clock: number;
  role: Role | null;
  persona: string;
  profile?: AccountProfile;
  hubs: Hub[];
  vehicles: Vehicle[];
  privateVehicles: PrivateVehicle[];
  holds: Hold[];
  rides: Ride[];
  bookings: Booking[];
  charges: Charge[];
  incidents: Incident[];
  dispatches: Dispatch[];
  activity: Activity[];
}
