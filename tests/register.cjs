// Use the same TypeScript path aliases as Vite without adding a test runner.
const ts = require("typescript");
const fs = require("node:fs");
const path = require("node:path");
const sourceRoot = path.resolve(__dirname, "../src");

for (const extension of [".ts", ".tsx"]) {
  require.extensions[extension] = (module, filename) => {
    const code = ts
      .transpileModule(fs.readFileSync(filename, "utf8"), {
        compilerOptions: {
          module: ts.ModuleKind.CommonJS,
          target: ts.ScriptTarget.ES2023,
          jsx: ts.JsxEmit.ReactJSX,
        },
      })
      .outputText.replace(
        /require\("@\/([^"\n]+)"\)/g,
        (_, relativePath) =>
          `require(${JSON.stringify(path.join(sourceRoot, relativePath))})`,
      );
    module._compile(code, filename);
  };
}
