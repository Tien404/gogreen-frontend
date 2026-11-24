require("./register.cjs");
const assert = require("node:assert/strict");
const { test } = require("node:test");
const {
  chargingEntry,
} = require("../src/features/vehicles/model/chargingEntry.ts");

test("private vehicle charging requires its own reserved or checked-in parking", () => {
  for (const status of ["COMPLETED", "CANCELLED", "EXPIRED", "OVERSTAYING"]) {
    assert.equal(
      chargingEntry("mine", [{ vehicle_id: "mine", status }], []).available,
      false,
    );
  }
  assert.equal(
    chargingEntry("mine", [{ vehicle_id: "other", status: "RESERVED" }], [])
      .available,
    false,
  );
  assert.match(chargingEntry("mine", [], []).message, /Book parking/);
});

test("private charging opens the checked-in context before a future reservation", () => {
  const bookings = [
    { vehicle_id: "mine", status: "RESERVED", reservation_id: "future" },
    { vehicle_id: "mine", status: "CHECKED_IN", reservation_id: "now" },
  ];
  assert.deepEqual(chargingEntry("mine", bookings, []), {
    available: true,
    parkingId: "now",
  });
  assert.deepEqual(chargingEntry("mine", bookings.slice(0, 1), []), {
    available: true,
    parkingId: "future",
  });
});

test("pending, scheduled and active charges explain why a duplicate cannot open", () => {
  const booking = [
    { vehicle_id: "mine", status: "RESERVED", reservation_id: "parking" },
  ];
  for (const status of ["PENDING", "SCHEDULED", "ACTIVE"]) {
    assert.match(
      chargingEntry("mine", booking, [{ vehicle_id: "mine", status }]).message,
      /already has a charging request/,
    );
  }
  assert.equal(
    chargingEntry("mine", booking, [{ vehicle_id: "mine", status: "STOPPED" }])
      .available,
    true,
  );
});
