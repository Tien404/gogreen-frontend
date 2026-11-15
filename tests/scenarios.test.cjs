const { test } = require("node:test");
const assert = require("node:assert/strict");
const { demo } = require("./helpers.cjs");
test("scenario viewing leaves operational state unchanged; apply creates only one planned dispatch", () => {
  const d = demo("operator");
  const before = JSON.stringify({
    vehicles: d.s.vehicles,
    hubs: d.s.hubs,
    bookings: d.s.bookings,
    charges: d.s.charges,
    activity: d.s.activity,
  });
  const r = d.act({
    type: "run",
    scenarioType: "Demand surge",
    hub: "metro",
    horizon: "60",
    demand: "standard",
  });
  assert.equal(
    JSON.stringify({
      vehicles: d.s.vehicles,
      hubs: d.s.hubs,
      bookings: d.s.bookings,
      charges: d.s.charges,
      activity: d.s.activity,
    }),
    before,
  );
  d.act({ type: "apply", id: r.id });
  const n = d.s.activity.length;
  assert.equal(d.s.dispatches.length, 1);
  assert.equal(d.s.dispatches[0].status, "planned");
  assert.equal(d.s.dispatches[0].source, "north");
  assert.equal(d.s.dispatches[0].destination, "metro");
  d.act({ type: "apply", id: r.id });
  assert.equal(d.s.dispatches.length, 1);
  assert.equal(d.s.activity.length, n);
});
test("stale recommendation fails without creating a dispatch", () => {
  const d = demo("operator");
  const r = d.act({
    type: "run",
    scenarioType: "Full hub",
    hub: "library",
    horizon: "60",
    demand: "standard",
  });
  d.act({ type: "advance", minutes: 5 });
  assert.equal(d.act({ type: "apply", id: r.id }).error, true);
  assert.equal(d.s.dispatches.length, 0);
});

test("each scenario uses its configured hub and redistribution route", () => {
  const { scenarioFixtures } = require("../src/mocks/scenarios.ts");

  for (const [scenarioType, fixture] of Object.entries(scenarioFixtures)) {
    const d = demo("operator");
    const run = d.act({
      type: "run",
      scenarioType,
      hub: fixture.hub,
      horizon: "60",
      demand: "standard",
    });

    assert.ok(run.id, scenarioType);
    assert.equal(d.act({ type: "apply", id: run.id }).error, undefined);
    assert.equal(d.s.dispatches[0].source, fixture.source);
    assert.equal(d.s.dispatches[0].destination, fixture.destination);
  }
});

test("Metro arrival demand rejects the old library configuration", () => {
  const d = demo("operator");
  const result = d.act({
    type: "run",
    scenarioType: "Demand surge",
    hub: "library",
    horizon: "60",
    demand: "standard",
  });

  assert.equal(result.error, true);
  assert.equal(d.s.runs.length, 0);
});
