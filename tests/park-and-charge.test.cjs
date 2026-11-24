require("./register.cjs");
const assert = require("node:assert/strict");
const { test } = require("node:test");
const {
  parkAndCharge,
} = require("../src/features/parking/model/parkAndCharge.ts");
const parking = {
  reservation_id: "p1",
  vehicle_id: "private1",
  status: "RESERVED",
};
const charge = {
  session_id: "c1",
  vehicle_id: "private1",
  parking_reservation_id: "p1",
  status: "PENDING",
};
const input = {
  parking: {
    vehicle_id: "private1",
    hub_id: "north",
    starts_at: "2026-11-24T10:00:00Z",
    ends_at: "2026-11-24T11:00:00Z",
  },
  charging: { target_battery_pct: 80 },
};

test("park and charge confirms parking before sending the linked charging request", async () => {
  const calls = [];
  const api = {
    request: async (route, args) => {
      calls.push(route);
      if (route === "POST /parking/reservations") return parking;
      if (route === "GET /charging/sessions") return [];
      assert.equal(args.body.parking_reservation_id, "p1");
      assert.equal(args.body.vehicle_id, "private1");
      return charge;
    },
  };
  const result = await parkAndCharge(api, input, () => calls.push("parked"));
  assert.equal(result.status, "complete");
  assert.equal(result.charge.session_id, "c1");
  assert.deepEqual(calls, [
    "POST /parking/reservations",
    "parked",
    "GET /charging/sessions",
    "POST /charging/sessions",
  ]);
});

test("parking-only uses one command and parking failure never requests charging", async () => {
  const calls = [];
  const api = {
    request: async (route) => {
      calls.push(route);
      return parking;
    },
  };
  assert.equal(
    (await parkAndCharge(api, { parking: input.parking }, () => {})).status,
    "complete",
  );
  assert.deepEqual(calls, ["POST /parking/reservations"]);
  await assert.rejects(
    parkAndCharge(
      {
        request: async () => {
          throw new Error("Full hub");
        },
      },
      input,
      () => assert.fail("No parking was created"),
    ),
    /Full hub/,
  );
});

test("charge failure preserves the parking ID and retry creates no second parking", async () => {
  let parkingCommands = 0;
  let chargeCommands = 0;
  const api = {
    request: async (route) => {
      if (route === "POST /parking/reservations") {
        parkingCommands++;
        return parking;
      }
      if (route === "GET /charging/sessions") return [];
      if (++chargeCommands === 1) throw new Error("Temporary failure");
      return charge;
    },
  };
  const partial = await parkAndCharge(api, input, () => {});
  assert.equal(partial.status, "partial");
  assert.equal(partial.parking.reservation_id, "p1");
  const retry = await parkAndCharge(api, input, () => {}, partial.parking);
  assert.equal(retry.status, "complete");
  assert.equal(parkingCommands, 1);
  assert.equal(chargeCommands, 2);
});

test("retry reconciles a previously accepted charging response instead of posting again", async () => {
  const calls = [];
  const api = {
    request: async (route) => {
      calls.push(route);
      return [charge];
    },
  };
  const result = await parkAndCharge(api, input, () => {}, parking);
  assert.equal(result.charge.session_id, "c1");
  assert.deepEqual(calls, ["GET /charging/sessions"]);
});

test("failed charging reconciliation does not risk a duplicate command", async () => {
  const calls = [];
  const api = {
    request: async (route) => {
      calls.push(route);
      throw new Error("Offline");
    },
  };
  const result = await parkAndCharge(api, input, () => {}, parking);
  assert.equal(result.status, "partial");
  assert.deepEqual(calls, ["GET /charging/sessions"]);
});
