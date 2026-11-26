require("./register.cjs");
const assert = require("node:assert/strict");
const { test } = require("node:test");
const {
  currentStudentActivities,
} = require("../src/features/student-mobility/studentActivities.ts");
const { loadStudentData } = require("../src/integration/studentData.ts");

const state = {
  persona: "student",
  clock: 0,
  hubs: [
    { id: "north", name: "Dormitory Hub" },
    { id: "library", name: "Library Hub" },
  ],
  vehicles: [],
  privateVehicles: [{ id: "private", identifier: "Campus bike" }],
  holds: [],
  rides: [],
  charges: [],
  bookings: [],
};

test("home prioritizes the ride, then active charging and checked-in parking, while hiding completed and other owners' records", () => {
  const activeRide = {
    id: "ride",
    owner: "student",
    origin: "north",
    destination: "library",
    status: "active",
    start: 0,
  };
  const activities = currentStudentActivities({
    ...state,
    rides: [
      activeRide,
      { ...activeRide, id: "completed", status: "completed" },
    ],
    holds: [{ id: "other", owner: "someone-else", status: "held" }],
    bookings: [
      {
        id: "parking",
        owner: "student",
        vehicle: "private",
        hub: "north",
        status: "checked-in",
        end: 60,
      },
    ],
    charges: [
      {
        id: "charge",
        owner: "student",
        vehicle: "private",
        hub: "north",
        status: "active",
        target: 80,
      },
    ],
  });
  assert.deepEqual(
    activities.map(({ id }) => id),
    ["ride", "charge", "parking"],
  );
  assert.equal(activities[0].location, "Dormitory Hub → Library Hub");
  assert.equal(activities[1].action, "View charging");
  assert.match(activities[2].detail, /Campus bike/);
});

test("home uses the reservation pickup deadline before pickup and ignores expired holds", () => {
  const hold = {
    id: "hold",
    owner: "student",
    origin: "north",
    expires: 15,
    status: "held",
  };
  const [current] = currentStudentActivities({
    ...state,
    clock: 3,
    holds: [hold],
  });
  assert.equal(current.title, "Vehicle on hold");
  assert.equal(current.action, "View pickup");
  assert.match(current.detail, /12 min left/);
  assert.deepEqual(
    currentStudentActivities({
      ...state,
      holds: [{ ...hold, status: "expired" }],
    }),
    [],
  );
});

test("home uses the linked hold for an active ride's intended hub and the actual return hub for a completed ride", async () => {
  const heldAt = "2026-11-25T02:00:00Z";
  const reservation = {
    reservation_id: "hold",
    status: "COMPLETED",
    vehicle_id: "shared",
    origin_hub_id: "north",
    intended_hub_id: "library",
    expires_at: heldAt,
  };
  const ride = {
    rental_id: "ride",
    reservation_id: "hold",
    vehicle_id: "shared",
    origin_hub_id: "north",
    return_hub_id: null,
    picked_up_at: heldAt,
    returned_at: null,
    status: "ACTIVE",
  };
  const api = {
    request: async (route) => {
      if (route === "GET /rentals/reservations") return [reservation];
      if (route === "GET /rentals/rentals")
        return [
          ride,
          {
            ...ride,
            rental_id: "completed",
            return_hub_id: "metro",
            returned_at: heldAt,
            status: "COMPLETED",
          },
        ];
      return [];
    },
  };
  const result = await loadStudentData(
    api,
    "dashboard",
    undefined,
    "student",
    undefined,
    new AbortController().signal,
  );
  assert.deepEqual(
    result.rides.map(({ destination }) => destination),
    ["library", "metro"],
  );
});
