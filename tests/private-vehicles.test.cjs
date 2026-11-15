const { test } = require("node:test");
const assert = require("node:assert/strict");
const { demo } = require("./helpers.cjs");
test("duplicate private identifier rejected; other persona remains separate", () => {
  const d = demo();
  const n = d.s.privateVehicles.length;
  assert.equal(
    d.act({
      type: "add-vehicle",
      identifier: "CAMPUS-024",
      vehicleType: "Electric bicycle",
      battery: 55,
    }).error,
    true,
  );
  assert.equal(d.s.privateVehicles.length, n);
  assert.equal(
    d.act({
      type: "add-vehicle",
      identifier: "MY-DEMO",
      vehicleType: "Electric bicycle",
      battery: 55,
    }).error,
    undefined,
  );
  assert.equal(d.s.privateVehicles.length, n + 1);
});

test("private registration accepts only the two supported assignment categories", () => {
  const d = demo();
  const count = d.s.privateVehicles.length;

  for (const vehicleType of [
    "E-scooter",
    "Electric scooter",
    "E-bike",
    "Petrol motorcycle",
    "",
    undefined,
  ]) {
    const result = d.act({
      type: "add-vehicle",
      identifier: "UNSUPPORTED-TYPE",
      vehicleType,
      battery: 55,
    });

    assert.equal(result.error, true, String(vehicleType));
    assert.equal(d.s.privateVehicles.length, count);
  }

  for (const [index, vehicleType] of [
    "Electric bicycle",
    "Electric motorcycle",
  ].entries()) {
    const result = d.act({
      type: "add-vehicle",
      identifier: `SUPPORTED-${index}`,
      vehicleType,
      battery: 55,
    });

    assert.equal(result.error, undefined);
    assert.equal(d.s.privateVehicles.at(-1).type, vehicleType);
  }
});
