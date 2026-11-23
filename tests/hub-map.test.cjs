require("./register.cjs");
const { test } = require("node:test");
const assert = require("node:assert/strict");
const { coordinates } = require("../src/shared/lib/coordinates.ts");
const { mapHub } = require("../src/integration/apiMappers.ts");
const { liveHub, hubState } = require("../src/features/hubs/hubResources.ts");
const { hubLocation } = require("../src/features/hubs/hubMap.ts");

test("map coordinates reject missing, partial, non-finite and out-of-range locations", () => {
  for (const [lat, lng] of [
    [null, null],
    ["", ""],
    [" ", "106"],
    [10, undefined],
    ["NaN", "106"],
    ["Infinity", "106"],
    [91, 106],
    [10, -181],
  ]) {
    assert.equal(coordinates(lat, lng), null);
  }
  assert.deepEqual(coordinates("10.8757", "106.7993"), [10.8757, 106.7993]);
  assert.deepEqual(coordinates(0, 0), [0, 0]);
});

test("server coordinates survive DTO and both map read models, ahead of demo sites", () => {
  const hub = mapHub({
    hub_id: "north",
    name: "Dormitory Hub",
    parking_capacity: 4,
    physical_free_now: 2,
    bookable_now: 2,
    charging_points: [],
    as_of: "2026-11-23T02:00:00Z",
    latitude: "10.88",
    longitude: "106.8",
  });
  for (const model of [liveHub(hub, 2), hubState(hub, 2)]) {
    assert.deepEqual(hubLocation(model), {
      position: [10.88, 106.8],
      demo: false,
    });
  }
});

test("only known seeded Hub IDs receive labeled demo positions; unknown hubs stay in the list", () => {
  for (const id of ["north", "library", "science", "metro"])
    assert.equal(hubLocation({ id }).demo, true);
  assert.equal(hubLocation({ id: "new-hub" }), null);
  assert.deepEqual(
    hubLocation({ id: "new-hub", coordinates: [10.87, 106.8] }),
    { position: [10.87, 106.8], demo: false },
  );
});
