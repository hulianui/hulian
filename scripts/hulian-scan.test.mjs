import assert from "node:assert/strict";
import test from "node:test";

import { runForwarder } from "./hulian-scan.mjs";

test("forwards every argument to the private package CLI", () => {
  let invocation;
  const status = runForwarder(["--scenario", "button/basic", "--ci"], (command, args, options) => {
    invocation = { command, args, options };
    return { status: 7 };
  });

  assert.equal(status, 7);
  assert.deepEqual(invocation, {
    command: "pnpm",
    args: [
      "--filter",
      "@hulianui/hulian-scan",
      "run",
      "scan:internal",
      "--",
      "--scenario",
      "button/basic",
      "--ci",
    ],
    options: { stdio: "inherit" },
  });
});
