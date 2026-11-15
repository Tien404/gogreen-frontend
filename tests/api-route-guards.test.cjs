require("./register.cjs");
const assert = require("node:assert/strict");
const { test } = require("node:test");
const { createElement } = require("react");
const { renderToString } = require("react-dom/server");
const { MemoryRouter, useRoutes } = require("react-router");
const { Context } = require("../src/app/providers/AppContext.ts");
const { apiRoutes } = require("../src/app/router/apiRoutes.ts");

function Routes() {
  return useRoutes(apiRoutes);
}

function render(path, auth) {
  const user = auth.user;
  const state = {
    role: user?.role ?? null, profile: user, persona: user?.persona ?? "", clock: 0, preset: "api",
    incidents: [], loadFailed: false,
  };
  return renderToString(createElement(MemoryRouter, { initialEntries: [path] },
    createElement(Context.Provider, {
      value: { mode: "api", s: state, auth: { retry() {}, ...auth }, path, go() {}, notify() {} },
    }, createElement(Routes)),
  ));
}

const student = { name: "Nguyễn Minh Anh", role: "student", persona: "student-anh", email: "" };

test("API deep link waits for session, shows a retry if unavailable and only then lets a student in", () => {
  const destination = "/student/hubs/metro?from=directory";
  assert.match(render(destination, { status: "loading", user: null }), /Checking your session/);
  assert.match(render(destination, { status: "error", user: null, error: "Offline" }), /Retry connection/);
  assert.doesNotMatch(render(destination, { status: "ready", user: null }), /Workspace navigation/);
  const authorized = render(destination, { status: "ready", user: student });
  assert.match(authorized, /Loading hub/);
  assert.match(authorized, /Nguyễn Minh Anh/);
  assert.doesNotMatch(authorized, /Demo account switcher|Explore as student/);
});

test("workspace role guard rejects a valid session in the wrong workspace and keeps fixture pages out of API mode", () => {
  const denied = render("/operator/hubs/metro", { status: "ready", user: student });
  assert.match(denied, /campus operators/);
  assert.doesNotMatch(denied, /Loading hub/);
  const connected = render("/student/find-ride", { status: "ready", user: student });
  assert.match(connected, /Find your next ride/);
  const operator = { name: "Lê Hoàng Nam", role: "operator", persona: "operator-nam", email: "" };
  const pending = render("/operator/demo", { status: "ready", user: operator });
  assert.match(pending, /This workflow is not connected yet/);
  assert.doesNotMatch(pending, /Reserve now/);
});


test("student workflow paths render connected pages, while preview keeps its own pages", () => {
  const auth = { status: "ready", user: student };
  for (const [path, marker] of [
    ["/student", "Your holds and rides"],
    ["/student/find-ride", "Search vehicles"],
    ["/student/holds/hold-1", "Loading"],
    ["/student/rides/ride-1", "Loading"],
    ["/student/vehicles", "Registered vehicles"],
    ["/student/parking/new", "Campus parking"],
    ["/student/parking/booking-1", "Loading"],
    ["/student/charging", "Your charging requests"],
    ["/student/charging/new?parking=booking-1", "Request charging"],
    ["/student/charging/charge-1", "Loading"],
    ["/student/activity", "Activity"],
  ]) {
    const html = render(path, auth);
    assert.ok(html.includes(marker), path);
    assert.ok(!html.includes("This workflow is not connected yet"), path);
  }
  const { appRoutes } = require("../src/app/router/routes.ts");
  const { matchRoutes } = require("react-router");
  assert.equal(matchRoutes(appRoutes, "/student/find-ride").at(-1).route.Component.name, "FindRide");
});


test("hold and charging records display server times and gate buttons by record status", () => {
  const query = require("../src/shared/api/useApiQuery.ts");
  const original = query.useApiQuery;
  const useData = (data) => {
    query.useApiQuery = () => ({ result: { status: "ready", data }, retry() {} });
  };
  const auth = { status: "ready", user: student };
  try {
    useData({ reservation_id: "hold", vehicle_id: "ev1", origin_hub_id: "north", intended_hub_id: null,
      expires_at: "2026-11-16T02:15:00Z", status: "EXPIRED" });
    const expired = render("/student/holds/hold", auth);
    assert.match(expired, /09:15/);
    assert.match(expired, /This hold has expired/);
    assert.doesNotMatch(expired, /Confirm pickup/);
    useData({ session_id: "charge", parking_reservation_id: "booking", hub_id: "metro", vehicle_id: "bike",
      charging_point_id: "metro-c1", scheduled_start_at: "2026-11-16T03:00:00Z", scheduled_end_at: "2026-11-16T03:20:00Z",
      target_battery_pct: 80, status: "SCHEDULED", reason: "Server schedule" });
    const scheduled = render("/student/charging/charge", auth);
    assert.match(scheduled, /metro-c1/);
    assert.match(scheduled, /10:00/);
    assert.match(scheduled, /10:20/);
    assert.match(scheduled, /Server schedule/);
    assert.match(scheduled, /Cancel request/);
    assert.doesNotMatch(scheduled, /Stop charging/);
  } finally {
    query.useApiQuery = original;
  }
});


