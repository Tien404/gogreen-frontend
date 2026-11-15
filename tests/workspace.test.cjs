const { test } = require("node:test");
const assert = require("node:assert/strict");
const { fixtures, demo } = require("./helpers.cjs");
test("sample event applied once; duplicate recorded as ignored", () => {
  const d = demo("operator");
  d.act({ type: "sample" });
  d.act({ type: "sample" });
  assert.equal(d.s.activity[0].result, "Ignored");
  assert.equal(d.s.vehicles[0].battery, 68);
});
test("reset returns a deterministic snapshot and preserves selected workspace", () => {
  const d = demo("operator");
  d.act({ type: "advance", minutes: 60 });
  d.act({ type: "reset" });
  assert.equal(d.s.clock, 0);
  assert.equal(d.s.role, "operator");
  assert.equal(d.s.serial, 100);
  assert.deepEqual(d.s.vehicles, fixtures().vehicles);
});
