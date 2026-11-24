require("./register.cjs");
const assert = require("node:assert/strict");
const { test } = require("node:test");
const { loadStudentData } = require("../src/integration/studentData.ts");

test("parking overview uses existing owner-scoped read endpoints without creating records", async () => {
  const calls = [];
  const api = {
    request: async (route) => {
      calls.push(route);
      return [];
    },
  };
  const result = await loadStudentData(
    api,
    "parkingList",
    undefined,
    "student-anh",
    undefined,
    new AbortController().signal,
  );
  assert.deepEqual(
    new Set(calls),
    new Set([
      "GET /mobility/hubs",
      "GET /parking/reservations",
      "GET /fleet/vehicles/private",
      "GET /charging/sessions",
    ]),
  );
  assert.deepEqual(result.bookings, []);
  assert.deepEqual(result.charges, []);
});
