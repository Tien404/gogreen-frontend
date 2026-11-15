const { test } = require("node:test");
const assert = require("node:assert/strict");
const { occupancy, demo, hold, ride } = require("./helpers.cjs");
test("immediate hold, pickup and successful return update occupancy exactly once", () => {
  const d = demo();
  const before = occupancy(d.s, "north"),
    dest = occupancy(d.s, "library");
  const h = hold(d);
  assert.equal(occupancy(d.s, "north"), before);
  const r = d.act({ type: "pickup", id: h.id });
  assert.equal(occupancy(d.s, "north"), before - 1);
  assert.equal(
    d.act({ type: "return", id: r.id, destination: "library" }).error,
    undefined,
  );
  assert.equal(occupancy(d.s, "library"), dest + 1);
  assert.equal(
    d.act({ type: "return", id: r.id, destination: "library" }).error,
    true,
  );
  assert.equal(occupancy(d.s, "library"), dest + 1);
});
test("full destination preserves active ride; alternative return works", () => {
  const d = demo("student", "full");
  const r = ride(d);
  assert.equal(
    d.act({ type: "return", id: r.id, destination: "library" }).error,
    true,
  );
  assert.equal(d.s.rides[0].status, "active");
  assert.equal(
    d.act({ type: "return", id: r.id, destination: "science" }).error,
    undefined,
  );
  assert.equal(d.s.rides[0].status, "completed");
});
test("no-alternative fixture never completes a return", () => {
  const d = demo("student", "no-alternative");
  const r = ride(d);
  for (const hub of d.s.hubs)
    assert.equal(
      d.act({ type: "return", id: r.id, destination: hub.id }).error,
      true,
    );
  assert.equal(d.s.rides[0].status, "active");
});
test("expired and cancelled holds release availability without changing occupancy", () => {
  const d = demo();
  const h = hold(d);
  const count = occupancy(d.s, "north");
  d.act({ type: "advance", minutes: 15 });
  assert.equal(d.s.holds[0].status, "expired");
  assert.equal(occupancy(d.s, "north"), count);
  assert.equal(d.act({ type: "pickup", id: h.id }).error, true);
  const h2 = hold(d);
  d.act({ type: "cancel-hold", id: h2.id });
  assert.equal(d.s.holds[0].status, "cancelled");
});
test("unavailable-before-confirmation creates no hold", () => {
  const d = demo("student", "unavailable");
  assert.equal(hold(d).error, true);
  assert.equal(d.s.holds.length, 0);
});
