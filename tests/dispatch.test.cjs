const { test } = require("node:test");
const assert = require("node:assert/strict");
const { occupancy, available, demo } = require("./helpers.cjs");
test("dispatch planned, in-transit failure, recovery and completion", () => {
  const d = demo("operator", "dispatch");
  const before = occupancy(d.s, "north");
  const planned = d.act({
    type: "dispatch",
    source: "north",
    destination: "library",
    vehicles: [available(d.s, "north")[0].id],
  });
  assert.ok(planned.id);
  assert.equal(occupancy(d.s, "north"), before);
  d.act({ type: "start-dispatch", id: planned.id });
  assert.equal(occupancy(d.s, "north"), before - 1);
  assert.equal(
    d.act({ type: "complete-dispatch", id: planned.id }).error,
    true,
  );
  assert.equal(d.s.dispatches[0].status, "failed");
  assert.equal(
    d.s.vehicles.find((v) => v.id === d.s.dispatches[0].vehicles[0]).hub,
    null,
  );
  d.act({ type: "recover", id: planned.id, destination: "science" });
  d.act({ type: "complete-dispatch", id: planned.id });
  assert.equal(d.s.dispatches[0].status, "completed");
  assert.equal(
    d.act({ type: "complete-dispatch", id: planned.id }).error,
    true,
  );
});
test("private vehicles cannot be dispatched and source equals destination rejected", () => {
  const d = demo("operator");
  assert.equal(
    d.act({
      type: "dispatch",
      source: "north",
      destination: "science",
      vehicles: ["PV-01"],
    }).error,
    true,
  );
  assert.equal(
    d.act({
      type: "dispatch",
      source: "north",
      destination: "north",
      vehicles: ["EV-002"],
    }).error,
    true,
  );
});
