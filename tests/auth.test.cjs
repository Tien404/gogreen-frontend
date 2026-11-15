const { test } = require("node:test");
const assert = require("node:assert/strict");
const { fixtures, transition } = require("./helpers.cjs");
const {
  createAccountStore,
  loginDestination,
  validateRegistration,
} = require("../src/features/auth/model/accounts.ts");
const { currentProfile } = require("../src/domain/identity.ts");
const { previewPassword } = require("../src/mocks/accounts.ts");
const registration = {
  name: "Jamie Nguyen",
  email: "jamie@gogreen.example",
  password: "CampusRide42!",
  confirmPassword: "CampusRide42!",
};

test("login derives the workspace from the account and normalizes email", async () => {
  const accounts = createAccountStore();
  const student = await accounts.signIn({
    email: "  STUDENT@gogreen.example ",
    password: previewPassword,
  });
  const operator = await accounts.signIn({
    email: "operator@gogreen.example",
    password: previewPassword,
  });
  assert.equal(student.user.role, "student");
  assert.equal(operator.user.role, "operator");
  assert.equal(
    (
      await accounts.signIn({
        email: "student@gogreen.example",
        password: "incorrect",
      })
    ).error,
    (
      await accounts.signIn({
        email: "unknown@gogreen.example",
        password: "incorrect",
      })
    ).error,
  );
});

test("registration validates fields and only provisions student accounts", async () => {
  const errors = validateRegistration({
    name: "",
    email: "invalid",
    password: "short",
    confirmPassword: "different",
  });
  assert.ok(
    errors.name && errors.email && errors.password && errors.confirmPassword,
  );
  const accounts = createAccountStore();
  const result = await accounts.signUp({ ...registration, role: "operator" });
  assert.equal(result.user.role, "student");
  assert.notEqual(result.user.persona, "student");
  assert.deepEqual(Object.keys(result.user).sort(), [
    "email",
    "name",
    "persona",
    "role",
  ]);
  assert.equal(
    (
      await accounts.signIn({
        email: registration.email,
        password: registration.password,
      })
    ).user.persona,
    result.user.persona,
  );
  assert.ok(
    (
      await accounts.signIn({
        email: registration.email,
        password: "incorrect",
      })
    ).error,
  );
});

test("duplicate email registration is case-insensitive and atomic", async () => {
  const accounts = createAccountStore();
  const results = await Promise.all([
    accounts.signUp(registration),
    accounts.signUp({
      ...registration,
      email: registration.email.toUpperCase(),
    }),
  ]);
  assert.equal(results.filter((result) => "user" in result).length, 1);
  assert.equal(results.filter((result) => "error" in result).length, 1);
  assert.ok(
    (
      await accounts.signUp({
        ...registration,
        email: "student@gogreen.example",
      })
    ).fields.email,
  );
});

test("a newly created preview account does not persist into a fresh store", async () => {
  await createAccountStore().signUp(registration);
  assert.ok((await createAccountStore().signIn(registration)).error);
});

test("post-login redirects preserve same-role deep links and reject external or other-role URLs", () => {
  assert.equal(
    loginDestination("/student/find-ride?origin=science#results", "student"),
    "/student/find-ride?origin=science#results",
  );
  for (const candidate of [
    null,
    "https://example.com",
    "//example.com",
    "/operator/fleet",
    "/studentish",
    "/student/../../operator",
  ]) {
    assert.equal(loginDestination(candidate, "student"), "/student");
  }
  assert.equal(
    loginDestination("/operator/dispatch", "operator"),
    "/operator/dispatch",
  );
});

test("signed-in identity survives snapshot changes and clears on logout", async () => {
  const profile = (await createAccountStore().signUp(registration)).user;
  let state = transition(fixtures(), {
    type: "role",
    role: profile.role,
    persona: profile.persona,
    profile,
  }).state;
  assert.equal(currentProfile(state).name, registration.name);
  state = transition(state, {
    type: "add-vehicle",
    identifier: "JAMIE-001",
    vehicleType: "Electric bicycle",
    battery: 60,
  }).state;
  assert.equal(state.activity[0].actor, registration.name);
  assert.equal(state.activity[0].persona, profile.persona);
  assert.equal(state.privateVehicles.at(-1).owner, profile.persona);
  state = transition(state, { type: "preset", preset: "empty" }).state;
  assert.deepEqual(state.profile, profile);
  state = transition(state, { type: "reset" }).state;
  assert.deepEqual(state.profile, profile);
  state = transition(state, {
    type: "role",
    role: null,
    persona: "student",
    profile: null,
  }).state;
  assert.equal(state.role, null);
  assert.equal(state.profile, undefined);
});
