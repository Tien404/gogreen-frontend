require("./register.cjs");
const { test } = require("node:test");
const assert = require("node:assert/strict");
const { matchRoutes } = require("react-router");
const { appRoutes } = require("../src/app/router/routes.ts");
const leaf = (url) => matchRoutes(appRoutes, url).at(-1);

test("creation routes take precedence over record IDs", () => {
  for (const [url, id] of [
    ["/student/parking/new", "student-new-parking"],
    ["/student/charging/new", "student-new-charging"],
    ["/operator/charging/new", "operator-new-charging"],
    ["/operator/what-if/new", "operator-new-scenario"],
  ])
    assert.equal(leaf(url).route.id, id);
});

test("record routes expose the named parameters used by the page adapters", () => {
  for (const [url, id, params] of [
    ["/student/hubs/science", "student-hub", { hubId: "science" }],
    ["/student/holds/HD-101", "student-hold", { holdId: "HD-101" }],
    ["/student/rides/RD-103", "student-ride", { rideId: "RD-103" }],
    ["/student/parking/PK-001", "student-parking", { bookingId: "PK-001" }],
    [
      "/student/charging/CH-001",
      "student-charging-session",
      { sessionId: "CH-001" },
    ],
    ["/operator/hubs/north", "operator-hub", { hubId: "north" }],
    [
      "/operator/dispatch/DS-101",
      "operator-dispatch-detail",
      { dispatchId: "DS-101" },
    ],
    [
      "/operator/charging/CH-002",
      "operator-charging-session",
      { sessionId: "CH-002" },
    ],
    [
      "/operator/what-if/runs/RUN-101",
      "operator-scenario-run",
      { runId: "RUN-101" },
    ],
  ]) {
    const match = leaf(url);
    assert.equal(match.route.id, id);
    assert.deepEqual(match.params, params);
  }
});

test("unknown or incomplete paths select a not-found route rather than a nearby valid screen", () => {
  for (const url of [
    "/student/hubs/north/extra",
    "/student/find-ride/extra",
    "/student/holds",
  ]) {
    assert.equal(leaf(url).route.id, "student-not-found");
  }
  for (const url of [
    "/operator/what-if/runs",
    "/operator/what-if/unknown",
    "/operator/dispatch/DS-1/extra",
  ]) {
    assert.equal(leaf(url).route.id, "operator-not-found");
  }
  assert.equal(leaf("/unknown").route.id, "not-found");
  assert.equal(leaf("/studentish").route.id, "not-found");
});

test("index/detail matches stay inside the appropriate workspace; query strings do not change route selection", () => {
  assert.deepEqual(
    matchRoutes(appRoutes, "/student").map((m) => m.route.id),
    ["student", "student-overview"],
  );
  assert.deepEqual(
    matchRoutes(appRoutes, "/operator/").map((m) => m.route.id),
    ["operator", "operator-overview"],
  );
  assert.deepEqual(
    matchRoutes(appRoutes, "/student/find-ride?origin=science").map(
      (m) => m.route.id,
    ),
    ["student", "student-find-ride"],
  );
  assert.equal(leaf("/").route.id, "entry");
});

test("login and registration are public routes outside the workspaces", () => {
  assert.deepEqual(
    matchRoutes(appRoutes, "/login?returnTo=%2Fstudent%2Ffind-ride").map(
      (m) => m.route.id,
    ),
    ["login"],
  );
  assert.deepEqual(
    matchRoutes(appRoutes, "/signup").map((m) => m.route.id),
    ["signup"],
  );
});
