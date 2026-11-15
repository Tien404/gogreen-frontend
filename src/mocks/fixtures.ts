import { config } from "@/config/app";
import { pointId } from "@/domain/selectors";
import { previewProfiles } from "./accounts";
import type { Hub, State, Vehicle } from "@/domain/types";

export function fixtures(): State {
  const hubs: Hub[] = [
    {
      id: "north",
      name: "Dormitory Hub",
      area: "Student dormitories & residential services",
      capacity: 20,
      points: 4,
      x: 23,
      y: 28,
    },
    {
      id: "library",
      name: "Central Library Hub",
      area: "Library & student service area",
      capacity: 18,
      points: 4,
      x: 55,
      y: 42,
    },
    {
      id: "science",
      name: "University Campus Hub",
      area: "University campuses & teaching facilities",
      capacity: 24,
      points: 6,
      x: 75,
      y: 68,
    },
    {
      id: "metro",
      name: "Metro Interchange Hub",
      area: "Metro Line 1 connection & onward campus journeys",
      capacity: 16,
      points: 4,
      x: 30,
      y: 77,
    },
  ];

  const vehicles: Vehicle[] = Array.from({ length: 40 }, (_, i) => ({
    id: `EV-${String(i + 1).padStart(3, "0")}`,
    type: config.vehicleTypes[i % config.vehicleTypes.length],
    battery: i === 8 ? null : 18 + ((i * 13) % 81),
    status: i === 7 ? "maintenance" : i === 12 ? "charging" : "available",
    hub: hubs[Math.floor(i / 10)].id,
    stale: i === 8,
  }));

  vehicles[12].battery = 37;
  vehicles[23].battery = 20;

  return {
    clock: 0,
    preset: "normal",
    role: null,
    persona: "student",
    serial: 100,
    revision: 0,
    hubs,
    vehicles,
    privateVehicles: [
      {
        id: "PV-01",
        owner: "student",
        identifier: "CAMPUS-024",
        type: "Electric bicycle",
        battery: 42,
      },
      {
        id: "PV-02",
        owner: "student",
        identifier: "CAMPUS-087",
        type: "Electric motorcycle",
        battery: 67,
      },
      {
        id: "PV-03",
        owner: "student-2",
        identifier: "CAMPUS-132",
        type: "Electric bicycle",
        battery: 33,
      },
    ],
    holds: [],
    rides: [],
    bookings: [
      {
        id: "PK-001",
        owner: "student",
        vehicle: "PV-01",
        hub: "library",
        start: -30,
        end: 60,
        service: "Parking + charging",
        status: "checked-in",
      },
      {
        id: "PK-002",
        owner: "student",
        vehicle: "PV-02",
        hub: "north",
        start: 120,
        end: 240,
        service: "Parking only",
        status: "confirmed",
      },
      {
        id: "PK-003",
        owner: "student-2",
        vehicle: "PV-03",
        hub: "science",
        start: 0,
        end: 120,
        service: "Parking only",
        status: "confirmed",
      },
    ],
    charges: [
      {
        id: "CH-001",
        owner: "student",
        vehicle: "PV-01",
        booking: "PK-001",
        hub: "library",
        status: "active",
        battery: 42,
        target: 80,
        point: pointId("library", 1),
        reason: "Scheduled until 10:00. Parking stays occupied after charging.",
      },
      {
        id: "CH-002",
        owner: "operator",
        vehicle: "EV-013",
        hub: "library",
        status: "active",
        battery: 37,
        target: 90,
        point: pointId("library", 0),
        reason: "Shared fleet charging.",
      },
      {
        id: "CH-003",
        owner: "operator",
        vehicle: "EV-024",
        hub: "science",
        status: "pending",
        battery: 20,
        target: 80,
        reason: "Queue position 1 · Waiting for an available charging point.",
      },
    ],
    incidents: [
      {
        id: "IN-001",
        resource: `${hubs[0].name} · ${pointId(hubs[0].id, 3)}`,
        severity: "Medium",
        type: "Point fault",
        description: "Charging point unavailable for inspection.",
        status: "open",
        time: -20,
      },
      {
        id: "IN-002",
        resource: "EV-008",
        severity: "High",
        type: "Vehicle fault",
        description:
          "Brake inspection required. Vehicle unavailable for rental.",
        status: "open",
        time: -45,
      },
    ],
    dispatches: [],
    activity: [
      {
        id: "AC-001",
        at: -5,
        actor: previewProfiles[0].name,
        persona: "student",
        action: "Charging started",
        resource: "CH-001",
        result: "Success",
        reason: `${hubs[1].name} · point ${pointId(hubs[1].id, 1)}`,
        link: "/student/charging/CH-001",
      },
      {
        id: "AC-002",
        at: -20,
        actor: previewProfiles[2].name,
        persona: "operator",
        action: "Incident recorded",
        resource: "IN-001",
        result: "Attention",
        reason: "Charging point inspection required",
        link: "/operator/incidents",
      },
    ],
    runs: [],
    loadFailed: false,
  };
}
