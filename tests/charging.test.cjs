const { test } = require("node:test");
const assert = require("node:assert/strict");
const { occupancy, demo } = require("./helpers.cjs");
test("stopping charging preserves parking; progress updates owned battery", () => {
  const d = demo();
  const count = occupancy(d.s, "library");
  d.act({ type: "advance-charge", id: "CH-001" });
  assert.equal(d.s.charges[0].battery, 62);
  assert.equal(d.s.privateVehicles[0].battery, 62);
  d.act({ type: "stop-charge", id: "CH-001" });
  assert.equal(d.s.charges[0].status, "stopped");
  assert.equal(occupancy(d.s, "library"), count);
  assert.equal(d.s.bookings[0].status, "checked-in");
});
test("charging cannot be controlled across ownership boundary", () => {
  const d = demo();
  assert.equal(d.act({ type: "stop-charge", id: "CH-002" }).error, true);
  assert.equal(
    d.act({ type: "request-charge", vehicle: "EV-002", target: 80 }).error,
    true,
  );
});
