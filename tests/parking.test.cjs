const { test } = require("node:test");
const assert = require("node:assert/strict");
const { occupancy, demo } = require("./helpers.cjs");
test("invalid intervals and combined failure are atomic; explicit parking-only succeeds", () => {
  const d = demo("student", "combined");
  const base = {
    type: "book",
    vehicle: "PV-02",
    hub: "north",
    start: 0,
    end: 60,
    service: "Parking + charging",
  };
  const count = d.s.bookings.length,
    charges = d.s.charges.length;
  assert.equal(d.act({ ...base, end: -1 }).error, true);
  assert.equal(d.act(base).error, true);
  assert.equal(d.s.bookings.length, count);
  assert.equal(d.s.charges.length, charges);
  const b = d.act({ ...base, service: "Parking only" });
  assert.ok(b.id);
  d.act({ type: "check-in", id: b.id });
  assert.equal(d.s.bookings[0].status, "checked-in");
  d.act({ type: "extend", id: b.id });
  assert.equal(d.s.bookings[0].end, 90);
  d.act({ type: "checkout", id: b.id });
  assert.equal(d.s.bookings[0].status, "completed");
  assert.equal(d.act({ type: "checkout", id: b.id }).error, true);
});
test("overstay and extension conflict preserve occupancy and prior end", () => {
  const d = demo("student", "overstay");
  const count = occupancy(d.s, "library"),
    end = d.s.bookings[0].end;
  assert.equal(d.act({ type: "extend", id: "PK-001" }).error, true);
  assert.equal(d.s.bookings[0].end, end);
  assert.equal(occupancy(d.s, "library"), count);
  d.act({ type: "checkout", id: "PK-001" });
  assert.equal(occupancy(d.s, "library"), count - 1);
});
test("no-show expiry removes no physical occupancy", () => {
  const d = demo();
  const count = occupancy(d.s, "north");
  d.act({ type: "advance", minutes: 140 });
  assert.equal(d.s.bookings[1].status, "expired");
  assert.equal(occupancy(d.s, "north"), count);
  assert.equal(d.s.bookings[0].status, "overstaying");
});