test("a rejected return keeps the ride active and displays only the alternatives in the response", () => {
  const query = require("../src/shared/api/useApiQuery.ts");
  const actions = require("../src/shared/api/useApiAction.ts");
  const { ApiError } = require("../src/shared/api/errors.ts");
  const oldQuery = query.useApiQuery;
  const oldAction = actions.useApiAction;
  try {
    query.useApiQuery = () => ({ result: { status: "ready", data: {
      ride: { rental_id: "ride", vehicle_id: "ev1", origin_hub_id: "north",
        return_hub_id: null, picked_up_at: "2026-11-16T02:00:00Z", status: "ACTIVE" },
      hubs: [{ id: "north", name: "Dormitory" }, { id: "metro", name: "Metro" }, { id: "library", name: "Library" }],
    } }, retry() {} });
    actions.useApiAction = () => ({ busy: false, error: new ApiError(409, "HUB_FULL", "Full", false, {
      alternatives: [{ hub_id: "library", bookable_now: 2 }],
    }) });
    const html = render("/student/rides/ride", { status: "ready", user: student });
    assert.match(html, /Your ride is still active/);
    assert.match(html, /Confirm return/);
    assert.match(html, /Choose <!-- -->Library/);
    assert.doesNotMatch(html, /Choose <!-- -->Metro/);
    actions.useApiAction = () => ({ busy: false, error: new ApiError(409, "HUB_FULL", "Full", false, { alternatives: [] }) });
    assert.match(render("/student/rides/ride", { status: "ready", user: student }), /No alternative hub is available/);
  } finally {
    query.useApiQuery = oldQuery;
    actions.useApiAction = oldAction;
  }
});


const operator = { name: "Lê Hoàng Nam", role: "operator", persona: "operator-nam", email: "" };
const operatorAuth = { status: "ready", user: operator };
const captured = "2026-11-16T02:00:00Z";
const emptyOperations = {
  as_of: captured, hubs: [], vehicles: [], incidents: [], dispatches: [], alerts: [], charging: [],
};

test("operator routes expose the API workspace and monitoring shows loading, failure and empty states", () => {
  for (const [path, title] of [
    ["/operator", "Operations overview"], ["/operator/fleet", "Shared fleet"],
    ["/operator/incidents", "Incidents"], ["/operator/dispatch", "Dispatch"],
    ["/operator/what-if", "What-if scenarios"], ["/operator/what-if/new", "Run a simulation"],
    ["/operator/activity", "Activity"], ["/operator/charging", "Network charging requests"],
  ]) {
    const html = render(path, operatorAuth);
    assert.match(html, new RegExp(title));
    assert.doesNotMatch(html, /This workflow is not connected yet/);
  }
  assert.match(render("/operator", operatorAuth), /Loading/);
  const query = require("../src/shared/api/useApiQuery.ts");
  const original = query.useApiQuery;
  try {
    query.useApiQuery = () => ({ result: { status: "error", message: "Operations unavailable", code: 503 }, retry() {} });
    assert.match(render("/operator", operatorAuth), /Operations unavailable/);
    assert.match(render("/operator", operatorAuth), /Retry loading/);
    query.useApiQuery = () => ({ result: { status: "ready", data: { data: emptyOperations, revision: "0" } }, retry() {} });
    const empty = render("/operator", operatorAuth);
    assert.match(empty, /No hubs to monitor/);
    assert.match(empty, /No active alerts/);
  } finally {
    query.useApiQuery = original;
  }
});


test("What-if result renders named units, snapshot revision and a review-only dispatch link", () => {
  const query = require("../src/shared/api/useApiQuery.ts");
  const original = query.useApiQuery;
  const run = {
    run_id: "r1", scenario_type: "RENTAL_DEMAND_SURGE", hub_id: "metro", horizon_minutes: 30,
    snapshot_at: captured, snapshot_revision: "4", model_version: "demo-1",
    metrics: [{ name: "unmet_rental_demand", unit: "requests", baseline: 0, scenario: 3 }],
    recommendations: [{ type: "REDISTRIBUTE_VEHICLE", reason: "Move one vehicle.",
      vehicle_id: "ev1", from_hub_id: "north", to_hub_id: "metro" }],
  };
  let call = 0;
  try {
    query.useApiQuery = () => ({ result: { status: "ready", data: ++call === 1
      ? { data: emptyOperations, revision: "5" } : run }, retry() {} });
    const html = render("/operator/what-if/runs/r1", operatorAuth);
    assert.match(html, /Unmet rental demand/);
    assert.match(html, /requests/);
    assert.match(html, /Operational revision/);
    assert.match(html, /changed since this snapshot/);
    assert.match(html, /Review suggested dispatch/);
    assert.match(html, /vehicle_id=ev1&amp;from_hub_id=north&amp;to_hub_id=metro/);
    assert.match(html, /tabindex="0".*overflow-x-auto/);
    assert.doesNotMatch(html, /Plan dispatch/);
  } finally {
    query.useApiQuery = original;
  }
});
