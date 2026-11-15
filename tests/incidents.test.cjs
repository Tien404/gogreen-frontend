const { test } = require("node:test");
const assert = require("node:assert/strict");
const { demo } = require("./helpers.cjs");
test("incident validation and explicit resolution", () => {
  const d = demo("operator");
  assert.equal(
    d.act({
      type: "incident",
      resource: "EV-003",
      severity: "High",
      incidentType: "Vehicle fault",
      description: "",
    }).error,
    true,
  );
  const i = d.act({
    type: "incident",
    resource: "EV-003",
    severity: "High",
    incidentType: "Vehicle fault",
    description: "Inspection needed",
  });
  assert.ok(i.id);
  d.act({ type: "resolve", id: i.id, reason: "Inspected; follow-up required" });
  assert.equal(d.s.incidents[0].status, "resolved");
  assert.equal(d.s.vehicles[2].status, "maintenance");
});
