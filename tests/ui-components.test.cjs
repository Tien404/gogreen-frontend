require("./register.cjs");
const assert = require("node:assert/strict");
const { test } = require("node:test");
const { createElement: h } = require("react");
const { renderToStaticMarkup: render } = require("react-dom/server");
const {
  Field,
  Input,
  NativeSelect,
  Button,
} = require("../src/shared/ui/index.ts");
const { cn } = require("../src/shared/lib/utils.ts");

test("field keeps an existing control ID and associates its label, hint and error", () => {
  const html = render(
    h(
      Field,
      { label: "Email", hint: "Use your account", error: "Invalid email" },
      h(Input, {
        id: "login-email",
        required: true,
        "aria-describedby": "account-help",
      }),
    ),
  );
  assert.match(html, /<label[^>]+for="login-email"/);
  assert.match(html, /<input[^>]+id="login-email"/);
  assert.match(html, /aria-describedby="account-help login-email-description"/);
  assert.match(html, /aria-invalid="true"/);
  assert.match(html, /id="login-email-description"[^>]*>Invalid email/);
  assert.doesNotMatch(html, /Use your account/);
});

test("native select retains native form submission, required and disabled semantics", () => {
  const html = render(
    h(
      Field,
      { label: "Hub" },
      h(
        NativeSelect,
        {
          name: "hub",
          required: true,
          disabled: true,
          defaultValue: "metro",
        },
        h("option", { value: "metro" }, "Metro"),
      ),
    ),
  );
  assert.match(html, /<select[^>]+name="hub"/);
  assert.match(html, /required=""/);
  assert.match(html, /disabled=""/);
  assert.match(html, /<option value="metro" selected=""/);
  const id = html.match(/<select[^>]+id="([^"]+)"/)[1];
  assert.ok(html.includes(`for="${id}"`));
});

test("button composition produces a link and class overrides replace conflicting sizes", () => {
  const html = render(
    h(
      Button,
      { asChild: true, size: "lg" },
      h("a", { href: "/login" }, "Log in"),
    ),
  );
  assert.match(html, /^<a /);
  assert.match(html, /href="\/login"/);
  assert.doesNotMatch(html, /<button/);
  assert.equal(
    cn("p-6 text-sm min-h-11", "p-4 text-base min-h-12"),
    "p-4 text-base min-h-12",
  );
});
