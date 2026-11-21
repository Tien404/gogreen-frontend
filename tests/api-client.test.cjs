require("./register.cjs");
const assert = require("node:assert/strict");
const { test } = require("node:test");
const { createApiClient } = require("../src/shared/api/client.ts");
const { ApiError } = require("../src/shared/api/errors.ts");
const {
  apiTime,
  mapHub,
  mapSession,
  mapStatus,
  mapVehicle,
} = require("../src/integration/apiMappers.ts");
const { resolveApiBaseUrl } = require("../src/config/api.ts");

test("API URL configuration is explicit", () => {
  assert.equal(resolveApiBaseUrl(), "/api/v1");
  assert.equal(
    resolveApiBaseUrl("https://campus.example/api/v1/"),
    "https://campus.example/api/v1",
  );
  for (const invalid of [
    "//campus.example/api/v1",
    "/wrong",
    "javascript:alert(1)",
    "/api/v1?x=1",
  ]) {
    assert.throws(() => resolveApiBaseUrl(invalid));
  }
});

function response(config, status, payload, headers = {}) {
  return {
    status,
    data: payload === undefined ? "" : JSON.stringify(payload),
    statusText: "",
    config,
    headers,
  };
}

test("typed transport keeps session cookies, CSRF for writes and encodes opaque IDs", async () => {
  const calls = [];
  const client = createApiClient({
    baseUrl: "/api/v1",
    readCsrf: () => "token",
    adapter: async (config) => {
      calls.push(config);
      return config.method === "post"
        ? response(config, 204)
        : response(config, 200, []);
    },
  });
  await client.request("GET /mobility/hubs/{hub_id}", {
    params: { hub_id: "x?/á" },
  });
  await client.request("GET /mobility/vehicles", {
    query: { hub_id: "metro", limit: 0 },
  });
  await client.request("POST /sessions", {
    body: { login_alias: "s@example.com", password: "seed" },
  });
  assert.equal(await client.request("POST /sessions/logout"), undefined);
  assert.equal(calls[0].url, "/mobility/hubs/x%3F%2F%C3%A1");
  assert.equal(calls[1].url, "/mobility/vehicles?hub_id=metro&limit=0");
  assert.equal(calls[2].headers.get("X-CSRF-Token"), undefined);
  assert.equal(calls[3].headers.get("X-CSRF-Token"), "token");
  assert.deepEqual(JSON.parse(calls[2].data), {
    login_alias: "s@example.com",
    password: "seed",
  });
  assert.ok(
    calls.every(
      ({ withCredentials, baseURL, timeout }) =>
        withCredentials && baseURL === "/api/v1" && timeout === 15_000,
    ),
  );
});

test("401 invalidates protected requests while 403 and offline retain distinct errors", async () => {
  let status = 401;
  let cleared = 0;
  let offline = false;
  const client = createApiClient({
    baseUrl: "/api/v1",
    onUnauthorized: () => cleared++,
    readCsrf: () => undefined,
    adapter: async (config) => {
      if (offline) throw new TypeError("offline");
      return response(config, status, {
        error: {
          code: status === 401 ? "UNAUTHENTICATED" : "FORBIDDEN",
          message: "Denied",
        },
      });
    },
  });
  await assert.rejects(
    client.request("GET /sessions/me", { onUnauthorized: "ignore" }),
    { code: "UNAUTHENTICATED" },
  );
  assert.equal(cleared, 0);
  await assert.rejects(client.request("GET /mobility/hubs"), { status: 401 });
  assert.equal(cleared, 1);
  status = 403;
  await assert.rejects(client.request("GET /operations"), {
    code: "FORBIDDEN",
  });
  assert.equal(cleared, 1);
  offline = true;
  await assert.rejects(client.request("GET /mobility/hubs"), {
    status: 0,
    retryable: true,
  });
  assert.equal(cleared, 1);
});

