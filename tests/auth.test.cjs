require("./register.cjs");
const { test } = require("node:test");
const assert = require("node:assert/strict");
const {
  validateCredentials,
  loginDestination,
} = require("../src/features/auth/model/accounts.ts");
const { currentProfile } = require("../src/domain/identity.ts");

test("login validates credentials before sending a request", () => {
  assert.deepEqual(
    validateCredentials({
      email: "anh@demo.example",
      password: "gogreen-demo",
    }),
    {},
  );
  assert.ok(validateCredentials({ email: "invalid", password: "" }).email);
  assert.ok(
    validateCredentials({ email: "anh@demo.example", password: "" }).password,
  );
});

test("post-login redirects preserve local workspace links and reject external or other-role destinations", () => {
  assert.equal(
    loginDestination(
      "/student/hubs/north?from=directory#main-content",
      "student",
    ),
    "/student/hubs/north?from=directory#main-content",
  );
  for (const link of [
    "https://other.example",
    "//other.example/student",
    "/operator/dispatch",
    null,
  ]) {
    assert.equal(loginDestination(link, "student"), "/student");
  }
});

test("account identity comes from the server session", () => {
  const profile = {
    name: "Anh",
    email: "anh@demo.example",
    role: "student",
    persona: "student-anh",
  };
  assert.equal(
    currentProfile({ profile, role: "student", persona: "student-anh" }),
    profile,
  );
  assert.throws(() =>
    currentProfile({ profile, role: "operator", persona: "operator-nam" }),
  );
});
