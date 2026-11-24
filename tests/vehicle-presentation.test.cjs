require("./register.cjs");
const assert = require("node:assert/strict");
const { test } = require("node:test");
const {
  rememberVehicleType,
  rememberedVehicleType,
} = require("../src/features/rentals/model/vehiclePresentation.ts");

test("live vehicle type remains available for artwork after hold/pickup navigation", () => {
  const before = global.sessionStorage;
  const values = new Map();
  global.sessionStorage = {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
  };
  try {
    rememberVehicleType({ id: "north-ev2", type: "Electric motorcycle" });
    assert.equal(rememberedVehicleType("north-ev2"), "Electric motorcycle");
    assert.equal(rememberedVehicleType("unknown"), undefined);
  } finally {
    global.sessionStorage = before;
  }
});

test("blocked or invalid storage does not block a rental page", () => {
  const before = global.sessionStorage;
  global.sessionStorage = {
    getItem: () => {
      throw new Error("Blocked");
    },
  };
  try {
    assert.doesNotThrow(() =>
      rememberVehicleType({ id: "v", type: "Electric bicycle" }),
    );
    assert.equal(rememberedVehicleType("v"), undefined);
  } finally {
    global.sessionStorage = before;
  }
});