test("mappers preserve backend identity, absolute times and unknown statuses", () => {
  const time = "2026-11-16T09:00:00+07:00";
  assert.equal(apiTime(time), Date.UTC(2026, 10, 16, 2));
  assert.throws(() => apiTime("2026-11-16T09:00:00"), ApiError);
  const user = mapSession({
    account_id: "operator-nam",
    display_name: "Lê Hoàng Nam",
    role: "operator",
    expires_at: time,
  });
  assert.equal(user.persona, "operator-nam");
  assert.equal(user.role, "operator");
  assert.equal(mapStatus("charging", "SCHEDULED"), "scheduled");
  assert.equal(mapStatus("parking", "CHECKED_IN"), "checked-in");
  assert.equal(
    mapVehicle({ vehicle_id: "veh-01", status: "OTHER" }).status,
    null,
  );
  const hub = mapHub({
    hub_id: "metro",
    name: "Metro Interchange Hub",
    as_of: time,
    status: "ACTIVE",
    parking_capacity: 4,
    physical_free_now: 2,
    bookable_now: 1,
    charging_points: [{ resource_id: "metro-c1", status: "IN_USE" }],
  });
  assert.equal(hub.bookable, 1);
  assert.deepEqual(hub.points, [{ id: "metro-c1", status: "in-use" }]);
});

test("Vietnam parking and charging form dates become timezone-aware backend inputs", () => {
  const {
    campusInputToIso,
    recordUrl,
    activityLink,
  } = require("../src/integration/studentRecords.ts");
  assert.equal(
    campusInputToIso("2026-11-16T09:30"),
    "2026-11-16T02:30:00.000Z",
  );
  assert.throws(() => campusInputToIso("2026-02-30T09:30"), {
    code: "INVALID_INPUT",
  });
  assert.throws(() => campusInputToIso("2026-11-16T09:30Z"), {
    code: "INVALID_INPUT",
  });
  assert.equal(
    recordUrl("parking", "slot/1?time"),
    "/student/parking/slot%2F1%3Ftime",
  );
  assert.equal(
    activityLink({ resource_type: "charging", resource_id: "charge-1" }),
    "/student/charging/charge-1",
  );
  assert.equal(
    activityLink(
      { resource_type: "incident", resource_id: "private" },
      "student",
    ),
    null,
  );
});

test("operations fetch exposes the revision header and advisory links never start a dispatch", async () => {
  const {
    dispatchAdviceUrl,
  } = require("../src/integration/operatorRecords.ts");
  let seen;
  const client = createApiClient({
    baseUrl: "/api/v1",
    adapter: async (config) =>
      response(
        config,
        200,
        { alerts: [] },
        { "x-operational-revision": "9007199254740993" },
      ),
  });
  await client.request("GET /operations", {
    onHeaders: (headers) => {
      seen = headers.get("X-Operational-Revision");
    },
  });
  assert.equal(seen, "9007199254740993");
  assert.equal(dispatchAdviceUrl({ type: "RESTORE_CHARGER" }), null);
  assert.equal(
    dispatchAdviceUrl({
      type: "REDISTRIBUTE_VEHICLE",
      vehicle_id: "north/ev1",
      from_hub_id: "north",
      to_hub_id: "metro",
    }),
    "/operator/dispatch?vehicle_id=north%2Fev1&from_hub_id=north&to_hub_id=metro#plan-dispatch",
  );
});

test("Axios cancellation is not reported as an API failure and proxy HTML is rejected", async () => {
  let cleared = 0;
  const client = createApiClient({
    baseUrl: "/api/v1",
    onUnauthorized: () => cleared++,
    adapter: async (config) => ({
      ...response(config, 200),
      data: "<html>Proxy page</html>",
    }),
  });
  await assert.rejects(client.request("GET /mobility/hubs"), {
    code: "INVALID_RESPONSE",
  });
  const controller = new AbortController();
  controller.abort();
  await assert.rejects(
    client.request("GET /mobility/hubs", { signal: controller.signal }),
    { name: "AbortError" },
  );
  assert.equal(cleared, 0);
});
