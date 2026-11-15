const { test } = require("node:test");
const assert = require("node:assert/strict");
const { fixtures, occupancy } = require("./helpers.cjs");
const { config } = require("../src/config/app.ts");
const { pointId, pointFree } = require("../src/domain/selectors.ts");
const { previewProfiles } = require("../src/mocks/accounts.ts");

test("VNU-HCM samples retain consistent hub, vehicle and charging references", () => {
  const state = fixtures();

  assert.equal(config.campus, "VNU-HCM Urban Area");
  assert.deepEqual(config.vehicleTypes, [
    "Electric bicycle",
    "Electric motorcycle",
  ]);
  assert.deepEqual(
    new Set(state.vehicles.map((vehicle) => vehicle.type)),
    new Set(config.vehicleTypes),
  );

  for (const hub of state.hubs) {
    assert.ok(occupancy(state, hub.id) <= hub.capacity);
    assert.ok(hub.points <= hub.capacity);
  }

  for (const charge of state.charges.filter(
    (charge) => charge.status === "active",
  )) {
    const hub = state.hubs.find((hub) => hub.id === charge.hub);
    const pointIds = Array.from({ length: hub.points }, (_, index) =>
      pointId(hub.id, index),
    );

    assert.ok(pointIds.includes(charge.point));
    assert.ok(
      state.vehicles.some((vehicle) => vehicle.id === charge.vehicle) ||
        state.privateVehicles.some((vehicle) => vehicle.id === charge.vehicle),
    );
  }

  assert.equal(pointFree(state, "north"), state.hubs[0].points - 1);

  for (const activity of state.activity) {
    assert.equal(
      activity.actor,
      previewProfiles.find((profile) => profile.persona === activity.persona)
        .name,
    );
  }

  const fresh = fixtures();
  state.hubs[0].name = "Changed locally";
  assert.equal(fresh.hubs[0].name, "Dormitory Hub");
});
