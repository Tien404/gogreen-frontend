require("./register.cjs");
const assert = require("node:assert/strict");
const { test } = require("node:test");
const {
  vehicleLabel,
  parkingLabel,
  chargingLabel,
  activityResourceLabel,
} = require("../src/integration/recordLabels.ts");
const vehicleId = "20e6cd4e-8eaf-4fac-923e-b0e20f4c62a4";
const bookingId = "84d649aa-f8bf-40f7-8bdf-45939ae375dc";
const chargeId = "404a288b-8865-4f52-a74c-a674aff61290";
const booking = {
  id: bookingId,
  vehicle: vehicleId,
  hub: "north",
  start: 10,
  end: 70,
};
const charge = { id: chargeId, vehicle: vehicleId, hub: "north" };
const state = {
  privateVehicles: [
    { id: vehicleId, identifier: "59A-12345", type: "Electric bicycle" },
  ],
  vehicles: [],
  hubs: [{ id: "north", name: "Dormitory Hub" }],
  bookings: [booking],
  charges: [charge],
};

test("record labels show registered vehicle and Hub/time instead of object IDs", () => {
  assert.equal(vehicleLabel(state, vehicleId), "59A-12345");
  assert.match(parkingLabel(state, booking), /Dormitory Hub.*2026/);
  assert.equal(chargingLabel(state, charge), "59A-12345 · Dormitory Hub");
  assert.ok(!parkingLabel(state, booking).includes(bookingId));
  assert.equal(booking.id, bookingId);
  assert.equal(charge.id, chargeId);
});

test("unloaded private vehicle labels do not fall back to a raw UUID", () => {
  assert.equal(
    vehicleLabel({ ...state, privateVehicles: [] }, vehicleId),
    "Private vehicle",
  );
  assert.equal(vehicleLabel(state, "north-ev1"), "north-ev1");
});

test("activity uses readable links even when details have not been loaded", () => {
  const activity = {
    resource: bookingId,
    action: "parking-reserved",
    link: `/student/parking/${bookingId}`,
  };
  assert.match(activityResourceLabel(state, activity), /Dormitory Hub/);
  assert.equal(
    activityResourceLabel({ ...state, bookings: [] }, activity),
    "View parking booking",
  );
  assert.equal(
    activityResourceLabel(state, {
      resource: chargeId,
      action: "charge-stopped",
    }),
    "Charging session",
  );
});

test("charging selection displays readable text while retaining the booking ID as its value", () => {
  const { createElement: h } = require("react");
  const { renderToStaticMarkup } = require("react-dom/server");
  const { MemoryRouter } = require("react-router");
  const { Context } = require("../src/app/providers/AppContext.ts");
  const {
    useChargeForm,
  } = require("../src/features/charging/hooks/useChargeForm.ts");
  function Probe() {
    const form = useChargeForm({});
    return h("output", { "data-value": form.choice }, form.eligible[0].label);
  }
  const html = renderToStaticMarkup(
    h(
      MemoryRouter,
      { initialEntries: [`/student/charging/new?parking=${bookingId}`] },
      h(
        Context.Provider,
        {
          value: {
            s: {
              ...state,
              role: "student",
              persona: "anh",
              bookings: [{ ...booking, owner: "anh", status: "confirmed" }],
            },
            api: {},
            notify: () => {},
            go: () => {},
          },
        },
        h(Probe),
      ),
    ),
  );
  assert.match(html, new RegExp(`data-value="${bookingId}"`));
  assert.match(html, /59A-12345.*Dormitory Hub/);
  assert.ok(!html.replace(/<[^>]+>/g, "").includes(bookingId));
});
